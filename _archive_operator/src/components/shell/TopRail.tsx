"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PANELS } from "@/lib/panels";

export default function TopRail() {
  const path = usePathname() ?? "/";
  if (path === "/") return null; // landing renders the full accordion
  return (
    <nav
      className="top-rail"
      aria-label="panels"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: "var(--toprail-h)",
        background: "var(--bg-0)",
        borderBottom: "var(--border-hair)",
        color: "var(--fg-mute)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--t-xs-size)",
        lineHeight: "var(--toprail-h)",
        zIndex: "var(--z-rail)" as unknown as number,
        display: "flex",
        padding: "0 var(--s-4)",
        gap: "var(--s-5)",
      }}
    >
      <Link href="/" style={{ color: "var(--fg-dim)" }} aria-label="home">~/</Link>
      {PANELS.map((p) => {
        const active = path.startsWith(p.href);
        return (
          <Link
            key={p.code}
            href={p.href}
            aria-current={active ? "page" : undefined}
            style={{
              color: active ? "var(--accent)" : "var(--fg-mute)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {p.id} · {p.code}
          </Link>
        );
      })}
    </nav>
  );
}
