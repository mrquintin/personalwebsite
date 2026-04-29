import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import { footerLinks } from "@/content/site/footer";
import { microcopy } from "@/content/microcopy";

export function SiteFooter() {
  const { external, site } = footerLinks;
  const allLinks = [
    ...external.map((l) => ({ ...l, external: true })),
    ...site.map((l) => ({ ...l, external: false })),
  ];

  return (
    <footer role="contentinfo" className="shell-footer">
      <Container size="wide" className="shell-footer__inner">
        <p className="shell-footer__copyright">{microcopy.meta.copyrightLine}</p>
        <nav aria-label={microcopy.nav.footerLabel} className="shell-footer__links">
          {allLinks.map((link) => (
            <Link key={link.href} href={link.href} variant="subtle" external={link.external}>
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}

export default SiteFooter;
