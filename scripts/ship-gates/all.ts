#!/usr/bin/env tsx
/**
 * suite 22/P05 — final ship gate orchestrator.
 *
 * Sequentially runs every upstream gate (12 → 22). Exits 0 only when
 * every gate passes; exits 1 on the first failure with the failing
 * gate name, the failing sub-step, and the underlying exit code.
 *
 * Honesty contract:
 *   - Gates that require external state (running dev server, DB,
 *     Anthropic key, snapshots) will fail loudly when that state is
 *     absent. They are NOT silently skipped.
 *   - The summary at the end lists every gate's outcome with timing.
 *   - This script is the *programmatic* portion of the ship gate.
 *     The manual checklist in docs/v2_ship_checklist.md is the rest.
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

type Step =
  | { kind: "spawn"; cmd: string; args: string[]; env?: Record<string, string> }
  | { kind: "check"; label: string; run: () => Promise<void> | void };

type Gate = {
  id: string;
  label: string;
  steps: Step[];
};

type StepResult = {
  step: Step;
  ok: boolean;
  exitCode: number | null;
  durationMs: number;
  error?: string;
};

type GateResult = {
  gate: Gate;
  ok: boolean;
  durationMs: number;
  steps: StepResult[];
};

function runSpawn(
  cmd: string,
  args: string[],
  env?: Record<string, string>,
): Promise<{ ok: boolean; code: number | null }> {
  return new Promise((res) => {
    const child = spawn(cmd, args, {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, ...(env ?? {}) },
    });
    child.on("close", (code) => res({ ok: code === 0, code }));
    child.on("error", () => res({ ok: false, code: null }));
  });
}

async function runStep(step: Step): Promise<StepResult> {
  const started = Date.now();
  if (step.kind === "spawn") {
    const { ok, code } = await runSpawn(step.cmd, step.args, step.env);
    return { step, ok, exitCode: code, durationMs: Date.now() - started };
  }
  try {
    await step.run();
    return { step, ok: true, exitCode: 0, durationMs: Date.now() - started };
  } catch (err) {
    return {
      step,
      ok: false,
      exitCode: 1,
      durationMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function stepLabel(step: Step): string {
  if (step.kind === "spawn") return `${step.cmd} ${step.args.join(" ")}`;
  return step.label;
}

/* --- Gate 12 helpers ------------------------------------------------------ */

function scanBundleForLegacyImports(): void {
  const nextDir = join(repoRoot, ".next");
  if (!existsSync(nextDir)) {
    throw new Error(
      ".next/ not found — build did not produce an output directory.",
    );
  }
  const offenders: string[] = [];
  const stack: string[] = [nextDir];
  while (stack.length) {
    const cur = stack.pop() as string;
    let entries: string[];
    try {
      entries = readdirSync(cur);
    } catch {
      continue;
    }
    for (const name of entries) {
      // skip cache and source maps; we only inspect production output.
      if (name === "cache") continue;
      const full = join(cur, name);
      let st: ReturnType<typeof statSync>;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!/\.(js|mjs|cjs|html)$/.test(name)) continue;
      let content: string;
      try {
        content = readFileSync(full, "utf8");
      } catch {
        continue;
      }
      if (content.includes("_legacy_v1")) {
        offenders.push(full.replace(repoRoot + "/", ""));
      }
    }
  }
  if (offenders.length) {
    throw new Error(
      `_legacy_v1 references found in production bundle:\n  ${offenders.join("\n  ")}`,
    );
  }
}

/* --- Gate 13 helpers ------------------------------------------------------ */

const REQUIRED_TOKENS = [
  "--bg",
  "--fg",
  "--accent",
  "--line",
  "--s-1",
  "--s-2",
  "--t-base-size",
  "--d-tap",
  "--ease-out",
];

function checkTokensCss(): void {
  const tokensPath = join(repoRoot, "src", "styles", "tokens.css");
  if (!existsSync(tokensPath)) {
    throw new Error(`tokens.css not found at ${tokensPath}`);
  }
  const content = readFileSync(tokensPath, "utf8");
  const missing: string[] = [];
  for (const tok of REQUIRED_TOKENS) {
    const declared = new RegExp(`${tok.replace(/-/g, "\\-")}\\s*:`).test(content);
    if (!declared) missing.push(tok);
  }
  if (missing.length) {
    throw new Error(
      `tokens.css missing required tokens: ${missing.join(", ")}`,
    );
  }
}

