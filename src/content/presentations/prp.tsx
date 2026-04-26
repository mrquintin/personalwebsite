import type { Phase } from "../../components/presentation/types";

// Sources (every claim grounded in existing repo content):
//   - src/content/projects/purposeless-efficiency/preface.ts
//   - src/content/projects/purposeless-efficiency/pillars.ts
//   - src/content/projects/purposeless-efficiency/arc.ts
//   - src/content/projects/purposeless-efficiency/progress.ts
//   - src/content/projects/purposeless-efficiency/quotes.ts

export const prpPhases: Phase[] = [
  {
    id: "distinction",
    heading: "The distinction",
    body: (
      <>
        <p>
          Purposeless efficiency is efficiency severed from any external
          purpose, until the metric is the meaning. One concrete example: a
          workflow that has been turned into a leaderboard, where the
          leaderboard becomes the workflow and the worldview follows.
        </p>
        <p>
          Purposeful efficiency still remembers what it is for; it optimises in
          service of something outside itself. One concrete example: an
          institution whose primary product remains the goods or services it
          was built to deliver, rather than the legitimation of its own
          continued existence.
        </p>
      </>
    ),
  },
  {
    id: "why-it-matters",
    heading: "Why it matters",
    body: (
      <>
        <p>
          When purposeless efficiency goes unrecognised, the optimization
          target eats the optimized object. The first case is gamification:
          every workflow becomes a leaderboard, the leaderboard becomes the
          workflow, and the institution survives while the thing it was
          supposed to do does not.
        </p>
        <p>
          The second case is incumbency and the complacency that follows from
          it. Incumbents persist not because they are right but because they
          are wired into the substrate of decision-making. Given levers
          disconnected from outcomes, the rational response is to stop
          pulling — the cost of paying attention exceeds the expected return,
          the citizen withdraws, and so, eventually, does the elite.
        </p>
      </>
    ),
  },
  {
    id: "manuscript",
    heading: "What I'm doing about it",
    body: (
      <>
        <p>
          I&apos;m writing a manuscript called Purposeless Efficiency — Book I of a
          planned five-volume series. Book I is the diagnostic volume. It
          opens with a refusal and a confession — that I was good at producing
          inside systems whose only consistent output was their own
          perpetuation — and then walks five pillars in turn: corporatism,
          gamification, incumbency, complacency, and economic revolution.
        </p>
        <p>
          The remaining four volumes will treat what comes after the
          severance: the institutions that survive it, the ones that do not,
          and what an honest economic order might look like once we admit the
          mistake. Working titles for Books II through V are provisional; the
          volumes are scoped at the volume level and remain in planning, not
          drafting.
        </p>
      </>
    ),
  },
  {
    id: "status",
    heading: "Status & where to go",
    body: (
      <>
        <p>
          Book I is in active writing on manuscript version four, at roughly
          92,000 of a target 100,000 words. Books II through V remain in
          planning. There is no public release date and no publisher
          announcement; this page exists to make the argument legible while
          the manuscript continues.
        </p>
        <p>
          For the longer breakdown, keep reading the project page below. For
          questions, ask the assistant on <a href="/chat">/chat</a>.
        </p>
      </>
    ),
  },
];

// Invariant: exactly 4 phases (per 17/P03 §B1).
if (prpPhases.length !== 4) {
  throw new Error(
    `prp.tsx: prpPhases.length must be 4 (got ${prpPhases.length})`,
  );
}
