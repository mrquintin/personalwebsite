// Prose narrative for the HVM project page.
// Sources:
//   - thesis.ts        → product thesis, mechanism, moat
//   - capabilities.ts  → CAP-01..CAP-06 capability ladder
//   - workflow.ts      → six-step pipeline (intake → render brief)
//   - lib/coherenceEngine/arguments.ts → S1..S5 layer weights, anti-gaming
//   - lib/coherenceEngine/pitches.ts   → domain-relative comparator
// Per v2 principle 2 (content first), each section opens with its point.

export type BodySection = {
  slug: string;
  heading: string;
  paragraphs: string[];
};

const sections: BodySection[] = [
  {
    slug: "what-is-hivemind",
    heading: "What is Hivemind",
    paragraphs: [
      "Hivemind is strategic analytical software for operators who must reason under uncertainty. It decomposes a strategy question into a tree of evaluable sub-claims, attaches weighted evidence to each branch, and aggregates probabilistic posteriors back to the root. The output is a structured brief — citations, intervals, dissents — not a chat transcript.",
      "The thesis is plain. Decision-grade analysis benefits from explicit structure rather than freeform prose. A memo that hides its assumptions is one nobody can argue with. A graph that lays them out is one a team can attack, defend, and update without redoing the work.",
    ],
  },
  {
    slug: "the-product",
    heading: "The product",
    paragraphs: [
      "The working surface is a hypothesis tree. An operator drops a strategy question in plain prose; Hivemind parses for entities and decisions and returns an initial frame. From there the workflow runs six steps: intake, decompose, gather evidence, score, red team, render brief. Each step has its own artifact — frame, tree, ledger, posterior, critique, memo — and each is auditable independently of the others.",
      "Capabilities currently shipping include hypothesis decomposition (CAP-01) and the evidence ledger (CAP-02), where sourced citations are weighted by provenance and recency. Scenario trees (CAP-03) and counterfactual simulation (CAP-04) are in alpha: branch probability over outcomes, hold inputs constant, vary one assumption at a time. Adversarial review (CAP-05) and the briefing render (CAP-06) are scoped and not yet shipping.",
      "The graph compounds. The longer an operator works inside Hivemind, the harder the working knowledge is to redo elsewhere; the moat is the accumulated structure, not the model behind it.",
    ],
  },
  {
    slug: "why-coherence-matters",
    heading: "Why coherence matters",
    paragraphs: [
      "Hivemind sits on a coherence engine. Coherence here is not “does the text sound confident” — it is a layered, falsifiable score over a structured argument. Five layers contribute under fixed weights: contradiction (S1, 0.30), argumentation (S2, 0.20), embedding similarity (S3, 0.20), compression (S4, 0.15), and structural connectivity (S5, 0.15). Each layer returns a number a human can inspect: which proposition pairs were flagged, the size of the grounded extension, whether a fixed-point iteration found a cycle, the longest support chain.",
      "Anti-gaming is a separate term. Template overlap, prior-corpus echo, contradiction denial, repetitive filler, and fluency-without-content are weighted and subtracted from a clamped floor. The composite is the layered score multiplied by the anti-gaming score; the brief that sounds smartest is not the brief that wins.",
      "The product layer above this is comparative. A pitch is scored against the median coherence of incumbents in its primary domain. The interesting number is domain-relative: a pitch can be coherent in absolute terms and still under-perform the incumbents in its own market. Operators making a real bet should know which one they are looking at.",
    ],
  },
  {
    slug: "what-it-isnt",
    heading: "What it isn’t",
    paragraphs: [
      "Hivemind is not a chat assistant with citations bolted on. The primitive is the hypothesis, not the message. There is no transcript to scroll; there is a graph to walk, and every node is independently rebuttable.",
      "It is not a forecasting market. Posteriors come from evidence and structure, not from crowd betting; the surface that matters is the one a single operator can defend in writing.",
      "It is not a single model. The coherence engine combines a contradiction-detection backend, a graph extension procedure, an embedding similarity check, a compression ratio, and a structural connectivity score. Swapping any one of those backends does not change the contract the engine makes with its caller.",
    ],
  },
  {
    slug: "status",
    heading: "Status",
    paragraphs: [
      "Hivemind is in active development; the company is at seed stage as of 2026-04. Hypothesis decomposition, the evidence ledger, and the workflow scaffold are usable end-to-end. Scenario branching and counterfactual simulation are in alpha against a small set of operator partners. Adversarial review and the briefing render are scoped and not yet shipping. A recorded walkthrough is pending.",
    ],
  },
];

export default sections;
