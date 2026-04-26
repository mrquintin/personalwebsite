import Cluster from "@/components/primitives/Cluster";
import Link from "@/components/primitives/Link";
import press from "@/content/projects/hivemind/press";

// Surface only real external artifacts — github / demo / paper kinds whose
// href is not a placeholder. press.ts currently lists those as `(pending)`
// with href "#"; the site-wide website + product-login already render in
// the project shell metadata, so they are excluded here to avoid duplication.
const ARTIFACT_KINDS = new Set(["github", "demo", "press"]);

function isReal(href: string): boolean {
  return href.length > 1 && href !== "#" && !href.startsWith("mailto:");
}

export default function Links() {
  const items = press.filter(
    (a) => ARTIFACT_KINDS.has(a.kind) && isReal(a.href),
  );

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
