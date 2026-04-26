import { test, expect } from "@playwright/test";
import hivemindMeta from "../src/content/projects/hivemind/metadata";
import purposelessMeta from "../src/content/projects/purposeless-efficiency/metadata";
import theseusMeta from "../src/content/projects/theseus/metadata";

// suite 16/P10 — project pages ship gate.
// Each /projects/<slug> route must:
//   - return 200
//   - render an <h1> containing the project title
//   - expose at least one section anchor (id="...")
//   - render the "ask my LLM about <project>" footer CTA pointing to /chat
//   - render a status badge that matches metadata.status (mapped through
//     the ProjectShell v1 pill mapping for status text)

const SHELL_STATUS_TO_V1: Record<
  "exploration" | "in-progress" | "shipped",
  "draft" | "active" | "shipped"
> = {
  exploration: "draft",
  "in-progress": "active",
  shipped: "shipped",
};

const CASES = [
  { slug: "hivemind", meta: hivemindMeta },
  { slug: "purposeless-efficiency", meta: purposelessMeta },
  { slug: "theseus", meta: theseusMeta },
] as const;

for (const { slug, meta } of CASES) {
  test(`/projects/${slug} returns 200`, async ({ request }) => {
    const res = await request.get(`/projects/${slug}`);
    expect(res.status()).toBe(200);
  });

  test(`/projects/${slug} h1 contains the project title`, async ({ page }) => {
    await page.goto(`/projects/${slug}`);
    await expect(page.locator("h1").first()).toContainText(meta.title);
  });

  test(`/projects/${slug} has at least one section anchor with id`, async ({
    page,
  }) => {
    await page.goto(`/projects/${slug}`);
    const anchorCount = await page
      .locator("article.ps-shell [id]")
      .count();
    expect(anchorCount).toBeGreaterThan(0);
  });

  test(`/projects/${slug} footer CTA links to /chat`, async ({ page }) => {
    await page.goto(`/projects/${slug}`);
    const cta = page
      .getByRole("link", {
        name: new RegExp(`ask my LLM about ${meta.title}`, "i"),
      })
      .first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/chat");
  });

  test(`/projects/${slug} status badge matches metadata.status`, async ({
    page,
  }) => {
    await page.goto(`/projects/${slug}`);
    const expected = SHELL_STATUS_TO_V1[meta.status];
    const pill = page.locator(`.pill.pill-${expected}`).first();
    await expect(pill).toBeVisible();
    await expect(pill).toHaveText(expected);
  });
}
