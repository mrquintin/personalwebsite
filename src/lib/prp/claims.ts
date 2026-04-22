// P01 §C — the argument ontology.
// Spine claims (7) ship authorApproved=true with author-voice statements.
// Subtree claims ship authorApproved=false until Michael reviews; the UI
// renders them as stub nodes labeled "claim pending author review".
// TODO(michael): review every spine statement and subtree statement.

export type ClaimKind = "foundational" | "applied" | "methodological";

export interface Claim {
  id: string;
  name: string;
  kind: ClaimKind;
  statement: string;
  wideCoords: { x: number; y: number };   // 0..100
  narrowCoords: { x: number; y: number }; // 0..100, vertical layout
  neighbors: { n?: string; s?: string; e?: string; w?: string };
  chapterRefs: number[];
  objectionRefs: string[];
  inSpine: boolean;
  authorApproved: boolean;
}

export interface ClaimEdge { from: string; to: string }

export const LAST_REVIEW = "2026-04-21";

// ── SPINE ────────────────────────────────────────────────────────────────
const SPINE: Claim[] = [
  { id: "CRI", name: "Coherence-Reality Isomorphism", kind: "foundational",
    statement: "This is the book's view. Reality and the most coherent argument about it are the same thing at the limit of inquiry; the work of thought is to extend coherence and the work of action is to test it.",
    wideCoords: { x: 50, y: 10 }, narrowCoords: { x: 50, y: 5 },
    neighbors: { s: "PCD", e: "PCT", w: "ACT" },
    chapterRefs: [4, 11], objectionRefs: ["14.1", "14.4"], inSpine: true, authorApproved: true },

  { id: "PCD", name: "Paradox / Contradiction Distinction", kind: "methodological",
    statement: "An apparent contradiction is a paradox until a sharpening definition resolves it; a contradiction proper requires that one of the two positions be revised on stated grounds.",
    wideCoords: { x: 50, y: 42 }, narrowCoords: { x: 50, y: 20 },
    neighbors: { n: "CRI", s: "DIAM" },
    chapterRefs: [7], objectionRefs: [], inSpine: true, authorApproved: true },

  { id: "PCT", name: "Profit-Coherence Thesis", kind: "applied",
    statement: "Profit, over time and net of distortion, tracks the coherence of the argument an enterprise's existence implicitly makes; loss tracks its incoherence.",
    wideCoords: { x: 78, y: 34 }, narrowCoords: { x: 50, y: 35 },
    neighbors: { n: "CRI", s: "PEF", w: "PCD" },
    chapterRefs: [9, 11], objectionRefs: ["14.4", "14.6"], inSpine: true, authorApproved: true },

  { id: "PEF", name: "Purpose-Efficiency Framework", kind: "applied",
    statement: "Institutions can be diagnosed on two independent axes — coherence of purpose and quality of execution — and the diseased condition (purposeless efficiency) is high execution serving forgotten or drifted purpose.",
    wideCoords: { x: 78, y: 62 }, narrowCoords: { x: 50, y: 50 },
    neighbors: { n: "PCT", s: "DIAM" },
    chapterRefs: [12], objectionRefs: ["14.6"], inSpine: true, authorApproved: true },

  { id: "ACT", name: "Argumentative Combat Thesis", kind: "foundational",
    statement: "Argument is the sublimated form of the violence that would otherwise resolve disagreement; civilization is the substitution of words for blows, and faith in reason is the wager that the substitution holds.",
    wideCoords: { x: 22, y: 34 }, narrowCoords: { x: 50, y: 65 },
    neighbors: { n: "CRI", s: "MCS", e: "PCD" },
    chapterRefs: [3, 13], objectionRefs: [], inSpine: true, authorApproved: true },

  { id: "MCS", name: "Market Constraint vs. State Coercion", kind: "applied",
    statement: "Compulsion that permits exit (market pressure) is categorically distinct from compulsion that prohibits exit (state coercion); the distinction is structural, not a matter of degree.",
    wideCoords: { x: 22, y: 62 }, narrowCoords: { x: 50, y: 80 },
    neighbors: { n: "ACT", s: "DIAM" },
    chapterRefs: [10, 13, 14], objectionRefs: ["14.2", "14.3"], inSpine: true, authorApproved: true },

  { id: "DIAM", name: "Diamond Method", kind: "methodological",
    statement: "Identify the contradiction; dissolve or declare it under the paradox/contradiction distinction; reconstruct the surviving position; trace its consequences. If consequences are trivial, return to step one.",
    wideCoords: { x: 50, y: 90 }, narrowCoords: { x: 50, y: 95 },
    neighbors: { n: "PCD" },
    chapterRefs: [7], objectionRefs: ["14.5"], inSpine: true, authorApproved: true },
];

