// Five DecisionInput fixtures with precomputed GateRunResult.
// Each fixture also carries three regime variants per CE4 §3.2 + P04 §C8.
import { DOMAIN_PARAMS, type DomainKey } from "./domainParameters";

export type Regime = "normal" | "defensive" | "stress";

export type GateKey =
  | "quality_gate"
  | "compliance_gate"
  | "anti_gaming_gate"
  | "portfolio_gate"
  | "coherence_gate"
  | "confidence_gate";

export type GateVerdict = "pass" | "fail" | "manual_review" | "pending";

export type RTermKey =
  | "r_utilization"
  | "r_domain_count"
  | "r_pipeline"
  | "r_domain_usd"
  | "r_liquidity"
  | "r_drawdown"
  | "r_regime";

export const GATE_ORDER: GateKey[] = [
  "quality_gate",
  "compliance_gate",
  "anti_gaming_gate",
  "portfolio_gate",
  "coherence_gate",
  "confidence_gate",
];

export interface PortfolioState {
  utilization: number;
  domain_count_in_primary: number;
  open_pipeline_count: number;
  domain_usd_fraction: number;
  post_request_headroom: number;
  drawdown: number;
  regime: Regime;
}

export interface DecisionInput {
  application_id: string;
  founder_id: string;
  requested_check_usd: number;
  domain_primary: DomainKey;
  domain_mix: Array<{ domain: DomainKey; weight: number }>;
  coherence_superiority: number;
  coherence_superiority_ci95: { lower: number; upper: number };
  transcript_quality_score: number;
  transcript_quality_detail?: {
    founder_words: number;
    turns: number;
    mean_confidence: number;
    low_confidence_ratio: number;
    topic_coverage: number;
  };
  anti_gaming_score: number;
  compliance_status: "clear" | "review_required" | "blocked";
  portfolio_state: PortfolioState;
  policy_version: "decision-policy-v1.0.0";
}

export interface CSReqDecomp {
  domainBase: number;
  logScaleTerm: number;
  rTotal: number;
  rBreakdown: Record<RTermKey, number>;
  csReq: number;
  csObserved: number;
  margin: number;
}

export interface GateRunResult {
  inputId: string;
  perGate: Array<{
    gate: GateKey;
    verdict: GateVerdict;
    reasonCodes: string[];
    detail: Record<string, unknown>;
  }>;
  overall: GateVerdict;
  csReq: CSReqDecomp;
  ciWidth: number;
  artifactHashStub: string;
  haltedAt: number | null; // index in GATE_ORDER where pipeline halted; null if all run
}

export interface RegimeVariant {
  portfolio_state: PortfolioState;
  gateRunResult: GateRunResult;
}

export interface DecisionInputWithVariants extends DecisionInput {
  regimeVariants: Record<Regime, RegimeVariant>;
}

// --- helpers ----------------------------------------------------------

function rRegimeFor(regime: Regime): number {
  if (regime === "stress") return 0.015;
  if (regime === "defensive") return 0.010;
  return 0.000;
}

function rUtilization(u: number): number {
  let r = 0;
  if (u >= 0.88) r += 0.01;
  if (u >= 0.93) r += 0.01;
  if (u >= 0.97) r += 0.01;
  return r;
}
function rDomainCount(c: number): number { return c >= 25 ? 0.015 : 0; }
function rPipeline(c: number): number { return c >= 40 ? 0.01 : 0; }
function rDomainUsd(f: number): number {
  let r = 0;
  if (f >= 0.28) r += 0.005;
  if (f >= 0.36) r += 0.005;
  return r;
}
function rLiquidity(h: number): number {
  let r = 0;
  if (h < 0.08) r += 0.005;
  if (h < 0.05) r += 0.005;
  return r;
}
function rDrawdown(d: number): number {
  let r = 0;
  if (d >= 0.12) r += 0.01;
  if (d >= 0.22) r += 0.01;
  return r;
}

function computeR(ps: PortfolioState): { breakdown: Record<RTermKey, number>; total: number } {
  const breakdown: Record<RTermKey, number> = {
    r_utilization: rUtilization(ps.utilization),
    r_domain_count: rDomainCount(ps.domain_count_in_primary),
    r_pipeline: rPipeline(ps.open_pipeline_count),
    r_domain_usd: rDomainUsd(ps.domain_usd_fraction),
    r_liquidity: rLiquidity(ps.post_request_headroom),
    r_drawdown: rDrawdown(ps.drawdown),
    r_regime: rRegimeFor(ps.regime),
  };
  let total = 0;
  for (const k of Object.keys(breakdown) as RTermKey[]) total += breakdown[k];
  total = Math.min(0.35, Math.max(0, total));
  return { breakdown, total };
}

