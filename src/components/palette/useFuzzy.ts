"use client";
import Fuse, { type IFuseOptions } from "fuse.js";
import { useMemo } from "react";

export type Match = { score: number; indices: number[] };

const FUSE_OPTS: IFuseOptions<{ title: string; keywords?: string[] }> = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "keywords", weight: 0.3 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeMatches: true,
  includeScore: true,
  minMatchCharLength: 1,
};

export function useFuse<T extends { title: string; keywords?: string[] }>(items: T[]) {
  return useMemo(() => new Fuse(items, FUSE_OPTS), [items]);
}

// Backward-compatible API used by Palette.tsx — ranks items, returns highlight indices on the title.
export function fuzzyRank<T extends { title: string; keywords?: string[] }>(
  items: T[], query: string,
): { item: T; match: Match }[] {
  if (!query) return items.map((item) => ({ item, match: { score: 0, indices: [] } }));
  const fuse = new Fuse(items, FUSE_OPTS);
  const hits = fuse.search(query, { limit: 50 });
  return hits.map((h) => {
    const titleMatch = h.matches?.find((m) => m.key === "title");
    const indices: number[] = [];
    if (titleMatch?.indices) {
      for (const [a, b] of titleMatch.indices) for (let i = a; i <= b; i++) indices.push(i);
    }
    return { item: h.item, match: { score: -(h.score ?? 0), indices } };
  });
}
