import type { Role } from "@/content/resume/experience";

export default function ExperienceList({ items }: { items: Role[] }) {
  return (
    <ul style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)" }}>
      {items.map((r, i) => (
        <li key={i} style={{ padding: "var(--s-3) 0", borderLeft: "1px solid var(--rule)", paddingLeft: "var(--s-4)", marginBottom: "var(--s-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--fg)" }}>
            <span>├── {r.title} <span style={{ color: "var(--fg-mute)" }}>· {r.org}</span></span>
            <span style={{ color: r.end === "Present" ? "var(--accent)" : "var(--fg-mute)" }}>
              {r.start} – {r.end}
            </span>
          </div>
          <div style={{ color: "var(--fg-dim)", marginTop: "var(--s-1)" }}>│   {r.scope}</div>
          {r.bullets.map((b, j) => (
            <div key={j} style={{ color: "var(--fg)", marginTop: "var(--s-1)" }}>│   · {b}</div>
          ))}
        </li>
      ))}
    </ul>
  );
}
