// Words and phrases that must not appear in chrome, button text, or
// marketing copy. The list mirrors the "What to avoid" section of
// docs/voice-guide.md. Long-form prose authored by Michael is exempt;
// the lint script excludes MDX bodies. A per-occurrence override is
// available via a /* voice-allow */ comment immediately preceding the
// offending string.
export const FORBIDDEN_WORDS = [
  // Corporate-speak
  "synergy",
  "ecosystem",
  "leverage", // verb sense; nouns covered by override comment
  "unlock",
  "unleash",
  "robust",
  "innovative",
  "thought-leader",
  "thought leader",
  "visionary",
  "disrupt",
  "disruption",
  "revolutionary",
  "game-changing",
  "game changing",
  "cutting-edge",
  "cutting edge",
  "seamless",
  "effortless",
  "empowering",
  "passionate",
  // Intensifier abuse
  "literally",
  // Hedges that erase the claim
  "perhaps maybe",
  "maybe possibly",
  "perhaps maybe possibly",
  "might potentially",
] as const;

export type ForbiddenWord = (typeof FORBIDDEN_WORDS)[number];
