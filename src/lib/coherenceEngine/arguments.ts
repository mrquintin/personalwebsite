// Toy argument fixtures for the Layer Scoring Lab.
// Per CE2 §2 (layer weights) and §4 (fusion + anti-gaming).
// All scores precomputed; no runtime ML.

export type PropositionType = "claim" | "premise" | "evidence" | "qualifier";
export type RelationType = "supports" | "attacks" | "qualifies";

export interface Proposition {
  id: string;
  text: string;
  type: PropositionType;
  importance: number; // post-adjustment, [0,1]
}

export interface Relation {
  sourceId: string;
  targetId: string;
  relationType: RelationType;
  strength: number; // [0,1]
}

export type AntiGamingKey =
  | "AG_TEMPLATE_OVERLAP"
  | "AG_PRIOR_CORPUS_ECHO"
  | "AG_CONTRADICTION_DENIAL"
  | "AG_REPETITIVE_FILLER"
  | "AG_FLUENCY_WITHOUT_CONTENT";

export const AG_WEIGHTS: Record<AntiGamingKey, number> = {
  AG_TEMPLATE_OVERLAP: 0.30,
  AG_PRIOR_CORPUS_ECHO: 0.25,
  AG_CONTRADICTION_DENIAL: 0.25,
  AG_REPETITIVE_FILLER: 0.20,
  AG_FLUENCY_WITHOUT_CONTENT: 0.15,
};

export const LAYER_WEIGHTS = {
  s1: 0.30,
  s2: 0.20,
  s3: 0.20,
  s4: 0.15,
  s5: 0.15,
} as const;

export interface S1Details {
  pairsChecked: number;
  pairsFlagged: number;
  topPairs: Array<{ i: string; j: string; prob: number }>;
  backend: "deberta-v3" | "heuristic";
  wcs: number;
}
export interface S2Details {
  groundedExtensionSize: number;
  totalArguments: number;
  fixedPointIterations: number;
  cycleCount: number;
  attackDensity: number;
  supportDensity: number;
  maxSupportDepth: number;
}
export interface S3Details {
  embedder: "sbert-mpnet" | "tfidf";
  pairCount: number;
  meanCosine: number;
  suspiciousFraction: number;
  hoyerMean: number;
  dampenedBy: number;
}
export interface S4Details {
  lJoint: number;
  lSum: number;
  ratio: number;
  s4Raw: number;
  lengthAdjustment: number;
}
export interface S5Details {
  connectivityKappa: number;
  isolationPenalty: number;
  circularityPenalty: number;
  depthBonus: number;
  longestChain: number;
}

export interface LayerResult<D> {
  score: number;
  weight: number;
  details: D;
  warnings?: string[];
}

export interface LayerScores {
  s1: LayerResult<S1Details>;
  s2: LayerResult<S2Details>;
  s3: LayerResult<S3Details>;
  s4: LayerResult<S4Details>;
  s5: LayerResult<S5Details>;
}

export interface FusionResult {
  s3BeforeFusion: number;
  s3AfterFusion: number;
  fusionCoefficient: number;
  trigger: "none" | "s1-high-confidence";
}

export interface AntiGamingResult {
  enabled: boolean;
  signals: Record<AntiGamingKey, number>;
  rawSum: number;
  score: number;
  floor: "clamped" | "unclamped";
  floorExpression: "clamp(1.0 - Σ w·s, 0.0, 1.0)";
}

export interface ArgumentFixture {
  id: string;
  label: string;
  topic: string;
  propositions: Proposition[];
  relations: Relation[];
  layerScores: LayerScores;
  fusion: FusionResult;
  antiGaming: AntiGamingResult;
  composite: number;
  compositeBeforeFusion: number;
  citation: "CE2 §2-§4";
}

