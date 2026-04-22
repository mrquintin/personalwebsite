// P05 fixtures. Fourteen v1 thinkers. Authored coordinates.
// TODO(michael): every engagement/stanceText needs author review.

export type Stance = "ENDORSED" | "ENGAGED" | "REBUKED" | "DEFENDED";

export interface Thinker {
  id: string;
  name: string;
  lifespan: string;
  positioning: string;
  stance: Stance;
  engagement: string;       // "THE BOOK ENGAGES"
  stanceText: string;       // "THE BOOK'S STANCE"
  connectedClaimIds: string[];
  counterRecommendation?: string;
  whereEncountered: string[];
  orbitCoords: { x: number; y: number };  // 0..100
  narrowIndex: number;
  authorApproved: boolean;
}

// Orbit layout: center at (50, 50). ENDORSED ring outermost (radius ~38),
// ENGAGED upper-right band, REBUKED lower-left band, DEFENDED inner.
export const THINKERS: Thinker[] = [
  // ENDORSED
  { id: "hayek", name: "Hayek", lifespan: "1899–1992",
    positioning: "Austrian economist, social theorist",
    stance: "ENDORSED",
    engagement: "Spontaneous order, the knowledge problem, and the signal-detection function of prices.",
    stanceText: "The book endorses Hayek's account of price as a coherence-detection mechanism distributed across many minds. The Profit-Coherence Thesis owes its shape to Hayek's claim that no central planner can substitute for the price system because no central planner can have the dispersed knowledge the price system aggregates.",
    connectedClaimIds: ["PCT", "COHERENCE-SUPERIORITY", "MCS"],
    whereEncountered: ["Ch.4", "Ch.10"],
    orbitCoords: { x: 50, y: 12 }, narrowIndex: 0, authorApproved: true },

  { id: "rand", name: "Rand", lifespan: "1905–1982",
    positioning: "novelist, philosopher",
    stance: "ENDORSED",
    engagement: "The moral defense of the entrepreneur and the creative-act reading of production.",
    stanceText: "The book endorses Rand's central move — that productive work is a moral act, not merely a transactional one — while declining her broader Objectivist apparatus. Production is the visible form of having understood something true; that is the sense in which the book reads it as moral.",
    connectedClaimIds: ["VALUE-AS-PERSUASION", "PCT"],
    whereEncountered: ["Ch.11"],
    orbitCoords: { x: 78, y: 22 }, narrowIndex: 1, authorApproved: true },

  { id: "smith", name: "Adam Smith", lifespan: "1723–1790",
    positioning: "Scottish moral philosopher, political economist",
    stance: "ENDORSED",
    engagement: "Division of labor, the market as coordinator, and the moral-sentiments reading alongside Wealth of Nations.",
    stanceText: "The book reads Smith as the moral philosopher first and the economist second — the order Smith himself preferred. Markets are the practical extension of an account of moral sentiments; they coordinate because participants share a substrate of recognition, not despite the absence of one.",
    connectedClaimIds: ["PCT", "ACT"],
    whereEncountered: ["Ch.4", "Ch.11"],
    orbitCoords: { x: 86, y: 38 }, narrowIndex: 2, authorApproved: true },

  { id: "burke", name: "Burke", lifespan: "1729–1797",
    positioning: "Anglo-Irish political philosopher",
    stance: "ENDORSED",
    engagement: "Wisdom in inherited institutions; conservative caution against rationalist reconstruction without coherence.",
    stanceText: "The book endorses Burke's caution against tearing down institutions whose argument-for-existence cannot be quickly reconstructed. The qualification matters: when an institution's argument has audibly collapsed, Burke's caution does not bind. The book is constructive, not preservationist.",
    connectedClaimIds: ["MCS", "COHERENCE-SUPERIORITY"],
    counterRecommendation: "A reader who finds the book's reading of Burke too radical should look at Russell Kirk's The Conservative Mind, which reads Burke as more uniformly preservationist.",
    whereEncountered: ["Ch.13"],
    orbitCoords: { x: 86, y: 62 }, narrowIndex: 3, authorApproved: true },

  { id: "strauss", name: "Strauss", lifespan: "1899–1973",
    positioning: "political philosopher",
    stance: "ENDORSED",
    engagement: "The esoteric/exoteric distinction; the Straussian moment; the dangers of the purely exoteric reading.",
    stanceText: "The book endorses the Straussian reading practice as a method for recovering arguments that texts conceal from hostile readers. The faith-in-reason paradox is the book's own Straussian moment: the irrational base is the esoteric content, the recommended posture is the exoteric one.",
    connectedClaimIds: ["ESOTERIC-EXOTERIC", "FAITH-IN-REASON"],
    whereEncountered: ["Ch.3", "Ch.7"],
    orbitCoords: { x: 78, y: 78 }, narrowIndex: 4, authorApproved: true },

  { id: "hoppe", name: "Hoppe", lifespan: "b. 1949",
    positioning: "Austrian-school economist, philosopher",
    stance: "ENDORSED",
    engagement: "Argumentation ethics; anarcho-capitalism as the logical extension of argument-as-only-legitimate-conflict.",
    stanceText: "The book endorses Hoppe's argumentation-ethics move: anyone who argues against argument's legitimacy performs the legitimacy they deny. The MCS claim is the political consequence: only the state coerces in the categorical sense Hoppe identifies.",
    connectedClaimIds: ["ACT", "MCS"],
    counterRecommendation: "Critics of Hoppe's argumentation ethics — David Friedman, Bryan Caplan — represent the strongest internal challenges to the move; a reader skeptical of the book here should read those.",
    whereEncountered: ["Ch.13"],
    orbitCoords: { x: 50, y: 88 }, narrowIndex: 5, authorApproved: true },

  { id: "thiel", name: "Thiel", lifespan: "b. 1967",
    positioning: "investor, founder",
    stance: "ENDORSED",
    engagement: "The entrepreneurial monopolist as coherence-discoverer; the 'secret' as a pre-coherence insight.",
    stanceText: "The book endorses Thiel's framing of the secret — a true thing few yet hold — as the structural input to durable advantage. The Profit-Coherence Thesis is downstream: profits over time track the durability of the coherence the founder discovered.",
    connectedClaimIds: ["PCT", "COHERENCE-SUPERIORITY", "INVENTION-VS-INNOVATION"],
    whereEncountered: ["Ch.9", "Ch.11"],
    orbitCoords: { x: 22, y: 78 }, narrowIndex: 6, authorApproved: true },

  // ENGAGED
  { id: "marx", name: "Marx", lifespan: "1818–1883",
    positioning: "philosopher, political economist",
    stance: "ENGAGED",
    engagement: "Silent compulsion as diagnostic; means of production as a discoverable constraint; prescriptions rejected on MCS grounds.",
    stanceText: "The book accepts Marx's diagnostic apparatus and rejects his prescriptions. Silent compulsion is real and important; it is categorically distinct from state coercion. Marx located a real phenomenon and inferred the wrong remedy from it.",
    connectedClaimIds: ["MCS", "SILENT-COMPULSION", "ACT"],
    counterRecommendation: "A reader who accepts Marx's diagnosis but is unsure about the categorical separation from state coercion should read G.A. Cohen's Self-Ownership, Freedom, and Equality.",
    whereEncountered: ["Ch.10", "Ch.13", "Ch.14.3"],
    orbitCoords: { x: 70, y: 30 }, narrowIndex: 7, authorApproved: true },

  { id: "durkheim", name: "Durkheim", lifespan: "1858–1917",
    positioning: "French sociologist",
    stance: "ENGAGED",
    engagement: "Anomie as a real phenomenon; collective consciousness as a mislabeling of something the book relabels.",
    stanceText: "The book accepts Durkheim's diagnostic of anomie — the loss of normative ground — and rejects his collectivist remedy. The condition is real and growing; the response is not the reconstruction of the social organism but the recovery of argumentative ground at the level of the individual.",
    connectedClaimIds: ["ANOMIE", "ACT"],
    whereEncountered: ["Ch.13"],
    orbitCoords: { x: 78, y: 46 }, narrowIndex: 8, authorApproved: true },

  { id: "rousseau", name: "Rousseau", lifespan: "1712–1778",
    positioning: "Genevan philosopher",
    stance: "ENGAGED",
    engagement: "General will critique: the book accepts the problem and rejects the solution.",
    stanceText: "The book accepts Rousseau's diagnosis that aggregation problems in collective decision are real and corrosive, and rejects the general-will resolution as exactly the move that smuggles state coercion in under epistemological cover.",
    connectedClaimIds: ["MCS", "STATE-EPISTEMIC-INCOHERENCE"],
    whereEncountered: ["Ch.10"],
    orbitCoords: { x: 70, y: 60 }, narrowIndex: 9, authorApproved: true },

  { id: "hegel", name: "Hegel", lifespan: "1770–1831",
    positioning: "German philosopher",
    stance: "ENGAGED",
    engagement: "Dialectic as a formal pattern; the book appropriates the pattern without the historicist metaphysics.",
    stanceText: "The Diamond Method shares dialectic's formal shape — thesis tension synthesis — but refuses Hegel's claim that the synthesis is the unfolding of Spirit. The reconstruction is the work of the inquirer, not the necessary outcome of history.",
    connectedClaimIds: ["DIAM", "PCD"],
    whereEncountered: ["Ch.7"],
    orbitCoords: { x: 86, y: 50 }, narrowIndex: 10, authorApproved: true },

  { id: "keynes", name: "Keynes", lifespan: "1883–1946",
    positioning: "British economist",
    stance: "ENGAGED",
    engagement: "Aggregate demand as a real short-run phenomenon; the book accepts without endorsing the policy conclusions.",
    stanceText: "The book accepts that aggregate demand can run below productive capacity in the short run, and rejects the policy inference that the state should make up the gap. The diagnostic is sound; the remedy reintroduces the state-epistemic-incoherence the framework is designed to expose.",
    connectedClaimIds: ["PCT", "STATE-EPISTEMIC-INCOHERENCE"],
    whereEncountered: ["Ch.11"],
    orbitCoords: { x: 62, y: 36 }, narrowIndex: 11, authorApproved: true },

  // REBUKED
  { id: "fukuyama", name: "Fukuyama", lifespan: "b. 1952",
    positioning: "American political scientist",
    stance: "REBUKED",
    engagement: "End-of-history thesis.",
    stanceText: "The book rebukes the end-of-history thesis on grounds that coherence-testing has no termination condition. Civilization's argument is not settled; the appearance of settlement after 1989 was a local equilibrium, not an endpoint.",
    connectedClaimIds: ["CRI", "COHERENCE-SUPERIORITY"],
    counterRecommendation: "A reader who finds the rebuke too quick should read Fukuyama's own later qualifications in Trust and in Identity, which substantially soften the original thesis.",
    whereEncountered: ["Ch.13"],
    orbitCoords: { x: 22, y: 30 }, narrowIndex: 12, authorApproved: true },

  // DEFENDED
  { id: "nietzsche", name: "Nietzsche", lifespan: "1844–1900",
    positioning: "German philosopher",
    stance: "DEFENDED",
    engagement: "Defended against the nihilist reading; read as post-foundational, a recognizer of the base, and a proponent of faith-in-reason despite it.",
    stanceText: "The book defends Nietzsche against the nihilist caricature. He is read as the philosopher who saw the irrational base most clearly and recommended a posture — affirmation, the eternal return — that faces the base without surrendering to it. This is the book's faith-in-reason paradox in another vocabulary.",
    connectedClaimIds: ["FAITH-IN-REASON", "ACT"],
    counterRecommendation: "Brian Leiter's Nietzsche on Morality offers the strongest contemporary statement of the more deflationary reading the book defends Nietzsche against.",
    whereEncountered: ["Ch.3"],
    orbitCoords: { x: 50, y: 50 }, narrowIndex: 13, authorApproved: true },
];
