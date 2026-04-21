import type { Metadata } from "next";
import InvestorForm from "@/components/InvestorForm";

export const metadata: Metadata = {
  title: "Investors",
  description:
    "A structural wedge into a $450B industry. Multi-agent debate reduces hallucination; the knowledge base is the asset; the audit trail is the moat.",
};

const PILLARS = [
  {
    n: "01",
    title: "Multi-agent debate cuts hallucination",
    body:
      "Single-model LLMs hallucinate at rates that no fiduciary buyer can accept. Adversarial peer review by agents with distinct priors empirically reduces error and produces a defensible record of which arguments survived.",
  },
  {
    n: "02",
    title: "The knowledge base is the asset",
    body:
      "Each theorist is a peer-reviewed corpus. Constructing them is slow, audited, and proprietary. They compound: every additional client tunes practicality networks the next client benefits from.",
  },
  {
    n: "03",
    title: "The audit trail is a legal safety net",
    body:
      "Boards, regulators, and successor teams can step through any decision. This converts strategic AI from a procurement risk into a procurement requirement.",
  },
  {
    n: "04",
    title: "Proprietary strategic LLMs are the long arc",
    body:
      "The data flywheel is the deliberation log itself. Each engagement produces aligned, structured, attributable training data — at industrial volume — for purpose-built models.",
  },
  {
    n: "05",
    title: "Incumbents cannot copy without self-destruction",
    body:
      "Top-tier consulting firms cannot ship an auditable multi-agent protocol without indicting their own pricing model. The wedge is structural, not competitive.",
  },
  {
    n: "06",
    title: "Three audiences from day one",
    body:
      "Enterprises buy the deployment. Investors buy the wedge. Individuals and small orgs buy the democratization. The same protocol serves all three with different commercial wrappers.",
  },
];

export default function InvestorsPage() {
  return (
    <article>
      <section className="mx-auto max-w-72rem px-6 pt-24 pb-16">
        <div className="eyebrow">INVESTORS</div>
        <h1 className="display text-display-lg mt-4 max-w-[24ch]">
          A structural wedge into
          <br />
          <span className="display-italic text-theory">a $450B industry.</span>
        </h1>
        <p className="mt-6 max-w-[68ch] text-paper-muted leading-relaxed">
          Strategic consulting is a $450B global market whose distribution
          depends on opacity, credentialism, and the absence of an audit
          trail. Hivemind is engineered against each of those, and against
          a category of buyer — the fiduciary — that no consumer-grade AI
          can serve.
        </p>
      </section>

      <section className="border-t border-ink-500">
        <div className="mx-auto max-w-72rem px-6 py-20">
          <div className="eyebrow">WHY THIS, WHY NOW</div>
          <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.n} className="border-t border-ink-500 pt-5">
                <div className="font-mono text-xs text-paper-dim">{p.n}</div>
                <h3 className="display text-xl mt-2">{p.title}</h3>
                <p className="mt-3 text-sm text-paper-muted leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink-500">
        <div className="mx-auto max-w-72rem px-6 py-24 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="eyebrow">REQUEST THE DECK</div>
            <h2 className="display text-display-md mt-4 max-w-[20ch]">
              The deck and the technical brief, by email.
            </h2>
            <p className="mt-4 text-paper-muted leading-relaxed max-w-[44ch]">
              We answer follow-ups directly. No analyst gating, no NDA-first
              ritual. If the materials don&apos;t earn a second meeting, we
              would rather know quickly.
            </p>
          </div>
          <div className="md:col-span-7">
            <InvestorForm />
          </div>
        </div>
      </section>
    </article>
  );
}
