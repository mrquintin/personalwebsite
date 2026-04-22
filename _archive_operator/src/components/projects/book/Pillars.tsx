"use client";
import { useState } from "react";
import type { Pillar } from "@/content/projects/purposeless-efficiency/pillars";

export default function Pillars({ items }: { items: Pillar[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul role="list">
      {items.map((p) => {
        const isOpen = open === p.num;
        return (
          <li key={p.num} style={{ borderBottom: "var(--border-hair)" }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : p.num)}
              aria-expanded={isOpen}
              style={{
                display: "flex", width: "100%", justifyContent: "space-between", alignItems: "baseline",
                padding: "var(--s-4) 0", cursor: "pointer",
                fontFamily: "var(--font-serif)", fontStyle: "italic",
                color: "var(--fg-hi)", fontSize: "var(--t-lg-size)",
                background: "transparent",
              }}
            >
              <span>§ {p.num} &nbsp; {p.title}</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)" }}>
                {isOpen ? "[ −  collapse ]" : "[ +  expand ]"}
              </span>
            </button>
            {!isOpen && (
              <div style={{ paddingBottom: "var(--s-4)", fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg-dim)", fontSize: "var(--t-sm-size)" }}>
                {p.seed}
              </div>
            )}
            {isOpen && (
              <div className="pe-prose" style={{ paddingBottom: "var(--s-5)" }}>
                <p>{p.body}</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
