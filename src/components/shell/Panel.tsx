"use client";
import type { ReactNode } from "react";
import type { PanelDef } from "@/lib/panels";
import PanelSpine from "./PanelSpine";

type Props = {
  panel: PanelDef;
  state: "collapsed" | "neutral" | "expanded";
  onActivate: () => void;
  onFocusInto: () => void;
  children: ReactNode;
};

export default function Panel({ panel, state, onActivate, onFocusInto, children }: Props) {
  const expanded = state === "expanded";
  return (
    <section
      role="region"
      aria-labelledby={`spine-label-${panel.code}`}
      id={`panel-body-${panel.code}`}
      className="panel"
      style={{
        flex: state === "expanded" ? "1 1 0" : state === "neutral" ? "1 1 0" : "0 0 80px",
        minWidth: state === "collapsed" ? 56 : 80,
        background: "var(--bg-1)",
        borderRight: "var(--border-hair)",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "flex-basis var(--d-norm) var(--ease)",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div style={{ width: state === "expanded" ? 56 : "100%", borderRight: state === "expanded" ? "var(--border-hair)" : "none" }}>
        <span id={`spine-label-${panel.code}`} className="sr-only">
          Panel {panel.id} {panel.code} — {panel.title}
        </span>
        <PanelSpine
          panel={panel}
          expanded={expanded}
          onActivate={onActivate}
          onFocusInto={onFocusInto}
        />
      </div>
      {state === "expanded" && (
        <div
          className="panel-body"
          style={{
            flex: 1,
            padding: "var(--s-6)",
            overflow: "auto",
            animation: "operator-fade-up var(--d-norm) var(--ease) 120ms both",
          }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
