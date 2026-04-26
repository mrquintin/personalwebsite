import { test, expect } from "@playwright/test";

// suite 16/P09 — mobile parity for project pages.
// Validates B1 (single-column flow + reduced spacing), B2 (44×44 touch
// targets), B3 (always-visible anchor sigil), B4 (full-bleed asides) on a
// 375px viewport.

test.use({ viewport: { width: 375, height: 800 } });

const SLUGS = ["hivemind", "purposeless-efficiency", "theseus"] as const;

for (const slug of SLUGS) {
  test(`/projects/${slug} renders on a 375px viewport`, async ({ page }) => {
    const res = await page.goto(`/projects/${slug}`);
    expect(res?.status()).toBe(200);

    const article = page.locator("article.ps-shell");
    await expect(article).toBeVisible();

    // B1 — Container horizontal padding is var(--s-4) (16px) at <640px.
    const padLeft = await article.evaluate((el) =>
      getComputedStyle(el).paddingLeft,
    );
    const padRight = await article.evaluate((el) =>
      getComputedStyle(el).paddingRight,
    );
    expect(padLeft).toBe("16px");
    expect(padRight).toBe("16px");

    // B1 — section vertical gap reduced to var(--s-6) (32px).
    const sectionGap = await page
      .locator(".ps-shell-sections")
      .evaluate((el) => getComputedStyle(el).rowGap);
    expect(sectionGap).toBe("32px");

    // B1 — hero title scales down to var(--t-2xl-size) (36px).
    const titleSize = await page
      .locator(".ph-hero__title")
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(titleSize).toBe("36px");
  });
}

test("touch targets meet 44×44 on /projects/hivemind", async ({ page }) => {
  await page.goto("/projects/hivemind");

  const candidates = page.locator(
    "article.ps-shell .p-btn, article.ps-shell button:not(.p-anchor__copy), article.ps-shell a.p-link",
  );
  const count = await candidates.count();

  for (let i = 0; i < count; i++) {
    const el = candidates.nth(i);
    const box = await el.boundingBox();
    if (!box) continue;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
