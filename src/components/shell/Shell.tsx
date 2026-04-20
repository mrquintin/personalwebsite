"use client";
import { type ReactNode } from "react";
import StatusBar from "./StatusBar";
import TopRail from "./TopRail";
import HelpModal from "./HelpModal";
import Palette from "@/components/palette/Palette";
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
          paddingBottom: "var(--statusbar-h)",
          minHeight: "100vh",
          background: "var(--bg-1)",
          color: "var(--fg)",
        }}
      >
        {children}
      </main>
      <StatusBar buildVersion={buildVersion} />
      <Palette buildVersion={buildVersion} />
      <HelpModal />
    </>
  );
}
