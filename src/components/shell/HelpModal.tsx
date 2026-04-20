"use client";
import { useEffect, useState } from "react";

const SHORTCUTS: { keys: string; what: string }[] = [
  { keys: "⌘K / Ctrl+K", what: "Open command palette" },
  { keys: "F1",          what: "Open this help" },
  { keys: "Esc",         what: "Close palette / collapse accordion to neutral" },
  { keys: "1 – 5",       what: "Expand accordion panel by index" },
  { keys: "← / →",       what: "Cycle accordion focus" },
  { keys: "Enter",       what: "Expand focused panel / run palette command" },
  { keys: "↑ / ↓",       what: "Navigate palette results" },
  { keys: "/ {nav,act,qry,prj,>}", what: "Scope palette filter" },
  { keys: "⌘P",          what: "Print current page" },
];

export default function HelpModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onOpen() { setOpen(true); }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("operator:open-help", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("operator:open-help", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 95,
        background: "rgba(0,0,0,0.55)",
        display: "grid", placeItems: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-1)",
          border: "var(--border-hair)",
          padding: "var(--s-5)",
          fontFamily: "var(--font-mono)",
          minWidth: 480,
          maxWidth: 640,
        }}
      >
        <div style={{ color: "var(--fg-mute)", marginBottom: "var(--s-4)" }}>
          ── KEYBOARD SHORTCUTS ──
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {SHORTCUTS.map((s) => (
              <tr key={s.keys}>
                <td style={{ color: "var(--accent)", paddingRight: "var(--s-5)", paddingBottom: "var(--s-2)", whiteSpace: "nowrap" }}>{s.keys}</td>
                <td style={{ color: "var(--fg)", paddingBottom: "var(--s-2)" }}>{s.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "var(--s-4)", color: "var(--fg-mute)", fontSize: "var(--t-xxs-size)" }}>
          Esc to close.
        </div>
      </div>
    </div>
  );
}
