// Three scripted scenarios that drive the Hivemind demo. Substantive
// content — every theorist's solution reflects their actual framework.
// TODO(.cursorrules): Michael may want to refine specific phrasings.

export type Theorist = { id: string; name: string; full: string; domain: string };
export type Pragma   = { id: string; label: string; domain: string };
export type Solution = { text: string; rationale: string };
export type Critique = { fromId: string; toId: string; text: string };
export type Aggregate = {
  id: string;
  text: string;
  combinedRationale: string;
  supporters: string[];
};
export type PracticalityScore = { pragmaId: string; score: number; note: string };

export type Scenario = {
  id: string;
  label: string;
  prompt: string;
  theorists: Theorist[];
  pragmas: Pragma[];
  initialSolutions: Record<string, Solution>;
  critiques: Critique[];
  revisedSolutions: Record<string, Solution>;
  aggregate: Aggregate[];
  practicalityScores: Record<string, PracticalityScore[]>;
};

// ---------------------------------------------------------------------------
// Theorists — canonical roster (used across scenarios + theorist rail)
// ---------------------------------------------------------------------------
export const THEORIST_DB: Record<string, Theorist> = {
  nash:        { id: "nash",        name: "Nash",        full: "John Nash",          domain: "Game theory · equilibrium analysis" },
  porter:      { id: "porter",      name: "Porter",      full: "Michael Porter",     domain: "Five forces · competitive strategy" },
  christensen: { id: "christensen", name: "Christensen", full: "Clayton Christensen",domain: "Disruption · jobs-to-be-done" },
  drucker:     { id: "drucker",     name: "Drucker",     full: "Peter Drucker",      domain: "Management by objectives" },
  kahneman:    { id: "kahneman",    name: "Kahneman",    full: "Daniel Kahneman",    domain: "Behavioral economics · prospect theory" },
  simon:       { id: "simon",       name: "Simon",       full: "Herbert Simon",      domain: "Bounded rationality · satisficing" },
  deming:      { id: "deming",      name: "Deming",      full: "W. Edwards Deming",  domain: "Total quality · PDCA" },
};

// ---------------------------------------------------------------------------
// Pragmas — practicality reviewers
// ---------------------------------------------------------------------------
const PRG = {
  legal:       { id: "legal",       label: "Legal & Compliance",   domain: "regulatory exposure" },
  financial:   { id: "financial",   label: "Financial",            domain: "unit economics, runway" },
  operational: { id: "operational", label: "Operational",          domain: "execution capacity" },
  reputation:  { id: "reputation",  label: "Reputational",         domain: "stakeholder optics" },
};

// ===========================================================================
// SCENARIO A — European market entry
// ===========================================================================
const A_THEORISTS = ["nash", "porter", "christensen", "drucker", "kahneman"].map((k) => THEORIST_DB[k]);
const A_PRAGMAS   = [PRG.legal, PRG.financial, PRG.operational, PRG.reputation];

