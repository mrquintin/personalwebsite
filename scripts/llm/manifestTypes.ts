import { z } from "zod";

export const ManifestKind = z.enum([
  "essay",
  "note",
  "post",
  "transcript",
  "project-note",
]);

export const ManifestFileEntry = z.object({
  path: z
    .string()
    .min(1)
    .describe("Path relative to corpus/ root."),
  title: z.string().min(1).describe("Human-readable title."),
  kind: ManifestKind.describe("Content category."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO 8601 calendar date (YYYY-MM-DD)")
    .describe("Authoring or publication date in ISO 8601."),
  topics: z
    .array(z.string().min(1))
    .default([])
    .describe("Free-form topic tags used by retrieval."),
  private: z
    .boolean()
    .default(false)
    .describe("When true, ingestion skips this file entirely."),
  citeOkay: z
    .boolean()
    .default(true)
    .describe(
      "When false, the file may be embedded for background context but never quoted."
    ),
  voiceWeight: z
    .number()
    .min(0)
    .max(2)
    .default(1)
    .describe("Retrieval nudge toward voice-rich material (0.0 to 2.0)."),
});

export const Manifest = z.object({
  version: z.literal("1"),
  files: z.array(ManifestFileEntry),
});

export type ManifestKind = z.infer<typeof ManifestKind>;
export type ManifestFileEntry = z.infer<typeof ManifestFileEntry>;
export type Manifest = z.infer<typeof Manifest>;
