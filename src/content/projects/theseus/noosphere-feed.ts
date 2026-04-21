// Hand-curated feed; later wireable to a real API.
export type FeedKind = "DETECTED" | "OPEN QUESTION" | "REFINED";
export type FeedEntry = {
  tISO: string;          // "2026-04-18T12:04:02Z"
  kind: FeedKind;
  body: string[];        // pre-formatted lines
};

const feed: FeedEntry[] = [
  {
    tISO: "2026-04-18T12:04:02Z",
    kind: "DETECTED",
    body: [
      "Principle P-014 (\"autonomy is prior to welfare\")",
      "  > tension with",
      "  > Principle P-071 (\"collective survival overrides individual consent in extremis\")",
    ],
  },
  {
    tISO: "2026-04-18T10:33:11Z",
    kind: "OPEN QUESTION",
    body: [
      "Under what conditions does P-014 yield to P-071, and does that",
      "yield imply a new meta-principle?",
    ],
  },
  {
    tISO: "2026-04-17T22:17:44Z",
    kind: "REFINED",
    body: [
      "P-022 rewritten: \"preferences over outcomes are revealed",
      "through choice under constraint.\"",
    ],
  },
];
export default feed;
