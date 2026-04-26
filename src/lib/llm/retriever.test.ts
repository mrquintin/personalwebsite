import { describe, it, expect } from "vitest";

import { retrieveWith, RetrieverEmbeddingError } from "./retriever.js";
import type { Embedder } from "./embedder.js";
import type { SearchHit } from "./store.js";
import type { Chunk } from "@/db/schema";
import { EMBEDDING_DIM } from "@/db/schema";

/**
 * In-memory embedder: maps each known string to a fixed unit vector,
 * unknown strings hash to a deterministic but distinct vector. Tests
 * pass the same string in for both the "query" and the "doc" so the
 * cosine distance maths stays predictable.
 */
class FakeEmbedder implements Embedder {
  readonly model = "fake";
  readonly dim = EMBEDDING_DIM;
  private readonly map: Map<string, number[]>;
  constructor(map: Record<string, number[]>) {
    this.map = new Map(Object.entries(map));
  }
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => {
      const v = this.map.get(t);
      if (!v) throw new Error(`FakeEmbedder: no vector for "${t}"`);
      if (v.length !== this.dim) {
        throw new Error(
          `FakeEmbedder: vector for "${t}" has length ${v.length}, expected ${this.dim}`
        );
      }
      return v;
    });
  }
  getUsage() {
    return { totalTokens: 0, requestCount: 0 };
  }
}

class ThrowingEmbedder implements Embedder {
  readonly model = "throws";
  readonly dim = EMBEDDING_DIM;
  async embed(): Promise<number[][]> {
    throw new Error("boom: 503 from upstream");
  }
  getUsage() {
    return { totalTokens: 0, requestCount: 0 };
  }
}

function unitVec(seed: number): number[] {
  // Build a deterministic non-zero vector keyed by `seed`. We do NOT
  // need true unit length — the retriever only consumes the precomputed
  // similarities returned by the (faked) store.
  return Array.from({ length: EMBEDDING_DIM }, (_, i) =>
    Math.sin((i + 1) * (seed + 1) * 0.0137)
  );
}

function makeChunk(over: Partial<Chunk> = {}): Chunk {
  return {
    id: over.id ?? "chunk-x",
    path: over.path ?? "corpus/x.md",
    contentHash: over.contentHash ?? "h",
    chunkIndex: over.chunkIndex ?? 0,
    text: over.text ?? "text",
    heading: over.heading ?? null,
    section: over.section ?? null,
    topics: over.topics ?? null,
    kind: over.kind ?? "note",
    date: over.date ?? null,
    citeOkay: over.citeOkay ?? true,
    voiceWeight: over.voiceWeight ?? 1.0,
    embedding: over.embedding ?? unitVec(0),
    createdAt: over.createdAt ?? new Date(),
  } as Chunk;
}

/**
 * Build a fake `searchSimilar` over an array of in-memory hits. Honors
 * `k` (caller passes k*2) and the citeOkay filter (we deliberately do
 * NOT filter when citeOkay is undefined — that mirrors the retriever
 * spec which over-fetches both citeable and non-citeable rows).
 */
function fakeSearchOver(hits: SearchHit[]) {
  return async (
    _emb: number[],
    k: number,
    filters: { citeOkay?: boolean } = {}
  ): Promise<SearchHit[]> => {
    let pool = hits;
    if (filters.citeOkay !== undefined) {
      pool = hits.filter((h) => h.chunk.citeOkay === filters.citeOkay);
    }
    return [...pool].sort((a, b) => b.similarity - a.similarity).slice(0, k);
  };
}

