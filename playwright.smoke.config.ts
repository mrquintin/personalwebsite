import { defineConfig, devices } from "@playwright/test";

// suite 22/P03 — deployed smoke config. No webServer: we only ever run
// against a pre-existing URL passed in via SMOKE_URL.
const baseURL = process.env.SMOKE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["smoke-deployed.spec.ts"],
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["json", { outputFile: "smoke-results.json" }], ["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
