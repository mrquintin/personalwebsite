import type { Metadata } from "next";
import ExperienceHost from "@/components/panels/ExperienceHost";
import HivemindDossier from "@/components/projects/hivemind/HivemindDossier";
import { EXPERIENCE_REGISTRY } from "@/lib/experience-config";

export const metadata: Metadata = {
  title: "Hivemind",
  description: "Strategic analytical software.",
};

export default function HivemindPage() {
  const { name, synopsis, load } = EXPERIENCE_REGISTRY.hvm;
  return (
    <div style={{ height: "calc(100vh - var(--toprail-h))", padding: "var(--s-4)" }}>
      <ExperienceHost
        projectId="hvm"
        name={name}
        synopsis={synopsis}
        mode="route"
        load={load}
        dossier={<HivemindDossier />}
      />
    </div>
  );
}
