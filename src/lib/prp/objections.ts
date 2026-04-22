// P04 fixtures. Seven canonical objections from Guide Ch.14.
// TODO(michael): every responseText needs author review.

export type ResponseKind = "REFRAME" | "REFUTE" | "REFUTE-IN-PRINCIPLE" | "CONCEDE-AND-DISCIPLINE";

export interface Continuation {
  stance: "press-further" | "reject-premise" | "dismiss";
  label: string;
  text: string;
}

export interface Objection {
  id: string;
  title: string;
  urgency: 1 | 2 | 3 | 4 | 5;
  targetClaimIds: string[];
  objectionText: string;       // objection-voice; exempt from voice-lint
}

export interface Response {
  id: string;
  kind: ResponseKind;
  responseText: string;
  continuations: [Continuation, Continuation, Continuation];
  openInOntologyClaimId: string;
  openInDiamondCaseId?: string;
  finalStripTemplate: string;
  reframeAlt?: string;        // for REFRAME, the [ALT] slot
  authorApproved: boolean;
}

export const OBJECTIONS: Objection[] = [
  { id: "14.1", title: "This Framework Has No Empirical Evidence.",
    urgency: 5, targetClaimIds: ["CRI", "PCT"],
    objectionText: "The book reasons theoretically and does not submit its claims to empirical test. A serious framework about institutions, prices, and political economy would adduce evidence; this one constructs an architecture and points to it. Without an empirical test, the framework can be neither confirmed nor refuted." },
  { id: "14.2", title: "Your Argument for Anarchism Assumes Benevolent Human Nature.",
    urgency: 4, targetClaimIds: ["MCS"],
    objectionText: "State abolition seems to require that freed people behave decently; the book elsewhere denies that they do. The two cannot both be true: either humans are decent enough that voluntary coordination works, or they are not and coercion is necessary." },
  { id: "14.3", title: "Marx Was Right About Silent Compulsion, So Capitalism Is Coercive.",
    urgency: 4, targetClaimIds: ["MCS"],
    objectionText: "Silent compulsion coerces in substance even if not in form. A worker who must accept the wage offered or starve is not in the meaningful sense free; calling this 'voluntary' is a play on definitions." },
  { id: "14.4", title: "Your Profit-Coherence Thesis Is Unfalsifiable.",
    urgency: 4, targetClaimIds: ["PCT"],
    objectionText: "When a firm is profitable, the book calls its premises coherent; when unprofitable, incoherent. The thesis does no work because no observation can refute it. Karl Popper would not let this pass." },
  { id: "14.5", title: "This Framework Lets You Rationalize Anything.",
    urgency: 3, targetClaimIds: ["DIAM"],
    objectionText: "The framework can generate coherent-sounding accounts of any preferred conclusion. A skilled user could justify any position by walking the Diamond Method to it. The discipline collapses into rhetoric." },
  { id: "14.6", title: "Your Case Studies Are Cherry-Picked.",
    urgency: 3, targetClaimIds: ["PCT", "PEF"],
    objectionText: "The book's specific examples — iPhone, OpenAI vs. Anthropic, Palantir, Sears, De Beers — fit the thesis too well. A counter-example would refute the framework; the book has chosen its illustrations to avoid producing one." },
  { id: "14.7", title: "The Book Is Politically Extreme.",
    urgency: 5, targetClaimIds: ["MCS", "ACT"],
    objectionText: "Anarcho-capitalism is a marginal position. The book advocates extremism. A reasonable framework would land in a more central place; the marginality of the conclusion is itself evidence against the argument." },
];

const cont = (stance: Continuation["stance"], label: string, text: string): Continuation =>
  ({ stance, label, text });

