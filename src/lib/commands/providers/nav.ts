import type { Command } from "../types";
import { PANELS } from "@/lib/panels";

export function navCommands(): Command[] {
  const base: Command[] = [
    { id: "nav.home", kind: "nav", section: "Navigate", title: "Go to Home (accordion)", context: "/",
      keywords: ["index","landing","accordion"],
      run: ({ router, close }) => { router.push("/"); close(); } },
    { id: "nav.projects", kind: "nav", section: "Navigate", title: "Go to Projects index", context: "/projects",
      keywords: ["index","projects","work"],
      run: ({ router, close }) => { router.push("/projects"); close(); } },
    { id: "nav.changelog", kind: "nav", section: "Navigate", title: "Go to Changelog", context: "/changelog",
      run: ({ router, close }) => { router.push("/changelog"); close(); } },
  ];
  const panels: Command[] = PANELS.map((p) => ({
    id: `nav.panel.${p.code.toLowerCase()}`,
    kind: "nav",
    section: "Navigate",
    title: `Go to ${p.title}`,
    context: p.href,
    keywords: [p.code.toLowerCase(), p.id, p.title.toLowerCase()],
    run: ({ router, close }) => { router.push(p.href); close(); },
  }));
  return [...base, ...panels];
}