function ag(signals: Record<AntiGamingKey, number>): AntiGamingResult {
  let rawSum = 0;
  for (const k of Object.keys(signals) as AntiGamingKey[]) {
    rawSum += AG_WEIGHTS[k] * signals[k];
  }
  const score = Math.max(0, Math.min(1, 1.0 - rawSum));
  return {
    enabled: true,
    signals,
    rawSum,
    score,
    floor: score === 0 || score === 1 ? "clamped" : "unclamped",
    floorExpression: "clamp(1.0 - Σ w·s, 0.0, 1.0)",
  };
}

const COHERENT: ArgumentFixture = {
  id: "a-coherent",
  label: "Reading fiction before sleep",
  topic: "A small benign argument with no contradictions.",
  propositions: [
    { id: "P1", text: "Reading fiction before sleep tends to reduce time spent on screens.", type: "claim", importance: 1.0 },
    { id: "P2", text: "Lower late-evening screen time is associated with falling asleep more easily, because blue light delays melatonin onset.", type: "premise", importance: 0.7 },
    { id: "P3", text: "Studies of bedtime routines show that participants who read printed pages report shorter sleep-onset latency.", type: "evidence", importance: 0.5 },
    { id: "P4", text: "In particular, fiction tends to engage attention without the alerting properties of news or social feeds.", type: "premise", importance: 0.7 },
    { id: "P5", text: "Therefore, replacing late-evening screen time with fiction is a low-cost adjustment with a plausible benefit.", type: "claim", importance: 1.0 },
  ],
  relations: [
    { sourceId: "P2", targetId: "P1", relationType: "supports", strength: 0.85 },
    { sourceId: "P3", targetId: "P2", relationType: "supports", strength: 0.7 },
    { sourceId: "P4", targetId: "P1", relationType: "supports", strength: 0.6 },
    { sourceId: "P1", targetId: "P5", relationType: "supports", strength: 0.9 },
  ],
  layerScores: {
    s1: { score: 0.92, weight: 0.30, details: { pairsChecked: 10, pairsFlagged: 0, topPairs: [], backend: "deberta-v3", wcs: 0.04 } },
    s2: { score: 0.81, weight: 0.20, details: { groundedExtensionSize: 5, totalArguments: 5, fixedPointIterations: 2, cycleCount: 0, attackDensity: 0.0, supportDensity: 0.4, maxSupportDepth: 3 } },
    s3: { score: 0.74, weight: 0.20, details: { embedder: "sbert-mpnet", pairCount: 10, meanCosine: 0.61, suspiciousFraction: 0.0, hoyerMean: 0.18, dampenedBy: 0 } },
    s4: { score: 0.68, weight: 0.15, details: { lJoint: 320, lSum: 980, ratio: 0.327, s4Raw: 0.673, lengthAdjustment: 0.007 } },
    s5: { score: 0.71, weight: 0.15, details: { connectivityKappa: 0.78, isolationPenalty: 0.04, circularityPenalty: 0.0, depthBonus: 1.0, longestChain: 3 } },
  },
  fusion: { s3BeforeFusion: 0.74, s3AfterFusion: 0.74, fusionCoefficient: 1.0, trigger: "none" },
  antiGaming: ag({ AG_TEMPLATE_OVERLAP: 0.05, AG_PRIOR_CORPUS_ECHO: 0.04, AG_CONTRADICTION_DENIAL: 0.03, AG_REPETITIVE_FILLER: 0.06, AG_FLUENCY_WITHOUT_CONTENT: 0.05 }),
  composite: 0,
  compositeBeforeFusion: 0,
  citation: "CE2 §2-§4",
};

