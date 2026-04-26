import Container from "@/components/primitives/Container";
import Stack from "@/components/primitives/Stack";
import Surface from "@/components/primitives/Surface";
import { bio } from "@/content/landing/bio";

const BIO_STYLES = `
.landing-bio {
  padding-top: var(--s-6);
  padding-bottom: var(--s-6);
}
`;

export default function Bio() {
  return (
    <Container as="section" size="base" className="landing-bio">
      <style>{BIO_STYLES}</style>
      <Surface tone="mute" padding={6} border>
        <Stack gap={3}>
          <p className="t-meta" style={{ color: "var(--accent)" }}>
            {bio.heading}
          </p>
          {bio.body.map((sentence, i) => (
            <p key={i} className="t-prose">
              {sentence}
            </p>
          ))}
        </Stack>
      </Surface>
    </Container>
  );
}
