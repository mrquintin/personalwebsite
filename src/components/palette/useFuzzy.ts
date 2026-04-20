"use client";
// Tiny fuzzy matcher: rewards in-order character matches and word-boundary matches.
// Sufficient for ~50 commands; replace with fuse.js if the registry grows large.
export type Match = { score: number; indices: number[] };

export function fuzzyScore(needle: string, hay: string): Match | null {
  if (!needle) return { score: 0, indices: [] };
  const n = needle.toLowerCase();
  const h = hay.toLowerCase();
  let i = 0, j = 0, score = 0, prev = -2;
  const indices: number[] = [];
  while (i < n.length && j < h.length) {
    if (n[i] === h[j]) {
      // word-boundary bonus
      const isBoundary = j === 0 || /[\s\-_/.]/.test(h[j - 1]);
      score += isBoundary ? 4 : 1;
      // adjacency bonus
      if (j === prev + 1) score += 2;
      indices.push(j);
      prev = j;
      i++;
    }
    j++;
  }
  if (i < n.length) return null;
  // length penalty so shorter strings rank higher
  score -= h.length * 0.01;
  return { score, indices };
}

export function fuzzyRank<T extends { title: string; keywords?: string[] }>(
  items: T[],
  query: string,
): { item: T; match: Match }[] {
  if (!query) return items.map((item) => ({ item, match: { score: 0, indices: [] } }));
  const out: { item: T; match: Match }[] = [];
  for (const item of items) {
    const candidates = [item.title, ...(item.keywords ?? [])];
    let best: Match | null = null;
    for (const c of candidates) {
      const m = fuzzyScore(query, c);
      if (m && (!best || m.score > best.score)) best = m;
    }
    if (best) out.push({ item, match: best });
  }
  return out.sort((a, b) => b.match.score - a.match.score);
}
