/**
 * Thin wrapper around the Anthropic SDK so the route handler can stream
 * tokens without depending on SDK types directly. The wrapper exposes a
 * minimal `streamMessages` surface that yields text deltas and a final
 * usage object — the rest of the SDK surface is intentionally hidden so
 * tests can mock it with a single function.
 */
import Anthropic from "@anthropic-ai/sdk";

export type StreamRole = "user" | "assistant";

export interface StreamMessagesParams {
  system: string;
  messages: { role: StreamRole; content: string }[];
  model?: string;
  maxTokens?: number;
}

export interface StreamUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface StreamHandle {
  /** Async iterable of text deltas. Yields strings only. */
  tokens: AsyncIterable<string>;
  /** Resolves to final usage when the stream ends cleanly. */
  finalUsage(): Promise<StreamUsage>;
}

export interface AnthropicLike {
  streamMessages(params: StreamMessagesParams): Promise<StreamHandle>;
}

export class AnthropicError extends Error {
  readonly status?: number;
  readonly cause: unknown;
  constructor(message: string, opts: { status?: number; cause?: unknown } = {}) {
    super(message);
    this.name = "AnthropicError";
    this.status = opts.status;
    this.cause = opts.cause;
  }
}

const DEFAULT_MODEL =
  process.env.LLM_MODEL ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";
const DEFAULT_MAX_TOKENS = 4000;

let cachedClient: AnthropicLike | null = null;

export function setAnthropicClient(client: AnthropicLike | null): void {
  cachedClient = client;
}

export function getAnthropicClient(): AnthropicLike {
  if (cachedClient) return cachedClient;
  cachedClient = createDefaultClient();
  return cachedClient;
}

function createDefaultClient(): AnthropicLike {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const sdk = new Anthropic(apiKey ? { apiKey } : {});

  return {
    async streamMessages(params) {
      try {
        const stream = sdk.messages.stream({
          model: params.model ?? DEFAULT_MODEL,
          max_tokens: params.maxTokens ?? DEFAULT_MAX_TOKENS,
          system: params.system,
          messages: params.messages,
        });

        const tokens = (async function* () {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              yield event.delta.text;
            }
          }
        })();

        return {
          tokens,
          async finalUsage() {
            const final = await stream.finalMessage();
            return {
              inputTokens: final.usage?.input_tokens,
              outputTokens: final.usage?.output_tokens,
            };
          },
        };
      } catch (err) {
        throw wrapError(err);
      }
    },
  };
}

function wrapError(err: unknown): AnthropicError {
  const status =
    typeof err === "object" && err && "status" in err
      ? Number((err as { status?: unknown }).status)
      : undefined;
  const message = err instanceof Error ? err.message : String(err);
  return new AnthropicError(message, {
    status: Number.isFinite(status) ? status : undefined,
    cause: err,
  });
}
