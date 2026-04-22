// TODO(michael): supply real workflow steps
export type WorkflowStep = {
  n: number;
  label: string;
  blurb: string;
  inputs?: string;
  outputs?: string;
};

const workflow: WorkflowStep[] = [
  { n: 1, label: "intake",          blurb: "A strategy question enters as plain prose. Hivemind parses for entities and decisions.", inputs: "prose", outputs: "frame" },
  { n: 2, label: "decompose",       blurb: "Question becomes a tree of sub-hypotheses, each individually evaluable.",                outputs: "tree" },
  { n: 3, label: "gather evidence", blurb: "Operator attaches sources; weights are assigned by provenance and recency.",             outputs: "ledger" },
  { n: 4, label: "score",           blurb: "Each leaf produces a posterior; aggregation rolls up to the root.",                       outputs: "posterior" },
  { n: 5, label: "red team",        blurb: "Adversarial review against the current best brief.",                                       outputs: "critique" },
  { n: 6, label: "render brief",    blurb: "Export a structured memo with citations and confidence intervals.",                       outputs: "memo" },
];
export default workflow;
