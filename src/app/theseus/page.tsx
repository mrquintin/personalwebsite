import type { Metadata } from "next";
import ExperienceHost from "@/components/panels/ExperienceHost";
import TheseusDossier from "@/components/projects/theseus/TheseusDossier";
import { EXPERIENCE_REGISTRY } from "@/lib/experience-config";

export const metadata: Metadata = {
  title: "Theseus",
  description: "A knowledge system for monitoring ideological contradiction.",
};

export default function TheseusPage() {
  const { name, synopsis } = EXPERIENCE_REGISTRY.ths;
  return (
    <div style={{ height: "calc(100vh - var(--toprail-h))", padding: "var(--s-4)" }}>
      <ExperienceHost
        projectId="ths"
        name={name}
        synopsis={synopsis}
        mode="route"
        dossier={<TheseusDossier />}
      />
    </div>
  );
}
