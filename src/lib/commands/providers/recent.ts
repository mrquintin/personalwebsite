import type { Command } from "../types";

const KEY = "operator.recent-pages";
const MAX = 3;

export function recordRecent(path: string, title?: string) {
  if (typeof window === "undefined") return;
  try {
    const cur: { path: string; title?: string }[] = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    const next = [{ path, title }, ...cur.filter((x) => x.path !== path)].slice(0, MAX);
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function recentCommands(): Command[] {
  if (typeof window === "undefined") return [];
  let recent: { path: string; title?: string }[] = [];
  try { recent = JSON.parse(sessionStorage.getItem(KEY) ?? "[]"); } catch {}
  return recent.map((r, i) => ({
    id: `nav.recent.${i}`,
    kind: "nav" as const,
    section: "Navigate" as const,
    title: `Recent: ${r.title ?? r.path}`,
    context: r.path,
    keywords: ["recent", r.path.replace(/[/-]/g, " ")],
    run: ({ router, close }) => { router.push(r.path); close(); },
  }));
}
