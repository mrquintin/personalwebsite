import Link from "next/link";

type Tone = "monitor" | "theory" | "pragma";

const CARDS: {
  tone: Tone;
  tag: string;
  title: string;
  body: string;
  bullets: string[];
  cta: { href: string; label: string };
}[] = [
  {
    tone: "monitor",
    tag: "ENTERPRISES",
    title: "For enterprises",
    body:
      "Run Hivemind on your own infrastructure as a strategic-reasoning subscription, tuned to your industry. Use it as the always-available second opinion no consulting bench can match.",
    bullets: [
      "Native deployment on client infrastructure",
      "Knowledge bases tuned to your industry",
      "Audit trail suitable for fiduciary defense",
      "Forward-deployed engineers and researchers on call",
    ],
    cta: { href: "/demo", label: "Request a demo" },
  },
  {
    tone: "theory",
    tag: "INVESTORS",
    title: "For investors",
    body:
      "A structural wedge into a $450B industry whose distribution depends on the exact pathologies an auditable multi-agent protocol exposes. Three audiences from day one.",
    bullets: [
      "Multi-agent debate sharply reduces hallucination",
      "Knowledge base is the asset and the moat",
      "Audit trail is a legal safety net for buyers",
      "Incumbents cannot copy without self-cannibalization",
    ],
    cta: { href: "/investors", label: "Request the deck" },
  },
  {
    tone: "pragma",
    tag: "INDIVIDUALS",
    title: "For individuals & small orgs",
    body:
      "The same protocol, scaled down, available on a personal subscription. Strategic reasoning that used to require an engagement letter, now available to a solo operator with a real question.",
    bullets: [
      "Personal subscription tier (in design)",
      "Run scenarios against your own decisions",
      "Export every transcript and audit trail",
      "Built for operators, founders, and writers",
    ],
    cta: { href: "/waitlist", label: "Join the waitlist" },
  },
];

const TONE: Record<Tone, { dot: string; border: string; bg: string }> = {
  monitor: { dot: "#7ba8c9", border: "#3a4a55", bg: "rgba(123,168,201,0.04)" },
  theory:  { dot: "#c4b6e0", border: "#4a4055", bg: "rgba(196,182,224,0.04)" },
  pragma:  { dot: "#e0a674", border: "#55402a", bg: "rgba(224,166,116,0.04)" },
};

export default function AudienceSplit() {
  return (
    <section id="audiences" className="border-t border-ink-500">
      <div className="mx-auto max-w-72rem px-6 py-24">
        <div className="eyebrow">WHO IT&apos;S FOR</div>
        <h2 className="display text-display-lg mt-4 max-w-[24ch]">
          Three audiences.
          <br />
          <span className="display-italic text-theory">One thesis.</span>
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {CARDS.map((c) => {
            const t = TONE[c.tone];
            return (
              <div
                key={c.title}
                className="rounded-2xl p-6 flex flex-col"
                style={{ border: `1px solid ${t.border}`, background: t.bg }}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: t.dot }} />
                  <span className="eyebrow">{c.tag}</span>
                </div>
                <h3 className="display text-3xl mt-4">{c.title}</h3>
                <p className="mt-3 text-sm text-paper-muted leading-relaxed">{c.body}</p>
                <ul className="mt-5 space-y-2 text-sm text-paper">
                  {c.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-paper-dim">·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t" style={{ borderColor: t.border }}>
                  <Link href={c.cta.href} className="group inline-flex items-center gap-2 text-sm">
                    {c.cta.label}
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
