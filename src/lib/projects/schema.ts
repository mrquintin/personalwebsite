import { z } from "zod";

export const ProjectKindSchema = z.enum([
  "company", "book", "software", "research", "website", "other",
]);
export const ProjectStatusSchema = z.enum([
  "active", "draft", "shipping", "shipped", "archived",
]);
export const ProjectVisibilitySchema = z.enum(["default", "teaser"]);
export const ClassificationSchema = z.enum(["public", "restricted", "private"]);

export const ProjectLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  external: z.boolean().optional(),
});

export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  code: z.string().length(3),
  title: z.string().min(1),
  tagline: z.string().min(1),
  kind: ProjectKindSchema,
  status: ProjectStatusSchema,
  startedISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stage: z.string().optional(),
  links: z.array(ProjectLinkSchema),
  summary: z.string().min(10),
  customPage: z.string().optional(),
  mediaHeroSrc: z.string().optional(),
  classification: ClassificationSchema.optional(),
  visibility: ProjectVisibilitySchema.optional(),
  citation: z.string().optional(),
  authors: z.array(z.string()).optional(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
