"use client";
import "@/styles/prp-prose.css";
import "@/lib/prp/typeGuards";        // P06 §B — runs on dev mount
import { useEffect } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { usePrp } from "@/stores/prpExperience";
import ModeTabBar from "./ModeTabBar";
import OntologyMode from "./modes/OntologyMode";
import QuadrantMode from "./modes/QuadrantMode";
import DiamondMode from "./modes/DiamondMode";
import ObjectionsMode from "./modes/ObjectionsMode";
import AtlasMode from "./modes/AtlasMode";
import GlossaryStrip from "./IntellectualAtlas/GlossaryStrip";

function regimeFor(width: number): "narrow" | "standard" | "wide" {
  if (width < 640) return "narrow";
  if (width < 960) return "standard";
  return "wide";
}

// I01 contract: the ExperienceHost passes ctx with mode/hostWidthPx/etc.
// The PRP experience is the root of the five-mode panel.
export default function PrpExperience({ ctx }: { ctx: ExperienceContext }) {
  const mode = usePrp((s) => s.mode);
  const regime = regimeFor(ctx.hostWidthPx);

  // Announce mode changes via the I01-shared live region.
  useEffect(() => {
    const labels: Record<string, string> = {
      ontology:   "Now viewing the Argument Ontology — the book's claim graph.",
      quadrant:   "Now viewing the Purpose-Efficiency Quadrant — institutional placements.",
      diamond:    "Now viewing the Diamond Method Practicum — guided philosophical walks.",
      objections: "Now viewing the Objections Dojo — seven common objections and the book's responses.",
      atlas:      "Now viewing the Intellectual Atlas — thinkers the book takes a stance on.",
    };
    ctx.announce(labels[mode] ?? "");
  }, [mode, ctx]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", position: "relative" }}>
      {ctx.mode === "route" && (
        <div style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "var(--border-hair)",
                      fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)" }}>
          PRP / {mode.toUpperCase()}
        </div>
      )}
      <ModeTabBar regime={regime} />

      <div role="tabpanel" id={`prp-panel-${mode}`} aria-labelledby={`prp-tab-${mode}`}
           style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {mode === "ontology"   && <OntologyMode ctx={ctx} regime={regime} />}
        {mode === "quadrant"   && <QuadrantMode ctx={ctx} regime={regime} />}
        {mode === "diamond"    && <DiamondMode ctx={ctx} regime={regime} />}
        {mode === "objections" && <ObjectionsMode ctx={ctx} regime={regime} />}
        {mode === "atlas"      && <AtlasMode ctx={ctx} regime={regime} />}
      </div>

      {/* P01 §A0: glossary outlet — sticky bottom; P05's strip portals into here. */}
      <div id="prp-glossary-outlet" style={{ position: "sticky", bottom: 0, zIndex: 10, background: "var(--bg-1)" }} />

      {/* The strip itself is mounted once at chassis level so it persists across modes. */}
      <GlossaryStrip ctx={ctx} regime={regime} />
    </div>
  );
}
