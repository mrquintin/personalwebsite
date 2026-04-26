import type { Phase } from "../../components/presentation/types";

export const hvmPhases: Phase[] = [
  {
    id: "what",
    heading: "What Hivemind is",
    body: (
      <>
        <p>
          Hivemind is strategic analytical software for operators reasoning under
          uncertainty — founders, analysts, and decision-makers who have to commit
          to a course of action when the evidence is incomplete and the stakes are
          real.
        </p>
        <p>
          The one-line pitch: instead of a memo full of confident-sounding prose,
          you get a structured argument you can defend, attack, and update — with
          the assumptions named and the evidence attached.
        </p>
      </>
    ),
  },
  {
    id: "problem",
    heading: "What problem it solves",
    body: (
      <>
        <p>
          Most strategic deliberation fails the same way. A team writes a memo,
          fluent prose hides the load-bearing assumptions, and nobody can argue
          with it because there is nothing concrete to argue against. The team
          commits anyway, and when reality disagrees, no one can point at the
          step where the reasoning broke.
        </p>
        <p>
          Hivemind targets that failure. The working artifact is not a paragraph
          — it is a tree of claims with sources attached and a confidence number
          on each. When the answer changes, you can point at the claim that
          moved, and so can the next person who picks up the file.
        </p>
      </>
    ),
  },
  {
    id: "how",
    heading: "How it works, briefly",
    body: (
      <>
        <p>
          You drop a strategy question in as plain prose. Hivemind reads it for
          the entities and decisions involved and breaks it into smaller
          sub-claims you can actually evaluate one at a time.
        </p>
        <p>
          You attach evidence to each branch — citations weighted by how
          trustworthy and how recent the source is. Underneath, the software
          keeps a running confidence number for every claim and rolls those up
          to the question at the top. Above, you get a working surface: a tree
          you can walk, edit, and challenge.
        </p>
        <p>
          The output is a structured brief with citations and confidence
          intervals — not a chat transcript. The reasoning travels with the
          conclusion.
        </p>
      </>
    ),
  },
  {
    id: "status",
    heading: "Where it sits",
    body: (
      <>
        <p>
          Hivemind is in active development at seed stage. Question
          decomposition, the evidence ledger, and the end-to-end workflow are
          usable today. Scenario branching and counterfactual simulation are in
          alpha against a small set of operator partners. Adversarial review and
          the final briefing render are scoped but not yet shipping.
        </p>
        <p>
          For deeper questions, ask the assistant on <a href="/chat">/chat</a>,
          or keep reading the project page below for the full breakdown.
        </p>
      </>
    ),
  },
];

// Invariant: exactly 4 phases (per 17/P02 §B1).
if (hvmPhases.length !== 4) {
  throw new Error(
    `hvm.tsx: hvmPhases.length must be 4 (got ${hvmPhases.length})`,
  );
}
