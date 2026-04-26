import Stack from "@/components/primitives/Stack";
import type { SkillGroup } from "@/content/resume/skills";

export default function ResumeSkills({ groups }: { groups: SkillGroup[] }) {
  return (
    <Stack gap={4} as="section">
      <h2 className="t-meta" style={{ margin: 0, color: "var(--accent)" }}>
        skills
      </h2>
      <Stack gap={3} as="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {groups.map((g) => (
          <li
            key={g.domain}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(7rem, 9rem) 1fr",
              gap: "var(--s-4)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--t-sm-size)",
            }}
          >
            <span style={{ color: "var(--fg-mute)", textTransform: "uppercase" }}>
              {g.domain}
            </span>
            <span style={{ color: "var(--fg)" }}>{g.instruments.join(" · ")}</span>
          </li>
        ))}
      </Stack>
    </Stack>
  );
}
