import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import type { WritingItem } from "@/content/resume/writing";

export default function ResumeWriting({ items }: { items: WritingItem[] }) {
  return (
    <Stack gap={4} as="section">
      <h2 className="t-meta" style={{ margin: 0, color: "var(--accent)" }}>
        writing & publications
      </h2>
      <Stack gap={2} as="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((w, i) => (
          <li
            key={`${w.title}-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(5rem, 6rem) 1fr",
              gap: "var(--s-4)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--t-sm-size)",
            }}
          >
            <span style={{ color: "var(--fg-mute)" }}>{w.date}</span>
            <span>
              {w.href ? (
                <Link href={w.href} variant="underline" external>
                  {w.title}
                </Link>
              ) : (
                <span style={{ color: "var(--fg)" }}>{w.title}</span>
              )}
              <span style={{ color: "var(--fg-mute)" }}> · {w.venue}</span>
            </span>
          </li>
        ))}
      </Stack>
    </Stack>
  );
}
