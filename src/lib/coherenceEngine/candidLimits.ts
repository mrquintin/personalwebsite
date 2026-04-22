// The three candid-limits items from CE1 §8, verbatim.
// Anchors are the integrity-check sentences; bodies follow the source.

export interface CandidLimit {
  id: "predictive-validity" | "weights-tuned" | "cross-domain";
  anchor: string;
  body: string;
  source: string;
}

export const CANDID_LIMITS: readonly CandidLimit[] = [
  {
    id: "predictive-validity",
    anchor: "Predictive validity is unproven.",
    body:
      "The hypothesis that a higher coherence score at pitch time predicts a higher probability of startup success has not yet been tested at scale against historical outcomes. The research plan exists; the result does not.",
    source: "CE1 §8, item 1",
  },
  {
    id: "weights-tuned",
    anchor: "The layer weights are partly principled and partly tuned.",
    body:
      "The default weights (contradiction 0.30, argumentation 0.20, embedding 0.20, compression 0.15, structural 0.15) come from config.py and match ARCHITECTURE.txt. The Formal_Mathematical_Framework.pdf proposes a different six-layer weighting that includes a probabilistic-coherence layer (Roche's measure) not yet in production. Which weighting generalises best across domains is an open empirical question.",
    source: "CE1 §8, item 2",
  },
  {
    id: "cross-domain",
    anchor: "Cross-domain contradiction detection degrades.",
    body:
      "Experiments reported in the research corpus show that a general-domain contradiction classifier drops from near-perfect in-domain performance to approximately 50-65% cross-domain. The project's response is domain-specific training plus domain-relative scoring; both are partial mitigations, not solutions.",
    source: "CE1 §8, item 3",
  },
] as const;

export const CANDID_CLOSING = {
  anchor:
    "These are not criticisms. They are the honest ledger of where a serious, ambitious research-to-production project stands in April 2026.",
  source: "CE1 §8 closing",
} as const;

export const QUINTIN_HYPOTHESIS = {
  text:
    "Reality is fundamentally coherent. Any sufficiently coherent logical structure must correspond to reality. Therefore, formal logical coherence is not merely an intellectual exercise—it is a marker of contact with reality itself.",
  source: "CE1 §3.1, Argumentative_Ontology.md",
} as const;

export const VALIDATION_PLAN = {
  status: "planned, not reported complete",
  designSummary: "500 historical startups (250 successes, 250 failures)",
  target: "p < 0.01 correlation between coherence score at pitch time and 5-year outcome",
  source: "CE1 §3.2, Research/Methods_and_Experiments_Reference.md",
} as const;
