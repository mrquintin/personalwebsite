import type { Project, ProjectMetadata } from "@/lib/projects/types";

export const project: Project = {
  slug: "purposeless-efficiency",
  code: "PRP",
  title: "Purposeless Efficiency",
  tagline: "Book I — what happens when efficiency forgets what it was for.",
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
    "Purposeless Efficiency is a book about what happens when optimization gets cut loose from any examined purpose — when the metric becomes the meaning and institutions forget what they were for. It traces the consequences across five pillars (corporatism, gamification, incumbency, complacency, and the shape of an honest economic revolution), arguing that the sense that the levers no longer connect to outcomes is structural, not accidental. Book I of a five-volume series, written for readers who have stopped pretending the symptoms are accidents.",
  citation: "Quintin, M. (forthcoming). Purposeless Efficiency. Book I of a five-volume series.",
};

export const meta: Pick<
  ProjectMetadata,
  "slug" | "code" | "title" | "tagline" | "framing" | "status"
> = {
  slug: project.slug,
  code: project.code,
  title: project.title,
  tagline: project.tagline,
  framing: project.summary,
  status: "in-progress",
};

export default project;
