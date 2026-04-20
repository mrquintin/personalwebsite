"use client";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import { PANELS } from "@/lib/panels";
import Panel from "./Panel";
import { useHotkey } from "@/lib/hotkeys/useHotkey";

type Props = {
  initialExpandedIndex?: number | null;   // 1..5 or null for neutral
  panelContent: Record<string, ReactNode>; // keyed by panel code
};

type State = { mode: "neutral" } | { mode: "expanded"; index: number };

export default function Accordion({ initialExpandedIndex = 1, panelContent }: Props) {
  const [state, setState] = useState<State>(
    initialExpandedIndex == null ? { mode: "neutral" } : { mode: "expanded", index: initialExpandedIndex },
  );
  const [focusIndex, setFocusIndex] = useState(initialExpandedIndex ?? 1);

  const setHash = useCallback((idx: number | null) => {
    if (typeof window === "undefined") return;
    const newHash = idx == null ? "" : `#${String(idx).padStart(2, "0")}`;
    if (window.location.hash !== newHash) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${newHash}`);
    }
  }, []);

  const expand = useCallback((idx: number) => {
    setState({ mode: "expanded", index: idx });
    setHash(idx);
  }, [setHash]);

  const collapseToNeutral = useCallback(() => {
    setState({ mode: "neutral" });
    setHash(null);
  }, [setHash]);

  // hash sync on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.location.hash.match(/^#(\d{2})$/);
    if (m) {
      const idx = parseInt(m[1], 10);
      if (idx >= 1 && idx <= PANELS.length) {
        setState({ mode: "expanded", index: idx });
        setFocusIndex(idx);
      }
    }
  }, []);

  // keyboard
  useHotkey({ key: "ArrowRight" }, () => setFocusIndex((i) => Math.min(PANELS.length, i + 1)));
  useHotkey({ key: "ArrowLeft" },  () => setFocusIndex((i) => Math.max(1, i - 1)));
  useHotkey({ key: "Escape" }, () => collapseToNeutral());
  useHotkey({ key: "Enter" }, () => expand(focusIndex));
  for (const n of [1, 2, 3, 4, 5]) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHotkey({ key: String(n) }, () => expand(n));
  }

  return (
    <div
      className="accordion"
      role="tablist"
      aria-label="panels"
      style={{
        display: "flex",
        height: "calc(100vh - var(--statusbar-h))",
        width: "100%",
        background: "var(--bg-1)",
      }}
    >
      {PANELS.map((p) => {
        const isExpanded = state.mode === "expanded" && state.index === p.index;
        const visualState: "expanded" | "neutral" | "collapsed" =
          state.mode === "neutral" ? "neutral" : isExpanded ? "expanded" : "collapsed";
        return (
          <Panel
            key={p.code}
            panel={p}
            state={visualState}
            onActivate={() => (isExpanded ? collapseToNeutral() : expand(p.index))}
            onFocusInto={() => setFocusIndex(p.index)}
          >
            {panelContent[p.code]}
          </Panel>
        );
      })}
    </div>
  );
}
