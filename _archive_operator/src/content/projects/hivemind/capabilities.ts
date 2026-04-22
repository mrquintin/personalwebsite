// TODO(michael): supply real capability list
export type Capability = {
  code: string;
  name: string;
  blurb: string;
  status: "shipping" | "alpha" | "planned";
};

const capabilities: Capability[] = [
  { code: "CAP-01", name: "Hypothesis decomposition",     blurb: "Break a strategy question into evaluable, testable sub-claims.", status: "shipping" },
  { code: "CAP-02", name: "Evidence ledger",              blurb: "Sourced, weighted evidence attached to each hypothesis.",      status: "shipping" },
  { code: "CAP-03", name: "Scenario tree",                blurb: "Branch probability over outcomes; expandable depth.",          status: "alpha" },
  { code: "CAP-04", name: "Counterfactual simulation",    blurb: "Hold inputs constant; vary one assumption at a time.",         status: "alpha" },
  { code: "CAP-05", name: "Adversarial review",           blurb: "Red-team prompt against a candidate brief.",                   status: "planned" },
  { code: "CAP-06", name: "Briefing render",              blurb: "Export a structured memo from the working analysis.",          status: "planned" },
];
export default capabilities;