const A: Scenario = {
  id: "A",
  label: "Should our SaaS company enter the European market in Q3 2026?",
  prompt:
    "We are a Series B North American SaaS company (ARR ~$30M, 60% growth). The board wants European expansion in Q3 2026. Should we, and if so, how?",
  theorists: A_THEORISTS,
  pragmas: A_PRAGMAS,
  initialSolutions: {
    nash: {
      text: "Defer. The board is anchoring on a date, not a payoff matrix; entering before equilibrium with EU competitors is a dominated strategy.",
      rationale: "Game-theoretic: entering Q3 commits scarce capital before observing rivals' moves; deferring preserves option value.",
    },
    porter: {
      text: "Enter UK first via a single regulated vertical (fintech or healthtech). Buyer power is fragmented and entrant rivalry is mild.",
      rationale: "Five forces: UK fintech offers favorable buyer concentration and lower substitution risk than pan-EU horizontal entry.",
    },
    christensen: {
      text: "Skip Western Europe entirely. Find an over-served EU mid-market segment and disrupt with a low-end stripped product.",
      rationale: "Disruption: incumbents over-serve enterprise; a low-end EU foothold is invisible to them and improves upmarket.",
    },
    drucker: {
      text: "Define the customer first. The board has a date but no theory of the European business. Run a 90-day discovery before commitment.",
      rationale: "MBO: 'what is our business' must precede 'what should we do' — and there is no answer here.",
    },
    kahneman: {
      text: "The team is suffering planning-fallacy and a sunk-cost halo from the board. Pre-register kill criteria before any commitment.",
      rationale: "Behavioral: the decision is being framed as a yes/no rather than as a sequence of reversible bets with explicit failure conditions.",
    },
  },
  critiques: [
    { fromId: "porter",      toId: "nash",        text: "Nash treats this as one-shot; SaaS entry is repeated play and waiting also has costs." },
    { fromId: "christensen", toId: "porter",      text: "UK regulated verticals are the most defended segments — wrong place to disrupt." },
    { fromId: "drucker",     toId: "christensen", text: "Disruption presupposes a defined customer. We do not have one yet." },
    { fromId: "kahneman",    toId: "drucker",     text: "90-day discovery without pre-registered kill criteria becomes 180-day sunk-cost discovery." },
    { fromId: "nash",        toId: "kahneman",    text: "Agree on kill criteria; add: criteria must include rivals' observed moves, not only internal milestones." },
    { fromId: "porter",      toId: "christensen", text: "Withdraw partial — UK-first stands, but a regulated vertical may still be viable if entry is narrow." },
    { fromId: "drucker",     toId: "nash",        text: "Deferral without a discovery plan is indistinguishable from inaction; pair them." },
    { fromId: "kahneman",    toId: "porter",      text: "UK-first is fine if the kill criterion is binding — otherwise it is geography theater." },
    { fromId: "christensen", toId: "drucker",     text: "Discovery accepted; insist its output is a customer-segment definition, not a market-size deck." },
  ],
  revisedSolutions: {
    nash:        { text: "Defer commitment; fund a 90-day discovery with pre-registered kill criteria including rivals' observed moves.", rationale: "Equilibrium under repeated play with conditional commitments." },
    porter:      { text: "If discovery proceeds, enter UK-first via a single regulated vertical with bounded scope.", rationale: "Five forces favor narrow UK entry; bounded scope absorbs Christensen's objection." },
    christensen: { text: "Defer; if discovery confirms an over-served segment, enter low-end UK with a stripped product.", rationale: "Disruption-compatible only after segment is defined." },
    drucker:     { text: "Run a 90-day discovery whose deliverable is a defined customer segment and a kill criterion.", rationale: "MBO: the discovery is the engagement, not its prelude." },
    kahneman:    { text: "Pre-register binding kill criteria before any spend; discovery is a real option, not a slope.", rationale: "Defangs sunk-cost and planning fallacy at the source." },
  },
  aggregate: [
    {
      id: "A-agg-1",
      text: "Defer. Fund a 90-day discovery with pre-registered kill criteria.",
      combinedRationale:
        "Five theorists converge on deferral conditional on a structured discovery. Kill criteria must include rivals' observed moves and a defined customer segment as the deliverable.",
      supporters: ["nash", "drucker", "kahneman", "christensen"],
    },
    {
      id: "A-agg-2",
      text: "If discovery proceeds, enter UK-first via a single regulated vertical with bounded scope.",
      combinedRationale:
        "Porter's UK-first thesis survives Christensen's disruption critique once scope is bounded; behavioral and game-theoretic agents accept conditional commitment.",
      supporters: ["porter", "christensen", "nash"],
    },
  ],
  practicalityScores: {
    "A-agg-1": [
      { pragmaId: "legal",       score: 92, note: "Discovery has no regulatory exposure beyond standard market research." },
      { pragmaId: "financial",   score: 88, note: "90-day discovery cost is modest relative to a full entry; preserves option value." },
      { pragmaId: "operational", score: 80, note: "Requires a dedicated discovery team; tractable but real." },
      { pragmaId: "reputation",  score: 84, note: "Board may read deferral as caution; framing as 'pre-registered' helps." },
    ],
    "A-agg-2": [
      { pragmaId: "legal",       score: 78, note: "UK regulated vertical entry adds compliance load (FCA / ICO depending on vertical)." },
      { pragmaId: "financial",   score: 82, note: "Bounded scope keeps cash burn within current runway with margin." },
      { pragmaId: "operational", score: 76, note: "Requires UK legal entity, EU data residency, vertical-specific salesreq." },
      { pragmaId: "reputation",  score: 86, note: "Narrow vertical entry signals discipline rather than land-grab." },
    ],
  },
};

// ===========================================================================
// SCENARIO B — Solo AI advisor pricing
// ===========================================================================
const B_THEORISTS = ["nash", "porter", "kahneman", "simon", "drucker"].map((k) => THEORIST_DB[k]);
const B_PRAGMAS   = [PRG.legal, PRG.financial, PRG.operational, PRG.reputation];

