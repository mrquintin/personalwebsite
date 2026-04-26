import { describe, it, expect } from "vitest";
import { countTokens } from "@anthropic-ai/tokenizer";

import { assemblePrompt } from "./promptAssembly.js";
import type { Retrieved } from "./retriever.js";

function makeRetrieved(over: Partial<Retrieved> & { id: string }): Retrieved {
  return {
    chunkId: over.id,
    text: over.text ?? `text for ${over.id}`,
    heading: over.heading ?? `Heading ${over.id}`,
    section: over.section,
    path: over.path ?? `corpus/${over.id}.md`,
    topics: over.topics ?? [],
    kind: over.kind ?? "essay",
    score: over.score ?? 0.7,
    citeOkay: over.citeOkay ?? true,
  };
}

/** Build a string that exceeds `target` tokens. */
function padToTokens(target: number): string {
  const seed = "lorem ipsum dolor sit amet consectetur adipiscing elit ";
  let s = "";
  while (countTokens(s) < target) {
    s += seed.repeat(20);
  }
  return s;
}

describe("assemblePrompt", () => {
  const persona = "You are an assistant who speaks in the voice of M.Q.";

  it("produces a well-formed system prompt with no retrieved block when retrieved is empty", async () => {
    const out = await assemblePrompt({
      persona,
      retrieved: [],
      history: [],
      userMessage: "hello",
    });
    expect(out.system).toContain(persona);
    expect(out.system).toContain("You answer using ONLY");
    expect(out.system).not.toContain("<retrieved_context>");
    expect(out.citations).toEqual([]);
    expect(out.messages).toEqual([{ role: "user", content: "hello" }]);
    expect(out.tokenBudget.max).toBe(16000);
    expect(out.tokenBudget.used).toBeGreaterThan(0);
  });

  it("renders retrieved chunks with sequential [c1], [c2], ... ids", async () => {
    const retrieved = [
      makeRetrieved({ id: "alpha", score: 0.9, text: "alpha body" }),
      makeRetrieved({ id: "beta", score: 0.8, text: "beta body" }),
      makeRetrieved({ id: "gamma", score: 0.7, text: "gamma body" }),
    ];
    const out = await assemblePrompt({
      persona,
      retrieved,
      history: [],
      userMessage: "tell me",
    });

    expect(out.system).toContain("<retrieved_context>");
    expect(out.system).toContain("</retrieved_context>");
    expect(out.system).toContain("[c1]");
    expect(out.system).toContain("[c2]");
    expect(out.system).toContain("[c3]");
    expect(out.system).toContain("alpha body");
    expect(out.system).toContain("beta body");
    expect(out.system).toContain("gamma body");

    // Citations map [c1].. back to chunkIds in score-desc order.
    expect(out.citations).toEqual([
      { id: "c1", chunkId: "alpha", snippet: "alpha body" },
      { id: "c2", chunkId: "beta", snippet: "beta body" },
      { id: "c3", chunkId: "gamma", snippet: "gamma body" },
    ]);

    // IDs are sequential and unique.
    const ids = out.citations.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(["c1", "c2", "c3"]);
  });

  it("orders chunks by score descending regardless of input order", async () => {
    const retrieved = [
      makeRetrieved({ id: "low", score: 0.5, text: "low body" }),
      makeRetrieved({ id: "high", score: 0.95, text: "high body" }),
      makeRetrieved({ id: "mid", score: 0.7, text: "mid body" }),
    ];
    const out = await assemblePrompt({
      persona,
      retrieved,
      history: [],
      userMessage: "?",
    });
    expect(out.citations.map((c) => c.chunkId)).toEqual([
      "high",
      "mid",
      "low",
    ]);
  });

  it("drops lowest-score chunks when the retrieved budget overflows", async () => {
    // 20 chunks of ~1000 tokens each. Default budget gives <20 slots, so
    // some must be dropped — and the dropped ones must be the lowest score.
    const big = padToTokens(1000);
    const retrieved: Retrieved[] = Array.from({ length: 20 }, (_, i) =>
      makeRetrieved({
        id: `c${i}`,
        // score descends from 0.99 → 0.80 in 0.01 steps
        score: Number((0.99 - i * 0.01).toFixed(2)),
        text: `${big} marker-${i}`,
      })
    );

    const out = await assemblePrompt({
      persona,
      retrieved,
      history: [],
      userMessage: "?",
    });

    expect(out.citations.length).toBeGreaterThan(0);
    expect(out.citations.length).toBeLessThan(20);

    const keptIds = out.citations.map((c) => c.chunkId);
    // The kept chunks must be a prefix of the score-sorted list (highest
    // scores first) — i.e. nothing was kept that has a lower score than
    // something dropped.
    for (let i = 0; i < keptIds.length; i++) {
      expect(keptIds[i]).toBe(`c${i}`);
    }
    // The lowest-scored chunk must be dropped.
    expect(keptIds).not.toContain("c19");

    // Final budget stays within max.
    expect(out.tokenBudget.used).toBeLessThanOrEqual(out.tokenBudget.max);
  });

  it("truncates history to the last 6 turns", async () => {
    const history: { role: "user" | "assistant"; content: string }[] =
      Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `turn-${i}`,
      }));

    const out = await assemblePrompt({
      persona,
      retrieved: [],
      history,
      userMessage: "current",
    });

    // last 6 history turns + the 1 new user message
    expect(out.messages).toHaveLength(7);
    expect(out.messages[0].content).toBe("turn-14");
    expect(out.messages[1].content).toBe("turn-15");
    expect(out.messages[5].content).toBe("turn-19");
    expect(out.messages[6]).toEqual({ role: "user", content: "current" });

    // Earlier turns must not appear.
    const allContent = out.messages.map((m) => m.content).join("|");
    expect(allContent).not.toContain("turn-0");
    expect(allContent).not.toContain("turn-13");
  });

  it("preserves history shorter than the cap unchanged", async () => {
    const history: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1" },
    ];
    const out = await assemblePrompt({
      persona,
      retrieved: [],
      history,
      userMessage: "now",
    });
    expect(out.messages).toEqual([
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1" },
      { role: "user", content: "now" },
    ]);
  });

  it("uses a custom maxContextTokens to constrain retrieved context", async () => {
    const big = padToTokens(500);
    const retrieved: Retrieved[] = Array.from({ length: 10 }, (_, i) =>
      makeRetrieved({
        id: `c${i}`,
        score: Number((0.99 - i * 0.01).toFixed(2)),
        text: `${big} marker-${i}`,
      })
    );

    const tight = await assemblePrompt({
      persona,
      retrieved,
      history: [],
      userMessage: "?",
      maxContextTokens: 5000,
    });
    const loose = await assemblePrompt({
      persona,
      retrieved,
      history: [],
      userMessage: "?",
      maxContextTokens: 16000,
    });
    expect(tight.citations.length).toBeLessThan(loose.citations.length);
    expect(tight.tokenBudget.max).toBe(5000);
    expect(tight.tokenBudget.used).toBeLessThanOrEqual(5000);
  });

  it("includes the grounding instruction text verbatim", async () => {
    const out = await assemblePrompt({
      persona,
      retrieved: [],
      history: [],
      userMessage: "x",
    });
    expect(out.system).toContain(
      "You answer using ONLY the retrieved context below"
    );
    expect(out.system).toContain("Cite each retrieved chunk you use by its [id]");
    expect(out.system).toContain("write in the speaker's voice");
  });

  it("snippet is a prefix of the chunk text, capped at 200 chars", async () => {
    const longText = "a".repeat(500);
    const retrieved = [
      makeRetrieved({ id: "long", score: 0.9, text: longText }),
    ];
    const out = await assemblePrompt({
      persona,
      retrieved,
      history: [],
      userMessage: "?",
    });
    expect(out.citations[0].snippet.length).toBe(200);
    expect(longText.startsWith(out.citations[0].snippet)).toBe(true);
  });
});
