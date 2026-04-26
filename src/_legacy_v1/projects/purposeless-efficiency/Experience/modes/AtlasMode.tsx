"use client";
import type { ExperienceContext } from "@/lib/experience-config";
import { THINKERS } from "@/lib/prp/thinkers";
import { usePrp } from "@/stores/prpExperience";
import AtlasOrbit from "../IntellectualAtlas/AtlasOrbit";
import ThinkerDrawer from "../IntellectualAtlas/ThinkerDrawer";

export default function AtlasMode({ ctx }: { ctx: ExperienceContext; regime: string }) {
  const focusId = usePrp((s) => s.atlas.focusThinkerId);
  const open = usePrp((s) => s.openThinker);
  const close = usePrp((s) => s.closeThinker);
  const setSelectedClaimId = usePrp((s) => s.setSelectedClaimId);
  const setMode = usePrp((s) => s.setMode);

  const thinker = focusId ? THINKERS.find((t) => t.id === focusId) : null;

  return (
    <div style={{ position: "relative", height: "100%", padding: "var(--s-3)" }}>
      <header style={{ marginBottom: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-mute)" }}>
        Thinkers the book takes a stance on. Click any name.
      </header>
      <AtlasOrbit
        onOpen={(id) => { open(id); const t = THINKERS.find((x) => x.id === id); if (t) ctx.announce(`Now viewing thinker: ${t.name}, ${t.stance.toLowerCase()}`); }}
        focusId={focusId}
        hostWidthPx={ctx.hostWidthPx}
      />
      {thinker && (
        <ThinkerDrawer thinker={thinker} onClose={close}
          openInOntology={(claimId) => { setSelectedClaimId(claimId); setMode("ontology"); }} />
      )}
    </div>
  );
}
