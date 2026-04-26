import Link from "next/link";
import { ABOUT_TEASER } from "@/content/panels";

export default function AboutTeaser() {
  return (
    <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
      <div style={{ color: "var(--fg-mute)", fontSize: "var(--t-xs-size)", marginBottom: "var(--s-4)" }}>
        ── 01 · ABT · ABOUT ──
      </div>
      <div style={{ marginBottom: "var(--s-5)", whiteSpace: "pre-line" }}>
        {ABOUT_TEASER.bio.join("\n")}
      </div>
      <ul style={{ color: "var(--fg-dim)", marginBottom: "var(--s-5)" }}>
        {ABOUT_TEASER.quotes.map((q, i) => (
          <li key={i} style={{ paddingBottom: "var(--s-2)" }}>
            <Link href="/about" style={{ color: "inherit" }}>
              <span aria-hidden="true">{"\u201c"}</span>
              {q.length > 88 ? q.slice(0, 87) + "…" : q}
              <span aria-hidden="true">{"\u201d"}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/about" style={{ color: "var(--accent)" }}>→ /about · full dossier</Link>
    </div>
  );
}
