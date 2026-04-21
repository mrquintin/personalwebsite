"use client";
import type { PanelDef } from "@/lib/panels";

type Props = {
  panel: PanelDef;
  expanded: boolean;
  onActivate: () => void;
  onFocusInto: () => void;
};

// R02: label fades in place when expanded — no travel, no morph.
// R03: three-letter code is no longer rendered. Only the panel number
// (top) and the vertical title (base) remain.
export default function PanelSpine({ panel, expanded, onActivate, onFocusInto }: Props) {
  const titleStack = panel.title.toUpperCase().split("").join("\n");
  return (
    <button
      type="button"
      role="button"
      aria-expanded={expanded}
      aria-controls={`panel-body-${panel.id}`}
      onClick={onActivate}
      onFocus={onFocusInto}
      className="panel-spine"
      style={{
        background: "transparent",
        color: "var(--fg-mute)",
        fontFamily: "var(--font-mono)",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--s-4) 0",
        cursor: "pointer",
      }}
    >
      <span className="spine-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", height: "100%", width: "100%", padding: "var(--s-4) 0" }}>
        <span style={{ fontSize: "var(--t-sm-size)", color: "var(--fg-dim)" }}>{panel.id}</span>
        <span
          aria-hidden="true"
          style={{
            whiteSpace: "pre",
            fontSize: "var(--t-xxs-size)",
            color: "var(--fg-dim)",
            textAlign: "center",
            lineHeight: 1.05,
            letterSpacing: "0.04em",
          }}
        >
          {titleStack}
        </span>
      </span>
      <span className="sr-only">Open panel {panel.id} — {panel.title}</span>
    </button>
  );
}
