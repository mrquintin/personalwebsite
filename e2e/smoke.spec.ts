import { platform } from "node:os";
import { test, expect } from "@playwright/test";

test("landing renders accordion and palette opens on cmd+k", async ({ page }) => {
  await page.goto("/");
  // The legacy visible status bar was replaced by an aria-live status region.
  await expect(page.locator("#operator-aria-live[role='status']")).toHaveCount(1);
  // five panels
  await expect(page.getByRole("region")).toHaveCount(5);
  // open palette
  // useHotkey({ meta: true, ... }) treats either meta or control as the modifier, but each
  // keydown still toggles the dialog — never press a second "fallback" combo or we can
  // close an already-open palette before React's paint is observed.
  const palette = page.getByRole("dialog", { name: /command palette/i });
  const openCombo = platform() === "darwin" ? "Meta+KeyK" : "Control+KeyK";
  await page.keyboard.press(openCombo);
  await expect(palette).toBeVisible();
});

test("projects index shows three rows", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.locator("table.projects-table tbody tr")).toHaveCount(3);
});
