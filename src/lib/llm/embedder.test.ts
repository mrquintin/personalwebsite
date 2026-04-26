import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { VoyageEmbedder, RateLimitError, EmbedderError } from "./embedder.js";
import { OpenAIEmbedder } from "./embedderOpenAI.js";
import { getEmbedder, _resetEmbedderCache } from "./embedderFactory.js";

interface RecordedCall {
  url: string;
  init: RequestInit;
}

interface FakeResponse {
  status: number;
  body: unknown;
}

/**
 * Minimal recorded-fixture harness. We hand the embedder a `fetchImpl`
 * that pulls the next canned response off a queue and records every
 * request shape, so tests assert URL + headers + body without ever
 * touching the network.
 */
function makeFakeFetch(responses: FakeResponse[]): {
  fetchImpl: typeof fetch;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  let i = 0;
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    const r = responses[i++];
    if (!r) throw new Error("makeFakeFetch: no more responses queued");
    return new Response(JSON.stringify(r.body), {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

function vector(dim: number, seed: number): number[] {
  return Array.from({ length: dim }, (_, i) => (i + seed) / 1000);
}

function voyageBody(dim: number, n: number, model = "voyage-3", tokens = 50) {
  return {
    object: "list",
    data: Array.from({ length: n }, (_, i) => ({
      object: "embedding",
      embedding: vector(dim, i + 1),
      index: i,
    })),
    model,
    usage: { total_tokens: tokens },
  };
}

function openaiBody(dim: number, n: number, model = "text-embedding-3-large", tokens = 50) {
  return {
    object: "list",
    data: Array.from({ length: n }, (_, i) => ({
      object: "embedding",
      embedding: vector(dim, i + 1),
      index: i,
    })),
    model,
    usage: { prompt_tokens: tokens, total_tokens: tokens },
  };
}

describe("VoyageEmbedder", () => {
  it("exposes model + dim", () => {
    const e = new VoyageEmbedder({
      apiKey: "k",
      fetchImpl: (() => undefined) as unknown as typeof fetch,
    });
    expect(e.model).toBe("voyage-3");
    expect(e.dim).toBe(1024);
  });

  it("sends correct request shape (URL, headers, body) and decodes vectors", async () => {
    const { fetchImpl, calls } = makeFakeFetch([
      { status: 200, body: voyageBody(1024, 2) },
    ]);
    const e = new VoyageEmbedder({ apiKey: "secret-key", fetchImpl });

    const out = await e.embed(["hello", "world"]);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.voyageai.com/v1/embeddings");
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer secret-key");
    expect(headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.model).toBe("voyage-3");
    expect(body.input).toEqual(["hello", "world"]);

    expect(out).toHaveLength(2);
    expect(out[0]).toHaveLength(1024);
    expect(out[1]).toHaveLength(1024);
  });

  it("batches inputs over 128 across multiple requests", async () => {
    const { fetchImpl, calls } = makeFakeFetch([
      { status: 200, body: voyageBody(1024, 128) },
      { status: 200, body: voyageBody(1024, 72) },
    ]);
    const e = new VoyageEmbedder({ apiKey: "k", fetchImpl });
    const inputs = Array.from({ length: 200 }, (_, i) => `t${i}`);

    const out = await e.embed(inputs);

    expect(calls).toHaveLength(2);
    const body0 = JSON.parse(calls[0].init.body as string);
    const body1 = JSON.parse(calls[1].init.body as string);
    expect(body0.input).toHaveLength(128);
    expect(body1.input).toHaveLength(72);
    expect(out).toHaveLength(200);
  });

  it("throws RateLimitError on HTTP 429", async () => {
    const { fetchImpl } = makeFakeFetch([
      { status: 429, body: { error: "slow down" } },
    ]);
    const e = new VoyageEmbedder({ apiKey: "k", fetchImpl });
    await expect(e.embed(["x"])).rejects.toBeInstanceOf(RateLimitError);
  });

  it("throws EmbedderError on other non-2xx responses", async () => {
    const { fetchImpl } = makeFakeFetch([
      { status: 500, body: { error: "boom" } },
    ]);
    const e = new VoyageEmbedder({ apiKey: "k", fetchImpl });
    await expect(e.embed(["x"])).rejects.toBeInstanceOf(EmbedderError);
  });

  it("tracks cumulative usage across batches", async () => {
    const { fetchImpl } = makeFakeFetch([
      { status: 200, body: voyageBody(1024, 128, "voyage-3", 1000) },
      { status: 200, body: voyageBody(1024, 10, "voyage-3", 80) },
    ]);
    const e = new VoyageEmbedder({ apiKey: "k", fetchImpl });
    const inputs = Array.from({ length: 138 }, (_, i) => `t${i}`);
    await e.embed(inputs);
    expect(e.getUsage()).toEqual({ totalTokens: 1080, requestCount: 2 });
  });

  it("rejects when response vector length does not match dim", async () => {
    const { fetchImpl } = makeFakeFetch([
      {
        status: 200,
        body: {
          object: "list",
          data: [{ object: "embedding", embedding: [0.1, 0.2], index: 0 }],
          model: "voyage-3",
          usage: { total_tokens: 1 },
        },
      },
    ]);
    const e = new VoyageEmbedder({ apiKey: "k", fetchImpl });
    await expect(e.embed(["a"])).rejects.toBeInstanceOf(EmbedderError);
  });

  it("constructor throws if no api key is available", () => {
    const prior = process.env.VOYAGE_API_KEY;
    delete process.env.VOYAGE_API_KEY;
    try {
      expect(() => new VoyageEmbedder()).toThrow(/VOYAGE_API_KEY/);
    } finally {
      if (prior !== undefined) process.env.VOYAGE_API_KEY = prior;
    }
  });
});

describe("OpenAIEmbedder", () => {
  it("sends dimensions=1024 to match Voyage schema", async () => {
    const { fetchImpl, calls } = makeFakeFetch([
      { status: 200, body: openaiBody(1024, 1) },
    ]);
    const e = new OpenAIEmbedder({ apiKey: "sk-test", fetchImpl });
    await e.embed(["hello"]);
    expect(calls[0].url).toBe("https://api.openai.com/v1/embeddings");
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.model).toBe("text-embedding-3-large");
    expect(body.dimensions).toBe(1024);
    expect(body.input).toEqual(["hello"]);
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer sk-test");
  });

  it("throws RateLimitError on 429", async () => {
    const { fetchImpl } = makeFakeFetch([
      { status: 429, body: { error: { message: "rate" } } },
    ]);
    const e = new OpenAIEmbedder({ apiKey: "sk-test", fetchImpl });
    await expect(e.embed(["x"])).rejects.toBeInstanceOf(RateLimitError);
  });

  it("decodes data and tracks usage", async () => {
    const { fetchImpl } = makeFakeFetch([
      { status: 200, body: openaiBody(1024, 3, "text-embedding-3-large", 42) },
    ]);
    const e = new OpenAIEmbedder({ apiKey: "sk-test", fetchImpl });
    const out = await e.embed(["a", "b", "c"]);
    expect(out).toHaveLength(3);
    expect(out[0]).toHaveLength(1024);
    expect(e.getUsage()).toEqual({ totalTokens: 42, requestCount: 1 });
  });
});

describe("getEmbedder factory", () => {
  let originalEmbedder: string | undefined;
  let originalVoyage: string | undefined;
  let originalOpenAI: string | undefined;

  beforeEach(() => {
    originalEmbedder = process.env.EMBEDDER;
    originalVoyage = process.env.VOYAGE_API_KEY;
    originalOpenAI = process.env.OPENAI_API_KEY;
    process.env.VOYAGE_API_KEY = "voyage-test";
    process.env.OPENAI_API_KEY = "sk-test";
    _resetEmbedderCache();
  });

  afterEach(() => {
    if (originalEmbedder === undefined) delete process.env.EMBEDDER;
    else process.env.EMBEDDER = originalEmbedder;
    if (originalVoyage === undefined) delete process.env.VOYAGE_API_KEY;
    else process.env.VOYAGE_API_KEY = originalVoyage;
    if (originalOpenAI === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalOpenAI;
    _resetEmbedderCache();
  });

  it("defaults to voyage when EMBEDDER is unset", () => {
    delete process.env.EMBEDDER;
    const e = getEmbedder();
    expect(e.model).toBe("voyage-3");
    expect(e.dim).toBe(1024);
  });

  it("returns OpenAI when EMBEDDER=openai", () => {
    process.env.EMBEDDER = "openai";
    const e = getEmbedder();
    expect(e.model).toBe("text-embedding-3-large");
    expect(e.dim).toBe(1024);
  });

  it("caches singleton across calls", () => {
    delete process.env.EMBEDDER;
    const a = getEmbedder();
    const b = getEmbedder();
    expect(a).toBe(b);
  });

  it("throws on unknown EMBEDDER value", () => {
    process.env.EMBEDDER = "cohere";
    expect(() => getEmbedder()).toThrow(/Unknown EMBEDDER/);
  });
});
