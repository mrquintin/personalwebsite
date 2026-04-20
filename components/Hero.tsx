import Link from "next/link";
import NetworkBackground from "./NetworkBackground";

const SUBHEAD =
  "Hivemind is a subscription AI tool that gives any organization the strategic reasoning of a top consulting firm — without the firm. A network of AI agents, each carrying a different school of strategic thought, propose solutions, critique each other, and revise until they converge; a second network scores feasibility and vetoes anything unrealistic. Every deliberation produces an immutable audit trail suitable for fiduciary defense.";

const STATS = [
  { n: "5",  l: "theorist agents per query" },
  { n: "4",  l: "practicality constraints enforced" },
  { n: "0",  l: "mockery of jargon permitted" },
  { n: "∞",  l: "audit trail, by design" },
];

export default function Hero() {
  return (
    <section className="relative pt-28 md:pt-36 pb-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg" aria-hidden="true" />
      <div className="absolute inset-0" aria-hidden="true">
        <NetworkBackground />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 40%, var(--ink-900) 80%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-72rem px-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="eyebrow">THE NASH LAB / 01</span>
          <span className="h-px w-10 bg-ink-500" aria-hidden="true" />
          <span className="eyebrow eyebrow-accent">HIVEMIND</span>
        </div>

        <h1 className="display text-display-xl max-w-[18ch]">
          Strategic thinking,
          <br />
          <span className="display-italic text-theory">democratized.</span>
        </h1>

        <p className="mt-8 max-w-[68ch] text-lg md:text-xl text-paper-muted leading-relaxed">
          {SUBHEAD}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/demo"
            className="group inline-flex items-center gap-2 bg-paper text-ink-900 px-5 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Request a demo
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="#demo"
            className="text-sm text-paper-muted hover:text-paper transition-colors"
          >
            Watch the Hivemind deliberate ↓
          </Link>
        </div>

        <div className="mt-20 border-t border-ink-500 pt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.l}>
              <div className="display text-5xl md:text-6xl text-paper">{s.n}</div>
              <div className="mt-2 text-xs text-paper-dim">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
