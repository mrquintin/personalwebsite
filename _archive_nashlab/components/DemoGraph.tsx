"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { Scenario } from "@/lib/scenarios";

export type Phase = "idle" | "initial" | "critique" | "revise" | "aggregate" | "practicality" | "verdict" | "done";

type Props = {
  scenario: Scenario;
  phase: Phase;
  activeTheoristIdx: number | null;
  activeCritique: { fromId: string; toId: string } | null;
  activePragmaIdx: number | null;
  uniqueCount: number;
  feasibilityAvg: number;
  feasibilityThreshold: number;
  verdict: "PASS" | "VETO" | null;
};

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Idle",
  initial: "Theorists propose",
  critique: "Cross-critique",
  revise: "Revise",
  aggregate: "Monitor aggregates",
  practicality: "Practicality scores",
  verdict: "Verdict",
  done: "Complete",
};

function tx(arcStart: number, arcEnd: number, n: number, i: number): number {
  if (n === 1) return (arcStart + arcEnd) / 2;
  return arcStart + ((arcEnd - arcStart) * i) / (n - 1);
}

export default function DemoGraph(p: Props) {
  const { scenario, phase, activeTheoristIdx, activeCritique, activePragmaIdx, uniqueCount, feasibilityAvg, feasibilityThreshold, verdict } = p;
  const N = scenario.theorists.length;
  const M = scenario.pragmas.length;
  const monitorX = 500, monitorY = 280;

  const theoristPos = scenario.theorists.map((_, i) => ({ x: tx(90, 910, N, i), y: 70 }));
  const pragmaPos = scenario.pragmas.map((_, i) => ({ x: tx(180, 820, M, i), y: 490 }));

  return (
    <div className="relative w-full bg-ink-800 border border-ink-500 rounded-2xl overflow-hidden">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 text-xs">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-theory animate-pulse" />
        <span className="font-mono uppercase tracking-wider text-paper-muted">{PHASE_LABEL[phase]}</span>
      </div>

      <div className="absolute top-3 right-4 z-10 text-xs font-mono uppercase tracking-wider flex gap-4">
        <span>
          <span className="text-paper-dim">unique: </span>
          <span className="text-paper">{uniqueCount}</span>
        </span>
        <span>
          <span className="text-paper-dim">feasibility: </span>
          <span style={{ color: feasibilityAvg < feasibilityThreshold ? "var(--veto)" : "var(--pragma)" }}>
            {feasibilityAvg ? feasibilityAvg.toFixed(0) : "—"}/{feasibilityThreshold}
          </span>
        </span>
      </div>

      <svg viewBox="0 0 1000 560" className="w-full h-auto">
        <defs>
          <radialGradient id="monitor-halo">
            <stop offset="0%" stopColor="#7ba8c9" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7ba8c9" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* (i) theory↔theory critique edges (complete graph) */}
        <g opacity={phase === "critique" ? 0.35 : 0.08}>
          {scenario.theorists.flatMap((t, i) =>
            scenario.theorists.slice(i + 1).map((u, j) => {
              const a = theoristPos[i];
              const b = theoristPos[i + j + 1];
              const isActive =
                phase === "critique" &&
                activeCritique &&
                ((activeCritique.fromId === t.id && activeCritique.toId === u.id) ||
                 (activeCritique.fromId === u.id && activeCritique.toId === t.id));
              return (
                <line
                  key={`tt-${t.id}-${u.id}`}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={isActive ? "#c4b6e0" : "#3a3a3a"}
                  strokeWidth={isActive ? 1.5 : 0.6}
                />
              );
            })
          )}
        </g>

        {/* (ii) theory→monitor */}
        <g opacity={phase === "aggregate" ? 0.7 : 0.18}>
          {theoristPos.map((p, i) => (
            <line key={`tm-${i}`} x1={p.x} y1={p.y} x2={monitorX} y2={monitorY}
                  stroke="#7ba8c9" strokeWidth="0.6" />
          ))}
        </g>

        {/* (iii) monitor→pragma */}
        <g opacity={phase === "practicality" || phase === "verdict" ? 0.7 : 0.15}>
          {pragmaPos.map((p, i) => (
            <line key={`mp-${i}`} x1={monitorX} y1={monitorY} x2={p.x} y2={p.y}
                  stroke="#e0a674" strokeWidth="0.6" />
          ))}
        </g>

        {/* monitor halo + node */}
        <circle cx={monitorX} cy={monitorY} r="80" fill="url(#monitor-halo)" />
        <circle cx={monitorX} cy={monitorY} r="28" fill="#0a0a0a" stroke="#7ba8c9" strokeWidth="1.4" />
        <text x={monitorX} y={monitorY - 44} textAnchor="middle"
              className="font-mono" fontSize="11" fill="#7ba8c9" letterSpacing="2">MONITOR</text>
        <text x={monitorX} y={monitorY + 5} textAnchor="middle"
              className="font-mono" fontSize="10" fill="#c5beb0">aggregate · {uniqueCount}</text>

        {/* theorists */}
        {scenario.theorists.map((t, i) => {
          const isActive =
            (phase === "initial" || phase === "revise") && activeTheoristIdx === i;
          const r = isActive ? 16 : 10;
          return (
            <g key={t.id}>
              <circle cx={theoristPos[i].x} cy={theoristPos[i].y} r={r}
                      fill={isActive ? "#c4b6e0" : "transparent"}
                      stroke="#c4b6e0" strokeWidth="1.2"
                      style={{ transition: "r 200ms ease, fill 200ms ease" }} />
              <text x={theoristPos[i].x} y={theoristPos[i].y - 22} textAnchor="middle"
                    className="font-display" fontSize="14" fill="#efe9dc">{t.name}</text>
              <text x={theoristPos[i].x} y={theoristPos[i].y + 30} textAnchor="middle"
                    className="font-mono" fontSize="9" fill="#8a857a"
                    style={{ textTransform: "uppercase", letterSpacing: 1 }}>{t.id}</text>
            </g>
          );
        })}

        {/* pragmas */}
        {scenario.pragmas.map((g, i) => {
          const isActive = phase === "practicality" && activePragmaIdx === i;
          return (
            <g key={g.id}>
              <rect x={pragmaPos[i].x - 12} y={pragmaPos[i].y - 12} width="24" height="24"
                    fill={isActive ? "#e0a674" : "transparent"}
                    stroke="#e0a674" strokeWidth="1.2"
                    style={{ transition: "fill 200ms ease" }} />
              <text x={pragmaPos[i].x} y={pragmaPos[i].y + 38} textAnchor="middle"
                    className="font-mono" fontSize="9" fill="#8a857a"
                    style={{ textTransform: "uppercase", letterSpacing: 1 }}>{g.label.split(" ")[0]}</text>
            </g>
          );
        })}

        <AnimatePresence>
          {verdict && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <rect x={monitorX - 60} y={monitorY + 60} width="120" height="32" rx="16"
                    fill={verdict === "PASS" ? "#e0a674" : "#cc6b6b"} />
              <text x={monitorX} y={monitorY + 80} textAnchor="middle"
                    className="font-mono" fontSize="13" fill="#0a0a0a"
                    style={{ textTransform: "uppercase", letterSpacing: 2 }}>{verdict}</text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
