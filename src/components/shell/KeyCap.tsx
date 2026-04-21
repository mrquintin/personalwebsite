"use client";
// R04: ⌘K affordance that replaces the status bar's hint.
// Fixed top-right. Click opens the palette (via dispatched event so we
// don't have to wire a callback through the Shell tree).
import { useState, useEffect } from "react";

export default function KeyCap() {
  const [hidden, setHidden] = useState(false);

  // Hide while user is typing into a non-palette input — chrome should
  // not compete with the field. Restore on blur.
  useEffect(() => {
    function onFocusIn(e: FocusEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const tag = t.tagName;
      const inPalette = !!t.closest('[role="dialog"]');
      if (!inPalette && (tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable)) {
        setHidden(true);
      }
    }
    function onFocusOut() { setHidden(false); }
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  function open() {
    // Reuse the same hotkey-event dispatch that Cmd+K uses internally.
    // Palette listens via useHotkey on "k" with meta:true; we simulate.
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  }

  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={open}
      className="keycap"
      aria-label="Open command palette"
      title="Command palette"
    >
      ⌘K
    </button>
  );
}
