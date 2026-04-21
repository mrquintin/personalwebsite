import Link from "next/link";

export default function CTABand() {
  return (
    <section className="border-t border-ink-500">
      <div className="mx-auto max-w-72rem px-6 py-24">
        <div
          className="relative overflow-hidden rounded-3xl border p-10 md:p-14"
          style={{
            borderColor: "#4a4055",
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(196,182,224,0.10), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(224,166,116,0.08), transparent 60%), var(--ink-800)",
          }}
        >
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <div className="eyebrow eyebrow-accent">THE INVITATION</div>
              <h2 className="display text-display-lg mt-4 max-w-[24ch]">
                Stop renting jargon.
                <br />
                <span className="display-italic text-theory">Start owning rigor.</span>
              </h2>
              <p className="mt-6 text-paper-muted leading-relaxed max-w-[64ch]">
                Hivemind is in private deployment with selected enterprises. Investor materials and the individual waitlist are open. Bring a real strategic question — the demo runs against your prompt, not a sandbox.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center bg-paper text-ink-900 px-5 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity"
              >
                Request a demo →
              </Link>
              <Link
                href="/investors"
                className="inline-flex items-center justify-center text-sm text-paper border border-ink-500 px-5 py-2.5 rounded-full hover:border-paper-muted transition-colors"
              >
                Request the deck
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
