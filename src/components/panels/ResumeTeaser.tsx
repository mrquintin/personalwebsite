import Link from "next/link";
import { RESUME_TEASER } from "@/content/panels";

export default function ResumeTeaser() {
  return (
    <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
      <div style={{ color: "var(--fg-mute)", fontSize: "var(--t-xs-size)", marginBottom: "var(--s-4)" }}>
        ── 05 · CV · RESUME ──
      </div>
      <div style={{ color: "var(--fg-hi)", marginBottom: "var(--s-5)" }}>
        Michael Quintin — CV
        <span style={{ color: "var(--fg-mute)", marginLeft: "var(--s-3)" }}>
          last updated {RESUME_TEASER.updatedISO}
        </span>
      </div>
      <ul style={{ color: "var(--fg-dim)", marginBottom: "var(--s-6)" }}>
        {RESUME_TEASER.highlights.map((h, i) => (
          <li key={i} style={{ paddingBottom: "var(--s-2)" }}>· {h}</li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: "var(--s-4)" }}>
        <Link href="/resume" style={{ color: "var(--accent)", border: "var(--border-hair)", padding: "var(--s-2) var(--s-4)" }}>
          [ Open on page ]
        </Link>
        <a href="/resume.pdf" download style={{ color: "var(--accent)", border: "var(--border-hair)", padding: "var(--s-2) var(--s-4)" }}>
          [ Download PDF ]
        </a>
      </div>
    </div>
  );
}
