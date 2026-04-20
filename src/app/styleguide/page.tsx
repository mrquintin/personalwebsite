// Developer-facing token reference. Not linked from navigation.
export default function StyleguidePage() {
  const swatches = [
    "--bg-0","--bg-1","--bg-2","--bg-3","--rule",
    "--fg-mute","--fg-dim","--fg","--fg-hi",
    "--accent","--accent-dim","--danger","--ok",
  ];
  const sizes = ["xxs","xs","sm","base","md","lg","xl","2xl","3xl"];
  return (
    <div className="dossier" style={{ fontFamily: "var(--font-mono)" }}>
      <h1 style={{ color: "var(--fg-mute)" }}>── STYLEGUIDE ──</h1>

      <h2 style={{ marginTop: "var(--s-5)" }}>colors</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--s-3)", marginTop: "var(--s-3)" }}>
        {swatches.map((v) => (
          <div key={v} style={{ border: "var(--border-hair)", padding: "var(--s-2)" }}>
            <div style={{ height: 40, background: `var(${v})`, marginBottom: "var(--s-2)" }} />
            <div style={{ fontSize: "var(--t-xxs-size)", color: "var(--fg-dim)" }}>{v}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "var(--s-7)" }}>type scale</h2>
      <ul style={{ marginTop: "var(--s-3)" }}>
        {sizes.map((s) => (
          <li key={s} style={{ fontSize: `var(--t-${s}-size)`, lineHeight: `var(--t-${s}-lh)`, color: "var(--fg)" }}>
            t-{s} — the operator reads.
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: "var(--s-7)" }}>type stacks</h2>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--t-md-size)", color: "var(--fg)" }}>sans (Inter): humanist prose for long-form reading.</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-md-size)", color: "var(--fg)" }}>mono (JetBrains Mono): structure, metadata, chrome.</p>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--t-md-size)", color: "var(--fg)" }}>serif (Source Serif 4): book project only.</p>

      <h2 style={{ marginTop: "var(--s-7)" }}>spacing</h2>
      <div style={{ display: "flex", gap: "var(--s-2)", alignItems: "flex-end" }}>
        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
          <div key={n} style={{ width: 16, background: "var(--accent-dim)", height: `var(--s-${n})` }} title={`s-${n}`} />
        ))}
      </div>
    </div>
  );
}
