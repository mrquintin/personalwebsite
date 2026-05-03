import type { ReactNode } from "react";
import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import StatusPill from "@/components/projects/StatusPill";
import type { ProjectMetadata } from "@/lib/projects/types";

type ProjectShellProps = {
  metadata: ProjectMetadata;
  presentation?: ReactNode;
  body?: ReactNode;
  relatedLinks?: ReactNode;
};

const SHELL_STATUS_TO_V1: Record<
  ProjectMetadata["status"],
  "active" | "shipped" | "draft"
> = {
  exploration: "draft",
  "in-progress": "active",
  shipped: "shipped",
};

export default function ProjectShell({
  metadata,
  presentation,
  body,
  relatedLinks,
}: ProjectShellProps) {
  return (
    <Container as="article" size="base" className="ps-shell site-page">
      <div className="ps-shell-sections">
        <header className="ps-shell__header">
          <Stack gap={3}>
            <div className="ps-shell__meta">
              <span>{metadata.code}</span>
              <StatusPill status={SHELL_STATUS_TO_V1[metadata.status]} />
            </div>
            <h1 className="site-title ph-hero__title">{metadata.title}</h1>
            <p className="site-subhead">
              {metadata.tagline}
            </p>
            <p className="site-lede">{metadata.framing}</p>
          </Stack>
        </header>

        {presentation ? (
          <section aria-label={`${metadata.title} presentation`}>
            {presentation}
          </section>
        ) : null}

        {body ? (
          <section aria-label={`${metadata.title} body`}>{body}</section>
        ) : null}

        {relatedLinks ? (
          <section aria-label={`${metadata.title} related links`}>
            {relatedLinks}
          </section>
        ) : null}

        <footer
          aria-label={`${metadata.title} ask the LLM`}
          className="ps-shell-footer"
        >
          <Link href="/chat" variant="subtle" className="site-action">
            {`ask my LLM about ${metadata.title}`}
          </Link>
        </footer>
      </div>
    </Container>
  );
}
