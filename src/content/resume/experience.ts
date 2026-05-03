export type Role = {
  title: string;       // role
  org: string;         // organization
  start: string;       // date label
  end?: string | "Present";
  scope: string;
  bullets: string[];
};

const experience: Role[] = [
  {
    title: "Intern",
    org: "Office of Senator Ted Cruz, U.S. Senate",
    start: "June 2025",
    end: "August 2025",
    scope: "Washington, D.C.",
    bullets: [
      "Authored three 10+ page reports on military, energy, and space policy strategy used to inform senior staff decision-making.",
      "Compiled a 50-page NDA-compliant notebook synthesizing government data and senior insight.",
      "Managed constituent communications and attended senior-level briefings across military and policy strategy.",
    ],
  },
  {
    title: "Intern",
    org: "Octaura",
    start: "July 2023; July 2024",
    end: "August 2024",
    scope: "Fintech startup, New York City",
    bullets: [
      "Interviewed 20+ team members to produce a 30-page market and product primer now used in new-hire onboarding.",
      "Researched CLO and syndicated loan markets with senior traders from Citi and Bank of America.",
    ],
  },
  {
    title: "Development Intern",
    org: "DNA Films",
    start: "June 2023; June 2024",
    end: "July 2024",
    scope: "Film production company, London",
    bullets: [
      "Analyzed 10 scripts, books, and pilots for commercial viability.",
      "Developed 10+ original horror feature concepts with the Head of Development.",
      "Continued advisory relationship with the former Head of Development after her transition to a new production firm.",
    ],
  },
];
export default experience;
