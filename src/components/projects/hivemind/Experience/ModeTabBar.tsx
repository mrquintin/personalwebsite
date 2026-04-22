"use client";
import { useRef } from "react";
import { useHvm, type Mode } from "@/stores/hivemindExperience";

const TABS: Array<{ id: Mode; n: string; name: string }> = [
  { id: "theater",   n: "1", name: "DELIBERATION" },
  { id: "knobs",     n: "2", name: "KNOBS" },
  { id: "failures",  n: "3", name: "FOUR FAILURES" },
  { id: "pipeline",  n: "4", name: "PIPELINE" },
  { id: "audit",     n: "5", name: "AUDIT" },
];

export default function ModeTabBar({ regime }: { regime: "narrow" | "standard" | "wide" }) {
  const mode = useHvm((s) => s.mode);
  const setMode = useHvm((s) => s.setMode);
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
    <nav role="tablist" aria-label="hivemind modes"
      style={{
        display: "flex",
        overflowX: regime === "narrow" ? "auto" : "visible",
        scrollSnapType: regime === "narrow" ? "x mandatory" : undefined,
        borderBottom: "var(--border-hair)", padding: "0 var(--s-3)",
        gap: regime === "narrow" ? "var(--s-3)" : "var(--s-5)",
      }}>
      {TABS.map((t, i) => {
        const active = mode === t.id;
        const compact = regime === "narrow";
        return (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`hvm-tab-${t.id}`}
            aria-selected={active}
            aria-controls={`hvm-panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => setMode(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            style={{
              padding: "12px 6px",
              color: active ? "var(--fg)" : "var(--fg-dim)",
              borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
              background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
              scrollSnapAlign: compact ? "start" : undefined,
              display: "inline-flex", gap: "8px", alignItems: "baseline",
            }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: active ? "var(--accent)" : "var(--fg-mute)" }}>{t.n}</span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: compact ? "12px" : "14px", letterSpacing: "0.02em" }}>{t.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
