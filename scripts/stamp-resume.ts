// Reads public/resume.pdf mtime and writes it to src/generated/resume-meta.json.
// If the PDF is missing, writes pdfPresent: false.
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const PDF = "public/resume.pdf";
const OUT = "src/generated/resume-meta.json";

const meta = existsSync(PDF)
  ? { pdfPresent: true, pdfMtimeISO: new Date(statSync(PDF).mtimeMs).toISOString().slice(0, 10) }
  : { pdfPresent: false };

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(meta, null, 2) + "\n");
console.log(`stamped ${OUT}: ${JSON.stringify(meta)}`);
