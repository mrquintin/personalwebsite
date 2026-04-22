// I01 — shared types and thresholds for the ExperienceHost / ExperienceScaffold
// contract. Every project experience consumes ExperienceContext from the host.
// Do NOT add custom thresholds without updating the canonical list below.

import type { ComponentType } from "react";

export const EXPERIENCE_THRESHOLDS = {
  narrow: 640,    // < 640: single column, drop spine glyph
  compact: 960,   // 640–960: two-column permitted, frugal
  standard: 1280, // 960–1280: full interactive layout
  // ≥ 1280: wide, route-mode on large displays — add secondary panes
} as const;

export type ExperienceMode = "panel" | "route";

export type ProjectId = "hvm" | "prp" | "ths";

export type ExperienceContext = {
  mode: ExperienceMode;
  hostWidthPx: number;
  reducedMotion: boolean;
  announce: (msg: string) => void;
  prefersDense: boolean;
};

export type ExperienceComponent = ComponentType<{ ctx: ExperienceContext }>;

export type ExperienceDescriptor = {
  projectId: ProjectId;
  name: string;          // e.g., "Coherence Receiver"
  synopsis: string;      // one-line, mono-friendly
  load?: () => Promise<{ default: ExperienceComponent }>;
};

// Canonical experience names per project (from the deep-suite specs).
// When the deep suites ship their components, point `load` at them.
export const EXPERIENCE_REGISTRY: Record<ProjectId, ExperienceDescriptor> = {
  hvm: { projectId: "hvm", name: "Coherence Receiver",
         synopsis: "strategic-analytical software · live deliberation surface" },
  prp: { projectId: "prp", name: "Purposeless Efficiency",
         synopsis: "five-mode reading surface · ontology · quadrant · diamond · objections · atlas",
         load: () => import("@/components/projects/purposeless-efficiency/Experience/PrpExperience") },
  ths: { projectId: "ths", name: "Reflection Lab",
         synopsis: "principle graph · contradiction reflection" },
};

export function thresholdLabelFor(width: number): "narrow" | "compact" | "standard" | "wide" {
  if (width < EXPERIENCE_THRESHOLDS.narrow)   return "narrow";
  if (width < EXPERIENCE_THRESHOLDS.compact)  return "compact";
  if (width < EXPERIENCE_THRESHOLDS.standard) return "standard";
  return "wide";
}
