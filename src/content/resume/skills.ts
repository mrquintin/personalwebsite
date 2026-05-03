// Categorized skills, no proficiency ratings. Four categories,
// 4–7 items each. The categories match how the work is actually
// organized, not a stock taxonomy.
export type SkillGroup = { domain: string; instruments: string[] };

const skills: SkillGroup[] = [
  {
    domain: "Languages",
    instruments: ["fluent Spanish", "conversational Arabic", "conversational Hungarian"],
  },
  {
    domain: "Technical",
    instruments: [
      "Excel financial modeling",
      "PowerPoint",
      "Python",
      "Java",
      "Final Cut Pro",
      "Final Draft 12",
      "Scrivener",
      "Sibelius",
    ],
  },
  {
    domain: "Research",
    instruments: [
      "business research",
      "market research",
      "policy strategy",
      "game theory",
      "philosophy",
    ],
  },
  {
    domain: "Interests",
    instruments: ["satirical comedy writing", "piano", "acting", "golf", "varsity rowing"],
  },
];
export default skills;
