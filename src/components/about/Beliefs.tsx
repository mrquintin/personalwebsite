import Stack from "@/components/primitives/Stack";
import Surface from "@/components/primitives/Surface";
import type { Belief } from "@/content/about/beliefs";

export default function Beliefs({ items }: { items: Belief[] }) {
  return (
    <Surface tone="mute" padding={5} border>
      <Stack gap={3}>
        <p className="t-meta" style={{ margin: 0, color: "var(--accent)" }}>
          beliefs
        </p>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "var(--t-sm-size)",
          }}
        >
          {items.map((b) => (
            <li key={b.n} style={{ padding: "4px 0", color: "var(--fg)" }}>
              <span style={{ color: "var(--fg-faint)" }}>{b.n}</span>
              {" · "}
              {b.text}
            </li>
          ))}
        </ul>
      </Stack>
    </Surface>
  );
}
