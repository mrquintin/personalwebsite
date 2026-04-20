import Link from "next/link";
import Wordmark from "./Wordmark";

const PRODUCT = [
  { href: "/#hivemind",     label: "Hivemind" },
  { href: "/#demo",         label: "Live demo" },
  { href: "/architecture",  label: "Architecture" },
  { href: "/demo",          label: "Request a demo" },
];
const AUDIENCE = [
  { href: "/demo",          label: "For enterprises" },
  { href: "/investors",     label: "For investors" },
  { href: "/waitlist",      label: "For individuals" },
];
const COMPANY = [
  { href: "/company",            label: "About" },
  { href: "/company#beliefs",    label: "Core beliefs" },
  { href: "/company#hiring",     label: "Hiring" },
  { href: "mailto:contact@nashlab.ai", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-500 mt-32">
      <div className="mx-auto max-w-72rem px-6 py-16 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <Wordmark />
          <p className="mt-4 text-paper-muted text-sm leading-relaxed max-w-sm">
            Hivemind is a multi-agent AI that replaces consulting engagements with peer-reviewed, auditable strategic analysis.
          </p>
          <a
            href="mailto:contact@nashlab.ai"
            className="mt-6 inline-flex items-center gap-2 text-xs px-3 py-1.5 border border-ink-500 rounded-full hover:border-paper-muted transition-colors"
          >
            contact@nashlab.ai
          </a>
        </div>

        <FooterCol title="Product" items={PRODUCT} />
        <FooterCol title="Audience" items={AUDIENCE} />
        <FooterCol title="Company" items={COMPANY} />
      </div>

      <div className="border-t border-ink-500">
        <div className="mx-auto max-w-72rem px-6 py-6 flex items-center justify-between text-xs text-paper-dim">
          <span>© {new Date().getFullYear()} The Nash Lab</span>
          <span className="font-mono uppercase tracking-wider">Rigor · Peer review · No theater</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="eyebrow mb-3">{title}</div>
      <ul className="space-y-2 text-sm text-paper-muted">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="hover:text-paper transition-colors">{it.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
