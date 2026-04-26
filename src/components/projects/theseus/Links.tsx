import Cluster from "@/components/primitives/Cluster";
import Link from "@/components/primitives/Link";
import metadata from "@/content/projects/theseus/metadata";

// THS surfaces only real external artifacts (e.g. thesescodex.com).
// Mailto, in-site, and placeholder hrefs are filtered out so the project
// shell does not render an empty cluster.
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
