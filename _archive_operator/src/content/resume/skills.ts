// TODO(michael): edit to what is actually true
export type SkillGroup = { domain: string; instruments: string[] };

const skills: SkillGroup[] = [
  { domain: "strategy",
    instruments: ["hypothesis decomposition", "scenario analysis", "OKR design", "red-team review"] },
  { domain: "software",
    instruments: ["TypeScript", "Next.js", "Python", "React", "SQL"] },
  { domain: "infrastructure",
    instruments: ["Postgres", "Redis", "Vercel", "AWS"] },
  { domain: "methods",
    instruments: ["Bayesian reasoning", "first-principles modeling", "structured argumentation"] },
];
export default skills;
