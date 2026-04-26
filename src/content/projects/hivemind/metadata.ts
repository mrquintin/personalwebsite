import type { ProjectMetadata } from "@/lib/projects/types";

// Tagline sourced from src/content/projects/hivemind/thesis.ts.
// Framing composed from thesis.ts (mechanism), capabilities.ts (CAP list),
// workflow.ts (six-step pipeline), and the layered scoring contract in
// src/lib/coherenceEngine/arguments.ts (CE2 §2-§4).
export const metadata: ProjectMetadata = {
  slug: "hivemind",
  code: "HVM",
  title: "Hivemind",
  tagline:
    "Strategic analytical software for groups making consequential decisions.",
  status: "in-progress",
  framing:
    "Hivemind is software that helps teams reason through hard strategic decisions. It breaks a question into testable sub-claims, attaches weighted evidence to each, and rolls the result up into a structured brief — citations, confidence intervals, dissents — that a team can argue with and update without redoing the work. It exists because the memos behind consequential decisions usually hide their assumptions; a graph that lays them out is one a team can attack.",
  externalLinks: [
    { label: "hivemind.ai", href: "https://hivemind.ai" },
    { label: "app.hivemind.ai", href: "https://app.hivemind.ai" },
  ],
  seedQuestion: "what does Hivemind actually do?",
};

export default metadata;
