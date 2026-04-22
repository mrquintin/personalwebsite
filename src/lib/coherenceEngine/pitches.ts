// Three pitch fixtures for the Domain-Relative Comparator.
// CE2 §5 + CE4 §3.1 grounding. Coh values precomputed.
import type { DomainKey } from "./domainParameters";
import { INCUMBENT_COH } from "./incumbents";

export interface PitchFixture {
  id: string;
  label: string;
  primaryDomain: DomainKey;
  domainMix: Array<{ domain: DomainKey; weight: number }>;
  text: string;
  cohAbsolute: number;
  cohPerLayer: { s1: number; s2: number; s3: number; s4: number; s5: number };
  incumbentPerDomain: Partial<Record<DomainKey, number>>;
  csPerDomain: Partial<Record<DomainKey, number>>;
  csPoint: number;
  csCI95: { lower: number; upper: number };
  csObserved: number;
  expectedThresholdHint: number;
  citation: "CE2 §5, CE4 §3";
}

const PITCHES_BASE = [
  {
    id: "pitch-coffee",
    label: "Specialty-coffee roasting cooperative",
    primaryDomain: "market_economics" as DomainKey,
    domainMix: [
      { domain: "market_economics" as DomainKey, weight: 0.7 },
      { domain: "governance" as DomainKey, weight: 0.3 },
    ],
    text:
      "The cooperative pools roasting capacity for six small producers in the same metropolitan area. Each member retains its own brand and pricing; the shared infrastructure handles green-bean storage, the larger drum roaster, and a single packaging line. The premise is that fixed costs are the binding constraint for producers at this scale, and that pooled fixed costs are the cheapest way to relieve it.\n\nMembership turnover has averaged one in/one out per year over the existing pilot. Margin per kilogram on the cooperative's specialty grades sits modestly above the regional commodity benchmark, and the gap is stable. Two of the six members rely on direct trade relationships with growers, which limits scale on those lines but stabilizes input cost.\n\nThere is one tension. The cooperative's stated mission of disciplining the local roasting market by lowering entry costs is in moderate tension with its own concentration of capacity. The argument is that scale at this level is still well below the threshold at which a single roaster could move regional prices.",
    cohAbsolute: 0.58,
    cohPerLayer: { s1: 0.74, s2: 0.62, s3: 0.55, s4: 0.50, s5: 0.45 },
    csCI95: { lower: 0.21, upper: 0.31 },
  },
  {
    id: "pitch-auditor",
    label: "Local-government audit tool",
    primaryDomain: "governance" as DomainKey,
    domainMix: [{ domain: "governance" as DomainKey, weight: 1.0 }],
    text:
      "The tool ingests procurement records and disbursement logs from a small jurisdiction and flags transactions that violate one of a published rulebook of compliance checks. The rulebook is authored by the audit office; the tool is the surface that runs it. Output is a ranked queue of items for human review, with a one-paragraph reason per item.\n\nThe argument is straightforward. Independent audit functions are widely accepted as improving the credibility of public budgeting, and the binding constraint for small offices is staff time per case rather than legal authority. A tool that pre-sorts the queue does not replace the audit; it shifts where the staff time lands. The comparison set is paper-based queue triage, not other software.\n\nA subtler claim: open contracting data does not by itself produce accountability. A queue tool that requires a human verdict per item preserves the accountability chain that pure dashboards do not.",
    cohAbsolute: 0.66,
    cohPerLayer: { s1: 0.80, s2: 0.71, s3: 0.61, s4: 0.55, s5: 0.55 },
    csCI95: { lower: 0.26, upper: 0.34 },
  },
  {
    id: "pitch-walkability",
    label: "Neighborhood walkability analytics",
    primaryDomain: "public_health" as DomainKey,
    domainMix: [
      { domain: "public_health" as DomainKey, weight: 0.65 },
      { domain: "market_economics" as DomainKey, weight: 0.35 },
    ],
    text:
      "The analytics service produces street-segment-level walkability indices for city planning departments. Inputs are open street-network data, observed pedestrian counts where available, and ambient air-quality estimates. Outputs are per-segment indices and a small set of intervention candidates.\n\nThe argument rests on two premises that are widely accepted: street-network connectivity predicts walking trips better than block density alone, and air quality at street level varies sharply within a single census tract. The third premise is more contested. The pitch claims that residents weigh measured infrastructure quality more heavily than perceived safety in their walking decisions; the empirical literature suggests the opposite. The pitch text does not resolve this tension and proposes to hold both views as candidate hypotheses for the first city deployment.\n\nPricing is per planning department per year. The market-side claim is that planning departments will pay a small per-seat fee for a tool that reduces the cost of preparing intervention proposals.",
    cohAbsolute: 0.51,
    cohPerLayer: { s1: 0.55, s2: 0.50, s3: 0.52, s4: 0.49, s5: 0.42 },
    csCI95: { lower: 0.07, upper: 0.21 },
  },
];

export const PITCHES: PitchFixture[] = PITCHES_BASE.map((p) => {
  const csPerDomain: Partial<Record<DomainKey, number>> = {};
  const incumbentPerDomain: Partial<Record<DomainKey, number>> = {};
  for (const m of p.domainMix) {
    incumbentPerDomain[m.domain] = INCUMBENT_COH[m.domain];
    csPerDomain[m.domain] = +(p.cohAbsolute - INCUMBENT_COH[m.domain]).toFixed(3);
  }
  let csPoint = 0;
  for (const m of p.domainMix) csPoint += m.weight * (csPerDomain[m.domain] ?? 0);
  csPoint = +csPoint.toFixed(3);
  return {
    ...p,
    incumbentPerDomain,
    csPerDomain,
    csPoint,
    csObserved: p.csCI95.lower,
    expectedThresholdHint: 0.18,
    citation: "CE2 §5, CE4 §3" as const,
  };
});

export function findPitch(id: string): PitchFixture {
  return PITCHES.find((p) => p.id === id) ?? PITCHES[0];
}