function computeCSReq(input: DecisionInput, ps: PortfolioState): CSReqDecomp {
  const params = DOMAIN_PARAMS[input.domain_primary];
  const logScale = params.alpha * Math.log2(input.requested_check_usd / params.Sdmin);
  const r = computeR(ps);
  const csReq = +(params.CSd0 + logScale + r.total).toFixed(6);
  const csObserved = input.coherence_superiority_ci95.lower;
  return {
    domainBase: params.CSd0,
    logScaleTerm: +logScale.toFixed(6),
    rTotal: +r.total.toFixed(6),
    rBreakdown: r.breakdown,
    csReq,
    csObserved,
    margin: +(csObserved - csReq).toFixed(6),
  };
}

function evaluateGates(input: DecisionInput, ps: PortfolioState, csReq: CSReqDecomp): GateRunResult {
  const perGate: GateRunResult["perGate"] = [];
  let halt: number | null = null;
  let overall: GateVerdict = "pass";

  // 1. quality_gate
  const q = input.transcript_quality_detail;
  const qReasons: string[] = [];
  if (q) {
    if (q.founder_words < 400) qReasons.push("QUALITY_BELOW_MIN_WORDS");
    if (q.turns < 20) qReasons.push("QUALITY_BELOW_MIN_TURNS");
    if (q.mean_confidence < 0.70) qReasons.push("QUALITY_ASR_CONFIDENCE_LOW");
    if (q.low_confidence_ratio > 0.15) qReasons.push("QUALITY_LOW_CONFIDENCE_RATIO_HIGH");
    if (q.topic_coverage < 0.60) qReasons.push("QUALITY_TOPIC_COVERAGE_LOW");
  }
  const qVerdict: GateVerdict = qReasons.length === 0 ? "pass" : "fail";
  perGate.push({ gate: "quality_gate", verdict: qVerdict, reasonCodes: qReasons, detail: { score: input.transcript_quality_score, ...(q ?? {}) } });
  if (qVerdict !== "pass" && halt === null) { halt = 0; overall = qVerdict; }

  // 2. compliance_gate
  if (halt === null) {
    const cs = input.compliance_status;
    const v: GateVerdict = cs === "clear" ? "pass" : cs === "review_required" ? "manual_review" : "fail";
    const codes = cs === "clear" ? [] : cs === "review_required" ? ["COMPLIANCE_REVIEW_REQUIRED"] : ["COMPLIANCE_BLOCKED"];
    perGate.push({ gate: "compliance_gate", verdict: v, reasonCodes: codes, detail: { status: cs } });
    if (v !== "pass") { halt = 1; overall = v; }
  } else {
    perGate.push({ gate: "compliance_gate", verdict: "pending", reasonCodes: [], detail: { skipped: true } });
  }

  // 3. anti_gaming_gate
  if (halt === null) {
    const a = input.anti_gaming_score;
    let v: GateVerdict = "pass";
    const codes: string[] = [];
    if (a >= 0.60) { v = "fail"; codes.push("ANTI_GAMING_ABOVE_MAX"); }
    else if (a >= 0.35) { v = "manual_review"; codes.push("ANTI_GAMING_WARN_BAND"); }
    perGate.push({ gate: "anti_gaming_gate", verdict: v, reasonCodes: codes, detail: { score: a, warn_min: 0.35, max: 0.60 } });
    if (v !== "pass") { halt = 2; overall = v; }
  } else {
    perGate.push({ gate: "anti_gaming_gate", verdict: "pending", reasonCodes: [], detail: { skipped: true } });
  }

  // 4. portfolio_gate
  if (halt === null) {
    const codes: string[] = [];
    const sMax = 500000;
    const domainCap = 0.30;
    const liqFloor = 0.08;
    const projectedDomainExposure = ps.domain_usd_fraction; // proxy after this check
    const projectedHeadroom = ps.post_request_headroom;
    if (input.requested_check_usd > sMax) codes.push("PORTFOLIO_CHECK_OVER_MAX");
    if (projectedDomainExposure > domainCap) codes.push("PORTFOLIO_DOMAIN_HARD_CAP");
    if (projectedHeadroom < liqFloor) codes.push("PORTFOLIO_LIQUIDITY_FLOOR");
    const v: GateVerdict = codes.length === 0 ? "pass" : "fail";
    perGate.push({
      gate: "portfolio_gate", verdict: v, reasonCodes: codes,
      detail: { S: input.requested_check_usd, S_max: sMax, domain_exposure: projectedDomainExposure, domain_hard_cap: domainCap, headroom: projectedHeadroom, liquidity_floor: liqFloor },
    });
    if (v !== "pass") { halt = 3; overall = v; }
  } else {
    perGate.push({ gate: "portfolio_gate", verdict: "pending", reasonCodes: [], detail: { skipped: true } });
  }

  // 5. coherence_gate
  if (halt === null) {
    const v: GateVerdict = csReq.csObserved >= csReq.csReq ? "pass" : "fail";
    const codes = v === "pass" ? [] : ["COHERENCE_BELOW_THRESHOLD"];
    perGate.push({ gate: "coherence_gate", verdict: v, reasonCodes: codes, detail: { csObserved: csReq.csObserved, csReq: csReq.csReq, margin: csReq.margin } });
    if (v !== "pass") { halt = 4; overall = v; }
  } else {
    perGate.push({ gate: "coherence_gate", verdict: "pending", reasonCodes: [], detail: { skipped: true } });
  }

  // 6. confidence_gate
  const ciWidth = +(input.coherence_superiority_ci95.upper - input.coherence_superiority_ci95.lower).toFixed(6);
  if (halt === null) {
    let v: GateVerdict = "pass";
    const codes: string[] = [];
    if (ciWidth >= 0.20) { v = "fail"; codes.push("CONFIDENCE_INTERVAL_ABOVE_MAX"); }
    else if (ciWidth > 0.14) { v = "manual_review"; codes.push("CONFIDENCE_INTERVAL_WARN"); }
    perGate.push({ gate: "confidence_gate", verdict: v, reasonCodes: codes, detail: { ciWidth, warn: 0.14, max: 0.20 } });
    if (v !== "pass") { overall = v; }
  } else {
    perGate.push({ gate: "confidence_gate", verdict: "pending", reasonCodes: [], detail: { skipped: true } });
  }

  // hash stub: deterministic from inputId + regime + verdicts
  const verdictKey = perGate.map((g) => g.verdict[0]).join("");
  const stubBase = `${input.application_id}|${ps.regime}|${verdictKey}|${csReq.csReq.toFixed(4)}`;
  const stub = simpleStub(stubBase);

  return {
    inputId: input.application_id,
    perGate,
    overall,
    csReq,
    ciWidth,
    artifactHashStub: stub,
    haltedAt: halt,
  };
}

