// Static teaser content for the landing accordion. One source of truth.
// TODO(michael): replace pull quotes and bio lines with real copy.

export const ABOUT_TEASER = {
  bio: [
    "Michael Quintin.",
    "Operator. Writer. Founder of Hivemind.",
    "Working on systems that help operators think clearly",
    "in a world optimized against clear thinking.",
  ],
  quotes: [
    "Decoration is forbidden. Information is the ornament.",
    "Density over decoration. Rigor over pace.",
    "Build the interface first; let the content earn its way in.",
  ],
};

export const HIVEMIND_TEASER = {
  pitch: "Strategic analytical software.",
  data: [
    { k: "Founded", v: "2024" },
    { k: "Stage",   v: "Seed" },
    { k: "Status",  v: "active" },
  ],
  demoSrc: null as string | null,
};

export const PURPOSELESS_TEASER = {
  title: "Purposeless Efficiency",
  author: "MICHAEL QUINTIN",
  pullQuote:
    "Efficiency, severed from purpose, becomes the most efficient way of arriving nowhere.",
  progress: { words: 92143, target: 100000, msVersion: 4 },
};

export const THESEUS_TEASER = {
  thesis: "A knowledge system for monitoring ideological contradiction.",
  external: { label: "thesescodex.com", href: "https://thesescodex.com" },
  // {nodes, contradictions, supports} — used by the mini graph
  graph: {
    nodes: 12,
    edges: [
      { a: 0, b: 1, kind: "support" as const },
      { a: 1, b: 2, kind: "support" as const },
      { a: 2, b: 3, kind: "tension" as const },
      { a: 4, b: 5, kind: "support" as const },
      { a: 5, b: 6, kind: "tension" as const },
      { a: 7, b: 8, kind: "support" as const },
      { a: 8, b: 9, kind: "support" as const },
      { a: 9, b: 10, kind: "support" as const },
      { a: 10, b: 11, kind: "support" as const },
    ],
  },
};

export const RESUME_TEASER = {
  updatedISO: "2026-04-12",
  highlights: [
    "founder, hivemind — strategic analytical software",
    "author, purposeless efficiency (forthcoming, 2026)",
    "researcher, theseus — ideological contradiction graph",
  ],
};
