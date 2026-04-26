export type Role = {
  title: string;       // role
  org: string;         // organization
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
      "Designed the hypothesis-graph data model and structured-brief output format that anchor the product.",
      "Shipped the alpha on TypeScript and Postgres; recruited the first cohort of design partners.",
      "Closed the seed round and assembled a small operating team.",
    ],
  },
  {
    title: "Author",
    org: "Independent",
    start: "2024-01",
    end: "Present",
    scope: "Purposeless Efficiency — Book I of a five-volume series on the political economy of efficiency.",
    bullets: [
      "Drafted the manuscript to v4 at ~92,000 words; targeting 100,000 for first ship.",
      "Wrote long-form essays on corporatism, gamification, and incumbency that source the wider series.",
    ],
  },
  {
    title: "Researcher",
    org: "Theseus",
    start: "2024-09",
    end: "Present",
    scope: "Knowledge system for monitoring ideological contradiction.",
    bullets: [
      "Designed Noosphere, the contradiction-detection model behind the system.",
      "Deployed the live instance at thesescodex.com and grow its corpus as commitments surface.",
    ],
  },
];
export default experience;
