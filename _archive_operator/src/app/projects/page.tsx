import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectsTable from "@/components/projects/ProjectsTable";
import { loadProjects } from "@/lib/projects/loader";

export const metadata: Metadata = {
  title: "Projects",
  description: "Index of Michael Quintin's projects.",
};

export default function ProjectsPage() {
  const projects = loadProjects();
  return (
    <div className="dossier">
      <h1 className="sr-only">Projects</h1>
      <Suspense fallback={<div className="sr-only">Loading projects…</div>}>
        <div className="projects-layout">
          <ProjectsTable projects={projects} />
        </div>
      </Suspense>
    </div>
  );
}
