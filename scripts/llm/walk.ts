import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Manifest, type ManifestFileEntry } from "./manifestTypes.js";

export interface WalkedFile {
  entry: ManifestFileEntry;
  content: string;
  contentHash: string;
}

export interface WalkOptions {
  corpusRoot: string;
  manifestPath?: string;
  only?: (relPath: string) => boolean;
}

export async function loadManifest(
  manifestPath: string
): Promise<Manifest> {
  const raw = await readFile(manifestPath, "utf8");
  const parsed = JSON.parse(raw);
  return Manifest.parse(parsed);
}

export function sha256Hex(bytes: Buffer | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function* walk(
  options: WalkOptions
): AsyncGenerator<WalkedFile> {
  const manifestPath =
    options.manifestPath ?? path.join(options.corpusRoot, "manifest.json");
  const manifest = await loadManifest(manifestPath);

  for (const entry of manifest.files) {
    if (entry.private) continue;
    if (options.only && !options.only(entry.path)) continue;

    const absPath = path.join(options.corpusRoot, entry.path);
    const bytes = await readFile(absPath);
    const contentHash = sha256Hex(bytes);
    const content = bytes.toString("utf8");

    yield { entry, content, contentHash };
  }
}
