// TODO(michael): replace with real experience
export type Role = {
  title: string;
  org: string;
  start: string;       // YYYY-MM
  end: string | "Present";
  scope: string;
  bullets: string[];
};

const experience: Role[] = [
  {
    title: "Founder",
    org: "Hivemind",
    start: "2024-06",
    end: "Present",
    scope: "Strategic analytical software for operators reasoning under uncertainty.",
    bullets: [
      "Designed the hypothesis-graph data model and the structured-brief output format.",
      "Built the alpha product on TypeScript / Postgres; recruiting design partners.",
      "Closed initial seed round; assembled a small operating team.",
    ],
  },
  {
    title: "Author",
    org: "Independent",
    start: "2024-01",
    end: "Present",
    scope: "Purposeless Efficiency — Book I of a five-volume series.",
    bullets: [
      "Manuscript at v4, ~92,000 words; targeting 100,000 for first ship.",
      "Long-form essays drafted on corporatism, gamification, and incumbency.",
    ],
  },
  {
    title: "Researcher",
    org: "Theseus",
    start: "2024-09",
    end: "Present",
    scope: "Knowledge system for monitoring ideological contradiction.",
    bullets: [
      "Live deployment at thesescodex.com.",
      "Designed Noosphere, the contradiction-detection model.",
    ],
  },
];
export default experience;
