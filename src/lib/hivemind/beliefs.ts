// P03 — Seven Core Beliefs from Guide I §4. TODO(michael): verbatim review.

export interface CoreBelief {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  verbatim: string;
  underwrites: Array<"I" | "II" | "III" | "IV"> | "hiring-filter";
  loadBearing: boolean;
}

export const BELIEFS: CoreBelief[] = [
  { number: 1, loadBearing: true,
    verbatim: "Most business problems reduce to a small set of underlying causes; institutional knowledge that compounds across engagements is therefore valuable.",
    underwrites: ["II"] },
  { number: 2, loadBearing: false,
    verbatim: "AI is capable of meritocratic analysis under provided principles; the bottleneck is the principles, not the model.",
    underwrites: ["II"] },
  { number: 3, loadBearing: false,
    verbatim: "Consulting's core offer is external problem-solving; the industry has lost its way by substituting performance for analysis.",
    underwrites: ["III"] },
  { number: 4, loadBearing: false,
    verbatim: "The networking-based structure of the corporate world is a market inefficiency; hiring on credential and conformity reproduces a class rather than filtering for ability.",
    underwrites: ["I", "IV"] },
  { number: 5, loadBearing: false,
    verbatim: "Play the man, not the game — the pattern is accurate but is not something to be proud of, and a serious firm builds around it rather than celebrating it.",
    underwrites: ["I"] },
  { number: 6, loadBearing: true,
    verbatim: "The scientific method works; peer review is not decoration; claims should be tested and revised, including the firm's own.",
    underwrites: ["II"] },
  { number: 7, loadBearing: false,
    verbatim: "Honesty is the best policy; the firm disclaims responsibility it has not earned, and surfaces uncertainty rather than smoothing it.",
    underwrites: ["III", "IV"] },
];
