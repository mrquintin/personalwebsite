/**
 * Typed CRUD over the corpus chunks table.
 *
 * The retriever (suite 18/P07) calls `searchSimilar`. The ingester
 * (scripts/llm/ingest.ts) calls `upsertChunks`, `deleteChunksByPath`,
 * `getIngestState`, and `setIngestState`.
 */
import { and, eq, inArray, sql } from "drizzle-orm";

import { getDb, type DrizzleClient } from "@/lib/llm/db";
import {
  EMBEDDING_DIM,
  chunks,
  ingestState,
  type Chunk,
  type IngestStateRow,
  type NewChunk,
} from "@/db/schema";

export interface UpsertChunkInput {
  path: string;
  contentHash: string;
  chunkIndex: number;
  text: string;
  heading?: string | null;
  section?: string | null;
  topics?: string[] | null;
  kind?: string | null;
  date?: string | null;
  citeOkay?: boolean;
  voiceWeight?: number;
  embedding: number[];
}

export interface SearchFilters {
  kind?: string | string[];
  topics?: string[];
  citeOkay?: boolean;
}

export interface SearchHit {
  chunk: Chunk;
  similarity: number;
}

function client(db?: DrizzleClient): DrizzleClient {
  return db ?? getDb();
}

function assertDim(vec: number[]): void {
  if (vec.length !== EMBEDDING_DIM) {
    throw new Error(
      `embedding dim mismatch: got ${vec.length}, expected ${EMBEDDING_DIM}`
    );
  }
}

function toNewChunk(row: UpsertChunkInput): NewChunk {
  assertDim(row.embedding);
  return {
    path: row.path,
    contentHash: row.contentHash,
    chunkIndex: row.chunkIndex,
    text: row.text,
    heading: row.heading ?? null,
    section: row.section ?? null,
    topics: row.topics ?? null,
    kind: row.kind ?? null,
    date: row.date ?? null,
    citeOkay: row.citeOkay ?? true,
    voiceWeight: row.voiceWeight ?? 1.0,
    embedding: row.embedding,
  };
}

/**
 * Replace any rows for the given paths and insert the new ones in
 * a single transaction. (Path is not unique on its own — a file
 * produces N ordered chunks — so the cleanest "upsert" semantic is
 * delete-then-insert per path.)
 */
export async function upsertChunks(
  rows: UpsertChunkInput[],
  db?: DrizzleClient
): Promise<string[]> {
  if (rows.length === 0) return [];
  const c = client(db);
  const paths = Array.from(new Set(rows.map((r) => r.path)));
  const values = rows.map(toNewChunk);

  return c.transaction(async (tx) => {
    if (paths.length > 0) {
      await tx.delete(chunks).where(inArray(chunks.path, paths));
    }
    const inserted = await tx
      .insert(chunks)
      .values(values)
      .returning({ id: chunks.id });
    return inserted.map((r) => r.id);
  });
}

export async function deleteChunksByPath(
  path: string,
  db?: DrizzleClient
): Promise<number> {
  const c = client(db);
  const result = await c
    .delete(chunks)
    .where(eq(chunks.path, path))
    .returning({ id: chunks.id });
  return result.length;
}

export async function getIngestState(
  path: string,
  db?: DrizzleClient
): Promise<IngestStateRow | null> {
  const c = client(db);
  const rows = await c
    .select()
    .from(ingestState)
    .where(eq(ingestState.path, path))
    .limit(1);
  return rows[0] ?? null;
}

export async function setIngestState(
  path: string,
  contentHash: string,
  chunkCount: number,
  db?: DrizzleClient
): Promise<void> {
  const c = client(db);
  await c
    .insert(ingestState)
    .values({ path, contentHash, chunkCount })
    .onConflictDoUpdate({
      target: ingestState.path,
      set: {
        contentHash,
        chunkCount,
        lastIngested: sql`now()`,
      },
    });
}

/**
 * Cosine-similarity nearest-neighbour search.
 *
 * pgvector's `<=>` operator returns *cosine distance* (0 = identical,
 * 2 = opposite). We expose the more intuitive `similarity = 1 - distance`.
 */
export async function searchSimilar(
  queryEmbedding: number[],
  k: number,
  filters: SearchFilters = {},
  db?: DrizzleClient
): Promise<SearchHit[]> {
  assertDim(queryEmbedding);
  if (k <= 0) return [];
  const c = client(db);

  const queryVec = sql.raw(`'[${queryEmbedding.join(",")}]'::vector`);
  const distance = sql<number>`${chunks.embedding} <=> ${queryVec}`;

  const conds = [];
  const citeOkay = filters.citeOkay ?? true;
  conds.push(eq(chunks.citeOkay, citeOkay));
  if (filters.kind !== undefined) {
    if (Array.isArray(filters.kind)) {
      if (filters.kind.length > 0) conds.push(inArray(chunks.kind, filters.kind));
    } else {
      conds.push(eq(chunks.kind, filters.kind));
    }
  }
  if (filters.topics && filters.topics.length > 0) {
    conds.push(sql`${chunks.topics} && ${filters.topics}`);
  }

  const rows = await c
    .select({
      chunk: chunks,
      distance: distance,
    })
    .from(chunks)
    .where(and(...conds))
    .orderBy(distance)
    .limit(k);

  return rows.map((r) => ({
    chunk: r.chunk,
    similarity: 1 - Number(r.distance),
  }));
}