function buildFixture(): SearchHit[] {
  // 10 chunks with varied similarity, voiceWeight, topics, citeOkay.
  // Similarities are chosen so that base ranking is c0 > c1 > c2 ... > c9.
  return [
    {
      chunk: makeChunk({
        id: "c0",
        text: "alpha doc",
        topics: ["voice", "ml"],
        voiceWeight: 1.0,
      }),
      similarity: 0.92,
    },
    {
      chunk: makeChunk({
        id: "c1",
        text: "beta doc",
        topics: ["voice"],
        voiceWeight: 1.5,
      }),
      similarity: 0.86,
    },
    {
      chunk: makeChunk({
        id: "c2",
        text: "gamma doc",
        topics: ["systems"],
        voiceWeight: 1.0,
      }),
      similarity: 0.82,
    },
    {
      chunk: makeChunk({
        id: "c3",
        text: "delta doc",
        topics: ["ml", "research"],
        voiceWeight: 1.0,
      }),
      similarity: 0.78,
    },
    {
      chunk: makeChunk({
        id: "c4",
        text: "epsilon doc",
        topics: ["voice", "ml", "research"],
        voiceWeight: 1.0,
      }),
      similarity: 0.74,
    },
    {
      chunk: makeChunk({
        id: "c5",
        text: "zeta doc",
        topics: ["misc"],
        voiceWeight: 1.0,
      }),
      similarity: 0.7,
    },
    {
      chunk: makeChunk({
        id: "c6",
        text: "eta doc",
        topics: ["misc"],
        voiceWeight: 1.0,
        citeOkay: false,
      }),
      similarity: 0.68,
    },
    {
      chunk: makeChunk({
        id: "c7",
        text: "theta doc",
        topics: ["misc"],
        voiceWeight: 1.0,
      }),
      similarity: 0.6,
    },
    {
      chunk: makeChunk({
        id: "c8",
        text: "iota doc",
        topics: ["misc"],
        voiceWeight: 1.0,
      }),
      similarity: 0.56,
    },
    {
      chunk: makeChunk({
        id: "c9",
        text: "kappa doc",
        topics: ["misc"],
        voiceWeight: 1.0,
      }),
      similarity: 0.4, // below default minScore
    },
  ];
}

