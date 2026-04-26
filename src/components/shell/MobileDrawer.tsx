"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import NavLink from "@/components/shell/NavLink";
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

export function MobileDrawer() {
  const { open, close } = useNavToggle();
  const pathname = usePathname();
  const [isNarrow, setIsNarrow] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // B5: close on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // B3: body scroll lock when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // B4: focus trap + Escape
  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("aria-hidden"));

      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const within = panelRef.current.contains(active);

      if (e.shiftKey) {
        if (!within || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  if (!isNarrow) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={microcopy.nav.drawerLabel}
      data-open={open}
      id="mobile-drawer"
      className="shell-drawer"
    >
      <div
        className="shell-drawer__backdrop"
        data-open={open}
        onClick={close}
        aria-hidden="true"
      />
      <div className="shell-drawer__panel" data-open={open} ref={panelRef}>
        <button
          type="button"
          className="shell-drawer__close"
          aria-label={microcopy.nav.closeMenu}
          onClick={close}
          ref={closeBtnRef}
        >
          <span aria-hidden="true">✕</span>
        </button>
        <div className="shell-drawer__theme">
          <ThemeToggle />
        </div>
        <nav aria-label={microcopy.nav.mobileLabel} className="shell-drawer__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              onNavigate={close}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

export default MobileDrawer;
