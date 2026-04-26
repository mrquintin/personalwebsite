import { test, expect } from "@playwright/test";
import { hvmPhases } from "../src/content/presentations/hvm";
import { prpPhases } from "../src/content/presentations/prp";
import { thsPhases } from "../src/content/presentations/ths";

const CASES = [
  {
    slug: "hivemind",
    deckId: "hvm",
    title: "Hivemind, briefly",
    phases: hvmPhases,
  },
  {
    slug: "purposeless-efficiency",
    deckId: "prp",
    title: "Purposeless Efficiency, briefly",
    phases: prpPhases,
  },
  {
    slug: "theseus",
    deckId: "ths",
    title: "Theseus, briefly",
    phases: thsPhases,
  },
] as const;

for (const { slug, deckId, title, phases } of CASES) {
  test.describe(`/projects/${slug} presentation deck`, () => {
    test("deck is visible with phase 1 heading by default", async ({
      page,
    }) => {
      await page.goto(`/projects/${slug}`);
      const deck = page.locator(`[data-deck-id="${deckId}"]`);
      await expect(deck).toBeVisible();
      await expect(deck).toHaveAttribute("aria-label", title);
      await expect(
        deck.getByRole("heading", { name: phases[0].heading, level: 4 }),
      ).toBeVisible();
    });

    test("clicking next reveals phase 2 heading and hides phase 1", async ({
      page,
    }) => {
      await page.goto(`/projects/${slug}`);
      const deck = page.locator(`[data-deck-id="${deckId}"]`);
      await expect(deck).toBeVisible();

      const phase1 = deck.getByRole("heading", {
        name: phases[0].heading,
        level: 4,
      });
      await expect(phase1).toBeVisible();

      await deck.getByRole("button", { name: /next/i }).click();

      const phase2 = deck.getByRole("heading", {
        name: phases[1].heading,
        level: 4,
      });
      await expect(phase2).toBeVisible();

      await expect(
        deck.getByRole("heading", { name: phases[0].heading, level: 4 }),
      ).toHaveCount(0);
    });

    test("ArrowRight key advances the deck", async ({ page }) => {
      await page.goto(`/projects/${slug}`);
      const deck = page.locator(`[data-deck-id="${deckId}"]`);
      await deck.focus();
      await page.keyboard.press("ArrowRight");
      await expect(
        deck.getByRole("heading", { name: phases[1].heading, level: 4 }),
      ).toBeVisible();
    });

    test("dot indicators are clickable and jump to phase", async ({ page }) => {
      await page.goto(`/projects/${slug}`);
      const deck = page.locator(`[data-deck-id="${deckId}"]`);
      const dots = deck.getByRole("tab");
      await expect(dots).toHaveCount(phases.length);

      const targetIndex = 2;
      await dots.nth(targetIndex).click();
      await expect(
        deck.getByRole("heading", {
          name: phases[targetIndex].heading,
          level: 4,
        }),
      ).toBeVisible();
      await expect(dots.nth(targetIndex)).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });
}
