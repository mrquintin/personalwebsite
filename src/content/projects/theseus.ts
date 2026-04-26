import type { Project, ProjectMetadata } from "@/lib/projects/types";

export const project: Project = {
  slug: "theseus",
  code: "THS",
  title: "Theseus",
  tagline:
    "A knowledge system that flags contradictions between your stated principles.",
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
    "Theseus is software that takes the principles you have stated in writing and conversation, links them into a graph of supports and tensions, and flags where they contradict each other. The product is a slow, structured collaborator — not a chatbot — for anyone who needs to know, at any given moment, where their stated commitments contradict themselves. It is built for the operator-philosopher who would rather argue with their own positions before someone else does.",
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
  status: "shipped",
};

export default project;
