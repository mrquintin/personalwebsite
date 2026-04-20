import type { Project } from "@/lib/projects/types";

export const project: Project = {
  slug: "hivemind",
  code: "HVM",
  title: "Hivemind",
  tagline: "Strategic analytical software.",
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
    "Hivemind is strategic analytical software. It decomposes strategy problems into evaluable hypotheses with weighted evidence and probabilistic aggregation. The output is a structured brief, not a chat transcript.",
};

export default project;
