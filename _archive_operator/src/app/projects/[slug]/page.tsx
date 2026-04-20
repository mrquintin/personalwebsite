import { notFound, redirect } from "next/navigation";
import { getProject, loadProjects } from "@/lib/projects/loader";
import DossierHeader from "@/components/dossier/Header";
import MetadataPane from "@/components/dossier/MetadataPane";
import Synopsis from "@/components/dossier/Synopsis";
import MediaSlot from "@/components/dossier/MediaSlot";
import ArtifactsBlock from "@/components/dossier/ArtifactsBlock";

export function generateStaticParams() {
  return loadProjects().map((p) => ({ slug: p.slug }));
}

export default async function GenericProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  if (p.customPage) redirect(p.customPage);

  return (
    <div className="dossier">
      <DossierHeader
        code={p.code}
        title={p.title.toUpperCase()}
        tagline={p.tagline}
        breadcrumb={`~/projects/${p.slug}/README`}
        classification={p.classification ?? "public"}
      />
      <div className="dossier-grid">
        <MetadataPane project={p} />
        <div>
          <Synopsis text={p.summary} />
          <MediaSlot src={p.mediaHeroSrc} alt={p.title} />
        </div>
      </div>
      <ArtifactsBlock items={p.links.map((l) => ({ kind: l.label, label: l.href.replace(/^https?:\/\//, ""), href: l.href, glyph: l.external ? "ext" : undefined }))} />
    </div>
  );
}
