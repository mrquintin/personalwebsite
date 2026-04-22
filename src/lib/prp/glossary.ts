// P05 fixtures. ~32 v1 glossary terms. TODO(michael): every definition needs review.

export interface GlossaryTerm {
  term: string;
  definition: string;
  connectedClaimIds: string[];
  sourcedFromGuideIndex: boolean;
}

export const GLOSSARY: GlossaryTerm[] = [
  { term: "anomie", definition: "Loss of normative ground. Durkheim's diagnosis: when shared meanings collapse, behavior detaches from coherent justification.", connectedClaimIds: ["ANOMIE", "ACT"], sourcedFromGuideIndex: true },
  { term: "argumentative combat", definition: "Sublimated form of physical conflict. Civilization is the substitution of words for blows.", connectedClaimIds: ["ACT"], sourcedFromGuideIndex: true },
  { term: "base-horizon effect", definition: "The phenomenon by which a position's coherence horizon is bounded by the irrational base it sits on.", connectedClaimIds: ["FAITH-IN-REASON"], sourcedFromGuideIndex: true },
  { term: "coherence-reality isomorphism", definition: "The book's foundational claim: reality and the most coherent argument about it converge at the limit of inquiry.", connectedClaimIds: ["CRI"], sourcedFromGuideIndex: true },
  { term: "coherence superiority", definition: "More-coherent positions outcompete less-coherent ones over time, in argument and in market.", connectedClaimIds: ["COHERENCE-SUPERIORITY"], sourcedFromGuideIndex: true },
  { term: "Diamond Method", definition: "Identify, dissolve-or-declare, reconstruct, trace consequences. The book's constructive procedure.", connectedClaimIds: ["DIAM"], sourcedFromGuideIndex: true },
  { term: "dual-use principle", definition: "Tools admit incompatible purposes; the framework names the disagreement instead of suppressing one purpose.", connectedClaimIds: ["DUAL-USE"], sourcedFromGuideIndex: true },
  { term: "esoteric / exoteric gap", definition: "The space between a text's surface argument and the argument it conceals from hostile readers.", connectedClaimIds: ["ESOTERIC-EXOTERIC"], sourcedFromGuideIndex: true },
  { term: "faith-in-reason paradox", definition: "Reasoned engagement is the recommended posture despite the irrational base. The recommendation is itself a leap.", connectedClaimIds: ["FAITH-IN-REASON"], sourcedFromGuideIndex: true },
  { term: "fragmentation", definition: "Specialization without coherence; operations multiply without a unifying premise.", connectedClaimIds: ["FRAGMENTATION"], sourcedFromGuideIndex: true },
  { term: "gamification", definition: "The conversion of activity into trackable points. Often a symptom of premise loss; the score replaces the purpose.", connectedClaimIds: ["PURPOSELESS-EFFICIENCY"], sourcedFromGuideIndex: true },
  { term: "golden chain", definition: "Voluntary attachment to comfort. Binding but not coercive — the chain can be removed at the cost of the comfort.", connectedClaimIds: ["GOLDEN-CHAIN", "MCS"], sourcedFromGuideIndex: true },
  { term: "incremental entrepreneurship", definition: "Innovation by identifying contradictions in current premises rather than waiting for inventions.", connectedClaimIds: ["INVENTION-VS-INNOVATION"], sourcedFromGuideIndex: true },
  { term: "inverse bubble", definition: "A market mispricing in which a coherent premise is systematically underpriced because the prevailing narrative obscures it.", connectedClaimIds: ["PCT"], sourcedFromGuideIndex: true },
  { term: "invention vs. innovation", definition: "Inventions are rare and discontinuous; innovations are incremental and disciplined. Different categories of move.", connectedClaimIds: ["INVENTION-VS-INNOVATION"], sourcedFromGuideIndex: true },
  { term: "mimicry", definition: "Form-copying without premise-copying. The cargo cult of operations.", connectedClaimIds: ["MIMICRY"], sourcedFromGuideIndex: true },
  { term: "one-person firm", definition: "An AI-leveraged sole proprietor approaching firm-scale coherence.", connectedClaimIds: ["ONE-PERSON-FIRM"], sourcedFromGuideIndex: true },
  { term: "paradox vs. contradiction", definition: "A paradox dissolves under a sharpening distinction; a contradiction requires that one position be revised.", connectedClaimIds: ["PCD"], sourcedFromGuideIndex: true },
  { term: "profit-coherence thesis", definition: "Profit, net of distortion and over time, tracks the coherence of an enterprise's argument for existing.", connectedClaimIds: ["PCT"], sourcedFromGuideIndex: true },
  { term: "Purpose-Efficiency Framework", definition: "2x2 diagnostic on coherence-of-purpose and quality-of-execution.", connectedClaimIds: ["PEF"], sourcedFromGuideIndex: true },
  { term: "purposeless efficiency", definition: "The diseased condition: high execution serving forgotten or drifted purpose. The book's central diagnostic target.", connectedClaimIds: ["PURPOSELESS-EFFICIENCY", "PEF"], sourcedFromGuideIndex: true },
  { term: "ratcheting standard", definition: "Each generation's required compliance burden rises; institutions absorb the rise without revisiting the premise that produced it.", connectedClaimIds: ["PEF"], sourcedFromGuideIndex: true },
  { term: "rational irrationality", definition: "When the cost of being right exceeds the cost of being wrong, irrationality is locally rational. Caplan's term, accepted.", connectedClaimIds: ["FAITH-IN-REASON"], sourcedFromGuideIndex: true },
  { term: "Reputocracy", definition: "Coordination by reputation rather than by coercion; the book's preferred mechanism for what the state currently does.", connectedClaimIds: ["MCS"], sourcedFromGuideIndex: true },
  { term: "selfish altruism", definition: "Behavior that serves the actor's interests by producing benefit for others. The book reads productive work as paradigmatically selfish-altruistic.", connectedClaimIds: ["VALUE-AS-PERSUASION"], sourcedFromGuideIndex: true },
  { term: "severance of dialogue", definition: "When argument breaks, violence resumes its place. Diagnostic of civilizational failure.", connectedClaimIds: ["SEVERANCE-OF-DIALOGUE"], sourcedFromGuideIndex: true },
  { term: "silent compulsion", definition: "Marx's diagnosis of market pressure on the propertyless. Accepted as descriptive; rejected as evidence of state-equivalence.", connectedClaimIds: ["SILENT-COMPULSION", "MCS"], sourcedFromGuideIndex: true },
  { term: "speed-of-contradiction heuristic", definition: "How quickly a position dissolves under pressure indicates its incoherence.", connectedClaimIds: ["SPEED-OF-CONTRADICTION"], sourcedFromGuideIndex: true },
  { term: "Straussian moment", definition: "The point at which a careful reader recognizes the irrational base a text writes around.", connectedClaimIds: ["ESOTERIC-EXOTERIC", "FAITH-IN-REASON"], sourcedFromGuideIndex: true },
  { term: "syntax-is-semantics", definition: "How a thing is said, at scale, becomes what it means. The form is the argument.", connectedClaimIds: ["MIMICRY"], sourcedFromGuideIndex: true },
  { term: "third things", definition: "Objects of joint attention that mediate dyadic relations. The book's account of community.", connectedClaimIds: ["ACT"], sourcedFromGuideIndex: true },
  { term: "value as persuasion", definition: "Value is the result of successfully persuading another to accept an argument. Price encodes that persuasion.", connectedClaimIds: ["VALUE-AS-PERSUASION"], sourcedFromGuideIndex: true },
];
