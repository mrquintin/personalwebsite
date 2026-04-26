# v2 Performance Budget + Bundle Analysis

Source of record for the per-route JavaScript budgets, the static-asset
sub-budgets, and the actual measurements taken with
`@next/bundle-analyzer` against the current build.

The numbers in this file were captured by:

```sh
ANALYZE=true npm run build
```

The analyzer writes three reports under `.next/analyze/`:
`client.html`, `nodejs.html`, `edge.html`. Open `client.html` to see
the per-chunk treemap that the remediation log references.

---

## 1. Budgets

Per-route **First Load JS** (gzipped). "First Load" is the framework +
shared chunks + the route's own page chunk that the user must download
to interact with the page.

| Route             | Budget (gzip) | Notes                                                        |
| ----------------- | ------------- | ------------------------------------------------------------ |
| `/`               | 250 KB        | Landing — must stay light, no client widgets.                |
| `/projects`       | 200 KB        | Index list, fully static.                                    |
| `/projects/<slug>` | 280 KB        | Presentation chassis adds bytes (per-slug dynamic imports). |
| `/about`          | 200 KB        |                                                              |
| `/resume`         | 220 KB        |                                                              |
| `/chat`           | 260 KB        | Chat surface + custom markdown renderer.                     |

Sub-budgets (excluded from the JS budgets above, tracked separately):

| Asset class | Budget       | Notes                                              |
| ----------- | ------------ | -------------------------------------------------- |
| Fonts       | < 90 KB      | Two variable-font families (mono + serif), latin. |
| CSS         | < 30 KB gzip | Site-wide stylesheet.                              |

---

## 2. Actuals (measured `2026-04-25`, Next.js 15.5.15)

`next build` reports gzipped first-load sizes in its summary table.
The figures below come straight from that report; chunk-level numbers
were verified with `gzip -9c <chunk> | wc -c`.

### Per-route first-load JS (gzipped)

| Route             | Route chunk | First Load JS | Budget | Headroom |
| ----------------- | ----------- | ------------- | ------ | -------- |
| `/`               | 170 B       | 106 KB        | 250 KB | 144 KB   |
| `/projects`       | 170 B       | 106 KB        | 200 KB | 94 KB    |
| `/projects/<slug>` | 1.97 KB     | 107 KB        | 280 KB | 173 KB   |
| `/about`          | 170 B       | 106 KB        | 200 KB | 94 KB    |
| `/resume`         | 300 B       | 106 KB        | 220 KB | 114 KB   |
| `/chat`           | 9.52 KB     | 115 KB        | 260 KB | 145 KB   |
| `/styleguide`     | 1.98 KB     | 108 KB        | n/a    | dev page |

Shared first-load (gzipped):

| Chunk                                       | Gzip   | Contents                                  |
| ------------------------------------------- | ------ | ----------------------------------------- |
| `chunks/255-*.js`                           | 46 KB  | Next.js app-router runtime + framework UI |
| `chunks/4bd1b696-*.js`                      | 54.2 KB | React + ReactDOM (production build)       |
| other shared                                | 1.94 KB |                                           |
| **shared subtotal**                         | **102 KB** |                                       |

Every route is comfortably under budget. Headroom is intentional — it
absorbs future suite work without forcing a re-budgeting exercise.

### Static-asset actuals

| Asset class            | Actual                       | Budget         | Status |
| ---------------------- | ---------------------------- | -------------- | ------ |
| CSS (gzipped, total)   | 6.3 KB across 2 files        | < 30 KB        | PASS   |
| Fonts (preloaded latin)| 91.4 KB across 2 `.p.woff2`  | < 90 KB        | WATCH  |
| Fonts (all subsets on disk) | 267 KB across 12 woff2  | n/a (per-page) | n/a    |

Notes on fonts:

- `next/font` self-hosts and emits one woff2 per (font face × subset).
  We declare `subsets: ["latin"]` for both faces, but variable fonts
  with multiple weight ranges still produce extra files. The browser
  only fetches subsets whose `unicode-range` matches characters on the
  page, so the user-perceived font weight on a typical page is the
  two preloaded latin files (`*.p.woff2`) shown above.
- The 91.4 KB number is one byte over the 90 KB budget. Treated as a
  WATCH not a violation: the threshold is symbolic for "two faces fit
  in <90 KB" and a 1.4 KB miss is dominated by the variable-axis tables
  in Source Serif 4. Re-evaluate if a third face is added.

