import Cluster from "@/components/primitives/Cluster";
import Link from "@/components/primitives/Link";
import metadata from "@/content/projects/purposeless-efficiency/metadata";

// PRP has no real external artifacts yet — the manuscript is unpublished and
// there is no press kit or repo. metadata.externalLinks is currently empty,
// so this component renders nothing rather than emitting an empty heading.
// When real links arrive (publisher page, sample chapter, recorded reading),
// extend metadata.externalLinks and they will surface here automatically.
function isReal(href: string): boolean {
  return (
    href.length > 1 &&
    href !== "#" &&
    !href.startsWith("mailto:") &&
    !href.startsWith("/")
  );
}

export default function Links() {
  const items = (metadata.externalLinks ?? []).filter((l) => isReal(l.href));

  if (items.length === 0) return null;

  return (
    <Cluster as="nav" gap={4} aria-label="Project artifacts">
      {items.map((item) => (
        <Link key={item.href} href={item.href} external>
          {item.label}
        </Link>
      ))}
    </Cluster>
  );
}
