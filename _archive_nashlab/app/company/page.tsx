import type { Metadata } from "next";
import Link from "next/link";
import CoreBeliefs from "@/components/CoreBeliefs";

export const metadata: Metadata = {
  title: "Company | The Nash Lab",
  description:
    "The Nash Lab is a research company for strategy. We rebuild strategic consulting on first principles.",
};

const HIRING = [
  {
    role: "Consultants",
    body:
      "No resumes. The hiring instrument is a five-hour blind exam followed by a tournament round in which candidates critique each other's solutions. The tournament uses Hivemind's own protocol — anyone whose critiques the protocol cannot reduce to noise advances. Final selection is by majority vote of current consultants.",
  },
  {
    role: "Academics",
    body:
      "An academic candidate proposes a knowledge base they would build. The proposal is reviewed by the Director of Academic Hiring, then voted on by the executive layer. Selected candidates are paired with a forward-deployed researcher and ship their first base within a quarter. Tenure is by contribution, not credential.",
  },
  {
    role: "Engineers",
    body:
      "Problem-first hiring. Candidates are given a real Lab problem and a week. The output — running code, with tests, and a written rationale — is the application. SWE and forward-deployed tracks share the instrument; track is decided after the offer.",
  },
];

export default function CompanyPage() {
  return (
    <article>
      <section className="mx-auto max-w-72rem px-6 pt-24 pb-16">
        <div className="eyebrow">COMPANY</div>
        <h1 className="display text-display-lg mt-4 max-w-[24ch]">
          A research company
          <br />
          <span className="display-italic text-theory">for strategy.</span>
        </h1>
        <p className="mt-6 max-w-[68ch] text-paper-muted leading-relaxed">
          The Nash Lab is a research company that rebuilds strategic consulting
          on first principles. The thesis is that strategy is a knowable craft
          — that the discipline&apos;s pathologies are structural, not
          inherent — and that an auditable multi-agent protocol can replace
          the consulting engagement as the unit of work.
        </p>
      </section>

      <CoreBeliefs />

      <section id="hiring" className="border-t border-ink-500">
        <div className="mx-auto max-w-72rem px-6 py-24 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="eyebrow">HIRING</div>
            <h2 className="display text-display-md mt-4 max-w-[18ch]">
              No resumes.
              <br />
              <span className="display-italic text-theory">Blind exams.</span>
            </h2>
            <p className="mt-6 text-paper-muted leading-relaxed max-w-[44ch]">
              The Lab&apos;s thesis on consulting begins with hiring. We screen
              for output, not provenance. Each role has a procedure designed
              for that output; none of them ask for a CV.
            </p>
          </div>

          <div className="md:col-span-7 divide-y divide-ink-500 border-y border-ink-500">
            {HIRING.map((h) => (
              <div key={h.role} className="py-8">
                <h3 className="display text-2xl">{h.role}</h3>
                <p
                  className="mt-3 text-paper-muted leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: h.body }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink-500">
        <div className="mx-auto max-w-72rem px-6 py-24 text-center">
          <div className="eyebrow">CONTACT</div>
          <h2 className="display text-display-md mt-4 max-w-[28ch] mx-auto">
            Want to talk, hire, or be hired?
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:contact@nashlab.ai"
              className="bg-paper text-ink-900 text-sm px-5 py-2.5 rounded-full"
            >
              contact@nashlab.ai
            </a>
            <Link href="/demo" className="border border-ink-500 text-sm px-5 py-2.5 rounded-full hover:border-paper-muted transition-colors">
              Request a demo
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
