import Cluster from "@/components/primitives/Cluster";
import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import { hero } from "@/content/landing/hero";

const HERO_STYLES = `
.landing-hero {
  padding-top: var(--s-9);
  padding-bottom: var(--s-7);
}
@media (max-width: 640px) {
  .landing-hero {
    padding-top: var(--s-7);
    padding-bottom: var(--s-6);
  }
}
`;

export default function Hero() {
  return (
    <Container as="section" size="base" className="landing-hero">
      <style>{HERO_STYLES}</style>
      <Stack gap={5}>
        <h1 className="t-headline">{hero.name}</h1>
        <p className="t-mono-body">{hero.tagline}</p>
        <p className="t-prose">{hero.description}</p>
        <Cluster gap={3}>
          <Link
            href={hero.primaryCta.href}
            variant="underline"
            style={{
              color: "var(--accent)",
              textDecorationColor: "var(--accent)",
            }}
          >
            {hero.primaryCta.label}
          </Link>
          <Link href={hero.secondaryCta.href} variant="subtle">
            {hero.secondaryCta.label}
          </Link>
        </Cluster>
      </Stack>
    </Container>
  );
}
