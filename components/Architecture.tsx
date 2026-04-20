import Link from "next/link";

const COMPONENTS = [
  {
    n: "01",
    title: "Theory Network",
    body:
      "A panel of AI agents, each carrying a different school of strategic thought. They propose solutions, critique each other, and revise until they converge.",
  },
  {
    n: "02",
    title: "Monitor",
    body:
      "Aggregates similar solutions and halts the loop once unique clusters fall to or below the user-set sufficiency value. Routes the survivors to practicality review.",
  },
  {
    n: "03",
    title: "Practicality Network",
    body:
      "A second network of agents scores each surviving solution on legal, financial, operational, and reputational constraints — 0 to 100 — against the client's real conditions.",
  },
  {
    n: "04",
    title: "Sufficiency & Feasibility",
    body:
      "Two parameters the user sets: how many distinct solutions are enough, and how feasible they must be on average. If feasibility is below threshold, the entire process regenerates.",
  },
  {
    n: "05",
    title: "Immutable audit trail",
    body:
      "Every utterance, critique, revision, and score is appended to a tamper-evident log — suitable for fiduciary defense and for second-pass review months later.",
  },
];

export default function Architecture() {
  return (
    <section id="hivemind" className="border-t border-ink-500">
      <div className="mx-auto max-w-72rem px-6 py-24">
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-9">
            <div className="eyebrow">THE ARCHITECTURE</div>
            <h2 className="display text-display-lg mt-4 max-w-[24ch]">
              Five components.
              <br />
              <span className="display-italic text-theory">One deliberation.</span>
            </h2>
          </div>
          <div className="md:col-span-3 md:text-right">
            <Link href="/architecture" className="group inline-flex items-center gap-2 text-sm text-paper-muted hover:text-paper">
              Full technical brief
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-5 border border-ink-500 rounded-2xl overflow-hidden">
          {COMPONENTS.map((c, i) => (
            <div
              key={c.n}
              className={`p-6 ${i > 0 ? "md:border-l border-ink-500" : ""} ${i > 0 ? "border-t md:border-t-0 border-ink-500" : ""}`}
            >
              <div className="font-mono text-xs text-paper-dim">{c.n}</div>
              <h3 className="display text-2xl mt-3">{c.title}</h3>
              <p className="mt-3 text-sm text-paper-muted leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
