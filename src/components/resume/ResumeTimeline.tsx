import Stack from "@/components/primitives/Stack";
import type { Role } from "@/content/resume/experience";

type Props = {
  heading: string;
  items: Role[];
};

export default function ResumeTimeline({ heading, items }: Props) {
  return (
    <Stack gap={4} as="section">
      <h2 className="t-meta" style={{ margin: 0, color: "var(--accent)" }}>
        {heading}
      </h2>
      <Stack gap={5} as="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((r, i) => (
          <li
            key={`${r.org}-${i}`}
            style={{
              borderLeft: "1px solid var(--rule)",
              paddingLeft: "var(--s-4)",
            }}
          >
            <Stack gap={2}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "var(--s-3)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--t-sm-size)",
                  color: "var(--fg)",
                }}
              >
                <span>
                  <strong style={{ fontWeight: 600 }}>{r.title}</strong>
                  <span style={{ color: "var(--fg-mute)" }}> · {r.org}</span>
                </span>
                <span
                  style={{
                    color: r.end === "Present" ? "var(--accent)" : "var(--fg-mute)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--t-xs-size)",
                  }}
                >
                  {r.start} – {r.end}
                </span>
              </div>
              {r.scope && (
                <p
                  style={{
                    margin: 0,
                    color: "var(--fg-dim)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--t-sm-size)",
                  }}
                >
                  {r.scope}
                </p>
              )}
              {r.bullets.length > 0 && (
                <Stack
                  gap={1}
                  as="ul"
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--t-sm-size)",
                  }}
                >
                  {r.bullets.map((b, j) => (
                    <li key={j} style={{ color: "var(--fg)", paddingLeft: "var(--s-3)", textIndent: "calc(-1 * var(--s-3))" }}>
                      <span aria-hidden="true" style={{ color: "var(--fg-faint)" }}>· </span>
                      {b}
                    </li>
                  ))}
                </Stack>
              )}
            </Stack>
          </li>
        ))}
      </Stack>
    </Stack>
  );
}
