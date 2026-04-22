"use client";
import { SHORTEST_PATH_FROM_CRI } from "@/lib/prp/claims";

export default function DependencyTrail({
  claimId, onJump,
}: { claimId: string; onJump: (id: string) => void }) {
  const path = SHORTEST_PATH_FROM_CRI[claimId] ?? [claimId];
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)",
      padding: "var(--s-2) 0", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center",
    }}>
      {path.map((id, i) => (
        <span key={id}>
          {i > 0 && <span style={{ margin: "0 6px", color: "var(--fg-dim)" }}>›</span>}
          <button type="button" onClick={() => onJump(id)}
            style={{ background: "transparent", color: i === path.length - 1 ? "var(--accent)" : "var(--fg)",
                     cursor: "pointer", padding: 0 }}>
            {id}
          </button>
        </span>
      ))}
    </div>
  );
}
