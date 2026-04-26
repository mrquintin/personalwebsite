import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.{ts,tsx}"],
    exclude: [
      "node_modules/**",
      "e2e/**",
      "_archive_operator/**",
      "_archive_nashlab/**",
      "_archive_prompts_pre_overhaul_2026-04-25/**",
      "src/_legacy_v1/**",
    ],
    globals: true,
    setupFiles: ["src/components/primitives/__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
