#!/usr/bin/env tsx
/**
 * suite 16/P10 — projects ship gate.
 *
 * Sequentially runs typecheck, lint, vitest (project page tests),
 * playwright (project page e2e), and a production build. Exits 0
 * when every gate passes, 1 otherwise with a summary of failures.
 */
import { spawn } from "node:child_process";

type Gate = {
  id: string;
  label: string;
  cmd: string;
  args: string[];
};

const GATES: Gate[] = [
  { id: "A", label: "typecheck", cmd: "npm", args: ["run", "typecheck"] },
  { id: "B", label: "lint", cmd: "npm", args: ["run", "lint"] },
  {
    id: "C",
    label: "vitest projects",
    cmd: "npx",
    args: [
      "vitest",
      "run",
      "src/components/projects/__tests__/",
    ],
  },
  {
    id: "D",
    label: "playwright projects",
    cmd: "npx",
    args: ["playwright", "test", "e2e/projects.spec.ts"],
  },
  { id: "E", label: "build", cmd: "npm", args: ["run", "build"] },
];

type GateResult = {
  gate: Gate;
  ok: boolean;
  exitCode: number | null;
  durationMs: number;
};

function runGate(gate: Gate): Promise<GateResult> {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(gate.cmd, gate.args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("close", (code) => {
      resolve({
        gate,
        ok: code === 0,
        exitCode: code,
        durationMs: Date.now() - started,
      });
    });
    child.on("error", () => {
      resolve({
        gate,
        ok: false,
        exitCode: null,
        durationMs: Date.now() - started,
      });
    });
  });
}

async function main(): Promise<void> {
  const results: GateResult[] = [];
  for (const gate of GATES) {
    process.stdout.write(
      `\n=== Gate ${gate.id} — ${gate.label} (${gate.cmd} ${gate.args.join(" ")}) ===\n`,
    );
    const result = await runGate(gate);
    results.push(result);
    if (!result.ok) {
      process.stdout.write(
        `\n[ship-gate:projects] Gate ${gate.id} (${gate.label}) failed with exit code ${result.exitCode}.\n`,
      );
      break;
    }
  }

  const failed = results.filter((r) => !r.ok);
  process.stdout.write("\n=== ship-gate:projects summary ===\n");
  for (const r of results) {
    const status = r.ok ? "PASS" : "FAIL";
    const seconds = (r.durationMs / 1000).toFixed(1);
    process.stdout.write(
      `  ${status}  Gate ${r.gate.id}  ${r.gate.label}  (${seconds}s)\n`,
    );
  }
  for (const gate of GATES) {
    if (results.find((r) => r.gate.id === gate.id)) continue;
    process.stdout.write(
      `  SKIP  Gate ${gate.id}  ${gate.label}  (skipped after earlier failure)\n`,
    );
  }

  if (failed.length === 0 && results.length === GATES.length) {
    process.stdout.write("\nAll gates passed.\n");
    process.exit(0);
  }
  process.stdout.write(
    `\nFailures: ${failed.map((r) => `${r.gate.id} (${r.gate.label})`).join(", ")}\n`,
  );
  process.exit(1);
}

main().catch((err) => {
  // Defensive: spawn never rejects, but keep the contract explicit.
  process.stderr.write(`ship-gate:projects crashed: ${String(err)}\n`);
  process.exit(1);
});
