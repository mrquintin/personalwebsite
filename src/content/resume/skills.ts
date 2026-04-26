// Categorized skills, no proficiency ratings. Four categories,
// 4–7 items each. The categories match how the work is actually
// organized, not a stock taxonomy.
export type SkillGroup = { domain: string; instruments: string[] };

const skills: SkillGroup[] = [
  {
    domain: "Engineering",
    instruments: ["TypeScript", "Next.js", "React", "Python", "Postgres", "SQL", "Vercel"],
  },
  {
    domain: "Research",
    instruments: [
      "hypothesis decomposition",
      "scenario analysis",
      "Bayesian reasoning",
      "first-principles modeling",
      "structured argumentation",
      "red-team review",
    ],
  },
  {
    domain: "Communication",
    instruments: [
      "long-form essays",
      "manuscript drafting",
      "design-partner interviews",
      "operator briefings",
    ],
  },
  {
    domain: "Operations",
    instruments: ["product strategy", "fundraising", "small-team hiring", "OKR design"],
  },
];
export default skills;
