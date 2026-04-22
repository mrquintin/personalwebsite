type Props = { tech: string[]; type: string[]; tagline: string };
export default function Colophon({ tech, type, tagline }: Props) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-xs-size)", color: "var(--fg-mute)" }}>
      {tagline} · stack: {tech.join(" · ")} · type: {type.join(" · ")}
    </div>
  );
}
