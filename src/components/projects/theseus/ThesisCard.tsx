type Props = { claim: string; method: string; role: string };

export default function ThesisCard({ claim, method, role }: Props) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)", border: "var(--border-hair)", padding: "var(--s-4)" }}>
      <Row k="CLAIM"  v={claim} />
      <Row k="METHOD" v={method} />
      <Row k="ROLE"   v={role} />
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
