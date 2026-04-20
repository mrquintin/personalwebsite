// Greps the repo for forbidden marketing words in chrome files.
// Excludes node_modules, .next, public/_legacy, MDX prose, and the
// forbidden-words registry itself.
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { FORBIDDEN_WORDS } from "../src/content/forbidden-words";

const ROOTS = ["src", "docs"];
const EXTS = [".ts", ".tsx", ".md", ".mdx"];
const EXCLUDE = new Set(["node_modules", ".next", "public", ".git", "tools"]);
const SELF = "src/content/forbidden-words.ts";
// Files allowed to mention the forbidden words for documentary purposes.
const ALLOW = new Set([
  "docs/voice-guide.md",
]);

async function walk(p: string, out: string[] = []): Promise<string[]> {
  const s = await stat(p);
  if (s.isDirectory()) {
    if (EXCLUDE.has(p.split("/").pop()!)) return out;
    for (const ent of await readdir(p)) await walk(join(p, ent), out);
  } else if (EXTS.some((e) => p.endsWith(e)) && !p.endsWith(SELF) && !ALLOW.has(p)) {
    out.push(p);
  }
  return out;
}

(async () => {
  const files: string[] = [];
  for (const r of ROOTS) await walk(r, files);
  const hits: { file: string; word: string; line: number }[] = [];
  for (const f of files) {
    const text = await readFile(f, "utf8");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const lc = lines[i].toLowerCase();
      for (const w of FORBIDDEN_WORDS) {
        if (lc.includes(w.toLowerCase())) hits.push({ file: f, word: w, line: i + 1 });
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
