import { describe, it, expect } from "vitest";
import { countTokens } from "@anthropic-ai/tokenizer";

import { buildPersona } from "./persona.js";
import { personaConfig } from "@/content/llm/persona";
import { voiceSamples } from "@/content/llm/voiceSamples";

describe("buildPersona", () => {
  it("is deterministic — multiple calls produce the same string", () => {
    const a = buildPersona();
    const b = buildPersona();
    const c = buildPersona();
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("fits within the 2500-token persona budget", () => {
    const persona = buildPersona();
    const tokens = countTokens(persona);
    expect(tokens).toBeLessThanOrEqual(2500);
  });

  it("voice samples in total fit within the 1500-token sample budget", () => {
    const total = voiceSamples.reduce(
      (sum, s) => sum + countTokens(s.text),
      0
    );
    expect(total).toBeLessThanOrEqual(1500);
  });

  it("includes the author name and core voice configuration", () => {
    const persona = buildPersona();
    expect(persona).toContain(personaConfig.name);
    expect(persona).toContain(personaConfig.voice.register);
    expect(persona).toContain(personaConfig.voice.cadence);
    for (const tell of personaConfig.voice.tells) {
      expect(persona).toContain(tell);
    }
    for (const avoid of personaConfig.voice.avoid) {
      expect(persona).toContain(avoid);
    }
  });

  it("includes every behavior line and every voice sample", () => {
    const persona = buildPersona();
    for (const b of personaConfig.behavior) {
      expect(persona).toContain(b);
    }
    for (const s of voiceSamples) {
      expect(persona).toContain(s.text);
    }
  });

  it("contains no markdown headings, lists, or emphasis markers", () => {
    const persona = buildPersona();
    // The behavior block uses plain "  - " bullets which are not
    // markdown headings or emphasis. Disallow markdown structures
    // that would render in a markdown context.
    expect(persona).not.toMatch(/^#/m);
    expect(persona).not.toMatch(/\*\*/);
    expect(persona).not.toMatch(/__/);
    expect(persona).not.toMatch(/```/);
  });

  it("every behavior line begins with an imperative verb", () => {
    // An imperative verb starts the sentence: a single capitalized
    // word followed by a space, no leading article/auxiliary.
    const NON_IMPERATIVE_LEADING = new Set([
      "I",
      "You",
      "We",
      "They",
      "He",
      "She",
      "It",
      "The",
      "A",
      "An",
      "My",
      "Your",
      "Our",
      "Their",
      "His",
      "Her",
      "Its",
      "This",
      "That",
      "These",
      "Those",
      "Is",
      "Are",
      "Was",
      "Were",
      "Be",
      "Been",
      "Being",
      "Has",
      "Have",
      "Had",
      "Do",
      "Does",
      "Did",
      "Will",
      "Would",
      "Should",
      "Could",
      "Can",
      "May",
      "Might",
      "Must",
      "Shall",
    ]);
    for (const line of personaConfig.behavior) {
      const first = line.split(/\s+/)[0];
      // Must start with a capital letter (imperative form).
      expect(first[0]).toBe(first[0].toUpperCase());
      // Must not be a pronoun, article, or auxiliary verb that would
      // signal a non-imperative sentence.
      expect(NON_IMPERATIVE_LEADING.has(first)).toBe(false);
    }
  });

  it("has 3-7 tells and 3-7 avoid phrases", () => {
    expect(personaConfig.voice.tells.length).toBeGreaterThanOrEqual(3);
    expect(personaConfig.voice.tells.length).toBeLessThanOrEqual(7);
    expect(personaConfig.voice.avoid.length).toBeGreaterThanOrEqual(3);
    expect(personaConfig.voice.avoid.length).toBeLessThanOrEqual(7);
  });

  it("has 3-5 voice samples", () => {
    expect(voiceSamples.length).toBeGreaterThanOrEqual(3);
    expect(voiceSamples.length).toBeLessThanOrEqual(5);
  });
});
