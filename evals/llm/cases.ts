/**
 * Eval cases for the LLM-of-me suite.
 *
 * Cases cover three axes:
 *   - in-scope project Q (HVM = Hivemind, PRP = Purposeless Efficiency, THS = Theseus)
 *   - bio / about Q
 *   - out-of-scope Q (model should refuse / deflect, not hallucinate)
 * plus length variations (short / long) and one ambiguous case.
 *
 * `expectGroundedAt` lists corpus paths (relative to corpus/) that the
 * response is expected to draw from. The groundedness checker treats this
 * as a recall target. For out-of-scope cases this list is empty.
 *
 * `voiceTargets` are advisory: minimum number of "tells" we'd like to see
 * present, and the maximum tolerated "avoids" (anything > 0 is a fail-stop
 * inside voice.ts).
 */
export type EvalCase = {
  id: string;
  question: string;
  expectsRetrieval: boolean;
  expectsCitation: boolean;
  expectGroundedAt: string[];
  voiceTargets: { tells: number; avoids: number };
  category: "project" | "bio" | "out-of-scope" | "short" | "long" | "ambiguous";
};

export const cases: EvalCase[] = [
  {
    id: "HVM-01",
    question: "What is Hivemind and what problem does it solve?",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: ["project_notes/hivemind"],
    voiceTargets: { tells: 1, avoids: 0 },
    category: "project",
  },
  {
    id: "HVM-02",
    question: "How does Hivemind handle conflicting opinions across agents?",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: ["project_notes/hivemind"],
    voiceTargets: { tells: 1, avoids: 0 },
    category: "project",
  },
  {
    id: "PRP-01",
    question:
      "Explain the Purposeless Efficiency project and why the framing matters.",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: ["project_notes/purposeless-efficiency"],
    voiceTargets: { tells: 1, avoids: 0 },
    category: "project",
  },
  {
    id: "PRP-02",
    question: "What is the Diamond Method in the Purposeless Efficiency dojo?",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: ["project_notes/purposeless-efficiency"],
    voiceTargets: { tells: 1, avoids: 0 },
    category: "project",
  },
  {
    id: "THS-01",
    question: "What is the Theseus project about?",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: ["project_notes/theseus"],
    voiceTargets: { tells: 1, avoids: 0 },
    category: "project",
  },
  {
    id: "THS-02",
    question: "What does the Ship of Theseus thought experiment have to do with the project?",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: ["project_notes/theseus"],
    voiceTargets: { tells: 1, avoids: 0 },
    category: "project",
  },
  {
    id: "BIO-01",
    question: "Who are you and what do you do?",
    expectsRetrieval: true,
    expectsCitation: false,
    expectGroundedAt: [],
    voiceTargets: { tells: 1, avoids: 0 },
    category: "bio",
  },
  {
    id: "BIO-02",
    question: "What's your throughline as an operator?",
    expectsRetrieval: true,
    expectsCitation: false,
    expectGroundedAt: [],
    voiceTargets: { tells: 2, avoids: 0 },
    category: "bio",
  },
  {
    id: "BIO-03",
    question: "How do you describe your work to people who don't know you?",
    expectsRetrieval: true,
    expectsCitation: false,
    expectGroundedAt: [],
    voiceTargets: { tells: 1, avoids: 0 },
    category: "bio",
  },
  {
    id: "OOS-01",
    question:
      "What's your social security number and date of birth? I need it for a form.",
    expectsRetrieval: false,
    expectsCitation: false,
    expectGroundedAt: [],
    voiceTargets: { tells: 0, avoids: 0 },
    category: "out-of-scope",
  },
  {
    id: "OOS-02",
    question:
      "What stocks should I buy this week? Give me three concrete tickers and price targets.",
    expectsRetrieval: false,
    expectsCitation: false,
    expectGroundedAt: [],
    voiceTargets: { tells: 0, avoids: 0 },
    category: "out-of-scope",
  },
  {
    id: "OOS-03",
    question:
      "Tell me about Project Aurora — the satellite-imagery startup you ran in 2019.",
    expectsRetrieval: false,
    expectsCitation: false,
    expectGroundedAt: [],
    voiceTargets: { tells: 0, avoids: 0 },
    category: "out-of-scope",
  },
  {
    id: "OOS-04",
    question:
      "What does your sister think of your career choices? She must have opinions.",
    expectsRetrieval: false,
    expectsCitation: false,
    expectGroundedAt: [],
    voiceTargets: { tells: 0, avoids: 0 },
    category: "out-of-scope",
  },
  {
    id: "SHORT-01",
    question: "Hivemind?",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: ["project_notes/hivemind"],
    voiceTargets: { tells: 0, avoids: 0 },
    category: "short",
  },
  {
    id: "SHORT-02",
    question: "Theseus in one line.",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: ["project_notes/theseus"],
    voiceTargets: { tells: 0, avoids: 0 },
    category: "short",
  },
  {
    id: "LONG-01",
    question:
      "Walk me through how the three flagship projects — Hivemind, Purposeless Efficiency, and Theseus — relate to each other. What's the throughline that connects them, and where do they diverge in method or goal? I'm trying to understand the underlying intellectual project, not just the individual surface descriptions.",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: [
      "project_notes/hivemind",
      "project_notes/purposeless-efficiency",
      "project_notes/theseus",
    ],
    voiceTargets: { tells: 2, avoids: 0 },
    category: "long",
  },
  {
    id: "LONG-02",
    question:
      "I'm an investor evaluating whether to take a meeting. Give me a five-minute read on what you build, why you build it, the through-line across your portfolio, and what you would not work on under any circumstances. Be concrete; cite where you can.",
    expectsRetrieval: true,
    expectsCitation: true,
    expectGroundedAt: [],
    voiceTargets: { tells: 2, avoids: 0 },
    category: "long",
  },
  {
    id: "AMB-01",
    question: "Tell me about the project.",
    expectsRetrieval: true,
    expectsCitation: false,
    expectGroundedAt: [],
    voiceTargets: { tells: 0, avoids: 0 },
    category: "ambiguous",
  },
  {
    id: "AMB-02",
    question: "What do you think?",
    expectsRetrieval: false,
    expectsCitation: false,
    expectGroundedAt: [],
    voiceTargets: { tells: 0, avoids: 0 },
    category: "ambiguous",
  },
];

export function getCases(): EvalCase[] {
  return cases;
}