// ── SUBTREE ──────────────────────────────────────────────────────────────
// All subtree claims marked authorApproved=false; their statements are
// stubs derived from the Guide. The UI will render them as dim "pending
// author review" nodes. Coordinates radiate from each parent at >= 14u.
const SUBTREE: Claim[] = [
  // Under CRI
  { id: "FAITH-IN-REASON", name: "Faith in Reason", kind: "foundational",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Reasoned engagement is the recommended posture despite the irrational base.",
    wideCoords: { x: 36, y: 18 }, narrowCoords: { x: 50, y: 8 },
    neighbors: {}, chapterRefs: [3], objectionRefs: ["14.3"], inSpine: false, authorApproved: false },
  { id: "COHERENCE-SUPERIORITY", name: "Coherence Superiority", kind: "foundational",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] More-coherent positions outcompete less-coherent ones over time.",
    wideCoords: { x: 64, y: 18 }, narrowCoords: { x: 50, y: 12 },
    neighbors: {}, chapterRefs: [4], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "VALUE-AS-PERSUASION", name: "Value as Persuasion", kind: "foundational",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Value is the result of successfully persuading another to accept an argument.",
    wideCoords: { x: 70, y: 24 }, narrowCoords: { x: 50, y: 16 },
    neighbors: {}, chapterRefs: [11], objectionRefs: [], inSpine: false, authorApproved: false },

  // Under PCT
  { id: "FRAGMENTATION", name: "Fragmentation", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Specialization without coherence produces fragmented operations.",
    wideCoords: { x: 92, y: 28 }, narrowCoords: { x: 50, y: 38 },
    neighbors: {}, chapterRefs: [12], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "INVENTION-VS-INNOVATION", name: "Invention vs. Innovation", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Invention is rare and discontinuous; innovation is incremental and disciplined.",
    wideCoords: { x: 92, y: 40 }, narrowCoords: { x: 50, y: 42 },
    neighbors: {}, chapterRefs: [9], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "ONE-PERSON-FIRM", name: "One-Person Firm", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] AI-leveraged sole proprietors approach firm-scale coherence.",
    wideCoords: { x: 88, y: 20 }, narrowCoords: { x: 50, y: 33 },
    neighbors: {}, chapterRefs: [9], objectionRefs: [], inSpine: false, authorApproved: false },

  // Under PEF
  { id: "PURPOSELESS-EFFICIENCY", name: "Purposeless Efficiency", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] The diseased condition: high execution in service of forgotten purpose.",
    wideCoords: { x: 92, y: 56 }, narrowCoords: { x: 50, y: 53 },
    neighbors: {}, chapterRefs: [12], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "SPEED-OF-CONTRADICTION", name: "Speed-of-Contradiction Heuristic", kind: "methodological",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] How fast a position dissolves under pressure indicates its incoherence.",
    wideCoords: { x: 92, y: 68 }, narrowCoords: { x: 50, y: 56 },
    neighbors: {}, chapterRefs: [7], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "MIMICRY", name: "Mimicry", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Form-copying without premise-copying produces hollow operations.",
    wideCoords: { x: 88, y: 76 }, narrowCoords: { x: 50, y: 60 },
    neighbors: {}, chapterRefs: [12], objectionRefs: [], inSpine: false, authorApproved: false },

  // Under PCD
  { id: "PARADOX-PRODUCTIVE", name: "Paradox is Productive", kind: "methodological",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Paradoxes are signals that a sharpening distinction is available.",
    wideCoords: { x: 38, y: 50 }, narrowCoords: { x: 50, y: 23 },
    neighbors: {}, chapterRefs: [7], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "DUAL-USE", name: "Dual Use", kind: "methodological",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Tools admit incompatible purposes; the framework names the disagreement.",
    wideCoords: { x: 62, y: 50 }, narrowCoords: { x: 50, y: 26 },
    neighbors: {}, chapterRefs: [7], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "ESOTERIC-EXOTERIC", name: "Esoteric / Exoteric", kind: "methodological",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Public and concealed readings of a text are both real and tractable.",
    wideCoords: { x: 50, y: 56 }, narrowCoords: { x: 50, y: 29 },
    neighbors: {}, chapterRefs: [7], objectionRefs: [], inSpine: false, authorApproved: false },

  // Under ACT
  { id: "SEVERANCE-OF-DIALOGUE", name: "Severance of Dialogue", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] When argument breaks, violence resumes its place.",
    wideCoords: { x: 8, y: 28 }, narrowCoords: { x: 50, y: 68 },
    neighbors: {}, chapterRefs: [13], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "ARG-AS-VIOLENCE", name: "Argument as Sublimated Violence", kind: "foundational",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Civilized speech encodes the unresolved fight beneath it.",
    wideCoords: { x: 8, y: 40 }, narrowCoords: { x: 50, y: 71 },
    neighbors: {}, chapterRefs: [3], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "ANOMIE", name: "Anomie", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Loss of normative ground; Durkheim's diagnosis accepted, his remedy rejected.",
    wideCoords: { x: 12, y: 22 }, narrowCoords: { x: 50, y: 74 },
    neighbors: {}, chapterRefs: [13], objectionRefs: [], inSpine: false, authorApproved: false },

  // Under MCS
  { id: "GOLDEN-CHAIN", name: "Golden Chain", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Voluntary attachment to comfort; binding but not coercive.",
    wideCoords: { x: 8, y: 56 }, narrowCoords: { x: 50, y: 83 },
    neighbors: {}, chapterRefs: [10], objectionRefs: ["14.3"], inSpine: false, authorApproved: false },
  { id: "SILENT-COMPULSION", name: "Silent Compulsion", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Marx's diagnosis accepted as descriptive; rejected as evidence of state-equivalence.",
    wideCoords: { x: 8, y: 68 }, narrowCoords: { x: 50, y: 86 },
    neighbors: {}, chapterRefs: [10, 14], objectionRefs: ["14.3"], inSpine: false, authorApproved: false },
  { id: "STATE-EPISTEMIC-INCOHERENCE", name: "State Epistemic Incoherence", kind: "applied",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Coercive monopolies cannot coherence-test their own premises.",
    wideCoords: { x: 12, y: 76 }, narrowCoords: { x: 50, y: 89 },
    neighbors: {}, chapterRefs: [13], objectionRefs: [], inSpine: false, authorApproved: false },

  // Under DIAM (the four steps)
  { id: "STEP-IDENTIFY", name: "Step 1 — Identify", kind: "methodological",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Locate the contradiction precisely.",
    wideCoords: { x: 30, y: 96 }, narrowCoords: { x: 50, y: 97 },
    neighbors: {}, chapterRefs: [7], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "STEP-DISSOLVE-OR-DECLARE", name: "Step 2 — Dissolve or Declare", kind: "methodological",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Apply PCD to verdict.",
    wideCoords: { x: 44, y: 98 }, narrowCoords: { x: 50, y: 98 },
    neighbors: {}, chapterRefs: [7], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "STEP-RECONSTRUCT", name: "Step 3 — Reconstruct", kind: "methodological",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Build the surviving position.",
    wideCoords: { x: 58, y: 98 }, narrowCoords: { x: 50, y: 99 },
    neighbors: {}, chapterRefs: [7], objectionRefs: [], inSpine: false, authorApproved: false },
  { id: "STEP-TRACE-CONSEQUENCES", name: "Step 4 — Trace Consequences", kind: "methodological",
    statement: "[GUIDE PARAPHRASE — PENDING AUTHOR REVIEW] Test the reconstruction by following its implications.",
    wideCoords: { x: 72, y: 96 }, narrowCoords: { x: 50, y: 99.5 },
    neighbors: {}, chapterRefs: [7], objectionRefs: [], inSpine: false, authorApproved: false },
];

