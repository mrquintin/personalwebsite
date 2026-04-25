import { test, expect } from "@playwright/test";

test("landing renders accordion and palette opens on cmd+k", async ({ page, browserName }) => {
  await page.goto("/");
  // The legacy visible status bar was replaced by an aria-live status region.
  await expect(page.locator("#operator-aria-live[role='status']")).toHaveCount(1);
  // five panels
  await expect(page.getByRole("region")).toHaveCount(5);
  // open palette
  const palette = page.getByRole("dialog", { name: /command palette/i });
  const combos = browserName === "webkit" ? ["Meta+KeyK", "Control+KeyK"] : ["Control+KeyK", "Meta+KeyK"];
  for (const combo of combos) {
    await page.keyboard.press(combo);
    if (await palette.isVisible()) break;
  }
  await expect(palette).toBeVisible();
});

test("projects index shows three rows", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.locator("table.projects-table tbody tr")).toHaveCount(3);
});
