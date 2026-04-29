import Cluster from "@/components/primitives/Cluster";
import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import { hero } from "@/content/landing/hero";
import { projects } from "@/content/projects/index";

export default function Hero() {
  return (
    <Container as="section" size="wide" className="home-hero">
      <Stack gap={5} className="home-hero__content">
        <h1 className="site-title">{hero.name}</h1>
        <p className="site-subhead">{hero.tagline}</p>
        <p className="site-lede">{hero.description}</p>
        <Cluster gap={3} className="site-actions">
          <Link
            href={hero.primaryCta.href}
            variant="subtle"
            className="site-action site-action--primary"
          >
            {hero.primaryCta.label}
          </Link>
          <Link href={hero.secondaryCta.href} variant="subtle" className="site-action">
            {hero.secondaryCta.label}
          </Link>
        </Cluster>
      </Stack>
      <nav className="home-worknav" aria-label="Featured work">
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            variant="subtle"
            className="home-worknav__item"
          >
            <span className="home-worknav__index">{String(index + 1).padStart(2, "0")}</span>
            <span className="home-worknav__title">{project.title}</span>
            <span className="home-worknav__desc">{project.tagline}</span>
          </Link>
        ))}
      </nav>
    </Container>
  );
}
