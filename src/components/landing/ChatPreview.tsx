import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import Surface from "@/components/primitives/Surface";
import { chatPreview } from "@/content/landing/chat_preview";

const CHAT_PREVIEW_SECTION_STYLES = `
.landing-chat-preview {
  padding-top: var(--s-8);
  padding-bottom: var(--s-8);
}
`;

export default function ChatPreview() {
  const { mode, heading, lede, exampleExchange, cta } = chatPreview;

  return (
    <Container as="section" size="base" className="landing-chat-preview">
      <style>{CHAT_PREVIEW_SECTION_STYLES}</style>
      <Surface tone="raise" padding={7} border>
        <Stack gap={5}>
          <h2 className="t-h2">{heading}</h2>
          <p className="t-prose">{lede}</p>

          {mode === "live" ? (
            // TODO(suite-19): wire single-input field that streams answers
            // from /api/chat once the backend (suite 18) is live.
            <div className="chat-preview__exchange" data-mode="live">
              <p className="chat-preview__q">{exampleExchange.question}</p>
              <p className="chat-preview__a">{exampleExchange.answer}</p>
            </div>
          ) : (
            <div className="chat-preview__exchange" data-mode="static">
              <p className="chat-preview__q">{exampleExchange.question}</p>
              <p className="chat-preview__a">{exampleExchange.answer}</p>
            </div>
          )}

          <Link href={cta.href} variant="underline">
            {cta.label} →
          </Link>
        </Stack>
      </Surface>
    </Container>
  );
}