const B: Scenario = {
  id: "B",
  label: "How should a solo AI advisor price a new monthly retainer?",
  prompt:
    "I am a solo AI advisor with 8 years of enterprise consulting experience. I am introducing a monthly retainer for fractional advisory work with mid-market clients. How should I price it?",
  theorists: B_THEORISTS,
  pragmas: B_PRAGMAS,
  initialSolutions: {
    nash:     { text: "Anchor at $12,000/month with a 25% outcome rebate.", rationale: "Signaling: high anchor selects for serious clients; rebate aligns expectations and is a credible commitment." },
    porter:   { text: "Price at $9,000/month, positioned against fractional CTO market, not Big Four.", rationale: "Five forces: substituting against Big Four invites buyer-power compression; fractional executive market has thinner rivalry." },
    kahneman: { text: "Price at $9,500 with a stated 'first-month review' clause.", rationale: "Loss aversion: explicit exit framing converts ambiguity into a recoverable bet for the buyer." },
    simon:    { text: "Satisfice at $8,000 — first three clients calibrate, then revise upward.", rationale: "Bounded rationality: precise optimization without market data is illusory." },
    drucker:  { text: "Price at $10,000; sell on a single named outcome per quarter.", rationale: "MBO: outcome-anchored pricing forces both parties to define value." },
  },
  critiques: [
    { fromId: "porter",  toId: "nash",     text: "$12,000 is Big Four territory and triggers procurement; substitution risk dominates." },
    { fromId: "kahneman",toId: "porter",   text: "Agree on positioning; add explicit risk-reversal language or buyers will infer hidden cost." },
    { fromId: "simon",   toId: "drucker",  text: "Named-outcome pricing requires baseline data this advisor does not yet have." },
    { fromId: "drucker", toId: "simon",    text: "Calibrating on three clients is fine if outcomes are tracked — otherwise satisficing becomes anchoring low." },
    { fromId: "nash",    toId: "kahneman", text: "First-month review is dominated by a longer-horizon outcome rebate; same loss-aversion play, better selection effect." },
    { fromId: "porter",  toId: "drucker",  text: "Named outcomes increase deal complexity and lengthen sales cycles in the mid-market." },
    { fromId: "kahneman",toId: "simon",    text: "Three-client calibration risks anchoring on early lowballers; pre-commit to a price ladder." },
    { fromId: "drucker", toId: "porter",   text: "$9,000 with a single outcome rebate combines positioning and accountability." },
  ],
  revisedSolutions: {
    nash:     { text: "Price at $9,000/month with a 20% outcome rebate if a named quarterly outcome is missed.", rationale: "Signaling intact, lower friction than $12,000 anchor." },
    porter:   { text: "Price at $9,000/month, positioned against fractional executive market.", rationale: "Same as initial; Drucker's outcome rebate folds in cleanly." },
    kahneman: { text: "Price at $9,000/month with the 20% outcome rebate as the visible loss-aversion lever.", rationale: "Rebate satisfies risk-reversal need without first-month-review fragility." },
    simon:    { text: "Start at $9,000/month for the first cohort; pre-commit to a $11,000 ladder after four clients.", rationale: "Bounded rationality with a mechanism for upward revision." },
    drucker:  { text: "Price at $9,000/month; the rebate is the named outcome.", rationale: "Outcome-anchored pricing becomes the rebate condition." },
  },
  aggregate: [
    {
      id: "B-agg-1",
      text: "Price at $9,000/month with a 20% outcome rebate if a named quarterly outcome is not met.",
      combinedRationale:
        "All five theorists converge: $9,000 sits in the fractional-executive band (Porter), the rebate provides risk reversal (Kahneman, Nash), and the named outcome forces value definition (Drucker). Simon's calibration concern is addressed by the rebate functioning as the calibration mechanism.",
      supporters: ["nash", "porter", "kahneman", "simon", "drucker"],
    },
  ],
  practicalityScores: {
    "B-agg-1": [
      { pragmaId: "legal",       score: 90, note: "Rebate clause requires defined-outcome language; standard contract review." },
      { pragmaId: "financial",   score: 86, note: "Worst case: 20% revenue at risk per missed outcome; manageable for solo P&L." },
      { pragmaId: "operational", score: 82, note: "Outcome tracking is the operational tax; tractable with a lightweight quarterly review." },
      { pragmaId: "reputation",  score: 88, note: "Outcome-rebate signals confidence and differentiates from hour-billing peers." },
    ],
  },
};

// ===========================================================================
// SCENARIO C — Series B layoff decision
// ===========================================================================
const C_THEORISTS = ["drucker", "kahneman", "deming", "simon", "nash"].map((k) => THEORIST_DB[k]);
const C_PRAGMAS   = [PRG.legal, PRG.financial, PRG.operational, PRG.reputation];

