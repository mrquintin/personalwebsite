import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LOG · Changelog",
  description: "Notable changes to the site, in date order.",
};

const ENTRIES: { date: string; tag: string; body: string[] }[] = [
  {
    date: "2026-04-20",
    tag: "Added",
    body: [
      "Operator-aesthetic redesign: tokens, shell, accordion landing, command palette.",
      "Bespoke pages for Hivemind, Purposeless Efficiency, and Theseus.",
      "Generic dossier scaffold + projects index.",
      "Boot sequence, status bar, ticker, help modal.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="dossier" style={{ fontFamily: "var(--font-mono)" }}>
      <h1 style={{ color: "var(--fg-mute)", marginBottom: "var(--s-4)" }}>── CHANGELOG ──</h1>
      {ENTRIES.map((e) => (
        <section key={e.date} style={{ marginBottom: "var(--s-5)" }}>
          <div style={{ color: "var(--fg-hi)" }}>
            {e.date} · <span style={{ color: "var(--accent)" }}>{e.tag}</span>
          </div>
          <ul style={{ marginTop: "var(--s-2)", color: "var(--fg)" }}>
            {e.body.map((b, i) => <li key={i}>· {b}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
