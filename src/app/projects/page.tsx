import type { Metadata } from "next";
import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Index of Michael Quintin's projects.",
};

export default function ProjectsPage() {
  return (
    <Container as="section" size="wide" className="site-page">
      <Stack gap={6}>
        <header className="projects-index__header">
          <div>
            <p className="site-eyebrow">Index</p>
            <h1 className="site-title">Projects</h1>
          </div>
          <p className="site-subhead">
            Three public surfaces: software, a book, and a knowledge system.
          </p>
        </header>
        <div className="project-teasers__grid">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            variant="subtle"
            className="project-card"
          >
            <span className="project-card__meta">
              <span>{p.code}</span>
              <span>{p.status}</span>
            </span>
            <div>
              <h2 className="project-card__title">{p.title}</h2>
              <p className="project-card__text">{p.tagline}</p>
            </div>
            <span className="project-card__open">Open project</span>
          </Link>
        ))}
        </div>
      </Stack>
    </Container>
  );
}
