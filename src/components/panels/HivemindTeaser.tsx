"use client";
import ExperienceHost from "./ExperienceHost";
import HivemindDossier from "@/components/projects/hivemind/HivemindDossier";
import { EXPERIENCE_REGISTRY } from "@/lib/experience-config";

// I01: panel-mode ExperienceHost replaces the legacy teaser content.
// Same component that mounts on /hivemind, with mode="panel".
export default function HivemindTeaser() {
  const { name, synopsis } = EXPERIENCE_REGISTRY.hvm;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <ExperienceHost
        projectId="hvm"
        name={name}
        synopsis={synopsis}
        mode="panel"
        dossier={<HivemindDossier />}
      />
    </div>
  );
}
