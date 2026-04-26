"use client";
import { useEffect, useRef, type ReactNode } from "react";
import type { PanelDef } from "@/lib/panels";
import PanelSpine from "./PanelSpine";

type Props = {
  panel: PanelDef;
  state: "collapsed" | "neutral" | "expanded";
  onActivate: () => void;
  onFocusInto: () => void;
  onHover?: () => void;
  children: ReactNode;
};

// R01: render the body content at all times so layout settles before the
// width animation begins. Visibility/opacity is driven by `data-state`
// (see globals.css `.panel-body` selector). No flex/grid is animated
// inside the body. The `is-animating` class adds will-change while the
// transition is running.
export default function Panel({ panel, state, onActivate, onFocusInto, onHover, children }: Props) {
  const expanded = state === "expanded";
  const ref = useRef<HTMLElement | null>(null);

  // Toggle will-change surgically.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("is-animating");
    const t = setTimeout(() => el.classList.remove("is-animating"), 540);
    return () => { clearTimeout(t); el.classList.remove("is-animating"); };
  }, [state]);

  return (
    <section
      ref={ref}
      role="region"
      aria-labelledby={`spine-label-${panel.id}`}
      id={`panel-body-${panel.id}`}
      className="panel"
      data-state={state}
      onMouseEnter={onHover}
      style={{
        flex: state === "expanded" ? "1 1 0" : state === "neutral" ? "1 1 0" : "0 0 80px",
        minWidth: state === "collapsed" ? 56 : 80,
        background: "var(--bg-1)",
        borderRight: "var(--border-hair)",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          width: state === "expanded" ? 56 : "100%",
          borderRight: state === "expanded" ? "var(--border-hair)" : "none",
          flex: state === "expanded" ? "0 0 56px" : "1 1 100%",
        }}
      >
        <span id={`spine-label-${panel.id}`} className="sr-only">
          Panel {panel.id} — {panel.title}
        </span>
        <PanelSpine
          panel={panel}
          expanded={expanded}
          onActivate={onActivate}
          onFocusInto={onFocusInto}
        />
      </div>
      <div
        className="panel-body"
        style={{
          flex: 1,
          padding: panel.flushBody ? 0 : "var(--s-6)",
          overflow: panel.flushBody ? "hidden" : "auto",
        }}
        aria-hidden={!expanded}
      >
        {/* Body always mounted so layout is settled BEFORE width animates.
            R01: the body is hidden via opacity/pointer-events when not expanded;
            collapsed/neutral panels still measure but don't display. */}
        {children}
      </div>
    </section>
  );
}
