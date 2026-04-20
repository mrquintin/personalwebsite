import type { Project } from "@/lib/projects/types";

export function defaultCitation(p: Project): string {
  if (p.citation) return p.citation;
  const year = p.updatedISO.slice(0, 4);
  const today = new Date().toISOString().slice(0, 10);
  return `Quintin, M. (${year}). ${p.title}: ${p.tagline} Retrieved ${today}.`;
}
