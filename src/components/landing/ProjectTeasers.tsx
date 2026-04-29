import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import { projects } from "@/content/projects/index";

export default function ProjectTeasers() {
  return (
    <Container as="section" size="wide" className="site-section project-teasers">
      <Stack gap={5}>
        <div className="project-teasers__header">
          <div>
            <p className="site-eyebrow">Current work</p>
            <h2 className="site-heading">Projects</h2>
          </div>
          <Link href="/projects" variant="subtle" className="site-action">
            View all
          </Link>
        </div>
        <div className="project-teasers__grid">
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={"/projects/" + p.slug}
              variant="subtle"
              className="project-card"
            >
              <span className="project-card__meta">
                <span>{p.code}</span>
                <span>{p.status}</span>
              </span>
              <div>
                <h3 className="project-card__title">{p.title}</h3>
                <p className="project-card__text">{p.tagline}</p>
              </div>
              <span className="project-card__open">Open</span>
            </Link>
          ))}
        </div>
      </Stack>
    </Container>
  );
}
