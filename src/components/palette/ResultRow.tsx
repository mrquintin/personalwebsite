"use client";
import type { Command } from "@/lib/commands/types";

const GLYPH: Record<Command["kind"], string> = {
  nav: "›",
  action: "⚑",
  query: "?",
};

type Props = {
  cmd: Command;
  selected: boolean;
  indices: number[];
  id: string;
  onActivate: () => void;
  onMouseEnter: () => void;
};

export default function ResultRow({ cmd, selected, indices, id, onActivate, onMouseEnter }: Props) {
  const title = cmd.title;
  // Highlight matched indices
  const chars = title.split("").map((ch, i) => {
    const hit = indices.includes(i);
    return (
      <span key={i} style={{ color: hit ? "var(--accent)" : "inherit" }}>
        {ch}
      </span>
    );
  });
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      onMouseDown={(e) => { e.preventDefault(); onActivate(); }}
      onMouseEnter={onMouseEnter}
      className="palette-row"
      data-selected={selected}
    >
      <span className="palette-glyph">{GLYPH[cmd.kind]}</span>
      <span className="palette-title">{chars}</span>
      {cmd.context && <span className="palette-ctx">{cmd.context}</span>}
    </div>
  );
}
