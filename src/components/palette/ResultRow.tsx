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
  pending?: boolean;
  disabled?: boolean;
  onActivate: () => void;
  onMouseEnter: () => void;
};

export default function ResultRow({
  cmd, selected, indices, id, pending, disabled, onActivate, onMouseEnter,
}: Props) {
  const title = cmd.title;
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
      aria-disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); if (!disabled) onActivate(); }}
      onMouseEnter={onMouseEnter}
      className="palette-row"
      data-selected={selected}
      style={{ opacity: disabled && !pending ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <span className="palette-glyph">{pending ? <span className="cursor-blink">⠿</span> : GLYPH[cmd.kind]}</span>
      <span className="palette-title">{chars}</span>
      {cmd.context && <span className="palette-ctx">{pending ? "running…" : cmd.context}</span>}
    </div>
  );
}
