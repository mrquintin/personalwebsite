// P03 fixtures. Six v1 cases. TODO(michael): every bookWalk requires review.
export interface DiamondCase {
  id: string;
  title: string;
  difficulty: "BEGINNING" | "INTERMEDIATE" | "ADVANCED";
  tagClaimIds: string[];
  apparentClaimA: string;
  apparentClaimB: string;
  step1Options: Array<{ label: string; isBookFraming: boolean }>;
  step3Templates: string[];
  objectionRef?: string;
  bookWalk: {
    step1: string;
    step2: { verdict: "DISSOLVE" | "DECLARE"; justification: string };
    step3: string;
    step4: string[];
  };
  authorApproved: boolean;
}

export const DIAMOND_CASES: DiamondCase[] = [
  {
    id: "silent-compulsion", title: "Silent Compulsion vs. Voluntary Market",
    difficulty: "INTERMEDIATE",
    tagClaimIds: ["MCS", "ACT"],
    objectionRef: "14.3",
    apparentClaimA: "Marx: market conditions compel the worker to sell labor; this is coercion in substance.",
    apparentClaimB: "The book: markets do not coerce; the state coerces.",
    step1Options: [
      { label: "Whether market pressure is, in substance, the same as state coercion.", isBookFraming: true },
      { label: "Whether workers are exploited.", isBookFraming: false },
      { label: "Whether wage labor is a moral wrong.", isBookFraming: false },
    ],
    step3Templates: [
      "Market pressure is real but not coercive; coercion requires the prohibition of exit.",
      "Both market pressure and state coercion are forms of compulsion that differ only in degree.",
      "Market pressure becomes coercive when no realistic exit exists.",
    ],
    bookWalk: {
      step1: "The contradiction is about whether market pressure is, in substance, coercion. The hinge is exit — whether the compulsion permits the constrained party to walk away from it.",
      step2: { verdict: "DISSOLVE",
        justification: "The sharpening distinction is between compulsion that permits exit (market) and compulsion that prohibits exit (state). The distinction is categorical, not a matter of degree: the difference between an iron chain and a golden chain is not how heavy each is." },
      step3: "Market pressure is real; it is not coercion. Coercion is the prohibition of exit by an entity claiming the right to that prohibition.",
      step4: [
        "Union activity is legitimate but is not properly described as a response to coercion.",
        "State licensing regimes ARE coercive and should be analyzed as such, including in industries where market pressure is also operating.",
        "The golden-chain metaphor captures the phenomenology of market pressure — its weight, its difficulty to refuse — without miscategorizing its structure.",
      ],
    },
    authorApproved: true,
  },
  {
    id: "insider-trading", title: "Insider Trading as Fraud or Price Discovery",
    difficulty: "ADVANCED",
    tagClaimIds: ["PCT", "VALUE-AS-PERSUASION"],
    apparentClaimA: "Standard view: insider trading defrauds other market participants by exploiting asymmetric information.",
    apparentClaimB: "The book: insider trading accelerates incorporation of private information into prices, performing the market's coherence-testing function.",
    step1Options: [
      { label: "Whether the function of price is fairness or coherence-detection.", isBookFraming: true },
      { label: "Whether insiders should be punished.", isBookFraming: false },
      { label: "Whether information asymmetry is bad.", isBookFraming: false },
    ],
    step3Templates: [
      "Insider trading is a speech-act updating the collective coherence assessment.",
      "Insider trading is fraud and should be prosecuted as such.",
      "Insider trading is harmful only when it generates more error than information.",
    ],
    bookWalk: {
      step1: "The contradiction is about what the function of price is. If price is a coherence detector, then prohibiting the incorporation of private information impairs detection.",
      step2: { verdict: "DECLARE",
        justification: "There is real conflict with the fairness intuition. The book sides with price-function over fairness on epistemological grounds; this is not a sharpening, it is a revision of the standard view." },
      step3: "Insider trading is best read as a speech-act that updates the collective coherence assessment; it should not be treated as categorical fraud.",
      step4: [
        "Implications for securities regulation: the categorical prohibition is too broad; the carve-outs would have to be principled.",
        "Implications for market microstructure: design should reward information incorporation, not punish it.",
        "Implications for whistleblowers: the line between insider trading and disclosure becomes a matter of channel rather than of content.",
      ],
    },
    authorApproved: true,
  },
  {
    id: "faith-in-reason", title: "Faith in Reason at the Base",
    difficulty: "ADVANCED",
    tagClaimIds: ["CRI", "FAITH-IN-REASON", "ACT"],
    objectionRef: "14.1",
    apparentClaimA: "The book's anthropology: humans are animalistic, irrational, violence-prone.",
    apparentClaimB: "The book's epistemology: faith in reason is the only posture from which engagement with reality is possible.",
    step1Options: [
      { label: "A paradox at the level of stance, not a contradiction at the level of fact.", isBookFraming: true },
      { label: "A direct contradiction; the book is incoherent.", isBookFraming: false },
      { label: "A tension only insofar as one mistakes posture for description.", isBookFraming: false },
    ],
    step3Templates: [
      "Reasoned engagement is recommended as a posture, not asserted as a description of human nature.",
      "Faith in reason is irrational; the book contradicts itself.",
      "The base is irrational; the recommended posture is reasoned engagement despite that base.",
    ],
    bookWalk: {
      step1: "Not a contradiction at the level of fact; a paradox at the level of stance. Anthropology describes; epistemology prescribes.",
      step2: { verdict: "DISSOLVE",
        justification: "The Straussian moment reveals the irrational base. Faith in reason is the recommended posture despite that base, and recommending a posture is not asserting a description." },
      step3: "Reasoned engagement is recommended AS A POSTURE, not asserted as a description of human nature.",
      step4: [
        "Institutional design: design for the base, not for the recommended posture; mechanisms must work even when participants do not.",
        "Argumentative combat: argument substitutes for violence only when both parties accept the substitution; the substitution is itself a recommendation.",
        "Limits of persuasion: persuasion fails on the base; structures that route around it are necessary.",
      ],
    },
    authorApproved: true,
  },
  {
    id: "coherence-vs-empirical", title: "Coherence as Truth vs. Empirical Science",
    difficulty: "ADVANCED",
    tagClaimIds: ["CRI", "PCT"],
    objectionRef: "14.1",
    apparentClaimA: "Scientific practice: truth is tested empirically.",
    apparentClaimB: "The book: truth is coherence at the limit of inquiry.",
    step1Options: [
      { label: "Whether empirical practice is foundation or method.", isBookFraming: true },
      { label: "Whether science is right.", isBookFraming: false },
      { label: "Whether coherence excludes evidence.", isBookFraming: false },
    ],
    step3Templates: [
      "Empirical practice is a coherence-detection method, not a foundation.",
      "Coherence and empirical truth are competing accounts; pick one.",
      "Empirical truth is the only kind; coherence-at-limit is a metaphor.",
    ],
    bookWalk: {
      step1: "The contradiction is about whether empirical practice is foundation or method. The book reads it as method.",
      step2: { verdict: "DECLARE",
        justification: "The book sides with coherence-at-limit and re-inscribes empirical practice as a method for detecting coherence, not as a foundation. This revises the standard scientific epistemology." },
      step3: "Truth is coherence at the limit of inquiry; empirical practice is one disciplined method for searching for coherence.",
      step4: [
        "Falsifiability remains a useful local heuristic without being the foundational criterion.",
        "Theories that survive empirical testing are evidence of coherence, not of the foundation.",
        "Disagreements between coherence-coherent positions cannot be resolved by 'more evidence' alone; they require argument.",
      ],
    },
    authorApproved: true,
  },
  {
    id: "anarchy-no-benevolence", title: "Anarchy Without Benevolence",
    difficulty: "INTERMEDIATE",
    tagClaimIds: ["MCS", "ACT"],
    objectionRef: "14.2",
    apparentClaimA: "The argument for state abolition seems to require that freed people behave decently.",
    apparentClaimB: "The book elsewhere denies that people behave decently.",
    step1Options: [
      { label: "Whether the argument is psychological or structural.", isBookFraming: true },
      { label: "Whether anarchy is desirable.", isBookFraming: false },
      { label: "Whether human nature is good.", isBookFraming: false },
    ],
    step3Templates: [
      "The state-abolition argument is structural: voluntary coordination is more coherent than coerced coordination.",
      "The argument requires benevolent humans; therefore it fails.",
      "Anarchy is desirable only insofar as people behave decently.",
    ],
    bookWalk: {
      step1: "The contradiction is about whether the argument is psychological or structural.",
      step2: { verdict: "DISSOLVE",
        justification: "The argument is structural: institutions of voluntary coordination are more coherent than coerced ones, regardless of how individuals in them behave. Decent behavior is not a premise; it is sometimes a consequence." },
      step3: "Voluntary coordination is more coherent than coerced coordination, period. Residual irrationality persists and is better managed by market, reputational, and argumentative mechanisms than by coercion.",
      step4: [
        "Failure modes of voluntary coordination — fraud, defection — must be addressed by mechanisms, not by coercive backstops.",
        "Reputational and exit-based mechanisms scale faster than is usually credited.",
        "The political ask is for structural change, not for spiritual reform.",
      ],
    },
    authorApproved: true,
  },
  {
    id: "invention-vs-innovation", title: "Invention vs. Innovation in a Stagnant Market",
    difficulty: "BEGINNING",
    tagClaimIds: ["PCT", "PEF", "INVENTION-VS-INNOVATION"],
    apparentClaimA: "Inventions appear discontinuous, lightning-strike events.",
    apparentClaimB: "Innovation is incremental, driven by identifying contradictions in current premises.",
    step1Options: [
      { label: "A definitional confusion: invention and innovation are different categories.", isBookFraming: true },
      { label: "A real opposition: invention beats innovation.", isBookFraming: false },
      { label: "A measurement problem.", isBookFraming: false },
    ],
    step3Templates: [
      "Inventions are rare and discontinuous; innovations are incremental and disciplined; both are valuable in different ways.",
      "Inventions are the only thing that matters; innovations are noise.",
      "Innovations cumulate into inventions over time.",
    ],
    bookWalk: {
      step1: "Definitional confusion. The two words are being used for different kinds of moves; the supposed opposition is a category error.",
      step2: { verdict: "DISSOLVE",
        justification: "The distinction is definitional: inventions are rarer and structurally different from innovations. The book's entrepreneur is the incremental innovator." },
      step3: "Inventions and innovations are different categories of move; the entrepreneur the book studies is the disciplined incremental innovator.",
      step4: [
        "Entrepreneurship education should emphasize identifying contradictions in current premises, not waiting for inventions.",
        "Markets reward innovation more reliably than invention because innovation is testable.",
        "Cultures that conflate invention and innovation produce neither well.",
      ],
    },
    authorApproved: true,
  },
];
