// Greps the repo for forbidden marketing words in chrome files.
// Excludes node_modules, .next, public/_legacy, MDX prose, and the
// forbidden-words registry itself.
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { FORBIDDEN_WORDS } from "../src/content/forbidden-words";

const ROOTS = ["src", "docs"];
const EXTS = [".ts", ".tsx", ".md"];
const EXCLUDE = new Set(["node_modules", ".next", "public", ".git", "tools"]);
const SELF = "src/content/forbidden-words.ts";
// Files allowed to mention the forbidden words for documentary purposes.
const ALLOW = new Set([
  "docs/voice-guide.md",
]);
const EXCLUDE_PATH_PATTERNS = [
  /\/__lint__\//,
  /\.test\.[cm]?[jt]sx?$/i,
  /\.spec\.[cm]?[jt]sx?$/i,
  /^src\/lib\/hivemind\//,
];

async function walk(p: string, out: string[] = []): Promise<string[]> {
  const s = await stat(p);
  const rel = p.replaceAll("\\", "/");
  if (s.isDirectory()) {
    if (EXCLUDE.has(p.split("/").pop()!)) return out;
    for (const ent of await readdir(p)) await walk(join(p, ent), out);
  } else if (
    EXTS.some((e) => rel.endsWith(e)) &&
    !rel.endsWith(SELF) &&
    !ALLOW.has(rel) &&
    !EXCLUDE_PATH_PATTERNS.some((pattern) => pattern.test(rel))
  ) {
    out.push(p);
  }
  return out;
}

function shouldSkipLine(fileRel: string, line: string): boolean {
  if (!/\.[cm]?[jt]sx?$/.test(fileRel)) return false;
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*");
}

(async () => {
  const files: string[] = [];
  for (const r of ROOTS) await walk(r, files);
  const hits: { file: string; word: string; line: number }[] = [];
  for (const f of files) {
    const text = await readFile(f, "utf8");
    const fileRel = f.replaceAll("\\", "/");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (shouldSkipLine(fileRel, lines[i])) continue;
      const lc = lines[i].toLowerCase();
      for (const w of FORBIDDEN_WORDS) {
        if (lc.includes(w.toLowerCase())) hits.push({ file: fileRel, word: w, line: i + 1 });
      }
    }
  }
  if (hits.length) {
    console.error("! forbidden words found:");
    for (const h of hits) console.error(`  ${h.file}:${h.line}  ${h.word}`);
    process.exit(1);
  } else {
    console.log("✓ copy-lint clean");
  }
})();
