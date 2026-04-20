// Lints for hardcoded color values (hex / oklch / rgb) outside tokens.css.
// Warns rather than fails — tighten to fail by setting STRICT=1.
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOTS = ["src"];
const EXTS = [".ts", ".tsx", ".css"];
const ALLOW_FILES = new Set([
  "src/styles/tokens.css",
  "src/styles/print.css",
]);
const COLOR = /(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|oklch\([^)]+\))/g;

async function walk(p: string, out: string[] = []): Promise<string[]> {
  const s = await stat(p).catch(() => null);
  if (!s) return out;
  if (s.isDirectory()) {
    for (const ent of await readdir(p)) await walk(join(p, ent), out);
  } else if (EXTS.some((e) => p.endsWith(e)) && !ALLOW_FILES.has(p)) {
    out.push(p);
  }
  return out;
}

(async () => {
  const files: string[] = [];
  for (const r of ROOTS) await walk(r, files);
  const hits: { f: string; line: number; v: string }[] = [];
  for (const f of files) {
    const text = await readFile(f, "utf8");
    text.split("\n").forEach((ln, i) => {
      const m = ln.match(COLOR);
      if (m) for (const v of m) hits.push({ f, line: i + 1, v });
    });
  }
  if (hits.length) {
    console.warn(`! ${hits.length} hardcoded color value(s) outside tokens.css`);
    for (const h of hits.slice(0, 50)) console.warn(`  ${h.f}:${h.line}  ${h.v}`);
    if (process.env.STRICT === "1") process.exit(1);
  } else {
    console.log("✓ no hardcoded colors outside tokens.css");
  }
})();
