import { describe, it, expect } from "vitest";
import { chunkDocument } from "./chunker.js";

describe("chunkDocument — markdown headings and sections", () => {
  it("tracks heading and section path through 3 headings + 5 paragraphs", () => {
    const md = [
      "# Top",
      "",
      "Para one explains the top-level idea in plain prose.",
      "",
      "## Middle",
      "",
      "Para two introduces a middle subsection with more detail.",
      "",
      "Para three continues the middle subsection with examples.",
      "",
      "### Deep",
      "",
      "Para four lives inside the deepest heading and is dense.",
      "",
      "Para five also lives inside the deep section and wraps it up.",
      "",
    ].join("\n");

    const chunks = chunkDocument(md, { targetTokens: 30, overlapTokens: 0 });

    expect(chunks.length).toBeGreaterThanOrEqual(3);

    const topChunk = chunks.find((c) => c.text.includes("Para one"));
    expect(topChunk).toBeDefined();
    expect(topChunk!.heading).toBe("Top");
    expect(topChunk!.section).toBe("Top");

    const middleChunk = chunks.find((c) => c.text.includes("Para two"));
    expect(middleChunk).toBeDefined();
    expect(middleChunk!.heading).toBe("Middle");
    expect(middleChunk!.section).toBe("Top > Middle");

    const para3Chunk = chunks.find((c) => c.text.includes("Para three"));
    expect(para3Chunk).toBeDefined();
    expect(para3Chunk!.section).toBe("Top > Middle");

    const deepChunk = chunks.find((c) => c.text.includes("Para four"));
    expect(deepChunk).toBeDefined();
    expect(deepChunk!.heading).toBe("Deep");
    expect(deepChunk!.section).toBe("Top > Middle > Deep");

    const para5Chunk = chunks.find((c) => c.text.includes("Para five"));
    expect(para5Chunk).toBeDefined();
    expect(para5Chunk!.section).toBe("Top > Middle > Deep");
  });
});

describe("chunkDocument — code fences", () => {
  it("never splits a code fence across chunks", () => {
    const code = Array.from({ length: 20 }, (_, i) => `const x${i} = ${i};`).join(
      "\n"
    );
    const md = [
      "# Title",
      "",
      "Some intro paragraph before the code.",
      "",
      "```ts",
      code,
      "```",
      "",
      "Some closing paragraph after the code.",
      "",
    ].join("\n");

    const chunks = chunkDocument(md, { targetTokens: 25, overlapTokens: 0 });
    const fenceText = "```ts\n" + code + "\n```";

    const containing = chunks.filter((c) => c.text.includes(fenceText));
    expect(containing.length).toBe(1);

    for (const c of chunks) {
      const opens = (c.text.match(/```/g) || []).length;
      expect(opens % 2).toBe(0);
    }
  });

  it("preserves inline links verbatim", () => {
    const md =
      "# Title\n\nHere is a [link to docs](https://example.com/docs?x=1) inline.\n";
    const chunks = chunkDocument(md, { targetTokens: 200, overlapTokens: 0 });
    const joined = chunks.map((c) => c.text).join("\n");
    expect(joined).toContain("[link to docs](https://example.com/docs?x=1)");
  });
});

describe("chunkDocument — long document with overlap", () => {
  it("a 5000-char document yields multiple chunks with overlap", () => {
    const para = (i: number) =>
      `Paragraph ${i}: ${"lorem ipsum dolor sit amet consectetur adipiscing elit ".repeat(
        4
      )}`;
    let md = "# Big Doc\n\n";
    let n = 1;
    while (md.length < 5200) {
      md += para(n) + "\n\n";
      n++;
    }
    expect(md.length).toBeGreaterThanOrEqual(5000);

    const chunks = chunkDocument(md, {
      targetTokens: 200,
      overlapTokens: 40,
    });
    expect(chunks.length).toBeGreaterThan(1);

    let overlapsObserved = 0;
    for (let i = 1; i < chunks.length; i++) {
      if (chunks[i].charStart < chunks[i - 1].charEnd) {
        overlapsObserved++;
      }
    }
    expect(overlapsObserved).toBeGreaterThan(0);

    for (const c of chunks) {
      expect(c.charEnd).toBeGreaterThan(c.charStart);
      expect(c.text.length).toBeGreaterThan(0);
    }
  });
});

describe("chunkDocument — transcript format", () => {
  it("groups 6 user-assistant pairs into 2 chunks", () => {
    const messages: { role: "user" | "assistant"; content: string }[] = [];
    for (let i = 1; i <= 6; i++) {
      messages.push({ role: "user", content: `User question number ${i}?` });
      messages.push({
        role: "assistant",
        content: `Assistant reply to question ${i}, with some elaboration.`,
      });
    }
    const transcript = JSON.stringify({ messages });

    const chunks = chunkDocument(transcript, { format: "transcript" });
    expect(chunks.length).toBe(2);

    const allText = chunks.map((c) => c.text).join("\n");
    for (let i = 1; i <= 6; i++) {
      expect(allText).toContain(`User question number ${i}?`);
      expect(allText).toContain(`Assistant reply to question ${i}`);
    }

    expect(chunks[0].heading).toContain("User question number 1");
    expect(chunks[1].heading).toContain("User question number 4");
  });

  it("respects targetTokens to close earlier on overflow", () => {
    const messages: { role: "user" | "assistant"; content: string }[] = [];
    for (let i = 1; i <= 6; i++) {
      messages.push({
        role: "user",
        content: `Long user question ${i} ${"with extra context".repeat(10)}`,
      });
      messages.push({
        role: "assistant",
        content: `Long assistant reply ${i} ${"with detailed reasoning".repeat(
          10
        )}`,
      });
    }
    const transcript = JSON.stringify({ messages });
    const chunks = chunkDocument(transcript, {
      format: "transcript",
      targetTokens: 80,
    });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });
});
