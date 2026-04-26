import Badge from "@/components/primitives/Badge";
import Cluster from "@/components/primitives/Cluster";
import Container from "@/components/primitives/Container";
import Stack from "@/components/primitives/Stack";
import type { ProjectMetadataStatus } from "@/lib/projects/types";

type ProjectHeroProps = {
  code: string;
  title: string;
  tagline: string;
  framing: string;
  status: ProjectMetadataStatus;
};

const STATUS_TONE: Record<ProjectMetadataStatus, "neutral" | "accent" | "ok"> = {
  exploration: "neutral",
  "in-progress": "accent",
  shipped: "ok",
};

const STATUS_LABEL: Record<ProjectMetadataStatus, string> = {
  exploration: "exploration",
  "in-progress": "in-progress",
  shipped: "shipped",
};

export default function ProjectHero({
  code,
  title,
  tagline,
  framing,
  status,
}: ProjectHeroProps) {
  return (
    <Container
      as="header"
      size="base"
      className="ph-hero"
      style={{
        paddingTop: "var(--s-8)",
        paddingBottom: "var(--s-6)",
      }}
    >
      <Stack gap={4}>
        <Cluster gap={3} align="baseline">
          <span className="t-meta">{code}</span>
          <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
        </Cluster>
        <h1 className="ph-hero__title">{title}</h1>
        <p className="t-mono-body">{tagline}</p>
        <p className="t-prose">{framing}</p>
      </Stack>
    </Container>
  );
}
