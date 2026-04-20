import type { Project, ProjectKind } from "./types";

export function filterByKind(rows: Project[], kind: ProjectKind | "all"): Project[] {
  if (kind === "all") return rows;
  return rows.filter((p) => p.kind === kind);
}

export function filterByQuery(rows: Project[], q: string): Project[] {
  if (!q) return rows;
  const needle = q.toLowerCase();
  return rows.filter((p) =>
    [p.title, p.code, p.tagline, p.summary, p.kind, p.status].some((s) =>
      s.toLowerCase().includes(needle)
    )
  );
}
