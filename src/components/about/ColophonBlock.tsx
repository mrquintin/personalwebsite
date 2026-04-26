import Stack from "@/components/primitives/Stack";

type Props = {
  tech: string[];
  type: string[];
  tagline: string;
};

export default function ColophonBlock({ tech, type, tagline }: Props) {
  return (
    <Stack
      gap={2}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--t-xs-size)",
        color: "var(--fg-mute)",
      }}
    >
      <p style={{ margin: 0 }}>{tagline}</p>
      <p style={{ margin: 0 }}>
        <span style={{ color: "var(--fg-faint)" }}>stack ·</span> {tech.join(" · ")}
      </p>
      <p style={{ margin: 0 }}>
        <span style={{ color: "var(--fg-faint)" }}>type ·</span> {type.join(" · ")}
      </p>
    </Stack>
  );
}
