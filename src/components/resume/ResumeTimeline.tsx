import Stack from "@/components/primitives/Stack";
import type { Role } from "@/content/resume/experience";

type Props = {
  heading: string;
  items: Role[];
};

export default function ResumeTimeline({ heading, items }: Props) {
  return (
    <section className="resume-timeline">
      <h2 className="site-eyebrow">{heading}</h2>
      <ul className="resume-timeline__list">
        {items.map((r, i) => (
          <li key={`${r.org}-${i}`} className="resume-role">
            <Stack gap={2}>
              <div className="resume-role__top">
                <span>
                  <strong style={{ fontWeight: 600 }}>{r.title}</strong>
                  <span className="resume-role__org"> · {r.org}</span>
                </span>
                <span className="resume-role__date">
                  {r.end ? `${r.start} – ${r.end}` : r.start}
                </span>
              </div>
              {r.scope && (
                <p className="resume-role__scope" style={{ margin: 0 }}>
                  {r.scope}
                </p>
              )}
              {r.bullets.length > 0 && (
                <ul className="resume-role__bullets">
                  {r.bullets.map((b, j) => (
                    <li key={j}>
                      <span aria-hidden="true" className="belief-list__n">· </span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </Stack>
          </li>
        ))}
      </ul>
    </section>
  );
}
