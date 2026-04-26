"use client";
import { useRef } from "react";
import { useHvm, type Mode } from "@/stores/hivemindExperience";
import { useCe, type CeMode } from "@/stores/coherenceEngineExperience";

type TabId = Mode | CeMode;

const STRATEGIC_TABS: Array<{ id: Mode; n: string; name: string; face: "strategic" }> = [
  { id: "theater",   n: "1", name: "DELIBERATION", face: "strategic" },
  { id: "knobs",     n: "2", name: "KNOBS", face: "strategic" },
  { id: "failures",  n: "3", name: "FOUR FAILURES", face: "strategic" },
  { id: "pipeline",  n: "4", name: "PIPELINE", face: "strategic" },
  { id: "audit",     n: "5", name: "AUDIT", face: "strategic" },
];

const TECHNICAL_TABS: Array<{ id: CeMode; n: string; name: string; face: "technical" }> = [
  { id: "layers",   n: "6", name: "LAYERS", face: "technical" },
  { id: "cosine",   n: "7", name: "COSINE", face: "technical" },
  { id: "compare",  n: "8", name: "COMPARE", face: "technical" },
  { id: "gates",    n: "9", name: "GATES", face: "technical" },
  { id: "audit",    n: "0", name: "CE-AUDIT", face: "technical" },
];

type TabRecord = (typeof STRATEGIC_TABS)[number] | (typeof TECHNICAL_TABS)[number];
const ALL_TABS: TabRecord[] = [...STRATEGIC_TABS, ...TECHNICAL_TABS];

export default function ModeTabBar({ regime }: { regime: "narrow" | "standard" | "wide" }) {
  const hvmMode = useHvm((s) => s.mode);
  const setHvmMode = useHvm((s) => s.setMode);
  const ceMode = useCe((s) => s.mode);
  const setCeMode = useCe((s) => s.setMode);
  const ceFaceActive = useCe.getState; // we'll determine via a separate face state below
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  // active tab id: a tab is active iff (face matches the project's active face)
  // For simplicity, the panel tracks active face via a small state on the CE store?
  // Use a derived approach: the CE store's mode controls the technical face;
  // the HVM store's mode controls the strategic face. The "currently displayed"
  // face is whichever was most recently set. We track this via window.* not store
  // to keep store boundaries clean. Simpler: an "active face" lives in the store.
  // For now, reuse a simple module-local state via sessionStorage to determine
  // which face was selected most recently; default to strategic if both are at
  // their initial values.
  const activeFace = getActiveFace();

  function activeIdFor(face: "strategic" | "technical"): TabId {
    return face === "strategic" ? hvmMode : ceMode;
  }

  function isActive(t: TabRecord): boolean {
    if (t.face !== activeFace) return false;
    return activeIdFor(activeFace) === t.id;
  }

  function activate(t: TabRecord) {
    if (t.face === "strategic") { setHvmMode(t.id as Mode); setActiveFace("strategic"); }
    else { setCeMode(t.id as CeMode); setActiveFace("technical"); }
  }

  function onKey(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = (idx + dir + ALL_TABS.length) % ALL_TABS.length;
      refs.current[next]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate(ALL_TABS[idx]);
    }
  }

  return (
    <nav role="tablist" aria-label="hivemind modes"
      style={{
        display: "flex",
        overflowX: "auto",
        scrollSnapType: regime === "narrow" ? "x mandatory" : undefined,
        borderBottom: "var(--border-hair)", padding: "0 var(--s-3)",
        gap: regime === "narrow" ? "var(--s-2)" : "var(--s-4)",
      }}>
      {ALL_TABS.map((t, i) => {
        const active = isActive(t);
        const compact = regime === "narrow";
        const isFaceBoundary = i === 5;
        return (
          <span key={`${t.face}-${t.id}`} style={{ display: "inline-flex", borderLeft: isFaceBoundary ? "var(--border-hair)" : undefined, paddingLeft: isFaceBoundary ? "var(--s-3)" : undefined, marginLeft: isFaceBoundary ? "var(--s-2)" : undefined }}>
            <button
              ref={(el) => { refs.current[i] = el; }}
              role="tab"
              id={`hvm-tab-${t.face}-${t.id}`}
              aria-selected={active}
              aria-controls={`hvm-panel-${t.face}-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => activate(t)}
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
              <span style={{ fontFamily: "var(--font-serif)", fontSize: compact ? "12px" : "13px", letterSpacing: "0.02em" }}>{t.name}</span>
            </button>
          </span>
        );
      })}
    </nav>
  );
}

// Lightweight active-face tracking. The HVM panel renders one face at a time;
// activating a tab on the OTHER face switches the face. Stored in sessionStorage
// so it survives mode flips within the same session.
const FACE_KEY = "hvm.activeFace";
let memoryFace: "strategic" | "technical" | null = null;
function getActiveFace(): "strategic" | "technical" {
  if (typeof window === "undefined") return "strategic";
  if (memoryFace) return memoryFace;
  const v = sessionStorage.getItem(FACE_KEY);
  return v === "technical" ? "technical" : "strategic";
}
function setActiveFace(f: "strategic" | "technical") {
  memoryFace = f;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(FACE_KEY, f);
    window.dispatchEvent(new CustomEvent("hvm:face-change", { detail: f }));
  }
}

export { getActiveFace, setActiveFace };
