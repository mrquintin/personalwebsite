/**
 * Route handler tests for POST /api/chat.
 *
 * The Anthropic SDK and the Upstash Redis client are mocked out — the SDK by
 * swapping in a fake stream object, the rate limiter by replacing its store
 * with a process-local in-memory one. Retrieval is mocked too so the test
 * doesn't touch the embedder or vector store.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route.js";
import {
  setAnthropicClient,
  type AnthropicLike,
  AnthropicError,
} from "@/lib/llm/anthropicClient";
import {
  createMemoryStore,
  setRateLimiterStore,
} from "@/lib/llm/rateLimiter";

vi.mock("@/lib/llm/retriever", () => ({
  retrieve: vi.fn(async () => []),
}));

import { retrieve } from "@/lib/llm/retriever";

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function makeStreamingClient(tokens: string[]): AnthropicLike {
  return {
    async streamMessages() {
      return {
        tokens: (async function* () {
          for (const t of tokens) yield t;
        })(),
        async finalUsage() {
          return { inputTokens: 12, outputTokens: tokens.length };
        },
      };
    },
  };
}

function makeFailingClient(status: number, message: string): AnthropicLike {
  return {
    async streamMessages() {
      throw new AnthropicError(message, { status });
    },
  };
}

async function readSSE(res: Response): Promise<{
  events: { event: string; data: string }[];
  raw: string;
}> {
  const text = await res.text();
  const events: { event: string; data: string }[] = [];
  const blocks = text.split("\n\n").filter(Boolean);
  for (const block of blocks) {
    const lines = block.split("\n");
    let event = "message";
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith("event: ")) event = line.slice("event: ".length);
      else if (line.startsWith("data: ")) dataLines.push(line.slice("data: ".length));
    }
    events.push({ event, data: dataLines.join("\n") });
  }
  return { events, raw: text };
}

beforeEach(() => {
  setRateLimiterStore(createMemoryStore());
  vi.mocked(retrieve).mockReset();
  vi.mocked(retrieve).mockResolvedValue([]);
});

afterEach(() => {
  setAnthropicClient(null);
  setRateLimiterStore(null);
});

describe("POST /api/chat", () => {
  it("happy path: streams tokens then a meta event", async () => {
    setAnthropicClient(makeStreamingClient(["Hello", " ", "world"]));
    vi.mocked(retrieve).mockResolvedValue([
      {
        chunkId: "chunk-1",
        text: "some retrieved text body",
        path: "corpus/sample.md",
        topics: [],
        kind: "essay",
        score: 0.9,
        citeOkay: true,
      },
    ]);

    const res = await POST(
      makeRequest({
        messages: [{ role: "user", content: "tell me something" }],
      }) as never
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const { events } = await readSSE(res);
    const tokenEvents = events.filter((e) => e.event === "token");
    expect(tokenEvents.map((e) => JSON.parse(e.data))).toEqual([
      "Hello",
      " ",
      "world",
    ]);

    const metaEvent = events.find((e) => e.event === "meta");
    expect(metaEvent).toBeDefined();
    const meta = JSON.parse(metaEvent!.data);
    expect(meta.retrievedCount).toBe(1);
    expect(meta.citations).toHaveLength(1);
    expect(meta.citations[0].chunkId).toBe("chunk-1");
    expect(meta.usage).toMatchObject({ outputTokens: 3 });

    const doneEvent = events.find((e) => e.event === "done");
    expect(doneEvent).toBeDefined();
  });

  it("happy path: works with empty retrieval and reports retrievedCount 0", async () => {
    setAnthropicClient(makeStreamingClient(["nope"]));
    vi.mocked(retrieve).mockResolvedValue([]);

    const res = await POST(
      makeRequest({
        messages: [{ role: "user", content: "obscure thing" }],
      }) as never
    );

    expect(res.status).toBe(200);
    const { events } = await readSSE(res);
    const meta = JSON.parse(events.find((e) => e.event === "meta")!.data);
    expect(meta.retrievedCount).toBe(0);
    expect(meta.citations).toEqual([]);
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await POST(makeRequest("not-json{") as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_json");
  });

  it("rejects empty messages array with 400", async () => {
    const res = await POST(makeRequest({ messages: [] }) as never);
    expect(res.status).toBe(400);
  });

  it("rejects messages with too-long content with 400", async () => {
    const res = await POST(
      makeRequest({
        messages: [{ role: "user", content: "x".repeat(4001) }],
      }) as never
    );
    expect(res.status).toBe(400);
  });

  it("rejects when latest message is not from the user with 400", async () => {
    const res = await POST(
      makeRequest({
        messages: [
          { role: "user", content: "hi" },
          { role: "assistant", content: "yo" },
        ],
      }) as never
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.detail).toContain("latest message must have role 'user'");
  });

  it("rejects more than 40 messages with 400", async () => {
    const messages: { role: "user" | "assistant"; content: string }[] =
      Array.from({ length: 41 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `m${i}`,
      }));
    if (messages[messages.length - 1].role !== "user") {
      messages.push({ role: "user", content: "last" });
    }
    const res = await POST(makeRequest({ messages }) as never);
    expect(res.status).toBe(400);
  });

  it("returns 429 with Retry-After once the hour limit is exhausted", async () => {
    setAnthropicClient(makeStreamingClient(["ok"]));
    const ip = "10.0.0.1";

    // The default per-hour cap is 20. 21st should be denied.
    let lastStatus = 200;
    for (let i = 0; i < 20; i++) {
      const res = await POST(
        makeRequest(
          { messages: [{ role: "user", content: `q${i}` }] },
          { "x-forwarded-for": ip }
        ) as never
      );
      lastStatus = res.status;
      // Drain the body so the stream finishes; otherwise the limiter
      // still recorded the hit (it does so before streaming) but we want
      // a clean response cycle for test stability.
      await res.text();
    }
    expect(lastStatus).toBe(200);

    const denied = await POST(
      makeRequest(
        { messages: [{ role: "user", content: "q21" }] },
        { "x-forwarded-for": ip }
      ) as never
    );
    expect(denied.status).toBe(429);
    const retry = denied.headers.get("Retry-After");
    expect(retry).toBeTruthy();
    expect(Number(retry)).toBeGreaterThan(0);
    const body = await denied.json();
    expect(body.error).toBe("rate_limited");
  });

  it("returns 502 when the Anthropic SDK throws", async () => {
    setAnthropicClient(makeFailingClient(500, "internal server error"));

    const res = await POST(
      makeRequest({
        messages: [{ role: "user", content: "anything" }],
      }) as never
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("upstream_error");
    expect(body.upstreamStatus).toBe(500);
    // No streaming body should have been started — content type is JSON.
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});
