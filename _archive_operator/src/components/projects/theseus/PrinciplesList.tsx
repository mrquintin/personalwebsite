"use client";
import type { Principle } from "@/content/projects/theseus/principles";
import { useState } from "react";

export default function PrinciplesList({ principles }: { principles: Principle[] }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <ul role="list" style={{
      fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)",
      maxHeight: 320, overflowY: "auto", border: "var(--border-hair)",
    }}>
      {principles.map((p) => (
        <li
          key={p.id}
          onMouseEnter={() => setHover(p.id)}
          onMouseLeave={() => setHover(null)}
          style={{
            display: "grid", gridTemplateColumns: "60px 1fr",
            gap: "var(--s-3)", padding: "6px var(--s-3)",
            background: hover === p.id ? "var(--bg-3)" : "transparent",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <span style={{ color: "var(--accent-dim)" }}>{p.id}</span>
          <span style={{ color: "var(--fg)" }}>{p.text}</span>
        </li>
      ))}
    </ul>
  );
}