const CONTRADICTORY: ArgumentFixture = {
  id: "a-contradictory",
  label: "Fiction before sleep — self-undermining",
  topic: "Same surface topic, rewritten to contain a contradiction and a circular path.",
  propositions: [
    { id: "P1", text: "Reading fiction before sleep reduces sleep-onset latency.", type: "claim", importance: 1.0 },
    { id: "P2", text: "Reading fiction before sleep does not reduce sleep-onset latency.", type: "claim", importance: 1.0 },
    { id: "P3", text: "P1 holds because P4 holds.", type: "premise", importance: 0.65 },
    { id: "P4", text: "P4 holds because P3 holds.", type: "premise", importance: 0.65 },
    { id: "P5", text: "Therefore, the recommendation to read fiction before sleep stands.", type: "claim", importance: 1.0 },
  ],
  relations: [
    { sourceId: "P2", targetId: "P1", relationType: "attacks", strength: 0.95 },
    { sourceId: "P3", targetId: "P1", relationType: "supports", strength: 0.5 },
    { sourceId: "P4", targetId: "P3", relationType: "supports", strength: 0.5 },
    { sourceId: "P3", targetId: "P4", relationType: "supports", strength: 0.5 },
    { sourceId: "P1", targetId: "P5", relationType: "supports", strength: 0.9 },
  ],
  layerScores: {
    s1: { score: 0.18, weight: 0.30, details: { pairsChecked: 10, pairsFlagged: 1, topPairs: [{ i: "P1", j: "P2", prob: 0.94 }], backend: "deberta-v3", wcs: 0.78 } },
    s2: { score: 0.34, weight: 0.20, details: { groundedExtensionSize: 1, totalArguments: 5, fixedPointIterations: 4, cycleCount: 1, attackDensity: 0.20, supportDensity: 0.30, maxSupportDepth: 2 } },
    s3: { score: 0.48, weight: 0.20, details: { embedder: "sbert-mpnet", pairCount: 10, meanCosine: 0.66, suspiciousFraction: 0.10, hoyerMean: 0.41, dampenedBy: 0.16 } },
    s4: { score: 0.41, weight: 0.15, details: { lJoint: 410, lSum: 700, ratio: 0.586, s4Raw: 0.414, lengthAdjustment: -0.004 } },
    s5: { score: 0.32, weight: 0.15, details: { connectivityKappa: 0.42, isolationPenalty: 0.10, circularityPenalty: 0.30, depthBonus: 0.67, longestChain: 2 } },
  },
  fusion: { s3BeforeFusion: 0.64, s3AfterFusion: 0.48, fusionCoefficient: 0.75, trigger: "s1-high-confidence" },
  antiGaming: ag({ AG_TEMPLATE_OVERLAP: 0.10, AG_PRIOR_CORPUS_ECHO: 0.08, AG_CONTRADICTION_DENIAL: 0.60, AG_REPETITIVE_FILLER: 0.12, AG_FLUENCY_WITHOUT_CONTENT: 0.15 }),
  composite: 0,
  compositeBeforeFusion: 0,
  citation: "CE2 §2-§4",
};

