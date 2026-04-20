type Props = { title: string; author: string; subtitle: string };
export default function TitleBlock({ title, author, subtitle }: Props) {
  // Render the title on two lines for the literary effect.
  const [a, b] = title.split(/\s+/, 2);
  return (
    <div>
      <h1 style={{
        fontFamily: "var(--font-serif)",
        fontSize: "var(--t-3xl-size)", lineHeight: 1.0,
        color: "var(--fg-hi)", margin: 0, letterSpacing: "-0.01em",
      }}>
        <span style={{ display: "block" }}>{a}</span>
        <span style={{ display: "block", fontStyle: "italic" }}>{b}</span>
      </h1>
      <div className="pe-title-mono" style={{ color: "var(--fg-mute)", marginTop: "var(--s-4)" }}>
        — {author}
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg-dim)", marginTop: "var(--s-3)", fontSize: "var(--t-md-size)", maxWidth: "40ch" }}>
        {subtitle}
      </div>
    </div>
  );
}
