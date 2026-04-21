// TODO(michael): rewrite each pillar body in your voice
export type Pillar = {
  num: "I" | "II" | "III" | "IV" | "V";
  title: string;
  seed: string;       // single-line collapsed quote
  body: string;       // expanded paragraph(s)
};

const pillars: Pillar[] = [
  { num: "I",  title: "Corporatism",
    seed: "What it has done to work, and what it calls 'ambition.'",
    body: "Corporatism is the management of human attention by institutions whose primary product is no longer goods or services but the legitimation of their own continued existence. Ambition, under corporatism, is the willingness to mistake the institution's survival for one's own." },
  { num: "II", title: "Gamification",
    seed: "The industry of scoring, ranking, grinding; and its psychological residue.",
    body: "When every workflow becomes a leaderboard, the leaderboard becomes the workflow. The optimization target eats the optimized object. Gamification is not a UX choice; it is a worldview." },
  { num: "III", title: "Incumbency",
    seed: "Why the machine does not die when it should.",
    body: "Incumbents persist not because they are right but because they are wired into the substrate of decision-making. Their replacement requires not better arguments but a different substrate." },
  { num: "IV", title: "Complacency",
    seed: "The citizen's withdrawal, and the elite's.",
    body: "Complacency is the rational response to a system whose levers have been disconnected from outcomes. The cost of paying attention exceeds the expected return on attention. The citizen withdraws; so, eventually, does the elite." },
  { num: "V",  title: "Economic Revolution",
    seed: "What comes next, and how we avoid the failure modes of the last one.",
    body: "Revolution requires a coherent alternative, not merely a critique. The alternative must be operable by humans of ordinary virtue, or it will be captured by humans of extraordinary ambition." },
];
export default pillars;