export const RESPONSES: Record<string, Response> = {
  "14.1": {
    id: "14.1", kind: "REFRAME",
    responseText: "Data stand inside arguments, not outside them; empirical investigation is one method of searching for coherence. A reader who rejects the coherence-at-limit view will find the absence of citation apparatus a feature of the book — the book is making the argument, not deferring to a literature. The objection is correct that the framework is not empirically confirmed in the standard sense; it does not seek to be. It seeks to be coherent.",
    continuations: [
      cont("press-further", "Press further: how do you tell coherence from clever?", "If coherence is the test, what guards against persuasive incoherence?"),
      cont("reject-premise", "Reject the premise: I require empirical evidence to credit any framework.", "I'm an empiricist on this; nothing here moves me."),
      cont("dismiss", "Say the book is playing with words: this is sophistry.", "'Coherence at the limit of inquiry' is a way of avoiding the test."),
    ],
    openInOntologyClaimId: "CRI",
    finalStripTemplate: "The book's response here is a [KIND]. If you still reject the response, the disagreement is likely at [CLAIM-ID], which you can open in the Ontology.",
    reframeAlt: "coherence or mysticism",
    authorApproved: true,
  },
  "14.2": {
    id: "14.2", kind: "REFUTE",
    responseText: "The argument is structural, not psychological. Voluntary coordination is more coherent than coerced coordination regardless of how individuals in it behave. Residual irrationality persists; it is better managed by market, reputational, and argumentative mechanisms than by a coercive monopoly.",
    continuations: [
      cont("press-further", "Press further: which mechanisms address which failure modes?", "Walk through fraud, externality, and collective action under no state."),
      cont("reject-premise", "Reject the premise: structural arguments without psychology are armchair.", "Show me a working example before recommending it."),
      cont("dismiss", "Say the book is playing with words: 'structural' is hand-waving.", "'Structural' just means you've stopped having to defend the conclusion."),
    ],
    openInOntologyClaimId: "MCS",
    openInDiamondCaseId: "anarchy-no-benevolence",
    finalStripTemplate: "The book's response here is a [KIND]. If you still reject the response, the disagreement is likely at [CLAIM-ID], which you can open in the Ontology.",
    authorApproved: true,
  },
  "14.3": {
    id: "14.3", kind: "REFUTE",
    responseText: "Silent compulsion is real; it is categorically distinct from state coercion because it does not prohibit exit. The book accepts the first half of the objection and rejects the second. A golden chain is a chain; an iron chain is a chain. They are not the same kind of thing.",
    continuations: [
      cont("press-further", "Press further: when does an exit become realistic?", "What threshold of cost-of-exit converts market pressure into something more like coercion?"),
      cont("reject-premise", "Reject the premise: the categorical distinction is metaphysical, not material.", "On the ground, both compel; the formal distinction is a comfort."),
      cont("dismiss", "Say the book is playing with words: golden vs. iron is a metaphor doing argumentative work.", "Pretty image, weak argument."),
    ],
    openInOntologyClaimId: "MCS",
    openInDiamondCaseId: "silent-compulsion",
    finalStripTemplate: "The book's response here is a [KIND]. If you still reject the response, the disagreement is likely at [CLAIM-ID], which you can open in the Ontology.",
    authorApproved: true,
  },
  "14.4": {
    id: "14.4", kind: "REFUTE-IN-PRINCIPLE",
    responseText: "The thesis is falsifiable in principle by demonstration of internal contradiction OR by an empirical case where coherence-superior premises co-occur with less profit, time lag and distortion accounted for. The absence of a coherence meter is acknowledged as an open problem; the book compares its situation to pre-metric Newtonian mass — a real quantity without a measurement instrument is still a real quantity.",
    continuations: [
      cont("press-further", "Press further: design the falsification.", "What experiment would you accept as a refutation?"),
      cont("reject-premise", "Reject the premise: a thesis without an instrument is not yet science.", "Newtonian mass had a method even before the meter; you don't."),
      cont("dismiss", "Say the book is playing with words: 'falsifiable in principle' is the unfalsifiable's last refuge.", "I've heard this from astrologers."),
    ],
    openInOntologyClaimId: "PCT",
    openInDiamondCaseId: "coherence-vs-empirical",
    finalStripTemplate: "The book's response here is a [KIND]. If you still reject the response, the disagreement is likely at [CLAIM-ID], which you can open in the Ontology.",
    authorApproved: true,
  },
  "14.5": {
    id: "14.5", kind: "CONCEDE-AND-DISCIPLINE",
    responseText: "The risk is real, and applies to every philosophical system that claims method. The mitigation is the Diamond Method's iterative self-correction: any reconstruction whose Step 4 consequences are absent is sent back to Step 1. The book offers its own surprising conclusions — the insider trading reading, the Marx-as-diagnostician reading, the state-abolition argument — as evidence that the discipline can carry a user somewhere they did not start.",
    continuations: [
      cont("press-further", "Press further: name a case the book reached and rejected.", "Show me the discipline working against the author's preference."),
      cont("reject-premise", "Reject the premise: 'discipline' is what every rationalizer claims.", "The framework is too flexible to constrain anyone."),
      cont("dismiss", "Say the book is playing with words: 'iterative self-correction' is the rationalizer's loophole.", "Walk it long enough and you reach your destination."),
    ],
    openInOntologyClaimId: "DIAM",
    finalStripTemplate: "The book's response here is a [KIND]. If you still reject the response, the disagreement is likely at [CLAIM-ID], which you can open in the Ontology.",
    authorApproved: true,
  },
  "14.6": {
    id: "14.6", kind: "REFRAME",
    responseText: "Examples are illustrations, never proofs. A critic must refute the theoretical argument; producing counter-examples is insufficient because any counter-example can be re-described and absorbed. Empirical readers will find this unsatisfactory and the book is honest about that. The framework asks to be rejected on its argument, not on its illustrations.",
    continuations: [
      cont("press-further", "Press further: what would be a structural refutation?", "Name the move that would force the framework to revise."),
      cont("reject-premise", "Reject the premise: theory immune to counter-example is theory immune to test.", "Real frameworks meet evidence somewhere."),
      cont("dismiss", "Say the book is playing with words: 'illustrations not proofs' is a hatch the book climbs through.", "Choose to be tested or choose not to claim testability."),
    ],
    openInOntologyClaimId: "PCT",
    finalStripTemplate: "The book's response here is a [KIND]. If you still reject the response, the disagreement is likely at [CLAIM-ID], which you can open in the Ontology.",
    reframeAlt: "a theory of evidence that does not reduce to an argument for how to interpret evidence",
    authorApproved: true,
  },
  "14.7": {
    id: "14.7", kind: "REFUTE",
    responseText: "Political marginality is not an argument. If the arguments are unsound, locate the unsoundness; if sound, their popularity is irrelevant. The book is willing to be wrong; it is not willing to be central just for the sake of comfort.",
    continuations: [
      cont("press-further", "Press further: which specific argument do you find unsound?", "Name the load-bearing claim that fails for you."),
      cont("reject-premise", "Reject the premise: political marginality is evidence about a position's track record under scrutiny.", "Most extreme positions are extreme because they failed the test of broader minds."),
      cont("dismiss", "Say the book is playing with words: 'sound argument' lets you ignore consequences.", "Theory in service of avoidable harm is not virtue."),
    ],
    openInOntologyClaimId: "MCS",
    finalStripTemplate: "The book's response here is a [KIND]. If you still reject the response, the disagreement is likely at [CLAIM-ID], which you can open in the Ontology.",
    authorApproved: true,
  },
};
