import type { Belief } from "@/content/about/beliefs";

export default function BeliefsList({ items }: { items: Belief[] }) {
  return (
    <ul style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)" }}>
      {items.map((b) => (
        <li key={b.n} style={{ padding: "4px 0", color: "var(--fg)" }}>
          <span style={{ color: "var(--accent-dim)" }}>{b.n}</span>
          {" · "}
          {b.text}
        </li>
      ))}
    </ul>
  );
}
