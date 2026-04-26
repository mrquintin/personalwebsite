import type { ProjectMetadata } from "@/lib/projects/types";

// Tagline + framing sourced from existing repo content:
//   - preface.ts / preface.mdx → severance of efficiency from purpose,
//     metric-as-meaning, "you have already noticed the symptoms"
//   - pillars.ts (I–V)        → corporatism, gamification, incumbency,
//                                complacency, economic revolution
//   - arc.ts                  → Book I of a five-volume series
//   - quotes.ts               → "Efficiency, severed from purpose, becomes
//                                the most efficient way of arriving nowhere."
export const metadata: ProjectMetadata = {
  slug: "purposeless-efficiency",
  code: "PRP",
  title: "Purposeless Efficiency",
  tagline: "Book I — what happens when efficiency forgets what it was for.",
  status: "in-progress",
  framing:
    "Purposeless Efficiency is a book about what happens when optimization gets cut loose from any examined purpose — when the metric becomes the meaning and institutions forget what they were for. It traces the consequences across five pillars (corporatism, gamification, incumbency, complacency, and the shape of an honest economic revolution), arguing that the sense that the levers no longer connect to outcomes is structural, not accidental. Book I of a five-volume series, written for readers who have stopped pretending the symptoms are accidents.",
  externalLinks: [],
  seedQuestion: "what is purposeless efficiency?",
};

export default metadata;
