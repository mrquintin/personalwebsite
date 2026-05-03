import { test, expect } from "@playwright/test";
import identity from "../src/content/about/identity";
import { hero } from "../src/content/landing/hero";
import { projects } from "../src/content/projects/index";

test("GET / returns 200", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
});

test("landing page h1 contains the user's name", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText(identity.name);
});

test("primary CTA points to /chat", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: hero.primaryCta.label }).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", hero.primaryCta.href);
});

test("three project cards exist with titles for HVM, PRP, THS", async ({ page }) => {
  await page.goto("/");
  const hvm = projects.find((p) => p.code === "HVM")!;
  const prp = projects.find((p) => p.code === "PRP")!;
  const ths = projects.find((p) => p.code === "THS")!;
  await expect(page.getByRole("link", { name: new RegExp(hvm.title, "i") }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(prp.title, "i") }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(ths.title, "i") }).first()).toBeVisible();
});

test("Open the full chat link exists in ChatPreview section", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /Open the full chat/i }).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/chat");
});
