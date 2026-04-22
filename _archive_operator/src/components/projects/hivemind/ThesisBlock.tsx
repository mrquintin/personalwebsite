type Props = { thesis: string; mechanism: string; moat: string };

export default function ThesisBlock({ thesis, mechanism, moat }: Props) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)" }}>
      <Row k="THESIS" v={thesis} />
      <Row k="MECHANISM" v={mechanism} />
      <Row k="MOAT" v={moat} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "var(--s-3)", padding: "4px 0" }}>
      <span style={{ color: "var(--fg-mute)", textAlign: "right" }}>{k}</span>
      <span style={{ color: "var(--fg)" }}>{v}</span>
    </div>
  );
}
