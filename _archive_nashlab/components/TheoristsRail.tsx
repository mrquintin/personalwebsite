import { THEORIST_DB } from "@/lib/scenarios";

const ROSTER = ["nash", "porter", "christensen", "drucker", "kahneman", "simon", "deming"]
  .map((id) => THEORIST_DB[id]);

export default function TheoristsRail() {
  // Duplicated once for seamless marquee loop
  const tiles = [...ROSTER, ...ROSTER];

  return (
    <section className="border-t border-ink-500">
      <div className="mx-auto max-w-72rem px-6 py-24 text-center">
        <div className="eyebrow">WHO IS IN THE ROOM</div>
        <p className="display text-display-md mt-6 mx-auto max-w-[36ch]">
          Every deliberation convenes the people you would have hired{" "}
          <span className="display-italic text-theory">if credentialism weren&apos;t in the way.</span>
        </p>
      </div>

      <div className="relative border-t border-b border-ink-500 overflow-hidden py-10">
        <div className="marquee">
          {tiles.map((t, i) => (
            <div key={`${t.id}-${i}`} className="flex flex-col items-start min-w-[16rem]">
              <span className="display text-2xl text-paper">{t.full}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-paper-dim mt-1">
                {t.domain}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-24 pointer-events-none"
             style={{ background: "linear-gradient(to right, var(--ink-900), transparent)" }} />
        <div className="absolute inset-y-0 right-0 w-24 pointer-events-none"
             style={{ background: "linear-gradient(to left, var(--ink-900), transparent)" }} />
      </div>

      <p className="mx-auto max-w-72rem px-6 py-8 text-center text-[12px] text-paper-dim">
        Each theorist is a peer-reviewed knowledge base, constructed from the named author&apos;s own corpus and contemporaneous secondary literature, audited by domain experts before deployment.
      </p>
    </section>
  );
}
