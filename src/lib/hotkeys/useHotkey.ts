"use client";
import { useEffect } from "react";

export type HotkeySpec = {
  key: string;                 // case-insensitive single key, e.g. "k", "Escape", "ArrowDown"
  meta?: boolean;              // ⌘ on macOS / Ctrl on others (treated as either)
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
};

export function useHotkey(spec: HotkeySpec, handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    if (spec.enabled === false) return;
    function onKey(e: KeyboardEvent) {
      const meta = spec.meta ? (e.metaKey || e.ctrlKey) : true;
      const shift = spec.shift !== undefined ? e.shiftKey === spec.shift : true;
      const alt = spec.alt !== undefined ? e.altKey === spec.alt : true;
      if (!meta || !shift || !alt) return;
      if (e.key.toLowerCase() !== spec.key.toLowerCase()) return;
      if (spec.preventDefault) e.preventDefault();
      handler(e);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spec.key, spec.meta, spec.shift, spec.alt, spec.preventDefault, spec.enabled, handler]);
}
