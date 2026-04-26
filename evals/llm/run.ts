/**
 * LLM-of-me eval harness.
 *
 * Loops the cases file, drives the assembly pipeline directly (skipping
 * the HTTP layer to avoid the public rate limit), collects the model's
 * full text + citations, and scores each case on groundedness + voice.
 * Writes a markdown report to evals/llm/reports/<timestamp>.md.
 *
 * Modes:
 *   --dry        Skip the Anthropic call. Use a stub response so the
 *                scoring + report path still exercises end-to-end.
 *                Useful for CI smoke. Retrieval still runs unless the
 *                DB / embedder is unavailable, in which case it's
 *                short-circuited.
 *
 * Live runs need ANTHROPIC_API_KEY plus a populated corpus + DB. See
 * the README — this is a manual / nightly check, not a per-commit gate.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildPersona } from "@/lib/llm/persona";
import { assemblePrompt } from "@/lib/llm/promptAssembly";
import { retrieve, type Retrieved } from "@/lib/llm/retriever";
import { getAnthropicClient } from "@/lib/llm/anthropicClient";

import { getCases, type EvalCase } from "./cases";
import {
  scoreGroundedness,
  type GroundednessReport,
  type Citation,
} from "./groundedness";
import { scoreVoice, type VoiceReport } from "./voice";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(HERE, "reports");

const THRESHOLDS = {
  groundedness: 0.75,
  voice: 0.7,
};

type CaseResult = {
  case: EvalCase;
  response: string;
  citations: Citation[];
  retrieved: Retrieved[];
  groundedness: GroundednessReport;
  voice: VoiceReport;
  error?: string;
};

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const cases = getCases();

  console.log(
    `[evals] running ${cases.length} cases${args.dry ? " (dry-run)" : ""}`
  );

  const results: CaseResult[] = [];
  for (const kase of cases) {
    process.stdout.write(`  ${kase.id}  `);
    try {
      const result = await runCase(kase, args);
      results.push(result);
      console.log(
        `g=${result.groundedness.score} v=${result.voice.score}` +
          (result.error ? ` (err: ${result.error})` : "")
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR ${msg}`);
      results.push({
        case: kase,
        response: "",
        citations: [],
        retrieved: [],
        groundedness: emptyGroundedness(),
        voice: emptyVoice(),
        error: msg,
      });
    }
  }

  const reportPath = writeReport(results, args.dry);
  console.log(`\n[evals] report written: ${reportPath}`);

  const aggregate = computeAggregate(results);
  console.log(
    `[evals] aggregate: groundedness=${aggregate.groundedness} voice=${aggregate.voice}` +
      ` outOfScopeRefused=${aggregate.outOfScopeRefused}/${aggregate.outOfScopeTotal}`
  );
  for (const flag of aggregate.flags) console.log(`[evals] flag: ${flag}`);
}

type Args = { dry: boolean };

function parseArgs(argv: string[]): Args {
  const dry = argv.includes("--dry") || process.env.EVAL_DRY === "1";
  return { dry };
}

async function runCase(kase: EvalCase, args: Args): Promise<CaseResult> {
  let retrieved: Retrieved[] = [];
  let retrievalError: string | undefined;
  try {
    retrieved = await retrieve(kase.question, { k: 8 });
  } catch (err) {
    retrievalError = err instanceof Error ? err.message : String(err);
  }

  const assembled = await assemblePrompt({
    persona: buildPersona(),
    retrieved,
    history: [],
    userMessage: kase.question,
  });

  const citations: Citation[] = assembled.citations.map((c) => ({
    id: c.id,
    chunkId: c.chunkId,
    snippet: c.snippet,
    path: pathForChunkId(c.chunkId, retrieved),
  }));

  let response: string;
  let modelError: string | undefined;
  if (args.dry) {
    response = stubResponse(kase, citations);
  } else {
    try {
      response = await callModel(assembled.system, [
        ...assembled.messages,
      ]);
    } catch (err) {
      modelError = err instanceof Error ? err.message : String(err);
      response = "";
    }
  }

  const groundedness = scoreGroundedness({
    case: kase,
    response,
    citations,
    retrieved: retrieved.map((r) => ({
      chunkId: r.chunkId,
      path: r.path,
      text: r.text,
    })),
  });
  const voice = scoreVoice({ case: kase, response });

  return {
    case: kase,
    response,
    citations,
    retrieved,
    groundedness,
    voice,
    error: modelError ?? retrievalError,
  };
}

function pathForChunkId(
  chunkId: string,
  retrieved: Retrieved[]
): string | undefined {
  return retrieved.find((r) => r.chunkId === chunkId)?.path;
}

async function callModel(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const client = getAnthropicClient();
  const handle = await client.streamMessages({ system, messages });
  let text = "";
  for await (const tok of handle.tokens) text += tok;
  return text;
}

/**
 * Stub response used in --dry mode. Tries to emit a plausible-shaped
 * response so the scoring code paths get exercised: cites the first
 * available chunk, drops one tell phrase, and refuses gracefully on
 * out-of-scope cases. Not meant to model real LLM quality.
 */
function stubResponse(kase: EvalCase, citations: Citation[]): string {
  if (kase.category === "out-of-scope") {
    return (
      "I can't answer that — it isn't represented in the corpus, and I'd " +
      "rather decline than invent specifics."
    );
  }
  const cite = citations[0]?.id ? ` [${citations[0].id}]` : "";
  return (
    `The throughline here is durable structure where the dominant ` +
    `institutions produce noise${cite}. Short answer: this is grounded ` +
    `in the project notes.`
  );
}

function writeReport(results: CaseResult[], dryRun: boolean): string {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const out = join(REPORTS_DIR, `${stamp}.md`);
  const md = renderMarkdown(results, dryRun, stamp);
  writeFileSync(out, md, "utf8");
  return out;
}

