# Changelog

All notable changes to this site. Dates in ISO-8601.

## 2026-04-20

### Added
- Operator-aesthetic rebuild: token system, shell, accordion landing.
- Command palette (⌘K) with fuzzy match, history, scope filters.
- Boot sequence (skippable, session-memoized).
- Bespoke pages for Hivemind, Purposeless Efficiency, Theseus.
- Generic dossier scaffold + `/projects` index.
- About page, resume page with print stylesheet.
- F1 help modal, status bar with UTC clock + ticker.
- 404 page in operator voice.
- Hover-to-expand accordion on desktop; vertical-stack accordion on mobile.
- ⌘+Enter on projects rows opens in new tab.
- Async spinner state + row disable on palette commands.
- Easter eggs: Konami code, `clear`, ⌘+Shift+T outline, `sudo`,
  late-night status flash.
- MDX wiring: `biography.mdx`, `methodology.mdx`, `preface.mdx`.
- framer-motion palette open/close + Radix Dialog focus trap.
- fuse.js fuzzy ranker (replaces hand-rolled scorer).
- next-sitemap (sitemap.xml + robots.txt).
- @vercel/analytics (zero-config).
- JSON-LD: Person on `/about`, WebSite on root.
- Stylelint config + token-lint script.
- Playwright smoke test + extended CI (typecheck + copy-lint + e2e).
- Lighthouse CI workflow.
- `scripts/stamp-resume.ts` + `src/generated/resume-meta.json`.
- Zod project-schema validator.
- `.env.example`.

### Changed
- Legacy static site moved to `public/_legacy/`. Ontology data copied
  to `src/content/projects/theseus/ontology-data.raw.ts` for porting.
- Fixed X social icon in `public/_legacy/index.html` (was rendering as
  a stroke-only outline that resembled a Twitter bird).
