// Words that must not appear in chrome, button text, or marketing copy.
// Long-form prose by Michael is exempt; the lint script excludes MDX bodies.
export const FORBIDDEN_WORDS = [
  "revolutionary",
  "game-changing",
  "game changing",
  "cutting-edge",
  "cutting edge",
  "seamless",
  "effortless",
  "empowering",
  "passionate",
  "synergy",
  "ecosystem",
  "unlock",
  "unleash",
  "robust",
  "innovative",
  "thought-leader",
  "thought leader",
  "visionary",
  "disrupt",
  "disruption",
] as const;
