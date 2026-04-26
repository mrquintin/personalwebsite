import Cluster from "@/components/primitives/Cluster";
import Stack from "@/components/primitives/Stack";
import { portraitPresent, portraitSrc } from "@/lib/site/portrait";

type Props = {
  name: string;
  roles: string[];
  based?: string;
};

export default function AboutHero({ name, roles, based }: Props) {
  const text = (
    <Stack gap={3}>
      <h1 className="t-headline" style={{ margin: 0 }}>
        {name}
      </h1>
      <p className="t-mono-body" style={{ margin: 0, color: "var(--fg-mute)" }}>
        {roles.join(" · ")}
      </p>
      {based && (
        <p className="t-meta" style={{ margin: 0, color: "var(--fg-faint)" }}>
          {based}
        </p>
      )}
    </Stack>
  );

  if (!portraitPresent) return text;

  return (
    <Cluster gap={5} align="start">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={portraitSrc}
        alt={`Portrait of ${name}`}
        width={160}
        height={160}
        style={{
          width: 160,
          height: 160,
          objectFit: "cover",
          border: "var(--border-hair)",
        }}
      />
      {text}
    </Cluster>
  );
}
