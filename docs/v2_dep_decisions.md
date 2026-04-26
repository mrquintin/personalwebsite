# v2 Dependency Decisions

This document records the rationale behind dependencies kept in
`package.json` even when `depcheck` flags them as unused. It also lists
the remaining `npm audit` warnings and the policy for them.

It exists so a future maintainer reading the manifest does not strip a
dependency that suites 13–22 are about to reintroduce.

---

## Audit baseline (suite 12 / P04 hygiene pass)

`npx depcheck` (depcheck@1.4.7) reported these results immediately
after the demolition pass (suite P02) and before P04 took action.

### Unused dependencies — REMOVED

| Package         | Reason for removal                                  |
| --------------- | --------------------------------------------------- |
| `caniuse-lite`  | Transitive of Next.js. Did not need an explicit pin. |
| `clsx`          | Only referenced from archived `_archive_*` trees.   |

### Unused devDependencies — REMOVED

| Package                              | Reason for removal                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `@typescript-eslint/eslint-plugin`   | Bundled inside `eslint-config-next`; no direct consumer. Re-add if a custom config needs it. |
| `@typescript-eslint/parser`          | Same as above.                                                                   |
| `tsconfig-paths`                     | Was used by removed `tsx` scripts (`scripts/lint-copy.ts`, `scripts/check-tokens.ts`, `scripts/stamp-resume.ts`). |
| `tsx`                                | All `tsx scripts/*.ts` npm scripts were deleted in this pass. Suite 22 will reintroduce as needed. |

### Unused devDependencies — KEPT

These show up in `depcheck` but are deliberately retained because a
future v2 suite will use them, or because the depcheck report is a
false positive.

| Package                  | Why kept                                                                                                  | Suite that will use it |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------- |
| `@axe-core/react`        | Runtime a11y instrumentation in dev. Suite 13 (a11y baseline) and suite 19 (e2e a11y).                    | 13, 19                 |
| `axe-core`               | Peer of `@axe-core/react`; also used directly from Playwright a11y assertions.                            | 13, 19                 |
| `@testing-library/react` | Vitest unit-test harness for React components built in suites 14–17.                                      | 14–17                  |
| `prettier`               | Editor + pre-commit formatting; not invoked from any npm script but is the project formatter.             | ongoing                |
| `stylelint`              | Configured via `.stylelintrc.json` for editor integration. No npm script wires it up because the legacy CSS still under `src/styles/` and `src/app/globals.css` would fail; suite 13 will reintroduce a `lint:css` script after it rewrites the CSS layer. | 13 |
| `stylelint-config-standard` | False positive. `.stylelintrc.json` declares `"extends": ["stylelint-config-standard"]`.               | 13                     |

### Unused `dependencies` — KEPT

`depcheck` does not flag these, but several are only consumed by code
that currently lives under `src/components/`, `src/lib/`, `src/stores/`
behind stub pages from suite P02. They will be re-wired by the
relevant v2 suite. Removing them now would only force a re-install
later.

| Package                       | Pending consumer                                  |
| ----------------------------- | ------------------------------------------------- |
| `@mdx-js/loader`, `@mdx-js/react`, `@next/mdx`, `@types/mdx` | MDX prose pages (suite 20 corpus). |
| `@radix-ui/react-dialog`, `@radix-ui/react-visually-hidden`  | Modal / dialog primitives (suites 14, 16, 18).   |
| `@vercel/analytics`           | Production analytics (suite 22 ship-prep).        |
| `framer-motion`               | Page transitions / micro-interactions (suite 17). |
| `fuse.js`                     | Search index (suite 16).                          |
| `next-sitemap`                | `postbuild` step; sitemap generation.             |
| `zod`                         | Schemas for project data + LLM-of-me payloads (suites 16, 18). |
| `zustand`                     | Client state for any interactive surface (suites 16, 18). |

### Missing dependencies

`depcheck` reports `mdx: ./mdx-components.tsx`. This is a false
positive: the import is `mdx/types`, supplied by `@types/mdx` (already
declared). No action.

---

## NOT yet present (do not preemptively add)

The LLM-of-me suite (18) will need:

- `@anthropic-ai/sdk`
- A Postgres driver: `pg` *or* `postgres-js`
- An ORM/query layer: `drizzle-orm` *or* `prisma`

Per the P04 non-goals, these MUST NOT be added in this pass. Suite 18
owns the choice.

---

## `npm audit` baseline

After `npm install` on the new manifest:

```
3 moderate severity vulnerabilities
0 high
0 critical
```

All three originate from a single chain:

```
postcss <8.5.10  (GHSA-qx2v-qp2m-jg93, CSS Stringify XSS)
  └── next >=9.3.4-canary.0
        └── @vercel/analytics >=1.2.0-beta.1
```

The fix requires `npm audit fix --force`, which would downgrade Next.js
to v9.3.3 — a multi-major regression. We accept this for now because:

1. The XSS vector is in PostCSS's CSS string output, not in the runtime
   path the site exercises.
2. Next.js will pull in a patched `postcss` in a minor release; the
   warning will resolve via the routine `npm i next@latest` in suite 22.
3. P04's acceptance bar is "zero high or critical" (B6). That is met.

