// P01 §C2 — Hivemind Deliberation Theater fixture.
//
// 16 runs target a (sufficiency × feasibility) matrix at fixed density.
// In v1, two cells are authored end-to-end (DEFAULT and one VETOED-then-
// restart). The other 14 cells reuse the closest authored run as a fallback
// — the user is told via the slider tooltip when they pick an unauthored
// cell. Future revisions can author the remaining cells in place.
//
// TODO(michael): every body string requires author review.

export type EventType =
  | "proposal"
  | "critique"
  | "revision"
  | "cluster_formed"
  | "practicality_score"
  | "veto"
  | "pass"
  | "output";

export interface TranscriptEvent {
  id: string;
  type: EventType;
  round: number;            // 0 = initial; 1.. = revisions; -1 = post-halt
  speakerId: string | null; // null for Monitor events
  targetSpeakerId?: string;
  body: string;
  tSec: number;
  authorApproved: boolean;
}

export interface TheoryAgent {
  id: string;
  name: string;             // "Porter-5F"
  framework: string;        // "Porter's Five Forces"
  principlesOneLiner: string;
  authorApproved: boolean;
}

export interface ClusterSnapshot {
  round: number;
  clusters: Array<{
    id: string;
    representativeText: string;
    contributingAgentIds: string[];
    rationalesBySide: Array<{ agentId: string; rationale: string }>;
  }>;
}

export interface PracticalityScore {
  constraint: "LEGAL" | "REGULATORY" | "FINANCIAL" | "OPERATIONAL" | "REPUTATIONAL";
  clusterId: string;
  score: number;            // 0–100
  note: string;
}

export interface TheaterRun {
  id: string;
  sufficiencyValue: number;
  feasibilityValue: number;
  densityLabel: string;
  problem: { title: string; body: string };
  agents: TheoryAgent[];
  events: TranscriptEvent[];
  clusterSnapshots: ClusterSnapshot[];
  practicalityScores: PracticalityScore[];
  verdict: "VETOED" | "PASSED";
  finalOutput: Array<{
    clusterId: string;
    recommendation: string;
    rationalesBySide: Array<{ framework: string; rationale: string }>;
  }> | null;
  durationSec: number;
}

export const SUFFICIENCY_STEPS: number[] = [1, 2, 3, 4];
export const FEASIBILITY_STEPS: number[] = [40, 55, 70, 85];
export const DEFAULT_THEATER_RUN_ID = "suff3-feas55-v1";

// Five canonical theory agents shared across all runs in v1.
const AGENTS: TheoryAgent[] = [
  { id: "nash",        name: "Nash-GT",       framework: "Nash's game theory",
    principlesOneLiner: "Treat the competitive landscape as a payoff matrix; act on equilibrium reasoning.",
    authorApproved: true },
  { id: "porter",      name: "Porter-5F",     framework: "Porter's five forces",
    principlesOneLiner: "Diagnose industry attractiveness via supplier, buyer, entrant, substitute, and rivalry pressure.",
    authorApproved: true },
  { id: "christensen", name: "Christensen-DI", framework: "Christensen's disruption",
    principlesOneLiner: "Distinguish sustaining moves from disruptive entry that targets non-consumers.",
    authorApproved: true },
  { id: "drucker",     name: "Drucker-MBO",   framework: "Drucker's management-by-objectives",
    principlesOneLiner: "Specify outcomes, allocate accountability, and reduce strategy to measurable execution.",
    authorApproved: true },
  { id: "kahneman",    name: "Kahneman-BE",   framework: "Kahneman's behavioral economics",
    principlesOneLiner: "Predict behavior using framing, loss aversion, and the difference between System 1 and System 2.",
    authorApproved: true },
];

const PROBLEM = {
  title: "Regional grocer responding to a national discount entrant",
  body:
    "A $2B regional grocer is deciding whether to respond to a national discount entrant by " +
    "(a) matching price aggressively, (b) doubling down on private-label quality and local sourcing, " +
    "or (c) acquiring two local competitors to raise store density. " +
    "Which path maximizes long-term profit without exposing the firm to fatal cash-flow risk over the next four quarters?",
};

