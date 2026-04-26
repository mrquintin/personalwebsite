/**
 * Embedder — typed interface + default Voyage AI implementation.
 *
 * Voyage AI's "voyage-3" (1024 dims) is preferred over older "voyage-2"
 * for 2026 ingestion: it is cheaper, faster, and the retrieval quality
 * gains in technical/code-heavy corpora are well-documented in Voyage's
 * own benchmarks. Sticking to 1024 dims keeps the vector store schema
 * compatible with the OpenAI fallback (which can be reduced to 1024).
 *
 * Network calls go through `fetch` directly — adding the official SDK
 * would only wrap the same REST surface and pull in extra weight.
 */

export type Embedding = number[];

export interface UsageStats {
  totalTokens: number;
  requestCount: number;
}

export interface EmbedResult {
  embeddings: Embedding[];
  usage: UsageStats;
}

export interface Embedder {
  readonly model: string;
  readonly dim: number;
  embed(texts: string[]): Promise<Embedding[]>;
  /** Cumulative usage across all `embed` calls on this instance. */
  getUsage(): UsageStats;
}

export class RateLimitError extends Error {
  readonly status = 429;
  constructor(message = "embedder rate-limited") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class EmbedderError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "EmbedderError";
  }
}

const VOYAGE_ENDPOINT = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MAX_BATCH = 128;

interface VoyageResponse {
  object: string;
  data: Array<{ object: string; embedding: number[]; index: number }>;
  model: string;
  usage?: { total_tokens?: number };
}

export interface VoyageEmbedderOptions {
  apiKey?: string;
  model?: string;
  dim?: number;
  fetchImpl?: typeof fetch;
  endpoint?: string;
}

export class VoyageEmbedder implements Embedder {
  readonly model: string;
  readonly dim: number;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly endpoint: string;
  private readonly usage: UsageStats = { totalTokens: 0, requestCount: 0 };

  constructor(opts: VoyageEmbedderOptions = {}) {
    const apiKey = opts.apiKey ?? process.env.VOYAGE_API_KEY;
    if (!apiKey) {
      throw new EmbedderError("VOYAGE_API_KEY is not set");
    }
    this.apiKey = apiKey;
    this.model = opts.model ?? "voyage-3";
    this.dim = opts.dim ?? 1024;
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.endpoint = opts.endpoint ?? VOYAGE_ENDPOINT;
  }

  async embed(texts: string[]): Promise<Embedding[]> {
    if (texts.length === 0) return [];
    const out: Embedding[] = [];
    for (let i = 0; i < texts.length; i += VOYAGE_MAX_BATCH) {
      const slice = texts.slice(i, i + VOYAGE_MAX_BATCH);
      const vectors = await this.embedSingleBatch(slice);
      out.push(...vectors);
    }
    return out;
  }

  getUsage(): UsageStats {
    return { ...this.usage };
  }

  private async embedSingleBatch(texts: string[]): Promise<Embedding[]> {
    const res = await this.fetchImpl(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: texts,
        model: this.model,
        input_type: "document",
      }),
    });

    if (res.status === 429) {
      throw new RateLimitError(`Voyage 429: ${await safeText(res)}`);
    }
    if (!res.ok) {
      throw new EmbedderError(
        `Voyage ${res.status}: ${await safeText(res)}`,
        res.status
      );
    }

    const json = (await res.json()) as VoyageResponse;
    if (!json.data || json.data.length !== texts.length) {
      throw new EmbedderError(
        `Voyage response had ${json.data?.length ?? 0} vectors for ${texts.length} inputs`
      );
    }

    const sorted = [...json.data].sort((a, b) => a.index - b.index);
    const vectors = sorted.map((d) => d.embedding);

    for (const v of vectors) {
      if (!Array.isArray(v) || v.length !== this.dim) {
        throw new EmbedderError(
          `Voyage returned vector of length ${v?.length} (expected ${this.dim})`
        );
      }
    }

    this.usage.totalTokens += json.usage?.total_tokens ?? 0;
    this.usage.requestCount += 1;

    return vectors;
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no body>";
  }
}
