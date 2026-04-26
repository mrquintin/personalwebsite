export type SpacingRulerProps = {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  pixels: number;
};

export default function SpacingRuler({ step, pixels }: SpacingRulerProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr 80px",
        gap: "var(--s-4)",
        alignItems: "center",
        padding: "var(--s-2) 0",
        borderTop: "var(--border-hair)",
        fontFamily: "var(--t-mono)",
        fontSize: "var(--t-sm-size)",
        lineHeight: "var(--t-sm-lh)",
      }}
    >
      <span style={{ color: "var(--fg)" }}>--s-{step}</span>
      <span aria-hidden="true">
        <span
          style={{
            display: "block",
            background: "var(--accent-mute)",
            borderLeft: "2px solid var(--accent)",
            height: 12,
            width: `var(--s-${step})`,
          }}
        />
      </span>
      <span style={{ color: "var(--fg-mute)", textAlign: "right" }}>
        {pixels}px
      </span>
    </div>
  );
}
