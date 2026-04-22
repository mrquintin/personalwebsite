type Props = { paragraphs?: string[] };
export default function Excerpt({ paragraphs }: Props) {
  if (!paragraphs || paragraphs.length === 0) {
    return <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)" }}>— excerpt coming soon —</div>;
  }
  return (
    <article className="pe-prose">
      {paragraphs.map((p, i) => (
        <p key={i} className={i === 0 ? "first-block" : undefined}>{p}</p>
      ))}
    </article>
  );
}
