/* ---------------------------------------------------------------------------
 * microcopy.lint.test — suite 20/P05
 *
 * Forbidden-words linter for the central microcopy registry. Walks every
 * string value in `microcopy` and asserts none contain a banned word from
 * docs/voice-guide.md. The check is case-insensitive and word-boundary
 * aware so legitimate substrings (e.g. "discover" doesn't trip "disco" if
 * we ever added it) are not false positives.
 *
 * The linter is also a structural sanity check: it ensures the surfaces
 * required by the prompt (nav/buttons/errors/emptyStates/confirms/
 * placeholders/meta) exist on `microcopy`.
 * ------------------------------------------------------------------------- */

import { describe, expect, it } from "vitest";

import { microcopy } from "../microcopy";
import { FORBIDDEN_WORDS } from "../forbidden-words";

type StringEntry = { path: string; value: string };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collectStrings(node: unknown, path: string, out: StringEntry[]): void {
  if (typeof node === "string") {
    out.push({ path, value: node });
    return;
  }
  if (typeof node === "function") {
    // Best-effort: invoke common arities with neutral arguments so we lint
    // the resulting string. Skips silently if invocation throws.
    try {
      const fn = node as (...args: unknown[]) => unknown;
      const probes: unknown[][] = [
        [],
        [1],
        [1, 2],
        ["sample"],
        [200],
      ];
      for (const args of probes) {
        try {
          const result = fn(...args);
          if (typeof result === "string") {
            out.push({ path: `${path}(${args.join(",")})`, value: result });
          }
        } catch {
          // ignore bad arity
        }
      }
    } catch {
      // ignore
    }
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      collectStrings(v, path ? `${path}.${k}` : k, out);
    }
  }
}

describe("microcopy: forbidden-words lint", () => {
  const entries: StringEntry[] = [];
  collectStrings(microcopy, "microcopy", entries);

  it("collects at least one string entry to lint", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  for (const word of FORBIDDEN_WORDS) {
    it(`does not contain forbidden word "${word}"`, () => {
      const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
      const offenders = entries.filter((e) => pattern.test(e.value));
      expect(
        offenders,
        offenders.length > 0
          ? `forbidden word "${word}" appears in: ${offenders
              .map((o) => `${o.path} = ${JSON.stringify(o.value)}`)
              .join("; ")}`
          : "",
      ).toEqual([]);
    });
  }

  it("exposes every required surface", () => {
    const required = [
      "nav",
      "buttons",
      "errors",
      "emptyStates",
      "confirms",
      "placeholders",
      "meta",
    ] as const;
    for (const key of required) {
      expect(microcopy, `missing surface "${key}"`).toHaveProperty(key);
    }
  });

  it("buttons follow lowercase friendly mono voice", () => {
    // Spot-check the canonical buttons from the prompt. Some entries are
    // intentionally Title Case (e.g. resume actions like "Download PDF")
    // because they're document-action labels, not UI chrome buttons.
    const lowercaseRequired = [
      "ask",
      "retry",
      "clear",
      "copy",
      "copied",
      "stop",
      "prev",
      "next",
      "submit",
      "reload",
    ] as const;
    for (const key of lowercaseRequired) {
      const value = (microcopy.buttons as Record<string, string>)[key];
      expect(value, `buttons.${key} missing`).toBeTypeOf("string");
      expect(value, `buttons.${key} should be lowercase`).toBe(value.toLowerCase());
    }
  });

  it("contains no exclamation marks outside the Unix-error convention", () => {
    // Voice guide allows "! foo" Unix-style but no other exclamations.
    for (const e of entries) {
      const stripped = e.value.replace(/!\s|\s!|^!/g, "");
      expect(
        stripped.includes("!"),
        `unexpected '!' in ${e.path}: ${JSON.stringify(e.value)}`,
      ).toBe(false);
    }
  });
});
