import type { SkillGroup } from "@/content/resume/skills";

export default function SkillsTable({ groups }: { groups: SkillGroup[] }) {
  return (
    <table style={{ borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", color: "var(--fg-mute)", paddingRight: "var(--s-5)", paddingBottom: "var(--s-2)", textTransform: "uppercase", fontWeight: "normal" }}>domain</th>
          <th style={{ textAlign: "left", color: "var(--fg-mute)", paddingBottom: "var(--s-2)", textTransform: "uppercase", fontWeight: "normal" }}>instruments</th>
        </tr>
      </thead>
      <tbody>
        {groups.map((g) => (
          <tr key={g.domain} style={{ verticalAlign: "top" }}>
            <td style={{ color: "var(--fg)", paddingRight: "var(--s-5)", paddingBottom: "var(--s-3)" }}>{g.domain}</td>
            <td style={{ color: "var(--fg-dim)", paddingBottom: "var(--s-3)" }}>{g.instruments.join(" · ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
