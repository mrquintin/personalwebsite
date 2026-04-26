"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordRecent } from "@/lib/commands/providers/recent";

const TITLES: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/hivemind": "Hivemind",
  "/purposeless-efficiency": "Purposeless Efficiency",
  "/theseus": "Theseus",
  "/resume": "Resume",
  "/projects": "Projects",
  "/changelog": "Changelog",
};

export default function NavigationLogger() {
  const path = usePathname() ?? "/";
  useEffect(() => {
    if (path === "/" || path.startsWith("/styleguide")) return;
    recordRecent(path, TITLES[path]);
  }, [path]);
  return null;
}
