import Link from "next/link";
import { PURPOSELESS_TEASER } from "@/content/panels";

function progressBar(pct: number, width = 18): string {
  const filled = Math.round((pct / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

export default function PurposelessTeaser() {
  const pct = Math.round((PURPOSELESS_TEASER.progress.words / PURPOSELESS_TEASER.progress.target) * 100);
  return (
    <div style={{ color: "var(--fg)" }}>
      <div style={{ color: "var(--fg-mute)", fontFamily: "var(--font-mono)", fontSize: "var(--t-xs-size)", marginBottom: "var(--s-4)" }}>
        ── 03 · PRP · PURPOSELESS EFFICIENCY ──
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--t-2xl-size)", lineHeight: 1.05, color: "var(--fg-hi)" }}>
        {PURPOSELESS_TEASER.title}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginTop: "var(--s-2)", marginBottom: "var(--s-5)", letterSpacing: "0.08em" }}>
        — {PURPOSELESS_TEASER.author}
      </div>
      <div style={{
        fontFamily: "var(--font-serif)", fontStyle: "italic",
        fontSize: "var(--t-md-size)", color: "var(--fg-dim)",
        maxWidth: "60ch", marginBottom: "var(--s-5)",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)" }} aria-hidden="true">
          {"\u201c"}
        </span>
        {PURPOSELESS_TEASER.pullQuote.length > 220
          ? PURPOSELESS_TEASER.pullQuote.slice(0, 219) + "…"
          : PURPOSELESS_TEASER.pullQuote}
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)" }} aria-hidden="true">
          {"\u201d"}
        </span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg-dim)", marginBottom: "var(--s-5)" }}>
        MS WORDS: {progressBar(pct)} {pct}%
      </div>
      <Link href="/purposeless-efficiency" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
        → /purposeless-efficiency · manuscript
      </Link>
    </div>
  );
}
