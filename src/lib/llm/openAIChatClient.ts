/**
 * OpenAI Responses API streaming adapter for the public /chat route.
 * The adapter intentionally matches the small Anthropic wrapper surface so
 * the route can switch providers without changing its SSE contract.
 */
import type {
  StreamHandle,
  StreamMessagesParams,
  StreamUsage,
} from "./anthropicClient";

export interface OpenAIChatLike {
  streamMessages(params: StreamMessagesParams): Promise<StreamHandle>;
}

export class OpenAIChatError extends Error {
  readonly status?: number;
  readonly cause: unknown;

  constructor(message: string, opts: { status?: number; cause?: unknown } = {}) {
    super(message);
    this.name = "OpenAIChatError";
    this.status = opts.status;
    this.cause = opts.cause;
  }
}

type OpenAIStreamEvent = {
  type?: string;
  delta?: string;
  error?: { message?: string };
  response?: {
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
    };
  };
};

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-5";
const DEFAULT_MAX_OUTPUT_TOKENS = 4000;
const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";

let cachedClient: OpenAIChatLike | null = null;

export function setOpenAIChatClient(client: OpenAIChatLike | null): void {
  cachedClient = client;
}

export function getOpenAIChatClient(): OpenAIChatLike {
  if (cachedClient) return cachedClient;
  cachedClient = createDefaultClient();
  return cachedClient;
}

function createDefaultClient(): OpenAIChatLike {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new OpenAIChatError("OPENAI_API_KEY is not set");
  }

  return {
    async streamMessages(params) {
      const res = await fetch(RESPONSES_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: params.model ?? DEFAULT_MODEL,
          instructions: params.system,
          input: params.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          max_output_tokens: params.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
          stream: true,
          store: false,
        }),
      });

      if (!res.ok || !res.body) {
        const detail = await readErrorBody(res);
        throw new OpenAIChatError(detail || "OpenAI request failed", {
          status: res.status,
        });
      }

      const body = res.body;
      let usage: StreamUsage = {};
      let resolveFinished: () => void = () => {};
      const finished = new Promise<void>((resolve) => {
        resolveFinished = resolve;
      });

      const tokens = (async function* () {
        try {
          for await (const event of parseSSE(body)) {
            if (event.type === "response.output_text.delta") {
              if (typeof event.delta === "string") yield event.delta;
            } else if (event.type === "response.completed") {
              usage = {
                inputTokens: event.response?.usage?.input_tokens,
                outputTokens: event.response?.usage?.output_tokens,
              };
            } else if (event.type === "error") {
              throw new OpenAIChatError(
                event.error?.message ?? "OpenAI stream failed",
                { status: res.status },
              );
            }
          }
        } finally {
          resolveFinished();
        }
      })();

      return {
        tokens,
        async finalUsage() {
          await finished;
          return usage;
        },
      };
    },
  };
}

async function readErrorBody(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? "";
  } catch {
    try {
      return await res.text();
    } catch {
      return "";
    }
  }
}

async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncIterable<OpenAIStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const raw = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const parsed = parseSSEBlock(raw);
        if (parsed) yield parsed;
        boundary = buffer.indexOf("\n\n");
      }
    }

    const tail = buffer.trim();
    if (tail) {
      const parsed = parseSSEBlock(tail);
      if (parsed) yield parsed;
    }
  } finally {
    reader.releaseLock();
  }
}

function parseSSEBlock(raw: string): OpenAIStreamEvent | null {
  const data = raw
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trimStart())
    .join("\n");

  if (!data || data === "[DONE]") return null;

  try {
    return JSON.parse(data) as OpenAIStreamEvent;
  } catch (err) {
    throw new OpenAIChatError("OpenAI stream returned invalid JSON", {
      cause: err,
    });
  }
}
