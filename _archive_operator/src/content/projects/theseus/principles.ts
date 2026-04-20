// Seed dataset. TODO(michael): replace with the real principle set
// extracted from thesescodex.com once the API is available.

export type Principle = {
  id: string;          // P-014
  text: string;
  supports: string[];  // ids it supports
  tensions: string[];  // ids it tenses with
};

const principles: Principle[] = [
  { id: "P-001", text: "Knowledge is provisional; revision is a feature, not a flaw.", supports: ["P-002","P-022"], tensions: [] },
  { id: "P-002", text: "Evidence is weighed, not counted.", supports: ["P-014"], tensions: [] },
  { id: "P-014", text: "Autonomy is prior to welfare.", supports: ["P-015"], tensions: ["P-071"] },
  { id: "P-015", text: "Consent is the operator of legitimacy.", supports: [], tensions: ["P-071"] },
  { id: "P-022", text: "Preferences over outcomes are revealed through choice under constraint.", supports: ["P-002"], tensions: ["P-031"] },
  { id: "P-031", text: "Stated preferences and revealed preferences diverge predictably.", supports: [], tensions: ["P-022"] },
  { id: "P-040", text: "Power flows toward whatever is measured.", supports: ["P-052"], tensions: [] },
  { id: "P-052", text: "Metrics, once made consequential, cease to be informative.", supports: [], tensions: [] },
  { id: "P-061", text: "Institutions outlive the problems they were designed to solve.", supports: ["P-070"], tensions: [] },
  { id: "P-070", text: "Replacement is harder than reform; reform is harder than capture.", supports: [], tensions: [] },
  { id: "P-071", text: "Collective survival overrides individual consent in extremis.", supports: [], tensions: ["P-014","P-015"] },
  { id: "P-080", text: "A model that cannot be wrong cannot be useful.", supports: ["P-001"], tensions: [] },
];

export default principles;
