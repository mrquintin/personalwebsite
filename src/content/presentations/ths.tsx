import type { Phase } from "../../components/presentation/types";

// Sources (every claim grounded in existing repo content):
//   - src/content/projects/theseus/thesis.ts
//   - src/content/projects/theseus/methodology.ts
//   - src/content/projects/theseus/principles.ts
//   - src/content/projects/theseus/body.ts
//   - src/content/projects/theseus/metadata.ts
//   - src/content/projects/theseus/noosphere-feed.ts
// Per 17/P04 §D: the three orders of change are NOT named individually
// here. The project page (16/P06) handles that depth. This deck is
// surface-level: orders of change, severity, fixed points.

export const thsPhases: Phase[] = [
  {
    id: "puzzle",
    heading: "The Ship of Theseus, plainly",
    body: (
      <>
        <p>
          A ship has each of its planks replaced over time. At the end of the
          process, every original board is gone. The question is whether it is
          still the same ship. That is the puzzle — a thought experiment about
          identity that has been turned over since antiquity, with no settled
          answer.
        </p>
        <p>
          The puzzle survives because the question is not really about ships.
          It is about anything that changes while staying recognisably itself:
          a person, a company, a body of beliefs. If you cannot say which
          changes preserve the thing and which replace it, you cannot say what
          the thing is. The interesting move is to stop asking whether the ship
          is the same ship and start asking which planks, when swapped, force
          you to admit something has changed.
        </p>
      </>
    ),
  },
  {
    id: "frame",
    heading: "The frame I'm using",
    body: (
      <>
        <p>
          The project&apos;s frame for identity-under-change has three parts. The
          first is that not every change is the same change — there are
          different orders of revision, and a system honest about identity has
          to distinguish a tap on the hull from a plank pulled near the keel.
          The second is severity: how much a contradiction is allowed to cost
          is read off the structure of what depends on what, not off the heat
          of the argument.
        </p>
        <p>
          The third is fixed points — the commitments a position keeps coming
          back to under revision, the planks that survive every pass of the
          inspector. Identity, on this frame, is not the persistence of the
          planks but the persistence of the constraints they have to satisfy.
          A position changes when a fixed point falls. Until then, the ship is
          still the ship.
        </p>
      </>
    ),
  },
  {
    id: "project",
    heading: "What's in the project",
    body: (
      <>
        <p>
          Theseus is the working out of that frame as a system. It extracts
          first principles from discussion and writing, stores each with its
          provenance, and links them into a graph of supports and tensions. A
          second model — Noosphere — walks the graph at intervals, flagging
          contradictions, asking refining questions, and proposing edits. The
          thesis is plain: philosophical debate can be systematized.
        </p>
        <p>
          The seed dataset is twelve principles with supports and tensions
          wired between them, including a few load-bearing edges so the
          severity reading has something to grade. The methodology and the
          principles list are on the project page below, alongside worked
          examples of how a flagged contradiction is handled by the system.
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
          Theseus is live. The current dataset is twelve seed principles with
          provenance and a small Noosphere feed; the next step is to replace
          the seed set with the working corpus extracted from thesescodex.com.
          The full breakdown — orders of change, severity, refusal cases,
          fixed points — is on the project page below.
        </p>
        <p>
          For questions, ask the assistant on <a href="/chat">/chat</a>.
        </p>
      </>
    ),
  },
];

// Invariant: exactly 4 phases (per 17/P04 §B1).
if (thsPhases.length !== 4) {
  throw new Error(
    `ths.tsx: thsPhases.length must be 4 (got ${thsPhases.length})`,
  );
}
