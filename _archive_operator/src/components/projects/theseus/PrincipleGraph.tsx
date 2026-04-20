"use client";
import { useMemo, useState } from "react";
import type { Principle } from "@/content/projects/theseus/principles";

type Props = { principles: Principle[] };

// Simple radial layout — deterministic, no force-tick.
export default function PrincipleGraph({ principles }: Props) {
  const [tensionsOnly, setTensionsOnly] = useState(false);
  const [pinned, setPinned] = useState<string | null>(null);

  const positions = useMemo(() => {
    const N = principles.length;
    const r = 220;
    const cx = 320, cy = 240;
    return Object.fromEntries(
      principles.map((p, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        return [p.id, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }];
      })
    );
  }, [principles]);

  const edges = useMemo(() => {
    const list: { a: string; b: string; kind: "support" | "tension" }[] = [];
    for (const p of principles) {
      for (const s of p.supports) list.push({ a: p.id, b: s, kind: "support" });
      for (const t of p.tensions) list.push({ a: p.id, b: t, kind: "tension" });
    }
    return list;
  }, [principles]);

  const tensionsCount = edges.filter((e) => e.kind === "tension").length;

  return (
    <div>
      <div style={{ display: "flex", gap: "var(--s-4)", marginBottom: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "var(--t-xs-size)" }}>
        <button
          onClick={() => setTensionsOnly((v) => !v)}
          style={{ color: tensionsOnly ? "var(--accent)" : "var(--fg-mute)", cursor: "pointer" }}
        >
          [t] tensions only
        </button>
        <span style={{ color: "var(--fg-mute)" }}>{principles.length} principles · {edges.length} edges · {tensionsCount} contradictions</span>
      </div>
      <svg
        viewBox="0 0 640 480"
        width="100%"
        style={{ border: "var(--border-hair)", background: "var(--bg-1)", aspectRatio: "16/9" }}
        role="img"
        aria-label={`Principle graph: ${principles.length} nodes, ${edges.length} edges, ${tensionsCount} contradictions.`}
      >
        {edges.map((e, i) => {
          const A = positions[e.a], B = positions[e.b];
          if (!A || !B) return null;
          const isTension = e.kind === "tension";
          const opacity = tensionsOnly && !isTension ? 0.15 : 0.85;
          return (
            <line
              key={i}
              x1={A.x} y1={A.y} x2={B.x} y2={B.y}
              stroke={isTension ? "var(--danger)" : "var(--fg-dim)"}
              strokeWidth={isTension ? 1.5 : 1}
              opacity={opacity}
            />
          );
        })}
        {principles.map((p) => {
          const pos = positions[p.id];
          const isPinned = pinned === p.id;
          return (
            <g key={p.id} onClick={() => setPinned(isPinned ? null : p.id)} style={{ cursor: "pointer" }}>
              <circle
                cx={pos.x} cy={pos.y}
                r={isPinned ? 6 : 4}
                fill={isPinned ? "var(--accent)" : "var(--fg)"}
              />
              <text
                x={pos.x + 8} y={pos.y - 6}
                fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-dim)"
              >
                {p.id}
              </text>
            </g>
          );
        })}
      </svg>
      {pinned && (
        <div style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)", padding: "var(--s-3)", border: "var(--border-hair)" }}>
          <strong style={{ color: "var(--accent)" }}>{pinned}</strong> — {principles.find((p) => p.id === pinned)?.text}
        </div>
      )}
    </div>
  );
}
