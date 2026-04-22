// P03 — Four Failures Map. VERBATIM strings from Guide I §2.
// TODO(michael): verbatim review.
import { DEFAULT_THEATER_RUN_ID } from "./theaterScript";

export type Mode = "theater" | "knobs" | "failures" | "pipeline" | "audit";

export interface FailureEntry {
  id: "hiring" | "analysis" | "accountability" | "theatrics";
  roman: "I" | "II" | "III" | "IV";
  name: string;
  oneLinerVerbatim: string;
  industryMechanisms: string[];
  responseLabel: string;
  responseBody: string;
  firmArtifact: { label: string; body: string };
  beliefsEngaged: Array<1 | 2 | 3 | 4 | 5 | 6 | 7>;
  productCrossRef: { mode: Mode; refId: string; hint: string } | null;
}

export interface ExecutiveEntry {
  label: "EXECUTIVE";
  body: string;
  openOrgQuestion: string;
}

// Ref ids resolve into the default theater run's events.
// (P06 assertCrossReferences validates these at build time.)
const REF_CLUSTER_FORMED   = "e16";  // First cluster_formed in default run
const REF_OUTPUT           = "e30";  // OUTPUT event in default run
const REF_VETO_AUDIT_EVENT = "e30";  // Audit references the same OUTPUT event id

