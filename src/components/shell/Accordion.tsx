"use client";
import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { PANELS, PANEL_LOG, type PanelDef } from "@/lib/panels";
import Panel from "./Panel";
import { useHotkey } from "@/lib/hotkeys/useHotkey";

type Props = {
  initialExpandedIndex?: number | null;   // 1..6 or null for neutral
  panelContent: Record<string, ReactNode>; // keyed by panel code
};

type State = { mode: "neutral" } | { mode: "expanded"; index: number };

const CHANNEL = "operator.accordion";

export default function Accordion({ initialExpandedIndex = 1, panelContent }: Props) {
  const [state, setState] = useState<State>(
    initialExpandedIndex == null ? { mode: "neutral" } : { mode: "expanded", index: initialExpandedIndex },
  );
  const [focusIndex, setFocusIndex] = useState(initialExpandedIndex ?? 1);
  const [showLog, setShowLog] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const localOriginRef = useRef(true);

  const list: PanelDef[] = showLog ? [...PANELS, PANEL_LOG] : PANELS;

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
    if (localOriginRef.current) channelRef.current?.postMessage({ type: "expand", idx });
  }, [setHash]);

  const collapseToNeutral = useCallback(() => {
    setState({ mode: "neutral" });
    setHash(null);
    if (localOriginRef.current) channelRef.current?.postMessage({ type: "neutral" });
  }, [setHash]);

  // hash sync on mount + LOG-panel decision based on viewport
  useEffect(() => {
    if (typeof window === "undefined") return;
    setShowLog(window.matchMedia("(min-width: 1680px)").matches);
    const m = window.location.hash.match(/^#(\d{2})$/);
    if (m) {
      const idx = parseInt(m[1], 10);
      if (idx >= 1 && idx <= 6) {
        setState({ mode: "expanded", index: idx });
        setFocusIndex(idx);
      }
    }
    // Listen for cross-tab changes
    if ("BroadcastChannel" in window) {
      const ch = new BroadcastChannel(CHANNEL);
      channelRef.current = ch;
      ch.onmessage = (ev) => {
        localOriginRef.current = false;
        if (ev.data?.type === "expand" && typeof ev.data.idx === "number") {
          setState({ mode: "expanded", index: ev.data.idx });
          setHash(ev.data.idx);
        } else if (ev.data?.type === "neutral") {
          setState({ mode: "neutral" });
          setHash(null);
        }
        localOriginRef.current = true;
      };
      return () => ch.close();
    }
  }, [setHash]);

  useHotkey({ key: "ArrowRight" }, () => setFocusIndex((i) => Math.min(list.length, i + 1)));
  useHotkey({ key: "ArrowLeft" },  () => setFocusIndex((i) => Math.max(1, i - 1)));
  useHotkey({ key: "Escape" }, () => collapseToNeutral());
  useHotkey({ key: "Enter" }, () => expand(focusIndex));
  useHotkey({ key: "1" }, () => expand(1));
  useHotkey({ key: "2" }, () => expand(2));
  useHotkey({ key: "3" }, () => expand(3));
  useHotkey({ key: "4" }, () => expand(4));
  useHotkey({ key: "5" }, () => expand(5));
  useHotkey({ key: "6", enabled: showLog }, () => expand(6));

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
      {list.map((p) => {
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
            onHover={() => {
              if (typeof window === "undefined") return;
              if (!window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)").matches) return;
              if (state.mode === "expanded" && state.index === p.index) return;
              expand(p.index);
            }}
          >
            {panelContent[p.code]}
          </Panel>
        );
      })}
    </div>
  );
}
