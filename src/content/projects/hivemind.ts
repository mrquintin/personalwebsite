import type { Project, ProjectMetadata } from "@/lib/projects/types";

export const project: Project = {
  slug: "hivemind",
  code: "HVM",
  title: "Hivemind",
  tagline:
    "Strategic analytical software for groups making consequential decisions.",
  kind: "company",
  status: "active",
  startedISO: "2024-06-01",
  updatedISO: "2026-04-12",
  stage: "Seed",
  classification: "public",
  authors: ["Michael Quintin"],
  customPage: "/hivemind",
  // TODO(michael): supply real links
  links: [
    { label: "hivemind.ai",            href: "https://hivemind.ai",            external: true },
    { label: "app.hivemind.ai",        href: "https://app.hivemind.ai",        external: true },
    { label: "michael@hivemind.ai",    href: "mailto:michael@hivemind.ai" },
  ],
  summary:
    "Hivemind is software that helps teams reason through hard strategic decisions. It breaks a question into testable sub-claims, attaches weighted evidence to each, and rolls the result up into a structured brief — citations, confidence intervals, dissents — that a team can argue with and update without redoing the work. It exists because the memos behind consequential decisions usually hide their assumptions; a graph that lays them out is one a team can attack.",
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
