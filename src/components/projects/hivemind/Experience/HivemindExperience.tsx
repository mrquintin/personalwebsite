"use client";
import { useEffect } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useHvm } from "@/stores/hivemindExperience";
import ModeTabBar from "./ModeTabBar";
import TheaterMode from "./modes/TheaterMode";
import KnobsMode from "./modes/KnobsMode";
import FailuresMode from "./modes/FailuresMode";
import PipelineMode from "./modes/PipelineMode";
import AuditMode from "./modes/AuditMode";

function regimeFor(width: number): "narrow" | "standard" | "wide" {
  if (width < 640) return "narrow";
  if (width < 960) return "standard";
  return "wide";
}

export default function HivemindExperience({ ctx }: { ctx: ExperienceContext }) {
  const mode = useHvm((s) => s.mode);
  const regime = regimeFor(ctx.hostWidthPx);

  useEffect(() => {
    const labels: Record<string, string> = {
      theater:   "Now viewing the Deliberation Theater — a recorded run of one Hivemind deliberation.",
      knobs:     "Now viewing the Knob Bench — sufficiency, feasibility, density.",
      failures:  "Now viewing the Four Failures Map — the firm's structural responses.",
      pipeline:  "Now viewing the Knowledge Pipeline — seven stages of the RAG substrate.",
      audit:     "Now viewing the Audit Artifact — the immutable trail.",
    };
    ctx.announce(labels[mode] ?? "");
  }, [mode, ctx]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {ctx.mode === "route" && (
        <div style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "var(--border-hair)",
                       fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)" }}>
          HIVEMIND / {mode.toUpperCase()}
        </div>
      )}
      <ModeTabBar regime={regime} />

      <div role="tabpanel" id={`hvm-panel-${mode}`} aria-labelledby={`hvm-tab-${mode}`}
           style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {mode === "theater"  && <TheaterMode  ctx={ctx} regime={regime} />}
        {mode === "knobs"    && <KnobsMode    ctx={ctx} regime={regime} />}
        {mode === "failures" && <FailuresMode ctx={ctx} regime={regime} />}
        {mode === "pipeline" && <PipelineMode ctx={ctx} regime={regime} />}
        {mode === "audit"    && <AuditMode    ctx={ctx} regime={regime} />}
      </div>
    </div>
  );
}
