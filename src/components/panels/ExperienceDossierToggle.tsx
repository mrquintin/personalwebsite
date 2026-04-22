"use client";
import type { ProjectId } from "@/lib/experience-config";

type Props = {
  projectId: ProjectId;
  view: "experience" | "dossier";
  onChange: (v: "experience" | "dossier") => void;
};

export const STORAGE_KEY = (id: ProjectId) => `operator.exp.view.${id}`;

export default function ExperienceDossierToggle({ projectId, view, onChange }: Props) {
  return (
    <div className="exp-toggle" role="tablist" aria-label={`view for ${projectId}`}>
      <button
        type="button"
        role="tab"
        aria-pressed={view === "experience"}
        aria-selected={view === "experience"}
        onClick={() => onChange("experience")}
      >
        experience
      </button>
      <button
        type="button"
        role="tab"
        aria-pressed={view === "dossier"}
        aria-selected={view === "dossier"}
        onClick={() => onChange("dossier")}
      >
        dossier
      </button>
    </div>
  );
}