function simpleStub(s: string): string {
  // 12-hex-char deterministic stub (FNV-1a 32 + xorshift mix to fill 48 bits)
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let h2 = h ^ 0xdeadbeef;
  h2 = Math.imul(h2, 0x9e3779b1) >>> 0;
  return (h.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).slice(0, 12);
}

// --- five fixtures (DecisionInput + portfolio_state per regime) -------

const INPUT_BASE: DecisionInput[] = [
  {
    application_id: "app-01-pass",
    founder_id: "fnd-01",
    requested_check_usd: 150000,
    domain_primary: "market_economics",
    domain_mix: [{ domain: "market_economics", weight: 1.0 }],
    coherence_superiority: 0.32,
    coherence_superiority_ci95: { lower: 0.27, upper: 0.36 },
    transcript_quality_score: 0.84,
    transcript_quality_detail: { founder_words: 720, turns: 36, mean_confidence: 0.82, low_confidence_ratio: 0.08, topic_coverage: 0.74 },
    anti_gaming_score: 0.12,
    compliance_status: "clear",
    portfolio_state: { utilization: 0.61, domain_count_in_primary: 12, open_pipeline_count: 18, domain_usd_fraction: 0.18, post_request_headroom: 0.22, drawdown: 0.04, regime: "normal" },
    policy_version: "decision-policy-v1.0.0",
  },
  {
    application_id: "app-02-manual",
    founder_id: "fnd-02",
    requested_check_usd: 220000,
    domain_primary: "governance",
    domain_mix: [{ domain: "governance", weight: 1.0 }],
    coherence_superiority: 0.30,
    coherence_superiority_ci95: { lower: 0.25, upper: 0.35 },
    transcript_quality_score: 0.79,
    transcript_quality_detail: { founder_words: 640, turns: 28, mean_confidence: 0.78, low_confidence_ratio: 0.10, topic_coverage: 0.71 },
    anti_gaming_score: 0.42,
    compliance_status: "clear",
    portfolio_state: { utilization: 0.74, domain_count_in_primary: 10, open_pipeline_count: 22, domain_usd_fraction: 0.22, post_request_headroom: 0.18, drawdown: 0.06, regime: "normal" },
    policy_version: "decision-policy-v1.0.0",
  },
  {
    application_id: "app-03-fail-coh",
    founder_id: "fnd-03",
    requested_check_usd: 350000,
    domain_primary: "public_health",
    domain_mix: [{ domain: "public_health", weight: 1.0 }],
    coherence_superiority: 0.10,
    coherence_superiority_ci95: { lower: 0.05, upper: 0.15 },
    transcript_quality_score: 0.81,
    transcript_quality_detail: { founder_words: 690, turns: 30, mean_confidence: 0.79, low_confidence_ratio: 0.09, topic_coverage: 0.73 },
    anti_gaming_score: 0.18,
    compliance_status: "clear",
    portfolio_state: { utilization: 0.89, domain_count_in_primary: 26, open_pipeline_count: 42, domain_usd_fraction: 0.30, post_request_headroom: 0.10, drawdown: 0.13, regime: "normal" },
    policy_version: "decision-policy-v1.0.0",
  },
  {
    application_id: "app-04-fail-port",
    founder_id: "fnd-04",
    requested_check_usd: 180000,
    domain_primary: "market_economics",
    domain_mix: [{ domain: "market_economics", weight: 1.0 }],
    coherence_superiority: 0.34,
    coherence_superiority_ci95: { lower: 0.29, upper: 0.38 },
    transcript_quality_score: 0.83,
    transcript_quality_detail: { founder_words: 700, turns: 33, mean_confidence: 0.81, low_confidence_ratio: 0.08, topic_coverage: 0.76 },
    anti_gaming_score: 0.14,
    compliance_status: "clear",
    portfolio_state: { utilization: 0.79, domain_count_in_primary: 18, open_pipeline_count: 25, domain_usd_fraction: 0.34, post_request_headroom: 0.12, drawdown: 0.07, regime: "normal" },
    policy_version: "decision-policy-v1.0.0",
  },
  {
    application_id: "app-05-manual-ci",
    founder_id: "fnd-05",
    requested_check_usd: 200000,
    domain_primary: "governance",
    domain_mix: [{ domain: "governance", weight: 1.0 }],
    coherence_superiority: 0.31,
    coherence_superiority_ci95: { lower: 0.23, upper: 0.40 },
    transcript_quality_score: 0.80,
    transcript_quality_detail: { founder_words: 660, turns: 27, mean_confidence: 0.77, low_confidence_ratio: 0.11, topic_coverage: 0.70 },
    anti_gaming_score: 0.20,
    compliance_status: "clear",
    portfolio_state: { utilization: 0.66, domain_count_in_primary: 11, open_pipeline_count: 19, domain_usd_fraction: 0.20, post_request_headroom: 0.20, drawdown: 0.05, regime: "normal" },
    policy_version: "decision-policy-v1.0.0",
  },
];