function renderMarkdown(
  results: CaseResult[],
  dryRun: boolean,
  stamp: string
): string {
  const agg = computeAggregate(results);
  const lines: string[] = [];

  lines.push(`# LLM-of-me eval report`);
  lines.push(``);
  lines.push(`- timestamp: ${stamp}`);
  lines.push(`- mode: ${dryRun ? "dry" : "live"}`);
  lines.push(`- cases: ${results.length}`);
  lines.push(``);
  lines.push(`## Aggregate`);
  lines.push(``);
  lines.push(`| metric | value | threshold |`);
  lines.push(`| --- | --- | --- |`);
  lines.push(
    `| groundedness (in-scope mean) | ${agg.groundedness} | >= ${THRESHOLDS.groundedness} |`
  );
  lines.push(`| voice (mean) | ${agg.voice} | >= ${THRESHOLDS.voice} |`);
  lines.push(
    `| out-of-scope refused | ${agg.outOfScopeRefused}/${agg.outOfScopeTotal} | all |`
  );
  lines.push(``);
  if (agg.flags.length > 0) {
    lines.push(`### Flags for human review`);
    for (const f of agg.flags) lines.push(`- ${f}`);
    lines.push(``);
  }

  lines.push(`## Cases`);
  for (const r of results) {
    lines.push(``);
    lines.push(`### ${r.case.id} — ${r.case.category}`);
    lines.push(``);
    lines.push(`**Q:** ${r.case.question}`);
    lines.push(``);
    if (r.error) lines.push(`> error: ${r.error}`);
    lines.push(`- groundedness: **${r.groundedness.score}** ` +
      `(recall ${r.groundedness.retrievalRecall}, ` +
      `coverage ${r.groundedness.citationCoverage}, ` +
      `factual ${r.groundedness.factualGrounding})`);
    lines.push(`- voice: **${r.voice.score}** ` +
      `(tells=${r.voice.tellsTotal}, avoids=${r.voice.avoidsTotal}` +
      `${r.voice.failStop ? ", FAIL-STOP on avoid phrase" : ""})`);
    if (r.groundedness.recallMisses.length > 0) {
      lines.push(`- recall misses: ${r.groundedness.recallMisses.join(", ")}`);
    }
    if (r.groundedness.unverifiedEntities.length > 0) {
      lines.push(
        `- unverified entities: ${r.groundedness.unverifiedEntities.join(", ")}`
      );
    }
    if (r.voice.avoidsFound.length > 0) {
      lines.push(
        `- avoid hits: ${r.voice.avoidsFound
          .map((a) => `${a.phrase}×${a.count}`)
          .join(", ")}`
      );
    }
    if (r.citations.length > 0) {
      lines.push(`- citations: ${r.citations.map((c) => `${c.id}=${c.path ?? c.chunkId}`).join(", ")}`);
    }
    lines.push(``);
    lines.push(`<details><summary>response</summary>`);
    lines.push(``);
    lines.push("```");
    lines.push(r.response || "(empty)");
    lines.push("```");
    lines.push(``);
    lines.push(`</details>`);
  }

  return lines.join("\n") + "\n";
}

type Aggregate = {
  groundedness: number;
  voice: number;
  outOfScopeRefused: number;
  outOfScopeTotal: number;
  flags: string[];
};

function computeAggregate(results: CaseResult[]): Aggregate {
  const inScope = results.filter((r) => r.case.category !== "out-of-scope");
  const oos = results.filter((r) => r.case.category === "out-of-scope");

  const gMean = mean(inScope.map((r) => r.groundedness.score));
  const vMean = mean(results.map((r) => r.voice.score));

  const oosRefused = oos.filter((r) => looksLikeRefusal(r.response)).length;

  const flags: string[] = [];
  if (gMean < THRESHOLDS.groundedness) {
    flags.push(
      `groundedness mean ${gMean} below threshold ${THRESHOLDS.groundedness}`
    );
  }
  if (vMean < THRESHOLDS.voice) {
    flags.push(`voice mean ${vMean} below threshold ${THRESHOLDS.voice}`);
  }
  if (oos.length > 0 && oosRefused < oos.length) {
    flags.push(
      `out-of-scope refusal: ${oosRefused}/${oos.length} cases declined`
    );
  }
  for (const r of results) {
    if (r.voice.failStop) {
      flags.push(`${r.case.id}: voice fail-stop (avoid phrase used)`);
    }
  }

  return {
    groundedness: round(gMean),
    voice: round(vMean),
    outOfScopeRefused: oosRefused,
    outOfScopeTotal: oos.length,
    flags,
  };
}

function looksLikeRefusal(response: string): boolean {
  if (!response) return false;
  const r = response.toLowerCase();
  const cues = [
    "can't",
    "cannot",
    "i don't",
    "isn't represented",
    "not represented",
    "decline",
    "won't speculate",
    "no record",
    "don't have",
    "not in the corpus",
    "i can't say",
    "i don't have",
  ];
  return cues.some((c) => r.includes(c));
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function emptyGroundedness(): GroundednessReport {
  return {
    score: 0,
    retrievalRecall: 0,
    citationCoverage: 0,
    factualGrounding: 0,
    citationMarkers: [],
    unverifiedEntities: [],
    recallHits: [],
    recallMisses: [],
  };
}

function emptyVoice(): VoiceReport {
  return {
    score: 0,
    tellsFound: [],
    avoidsFound: [],
    failStop: false,
    tellsTotal: 0,
    avoidsTotal: 0,
  };
}

main().catch((err) => {
  console.error("[evals] fatal:", err);
  process.exit(1);
});
