import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import StubPlaceholder from "@/components/StubPlaceholder";
import ProjectShell from "@/components/projects/ProjectShell";
import { getProjectMetadata } from "@/lib/projects/loader";

type SlotName = "Presentation" | "Body" | "Links";

async function loadSlot(
  slug: string,
  slot: SlotName,
): Promise<ComponentType | null> {
  try {
    const mod = await import(
      /* webpackInclude: /(Presentation|Body|Links)\.tsx$/ */
      /* webpackExclude: /__tests__/ */
      `@/components/projects/${slug}/${slot}`
    );
    const Comp = (mod.default ?? mod[slot]) as ComponentType | undefined;
    return Comp ?? null;
  } catch {
    return null;
  }
}

export default async function ProjectPage({ slug }: { slug: string }) {
  const metadata = await getProjectMetadata(slug);
  if (!metadata) {
    notFound();
  }

  const [Presentation, Body, Links] = await Promise.all([
    loadSlot(slug, "Presentation"),
    loadSlot(slug, "Body"),
    loadSlot(slug, "Links"),
  ]);

  return (
    <ProjectShell
      metadata={metadata}
      presentation={Presentation ? <Presentation /> : <StubPlaceholder />}
      body={Body ? <Body /> : <StubPlaceholder />}
      relatedLinks={Links ? <Links /> : <StubPlaceholder />}
    />
  );
}
