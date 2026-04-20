// TODO(.cursorrules): replace failure copy with the canonical TNL phrasing
// when 00-cursorrules.txt is supplied. Structure preserved verbatim.

const FAILURES: { num: string; title: string; failure: string; fix: string }[] = [
  {
    num: "I",
    title: "Hiring",
    failure:
      "Consulting firms hire on credential and pedigree. The market cannot tell whether a partner has read deeply or merely well; both bill the same.",
    fix:
      "No resumes; blind exams. Theorists and practitioners are admitted by demonstration, not provenance.",
  },
  {
    num: "II",
    title: "Analysis",
    failure:
      "A single team produces a single answer, written to be unfalsifiable in front of a board. Disagreement is internalized and lost.",
    fix:
      "A network of agents proposes, critiques, and revises in public — every step recorded, every assumption named.",
  },
  {
    num: "III",
    title: "Accountability",
    failure:
      "When the strategy fails, the deck is filed and the engagement ends. There is no audit, no scoreboard, no second look.",
    fix:
      "Every deliberation is appended to an immutable audit trail — including critiques withdrawn, vetoes overridden, and feasibility scores revised.",
  },
  {
    num: "IV",
    title: "Theatrics",
    failure:
      "Polished slides, performative jargon, and frameworks that exist mostly to license the next slide. The product is theater; the bill is real.",
    fix:
      "Plain prose. Numbered claims. A single rationale per recommendation. The deliberation itself is the deliverable.",
  },
];

export default function FourFailures() {
  return (
    <section className="border-t border-ink-500">
      <div className="mx-auto max-w-72rem px-6 py-24 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="eyebrow">THE THESIS</div>
          <h2 className="display text-display-lg mt-4">
            Consulting has four
            <br />
            <span className="display-italic text-theory">structural failures.</span>
          </h2>
          <p className="mt-6 text-paper-muted leading-relaxed max-w-[44ch]">
            The Nash Lab rebuilds strategic consulting on first principles. Each
            failure is named; each fix is engineered into the protocol that
            powers Hivemind. None of the four are addressed by hiring better
            partners or commissioning better decks.
          </p>
        </div>

        <div className="md:col-span-7 divide-y divide-ink-500 border-y border-ink-500">
          {FAILURES.map((f) => (
            <div key={f.num} className="py-8 grid grid-cols-12 gap-6">
              <div className="col-span-2 md:col-span-1 font-mono text-xs text-paper-dim pt-1">
                {f.num}
              </div>
              <div className="col-span-10 md:col-span-11">
                <h3 className="display text-2xl md:text-3xl">{f.title}</h3>
                <p className="mt-2 text-paper-muted leading-relaxed">{f.failure}</p>
                <div className="mt-4 eyebrow eyebrow-accent">HIVEMIND&apos;S ANSWER</div>
                <p className="mt-1 text-paper">{f.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
