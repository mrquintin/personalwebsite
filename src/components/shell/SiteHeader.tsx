"use client";

import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import NavLink from "@/components/shell/NavLink";
import SkipLink from "@/components/shell/SkipLink";
import ThemeToggle from "@/components/shell/ThemeToggle";
import { useNavToggle } from "@/components/shell/useNavToggle";
import { microcopy } from "@/content/microcopy";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/", label: microcopy.nav.home },
  { href: "/projects", label: microcopy.nav.projects },
  { href: "/about", label: microcopy.nav.about },
  { href: "/resume", label: microcopy.nav.resume },
  { href: "/chat", label: microcopy.nav.chat },
];

export function SiteHeader() {
  const { open, toggle } = useNavToggle();

  return (
    <>
      <SkipLink />
      <header role="banner" className="shell-header">
        <Container size="wide" className="shell-header__inner">
          <Link href="/" variant="subtle" className="shell-header__identity">
            {microcopy.nav.identityShort}
          </Link>

          <nav aria-label={microcopy.nav.primaryLabel} className="shell-header__nav">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          <ThemeToggle className="shell-header__theme" />

          <button
            type="button"
            className="shell-header__hamburger"
            aria-label={open ? microcopy.nav.closeMenu : microcopy.nav.openMenu}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={toggle}
          >
            <span aria-hidden="true">☰</span>
          </button>
        </Container>
      </header>
    </>
  );
}

export default SiteHeader;
