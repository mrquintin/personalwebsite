"use client";
import { useState } from "react";
import type { Principle } from "@/content/projects/theseus/principles";

function toMarkdown(items: Principle[]): string {
  const lines = ["# Theseus — first principles", ""];
  for (const p of items) {
    lines.push(`**${p.id}** — ${p.text}`);
    if (p.supports.length) lines.push(`  - supports: ${p.supports.join(", ")}`);
    if (p.tensions.length) lines.push(`  - tensions: ${p.tensions.join(", ")}`);
    lines.push("");
  }
  return lines.join("\n");
}

export default function ExportPrinciples({ principles }: { principles: Principle[] }) {
  const [label, setLabel] = useState("Copy principles as markdown");
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(toMarkdown(principles));
          setLabel("✓ copied");
        } catch {
          setLabel("! clipboard denied");
        }
        setTimeout(() => setLabel("Copy principles as markdown"), 900);
      }}
      style={{
        marginTop: "var(--s-3)",
        fontFamily: "var(--font-mono)", fontSize: "var(--t-xs-size)",
        color: "var(--fg)", border: "var(--border-hair)",
        padding: "var(--s-2) var(--s-3)",
      }}
      data-affordance
    >
      [ {label} ]
    </button>
  );
}
