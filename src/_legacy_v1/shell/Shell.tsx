"use client";
import { type ReactNode } from "react";
import TopRail from "./TopRail";
import HelpModal from "./HelpModal";
import KeyCap from "./KeyCap";
import NavigationLogger from "./NavigationLogger";
import Palette from "@/components/palette/Palette";
import EasterEggs from "@/components/easter/EasterEggs";
import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";

type Props = { children: ReactNode; buildVersion: string };

export default function Shell({ children, buildVersion }: Props) {
  const path = usePathname() ?? "/";
  const isLanding = path === "/";
  return (
    <>
      <a href="#main" className="sr-only" style={{ position: "absolute", top: 0, left: 0 }}>
        Skip to content
      </a>
      <TopRail />
      <main
        id="main"
        role="main"
        style={{
          paddingTop: isLanding ? 0 : "var(--toprail-h)",
          minHeight: "100vh",
          background: "var(--bg-1)",
          color: "var(--fg)",
        }}
      >
        {children}
      </main>
      {/* R04: status bar deleted. Hidden aria-live region replaces its
          screen-reader role for toast announcements. */}
      <div id="operator-aria-live" role="status" aria-live="polite" className="sr-only" />
      <KeyCap />
      <Palette buildVersion={buildVersion} />
      <HelpModal />
      <EasterEggs />
      <NavigationLogger />
      <Analytics />
    </>
  );
}
