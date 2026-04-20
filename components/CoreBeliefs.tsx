// TODO(.cursorrules): replace one-liners with the canonical TNL Core
// Beliefs phrasings when 00-cursorrules.txt is supplied. Headlines are
// from Prompt 5; one-liners are placeholders consistent with each.

export const BELIEFS = [
  { n: "01", text: "Businesses' problems are not as variant as we think." },
  { n: "02", text: "AI is reliable at (1) solving problems and (2) catching its own errors when peers are present." },
  { n: "03", text: "The consulting industry's offer is easier to disrupt than its mythology suggests." },
  { n: "04", text: "The networking-based structure of the corporate world is a market inefficiency, not a moat." },
  { n: "05", text: "Play the man, not the game: incentives shape outputs more than ability does." },
  { n: "06", text: "The scientific method works." },
  { n: "07", text: "Honesty is the best policy." },
];

export default function CoreBeliefs() {
  return (
    <section id="beliefs" className="border-t border-ink-500">
      <div className="mx-auto max-w-72rem px-6 py-24 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="eyebrow">CORE BELIEFS</div>
          <h2 className="display text-display-lg mt-4 max-w-[20ch]">
            The preconditions for joining us.
          </h2>
          <p className="mt-6 text-paper-muted leading-relaxed max-w-[44ch]">
            These seven beliefs are filters, not slogans. If any reads as obviously wrong, the work here will not be a fit. They are the substrate from which the firm-side teams are hired and from which Hivemind itself is designed.
          </p>
        </div>

        <ol className="md:col-span-7 divide-y divide-ink-500 border-y border-ink-500">
          {BELIEFS.map((b) => (
            <li key={b.n} className="py-5 grid grid-cols-12 gap-4 items-baseline">
              <span className="col-span-2 md:col-span-1 font-mono text-xs text-paper-dim">{b.n}</span>
              <span className="col-span-10 md:col-span-11 display text-xl md:text-2xl text-paper">{b.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
