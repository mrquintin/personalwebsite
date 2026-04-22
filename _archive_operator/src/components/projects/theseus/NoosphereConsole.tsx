import type { FeedEntry } from "@/content/projects/theseus/noosphere-feed";

const KIND_GLYPH: Record<FeedEntry["kind"], string> = {
  "DETECTED": "·",
  "OPEN QUESTION": "?",
  "REFINED": "*",
};

export default function NoosphereConsole({ feed, viewing }: { feed: FeedEntry[]; viewing: number }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)",
        border: "var(--border-hair)", padding: "var(--s-4)",
        background: "var(--bg-0)", color: "var(--fg)",
      }}
    >
      <div style={{ color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>
        ┌ NOOSPHERE · CONTRADICTION FEED ──
      </div>
      {feed.map((e, i) => (
        <div key={i} style={{ marginBottom: "var(--s-4)" }}>
          <div style={{ color: "var(--accent-dim)" }}>
            {e.tISO}  · {e.kind}
          </div>
          {e.body.map((line, j) => (
            <div key={j} style={{ paddingLeft: "var(--s-3)", color: "var(--fg)" }}>
              {KIND_GLYPH[e.kind]} {line}
            </div>
          ))}
        </div>
      ))}
      <div style={{ color: "var(--fg-mute)", borderTop: "var(--border-hair)", paddingTop: "var(--s-3)" }}>
        ⎯ viewing {viewing} of {feed.length} entries · {" "}
        <a href="https://thesescodex.com" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>
          stream live ↗
        </a>
      </div>
    </div>
  );
}
