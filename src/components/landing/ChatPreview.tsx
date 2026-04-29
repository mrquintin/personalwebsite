import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import { chatPreview } from "@/content/landing/chat_preview";

export default function ChatPreview() {
  const { heading, lede, cta } = chatPreview;

  return (
    <Container as="section" size="wide" className="site-section--compact">
      <div className="site-callout">
        <Stack gap={2}>
          <p className="site-eyebrow">Grounded chat</p>
          <h2 className="site-heading">{heading}</h2>
          <p className="site-subhead">{lede}</p>
        </Stack>
        <Link href={cta.href} variant="subtle" className="site-action site-action--primary">
          {cta.label}
        </Link>
      </div>
    </Container>
  );
}
