"use client";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const SHORTCUTS: { keys: string; what: string }[] = [
  { keys: "⌘K / Ctrl+K", what: "Open command palette" },
  { keys: "F1",          what: "Open this help" },
  { keys: "Esc",         what: "Close palette / collapse accordion to neutral" },
  { keys: "1 – 5",       what: "Expand accordion panel by index" },
  { keys: "← / →",       what: "Cycle accordion focus" },
  { keys: "Enter",       what: "Expand focused panel / run palette command" },
  { keys: "↑ / ↓",       what: "Navigate palette results" },
  { keys: "/{nav,act,qry,prj,>}", what: "Scope palette filter" },
  { keys: "⌘P",          what: "Print current page" },
  { keys: "⌘+Shift+T",   what: "Hold for ASCII page outline overlay" },
];

export default function HelpModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onOpen() { setOpen(true); }
    window.addEventListener("operator:open-help", onOpen);
    return () => window.removeEventListener("operator:open-help", onOpen);
  }, []);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 95 }} />
        <Dialog.Content
          style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            background: "var(--bg-1)", border: "var(--border-hair)", padding: "var(--s-5)",
            fontFamily: "var(--font-mono)", minWidth: 480, maxWidth: 640, zIndex: 96,
          }}
        >
          <VisuallyHidden asChild><Dialog.Title>Keyboard shortcuts</Dialog.Title></VisuallyHidden>
          <VisuallyHidden asChild><Dialog.Description>Site-wide keyboard shortcuts.</Dialog.Description></VisuallyHidden>
          <div style={{ color: "var(--fg-mute)", marginBottom: "var(--s-4)" }}>── KEYBOARD SHORTCUTS ──</div>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
