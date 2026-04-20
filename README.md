# personalwebsite

**Live site (canonical):** [https://personalwebsite-beta-nine.vercel.app](https://personalwebsite-beta-nine.vercel.app)

> **Vercel — Root directory:** the repository root (`.`) — this is the “site directory” (the folder that contains the Next.js `package.json` Vercel must build). If the app is ever moved into a subfolder, set **Root Directory** in the Vercel project to that folder and update this README.

**Repository:** [github.com/mrquintin/personalwebsite](https://github.com/mrquintin/personalwebsite)

## What this is

- **Next.js** (App Router) at the repo root: `package.json`, `next.config.ts`, `src/`, and static assets under `public/`.
- **Legacy static pages** (HTML/CSS/JS) are served from `public/` (e.g. `public/index.html` at `/index.html`, `public/pages/…`). The **default route `/`** is rendered by `src/app`, not the static `index.html` in `public/`.
- **Do not** use a top-level `pages/` directory for static HTML — Next.js reserves that name for the [Pages Router](https://nextjs.org/docs/pages). Static HTML routes live under `public/pages/`.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (production)

Push to **`main`**. GitHub notifies Vercel; Vercel runs **`npm install`** (or uses the detected lockfile workflow) and **`npm run build`**, then serves the Next.js deployment.

- **Production branch:** `main`.
- **Framework:** Next.js (default **Build**: `next build`; **Output:** handled by Vercel — no static `output: "export"` here, so no custom output directory unless you change `next.config.ts`).
- **Environment variables:** none required for this app today. Add any future secrets under **Project → Settings → Environment Variables**. Prefix browser-exposed vars with **`NEXT_PUBLIC_`**.

## Sync to GitHub (one-shot)

From the repo root:

```bash
./scripts/sync-to-github.sh
```

Or:

```bash
npm run sync
```

**Behavior (summary):** resolves the current branch (on detached HEAD uses **`main`**), optionally removes stale `.git/*.lock` files when no process holds them, refuses a no-op push when you are already synced with **`origin`** (unless interactive **y** or **`SYNC_FORCE=1`**), commits pending changes with message **`Sync: latest changes`** when needed, pushes to **`origin`** (`mrquintin/personalwebsite`). After push, optionally watches the **`ci.yml`** workflow via **`gh`**, **`curl`**s the canonical URL from this README, and optionally checks GitHub Deployments for failure states.

| Variable             | Meaning |
|----------------------|---------|
| **`SYNC_FORCE=1`**   | Non-interactive: bypass the “already up to date, skip push” guard so scripts can proceed (still no push if there is literally nothing to push). |
| **`SYNC_SKIP_WATCH=1`** | Skip `gh run watch` for the CI workflow. |

**Cursor / VS Code:** run the task **“Sync to GitHub”** (`.vscode/tasks.json`).

## CI & dependencies

- **GitHub Actions:** `.github/workflows/ci.yml` — **name:** `CI` — runs on pushes to `main` and on pull requests (`npm ci`, `npm run lint`, `npm run build`).
- **Dependabot:** `.github/dependabot.yml` — npm and GitHub Actions updates on a weekly schedule.

## `vercel.json`

Not required for this setup (standard Next.js on Vercel). Add one later only if you need headers, redirects, or a non-default static export layout.

---

### Site directory (mental model)

| Term | Meaning here |
|------|----------------|
| **Site directory** | The folder Vercel uses as **Root Directory** — must contain **`package.json`** for the Next.js app. |
| **This repo** | **Root Directory = `.`** (repository root). |
