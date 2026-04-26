// Prose narrative for the PRP project page.
// Sources (every claim grounded in existing repo content):
//   - preface.ts / preface.mdx → the refusal, the confession, "metric is the
//                                meaning", "the symptoms are not accidental"
//   - pillars.ts (I–V)         → corporatism, gamification, incumbency,
//                                 complacency, economic revolution
//   - arc.ts                   → five-volume arc; Book I status: writing
//   - progress.ts              → 92,143 / 100,000 words, manuscript v4
//   - quotes.ts                → severance, leaderboard-as-workflow,
//                                 incumbency wired into the substrate
// Per v2 principle 2 (content first), each section opens with its point.

export type BodySection = {
  slug: string;
  heading: string;
  paragraphs: string[];
};

const sections: BodySection[] = [
  {
    slug: "the-distinction",
    heading: "The distinction",
    paragraphs: [
      "Purposeless Efficiency is the name for a specific severance: efficiency cut loose from any external purpose, until the metric is the meaning. The book’s opening line is the cleanest statement of the argument — efficiency, severed from purpose, becomes the most efficient way of arriving nowhere. The distinction is not between efficient and inefficient systems. It is between systems that still remember what they are for and systems that have replaced their purpose with the measurement of themselves.",
      "The book’s claim is that this severance is not a local pathology of one industry or one institution. It is the dominant production logic of the late industrial era, and the symptoms — the sense that the levers no longer connect to outcomes, the sense that the leaderboard has eaten the work — are not accidental.",
    ],
  },
  {
    slug: "why-it-matters",
    heading: "Why it matters",
    paragraphs: [
      "The reader, the preface assumes, has already noticed the symptoms. The book is written for the reader who has stopped pretending they are accidental. The wager is that naming the severance precisely — distinguishing optimization from purpose, metric from meaning — is a precondition for any honest response to it. Critique that misdescribes the disease prescribes the wrong medicine.",
      "The stakes are not aesthetic. When every workflow becomes a leaderboard, the leaderboard becomes the workflow, and the optimization target eats the optimized object. The institution survives; the thing it was supposed to do does not. Ambition, under these conditions, becomes the willingness to mistake the institution’s survival for one’s own. That substitution is what the book is trying to make visible enough to refuse.",
    ],
  },
  {
    slug: "where-it-shows-up",
    heading: "Where it shows up",
    paragraphs: [
      "The manuscript organizes the symptoms into five pillars. The first is corporatism: the management of human attention by institutions whose primary product is no longer goods or services but the legitimation of their own continued existence. The second is gamification: when every workflow becomes a leaderboard, the leaderboard becomes the workflow; the optimization target eats the optimized object, and the worldview follows.",
      "The third pillar is incumbency. Incumbents persist not because they are right but because they are wired into the substrate of decision-making; their replacement requires not better arguments but a different substrate. The fourth is complacency: the rational response to a system whose levers have been disconnected from outcomes. The cost of paying attention exceeds the expected return on attention; the citizen withdraws, and so, eventually, does the elite.",
      "The fifth pillar turns from diagnosis to prescription: the shape of an economic revolution that does not repeat the failure modes of the last one. Revolution, the book argues, requires a coherent alternative rather than a critique. The alternative must be operable by humans of ordinary virtue, or it will be captured by humans of extraordinary ambition.",
    ],
  },
  {
    slug: "what-the-manuscript-covers",
    heading: "What the manuscript covers",
    paragraphs: [
      "Book I is the diagnostic volume. It opens with a preface — the book began as a refusal, and as a confession, that I was good at producing inside systems whose only consistent output was the perpetuation of themselves — and walks the five pillars in turn, building the argument from corporatism through to the conditions under which an economic revolution would be honest rather than performative.",
      "Purposeless Efficiency is Book I of a five-volume series. The remaining volumes treat what comes after the severance: the institutions that survive it, the ones that do not, and what an honest economic order might look like once we admit the mistake. Working titles for Books II through V are provisional; the volumes are in planning, not drafting.",
    ],
  },
  {
    slug: "status",
    heading: "Status",
    paragraphs: [
      "Book I is in active writing on manuscript version four, at roughly 92,000 of a target 100,000 words. Books II through V are scoped at the volume level and remain in planning with provisional titles. There is no public release date and no publisher announcement; the page exists to make the argument legible while the manuscript continues. Readers who want to be notified when the book is ready can use the notify list on the project record.",
    ],
  },
];

export default sections;
