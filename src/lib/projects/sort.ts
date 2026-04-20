import type { Project } from "./types";

export type SortKey = "code" | "title" | "kind" | "status" | "started" | "updated" | "stage";
export type SortDir = "asc" | "desc";

export function sortProjects(rows: Project[], key: SortKey, dir: SortDir): Project[] {
  const m = dir === "asc" ? 1 : -1;
  const get = (p: Project): string => {
    switch (key) {
      case "code":    return p.code;
      case "title":   return p.title.toLowerCase();
      case "kind":    return p.kind;
      case "status":  return p.status;
      case "started": return p.startedISO;
      case "updated": return p.updatedISO;
      case "stage":   return p.stage ?? "";
    }
  };
  return [...rows].sort((a, b) => {
    const va = get(a), vb = get(b);
    return va < vb ? -1 * m : va > vb ? 1 * m : 0;
  });
}
