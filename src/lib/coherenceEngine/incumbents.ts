// Incumbent premise samples per domain.
// CE1 §5.2 societal aggregate is a summary statistic; this file shows
// 8-10 representative premises per domain (a sample of the curated set).
import type { DomainKey } from "./domainParameters";

export interface IncumbentPremise {
  id: string;
  text: string;
  polarityAgreement: number;
  tensionWith: string[];
}

export const INCUMBENTS: Record<DomainKey, IncumbentPremise[]> = {
  market_economics: [
    { id: "me-1", text: "Free entry into a market disciplines the prices charged by incumbents.", polarityAgreement: 0.78, tensionWith: ["me-5"] },
    { id: "me-2", text: "Information asymmetry between buyer and seller is a routine feature of consumer markets.", polarityAgreement: 0.81, tensionWith: [] },
    { id: "me-3", text: "Local cooperatives can sustain themselves when membership turnover is moderate.", polarityAgreement: 0.61, tensionWith: [] },
    { id: "me-4", text: "Specialty agricultural goods carry higher per-unit margins than commodity equivalents.", polarityAgreement: 0.72, tensionWith: [] },
    { id: "me-5", text: "Concentration tends to rise in markets where switching costs are high.", polarityAgreement: 0.66, tensionWith: ["me-1"] },
    { id: "me-6", text: "Capital intensity favors incumbents with cheaper financing.", polarityAgreement: 0.71, tensionWith: [] },
    { id: "me-7", text: "Direct trade relationships reduce intermediation costs at the expense of scale.", polarityAgreement: 0.58, tensionWith: [] },
    { id: "me-8", text: "Most retail growth comes from share gains rather than category expansion.", polarityAgreement: 0.55, tensionWith: [] },
  ],
  governance: [
    { id: "gv-1", text: "Independent audit functions improve the credibility of public budgeting.", polarityAgreement: 0.82, tensionWith: [] },
    { id: "gv-2", text: "Local-government procurement is the surface where most fiscal leakage occurs.", polarityAgreement: 0.66, tensionWith: [] },
    { id: "gv-3", text: "Open contracting data does not by itself produce accountability.", polarityAgreement: 0.74, tensionWith: ["gv-7"] },
    { id: "gv-4", text: "Auditors with rotation requirements are less subject to capture than long-tenured ones.", polarityAgreement: 0.69, tensionWith: [] },
    { id: "gv-5", text: "Routine compliance checks deter the most casual misallocations of funds.", polarityAgreement: 0.71, tensionWith: [] },
    { id: "gv-6", text: "Civic budget literacy is unevenly distributed across electoral wards.", polarityAgreement: 0.63, tensionWith: [] },
    { id: "gv-7", text: "Transparency portals can change administrative behavior even without enforcement.", polarityAgreement: 0.55, tensionWith: ["gv-3"] },
    { id: "gv-8", text: "Smaller jurisdictions face higher per-capita costs to run an audit office.", polarityAgreement: 0.68, tensionWith: [] },
  ],
  public_health: [
    { id: "ph-1", text: "Walkable neighborhoods correlate with lower obesity rates after controlling for income.", polarityAgreement: 0.76, tensionWith: [] },
    { id: "ph-2", text: "Self-reported walkability scores diverge from observed pedestrian counts.", polarityAgreement: 0.68, tensionWith: ["ph-1"] },
    { id: "ph-3", text: "Street-network connectivity predicts walking trips better than block density alone.", polarityAgreement: 0.71, tensionWith: [] },
    { id: "ph-4", text: "Daily step counts respond to short feedback loops more than annual interventions.", polarityAgreement: 0.74, tensionWith: [] },
    { id: "ph-5", text: "Air quality at street level varies sharply within a single census tract.", polarityAgreement: 0.79, tensionWith: [] },
    { id: "ph-6", text: "Residents weigh perceived safety more heavily than measured infrastructure quality.", polarityAgreement: 0.62, tensionWith: [] },
    { id: "ph-7", text: "Planning departments rarely publish disaggregated pedestrian incident data.", polarityAgreement: 0.58, tensionWith: [] },
    { id: "ph-8", text: "Heat-island maps and walkability maps tend to overlap in older urban cores.", polarityAgreement: 0.64, tensionWith: [] },
  ],
};

export const SOCIETAL_BASELINE = {
  coh: 0.321,
  premiseCount: 47,
  domainCount: 10,
  documentedTensions: 12,
  source: "CE1 §5.2",
} as const;

export const INCUMBENT_COH: Record<DomainKey, number> = {
  market_economics: 0.35,
  governance: 0.37,
  public_health: 0.40,
};
