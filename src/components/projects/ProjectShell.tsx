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
    <Container as="article" size="base" className="ps-shell">
      <div className="ps-shell-sections">
        <header>
          <Stack gap={3}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--s-3)",
                fontFamily: "var(--font-mono)",
                color: "var(--fg-muted, var(--fg))",
                fontSize: "0.875rem",
              }}
            >
              <span>{metadata.code}</span>
              <StatusPill status={SHELL_STATUS_TO_V1[metadata.status]} />
            </div>
            <h1 className="ph-hero__title">{metadata.title}</h1>
            <p
              style={{
                margin: 0,
                color: "var(--fg-muted, var(--fg))",
                fontStyle: "italic",
              }}
            >
              {metadata.tagline}
            </p>
            <p style={{ margin: 0, maxWidth: "70ch" }}>{metadata.framing}</p>
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
          <Link href="/chat">{`ask my LLM about ${metadata.title}`}</Link>
        </footer>
      </div>
    </Container>
  );
}
