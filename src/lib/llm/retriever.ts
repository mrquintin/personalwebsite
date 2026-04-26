/**
 * Retriever — embeds a query, fetches candidate chunks from the vector
 * store, and reranks them with a small voice/topic boost.
 *
 * Scoring (kept simple on purpose; see §D in P06 spec — no BM25 hybrid,
 * no HyDE):
 *   base       = 1 - cosine_distance (the store already returns this as
 *                "similarity"; we just clamp to [0, 1])
 *   voiceBoost = (voiceWeight - 1) * 0.05
 *   topicBoost = min(0.10, 0.03 * matchedHints)
 */
import { getEmbedder } from "@/lib/llm/embedderFactory";
import { searchSimilar, type SearchHit } from "@/lib/llm/store";
import { EmbedderError, type Embedder } from "@/lib/llm/embedder";

export type Retrieved = {
  chunkId: string;
  text: string;
  heading?: string;
  section?: string;
  path: string;
  topics: string[];
  kind: string;
  score: number;
  citeOkay: boolean;
};

export interface RetrieveOptions {
  k?: number;
  topicHints?: string[];
  minScore?: number;
}

const DEFAULT_K = 8;
const DEFAULT_MIN_SCORE = 0.55;
const VOICE_BOOST_PER_UNIT = 0.05;
const TOPIC_BOOST_PER_HINT = 0.03;
const TOPIC_BOOST_CAP = 0.1;

export class RetrieverEmbeddingError extends Error {
  readonly cause: unknown;
  constructor(message: string, cause: unknown) {
    super(message);
    this.name = "RetrieverEmbeddingError";
    this.cause = cause;
  }
}

export interface RetrieverDeps {
  embedder?: Embedder;
  search?: typeof searchSimilar;
}

export async function retrieve(
  query: string,
  opts: RetrieveOptions = {}
): Promise<Retrieved[]> {
  return retrieveWith(query, opts, {});
}

/**
 * Test/internal entrypoint. The public `retrieve` function delegates
 * to this with empty deps so production wiring stays a one-liner.
 */
export async function retrieveWith(
  query: string,
  opts: RetrieveOptions = {},
  deps: RetrieverDeps = {}
): Promise<Retrieved[]> {
  const k = opts.k ?? DEFAULT_K;
  const minScore = opts.minScore ?? DEFAULT_MIN_SCORE;
  const topicHints = opts.topicHints ?? [];

  if (k <= 0) return [];

  const embedder = deps.embedder ?? getEmbedder();
  const search = deps.search ?? searchSimilar;

  let queryEmbedding: number[];
  try {
    const vectors = await embedder.embed([query]);
    if (!vectors[0]) {
      throw new EmbedderError("embedder returned no vector for query");
    }
    queryEmbedding = vectors[0];
  } catch (err) {
    throw new RetrieverEmbeddingError(
      `failed to embed query: ${err instanceof Error ? err.message : String(err)}`,
      err
    );
  }

  const hits = await search(queryEmbedding, k * 2, { citeOkay: undefined });
  if (hits.length === 0) return [];

  const scored = hits.map((hit) => ({
    hit,
    score: adjustedScore(hit, topicHints),
  }));

  scored.sort((a, b) => b.score - a.score);

  const out: Retrieved[] = [];
  for (const { hit, score } of scored) {
    if (out.length >= k) break;
    if (score < minScore) continue;
    out.push(toRetrieved(hit, score));
  }
  return out;
}

function adjustedScore(hit: SearchHit, topicHints: string[]): number {
  const base = clamp01(hit.similarity);
  const voiceBoost = (hit.chunk.voiceWeight - 1) * VOICE_BOOST_PER_UNIT;

  let topicBoost = 0;
  if (topicHints.length > 0 && hit.chunk.topics) {
    const have = new Set(hit.chunk.topics);
    let matched = 0;
    for (const hint of topicHints) {
      if (have.has(hint)) matched += 1;
    }
    topicBoost = Math.min(TOPIC_BOOST_CAP, TOPIC_BOOST_PER_HINT * matched);
  }

  return base + voiceBoost + topicBoost;
}

function toRetrieved(hit: SearchHit, score: number): Retrieved {
  const c = hit.chunk;
  return {
    chunkId: c.id,
    text: c.text,
    heading: c.heading ?? undefined,
    section: c.section ?? undefined,
    path: c.path,
    topics: c.topics ?? [],
    kind: c.kind ?? "",
    score,
    citeOkay: c.citeOkay,
  };
}

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}
