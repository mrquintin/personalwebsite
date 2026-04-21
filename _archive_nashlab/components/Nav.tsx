"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Wordmark from "./Wordmark";

const LINKS = [
  { href: "/#hivemind",     label: "Hivemind" },
  { href: "/architecture",  label: "Architecture" },
  { href: "/investors",     label: "Investors" },
  { href: "/company",       label: "Company" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-colors duration-200",
        scrolled
          ? "bg-ink-900/70 backdrop-blur-md border-b border-ink-500"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="mx-auto max-w-72rem h-14 px-6 flex items-center justify-between">
        <Link href="/" aria-label="The Nash Lab — home" className="text-paper">
          <Wordmark />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-paper-muted">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-paper transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/waitlist" className="text-sm text-paper-muted hover:text-paper transition-colors">
            Waitlist
          </Link>
          <Link
            href="/demo"
            className="text-sm bg-paper text-ink-900 px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            Request a demo
          </Link>
        </div>

        <button
          aria-label="Open menu"
          className="md:hidden text-paper p-2"
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
            {open ? (
              <path d="M6 6 L18 18 M18 6 L6 18" />
            ) : (
              <>
                <path d="M3 7h18" />
                <path d="M3 12h18" />
                <path d="M3 17h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-500 bg-ink-900/95 backdrop-blur-md">
          <div className="px-6 py-4 flex flex-col gap-3 text-paper-muted">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1">
                {l.label}
              </Link>
            ))}
            <Link href="/waitlist" onClick={() => setOpen(false)} className="py-1">
              Waitlist
            </Link>
            <Link
              href="/demo"
              onClick={() => setOpen(false)}
              className="mt-2 inline-block w-fit bg-paper text-ink-900 px-4 py-2 rounded-full text-sm"
            >
              Request a demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