function buildVariants(input: DecisionInput): DecisionInputWithVariants {
  const variants = {} as Record<Regime, RegimeVariant>;
  for (const regime of ["normal", "defensive", "stress"] as Regime[]) {
    const ps: PortfolioState = { ...input.portfolio_state, regime };
    const csReq = computeCSReq(input, ps);
    const grr = evaluateGates(input, ps, csReq);
    variants[regime] = { portfolio_state: ps, gateRunResult: grr };
  }
  return { ...input, regimeVariants: variants };
}

export const DECISION_INPUTS: DecisionInputWithVariants[] = INPUT_BASE.map(buildVariants);

export function findInput(id: string): DecisionInputWithVariants {
  return DECISION_INPUTS.find((d) => d.application_id === id) ?? DECISION_INPUTS[0];
}

export const REASON_CODE_VOCABULARY = [
  "QUALITY_BELOW_MIN_WORDS",
  "QUALITY_BELOW_MIN_TURNS",
  "QUALITY_ASR_CONFIDENCE_LOW",
  "QUALITY_LOW_CONFIDENCE_RATIO_HIGH",
  "QUALITY_TOPIC_COVERAGE_LOW",
  "COMPLIANCE_REVIEW_REQUIRED",
  "COMPLIANCE_BLOCKED",
  "ANTI_GAMING_WARN_BAND",
  "ANTI_GAMING_ABOVE_MAX",
  "PORTFOLIO_CHECK_OVER_MAX",
  "PORTFOLIO_DOMAIN_HARD_CAP",
  "PORTFOLIO_LIQUIDITY_FLOOR",
  "COHERENCE_BELOW_THRESHOLD",
  "CONFIDENCE_INTERVAL_WARN",
  "CONFIDENCE_INTERVAL_ABOVE_MAX",
] as const;

export const APPLICATION_LABELS: Record<string, { short: string }> = {
  "app-01-pass": { short: "PASS" },
  "app-02-manual": { short: "MANUAL (AG)" },
  "app-03-fail-coh": { short: "FAIL (COH)" },
  "app-04-fail-port": { short: "FAIL (PORT)" },
  "app-05-manual-ci": { short: "MANUAL (CI)" },
};
