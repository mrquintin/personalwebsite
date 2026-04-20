import Link from "next/link";
import { THESEUS_TEASER } from "@/content/panels";

// Mini SVG graph: 12 nodes on a circle with a few edges; tensions in --danger.
function MiniGraph() {
  const N = THESEUS_TEASER.graph.nodes;
  const r = 70;
  const cx = 100, cy = 100;
  const pts = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  return (
    <svg
      viewBox="0 0 200 200" width="100%" height="220"
      role="img"
      aria-label={`Principle graph: ${N} nodes, ${THESEUS_TEASER.graph.edges.length} edges, ${THESEUS_TEASER.graph.edges.filter(e => e.kind === "tension").length} tensions`}
    >
      {THESEUS_TEASER.graph.edges.map((e, i) => (
        <line
          key={i}
          x1={pts[e.a].x} y1={pts[e.a].y}
          x2={pts[e.b].x} y2={pts[e.b].y}
          stroke={e.kind === "tension" ? "var(--danger)" : "var(--fg-dim)"}
          strokeWidth={e.kind === "tension" ? 1.5 : 1}
        />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--fg)" />
      ))}
    </svg>
  );
}

export default function TheseusTeaser() {
  return (
    <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
      <div style={{ color: "var(--fg-mute)", fontSize: "var(--t-xs-size)", marginBottom: "var(--s-4)" }}>
        ── 04 · THS · THESEUS ──
      </div>
      <div style={{ marginBottom: "var(--s-5)", color: "var(--fg-hi)" }}>{THESEUS_TEASER.thesis}</div>
      <MiniGraph />
      <div style={{ marginTop: "var(--s-5)" }}>
        <a href={THESEUS_TEASER.external.href} target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>
          {THESEUS_TEASER.external.label} ↗
        </a>
      </div>
      <div style={{ marginTop: "var(--s-3)" }}>
        <Link href="/theseus" style={{ color: "var(--accent)" }}>→ /theseus · dossier</Link>
      </div>
    </div>
  );
}