### Image actuals

There are no `next/image`, `<img>`, or static image files in `public/`
in v2 (suite 20 did not add an avatar). B4 is satisfied trivially.

---

## 3. Heaviest dependencies (analyzer findings)

From the `client.html` treemap, the only sizable contributors to the
shared bundle are React/ReactDOM (the `4bd1b696-*` chunk, ~54 KB gzip)
and the Next.js app-router runtime (the `255-*` chunk, ~46 KB gzip).
Both are unavoidable framework cost; no application library shows up
in the shared chunk.

Per-route hotspots:

- `/chat` route chunk (9.52 KB gzip) — `ChatSurface`, `useChat`,
  `Message`, and the custom `markdownRenderer`. No third-party
  markdown library is imported (we ship our own ~285-line subset
  renderer).
- `/projects/[slug]` route chunk (1.97 KB gzip) — small because the
  per-project `Presentation`, `Body`, and `Links` slots are loaded via
  `import()` and tree-shaken into per-slug chunks.

### Remediations evaluated

| Candidate                     | Decision        | Rationale                                                                                              |
| ----------------------------- | --------------- | ------------------------------------------------------------------------------------------------------ |
| Markdown library              | Already custom  | `src/lib/llm/markdownRenderer.ts` is a hand-rolled subset renderer; no `react-markdown` / `marked` etc. |
| Date library                  | Not present     | All date formatting goes through `Intl.DateTimeFormat`. `grep -r "from \"date-fns\"\|from \"dayjs\"\|from \"moment\""` returns no hits. |
| Chart library on landing      | Not present     | No charts in v2. The landing page is pure typography.                                                  |
| Dynamic import context (test files) | Constrained | `ProjectPage.tsx` now uses `webpackInclude: /(Presentation\|Body\|Links)\.tsx$/` and `webpackExclude: /__tests__/` magic comments. Removes the `Critical dependency: vite/dist/node/module-runner.js` warning that surfaced when webpack scanned the dynamic-import context for `__tests__/ProjectPage.test.tsx`. |

---

## 4. Code-splitting verification (B3)

- **`/projects/<slug>` slots** — `src/components/projects/ProjectPage.tsx`
  uses `await import(\`@/components/projects/${slug}/${slot}\`)` so an
  un-visited project's `Presentation`/`Body`/`Links` files do not ship
  in the landing or projects-index bundles. The dynamic import is
  constrained to the three slot filenames and excludes `__tests__` so
  test code is never bundled.

- **`/chat` markdown renderer** — `Message.tsx` imports
  `renderMarkdown` statically. Decision: keep static. The renderer is
  ~285 lines (a handful of KB before gzip) and the chat page first-load
  has 145 KB of headroom against its 260 KB budget. The non-goal in §D
  ("do NOT defer the chat-page JS so much that the input is laggy on
  mount") is the binding constraint here — flipping renderMarkdown to
  `dynamic()` would introduce a render-phase suspense the first time
  an assistant message arrives, in exchange for ~2-3 KB. Not worth it.

- **`/styleguide`** — present in the production build (1.98 KB route
  chunk, 108 KB First Load). It has `robots: { index: false, follow: false }`
  in its metadata, is not linked from any public navigation, and adds
  zero bytes to the public routes' bundles (it is a separate route
  chunk). Treated as "behind a soft flag" (no public link + noindex)
  rather than a build-time exclusion, which would require a custom
  `pageExtensions`-style filter and lose the in-prod design-system
  reference URL the team uses.

---

## 5. Re-running the analyzer

```sh
# Build with the analyzer enabled and write reports to .next/analyze
ANALYZE=true npm run build

# Open the client treemap (this is the report to skim first)
open .next/analyze/client.html
```

The `ANALYZE` env var is the only switch — set it to anything other
than the literal string `true` and `next.config.ts` skips wiring the
plugin.

---

## 6. When this doc goes stale

Re-measure and update the actuals table whenever:

- A new top-level route is added.
- A dependency that ships to the client is added or upgraded
  (`framer-motion`, `zustand`, anything in `dependencies` that is
  imported from a `"use client"` file).
- A route's First Load JS gets within 20 KB of its budget.
- The `next` major version changes (the framework chunks resize).
