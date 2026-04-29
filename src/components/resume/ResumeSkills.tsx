import type { SkillGroup } from "@/content/resume/skills";

export default function ResumeSkills({ groups }: { groups: SkillGroup[] }) {
  return (
    <section className="resume-skills">
      <h2 className="site-eyebrow">skills</h2>
      <ul className="resume-skills__list">
        {groups.map((g) => (
          <li key={g.domain} className="resume-skill">
            <span className="resume-skill__domain">
              {g.domain}
            </span>
            <span className="resume-skill__items">{g.instruments.join(" · ")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