describe("retrieve", () => {
  const embedder = new FakeEmbedder({ "any query": unitVec(0) });

  it("returns top-k by base similarity when no boosts apply", async () => {
    const search = fakeSearchOver(buildFixture());
    const out = await retrieveWith(
      "any query",
      { k: 3, minScore: 0 },
      { embedder, search }
    );
    expect(out.map((r) => r.chunkId)).toEqual(["c0", "c1", "c2"]);
    expect(out[0].score).toBeGreaterThan(out[1].score);
    expect(out[1].score).toBeGreaterThan(out[2].score);
  });

  it("applies voiceWeight bonus", async () => {
    // c1 has voiceWeight 1.5 → +0.025; with c0=0.92 vs c1=0.86+0.025=0.885,
    // ordering should still be c0 > c1, but c1's score should reflect bonus.
    const search = fakeSearchOver(buildFixture());
    const out = await retrieveWith(
      "any query",
      { k: 5, minScore: 0 },
      { embedder, search }
    );
    const c1 = out.find((r) => r.chunkId === "c1");
    expect(c1).toBeDefined();
    expect(c1!.score).toBeCloseTo(0.86 + 0.025, 5);
  });

  it("topic-hint boost shifts ordering as expected", async () => {
    // Without hints: c0(0.92) > c1(0.86) > c2(0.82) > c3(0.78) > c4(0.74).
    // With hints ["voice","ml","research"]:
    //   c0 has voice+ml      → +0.06   → 0.98
    //   c1 has voice         → +0.03   → 0.86 + 0.025 (voice) +0.03 = 0.915
    //   c2 none              → +0      → 0.82
    //   c3 has ml+research   → +0.06   → 0.84
    //   c4 has all three     → +0.09   → 0.83
    // New ordering: c0 > c1 > c3 > c4 > c2  (c4 outranks c2 thanks to boost)
    const search = fakeSearchOver(buildFixture());
    const out = await retrieveWith(
      "any query",
      {
        k: 5,
        minScore: 0,
        topicHints: ["voice", "ml", "research"],
      },
      { embedder, search }
    );
    expect(out.map((r) => r.chunkId)).toEqual(["c0", "c1", "c3", "c4", "c2"]);
  });

  it("caps the topic-hint boost at +0.10", async () => {
    // Six matching topics on a single chunk: bonus must clamp to 0.10
    // (0.03 * 6 = 0.18 raw, capped at 0.10).
    const hits: SearchHit[] = [
      {
        chunk: makeChunk({
          id: "many",
          topics: ["a", "b", "c", "d", "e", "f"],
        }),
        similarity: 0.6,
      },
      {
        chunk: makeChunk({ id: "none", topics: [] }),
        similarity: 0.65,
      },
    ];
    const search = fakeSearchOver(hits);
    const out = await retrieveWith(
      "any query",
      {
        k: 2,
        minScore: 0,
        topicHints: ["a", "b", "c", "d", "e", "f"],
      },
      { embedder, search }
    );
    const many = out.find((r) => r.chunkId === "many")!;
    expect(many.score).toBeCloseTo(0.6 + 0.1, 5);
  });

  it("drops results below minScore", async () => {
    // c9 has similarity 0.4 — below default minScore of 0.55
    const search = fakeSearchOver(buildFixture());
    const out = await retrieveWith(
      "any query",
      { k: 10 },
      { embedder, search }
    );
    expect(out.find((r) => r.chunkId === "c9")).toBeUndefined();
    // c8 (sim=0.56) should survive the cut.
    expect(out.find((r) => r.chunkId === "c8")).toBeDefined();
  });

  it("default k = 8", async () => {
    const search = fakeSearchOver(buildFixture());
    const out = await retrieveWith("any query", undefined, {
      embedder,
      search,
    });
    // 9 candidates clear the default minScore (c0..c8); k=8 caps it.
    expect(out).toHaveLength(8);
  });

  it("returns [] when the store has no candidates", async () => {
    const search = fakeSearchOver([]);
    const out = await retrieveWith("any query", { k: 5 }, { embedder, search });
    expect(out).toEqual([]);
  });

  it("returns [] when all candidates are below minScore", async () => {
    const hits: SearchHit[] = [
      { chunk: makeChunk({ id: "low" }), similarity: 0.1 },
    ];
    const search = fakeSearchOver(hits);
    const out = await retrieveWith(
      "any query",
      { k: 5, minScore: 0.55 },
      { embedder, search }
    );
    expect(out).toEqual([]);
  });

  it("preserves citeOkay flag in the result", async () => {
    const search = fakeSearchOver(buildFixture());
    const out = await retrieveWith(
      "any query",
      { k: 10, minScore: 0 },
      { embedder, search }
    );
    const c6 = out.find((r) => r.chunkId === "c6");
    expect(c6).toBeDefined();
    expect(c6!.citeOkay).toBe(false);
    const c0 = out.find((r) => r.chunkId === "c0");
    expect(c0!.citeOkay).toBe(true);
  });

  it("over-fetches at 2*k from the store before reranking", async () => {
    let observedK = 0;
    let observedFilters: { citeOkay?: boolean } | undefined;
    const fixture = buildFixture();
    const search = async (
      _emb: number[],
      k: number,
      filters: { citeOkay?: boolean } = {}
    ) => {
      observedK = k;
      observedFilters = filters;
      return [...fixture]
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, k);
    };
    await retrieveWith("any query", { k: 4 }, { embedder, search });
    expect(observedK).toBe(8);
    expect(observedFilters).toEqual({ citeOkay: undefined });
  });

  it("wraps embedder failures in a typed error", async () => {
    const search = fakeSearchOver(buildFixture());
    await expect(
      retrieveWith(
        "any query",
        { k: 3 },
        { embedder: new ThrowingEmbedder(), search }
      )
    ).rejects.toBeInstanceOf(RetrieverEmbeddingError);
  });
});
