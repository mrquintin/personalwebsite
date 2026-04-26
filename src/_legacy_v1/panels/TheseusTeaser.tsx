"use client";
import ExperienceHost from "./ExperienceHost";
import TheseusDossier from "@/components/projects/theseus/TheseusDossier";
import { EXPERIENCE_REGISTRY } from "@/lib/experience-config";

// I01: panel-mode ExperienceHost. The THS experience is the Reflection Lab.
export default function TheseusTeaser() {
  const { name, synopsis } = EXPERIENCE_REGISTRY.ths;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <ExperienceHost
        projectId="ths"
        name={name}
        synopsis={synopsis}
        mode="panel"
        dossier={<TheseusDossier />}
      />
    </div>
  );
}
