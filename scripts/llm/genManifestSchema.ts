import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { Manifest } from "./manifestTypes.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const out = resolve(repoRoot, "corpus", "manifest.schema.json");

const schema = z.toJSONSchema(Manifest, { target: "draft-2020-12" }) as Record<
  string,
  unknown
>;

const annotated = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://corpus.local/manifest.schema.json",
  title: "Corpus Manifest",
  description:
    "Generated from scripts/llm/manifestTypes.ts. Do not edit by hand; run `npx tsx scripts/llm/genManifestSchema.ts` to regenerate.",
  ...schema,
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(annotated, null, 2) + "\n", "utf8");
console.log(`Wrote ${out}`);
