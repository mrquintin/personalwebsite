"use client";
import { useEffect, useState } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useHvm } from "@/stores/hivemindExperience";
import { useCe } from "@/stores/coherenceEngineExperience";
import ModeTabBar, { getActiveFace } from "./ModeTabBar";
import TheaterMode from "./modes/TheaterMode";
import KnobsMode from "./modes/KnobsMode";
import FailuresMode from "./modes/FailuresMode";
import PipelineMode from "./modes/PipelineMode";
import AuditMode from "./modes/AuditMode";
import LayersMode from "./coherenceEngine/LayersMode";
import CosineMode from "./coherenceEngine/CosineMode";
import CompareMode from "./coherenceEngine/CompareMode";
import GatesMode from "./coherenceEngine/GatesMode";
import CeAuditMode from "./coherenceEngine/AuditMode";

function regimeFor(width: number): "narrow" | "standard" | "wide" {
  if (width < 640) return "narrow";
  if (width < 960) return "standard";
  return "wide";
}

export default function HivemindExperience({ ctx }: { ctx: ExperienceContext }) {
  const hvmMode = useHvm((s) => s.mode);
  const ceMode = useCe((s) => s.mode);
  const regime = regimeFor(ctx.hostWidthPx);

  // active face: rerender on face-change events
  const [face, setFace] = useState<"strategic" | "technical">(() => getActiveFace());
  useEffect(() => {
    function on(e: Event) {
      const det = (e as CustomEvent).detail as "strategic" | "technical";
      setFace(det);
    }
    window.addEventListener("hvm:face-change", on);
    return () => window.removeEventListener("hvm:face-change", on);
  }, []);

  useEffect(() => {
    if (face === "strategic") {
      const labels: Record<string, string> = {
        theater:   "Now viewing the Deliberation Theater — a recorded run of one Hivemind deliberation.",
        knobs:     "Now viewing the Knob Bench — sufficiency, feasibility, density.",
        failures:  "Now viewing the Four Failures Map — the firm's structural responses.",
        pipeline:  "Now viewing the Knowledge Pipeline — seven stages of the RAG substrate.",
        audit:     "Now viewing the Audit Artifact — the immutable trail.",
      };
      ctx.announce(labels[hvmMode] ?? "");
    } else {
      const labels: Record<string, string> = {
        layers:  "Mode: Layer Scoring Lab.",
        cosine:  "Mode: Cosine Paradox.",
        compare: "Mode: Domain-Relative Comparator.",
        gates:   "Mode: Decision Policy Gates.",
        audit:   "Mode: Decision Artifact and Honest Ledger.",
      };
      ctx.announce(labels[ceMode] ?? "");
    }
  }, [face, hvmMode, ceMode, ctx]);

  const activeId = face === "strategic" ? hvmMode : ceMode;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {ctx.mode === "route" && (
        <div style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "var(--border-hair)",
                       fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)" }}>
          HIVEMIND / {face.toUpperCase()} / {activeId.toUpperCase()}
        </div>
      )}
      <ModeTabBar regime={regime} />

      <div role="tabpanel" id={`hvm-panel-${face}-${activeId}`} aria-labelledby={`hvm-tab-${face}-${activeId}`}
           style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {face === "strategic" && hvmMode === "theater"  && <TheaterMode  ctx={ctx} regime={regime} />}
        {face === "strategic" && hvmMode === "knobs"    && <KnobsMode    ctx={ctx} regime={regime} />}
        {face === "strategic" && hvmMode === "failures" && <FailuresMode ctx={ctx} regime={regime} />}
        {face === "strategic" && hvmMode === "pipeline" && <PipelineMode ctx={ctx} regime={regime} />}
        {face === "strategic" && hvmMode === "audit"    && <AuditMode    ctx={ctx} regime={regime} />}

        {face === "technical" && ceMode === "layers"  && <LayersMode  ctx={ctx} regime={regime} />}
        {face === "technical" && ceMode === "cosine"  && <CosineMode  ctx={ctx} regime={regime} />}
        {face === "technical" && ceMode === "compare" && <CompareMode ctx={ctx} regime={regime} />}
        {face === "technical" && ceMode === "gates"   && <GatesMode   ctx={ctx} regime={regime} />}
        {face === "technical" && ceMode === "audit"   && <CeAuditMode ctx={ctx} regime={regime} />}
      </div>
    </div>
  );
}
