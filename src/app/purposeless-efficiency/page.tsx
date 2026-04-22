import type { Metadata } from "next";
import ExperienceHost from "@/components/panels/ExperienceHost";
import PurposelessDossier from "@/components/projects/book/PurposelessDossier";
import { EXPERIENCE_REGISTRY } from "@/lib/experience-config";

export const metadata: Metadata = {
  title: "Purposeless Efficiency",
  description: "Book I — corporatism, gamification, incumbency, complacency, economic revolution.",
};

export default function PurposelessPage() {
  const { name, synopsis, load } = EXPERIENCE_REGISTRY.prp;
  return (
    <div style={{ height: "calc(100vh - var(--toprail-h))", padding: "var(--s-4)" }}>
      <ExperienceHost
        projectId="prp"
        name={name}
        synopsis={synopsis}
        mode="route"
        load={load}
        dossier={<PurposelessDossier />}
      />
    </div>
  );
}
