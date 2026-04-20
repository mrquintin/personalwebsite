import Link from "next/link";
import { HIVEMIND_TEASER } from "@/content/panels";

export default function HivemindTeaser() {
  return (
    <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
      <div style={{ color: "var(--fg-mute)", fontSize: "var(--t-xs-size)", marginBottom: "var(--s-4)" }}>
        ── 02 · HVM · HIVEMIND ──
      </div>
      <div style={{ fontSize: "var(--t-md-size)", color: "var(--fg-hi)", marginBottom: "var(--s-5)" }}>
        {HIVEMIND_TEASER.pitch}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "var(--s-4)", marginBottom: "var(--s-5)" }}>
        {HIVEMIND_TEASER.data.map((d) => (
          <div key={d.k}>
            <div style={{ color: "var(--fg-mute)", fontSize: "var(--t-xs-size)" }}>{d.k.toUpperCase()}</div>
            <div style={{ color: "var(--fg-hi)", textAlign: "right" }}>{d.v}</div>
          </div>
        ))}
      </div>
      <div style={{
        height: 220, maxHeight: 220,
        border: "var(--border-hair)", color: "var(--fg-mute)",
        display: "grid", placeItems: "center",
        marginBottom: "var(--s-5)",
      }}>
        [ demo pending ]
      </div>
      <Link href="/hivemind" style={{ color: "var(--accent)" }}>→ /hivemind · full brief</Link>
    </div>
  );
}