// ── helpers ───────────────────────────────────────────────────────────────
let _id = 0;
function ev(
  type: EventType, round: number, speakerId: string | null, body: string, tSec: number,
  targetSpeakerId?: string,
): TranscriptEvent {
  return {
    id: `e${++_id}`, type, round, speakerId, targetSpeakerId, body, tSec,
    authorApproved: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// DEFAULT RUN: sufficiency=3, feasibility=55, PASSED
// ─────────────────────────────────────────────────────────────────────────
function buildDefaultRun(): TheaterRun {
  _id = 0;
  const events: TranscriptEvent[] = [
    // R0 — initial proposals
    ev("proposal", 0, "porter",      "Path (b) — private-label quality and local sourcing — best resists rivalry pressure from a national discounter who cannot match perishables sourcing economics.", 0.0),
    ev("proposal", 0, "christensen", "Treat the entrant as a low-end disruptor. Path (a) cedes the ground that built the entrant; path (c) buys density without rebuilding the value proposition.", 1.6),
    ev("proposal", 0, "nash",        "Match-and-acquire (a + c) is dominated by (b). The entrant's payoff matrix expects price-match; refusing to play that game forces them to compete on a dimension they have not configured for.", 3.4),
    ev("proposal", 0, "drucker",     "Recommend (b) with explicit objectives: gross-margin floor, private-label SKU count, and local-sourcing spend each tracked weekly. Without the objectives, (b) is a slogan.", 5.0),
    ev("proposal", 0, "kahneman",    "Consumer baseline is loss-averse: existing customers will tolerate a small price gap if perceived quality and local identity strengthen. (a) destroys the loss-aversion buffer.", 6.7),

    // R0 → R1 — critique pass
    ev("critique", 0, "nash",        "The five-forces frame underweights buyer-side switching cost: in groceries, switching is cheap. Path (b) requires demonstrating perishable-quality superiority every visit, not just stating it.", 8.2, "porter"),
    ev("critique", 0, "porter",      "Game-theoretic equilibrium assumes the entrant cannot reconfigure. They can. Sufficient (b) execution must move faster than the entrant can copy the local-sourcing posture.", 9.5, "nash"),
    ev("critique", 0, "drucker",     "Disruption framing is helpful but does not yield an executable plan. The proposal needs a 90-day operating budget and named accountable owners.", 10.8, "christensen"),
    ev("critique", 0, "christensen", "MBO framing risks reducing strategy to measurable but trivial KPIs. The objective must be 'do customers experience us as a different kind of store'; the metric is downstream of that.", 12.1, "drucker"),
    ev("critique", 0, "kahneman",    "Path (c) — acquisition for density — is attractive to the executive team because it feels like decisive action. That is a System-1 preference for movement and should be flagged.", 13.4),

    // R1 — revisions
    ev("revision", 1, "porter",      "Refined: (b) plus a perishable-quality public commitment that sets a measurable bar (e.g., next-day local produce) the entrant cannot replicate without their own sourcing network.", 15.2),
    ev("revision", 1, "christensen", "Refined: (b) is sustaining innovation in our identity; the entrant is not pursuing our identity. Concede some price-sensitive segment loss; defend the higher-coherence segment.", 16.9),
    ev("revision", 1, "nash",        "Refined: pure (b) is best response. If the entrant signals deep capacity to copy local sourcing, escalate to a quiet (b)+(c) strategy — but only on density rationale, not response to entrant.", 18.6),
    ev("revision", 1, "drucker",     "Refined: tie (b) to three weekly KPIs — private-label revenue share, local-sourcing spend, and net-promoter delta in the head-to-head trade area. Owners named at the SVP level.", 20.4),
    ev("revision", 1, "kahneman",    "Refined: communicate (b) to consumers as 'still your store' rather than 'now competing with discount entrant'. Avoid framing that primes price comparison.", 22.1),

    // Monitor — cluster formation
    ev("cluster_formed", 1, null,
       "Cluster A formed: 'commit to (b) — private-label and local sourcing — backed by measurable quality bar and weekly KPIs'. Contributors: Porter, Christensen, Drucker, Kahneman.",
       24.0),
    ev("cluster_formed", 1, null,
       "Cluster B formed: 'pure (b) is dominant; (c) only if entrant signals matched sourcing capacity'. Contributors: Nash.",
       25.5),

    // Monitor halt — sufficiency=3 means halt when unique clusters ≤ 3.
    // We have 2 clusters → halt.

    // Practicality scoring
    ev("practicality_score", -1, null,
       "LEGAL on Cluster A: 92 — no antitrust exposure; private-label and supplier contracts are standard.", 27.0),
    ev("practicality_score", -1, null,
       "REGULATORY on Cluster A: 88 — local-sourcing claims must be substantiated; manageable with audit trail.", 28.2),
    ev("practicality_score", -1, null,
       "FINANCIAL on Cluster A: 64 — gross margin compression in transition quarter; cash-flow risk modest if hedge in place.", 29.5),
    ev("practicality_score", -1, null,
       "OPERATIONAL on Cluster A: 71 — local-sourcing capacity exists in 60% of regions; six months to expand to remaining 40%.", 30.8),
    ev("practicality_score", -1, null,
       "REPUTATIONAL on Cluster A: 85 — 'local store' positioning aligns with stated brand history; defensible.", 32.0),

    ev("practicality_score", -1, null,
       "LEGAL on Cluster B: 78 — acquisition path requires Hart-Scott-Rodino review; not blocking but adds 60–90 days.", 33.3),
    ev("practicality_score", -1, null,
       "REGULATORY on Cluster B: 75 — same antitrust review; concentration above some local thresholds.", 34.5),
    ev("practicality_score", -1, null,
       "FINANCIAL on Cluster B: 52 — acquisition cash burden plus integration cost is substantial; hits the four-quarter cash-flow constraint.", 35.7),
    ev("practicality_score", -1, null,
       "OPERATIONAL on Cluster B: 60 — store-density gain is real; integration drag is real.", 36.9),
    ev("practicality_score", -1, null,
       "REPUTATIONAL on Cluster B: 68 — acquisition reads as defensive; mixed reception from existing customers.", 38.0),

    ev("pass", -1, null,
       "Average feasibility: Cluster A = 80; Cluster B = 67. Both clusters clear the 55 threshold. PASS.",
       39.4),

    ev("output", -1, null,
       "Final recommendation issued with two clusters preserved and per-framework rationales attached.",
       40.0),
  ];

  const clusterSnapshots: ClusterSnapshot[] = [
    {
      round: 1,
      clusters: [
        {
          id: "A",
          representativeText: "Commit to (b): private-label and local sourcing, backed by a measurable quality bar and weekly KPIs.",
          contributingAgentIds: ["porter", "christensen", "drucker", "kahneman"],
          rationalesBySide: [
            { agentId: "porter",      rationale: "(b) resists rivalry pressure where the entrant has not configured." },
            { agentId: "christensen", rationale: "(b) defends our identity as sustaining innovation; concedes price-sensitive segment." },
            { agentId: "drucker",     rationale: "(b) becomes executable when KPIs and SVP-level ownership are named." },
            { agentId: "kahneman",    rationale: "(b) plays to existing customers' loss aversion; avoid framing as a fight." },
          ],
        },
        {
          id: "B",
          representativeText: "Pure (b) is dominant; (c) only if the entrant signals matched local-sourcing capacity.",
          contributingAgentIds: ["nash"],
          rationalesBySide: [
            { agentId: "nash", rationale: "(c) is contingent — useful as a hedge if the entrant reconfigures, not a primary move." },
          ],
        },
      ],
    },
  ];

  const practicalityScores: PracticalityScore[] = [
    { constraint: "LEGAL",         clusterId: "A", score: 92, note: "No antitrust exposure; standard contracts." },
    { constraint: "REGULATORY",    clusterId: "A", score: 88, note: "Local-sourcing claims must be substantiated; audit trail manageable." },
    { constraint: "FINANCIAL",     clusterId: "A", score: 64, note: "Gross-margin compression in transition quarter; cash-flow risk modest." },
    { constraint: "OPERATIONAL",   clusterId: "A", score: 71, note: "Sourcing capacity present in 60%; six months to extend." },
    { constraint: "REPUTATIONAL",  clusterId: "A", score: 85, note: "'Local store' aligns with brand history." },
    { constraint: "LEGAL",         clusterId: "B", score: 78, note: "HSR review required; not blocking." },
    { constraint: "REGULATORY",    clusterId: "B", score: 75, note: "Concentration above some local thresholds." },
    { constraint: "FINANCIAL",     clusterId: "B", score: 52, note: "Acquisition + integration cost stresses four-quarter cash flow." },
    { constraint: "OPERATIONAL",   clusterId: "B", score: 60, note: "Density gain real; integration drag real." },
    { constraint: "REPUTATIONAL",  clusterId: "B", score: 68, note: "Reads as defensive; mixed reception." },
  ];

  return {
    id: "suff3-feas55-v1",
    sufficiencyValue: 3, feasibilityValue: 55,
    densityLabel: "balanced (~1200 tokens/slice)",
    problem: PROBLEM, agents: AGENTS,
    events, clusterSnapshots, practicalityScores,
    verdict: "PASSED",
    finalOutput: [
      {
        clusterId: "A",
        recommendation: "Commit to (b): private-label quality and local sourcing, with a public, measurable perishable-quality bar and three weekly KPIs (private-label revenue share, local-sourcing spend, head-to-head NPS) owned at SVP level. Communicate to customers as 'still your store', not as a response to entrant.",
        rationalesBySide: [
          { framework: "Porter's five forces",                rationale: "Resists rivalry pressure on a dimension the entrant has not configured for." },
          { framework: "Christensen's disruption",            rationale: "Sustaining innovation in our identity; concede price-sensitive segment." },
          { framework: "Drucker's management-by-objectives",  rationale: "Becomes executable when KPIs are named and ownership is SVP-level." },
          { framework: "Kahneman's behavioral economics",     rationale: "Plays to existing customers' loss aversion; avoid framing that primes price comparison." },
        ],
      },
      {
        clusterId: "B",
        recommendation: "Hold acquisition path (c) as a hedge. Trigger only if the entrant publicly signals matched local-sourcing capacity; until then, (c) is dominated by (b) on cash-flow grounds.",
        rationalesBySide: [
          { framework: "Nash's game theory", rationale: "Contingent move; valuable as a credible threat, not as a first action." },
        ],
      },
    ],
    durationSec: 40.0,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// VETOED RUN: sufficiency=3, feasibility=85
// Theory loop reaches the same clusters; practicality fails the higher bar;
// theory network restarts; second pass passes the lower bar with a tighter
// recommendation. Demonstrates the restart cycle from Guide II §3.
// ─────────────────────────────────────────────────────────────────────────
function buildVetoedRun(): TheaterRun {
  _id = 100;
  const events: TranscriptEvent[] = [
    // Truncated initial round (the restart cycle is the point)
    ev("proposal", 0, "porter",      "(b) — private-label and local sourcing — best resists rivalry pressure.", 0.0),
    ev("proposal", 0, "christensen", "Treat entrant as low-end disruptor; defend identity rather than match price.", 1.5),
    ev("proposal", 0, "nash",        "(b) is dominant; (a) plays the entrant's preferred game.", 3.0),
    ev("proposal", 0, "drucker",     "(b) with explicit weekly KPIs and SVP ownership.", 4.5),
    ev("proposal", 0, "kahneman",    "(b) preserves loss-averse customer baseline; (a) destroys it.", 6.0),
    ev("revision", 1, "porter",      "Refined (b) as in default run.", 9.0),
    ev("revision", 1, "drucker",     "Refined KPIs and accountability as in default run.", 11.0),
    ev("cluster_formed", 1, null,    "Cluster A formed: '(b) with measurable quality bar and weekly KPIs'.", 13.0),
    ev("cluster_formed", 1, null,    "Cluster B formed: 'pure (b); (c) as hedge'.", 14.5),

    // Practicality scoring with the same scores; FINANCIAL on Cluster A is 64,
    // average is 80, but feasibility threshold is 85 → VETO.
    ev("practicality_score", -1, null, "Cluster A average feasibility: 80.", 17.0),
    ev("practicality_score", -1, null, "Cluster B average feasibility: 67.", 18.5),
    ev("veto", -1, null, "Average feasibility 80 below threshold 85. VETO. Theory network regenerates from scratch.", 20.0),

    // RESTART CYCLE (round 2 = post-restart initial; spec uses round numbers loosely)
    ev("proposal", 2, "porter",      "Restart proposal — (b) tightened: drop the riskier private-label expansion in fresh meat; phase the local-sourcing build by region with milestone gates.", 24.0),
    ev("proposal", 2, "christensen", "Restart proposal — concede slightly more of the price-sensitive segment; redirect the saved capital to sourcing infrastructure that hits feasibility.", 25.6),
    ev("proposal", 2, "nash",        "Restart proposal — eliminate (c) entirely; the cash-flow risk that triggered the veto came from holding the option open.", 27.2),
    ev("proposal", 2, "drucker",     "Restart proposal — same KPIs but named monthly review; tighter financial guardrails on private-label inventory.", 28.8),
    ev("proposal", 2, "kahneman",    "Restart proposal — communicate phased rollout as careful stewardship rather than retreat; framing matters.", 30.4),

    ev("cluster_formed", 3, null, "Cluster A' formed: 'phased (b) with regional milestone gates and monthly financial review; (c) eliminated'.", 33.0),

    ev("practicality_score", -1, null, "FINANCIAL on Cluster A': 86 — phased build absorbs the cash-flow risk that vetoed the previous pass.", 34.5),
    ev("practicality_score", -1, null, "OPERATIONAL on Cluster A': 84 — milestone gates allow course-correction.", 35.5),
    ev("practicality_score", -1, null, "REPUTATIONAL on Cluster A': 88 — phased rollout reads as discipline rather than weakness.", 36.5),
    ev("pass", -1, null, "Cluster A' average 86 ≥ 85. PASS on second cycle.", 38.0),
    ev("output", -1, null, "Final recommendation: phased (b) with regional milestone gates; (c) eliminated.", 39.0),
  ];

  return {
    id: "suff3-feas85-v1",
    sufficiencyValue: 3, feasibilityValue: 85,
    densityLabel: "balanced (~1200 tokens/slice)",
    problem: PROBLEM, agents: AGENTS,
    events,
    clusterSnapshots: [
      {
        round: 3,
        clusters: [{
          id: "A'",
          representativeText: "Phased (b) with regional milestone gates and monthly financial review; (c) eliminated.",
          contributingAgentIds: ["porter", "christensen", "nash", "drucker", "kahneman"],
          rationalesBySide: [
            { agentId: "porter",      rationale: "Same posture as cycle 1; reduced execution surface area." },
            { agentId: "christensen", rationale: "Concede a slice of price-sensitive segment to fund sourcing build." },
            { agentId: "nash",        rationale: "Eliminate (c); the optionality was the veto's source." },
            { agentId: "drucker",     rationale: "Monthly review tightens accountability; KPIs preserved." },
            { agentId: "kahneman",    rationale: "Frame the phasing as stewardship, not retreat." },
          ],
        }],
      },
    ],
    practicalityScores: [
      { constraint: "FINANCIAL",    clusterId: "A'", score: 86, note: "Phased build absorbs the cash-flow risk that vetoed cycle 1." },
      { constraint: "OPERATIONAL",  clusterId: "A'", score: 84, note: "Milestone gates allow course-correction." },
      { constraint: "REPUTATIONAL", clusterId: "A'", score: 88, note: "Phased rollout reads as discipline." },
      { constraint: "LEGAL",        clusterId: "A'", score: 92, note: "No new exposure relative to cycle 1." },
      { constraint: "REGULATORY",   clusterId: "A'", score: 88, note: "No new regulatory risk." },
    ],
    verdict: "PASSED",
    finalOutput: [
      {
        clusterId: "A'",
        recommendation: "Phased (b): private-label and local-sourcing rollout gated by regional milestones, with monthly financial review and tighter inventory guardrails. (c) eliminated.",
        rationalesBySide: [
          { framework: "Porter's five forces",                rationale: "Same competitive posture; reduced execution surface absorbs the cash-flow risk." },
          { framework: "Christensen's disruption",            rationale: "Concede price-sensitive segment to fund sourcing build." },
          { framework: "Nash's game theory",                  rationale: "(c) optionality was the veto's source; eliminating it tightens the position." },
          { framework: "Drucker's management-by-objectives",  rationale: "Monthly review tightens accountability." },
          { framework: "Kahneman's behavioral economics",     rationale: "Frame phasing as stewardship, not retreat." },
        ],
      },
    ],
    durationSec: 39.0,
  };
}

// Stub builder for unauthored cells: reuse the closest authored run.
function buildStubRun(suff: number, feas: number, base: TheaterRun): TheaterRun {
  return { ...base, id: `suff${suff}-feas${feas}-v1`, sufficiencyValue: suff, feasibilityValue: feas };
}

const DEFAULT_RUN = buildDefaultRun();
const VETOED_RUN  = buildVetoedRun();

// 16-cell matrix: authored = (3,55) and (3,85). Others stub to the nearest.
function nearestAuthored(suff: number, feas: number): TheaterRun {
  if (feas >= 85) return VETOED_RUN;
  return DEFAULT_RUN;
}

export const THEATER_RUNS: TheaterRun[] = (() => {
  const out: TheaterRun[] = [];
  for (const suff of SUFFICIENCY_STEPS) {
    for (const feas of FEASIBILITY_STEPS) {
      const id = `suff${suff}-feas${feas}-v1`;
      if (id === DEFAULT_RUN.id) out.push(DEFAULT_RUN);
      else if (id === VETOED_RUN.id) out.push(VETOED_RUN);
      else out.push(buildStubRun(suff, feas, nearestAuthored(suff, feas)));
    }
  }
  return out;
})();

export function findRun(suff: number, feas: number): TheaterRun {
  const id = `suff${suff}-feas${feas}-v1`;
  return THEATER_RUNS.find((r) => r.id === id) ?? DEFAULT_RUN;
}

// ── runtime guard (P06 §B) ────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  for (const r of [DEFAULT_RUN, VETOED_RUN]) {
    for (const e of r.events) {
      if (!e.authorApproved) console.warn(`theaterScript: ${r.id}/${e.id} not authorApproved`);
      if (e.body.startsWith("[GUIDE PARAPHRASE")) console.warn(`theaterScript: ${r.id}/${e.id} carries paraphrase prefix`);
    }
  }
}
