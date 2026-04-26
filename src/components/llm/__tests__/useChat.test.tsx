import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useChat } from "../useChat";

const encoder = new TextEncoder();

type Frame = { event: string; data: string };

function encodeFrame(f: Frame): Uint8Array {
  return encoder.encode(`event: ${f.event}\ndata: ${f.data}\n\n`);
}

function streamFrom(frames: Frame[]): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const f of frames) {
        controller.enqueue(encodeFrame(f));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

function holdingStream(initial: Frame[]): {
  response: Response;
  release: () => void;
  errorOut: (err: unknown) => void;
} {
  let release!: () => void;
  let errorOut!: (err: unknown) => void;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const f of initial) {
        controller.enqueue(encodeFrame(f));
      }
      release = () => {
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      errorOut = (err) => {
        try {
          controller.error(err);
        } catch {
          // already closed/errored
        }
      };
    },
  });
  const response = new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
  return { response, release, errorOut };
}

let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = global.fetch;
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("useChat", () => {
  it("happy path: concatenates 5 token deltas", async () => {
    const tokens = ["He", "llo", ", ", "wor", "ld!"];
    const frames: Frame[] = [
      ...tokens.map((t) => ({ event: "token", data: JSON.stringify(t) })),
      { event: "done", data: "[DONE]" },
    ];
    global.fetch = vi.fn(async () => streamFrom(frames)) as typeof fetch;

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.submit("hi there");
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe("user");
    expect(result.current.messages[0].content).toBe("hi there");
    expect(result.current.messages[0].status).toBe("complete");
    expect(result.current.messages[1].role).toBe("assistant");
    expect(result.current.messages[1].status).toBe("complete");
    expect(result.current.messages[1].content).toBe("Hello, world!");
    expect(result.current.lastError).toBeUndefined();
  });

  it("populates citations from a meta event", async () => {
    const meta = {
      citations: [
        { id: "c1", chunkId: "corpus/about/intro.md#0", snippet: "snippet text" },
      ],
      usage: { inputTokens: 10, outputTokens: 4 },
      retrievedCount: 1,
    };
    const frames: Frame[] = [
      { event: "token", data: JSON.stringify("Answer.") },
      { event: "meta", data: JSON.stringify(meta) },
      { event: "done", data: "[DONE]" },
    ];
    global.fetch = vi.fn(async () => streamFrom(frames)) as typeof fetch;

    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.submit("question?");
    });

    const assistant = result.current.messages[1];
    expect(assistant.content).toBe("Answer.");
    expect(assistant.citations).toEqual([
      { id: "c1", chunkId: "corpus/about/intro.md#0", snippet: "snippet text" },
    ]);
  });

  it("surfaces a helpful error on 429 rate-limit response", async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: "rate_limited",
          detail: "hourly request limit reached",
          retryAfterSeconds: 600,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      ),
    ) as typeof fetch;

    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.submit("ping");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.lastError).toBeDefined();
    expect(result.current.lastError).toContain("per-hour limit");
    expect(result.current.lastError).toContain("10 minutes");
    const assistant = result.current.messages[1];
    expect(assistant.status).toBe("error");
  });

  it("stopStreaming aborts cleanly and finalizes the placeholder", async () => {
    const { response, errorOut } = holdingStream([
      { event: "token", data: JSON.stringify("partial ") },
      { event: "token", data: JSON.stringify("answer") },
    ]);

    let capturedSignal: AbortSignal | undefined;
    global.fetch = vi.fn(async (_url: unknown, init?: RequestInit) => {
      capturedSignal = init?.signal ?? undefined;
      capturedSignal?.addEventListener("abort", () => {
        errorOut(new DOMException("aborted", "AbortError"));
      });
      return response;
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useChat());

    let pending: Promise<void>;
    await act(async () => {
      pending = result.current.submit("write something");
      // let microtasks settle so the fetch + stream begin
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(2);
      expect(result.current.messages[1].content.length).toBeGreaterThan(0);
    });

    expect(result.current.status).toBe("streaming");

    await act(async () => {
      result.current.stopStreaming();
      await pending;
    });

    expect(capturedSignal?.aborted).toBe(true);
    expect(result.current.status).toBe("idle");
    const assistant = result.current.messages[1];
    expect(assistant.status).toBe("complete");
    expect(assistant.content).toBe("partial answer");
  });
});
