import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// suite 21/P03 — accessibility audit.
// Sweeps every v2 route from suite 14/P04 with axe-core and asserts
// zero violations at the wcag2a and wcag2aa levels.

const ROUTES = [
  "/",
  "/about",
  "/resume",
  "/chat",
  "/projects",
  "/projects/hivemind",
  "/projects/purposeless-efficiency",
  "/projects/theseus",
] as const;

for (const route of ROUTES) {
  test(`axe: ${route} has no WCAG 2.1 A/AA violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    if (results.violations.length > 0) {
      // Surface enough detail in the test output to triage failures
      // without re-running the suite.
      const summary = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
        targets: v.nodes.slice(0, 3).map((n) => n.target),
      }));
      console.log(
        `axe violations on ${route}:\n${JSON.stringify(summary, null, 2)}`,
      );
    }

    expect(results.violations).toEqual([]);
  });
}
