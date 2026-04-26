"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

export type NavLinkProps = {
  href: string;
  label: string;
  onNavigate?: () => void;
};

export function NavLink({ href, label, onNavigate }: NavLinkProps) {
  const pathname = usePathname() ?? "/";
  const isHome = label === "Home" || href === "/";
  const active = isHome
    ? pathname === "/"
    : pathname === href || pathname.startsWith(href + "/");

  const cls = ["shell-navlink", active ? "shell-navlink--active" : ""].filter(Boolean).join(" ");

  return (
    <NextLink
      href={href}
      className={cls}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      {label}
    </NextLink>
  );
}

export default NavLink;
