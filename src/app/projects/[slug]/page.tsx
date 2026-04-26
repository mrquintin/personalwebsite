import type { Metadata } from "next";
import ProjectPage from "@/components/projects/ProjectPage";
import { JsonLd, articleSchema } from "@/components/seo/JsonLd";
import identity from "@/content/about/identity";
import { projects } from "@/content/projects";
import { getProjectMetadata } from "@/lib/projects/loader";
import type { ProjectMetadata } from "@/lib/projects/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "https://personalwebsite-beta-nine.vercel.app";

// Build a 110-155 char description from the project's tagline + first
// sentence of its framing. Long taglines+framings get truncated at the
// nearest word boundary.
function buildDescription(meta: ProjectMetadata): string {
  const firstSentence = meta.framing.match(/^[^.!?]+[.!?]/)?.[0] ?? meta.framing;
  const candidate = `${meta.tagline} ${firstSentence}`.replace(/\s+/g, " ").trim();
  if (candidate.length <= 155) return candidate;
  const slice = candidate.slice(0, 152);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : 152)}…`;
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getProjectMetadata(slug);
  if (!meta) return {};
  const description = buildDescription(meta);
  const path = `/projects/${slug}`;
  const title = `${meta.title} — ${meta.tagline}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = await getProjectMetadata(slug);
  const ld = meta
    ? articleSchema({
        url: `${SITE_URL}/projects/${slug}`,
        headline: `${meta.title} — ${meta.tagline}`,
        description: buildDescription(meta),
        authorName: identity.fullName,
        authorUrl: SITE_URL,
        about: meta.title,
      })
    : null;
  return (
    <>
      {ld ? <JsonLd data={ld} /> : null}
      <ProjectPage slug={slug} />
    </>
  );
}