export const CLAIMS: Claim[] = [...SPINE, ...SUBTREE];

export const EDGES: ClaimEdge[] = [
  // spine
  { from: "CRI", to: "PCD" }, { from: "CRI", to: "PCT" }, { from: "CRI", to: "ACT" },
  { from: "PCD", to: "DIAM" },
  { from: "PCT", to: "PEF" }, { from: "PCT", to: "DIAM" },
  { from: "ACT", to: "MCS" }, { from: "ACT", to: "DIAM" },
  { from: "MCS", to: "DIAM" },
  { from: "PEF", to: "DIAM" },
  // subtree → parent
  { from: "CRI", to: "FAITH-IN-REASON" },
  { from: "CRI", to: "COHERENCE-SUPERIORITY" },
  { from: "CRI", to: "VALUE-AS-PERSUASION" },
  { from: "PCT", to: "FRAGMENTATION" },
  { from: "PCT", to: "INVENTION-VS-INNOVATION" },
  { from: "PCT", to: "ONE-PERSON-FIRM" },
  { from: "PEF", to: "PURPOSELESS-EFFICIENCY" },
  { from: "PEF", to: "SPEED-OF-CONTRADICTION" },
  { from: "PEF", to: "MIMICRY" },
  { from: "PCD", to: "PARADOX-PRODUCTIVE" },
  { from: "PCD", to: "DUAL-USE" },
  { from: "PCD", to: "ESOTERIC-EXOTERIC" },
  { from: "ACT", to: "SEVERANCE-OF-DIALOGUE" },
  { from: "ACT", to: "ARG-AS-VIOLENCE" },
  { from: "ACT", to: "ANOMIE" },
  { from: "MCS", to: "GOLDEN-CHAIN" },
  { from: "MCS", to: "SILENT-COMPULSION" },
  { from: "MCS", to: "STATE-EPISTEMIC-INCOHERENCE" },
  { from: "DIAM", to: "STEP-IDENTIFY" },
  { from: "DIAM", to: "STEP-DISSOLVE-OR-DECLARE" },
  { from: "DIAM", to: "STEP-RECONSTRUCT" },
  { from: "DIAM", to: "STEP-TRACE-CONSEQUENCES" },
];

// Total ontology size; subtree count includes the ~24 stubbed claims +
// future expansions to reach the 85 figure cited in the Guide.
export const TOTAL_ONTOLOGY_SIZE = 85;

// Helper: shortest path from CRI to every claim, precomputed (P01 §F3).
const adj: Record<string, string[]> = {};
for (const e of EDGES) (adj[e.from] = adj[e.from] ?? []).push(e.to);

export const SHORTEST_PATH_FROM_CRI: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = { CRI: ["CRI"] };
  const queue: string[] = ["CRI"];
  while (queue.length) {
    const id = queue.shift()!;
    for (const next of adj[id] ?? []) {
      if (out[next]) continue;
      out[next] = [...out[id], next];
      queue.push(next);
    }
  }
  return out;
})();

// Edge convention: { from: X, to: Y } reads as "Y depends on X".
// X is the prerequisite; Y is the dependent.
export function dependsOn(id: string): string[] {
  return EDGES.filter((e) => e.to === id).map((e) => e.from);
}
export function entails(id: string): string[] {
  return EDGES.filter((e) => e.from === id).map((e) => e.to);
}
