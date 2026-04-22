// P02 fixture. 64-cell precomputed (sufficiency × feasibility × density)
// matrix. Authored — no formula. TODO(michael): refine cells against KB.

export interface KnobTuple {
  sufficiency: 1 | 2 | 3 | 4;
  feasibility: 40 | 55 | 70 | 85;
  density: 600 | 1200 | 2400 | 4800;
}

export interface KnobOutcome {
  tuple: KnobTuple;
  agentCount: number;
  debateRounds: number;
  finalClusterCount: number;
  verdict: "PASSED" | "VETOED";
  restartCycles: 0 | 1 | 2;
  outputSize: number;
  virtualDurationSec: number;
  sparkline: Array<{ round: number; clusterCount: number }>;
  note?: string;
}

export const AGENT_COUNT_BY_DENSITY: Record<number, number> = {
  600: 11, 1200: 5, 2400: 3, 4800: 2,
};

export const DEFAULT_TUPLE: KnobTuple = { sufficiency: 3, feasibility: 55, density: 1200 };

const SUFF: Array<KnobTuple["sufficiency"]>   = [1, 2, 3, 4];
const FEAS: Array<KnobTuple["feasibility"]>   = [40, 55, 70, 85];
const DENS: Array<KnobTuple["density"]>       = [600, 1200, 2400, 4800];

// Authored heuristics for cell shape (chosen to read honestly):
//  - Lower sufficiency forces more rounds (tighter agreement target)
//  - Higher feasibility increases veto frequency on this problem
//  - Density does NOT linearly map to outcome shape (per F4)
function authorOutcome(s: KnobTuple["sufficiency"], f: KnobTuple["feasibility"], d: KnobTuple["density"]): KnobOutcome {
  const agents = AGENT_COUNT_BY_DENSITY[d];
  // Round count: ceiling of (agents / s) capped at 4
  const rounds = Math.min(4, Math.max(1, Math.ceil(agents / Math.max(1, s + 1))));
  // Cluster count converges to sufficiency unless agents fewer than s
  const clusters = Math.min(s, agents);
  // Veto threshold for this problem: feasibility 70+ tends to veto unless density ≥ 2400
  let verdict: "PASSED" | "VETOED" = "PASSED";
  let restarts: 0 | 1 | 2 = 0;
  if (f === 85) {
    if (d < 2400) { verdict = "VETOED"; restarts = 2; }
    else { verdict = "PASSED"; restarts = 1; }
  } else if (f === 70) {
    if (d === 600) { verdict = "VETOED"; restarts = 2; }
    else if (d === 1200) { verdict = "PASSED"; restarts = 1; }
  }
  const outputSize = verdict === "PASSED" ? clusters : 0;
  const sparkline: Array<{ round: number; clusterCount: number }> = [];
  for (let r = 0; r <= rounds; r++) {
    const start = agents;
    const end = clusters;
    sparkline.push({ round: r, clusterCount: Math.round(start - ((start - end) * (r / rounds))) });
  }
  const duration = 25 + rounds * 10 + restarts * 18;

  // A few hand-authored notes for surprising cells (per F6)
  let note: string | undefined;
  if (s === 1 && d === 4800) {
    note = "Density ~4.8k with sufficiency 1: convergence is trivial with two agents; output is one cluster regardless of feasibility.";
  } else if (s === 4 && d === 600) {
    note = "Sufficiency 4 against 11 agents: the loop halts on first aggregation; debate rounds are minimal.";
  } else if (verdict === "VETOED" && restarts === 2) {
    note = "Two restart cycles failed at this feasibility; output is empty.";
  }

  return {
    tuple: { sufficiency: s, feasibility: f, density: d },
    agentCount: agents,
    debateRounds: rounds,
    finalClusterCount: clusters,
    verdict,
    restartCycles: restarts,
    outputSize,
    virtualDurationSec: duration,
    sparkline,
    note,
  };
}

const cells: KnobOutcome[] = [];
for (const s of SUFF) for (const f of FEAS) for (const d of DENS) cells.push(authorOutcome(s, f, d));
export const KNOB_MATRIX: KnobOutcome[] = cells;

const _index = new Map<string, KnobOutcome>();
for (const o of KNOB_MATRIX) _index.set(`${o.tuple.sufficiency}-${o.tuple.feasibility}-${o.tuple.density}`, o);

export function lookupOutcome(t: KnobTuple): KnobOutcome {
  const k = `${t.sufficiency}-${t.feasibility}-${t.density}`;
  const o = _index.get(k);
  if (!o) throw new Error(`knobMatrix: missing cell ${k}`);
  return o;
}

export function runIdForTuple(t: KnobTuple): string {
  return `suff${t.sufficiency}-feas${t.feasibility}-v1`;
}