/* --- Gate 14 helpers ------------------------------------------------------ */

const SHELL_PATHS = [
  "/",
  "/about",
  "/chat",
  "/projects",
  "/resume",
  "/styleguide",
];

async function checkShellPages200(baseUrl: string): Promise<void> {
  const failures: string[] = [];
  for (const p of SHELL_PATHS) {
    const url = `${baseUrl.replace(/\/$/, "")}${p}`;
    try {
      const res = await fetch(url, { redirect: "manual" });
      // 200 or 308 (Next trailing-slash redirect) treated as healthy.
      if (res.status !== 200 && res.status !== 308) {
        failures.push(`${url} → ${res.status}`);
      }
    } catch (err) {
      failures.push(
        `${url} → fetch error (${err instanceof Error ? err.message : String(err)})`,
      );
    }
  }
  if (failures.length) {
    throw new Error(
      `Shell pages did not all return 200:\n  ${failures.join("\n  ")}`,
    );
  }
}

/* --- Gate 21 helpers ------------------------------------------------------ */

function checkSitemapAndRobots(): void {
  const missing: string[] = [];
  const required = [
    join("public", "robots.txt"),
    join("public", "sitemap.xml"),
  ];
  for (const rel of required) {
    if (!existsSync(join(repoRoot, rel))) missing.push(rel);
  }
  if (missing.length) {
    throw new Error(
      `Missing SEO artefacts: ${missing.join(", ")}. Run \`npm run build\`.`,
    );
  }
}

/* --- Gate definitions ----------------------------------------------------- */

const BASE_URL = process.env.SHIP_GATE_BASE_URL || "http://localhost:3000";

const GATES: Gate[] = [
  {
    id: "12",
    label: "typecheck + build clean (no _legacy_v1 in prod bundle)",
    steps: [
      { kind: "spawn", cmd: "npm", args: ["run", "typecheck"] },
      { kind: "spawn", cmd: "npm", args: ["run", "build"] },
      {
        kind: "check",
        label: "scan .next/ for _legacy_v1 leakage",
        run: scanBundleForLegacyImports,
      },
    ],
  },
  {
    id: "13",
    label: "tokens.css required tokens + primitive tests",
    steps: [
      {
        kind: "check",
        label: "tokens.css contains required tokens",
        run: checkTokensCss,
      },
      {
        kind: "spawn",
        cmd: "npx",
        args: [
          "vitest",
          "run",
          "src/components/primitives/__tests__/",
        ],
      },
    ],
  },
  {
    id: "14",
    label: "shell pages return 200 in a local dev run",
    steps: [
      {
        kind: "check",
        label: `HEAD/GET ${SHELL_PATHS.join(", ")} against ${BASE_URL}`,
        run: () => checkShellPages200(BASE_URL),
      },
    ],
  },
  {
    id: "15",
    label: "landing e2e",
    steps: [
      {
        kind: "spawn",
        cmd: "npx",
        args: ["playwright", "test", "e2e/landing.spec.ts"],
      },
    ],
  },
  {
    id: "16",
    label: "ship-gate:projects",
    steps: [
      { kind: "spawn", cmd: "npm", args: ["run", "ship-gate:projects"] },
    ],
  },
  {
    id: "17",
    label: "presentations e2e",
    steps: [
      {
        kind: "spawn",
        cmd: "npx",
        args: ["playwright", "test", "e2e/presentations.spec.ts"],
      },
    ],
  },
  {
    id: "18",
    label: "ingest dry-run + chat API unit tests",
    steps: [
      {
        kind: "spawn",
        cmd: "npx",
        args: ["tsx", "scripts/llm/ingest.ts", "--dry-run"],
      },
      {
        kind: "spawn",
        cmd: "npx",
        args: ["vitest", "run", "src/app/api/chat/route.test.ts"],
      },
    ],
  },
  {
    id: "19",
    label: "chat e2e + a11y on /chat",
    steps: [
      {
        kind: "spawn",
        cmd: "npx",
        args: ["playwright", "test", "e2e/chat.spec.ts"],
      },
      {
        kind: "spawn",
        cmd: "npx",
        args: [
          "playwright",
          "test",
          "e2e/a11y.spec.ts",
          "--grep",
          "chat",
        ],
      },
    ],
  },
  {
    id: "20",
    label: "forbidden-words lint (microcopy registry)",
    steps: [
      {
        kind: "spawn",
        cmd: "npx",
        args: [
          "vitest",
          "run",
          "src/content/__tests__/microcopy.lint.test.ts",
        ],
      },
    ],
  },
  {
    id: "21",
    label: "Lighthouse CI + axe a11y + sitemap/robots present",
    steps: [
      { kind: "spawn", cmd: "npm", args: ["run", "lighthouse:ci"] },
      {
        kind: "spawn",
        cmd: "npx",
        args: ["playwright", "test", "e2e/a11y.spec.ts"],
      },
      {
        kind: "check",
        label: "public/robots.txt and public/sitemap.xml exist",
        run: checkSitemapAndRobots,
      },
    ],
  },
  {
    id: "22",
    label: `smoke against ${BASE_URL} + visual regression`,
    steps: [
      {
        kind: "spawn",
        cmd: "npm",
        args: ["run", "smoke", "--", BASE_URL],
      },
      { kind: "spawn", cmd: "npm", args: ["run", "visual"] },
    ],
  },
];

