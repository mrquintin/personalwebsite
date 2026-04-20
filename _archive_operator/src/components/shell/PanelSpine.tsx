"use client";
import type { PanelDef } from "@/lib/panels";

type Props = {
  panel: PanelDef;
  expanded: boolean;
  onActivate: () => void;
  onFocusInto: () => void;
};

export default function PanelSpine({ panel, expanded, onActivate, onFocusInto }: Props) {
  const titleStack = panel.title.toUpperCase().split("").join("\n");
  return (
    <button
      type="button"
      role="button"
      aria-expanded={expanded}
      aria-controls={`panel-body-${panel.code}`}
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
      <span style={{ fontSize: "var(--t-sm-size)", color: "var(--fg-dim)" }}>{panel.id}</span>
      <span
        aria-hidden="true"
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          letterSpacing: "0.15em",
          fontSize: "var(--t-sm-size)",
          color: "var(--fg-mute)",
        }}
      >
        {panel.code}
      </span>
      <span
        aria-hidden="true"
        style={{
          whiteSpace: "pre",
          fontSize: "var(--t-xxs-size)",
          color: "var(--fg-dim)",
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        {titleStack}
      </span>
      <span className="sr-only">Open panel {panel.code} — {panel.title}</span>
    </button>
  );
}
