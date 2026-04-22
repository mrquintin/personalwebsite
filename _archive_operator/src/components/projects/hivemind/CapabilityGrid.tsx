import type { Capability } from "@/content/projects/hivemind/capabilities";

const STATUS_COLOR: Record<Capability["status"], string> = {
  shipping: "var(--accent)",
  alpha:    "var(--fg)",
  planned:  "var(--fg-mute)",
};

export default function CapabilityGrid({ items }: { items: Capability[] }) {
  return (
    <div
      role="list"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "var(--s-3)",
      }}
    >
      {items.map((c) => (
        <button
          key={c.code}
          role="listitem"
          tabIndex={0}
          style={{
            textAlign: "left",
            border: "var(--border-hair)",
            padding: "var(--s-4)",
            background: "var(--bg-1)",
            fontFamily: "var(--font-mono)",
            cursor: "default",
          }}
        >
          <div style={{ color: "var(--accent-dim)", fontSize: "var(--t-xs-size)" }}>{c.code}</div>
          <div style={{ color: "var(--fg)", margin: "var(--s-2) 0" }}>{c.name}</div>
          <div style={{ color: "var(--fg-dim)", fontFamily: "var(--font-sans)", fontSize: "var(--t-xs-size)" }}>{c.blurb}</div>
          <div style={{ color: STATUS_COLOR[c.status], fontSize: "var(--t-xxs-size)", marginTop: "var(--s-3)" }}>
            {c.status}
          </div>
        </button>
      ))}
    </div>
  );
}