/* --- Driver -------------------------------------------------------------- */

function fmtSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

async function runGate(gate: Gate): Promise<GateResult> {
  const started = Date.now();
  const stepResults: StepResult[] = [];
  for (const step of gate.steps) {
    process.stdout.write(
      `\n--- Gate ${gate.id} step: ${stepLabel(step)} ---\n`,
    );
    const r = await runStep(step);
    stepResults.push(r);
    if (!r.ok) {
      if (r.error) process.stdout.write(`\n[gate ${gate.id}] ${r.error}\n`);
      break;
    }
  }
  const ok = stepResults.every((s) => s.ok) && stepResults.length === gate.steps.length;
  return { gate, ok, durationMs: Date.now() - started, steps: stepResults };
}

async function main(): Promise<void> {
  process.stdout.write(
    `\n=== ship-gate (suite 22/P05) ===\nrepo: ${repoRoot}\nbase URL for shell + smoke: ${BASE_URL}\n`,
  );
  const results: GateResult[] = [];
  const overallStart = Date.now();
  for (const gate of GATES) {
    process.stdout.write(`\n=== Gate ${gate.id} — ${gate.label} ===\n`);
    const r = await runGate(gate);
    results.push(r);
    if (!r.ok) {
      const failedStep = r.steps.find((s) => !s.ok);
      const detail = failedStep
        ? `step "${stepLabel(failedStep.step)}" exited ${failedStep.exitCode ?? "?"}`
        : "no steps ran";
      process.stdout.write(
        `\n[ship-gate] Gate ${r.gate.id} (${r.gate.label}) FAILED — ${detail}.\n`,
      );
      break;
    }
  }
  const totalMs = Date.now() - overallStart;

  process.stdout.write("\n=== ship-gate summary ===\n");
  for (const r of results) {
    const status = r.ok ? "PASS" : "FAIL";
    process.stdout.write(
      `  ${status}  Gate ${r.gate.id.padStart(2)}  ${r.gate.label}  (${fmtSeconds(r.durationMs)})\n`,
    );
    for (const s of r.steps) {
      const sStatus = s.ok ? "ok" : "FAIL";
      process.stdout.write(
        `        ${sStatus}  ${stepLabel(s.step)}  (${fmtSeconds(s.durationMs)})\n`,
      );
    }
  }
  for (const gate of GATES) {
    if (results.find((r) => r.gate.id === gate.id)) continue;
    process.stdout.write(
      `  SKIP  Gate ${gate.id.padStart(2)}  ${gate.label}  (skipped after earlier failure)\n`,
    );
  }
  process.stdout.write(`\nTotal: ${fmtSeconds(totalMs)}\n`);

  const failed = results.filter((r) => !r.ok);
  if (failed.length === 0 && results.length === GATES.length) {
    process.stdout.write(
      "\nAll programmatic gates passed.\n" +
        "Manual checklist remains: docs/v2_ship_checklist.md\n",
    );
    process.exit(0);
  }
  process.stdout.write(
    `\nFailures: ${failed.map((r) => `${r.gate.id} (${r.gate.label})`).join(", ") || "(none ran)"}\n`,
  );
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`ship-gate crashed: ${String(err)}\n`);
  process.exit(1);
});
