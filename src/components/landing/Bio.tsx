import Container from "@/components/primitives/Container";
import Stack from "@/components/primitives/Stack";
import { bio } from "@/content/landing/bio";

export default function Bio() {
  return (
    <Container as="section" size="wide" className="site-section home-bio">
      <div className="home-bio__grid">
        <Stack gap={3}>
          <p className="site-eyebrow">{bio.heading}</p>
          {bio.body.map((sentence, i) => (
            <p key={i} className="site-lede">
              {sentence}
            </p>
          ))}
        </Stack>
        <dl className="home-bio__facts">
          {bio.facts.map((fact) => (
            <div key={fact.label} className="home-bio__fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Container>
  );
}
