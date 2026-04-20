import type { Metadata } from "next";
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
      <ProjectsTable projects={projects} />
    </div>
  );
}
