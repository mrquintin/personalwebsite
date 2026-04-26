#!/usr/bin/env tsx
/**
 * Ingestion CLI for the corpus.
 *
 *   npx tsx scripts/llm/ingest.ts [--dry-run] [--rebuild] [--only=glob]
 *
 * Walks corpus/manifest.json, skips private entries, content-hashes
 * each file, and (in non-dry-run mode) chunks + embeds + upserts
 * into the vector store. Idempotent: re-running with no changes does
 * no work, because the per-file content hash is recorded in state.
 */
import path from "node:path";

import { walk, type WalkedFile } from "./walk.js";
import { DEFAULT_STATE_PATH, IngestState, type IngestRecord } from "./state.js";

interface CliFlags {
  dryRun: boolean;
  rebuild: boolean;
  only?: string;
}

interface FileResult {
  path: string;
  status: "added" | "updated" | "skipped" | "failed";
  chunkCount: number;
  error?: string;
}

const CONCURRENCY = 4;
const EMBED_BATCH_SIZE = 128;

function parseArgs(argv: string[]): CliFlags {
  const flags: CliFlags = { dryRun: false, rebuild: false };
  for (const arg of argv) {
    if (arg === "--dry-run") flags.dryRun = true;
    else if (arg === "--rebuild") flags.rebuild = true;
    else if (arg.startsWith("--only=")) flags.only = arg.slice("--only=".length);
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown flag: ${arg}`);
      printHelp();
      process.exit(2);
    }
  }
  return flags;
}

function printHelp(): void {
  console.log(
    `Usage: tsx scripts/llm/ingest.ts [--dry-run] [--rebuild] [--only=glob]\n\n` +
      `  --dry-run    list what would happen, no DB writes\n` +
      `  --rebuild    delete all existing chunks, re-ingest everything\n` +
      `  --only=glob  limit to files matching glob (relative to corpus/)\n`
  );
}

/** Convert a glob pattern to a RegExp. Supports `*` and `**`. */
function globToRegExp(glob: string): RegExp {
  let re = "^";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        re += ".*";
        i++;
        if (glob[i + 1] === "/") i++;
      } else {
        re += "[^/]*";
      }
    } else if ("/.+^$()|{}[]\\".includes(c)) {
      re += "\\" + c;
    } else if (c === "?") {
      re += "[^/]";
    } else {
      re += c;
    }
  }
  re += "$";
  return new RegExp(re);
}

async function tryImport<T>(spec: string): Promise<T | null> {
  try {
    return (await import(spec)) as T;
  } catch {
    return null;
  }
}

interface Chunk {
  id?: string;
  text: string;
  index: number;
  meta?: Record<string, unknown>;
}

interface ChunkerModule {
  chunkFile: (file: WalkedFile) => Chunk[] | Promise<Chunk[]>;
}

interface EmbedderModule {
  embedBatch: (texts: string[]) => Promise<number[][]>;
}

interface VectorStoreModule {
  upsertChunks: (
    rows: Array<{ id: string; vector: number[]; chunk: Chunk; entry: WalkedFile["entry"] }>
  ) => Promise<string[]>;
  deleteChunksForFile?: (filePath: string) => Promise<void>;
  deleteAllChunks?: () => Promise<void>;
}

interface RealPipeline {
  chunker: ChunkerModule;
  embedder: EmbedderModule;
  vectorStore: VectorStoreModule;
}

async function loadRealPipeline(): Promise<RealPipeline> {
  const chunker = await tryImport<ChunkerModule>("./chunker.js");
  const embedder = await tryImport<EmbedderModule>("./embedder.js");
  const vectorStore = await tryImport<VectorStoreModule>("./vectorStore.js");
  const missing: string[] = [];
  if (!chunker) missing.push("scripts/llm/chunker.ts (P03)");
  if (!embedder) missing.push("scripts/llm/embedder.ts (P04)");
  if (!vectorStore) missing.push("scripts/llm/vectorStore.ts (P05)");
  if (missing.length > 0) {
    throw new Error(
      `Cannot run real ingestion — missing pipeline modules:\n` +
        missing.map((m) => `  - ${m}`).join("\n") +
        `\nUse --dry-run, or implement the missing modules first.`
    );
  }
  return {
    chunker: chunker!,
    embedder: embedder!,
    vectorStore: vectorStore!,
  };
}

function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; code?: string; message?: string };
  if (e.status === 429) return true;
  if (e.code === "rate_limit") return true;
  if (typeof e.message === "string" && /rate.?limit|429/i.test(e.message)) return true;
  return false;
}

async function withBackoff<T>(
  op: () => Promise<T>,
  label: string,
  maxAttempts = 5
): Promise<T> {
  let attempt = 0;
  let delay = 500;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await op();
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts || !isRateLimitError(err)) throw err;
      const jitter = Math.random() * 250;
      const wait = delay + jitter;
      console.warn(
        `[ingest] ${label}: rate-limited, retry ${attempt}/${maxAttempts - 1} in ${Math.round(wait)}ms`
      );
      await new Promise((r) => setTimeout(r, wait));
      delay *= 2;
    }
  }
}

async function embedAllChunks(
  embedder: EmbedderModule,
  chunks: Chunk[],
  label: string
): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const slice = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const vectors = await withBackoff(
      () => embedder.embedBatch(slice.map((c) => c.text)),
      `${label} embed batch ${i / EMBED_BATCH_SIZE + 1}`
    );
    if (vectors.length !== slice.length) {
      throw new Error(
        `embedder returned ${vectors.length} vectors for ${slice.length} chunks`
      );
    }
    out.push(...vectors);
  }
  return out;
}

async function ingestOneReal(
  file: WalkedFile,
  state: IngestState,
  pipeline: RealPipeline,
  flags: CliFlags
): Promise<FileResult> {
  const prior = state.get(file.entry.path);
  const isUpdate = Boolean(prior);
  if (!flags.rebuild && state.isUnchanged(file.entry.path, file.contentHash)) {
    return { path: file.entry.path, status: "skipped", chunkCount: prior?.chunkIds.length ?? 0 };
  }

  const chunks = await pipeline.chunker.chunkFile(file);
  if (chunks.length === 0) {
    if (prior && pipeline.vectorStore.deleteChunksForFile) {
      await pipeline.vectorStore.deleteChunksForFile(file.entry.path);
    }
    state.remove(file.entry.path);
    return { path: file.entry.path, status: isUpdate ? "updated" : "added", chunkCount: 0 };
  }

  const vectors = await embedAllChunks(pipeline.embedder, chunks, file.entry.path);

  if (prior && pipeline.vectorStore.deleteChunksForFile) {
    await pipeline.vectorStore.deleteChunksForFile(file.entry.path);
  }

  const rows = chunks.map((chunk, i) => ({
    id: chunk.id ?? `${file.entry.path}#${chunk.index}`,
    vector: vectors[i],
    chunk,
    entry: file.entry,
  }));
  const chunkIds = await pipeline.vectorStore.upsertChunks(rows);

  const rec: IngestRecord = {
    path: file.entry.path,
    contentHash: file.contentHash,
    chunkIds,
    ingestedAt: new Date().toISOString(),
  };
  state.record(rec);

  return {
    path: file.entry.path,
    status: isUpdate ? "updated" : "added",
    chunkCount: chunkIds.length,
  };
}

