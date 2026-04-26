import { describe, it, expect } from "vitest";
import { isValidElement, type ReactNode } from "react";
import { hvmPhases } from "../../../content/presentations/hvm";
import { prpPhases } from "../../../content/presentations/prp";
import { thsPhases } from "../../../content/presentations/ths";
import type { Phase } from "../types";

function extractText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join(" ");
  }
  if (isValidElement(node)) {
    const children = (node.props as { children?: ReactNode })?.children;
    return extractText(children);
  }
  return "";
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const DECKS: Array<{ name: string; phases: Phase[] }> = [
  { name: "hvmPhases", phases: hvmPhases },
  { name: "prpPhases", phases: prpPhases },
  { name: "thsPhases", phases: thsPhases },
];

describe("project deck content shape", () => {
  for (const { name, phases } of DECKS) {
    describe(name, () => {
      it("has exactly 4 phases", () => {
        expect(phases).toHaveLength(4);
      });

      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];

        it(`phase ${i + 1} (${phase?.id ?? "?"}) has a non-empty heading`, () => {
          expect(phase).toBeDefined();
          expect(typeof phase.heading).toBe("string");
          expect(phase.heading.trim().length).toBeGreaterThan(0);
        });

        it(`phase ${i + 1} heading length is 1..60`, () => {
          const len = phase.heading.length;
          expect(len).toBeGreaterThanOrEqual(1);
          expect(len).toBeLessThanOrEqual(60);
        });

        it(`phase ${i + 1} has a non-empty body`, () => {
          const text = extractText(phase.body);
          expect(text.trim().length).toBeGreaterThan(0);
        });

        it(`phase ${i + 1} body word count is between 30 and 200`, () => {
          const text = extractText(phase.body);
          const words = wordCount(text);
          expect(words).toBeGreaterThanOrEqual(30);
          expect(words).toBeLessThanOrEqual(200);
        });
      }
    });
  }
});
