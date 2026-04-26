export default function StubPlaceholder() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--s-6)",
        fontFamily: "var(--font-mono)",
        color: "var(--fg)",
        textAlign: "center",
      }}
    >
      <p style={{ maxWidth: "60ch" }}>
        this page is being rebuilt in v2. see /docs/v2_audit.md for the plan.
      </p>
    </div>
  );
}
