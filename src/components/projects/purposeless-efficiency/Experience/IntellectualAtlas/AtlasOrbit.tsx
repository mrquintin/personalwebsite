"use client";
import { THINKERS, type Thinker } from "@/lib/prp/thinkers";

const STANCE_COLOR: Record<Thinker["stance"], string> = {
  ENDORSED: "var(--ok)", ENGAGED: "var(--accent)",
  REBUKED: "var(--danger)", DEFENDED: "var(--accent-dim)",
};

export default function AtlasOrbit({
  onOpen, focusId, hostWidthPx,
}: {
  onOpen: (id: string) => void;
  focusId: string | null;
  hostWidthPx: number;
}) {
  const narrow = hostWidthPx < 640;

  if (narrow) {
    // Stacked list grouped by stance
    const stances: Thinker["stance"][] = ["ENDORSED", "ENGAGED", "REBUKED", "DEFENDED"];
    return (
      <div style={{ padding: "var(--s-3)" }}>
        {stances.map((s) => {
          const ts = THINKERS.filter((t) => t.stance === s).sort((a, b) => a.narrowIndex - b.narrowIndex);
          if (!ts.length) return null;
          return (
            <section key={s} style={{ marginBottom: "var(--s-4)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px",
                             color: STANCE_COLOR[s], letterSpacing: "0.12em", marginBottom: 4 }}>
                {s}
              </div>
              <ul>
                {ts.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => onOpen(t.id)}
                      style={{
                        background: "transparent", color: focusId === t.id ? "var(--accent)" : "var(--fg)",
                        cursor: "pointer", fontFamily: "var(--font-serif)", fontSize: "16px",
                        padding: "4px 0",
                      }}>{t.name}</button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
      role="img" aria-label="Atlas orbit"
      style={{ width: "100%", height: "100%", maxHeight: 520 }}>
      {/* center label */}
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
            fontFamily="var(--font-serif)" fontSize="3.5" fill="var(--fg-mute)">
        Purposeless Efficiency
      </text>
      {THINKERS.map((t) => (
        <g key={t.id} role="button" tabIndex={0}
          onClick={() => onOpen(t.id)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(t.id); } }}
          aria-label={`${t.name}, ${t.stance}`}
          style={{ cursor: "pointer" }}>
          <circle cx={t.orbitCoords.x} cy={t.orbitCoords.y} r="1.6"
            fill={focusId === t.id ? "var(--accent)" : STANCE_COLOR[t.stance]} />
          <text x={t.orbitCoords.x} y={t.orbitCoords.y - 2.6} textAnchor="middle"
            fontFamily="var(--font-serif)" fontSize="2.6" fill="var(--fg)">
            {t.name.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}
