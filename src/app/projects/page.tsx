import type { Metadata } from "next";
import Container from "@/components/primitives/Container";
import Card from "@/components/primitives/Card";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Index of Michael Quintin's projects.",
};

export default function ProjectsPage() {
  return (
    <Container size="base">
      <h1>Projects</h1>
      <div className="stack">
        {projects.map((p) => (
          <Card
            key={p.slug}
            href={`/projects/${p.slug}`}
            title={p.title}
            titleAs="h2"
            meta={`${p.code} · ${p.status}`}
          >
            {p.tagline}
          </Card>
        ))}
      </div>
    </Container>
  );
}
