"use client";
import type { PanelDef } from "@/lib/panels";

type Props = {
  panel: PanelDef;
  expanded: boolean;
  onActivate: () => void;
  onFocusInto: () => void;
};

// Spine content: ONLY the vertical title. No number, no three-letter code.
// Title is the exclusive identifier.
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
        cursor: "pointer",
      }}
    >
      <span
        className="spine-content"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          paddingTop: "var(--s-5)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            whiteSpace: "pre",
            fontSize: "var(--t-xs-size)",
            color: "var(--fg-dim)",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "0.04em",
          }}
        >
          {titleStack}
        </span>
      </span>
      <span className="sr-only">Open panel {panel.title}</span>
    </button>
  );
}
