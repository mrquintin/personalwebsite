import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Architecture — Hivemind | The Nash Lab",
  description:
    "The full technical brief for Hivemind: the theory network, monitor, practicality network, audit trail, and the firm-side teams that operate them.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16 first:mt-0">
      <h2 className="display text-display-md">{title}</h2>
      <div className="mt-5 max-w-[68ch] text-paper-muted leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}

export default function ArchitecturePage() {
  return (
    <article className="mx-auto max-w-72rem px-6 pt-24 pb-32">
      <div className="eyebrow">TECHNICAL BRIEF</div>
      <h1 className="display text-display-lg mt-4 max-w-[20ch]">
        The architecture of Hivemind.
      </h1>
      <p className="mt-6 max-w-[68ch] text-paper-muted leading-relaxed">
        This page is the written counterpart to the interactive demo. The demo
        shows the protocol; this brief explains how each component is built,
        what it depends on, and which firm-side team operates it. Read it the
        same way you would read a system architecture document — assume the
        components are real and the trade-offs are deliberate.
      </p>

      <Section title="Input: the prompt">
        <p>
          A Hivemind deliberation begins with a single prompt: a strategic
          question phrased in plain language by a named operator. The prompt is
          stored verbatim, time-stamped, and bound to the audit trail before
          any agent runs. The user also sets two parameters — sufficiency and
          feasibility — which govern when the deliberation halts and what it
          must clear.
        </p>
        <p>
          The system makes no attempt to rewrite or simplify the prompt. Its
          assumption is that strategic questions are sharper as the operator
          phrased them than as a model would re-phrase them.
        </p>
      </Section>

      <Section title="01 — Theory network">
        <p>
          A panel of agents, each backed by a peer-reviewed knowledge base
          built from a single school of strategic thought — Nash&apos;s game
          theory, Porter&apos;s five forces, Christensen&apos;s disruption,
          Drucker&apos;s management-by-objectives, Kahneman&apos;s behavioral
          economics, and others. Knowledge bases are constructed by
          forward-deployed researchers from each author&apos;s own corpus and
          contemporaneous secondary literature, then audited by domain experts
          before deployment.
        </p>
        <p>
          The agents propose initial solutions in parallel, then enter a
          critique-and-revise loop. Critiques cite the framework being
          challenged. The loop terminates when the Monitor reports unique
          solution clusters at or below the sufficiency value.
        </p>
        <p>
          Retrieval is RAG over each agent&apos;s own knowledge base — agents
          cannot read each other&apos;s sources, only each other&apos;s
          arguments. This is by design: the protocol depends on the agents
          arguing from different priors, not on them converging on the same
          source material.
        </p>
      </Section>

      <Section title="02 — Monitor">
        <p>
          The Monitor is the deliberation&apos;s conductor. It clusters
          syntactically distinct solutions that are semantically equivalent,
          maintains the running count of unique clusters, and stops the loop
          when that count meets the sufficiency value. It also records each
          critique and revision into the audit trail with an indelible
          ordering.
        </p>
        <p>
          The Monitor does not vote. It does not weight theorists. Its sole
          authority is over termination and aggregation; the substance of
          recommendations belongs to the theorists.
        </p>
      </Section>

      <Section title="03 — Practicality network">
        <p>
          The surviving aggregate solutions are passed to a second network of
          agents whose role is to score each one against real-world
          constraints: legal exposure, financial impact, operational capacity,
          and reputational risk. Scores are 0 to 100 with a one-line note per
          dimension. Practicality agents are tuned to the client&apos;s
          industry, jurisdiction, and balance sheet.
        </p>
        <p>
          If the average feasibility falls below the user-set threshold, the
          deliberation regenerates from scratch. The audit trail preserves the
          rejected attempt — the regeneration is not a reset, it is a step.
        </p>
      </Section>

      <Section title="04 — Output and audit trail">
        <p>
          The output is a small number of aggregate solutions, each with a
          combined rationale and a list of supporting theorists. The audit
          trail underneath contains every utterance, every critique
          (including those withdrawn), every revision, and every score. The
          trail is append-only and cryptographically chained.
        </p>
        <p>
          The trail&apos;s purpose is fiduciary defense. A board, a regulator,
          or a successor team can step through any decision and see not only
          what was recommended but what was considered, vetoed, and revised.
        </p>
      </Section>

      <Section title="Tuning and calibration">
        <p>
          Sufficiency lets the operator decide how converged the room must be
          before the recommendation ships. Feasibility lets the operator
          decide how realistic it must be. Both are exposed as numbers —
          sufficiency between 1 and the panel size, feasibility between 60
          and 95 — because the alternative (hidden defaults) defeats the
          point of an auditable protocol.
        </p>
        <p>
          Defaults are sufficiency = 2 and feasibility = 80. Most clients
          tune them after their first three deliberations.
        </p>
      </Section>

      <Section title="Implementation notes">
        <p>
          Hivemind runs natively on client infrastructure as a subscription.
          Client data does not leave the client&apos;s perimeter. Knowledge
          bases are versioned and signed; updates are pushed by the
          Lab&apos;s research team and applied with explicit consent.
        </p>
        <p>
          The system is composable: clients can add custom theorists (a
          house-economist, a regulatory specialist) by supplying a corpus
          and accepting the Lab&apos;s peer-review pipeline.
        </p>
      </Section>

      <Section title="Firm-side composition">
        <p>
          The Nash Lab is structured around four teams: a customer-success
          team split between platform engineers and forward-deployed engineers
          who sit with clients during onboarding; a research team split
          between pure researchers (who construct and audit knowledge bases)
          and forward-deployed researchers (who tune practicality networks
          per industry); a compliance team that owns the audit trail and the
          legal posture; and an executive layer that owns hiring and
          publishes the Lab&apos;s technical writing.
        </p>
      </Section>

      <div className="mt-20 border-t border-ink-500 pt-10 flex flex-wrap gap-4">
        <Link href="/demo" className="bg-paper text-ink-900 text-sm px-5 py-2.5 rounded-full">
          Request a demo →
        </Link>
        <Link href="/investors" className="border border-ink-500 text-sm px-5 py-2.5 rounded-full hover:border-paper-muted transition-colors">
          Investor materials
        </Link>
      </div>
    </article>
  );
}
