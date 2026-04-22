"use client";
import { useState } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { CLAIMS, EDGES, LAST_REVIEW, TOTAL_ONTOLOGY_SIZE } from "@/lib/prp/claims";
import { usePrp } from "@/stores/prpExperience";
import OntologyGraph from "../ArgumentOntology/OntologyGraph";
import ClaimCard from "../ArgumentOntology/ClaimCard";

export default function OntologyMode({ ctx }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const [view, setView] = useState<"spine" | "all">("spine");
  const selectedClaimId = usePrp((s) => s.selectedClaimId);
  const setSelectedClaimId = usePrp((s) => s.setSelectedClaimId);
  const setMode = usePrp((s) => s.setMode);

  const claim = selectedClaimId ? CLAIMS.find((c) => c.id === selectedClaimId) : null;
  const authored = CLAIMS.filter((c) => c.authorApproved).length;

  function onSelect(id: string | null) {
    setSelectedClaimId(id);
    if (id) {
      const c = CLAIMS.find((x) => x.id === id);
      if (c) ctx.announce(`Now viewing ${c.name}, a ${c.kind} claim.`);
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <header style={{
        padding: "var(--s-3) var(--s-4)", display: "flex",
        justifyContent: "space-between", alignItems: "center", borderBottom: "var(--border-hair)",
      }}>
        <div style={{ display: "inline-flex", gap: 8, fontFamily: "var(--font-mono)", fontSize: "11px" }}>
          {(["spine", "all"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)}
              aria-pressed={view === v}
              style={{
                padding: "4px 10px", border: "var(--border-hair)",
                background: view === v ? "var(--bg-3)" : "transparent",
                color: view === v ? "var(--accent)" : "var(--fg-mute)",
                textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
              }}>
              {v === "spine" ? "spine only" : "all claims"}
            </button>
          ))}
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
          {view === "spine" ? `${CLAIMS.filter((c) => c.inSpine).length} spine claims` : `${CLAIMS.length} of ${TOTAL_ONTOLOGY_SIZE} loaded`}
        </span>
      </header>

      <div style={{ flex: 1, position: "relative", padding: "var(--s-3)" }}>
        <OntologyGraph
          claims={CLAIMS} edges={EDGES} view={view}
          selectedId={selectedClaimId} onSelect={onSelect}
          hostWidthPx={ctx.hostWidthPx} reducedMotion={ctx.reducedMotion}
        />
        {claim && (
          <ClaimCard
            claim={claim}
            onSelect={onSelect}
            onClose={() => onSelect(null)}
            onSwitchMode={(m) => { onSelect(claim.id); setMode(m); }}
          />
        )}
      </div>

      <footer style={{
        padding: "8px var(--s-4)", borderTop: "var(--border-hair)",
        fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)",
      }}>
        {authored}/{TOTAL_ONTOLOGY_SIZE} CLAIMS AUTHORED · SPINE: COMPLETE · LAST REVIEW {LAST_REVIEW}
      </footer>
    </div>
  );
}
