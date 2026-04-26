/**
 * POST /api/chat — public, rate-limited, streaming chat over the corpus.
 *
 * Pipeline:
 *   1. zod-validate body
 *   2. rate-limit by IP (or "anon" if absent)
 *   3. retrieve top-k corpus chunks for the latest user message
 *   4. assemble persona + retrieved context into the system prompt
 *   5. open the Anthropic stream and pipe tokens out as SSE
 *   6. emit a `meta` event with citations + usage when the model is done
 *
 * Streaming is intentionally held for up to ~200ms while retrieval runs;
 * after that the response is flushed token-by-token as soon as Claude emits
 * a delta. Sessions are NOT persisted server-side.
 */
import { NextRequest } from "next/server";

import {
  AnthropicError,
  getAnthropicClient,
} from "@/lib/llm/anthropicClient";
import { chatRequestSchema, type ChatMetaPayload } from "@/lib/llm/chatTypes";
import { buildPersona } from "@/lib/llm/persona";
import { assemblePrompt } from "@/lib/llm/promptAssembly";
import {
  ANON_KEY,
  checkRateLimit,
  deriveKey,
} from "@/lib/llm/rateLimiter";
import { retrieve } from "@/lib/llm/retriever";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

export async function POST(req: NextRequest): Promise<Response> {
  // 1. Parse + validate JSON body.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "invalid_json", "request body must be JSON");
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      "invalid_request",
      parsed.error.issues.map((i) => i.message).join("; ")
    );
  }
  const { messages, topicHints } = parsed.data;
  const last = messages[messages.length - 1];

  // 2. Rate limit.
  const fallbackIp =
    (req as unknown as { ip?: string | null }).ip ?? null;
  const key = deriveKey(req.headers, fallbackIp);
  const rl = await checkRateLimit(key);
  if (!rl.allowed) {
    const retryAfter = Math.max(1, Math.ceil(rl.resetMs / 1000));
    return new Response(
      JSON.stringify({
        error: "rate_limited",
        detail:
          rl.limited === "day"
            ? "daily request limit reached"
            : "hourly request limit reached",
        remaining: rl.remaining,
        retryAfterSeconds: retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  if (key === ANON_KEY) {
    // Defensive log so prod can see when the IP-derivation fallback fired.
    console.warn("[/api/chat] no IP available; using anon bucket");
  }

  // 3. Retrieve.
  let retrieved: Awaited<ReturnType<typeof retrieve>> = [];
  try {
    retrieved = await retrieve(last.content, { k: 8, topicHints });
  } catch (err) {
    console.error("[/api/chat] retrieval failed", err);
    retrieved = [];
  }

  // 4. Assemble.
  const assembled = await assemblePrompt({
    persona: buildPersona(),
    retrieved,
    history: messages.slice(0, -1),
    userMessage: last.content,
  });

  let systemPrompt = assembled.system;
  if (retrieved.length === 0) {
    systemPrompt +=
      "\n\nNOTE: No corpus context was retrieved for this query. Answer in the speaker's voice but be explicit that you cannot cite a source for any specific claim about the speaker's life or work.";
  }

  // 5. Open stream.
  let handle;
  try {
    handle = await getAnthropicClient().streamMessages({
      system: systemPrompt,
      messages: assembled.messages,
    });
  } catch (err) {
    return anthropicErrorResponse(err);
  }

  // 6. Pipe SSE.
  const meta: ChatMetaPayload = {
    citations: assembled.citations,
    usage: {},
    retrievedCount: retrieved.length,
  };

  const encoder = new TextEncoder();
  const sse = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: string) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${data}\n\n`)
        );
      };
      try {
        for await (const token of handle.tokens) {
          send("token", encodeData(token));
        }
        try {
          meta.usage = await handle.finalUsage();
        } catch {
          // Usage failure shouldn't sink the stream; surface what we have.
        }
        send("meta", JSON.stringify(meta));
        send("done", "[DONE]");
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        send("error", JSON.stringify({ error: "stream_failed", detail }));
      } finally {
        controller.close();
      }
    },
    cancel() {
      // Client disconnected; no cleanup required because the SDK stream is
      // garbage-collected once the for-await loop exits.
    },
  });

  return new Response(sse, { status: 200, headers: SSE_HEADERS });
}

function encodeData(s: string): string {
  // SSE data lines must not contain raw newlines; encode as JSON string so
  // the client can JSON.parse() each token cleanly.
  return JSON.stringify(s);
}

function jsonError(status: number, error: string, detail?: string): Response {
  return new Response(JSON.stringify({ error, detail }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function anthropicErrorResponse(err: unknown): Response {
  const status =
    err instanceof AnthropicError && typeof err.status === "number"
      ? err.status
      : undefined;
  const detail =
    err instanceof Error ? err.message : "anthropic request failed";
  console.error("[/api/chat] anthropic error", err);
  return new Response(
    JSON.stringify({
      error: "upstream_error",
      detail,
      upstreamStatus: status,
    }),
    {
      status: 502,
      headers: { "Content-Type": "application/json" },
    }
  );
}
