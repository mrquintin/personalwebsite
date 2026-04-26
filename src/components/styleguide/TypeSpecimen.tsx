const PANGRAM = "The quick brown fox jumps over the lazy dog 0123456789";

export type TypeSpecimenProps = {
  utility: string;
  size: string;
  lineHeight: string;
  sample?: string;
};

export default function TypeSpecimen({
  utility,
  size,
  lineHeight,
  sample = PANGRAM,
}: TypeSpecimenProps) {
  return (
    <article
      style={{
        borderTop: "var(--border-hair)",
        padding: "var(--s-4) 0",
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "var(--s-5)",
        alignItems: "baseline",
      }}
    >
      <header
        style={{
          fontFamily: "var(--t-mono)",
          fontSize: "var(--t-sm-size)",
          color: "var(--fg-mute)",
        }}
      >
        <div style={{ color: "var(--fg)" }}>.{utility}</div>
        <div style={{ marginTop: "var(--s-1)" }}>
          {size} / {lineHeight}
        </div>
      </header>
      <div className={utility}>{sample}</div>
    </article>
  );
}
