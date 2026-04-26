#!/usr/bin/env tsx
/**
 * suite 22/P03 — deployed-environment smoke runner.
 *
 *   Usage: tsx scripts/smoke/run-against.ts <url>
 *          SMOKE_URL=https://example.com tsx scripts/smoke/run-against.ts
 *
 * Wraps `playwright test` with the smoke-only config and prints a JSON
 * summary on stdout when the run finishes (pass or fail). Exits non-zero
 * on any test failure or runner error so CI can gate on it.
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

type Summary = {
  url: string;
  status: "pass" | "fail";
  total: number;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  durationMs: number;
  failures: { title: string; error?: string }[];
};

function pickUrl(): string {
  const argUrl = process.argv[2];
  const envUrl = process.env.SMOKE_URL;
  const url = argUrl || envUrl;
  if (!url) {
    console.error(
      "[smoke] no URL provided. Pass <url> or set SMOKE_URL.",
    );
    process.exit(2);
  }
  try {
    new URL(url);
  } catch {
    console.error(`[smoke] invalid URL: ${url}`);
    process.exit(2);
  }
  return url.replace(/\/$/, "");
}

function runPlaywright(url: string): Promise<number> {
  return new Promise((resolveProc) => {
    const child = spawn(
      "npx",
      ["playwright", "test", "--config", "playwright.smoke.config.ts"],
      {
        cwd: repoRoot,
        stdio: "inherit",
        env: { ...process.env, SMOKE_URL: url },
      },
    );
    child.on("exit", (code) => resolveProc(code ?? 1));
    child.on("error", (err) => {
      console.error("[smoke] failed to spawn playwright:", err);
      resolveProc(1);
    });
  });
}

type PlaywrightJsonReport = {
  stats?: {
    expected?: number;
    unexpected?: number;
    flaky?: number;
    skipped?: number;
    duration?: number;
  };
  suites?: PlaywrightJsonSuite[];
};

type PlaywrightJsonSuite = {
  title?: string;
  suites?: PlaywrightJsonSuite[];
  specs?: PlaywrightJsonSpec[];
};

type PlaywrightJsonSpec = {
  title: string;
  ok: boolean;
  tests?: { results?: { error?: { message?: string } }[] }[];
};

function summarize(url: string, exitCode: number): Summary {
  const reportPath = resolve(repoRoot, "smoke-results.json");
  const summary: Summary = {
    url,
    status: exitCode === 0 ? "pass" : "fail",
    total: 0,
    passed: 0,
    failed: 0,
    flaky: 0,
    skipped: 0,
    durationMs: 0,
    failures: [],
  };
  if (!existsSync(reportPath)) {
    return summary;
  }
  let raw: PlaywrightJsonReport;
  try {
    raw = JSON.parse(readFileSync(reportPath, "utf8")) as PlaywrightJsonReport;
  } catch {
    return summary;
  }
  const stats = raw.stats ?? {};
  summary.passed = stats.expected ?? 0;
  summary.failed = stats.unexpected ?? 0;
  summary.flaky = stats.flaky ?? 0;
  summary.skipped = stats.skipped ?? 0;
  summary.durationMs = Math.round(stats.duration ?? 0);
  summary.total =
    summary.passed + summary.failed + summary.flaky + summary.skipped;

  const failures: Summary["failures"] = [];
  const walk = (suite: PlaywrightJsonSuite, trail: string[]): void => {
    const next = suite.title ? [...trail, suite.title] : trail;
    for (const spec of suite.specs ?? []) {
      if (!spec.ok) {
        const errMsg = spec.tests
          ?.flatMap((t) => t.results ?? [])
          .map((r) => r.error?.message)
          .find(Boolean);
        failures.push({
          title: [...next, spec.title].filter(Boolean).join(" › "),
          error: errMsg,
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child, next);
  };
  for (const top of raw.suites ?? []) walk(top, []);
  summary.failures = failures;
  return summary;
}

async function main(): Promise<void> {
  const url = pickUrl();
  console.log(`[smoke] target: ${url}`);
  const exitCode = await runPlaywright(url);
  const summary = summarize(url, exitCode);
  console.log("\n[smoke] summary:");
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.status === "pass" ? 0 : 1);
}

void main();
