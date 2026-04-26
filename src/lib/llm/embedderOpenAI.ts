/**
 * OpenAI fallback embedder.
 *
 * Uses "text-embedding-3-large", which is natively 3072 dims but
 * supports the `dimensions` parameter to reduce. We default to 1024
 * so the vector store schema (sized for Voyage's voyage-3) does not
 * need to change when an operator switches providers via env.
 */
import {
  type Embedder,
  type Embedding,
  type UsageStats,
  EmbedderError,
  RateLimitError,
} from "./embedder";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/embeddings";
const OPENAI_MAX_BATCH = 128;

interface OpenAIResponse {
  object: string;
  data: Array<{ object: string; embedding: number[]; index: number }>;
  model: string;
  usage?: { prompt_tokens?: number; total_tokens?: number };
}

export interface OpenAIEmbedderOptions {
  apiKey?: string;
  model?: string;
  dim?: number;
  fetchImpl?: typeof fetch;
  endpoint?: string;
}

export class OpenAIEmbedder implements Embedder {
  readonly model: string;
  readonly dim: number;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly endpoint: string;
  private readonly usage: UsageStats = { totalTokens: 0, requestCount: 0 };

  constructor(opts: OpenAIEmbedderOptions = {}) {
    const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new EmbedderError("OPENAI_API_KEY is not set");
    }
    this.apiKey = apiKey;
    this.model = opts.model ?? "text-embedding-3-large";
    this.dim = opts.dim ?? 1024;
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.endpoint = opts.endpoint ?? OPENAI_ENDPOINT;
  }

  async embed(texts: string[]): Promise<Embedding[]> {
    if (texts.length === 0) return [];
    const out: Embedding[] = [];
    for (let i = 0; i < texts.length; i += OPENAI_MAX_BATCH) {
      const slice = texts.slice(i, i + OPENAI_MAX_BATCH);
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
        dimensions: this.dim,
      }),
    });

    if (res.status === 429) {
      throw new RateLimitError(`OpenAI 429: ${await safeText(res)}`);
    }
    if (!res.ok) {
      throw new EmbedderError(
        `OpenAI ${res.status}: ${await safeText(res)}`,
        res.status
      );
    }

    const json = (await res.json()) as OpenAIResponse;
    if (!json.data || json.data.length !== texts.length) {
      throw new EmbedderError(
        `OpenAI response had ${json.data?.length ?? 0} vectors for ${texts.length} inputs`
      );
    }

    const sorted = [...json.data].sort((a, b) => a.index - b.index);
    const vectors = sorted.map((d) => d.embedding);

    for (const v of vectors) {
      if (!Array.isArray(v) || v.length !== this.dim) {
        throw new EmbedderError(
          `OpenAI returned vector of length ${v?.length} (expected ${this.dim})`
        );
      }
    }

    this.usage.totalTokens +=
      json.usage?.total_tokens ?? json.usage?.prompt_tokens ?? 0;
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
