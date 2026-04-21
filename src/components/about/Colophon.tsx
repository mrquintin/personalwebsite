type Props = { tech: string[]; type: string[]; tagline: string; buildVersion?: string };

// R04: build version was on the status bar; now lives here.
export default function Colophon({ tech, type, tagline, buildVersion }: Props) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-xs-size)", color: "var(--fg-mute)" }}>
      {tagline} · stack: {tech.join(" · ")} · type: {type.join(" · ")}
      {buildVersion && (
        <div style={{ marginTop: "var(--s-2)" }}>
          build v{buildVersion}
        </div>
      )}
    </div>
  );
}
