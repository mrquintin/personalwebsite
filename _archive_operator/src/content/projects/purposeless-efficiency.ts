import type { Project } from "@/lib/projects/types";

export const project: Project = {
  slug: "purposeless-efficiency",
  code: "PRP",
  title: "Purposeless Efficiency",
  tagline: "Book I — corporatism, gamification, incumbency, complacency, economic revolution.",
  kind: "book",
  status: "draft",
  startedISO: "2024-01-15",
  updatedISO: "2026-04-12",
  stage: "manuscript · MS v4",
  classification: "public",
  authors: ["Michael Quintin"],
  customPage: "/purposeless-efficiency",
  links: [
    { label: "manuscript page", href: "/purposeless-efficiency" },
    { label: "notify list",     href: "mailto:michael@hivemind.ai?subject=PRP%20%2F%20NOTIFY" },
  ],
  summary:
    "The first volume of a five-book series. Argues that efficiency severed from purpose has become the dominant production logic of the late industrial era, and traces its consequences for work, governance, and the citizen.",
  citation: "Quintin, M. (forthcoming). Purposeless Efficiency. Book I of a five-volume series.",
};

export default project;