async function ingestOneDry(
  file: WalkedFile,
  state: IngestState,
  flags: CliFlags
): Promise<FileResult> {
  const prior = state.get(file.entry.path);
  if (flags.rebuild) {
    return {
      path: file.entry.path,
      status: prior ? "updated" : "added",
      chunkCount: prior?.chunkIds.length ?? 0,
    };
  }
  if (!prior) {
    return { path: file.entry.path, status: "added", chunkCount: 0 };
  }
  if (prior.contentHash === file.contentHash) {
    return { path: file.entry.path, status: "skipped", chunkCount: prior.chunkIds.length };
  }
  return { path: file.entry.path, status: "updated", chunkCount: prior.chunkIds.length };
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

function formatLine(r: FileResult): string {
  const tag = r.status.padEnd(7);
  const count = `${r.chunkCount} chunk${r.chunkCount === 1 ? "" : "s"}`;
  const err = r.error ? `  (${r.error})` : "";
  return `  [${tag}] ${r.path} — ${count}${err}`;
}

async function main(): Promise<number> {
  const flags = parseArgs(process.argv.slice(2));
  const corpusRoot = path.resolve(process.cwd(), "corpus");
  const onlyMatcher = flags.only ? globToRegExp(flags.only) : null;

  const state = new IngestState(DEFAULT_STATE_PATH);
  await state.load();

  console.log(
    `[ingest] mode=${flags.dryRun ? "dry-run" : "live"}` +
      `${flags.rebuild ? " rebuild" : ""}` +
      `${flags.only ? ` only=${flags.only}` : ""}`
  );

  let pipeline: RealPipeline | null = null;
  if (!flags.dryRun) {
    pipeline = await loadRealPipeline();
    if (flags.rebuild) {
      if (pipeline.vectorStore.deleteAllChunks) {
        await pipeline.vectorStore.deleteAllChunks();
      }
      state.clearAll();
    }
  }

  const files: WalkedFile[] = [];
  for await (const f of walk({
    corpusRoot,
    only: onlyMatcher ? (p) => onlyMatcher.test(p) : undefined,
  })) {
    files.push(f);
  }

  if (files.length === 0) {
    console.log("[ingest] no eligible files in manifest");
    return 0;
  }

  const results = await runWithConcurrency(files, CONCURRENCY, async (file) => {
    try {
      const result = flags.dryRun
        ? await ingestOneDry(file, state, flags)
        : await ingestOneReal(file, state, pipeline!, flags);
      console.log(formatLine(result));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const result: FileResult = {
        path: file.entry.path,
        status: "failed",
        chunkCount: 0,
        error: message,
      };
      console.log(formatLine(result));
      return result;
    }
  });

  if (!flags.dryRun) {
    await state.save();
  }

  const counts = { added: 0, updated: 0, skipped: 0, failed: 0 };
  for (const r of results) counts[r.status]++;

  console.log(
    `[ingest] summary: added=${counts.added} updated=${counts.updated} ` +
      `skipped=${counts.skipped} failed=${counts.failed} ` +
      `(total=${results.length})`
  );

  if (counts.failed > 0) {
    console.error(`[ingest] ${counts.failed} file(s) failed`);
    return 1;
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
