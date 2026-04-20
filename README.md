# personalwebsite

**Live site (canonical):** [https://personalwebsite-beta-nine.vercel.app](https://personalwebsite-beta-nine.vercel.app)

The Next.js app under `src/app/` is the **canonical** site. Legacy
static HTML/CSS/JS under `public/` is deprecated; the Next app at `/`
owns the routes. Legacy content is retained under `public/` for
reference and may be archived to `public/_legacy/` in a follow-up.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript.
- Vanilla CSS with CSS custom properties — see `src/styles/tokens.css`.
- No Tailwind, no Radix, no MDX runtime, no UI libraries — by choice.
- Content lives as TypeScript modules in `src/content/` (CMS-in-git).

## Authoring docs (authoritative)

- `docs/design-philosophy.md` — visual rules and forbidden patterns.
- `docs/voice-guide.md` — copy voice + forbidden marketing words.
- `docs/easter-eggs.md` — what is intentionally hidden on the site.
- `docs/CHANGELOG.md`, `docs/critique-log.md`, `docs/visitor-log.md` —
  iteration-loop surfaces.

## Local development

```bash
npm install
npm run dev           # http://localhost:3000
npm run build
npm run lint
```

### Copy lint

```bash
npx tsx scripts/lint-copy.ts
```

Fails the build if any word from `src/content/forbidden-words.ts`
appears in `src/` or `docs/`.

## Adding a project

1. Create `src/content/projects/<slug>.ts` (see existing files).
2. Add one import line to `src/lib/projects/loader.ts`.
3. (Optional) Create `src/app/<slug>/page.tsx` and set
   `customPage: "/<slug>"` on the project metadata.

## Routes

| Route                       | What it is                                   |
| --------------------------- | -------------------------------------------- |
| `/`                         | Accordion landing + boot sequence            |
| `/about`                    | Biography, identity, beliefs, work ledger    |
| `/hivemind`                 | Bespoke dossier — strategic analytical software |
| `/purposeless-efficiency`   | Book page (serif surface)                    |
| `/theseus`                  | Principle graph + Noosphere console          |
| `/resume`                   | CV with print stylesheet + PDF link          |
| `/projects`                 | Sortable, filterable index                   |
| `/projects/[slug]`          | Generic dossier (redirects if custom page set) |
| `/changelog`                | Site changelog                               |
| `/styleguide`               | Developer-only token reference (unlinked)    |
| `*`                         | 404 in operator voice                        |

## Keyboard

- `⌘K` / `Ctrl+K` — command palette
- `F1` — help modal
- `←` / `→` — accordion focus
- `1`–`5` — expand accordion panel by index
- `Esc` — collapse accordion to neutral / close palette

## Deploy

Push to `main`. Vercel builds the Next.js app. See the legacy README
notes preserved below for Vercel / CI / sync-script specifics.

### Sync script

```bash
npm run sync
```

Runs `scripts/sync-to-github.sh`. Supports `SYNC_FORCE=1`,
`SYNC_SKIP_WATCH=1`, and `SYNC_SKIP_VERIFY=1` (skips the automatic
`npm run verify:ci` when `package.json` / `package-lock.json` changed).

Before pushing dependency changes, run **`npm run verify:ci`** locally (same steps as the `build` job in CI: clean install, lint, typecheck, copy/token lint, build). That catches Linux `npm ci` / lockfile drift before CI does.
