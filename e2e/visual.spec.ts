import { test, expect } from "@playwright/test";

/* ---------------------------------------------------------------------------
 * suite 22/P04 — visual regression baseline
 *
 * Captures one screenshot per (route × theme × viewport). Future PRs that
 * visually drift from baseline are flagged by Playwright's built-in
 * `toHaveScreenshot` snapshot assertion (zero third-party vendors — we do
 * NOT depend on Percy / Chromatic / Argos for v2 scale).
 *
 * Snapshots live in e2e/__screenshots__/ (configured via
 * `snapshotPathTemplate` in playwright.config.ts). Re-baseline locally with
 *
 *     npm run visual:update
 *
 * NOTE on environment drift: baselines are captured on the developer's
 * machine and committed. CI runs Linux Chromium with the same Playwright
 * version, but font rendering, sub-pixel anti-aliasing, and emoji glyphs
 * may still differ slightly from macOS. The 0.1 % pixel-diff tolerance
 * absorbs minor jitter; structural regressions (layout shifts, missing
 * elements, colour-token swaps) blow past it. If a CI run shows blanket
 * drift across many baselines, re-baseline in the CI environment via the
 * `visual:update` script run on a Linux VM/container.
 * --------------------------------------------------------------------------- */

const ROUTES: Array<{ slug: string; path: string }> = [
  { slug: "home", path: "/" },
  { slug: "projects", path: "/projects" },
  { slug: "project-hivemind", path: "/projects/hivemind" },
  { slug: "project-purposeless-efficiency", path: "/projects/purposeless-efficiency" },
  { slug: "project-theseus", path: "/projects/theseus" },
  { slug: "about", path: "/about" },
  { slug: "resume", path: "/resume" },
  { slug: "chat", path: "/chat" },
];

const THEMES = ["dark", "light"] as const;

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 700 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

// Pixel-diff tolerance: 0.1 % of total pixels may differ before failing.
// Tight enough to catch real regressions, loose enough to ride out
// font-hinting jitter between machines.
const MAX_DIFF_RATIO = 0.001;

for (const route of ROUTES) {
  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      const snapshotName = `${route.slug}-${theme}-${vp.name}.png`;

      test(`visual: ${route.path} [${theme}] [${vp.name}]`, async ({ page }) => {
        // 1. Set viewport BEFORE navigation so layout queries are stable.
        await page.setViewportSize({ width: vp.width, height: vp.height });

        // 2. Force reduced-motion + the matching colour scheme media feature.
        //    The site reads localStorage `theme`, but emulating
        //    prefers-color-scheme keeps OS-level controls (scrollbars, form
        //    glyphs) consistent between light and dark runs.
        await page.emulateMedia({
          reducedMotion: "reduce",
          colorScheme: theme,
        });

        // 3. Pre-seed localStorage so the inline ThemeInit script picks the
        //    right theme before first paint. addInitScript runs before any
        //    page script in the new context.
        await page.addInitScript((t) => {
          try {
            window.localStorage.setItem("theme", t);
          } catch {
            /* storage unavailable — fall back to media-query default */
          }
        }, theme);

        // 4. Navigate and wait for the network to settle.
        await page.goto(route.path, { waitUntil: "networkidle" });

        // 5. Sanity check: the inline ThemeInit must have applied data-theme.
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        // 6. Disable any in-flight CSS transitions/animations entirely. The
        //    reduced-motion token chain in tokens.css already collapses
        //    `var(--d-*)`, but inline keyframes / hover transitions live
        //    outside that scheme. Belt-and-braces injection guarantees a
        //    static frame.
        await page.addStyleTag({
          content: `
            *, *::before, *::after {
              transition-duration: 0s !important;
              transition-delay: 0s !important;
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              animation-iteration-count: 1 !important;
              caret-color: transparent !important;
            }
          `,
        });

        // 7. Wait for webfonts. Without this the first paint can land with
        //    fallback metrics, then reflow when the real face arrives.
        await page.evaluate(async () => {
          if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
          }
        });

        // 8. Mask any timestamp / transient-content nodes. The current chat
        //    surface (suite 19) has no rendered timestamps, but the
        //    `[data-volatile]` selector reserves a mask hook so future
        //    additions (relative-time tags, "last updated", live counters)
        //    don't immediately invalidate baselines.
        const mask = [page.locator("[data-volatile]")];

        await expect(page).toHaveScreenshot(snapshotName, {
          fullPage: true,
          animations: "disabled",
          caret: "hide",
          maxDiffPixelRatio: MAX_DIFF_RATIO,
          mask,
        });
      });
    }
  }
}
