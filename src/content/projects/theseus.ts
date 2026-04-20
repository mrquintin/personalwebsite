import type { Project } from "@/lib/projects/types";

export const project: Project = {
  slug: "theseus",
  code: "THS",
  title: "Theseus",
  tagline: "A knowledge system for monitoring ideological contradiction.",
  kind: "research",
  status: "active",
  startedISO: "2024-09-01",
  updatedISO: "2026-04-19",
  stage: "live",
  classification: "public",
  authors: ["Michael Quintin"],
  customPage: "/theseus",
  links: [
    { label: "thesescodex.com", href: "https://thesescodex.com", external: true },
    { label: "michael@hivemind.ai", href: "mailto:michael@hivemind.ai" },
  ],
  summary:
    "Theseus extracts first principles from discussion and writing, represents them as a graph, and uses a model called Noosphere to surface contradictions and ask refining questions.",
};

export default project;
