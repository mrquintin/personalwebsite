import type { Project } from "./types";
import hvm from "@/content/projects/hivemind";
import prp from "@/content/projects/purposeless-efficiency";
import ths from "@/content/projects/theseus";

// NOTE: in a strict "no manual list" world, this would use a build-time
// glob (e.g., webpack require.context). Next.js App Router doesn't expose
// that cleanly, so we centralize imports here. Adding a new project file
// requires one line below — no other touch points.
const ALL: Project[] = [hvm, prp, ths];

export function loadProjects(): Project[] {
  return [...ALL];
}

export function getProject(slug: string): Project | undefined {
  return ALL.find((p) => p.slug === slug);
}