const MIXED: ArgumentFixture = {
  id: "a-mixed",
  label: "Selecting a walking shoe",
  topic: "A 7-proposition argument with one small contradiction over a minor premise.",
  propositions: [
    { id: "P1", text: "A walking shoe should match the typical surface and distance of the wearer.", type: "claim", importance: 1.0 },
    { id: "P2", text: "Soft cushioning helps on paved surfaces over long distances.", type: "premise", importance: 0.7 },
    { id: "P3", text: "Stiffer midsoles help on uneven terrain by improving lateral stability.", type: "premise", importance: 0.7 },
    { id: "P4", text: "Studies of running gait extend partially to walking biomechanics.", type: "evidence", importance: 0.5 },
    { id: "P5", text: "Wide toe boxes are universally beneficial for walking shoes.", type: "qualifier", importance: 0.3 },
    { id: "P6", text: "Wide toe boxes are not always beneficial for walking shoes; some narrow lasts work better for specific feet.", type: "qualifier", importance: 0.3 },
    { id: "P7", text: "Therefore, choose features by surface, distance, and individual fit, not by universal rules.", type: "claim", importance: 1.0 },
  ],
  relations: [
    { sourceId: "P2", targetId: "P1", relationType: "supports", strength: 0.7 },
    { sourceId: "P3", targetId: "P1", relationType: "supports", strength: 0.7 },
    { sourceId: "P4", targetId: "P2", relationType: "supports", strength: 0.5 },
    { sourceId: "P6", targetId: "P5", relationType: "attacks", strength: 0.65 },
    { sourceId: "P1", targetId: "P7", relationType: "supports", strength: 0.85 },
  ],
  layerScores: {
    s1: { score: 0.62, weight: 0.30, details: { pairsChecked: 21, pairsFlagged: 1, topPairs: [{ i: "P5", j: "P6", prob: 0.71 }], backend: "heuristic", wcs: 0.20 }, warnings: ["S1 backend on heuristic fallback for this fixture; deberta-v3 unavailable in current run."] },
    s2: { score: 0.58, weight: 0.20, details: { groundedExtensionSize: 4, totalArguments: 7, fixedPointIterations: 3, cycleCount: 0, attackDensity: 0.10, supportDensity: 0.35, maxSupportDepth: 2 } },
    s3: { score: 0.55, weight: 0.20, details: { embedder: "sbert-mpnet", pairCount: 21, meanCosine: 0.59, suspiciousFraction: 0.05, hoyerMean: 0.27, dampenedBy: 0.04 } },
    s4: { score: 0.52, weight: 0.15, details: { lJoint: 470, lSum: 980, ratio: 0.480, s4Raw: 0.520, lengthAdjustment: 0.0 } },
    s5: { score: 0.49, weight: 0.15, details: { connectivityKappa: 0.55, isolationPenalty: 0.06, circularityPenalty: 0.0, depthBonus: 0.67, longestChain: 2 } },
  },
  fusion: { s3BeforeFusion: 0.59, s3AfterFusion: 0.55, fusionCoefficient: 0.92, trigger: "s1-high-confidence" },
  antiGaming: ag({ AG_TEMPLATE_OVERLAP: 0.20, AG_PRIOR_CORPUS_ECHO: 0.10, AG_CONTRADICTION_DENIAL: 0.08, AG_REPETITIVE_FILLER: 0.10, AG_FLUENCY_WITHOUT_CONTENT: 0.12 }),
  composite: 0,
  compositeBeforeFusion: 0,
  citation: "CE2 §2-§4",
};

function compute(fix: ArgumentFixture): ArgumentFixture {
  const ls = fix.layerScores;
  const beforeFusion = LAYER_WEIGHTS.s1 * ls.s1.score + LAYER_WEIGHTS.s2 * ls.s2.score + LAYER_WEIGHTS.s3 * fix.fusion.s3BeforeFusion + LAYER_WEIGHTS.s4 * ls.s4.score + LAYER_WEIGHTS.s5 * ls.s5.score;
  const afterFusion = LAYER_WEIGHTS.s1 * ls.s1.score + LAYER_WEIGHTS.s2 * ls.s2.score + LAYER_WEIGHTS.s3 * ls.s3.score + LAYER_WEIGHTS.s4 * ls.s4.score + LAYER_WEIGHTS.s5 * ls.s5.score;
  const composite = afterFusion * fix.antiGaming.score;
  return { ...fix, compositeBeforeFusion: beforeFusion, composite };
}

export const ARGUMENT_FIXTURES: ArgumentFixture[] = [compute(COHERENT), compute(CONTRADICTORY), compute(MIXED)];

export function findFixture(id: string): ArgumentFixture {
  return ARGUMENT_FIXTURES.find((f) => f.id === id) ?? ARGUMENT_FIXTURES[0];
}

export const LAYER_INFO = [
  { n: 1, key: "s1", name: "CONTRADICTION", weight: 0.30 },
  { n: 2, key: "s2", name: "ARGUMENTATION", weight: 0.20 },
  { n: 3, key: "s3", name: "EMBEDDING", weight: 0.20 },
  { n: 4, key: "s4", name: "COMPRESSION", weight: 0.15 },
  { n: 5, key: "s5", name: "STRUCTURAL", weight: 0.15 },
] as const;
