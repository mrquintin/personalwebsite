import type { ProjectMetadata } from "@/lib/projects/types";

// Tagline + framing sourced from existing repo content:
//   - thesis.ts      → claim ("philosophical debate can be systematized"),
//                       method (extract first principles, graph supports/
//                       tensions, surface contradictions), role
//                       ("a Kim/Codex for the operator-philosopher")
//   - methodology.ts → extraction with provenance, Noosphere walking the
//                       graph, slow structured collaborator (not a chatbot)
//   - principles.ts  → the seed dataset (P-001..P-080) with explicit
//                       supports / tensions edges
// The intended src/lib/theseus/* files (ordersDeck.ts, thesisAxes.ts,
// sources.ts) referenced by the prompt do not currently exist in the repo;
// the framing therefore stays grounded in the content/ files above.
export const metadata: ProjectMetadata = {
  slug: "theseus",
  code: "THS",
  title: "Theseus",
  tagline:
    "A knowledge system that flags contradictions between your stated principles.",
  status: "shipped",
  framing:
    "Theseus is software that takes the principles you have stated in writing and conversation, links them into a graph of supports and tensions, and flags where they contradict each other. The product is a slow, structured collaborator — not a chatbot — for anyone who needs to know, at any given moment, where their stated commitments contradict themselves. It is built for the operator-philosopher who would rather argue with their own positions before someone else does.",
  externalLinks: [
    { label: "thesescodex.com", href: "https://thesescodex.com" },
  ],
  seedQuestion: "what does the Theseus project argue about identity?",
};

export default metadata;
