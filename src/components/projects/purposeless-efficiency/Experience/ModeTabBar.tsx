"use client";
import { useRef } from "react";
import { usePrp, type Mode } from "@/stores/prpExperience";

const TABS: Array<{ id: Mode; n: string; name: string }> = [
  { id: "ontology",   n: "1", name: "ARGUMENT ONTOLOGY" },
  { id: "quadrant",   n: "2", name: "PE QUADRANT" },
  { id: "diamond",    n: "3", name: "DIAMOND METHOD" },
  { id: "objections", n: "4", name: "OBJECTIONS" },
  { id: "atlas",      n: "5", name: "INTELLECTUAL ATLAS" },
];

export default function ModeTabBar({ regime }: { regime: "narrow" | "standard" | "wide" }) {
  const mode = usePrp((s) => s.mode);
  const setMode = usePrp((s) => s.setMode);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKey(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = (idx + dir + TABS.length) % TABS.length;
      refs.current[next]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setMode(TABS[idx].id);
    }
  }

  return (
    <nav role="tablist" aria-label="purposeless efficiency modes"
      style={{
        display: "flex", overflowX: regime === "narrow" ? "auto" : "visible",
        scrollSnapType: regime === "narrow" ? "x mandatory" : undefined,
        borderBottom: "var(--border-hair)", padding: "0 var(--s-3)",
        gap: regime === "narrow" ? "var(--s-3)" : "var(--s-5)",
      }}
    >
      {TABS.map((t, i) => {
        const active = mode === t.id;
        const compact = regime === "narrow";
        return (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`prp-tab-${t.id}`}
            aria-selected={active}
            aria-controls={`prp-panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => setMode(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            style={{
              padding: "12px 6px",
              fontFamily: "inherit", color: active ? "var(--fg)" : "var(--fg-dim)",
              borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
              background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
              scrollSnapAlign: compact ? "start" : undefined,
              display: "inline-flex", gap: "8px", alignItems: "baseline",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: active ? "var(--accent)" : "var(--fg-mute)" }}>{t.n}</span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: compact ? "12px" : "14px", letterSpacing: "0.02em" }}>{t.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
