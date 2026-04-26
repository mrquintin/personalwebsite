/**
 * scripts/resume/build-pdf.ts
 *
 * Generates public/resume.pdf by booting `next start` against the
 * already-built .next directory, navigating to /resume?print=true via
 * Playwright (already in devDependencies), and printing to PDF.
 *
 * Wired into `npm run build` via `postbuild`. The script is best-effort:
 * if Playwright browsers are not installed (typical in lightweight CI),
 * or `next start` fails to come up, it logs the reason and exits 0.
 * Production deploys (Vercel) install browsers via the Playwright cache
 * and will produce a real PDF.
 *
 * Override knobs (env):
 *   SKIP_RESUME_PDF=1     skip entirely
 *   RESUME_PDF_PORT=4321  port to bind next start to (default 4321)
 *   RESUME_PDF_URL=...    full URL to print (skips the local server)
 */

import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.join(ROOT, "public");
const OUT_FILE = path.join(OUT_DIR, "resume.pdf");
const PORT = Number(process.env.RESUME_PDF_PORT ?? 4321);
const PATH_TO_PRINT = "/resume?print=true";

function log(msg: string): void {
  process.stdout.write(`[build-pdf] ${msg}\n`);
}

function warn(msg: string): void {
  process.stderr.write(`[build-pdf] ${msg}\n`);
}

async function waitForServer(url: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

function startNext(port: number): ChildProcess {
  const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
  return spawn(cmd, ["next", "start", "-p", String(port)], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
}

async function main(): Promise<void> {
  if (process.env.SKIP_RESUME_PDF === "1") {
    log("SKIP_RESUME_PDF=1 — skipping PDF generation");
    return;
  }

  if (!existsSync(path.join(ROOT, ".next"))) {
    warn("no .next build found — skipping (run `next build` first)");
    return;
  }

  let chromium: typeof import("@playwright/test").chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch (err) {
    warn(`@playwright/test not loadable — skipping. (${(err as Error).message})`);
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });

  const useExternal = !!process.env.RESUME_PDF_URL;
  const targetUrl =
    process.env.RESUME_PDF_URL ?? `http://127.0.0.1:${PORT}${PATH_TO_PRINT}`;

  let server: ChildProcess | null = null;
  try {
    if (!useExternal) {
      log(`starting next on :${PORT}`);
      server = startNext(PORT);
      const ready = await waitForServer(`http://127.0.0.1:${PORT}/`, 30_000);
      if (!ready) {
        warn("next start did not come up in 30s — skipping PDF generation");
        return;
      }
    }

    log(`launching headless chromium`);
    let browser;
    try {
      browser = await chromium.launch();
    } catch (err) {
      warn(`chromium.launch failed (likely no browsers installed) — skipping. ` +
           `Run \`npx playwright install chromium\` to enable. (${(err as Error).message})`);
      return;
    }

    try {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      log(`navigating to ${targetUrl}`);
      await page.goto(targetUrl, { waitUntil: "networkidle" });
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: OUT_FILE,
        format: "Letter",
        printBackground: false,
        margin: { top: "0.75in", bottom: "0.75in", left: "0.75in", right: "0.75in" },
      });
      log(`wrote ${path.relative(ROOT, OUT_FILE)}`);
    } finally {
      await browser.close();
    }
  } finally {
    if (server && !server.killed) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((err) => {
  warn(`unexpected error — skipping PDF: ${(err as Error).message}`);
  process.exit(0);
});
