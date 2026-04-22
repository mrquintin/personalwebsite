"use client";
import ExperienceHost from "./ExperienceHost";
import PurposelessDossier from "@/components/projects/book/PurposelessDossier";
import { EXPERIENCE_REGISTRY } from "@/lib/experience-config";

// I01: panel-mode ExperienceHost. The PRP experience is the Galley.
export default function PurposelessTeaser() {
  const { name, synopsis } = EXPERIENCE_REGISTRY.prp;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <ExperienceHost
        projectId="prp"
        name={name}
        synopsis={synopsis}
        mode="panel"
        dossier={<PurposelessDossier />}
      />
    </div>
  );
}
