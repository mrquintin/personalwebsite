import type { Project } from "@/lib/projects/types";
import { defaultCitation } from "@/lib/dossier/citation";

function rel(iso: string) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days < 30 ? `${days}d ago` : days < 365 ? `${Math.round(days / 30)}mo ago` : `${Math.round(days / 365)}y ago`;
}

export default function MetadataPane({ project }: { project: Project }) {
  return (
    <aside className="metadata-pane" aria-label="metadata">
      <Row k="KIND" v={project.kind} />
      <Row k="STATUS" v={project.status} />
      {project.stage && <Row k="STAGE" v={project.stage} />}
      <Row k="STARTED" v={project.startedISO} />
      <Row k="UPDATED" v={`${project.updatedISO}   (${rel(project.updatedISO)})`} />
      {project.authors && <Row k="AUTHORS" v={project.authors.join(", ")} />}
      <div className="row">
        <span className="k">LINKS</span>
        <span className="v">
          {project.links.map((l, i) => (
            <span key={i} style={{ display: "block" }}>
              <a href={l.href} target={l.external ? "_blank" : undefined} rel="noopener" style={{ color: "var(--fg)" }}>
                {l.label}{l.external ? " ↗" : ""}
              </a>
            </span>
          ))}
        </span>
      </div>
      <Row k="CITATION" v={defaultCitation(project)} />
    </aside>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}
