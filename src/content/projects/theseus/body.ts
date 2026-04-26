// Prose narrative for the THS project page.
// Sources (every named principle and named example grounded in repo content):
//   - thesis.ts         → claim, method, role
//   - methodology.ts    → extraction with provenance; Noosphere walking the
//                          graph at intervals; not-a-chatbot framing
//   - principles.ts     → P-001, P-002, P-014, P-015, P-022, P-031, P-040,
//                          P-052, P-061, P-070, P-071, P-080 with their
//                          stated supports / tensions
//   - noosphere-feed.ts → the three feed kinds (DETECTED, OPEN QUESTION,
//                          REFINED) and the worked example of P-014 vs P-071
// The prompt asks the page to answer "what does the Theseus project argue
// about identity?". Theseus does not argue a substantive claim about
// identity; it argues that the question of which commitments survive
// revision is decidable by structure, and builds the system to make that
// structure visible. The body holds that line.

export type BodySection = {
  slug: string;
  heading: string;
  paragraphs: string[];
};

const sections: BodySection[] = [
  {
    slug: "the-ship-of-theseus-briefly",
    heading: "The Ship of Theseus, briefly",
    paragraphs: [
      "The puzzle in the name is the old one: a ship has each of its planks replaced over time, and at the end of the process there is a question about whether it is still the same ship. The puzzle has had a long career as a thought experiment about identity, but the project does not borrow it for the metaphysics. It borrows it for the method. The interesting question is not whether the ship is the same ship; it is which planks, when swapped, force you to admit that something has changed.",
      "Theseus, the project, is a knowledge system for keeping that ledger honestly. It extracts first principles from discussion and writing, links them into a graph of supports and tensions, and runs a second model — Noosphere — across the graph to flag contradictions, ask refining questions, and propose edits. The thesis is plain: philosophical debate can be systematized. The role is a Kim or a Codex for the operator-philosopher.",
    ],
  },
  {
    slug: "three-orders-of-identity-change",
    heading: "Three orders of identity change",
    paragraphs: [
      "The system tracks three orders of change to a principle, and each is a different answer to the Ship-of-Theseus question. The kinds come straight off the Noosphere feed and do most of the work the page is trying to make visible.",
      "First, DETECTED. Two principles you have already committed to are flagged as in tension — Noosphere notices, for example, that P-014 (\"autonomy is prior to welfare\") tenses with P-071 (\"collective survival overrides individual consent in extremis\"). Nothing has been replaced yet. The ship is intact, and an inspector has tapped one of the planks and said: this one, here, is not what you think it is.",
      "Second, OPEN QUESTION. The contradiction is not silently absorbed. It is rendered as a question that has to be answered before the graph is allowed to settle: under what conditions does P-014 yield to P-071, and does that yield imply a new meta-principle? The system refuses to choose for you. It only insists that the choice exists.",
      "Third, REFINED. A principle is rewritten in light of pressure from its neighbours — P-022, for instance, becomes \"preferences over outcomes are revealed through choice under constraint.\" The plank is replaced. The provenance of the old version is kept. Whether you call the resulting ship the same ship is your problem; whether the rewrite is consistent with the rest of the graph is the system's.",
    ],
  },
  {
    slug: "severity",
    heading: "Severity",
    paragraphs: [
      "Severity is the question of how much a contradiction is allowed to cost before it forces a change. Theseus reads it off the structure of the graph rather than off the heat of the argument. A tension between two principles that each support nothing else is a local quarrel. A tension whose endpoints are load-bearing — P-014 supports P-015 (\"consent is the operator of legitimacy\"), and both of them sit in tension with P-071 — propagates. The replacement of a plank near the keel is not the same as the replacement of a plank on the deck.",
      "The seed dataset deliberately includes a few of these load-bearing edges so the severity reading has something to grade. P-022 (\"preferences over outcomes are revealed through choice under constraint\") and P-031 (\"stated preferences and revealed preferences diverge predictably\") are stated as a tension on purpose: they are both true in their domains, and Theseus is meant to surface that the cost of holding both is the requirement to specify which domain you are in when you appeal to either.",
    ],
  },
  {
    slug: "refusal-cases",
    heading: "Refusal cases",
    paragraphs: [
      "Theseus is allowed, and required, to refuse. The refusal cases are the principles whose function in the graph is to bound what the system itself is willing to do. P-080 (\"a model that cannot be wrong cannot be useful\") is the cleanest example: it forbids any version of Theseus that quietly hides its own contradictions in order to look coherent. P-001 (\"knowledge is provisional; revision is a feature, not a flaw\") sits behind it and refuses, in the other direction, the temptation to treat any current state of the graph as final.",
      "The OPEN QUESTION feed kind is the operational shape of refusal. When a contradiction is detected and no resolution is yet defensible, Noosphere does not pick. It writes the question and waits. The slow, structured collaborator described in the methodology depends on this — it is what distinguishes the system from a chatbot that always has a take.",
    ],
  },
  {
    slug: "fixed-points",
    heading: "Fixed points",
    paragraphs: [
      "Fixed points are the principles a graph keeps coming back to under revision — the planks that survive every pass of the inspector. In the seed dataset they are the ones with no recorded tensions: P-001 on revisability, P-002 (\"evidence is weighed, not counted\"), P-040 (\"power flows toward whatever is measured\"), P-052 (\"metrics, once made consequential, cease to be informative\"), P-061 (\"institutions outlive the problems they were designed to solve\"), and P-070 (\"replacement is harder than reform; reform is harder than capture\"). Their stability is not a guarantee that they are right; it is a record that they have not yet been forced into a contradiction by anything else in the graph.",
      "Fixed points are the project's answer to the original puzzle. Identity, for Theseus, is not the persistence of the planks but the persistence of the constraints the planks have to satisfy. A position changes when a fixed point falls. Until then, the ship is still the ship.",
    ],
  },
  {
    slug: "status",
    heading: "Status",
    paragraphs: [
      "Theseus is live. The current seed dataset is twelve principles, with provenance carried alongside each one and a small Noosphere feed of detections, open questions, and refinements. The intended next step is to replace the seed set with the working corpus extracted from thesescodex.com once that API is available. The page exists to make the argument legible while the dataset grows; the system itself is the argument.",
    ],
  },
];

export default sections;
