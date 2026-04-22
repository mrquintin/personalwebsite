import { test, expect } from "@playwright/test";

test("landing renders accordion and palette opens on cmd+k", async ({ page, browserName }) => {
  await page.goto("/");
  // status bar always visible
  await expect(page.locator("footer.status-bar")).toBeVisible();
  // five panels
  await expect(page.getByRole("region")).toHaveCount(5);
  // open palette
  const mod = browserName === "webkit" ? "Meta" : "Control";
  await page.keyboard.press(`${mod}+KeyK`);
  await expect(page.getByRole("dialog", { name: /command palette/i })).toBeVisible();
});

test("projects index shows three rows", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.locator("table.projects-table tbody tr")).toHaveCount(3);
});