export const FAILURES: FailureEntry[] = [
  {
    id: "hiring", roman: "I", name: "HIRING",
    oneLinerVerbatim: "Selection based on network, nepotism, and conformity — not problem-solving ability.",
    industryMechanisms: [
      "First piece of advice to aspiring consultants: network for an internal referral.",
      "Recruitment concentrated at a handful of MBA programs whose admissions are not pure merit tests.",
      "Result: reproduction of a social class, not a filter for analytic ability.",
    ],
    responseLabel: "BLIND EXAMS, NO RESUMES",
    responseBody:
      "Hiring is split into three populations — consultants, academics, engineers — each solved by a different blind procedure. Consultants face a five-hour problem set (math, philosophy, case analysis) followed by a strategy-game tournament across Go, Hex, Backgammon, Othello, Chess as a low-variance measurement of competitive strategic reasoning under time pressure. Academics enter via executive selection, consultant-body vote, or director of academic hiring (executive-confirmed); the criterion is contribution to the peer-reviewed knowledge base. Engineers take the same exam format with different weights and split into core SWE and forward-deployed tracks. No credential filter precedes any of these procedures.",
    firmArtifact: {
      label: "HIRING PROCEDURE",
      body: "The hiring procedure itself is the artifact, not a single team. It refines into three procedure variants for the three populations the firm hires.",
    },
    beliefsEngaged: [4, 5],
    productCrossRef: null,
  },
  {
    id: "analysis", roman: "II", name: "ANALYSIS",
    oneLinerVerbatim: "Arbitrary teams run on vague intuition, leaving no transferable principles and fostering client dependency.",
    industryMechanisms: [
      "Recent-graduate teams deliver advice under their own unpredictable judgment.",
      "Organizational heuristics like MECE are 'better described as theatrical than theoretical'.",
      "Nothing learned on one engagement is rigorously encoded and carried to the next.",
    ],
    responseLabel: "PEER-REVIEWED KB + ADVERSARIAL THEORY NETWORK",
    responseBody:
      "Analytical content comes from a centralized, peer-reviewed strategic knowledge base, not from whichever juniors happened to be staffed. The adversarial theory network — multiple agents, each carrying a different framework — critiques and revises each other's conclusions before any output is produced. Two consequences: insights compound across engagements rather than being lost with each rotation, and the firm's standard of evidence becomes legible.",
    firmArtifact: {
      label: "STRATEGIC RESEARCH TEAM",
      body: "Pure academics develop and curate the peer-reviewed KB. Forward-deployed academics embed with clients, one per client, as personal theory assistants. They observe which frameworks the client's problems stress and feed that back into the research agenda. This team structurally replaces the 'junior consultant on engagement' role.",
    },
    beliefsEngaged: [1, 2, 6],
    productCrossRef: { mode: "theater", refId: REF_CLUSTER_FORMED,
      hint: "See two theory agents converge on the same action for different reasons — one cluster, two preserved rationales." },
  },
  {
    id: "accountability", roman: "III", name: "ACCOUNTABILITY",
    oneLinerVerbatim: "Mutual scapegoating between firms and CEOs turns consulting's actual value into blame deflection.",
    industryMechanisms: [
      "The consultant-client relationship is structurally win-lose: success is shared credit; failure becomes the firm blaming execution and the client blaming advice.",
      "Many engagements are hired less for the recommendation than for political cover the brand name provides.",
    ],
    responseLabel: "CLIENT-INFRA DEPLOYMENT + AUDIT TRAIL + DISCLAIMER",
    responseBody:
      "Hivemind runs natively on the client's servers; data stays with the client. Every agent utterance, critique, and revision is logged into an immutable trail that survives the engagement. The firm disclaims responsibility for the conclusions the client draws from the analysis — engagements include an upfront clause that Hivemind's purpose is to surface rigorous reasoning, not to guarantee outcomes. Failure modes become updates to the knowledge base, which is the centralized, peer-reviewed referent that 'admit failure and improve the methodology' has in The Nash Lab and does not have in a traditional firm.",
    firmArtifact: {
      label: "COMPLIANCE TEAM",
      body: "Tracks regulatory change and updates the practicality network's KB so Hivemind never tells clients to do things that are illegal, fraudulent, or unworkable. The audit trail itself is owned by the client, not the firm; this is the fiduciary backbone of the accountability claim.",
    },
    beliefsEngaged: [3, 7],
    productCrossRef: { mode: "audit", refId: REF_VETO_AUDIT_EVENT,
      hint: "See the immutable audit trail: every utterance, critique, revision, and score, owned by the client, not the firm." },
  },
  {
    id: "theatrics", roman: "IV", name: "THEATRICS",
    oneLinerVerbatim: "Managerial jargon feigns prestige while obscuring clarity, deepening dependency.",
    industryMechanisms: [
      "Dense, buzzword-laden deliverables produced under the implicit rule that impression is a component of value.",
      "The most visible failure and, arguably, the least fundamental — but it compounds the other three.",
    ],
    responseLabel: "DIRECT OUTPUT, NO SLIDE-DECK THEATER",
    responseBody:
      "Hivemind's deliverable is the clustered-recommendation set with preserved per-framework rationales and an immutable audit trail — not a PowerPoint with pyramidal arguments. Forward-deployed engineers and academics function as observers and translators rather than presenters: they convert client frictions into engineering and research work. The firm's product pitch and core-beliefs document are written without the managerial vocabulary the firm critiques; the prose lint on this experience enforces the same posture.",
    firmArtifact: {
      label: "CS TEAM",
      body: "Software engineers build and maintain Hivemind. Forward-deployed engineers embed with clients — one per client — to observe how the product is actually used and convert frictions into engineering work.",
    },
    beliefsEngaged: [4, 7],
    productCrossRef: { mode: "theater", refId: REF_OUTPUT,
      hint: "The deliverable is the clustered-recommendation set itself — no slide deck, no pyramid, no buzzword layer." },
  },
];

export const EXECUTIVE: ExecutiveEntry = {
  label: "EXECUTIVE",
  body:
    "Oversees the other three teams and tunes the fundamental Hivemind workflow design where necessary. Owns product strategy, firm-side calibration (e.g., revising the similarity threshold used in solution aggregation), and capital.",
  openOrgQuestion:
    "Prompt engineering — the practice of ensuring that theoretical and regulatory documents are written so that generation-time retrieval uses them well — is either a standalone team or a responsibility absorbed by the executive team. This is an open organizational question.",
};

export const DEFAULT_RUN_ID_FOR_REFS = DEFAULT_THEATER_RUN_ID;
