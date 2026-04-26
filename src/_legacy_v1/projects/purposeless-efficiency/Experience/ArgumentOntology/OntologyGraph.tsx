"use client";
import { useState } from "react";
import type { Claim, ClaimEdge } from "@/lib/prp/claims";

type Props = {
  claims: Claim[];
  edges: ClaimEdge[];
  view: "spine" | "all";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hostWidthPx: number;
  reducedMotion: boolean;
};

export default function OntologyGraph(p: Props) {
  const visibleClaims = p.view === "spine" ? p.claims.filter((c) => c.inSpine) : p.claims;
  const visibleIds = new Set(visibleClaims.map((c) => c.id));
  const visibleEdges = p.edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to));
  const narrow = p.hostWidthPx < 640;
  const [hover, setHover] = useState<string | null>(null);
  const focal = hover ?? p.selectedId;

  const edgeIsLit = (e: ClaimEdge) => focal != null && (e.from === focal || e.to === focal);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Argument ontology — ${visibleClaims.length} claims, ${visibleEdges.length} edges`}
      style={{ width: "100%", height: "100%", maxHeight: 520 }}
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fg-mute)" />
        </marker>
      </defs>
      {visibleEdges.map((e, i) => {
        const a = visibleClaims.find((c) => c.id === e.from)!;
        const b = visibleClaims.find((c) => c.id === e.to)!;
        const A = narrow ? a.narrowCoords : a.wideCoords;
        const B = narrow ? b.narrowCoords : b.wideCoords;
        const lit = edgeIsLit(e);
        return (
          <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke={lit ? "var(--accent)" : "var(--rule)"}
            strokeWidth={lit ? 0.4 : 0.18}
            opacity={focal && !lit ? 0.3 : 0.85}
            markerEnd="url(#arrow)" />
        );
      })}
      {visibleClaims.map((c) => {
        const pos = narrow ? c.narrowCoords : c.wideCoords;
        const isSelected = p.selectedId === c.id;
        const stub = !c.authorApproved;
        return (
          <g key={c.id} role="button" tabIndex={0}
            aria-label={`${c.name} (${c.kind})`}
            onClick={() => p.onSelect(c.id === p.selectedId ? null : c.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.onSelect(c.id); }
            }}
            onMouseEnter={() => setHover(c.id)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer", outline: "none" }}
          >
            <circle cx={pos.x} cy={pos.y}
              r={c.inSpine ? 2.6 : 1.5}
              fill={stub ? "var(--bg-3)" : isSelected ? "var(--accent)" : "var(--bg-2)"}
              stroke={isSelected ? "var(--accent)" : c.inSpine ? "var(--fg)" : "var(--fg-mute)"}
              strokeWidth={c.inSpine ? 0.4 : 0.25} />
            <text x={pos.x} y={pos.y - (c.inSpine ? 3.5 : 2.4)} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize={c.inSpine ? "2.4" : "1.6"}
              fill={stub ? "var(--fg-dim)" : "var(--fg)"} pointerEvents="none">
              {c.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
