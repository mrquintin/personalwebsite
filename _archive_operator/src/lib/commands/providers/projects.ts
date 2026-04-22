import type { Command } from "../types";
import { loadProjects } from "@/lib/projects/loader";

const DEEP_LINKS: Record<string, { label: string; hash: string }[]> = {
  hivemind: [
    { label: "Overview",          hash: "#overview" },
    { label: "Demo",              hash: "#demo" },
    { label: "Capabilities",      hash: "#capabilities" },
    { label: "Workflow",          hash: "#workflow" },
    { label: "Press & contact",   hash: "#press" },
  ],
  "purposeless-efficiency": [
    { label: "Synopsis",          hash: "#synopsis" },
    { label: "Five Pillars",      hash: "#pillars" },
    { label: "Excerpt",           hash: "#excerpt" },
    { label: "The five-book arc", hash: "#arc" },
  ],
  theseus: [
    { label: "Principles",        hash: "#principles" },
    { label: "Noosphere feed",    hash: "#noosphere" },
    { label: "Methodology",       hash: "#methodology" },
    { label: "External (thesescodex.com)", hash: "https://thesescodex.com" },
  ],
};

export function projectCommands(): Command[] {
  const out: Command[] = [];
  for (const p of loadProjects()) {
    const route = p.customPage ?? `/projects/${p.slug}`;
    const deep = DEEP_LINKS[p.slug] ?? [];
    for (const d of deep) {
      const isExt = d.hash.startsWith("http");
      out.push({
        id: `nav.${p.slug}.${d.label.toLowerCase().replace(/\W+/g, "-")}`,
        kind: "nav",
        section: "Projects",
        title: `Open ${p.title} / ${d.label}`,
        context: isExt ? d.hash : `${route}${d.hash}`,
        keywords: [p.code.toLowerCase(), p.slug, d.label.toLowerCase()],
        run: ({ router, close }) => {
          if (isExt) {
            window.open(d.hash, "_blank", "noopener");
          } else {
            router.push(`${route}${d.hash}`);
          }
          close();
        },
      });
    }
  }
  return out;
}