A maintainer should re-run `npm audit` whenever bumping Next.js. If it
still surfaces, escalate; do not run `npm audit fix --force`.

---

## Suite 16 / P08 — Resume PDF generation

The `/resume` page (suite 16/P08) ships a "Download as PDF" affordance.
We chose **option (a)**: generate `public/resume.pdf` at build time
rather than committing it.

**Why (a) over (b):**

- A committed PDF rots silently. The TypeScript content modules under
  `src/content/resume/` are the source of truth; the PDF must track
  them, not the other way around.
- The script is best-effort: if Playwright browsers aren't present
  (typical local install) it logs and exits 0 instead of failing the
  build. Production deploys (Vercel) install the browser via the
  Playwright cache and produce a real PDF.

**What was added:**

| Path | Role |
| ---- | ---- |
| `scripts/resume/build-pdf.ts` | Spawns `next start`, prints `/resume?print=true` to PDF via `@playwright/test`'s headless chromium. |
| `npm run build:resume-pdf`    | Wraps the script. Invoked from `postbuild` after `next-sitemap`. |
| `tsx` (devDependency)         | Reintroduced so `.ts` scripts run without a separate compile step. P04 had removed it pending a real consumer; this is that consumer. |
| `public/resume.pdf` (gitignored) | Output target. Generated, not tracked. |

`@playwright/test` was already a devDependency (e2e), so no new browser
runtime dependency. If the script ever needs to run on a node-only
image, install browsers explicitly with `npx playwright install chromium`.

Override knobs: `SKIP_RESUME_PDF=1` skips the step; `RESUME_PDF_URL`
prints from a remote URL instead of a locally booted server;
`RESUME_PDF_PORT` overrides the default port (4321).

---

## Suite 18 / P05 — Vector store (Drizzle + postgres-js + pgvector)

The corpus chunks land in Vercel Postgres with the pgvector extension.
Two ORM/query-layer candidates were considered:

| Option | Verdict | Why |
| ------ | ------- | --- |
| **Drizzle ORM** | **Picked.** | Lean (no codegen daemon, no engine binary), first-class TypeScript inference straight from the schema definition, and a native `vector` column type with HNSW index helpers in `drizzle-orm/pg-core` as of 2026. The migration story is a thin SQL emitter (`drizzle-kit generate`) — the migrations stay human-readable and live in-tree under `src/db/migrations/`. |
| Prisma | Rejected. | Heavier: ships a Rust query engine, a generated client under `node_modules/.prisma`, and historically lacked a stable `Vector` column type. Workarounds (raw SQL + custom client extensions) erase the type-safety win that justifies the weight. |

Postgres driver: **`postgres`** (postgres-js). Drizzle's
`drizzle-orm/postgres-js` adapter is the recommended pairing for
serverless Postgres in 2026, and `postgres-js` is faster on cold
connections than `pg` while supporting both pooled and direct URLs.

Auxiliary: `pgvector` (npm) is included for future use of its
`toSql`/`fromSql` helpers when working with raw SQL — Drizzle's
`vector` column type already handles serialization for ORM queries,
so the helper is not required for the happy path but stays available.

| Path | Role |
| ---- | ---- |
| `drizzle.config.ts` | Drizzle Kit config — points at `src/db/schema.ts`, emits to `src/db/migrations/`. |
| `src/db/schema.ts` | Schema definitions for `chunks` and `ingest_state`, plus the HNSW index on `embedding` using `vector_cosine_ops`. |
| `src/db/migrations/` | Generated SQL migrations. The first migration is hand-augmented with `CREATE EXTENSION IF NOT EXISTS vector;` so a fresh database is bootstrapped in one pass. |
| `src/lib/llm/db.ts` | Lazy `postgres-js` client + Drizzle wrapper. Reads `POSTGRES_URL` for runtime, falls back to `POSTGRES_URL_NON_POOLING` for migrations. |
| `src/lib/llm/store.ts` | Typed CRUD: `upsertChunks`, `deleteChunksByPath`, `getIngestState`, `setIngestState`, `searchSimilar`. Cosine distance via `<=>`, returned as `similarity = 1 - distance`. Filters: `kind` (string or array), `topics` (any-of via `&&`), `cite_okay` (default `true`). |
| `scripts/llm/migrate.ts` | `tsx` runner around `drizzle-orm/postgres-js/migrator`. First call runs `CREATE EXTENSION IF NOT EXISTS vector;` defensively, then applies every migration under `src/db/migrations/`. |
| `npm run db:generate`, `npm run db:migrate` | Wired in `package.json`. |

**Deployment note.** Vercel Postgres ships with pgvector enabled — the
extension is installable from any role with `CREATEDB`, and the first
migration's `CREATE EXTENSION IF NOT EXISTS vector;` is a no-op on
re-run. On other Postgres providers (RDS without the `rds_superuser`
role, bare Postgres without the `vector` package installed at the OS
level, etc.) the extension must be installed at the cluster level
first; otherwise the migration will fail on the `vector(1024)` column
type.

**Non-goal.** Pinecone is intentionally not provided as an alternative
implementation. The Postgres approach is sufficient for the corpus
size (low thousands of chunks) and avoids a second vendor in the
deployment surface.
