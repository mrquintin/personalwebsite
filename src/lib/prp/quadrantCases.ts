// P02 fixtures. Nine v1 cases. TODO(michael): review every reasoning paragraph.
export type Quadrant = "Q1" | "Q2" | "Q3" | "Q4";

export interface Placement {
  quadrant: Quadrant;
  subPosition?: { x: -1 | 0 | 1; y: -1 | 0 | 1 };
  asOfYear?: number;
}

export interface ReasoningParagraph {
  kind: "diagnosis" | "counter-objection" | "trajectory";
  body: string;
}

export interface InterviewQuestion {
  prompt: string;
  options: Array<{ label: string; delta: { purpose: number; efficiency: number } }>;
}

export interface QuadrantCase {
  id: string;
  label: string;
  kind: "firm" | "state-agency" | "category";
  bookPlacement: Placement;
  trajectory?: Placement[];
  reasoning: ReasoningParagraph[];
  claimRefs: string[];
  interview: InterviewQuestion[];
  authorApproved: boolean;
}

const PE = (l: string) => ({ label: l, delta: { purpose: 0, efficiency: 1 } });
const I = (prompt: string): InterviewQuestion => ({
  prompt,
  options: [PE("a"), PE("b"), PE("c")],
});

export const QUADRANT_CASES: QuadrantCase[] = [
  {
    id: "sears", label: "Sears", kind: "firm", authorApproved: true,
    bookPlacement: { quadrant: "Q3", asOfYear: 2024 },
    trajectory: [{ quadrant: "Q4", asOfYear: 1970 }, { quadrant: "Q3", asOfYear: 2024 }],
    claimRefs: ["FRAGMENTATION", "MIMICRY", "SPEED-OF-CONTRADICTION"],
    reasoning: [
      { kind: "trajectory", body:
        "Sears was a coherent firm in 1970: the catalog premise scaled the general store to a national network, and the operational sophistication followed from a defensible argument for the firm's existence. By 2024 the premise had been displaced — mail order collapsed into e-commerce — and the operation continued without it. The book reads this as the canonical drift from Q4 into Q3: the form persisted, the purpose did not." },
      { kind: "diagnosis", body:
        "Speed of contradiction matters here. The premise had been falsifiable for a decade before management acted on it; the firm's operational machinery was sophisticated enough to keep producing motion without a justifying argument for the motion." },
    ],
    interview: [
      I("How clear is Sears' current reason for existing?"),
      I("How well does the operation track that reason?"),
      I("How sophisticated is the execution today?"),
    ],
  },
  {
    id: "iphone", label: "Apple / iPhone", kind: "firm", authorApproved: true,
    bookPlacement: { quadrant: "Q4", asOfYear: 2010 },
    trajectory: [{ quadrant: "Q4", asOfYear: 2010 }, { quadrant: "Q4", subPosition: { x: -1, y: -1 }, asOfYear: 2024 }],
    claimRefs: ["INVENTION-VS-INNOVATION", "FRAGMENTATION"],
    reasoning: [
      { kind: "diagnosis", body:
        "At launch the iPhone is the textbook Q4 case: a coherent argument for what a phone is, executed at a level the category had not reached. The book's reading is not that Apple has fallen, but that the firm shows the diagnostic signs of drift — incrementalism that no longer reorganizes the premise, accumulating SKUs, a software pace tied to release cadence rather than to argument." },
      { kind: "trajectory", body:
        "The arrow on the thumbnail is drift, not collapse. The book is careful here: a firm in Q4 that is drifting is not yet in Q3, and policy implications differ." },
    ],
    interview: [I("Q1"), I("Q2"), I("Q3")],
  },
  {
    id: "debeers", label: "De Beers", kind: "firm", authorApproved: true,
    bookPlacement: { quadrant: "Q3" },
    claimRefs: ["MIMICRY", "PURPOSELESS-EFFICIENCY"],
    reasoning: [
      { kind: "diagnosis", body:
        "De Beers' ability to sustain price is not traceable to a coherence argument for diamonds-as-value; it is traceable to a successful constraint on supply paired with a manufactured demand. The execution is sophisticated. The argument for the firm's existence — once the supply constraint is named — does not survive examination. This is purposeless efficiency in clear form." },
    ],
    interview: [I("Q1"), I("Q2"), I("Q3")],
  },
  {
    id: "palantir", label: "Palantir", kind: "firm", authorApproved: true,
    bookPlacement: { quadrant: "Q4", subPosition: { x: -1, y: 0 } },
    claimRefs: ["COHERENCE-SUPERIORITY", "STATE-EPISTEMIC-INCOHERENCE"],
    reasoning: [
      { kind: "diagnosis", body:
        "On the book's reading, Palantir is placed near Q4. The firm's premise is coherent: integrate dispersed information into a single decision surface and sell that surface to organizations whose decisions depend on it. The hedging is on the customer side: many of Palantir's customers operate inside the state-epistemic-incoherence the book diagnoses. Coherence-for-incoherent-customer is not endorsement of the customer; it is a particular business posture the book treats as a question, not an answer." },
    ],
    interview: [I("Q1"), I("Q2"), I("Q3")],
  },
  {
    id: "openai", label: "OpenAI", kind: "firm", authorApproved: true,
    bookPlacement: { quadrant: "Q3", subPosition: { x: -1, y: 0 } },
    claimRefs: ["SEVERANCE-OF-DIALOGUE", "INVENTION-VS-INNOVATION"],
    reasoning: [
      { kind: "diagnosis", body:
        "The book reads the firm as on the Q2/Q3 boundary, leaning Q3. The stated purpose has visibly shifted across the firm's history; the operation is highly efficient in the technical sense. Drift between stated purpose and operational direction is the diagnostic signature of purposeless efficiency in early form, even when the firm's product is technically remarkable." },
    ],
    interview: [I("Q1"), I("Q2"), I("Q3")],
  },
  {
    id: "anthropic", label: "Anthropic", kind: "firm", authorApproved: true,
    bookPlacement: { quadrant: "Q2", subPosition: { x: 1, y: 1 } },
    claimRefs: ["COHERENCE-SUPERIORITY", "FAITH-IN-REASON"],
    reasoning: [
      { kind: "diagnosis", body:
        "Noting that the author has commercial ties in AI tooling, the book's reading here is still — on the Q2/Q4 axis, Anthropic's stated purpose and operation appear more coherent with each other than the comparable case. Execution is still maturing relative to the firm's stated argument. This is the book's reading per Ch.9; readers familiar with the firm may revise it." },
    ],
    interview: [I("Q1"), I("Q2"), I("Q3")],
  },
  {
    id: "state-agency", label: "a state-chartered monopoly (e.g., DMV)", kind: "state-agency", authorApproved: true,
    bookPlacement: { quadrant: "Q3" },
    claimRefs: ["STATE-EPISTEMIC-INCOHERENCE", "MCS"],
    reasoning: [
      { kind: "diagnosis", body:
        "The book's placement here is categorical, not personal: the state agency is not in Q3 because its employees are lazy or stupid. It is in Q3 because the coercive monopoly structure prevents the voluntary exit through which purpose is tested. A reader rejecting MCS — the categorical distinction between market constraint and state coercion — will reject this placement, which is why the open-in-ontology link goes there." },
    ],
    interview: [I("Q1"), I("Q2"), I("Q3")],
  },
  {
    id: "university", label: "a regulated, accredited university", kind: "firm", authorApproved: true,
    bookPlacement: { quadrant: "Q3" },
    claimRefs: ["PURPOSELESS-EFFICIENCY", "MIMICRY"],
    reasoning: [
      { kind: "diagnosis", body:
        "Hybrid case: state-chartered but firm-organized. The book reads contemporary universities as high-execution institutions whose argument for their own existence has been hollowed out by accreditation regimes that decouple credential from demonstrated capacity. Mimicry of older purposes (research, formation) without their premises." },
    ],
    interview: [I("Q1"), I("Q2"), I("Q3")],
  },
  {
    id: "bootcamp", label: "an unaccredited skills bootcamp hired on outcomes", kind: "firm", authorApproved: true,
    bookPlacement: { quadrant: "Q2" },
    claimRefs: ["COHERENCE-SUPERIORITY", "VALUE-AS-PERSUASION"],
    reasoning: [
      { kind: "diagnosis", body:
        "Included for contrast with the university case. The bootcamp's argument for existence — graduates are hired on demonstrated skill — is testable in ways the accredited university's is not. Execution quality varies; the book's placement is Q2 leaning Q4 conditional on whether the institution actually delivers what it argues for." },
    ],
    interview: [I("Q1"), I("Q2"), I("Q3")],
  },
];
