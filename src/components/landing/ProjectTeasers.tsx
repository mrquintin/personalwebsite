import Card from "@/components/primitives/Card";
import Cluster from "@/components/primitives/Cluster";
import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import { projects } from "@/content/projects/index";

const PROJECT_TEASERS_STYLES = `
.project-teasers {
  padding-top: var(--s-7);
  padding-bottom: var(--s-7);
}
.project-teasers__grid {
  width: 100%;
}
.project-teasers__grid > * {
  flex: 1 1 100%;
  min-width: 0;
  display: block;
}
@media (min-width: 768px) {
  .project-teasers__grid > * {
    flex: 1 1 calc(50% - var(--s-4));
  }
}
@media (min-width: 900px) {
  .project-teasers__grid > * {
    flex: 1 1 calc((100% - 2 * var(--s-4)) / 3);
  }
}
`;

export default function ProjectTeasers() {
  return (
    <Container as="section" size="wide" className="project-teasers">
      <style>{PROJECT_TEASERS_STYLES}</style>
      <Stack gap={5}>
        <h2 className="t-h2">Projects</h2>
        <Cluster gap={4} align="stretch" className="project-teasers__grid">
          {projects.map((p) => (
            <Card
              key={p.slug}
              href={"/projects/" + p.slug}
              title={p.title}
              meta={p.code + " · " + p.status}
            >
              {p.tagline}
            </Card>
          ))}
        </Cluster>
        <Link href="/projects" variant="subtle">
          See all projects ↗
        </Link>
      </Stack>
    </Container>
  );
}
