import type { ArcVolume } from "@/content/projects/purposeless-efficiency/arc";

export default function Arc({ items }: { items: ArcVolume[] }) {
  return (
    <div style={{ display: "flex", gap: "var(--s-4)", overflowX: "auto", paddingBottom: "var(--s-2)" }}>
      {items.map((v) => (
        <div key={v.numeral} style={{
          flex: "0 0 220px", padding: "var(--s-4)",
          border: "var(--border-hair)", fontFamily: "var(--font-mono)",
        }}>
          <div style={{ color: "var(--fg-mute)", fontSize: "var(--t-xs-size)" }}>VOLUME {v.numeral}</div>
          <div style={{ fontFamily: "var(--font-serif)", color: "var(--fg-hi)", fontSize: "var(--t-md-size)", margin: "var(--s-2) 0" }}>
            {v.title}
          </div>
          <div style={{ color: "var(--fg-mute)", fontSize: "var(--t-xxs-size)", textTransform: "uppercase" }}>{v.status}</div>
        </div>
      ))}
    </div>
  );
}
