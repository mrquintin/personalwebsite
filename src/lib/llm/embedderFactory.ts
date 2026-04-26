/**
 * Factory: select an Embedder by env. Caches a singleton so callers can
 * call getEmbedder() repeatedly without rebuilding state (e.g., usage
 * counters live on the instance).
 *
 *   EMBEDDER=voyage   (default) — VoyageEmbedder, voyage-3, 1024 dims
 *   EMBEDDER=openai            — OpenAIEmbedder, text-embedding-3-large
 *                                 reduced to 1024 dims to match
 */
import { type Embedder, VoyageEmbedder } from "./embedder";
import { OpenAIEmbedder } from "./embedderOpenAI";

export type EmbedderProvider = "voyage" | "openai";

let cached: Embedder | null = null;
let cachedProvider: EmbedderProvider | null = null;

export function getEmbedder(): Embedder {
  const provider = resolveProvider();
  if (cached && cachedProvider === provider) return cached;

  cached = provider === "openai" ? new OpenAIEmbedder() : new VoyageEmbedder();
  cachedProvider = provider;
  return cached;
}

/** Test-only: reset the cached singleton. */
export function _resetEmbedderCache(): void {
  cached = null;
  cachedProvider = null;
}

function resolveProvider(): EmbedderProvider {
  const raw = (process.env.EMBEDDER ?? "voyage").toLowerCase();
  if (raw === "openai") return "openai";
  if (raw === "voyage" || raw === "") return "voyage";
  throw new Error(`Unknown EMBEDDER value: ${process.env.EMBEDDER}`);
}