const C: Scenario = {
  id: "C",
  label: "Should a Series B startup lay off 15% of engineering to extend runway?",
  prompt:
    "We are a Series B startup with 22 months of runway. The board is pushing a 15% engineering reduction to extend to 30 months. Should we cut?",
  theorists: C_THEORISTS,
  pragmas: C_PRAGMAS,
  initialSolutions: {
    drucker:  { text: "Cuts without a theory of the business are amputation. Run a 30-day theory-of-business review before any reduction.", rationale: "MBO: cuts must follow from purpose, not precede it." },
    kahneman: { text: "Hold cuts for 30 days. The board is anchoring on runway months rather than expected value of the engineering pipeline.", rationale: "Behavioral: runway is a salient number; productivity loss from cuts is invisible until quarter-end." },
    deming:   { text: "Run a value-stream sprint on engineering output before cutting; current waste estimate is unknown.", rationale: "PDCA: do not cut a system you have not measured." },
    simon:    { text: "Pre-register a 10% cut criterion: trigger only if the value-stream sprint identifies <10% recoverable waste.", rationale: "Bounded rationality: define the decision rule before the decision." },
    nash:     { text: "Cuts now alter the equilibrium with engineers' outside options; expect retention shock among best performers.", rationale: "Game theory: cuts signal regime change and trigger sorting." },
  },
  critiques: [
    { fromId: "kahneman",toId: "nash",    text: "Sorting risk is real but second-order; primary driver is runway anchoring on the board side." },
    { fromId: "deming",  toId: "drucker", text: "Theory of business is necessary but insufficient; without measurement the theory cannot be tested." },
    { fromId: "simon",   toId: "kahneman",text: "30-day hold is fine if the criterion is pre-registered; otherwise it is just delay." },
    { fromId: "nash",    toId: "deming",  text: "Value-stream sprint signals 'cuts are coming' and triggers the same retention shock pre-emptively." },
    { fromId: "drucker", toId: "simon",   text: "10% pre-registered criterion accepted; criterion must include retention impact, not only waste." },
    { fromId: "deming",  toId: "nash",    text: "Frame the sprint as a process improvement, not a cuts-prelude — language matters here." },
    { fromId: "kahneman",toId: "deming",  text: "Agreed. Sprint as 'system review' has weaker negative framing than 'value-stream audit before cuts.'" },
    { fromId: "simon",   toId: "drucker", text: "Theory-of-business + value-stream + criterion — three artifacts in 30 days is the engagement." },
  ],
  revisedSolutions: {
    drucker:  { text: "Hold cuts. Run 30-day theory-of-business + value-stream sprint with a pre-registered 10% cut criterion.", rationale: "Decision rule precedes decision; sprint produces both theory and measurement." },
    kahneman: { text: "Hold cuts. Pre-register the 10% criterion to defang runway-anchoring on the board side.", rationale: "Behavioral: visible criterion replaces salient runway number." },
    deming:   { text: "Hold cuts. Run a value-stream sprint framed as system review.", rationale: "PDCA: measure before cutting; framing reduces signaling damage." },
    simon:    { text: "Hold cuts. Pre-register a 10% criterion that includes retention impact.", rationale: "Bounded rationality: criterion now binding on both waste and sorting." },
    nash:     { text: "Hold cuts. The combined sprint reduces sorting shock relative to immediate cuts.", rationale: "Game theory: signaling damage is lower with measurement-first framing." },
  },
  aggregate: [
    {
      id: "C-agg-1",
      text: "Hold on cuts. Run a 30-day theory-of-business and value-stream sprint with a pre-registered 10% cut criterion.",
      combinedRationale:
        "All five theorists converge on a 30-day hold with a pre-registered cut criterion. The criterion includes both recoverable waste (Deming, Simon) and retention impact (Nash). Framing the sprint as a system review (not a cuts-prelude) reduces signaling damage to the engineering team.",
      supporters: ["drucker", "kahneman", "deming", "simon", "nash"],
    },
  ],
  practicalityScores: {
    "C-agg-1": [
      { pragmaId: "legal",       score: 94, note: "Holding cuts removes WARN-Act and severance exposure; sprint itself is internal." },
      { pragmaId: "financial",   score: 78, note: "30-day hold delays runway extension; finance must accept a deferred decision." },
      { pragmaId: "operational", score: 82, note: "Sprint requires engineering leadership bandwidth; tractable with scoped scope." },
      { pragmaId: "reputation",  score: 88, note: "Internal: stronger than immediate cuts. External: a non-event." },
    ],
  },
};

export const SCENARIOS: Scenario[] = [A, B, C];
