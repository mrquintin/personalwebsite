# Environment Variables and Secrets

Single source of truth for the env vars the v2 site consumes, where the
secrets come from, and how they get into local development. The schema
itself lives in [`src/lib/env.ts`](../src/lib/env.ts) and the example
file in [`.env.example`](../.env.example) lists every variable the app
reads.

> **Rule of thumb:** never read `process.env.*` directly. Import from
> `@/lib/env` instead. The validator throws a clear error if a required
> var is missing and refuses to hand server-only secrets to client code.

---

## 1. Variable reference

### Public site config — safe in the client bundle

| Name | Required | Default | Notes |
| ---- | -------- | ------- | ----- |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | `http://localhost:3000` | Used by `next-sitemap`, OG images, and absolute canonical URLs. Anything prefixed with `NEXT_PUBLIC_` is inlined into the client bundle by Next.js — never put a secret here. |

### LLM (Anthropic)

| Name | Required | Default | Notes |
| ---- | -------- | ------- | ----- |
| `ANTHROPIC_API_KEY` | yes | — | Server-only. Used by `src/lib/llm/anthropicClient.ts` to call the Messages API. |
| `LLM_MODEL` | no | `claude-opus-4-7` | Override the default model id (e.g. for evals against a smaller/faster model). |

### Embeddings

| Name | Required | Default | Notes |
| ---- | -------- | ------- | ----- |
| `EMBEDDER` | no | `voyage` | Selects the embedding provider. Allowed values: `voyage`, `openai`. |
| `VOYAGE_API_KEY` | iff `EMBEDDER=voyage` | — | Server-only. |
| `OPENAI_API_KEY` | iff `EMBEDDER=openai` | — | Server-only. Only needed when running the OpenAI fallback embedder. |

### Vector store (Vercel Postgres + pgvector)

| Name | Required | Default | Notes |
| ---- | -------- | ------- | ----- |
| `POSTGRES_URL` | yes | — | Pooled runtime connection. Used by app server code. |
| `POSTGRES_URL_NON_POOLING` | yes | — | Direct connection used by Drizzle migrations. |

### Rate limit (Vercel KV / Upstash Redis)

| Name | Required | Default | Notes |
| ---- | -------- | ------- | ----- |
| `KV_REST_API_URL` | yes | — | REST endpoint for the KV instance. |
| `KV_REST_API_TOKEN` | yes | — | Server-only token for the KV REST API. |

### LLM tuning

| Name | Required | Default | Notes |
| ---- | -------- | ------- | ----- |
| `LLM_RATE_LIMIT_HOUR` | no | `20` | Per-IP requests per hour for the chat endpoint. |
| `LLM_RATE_LIMIT_DAY` | no | `100` | Per-IP requests per day. |

---

## 2. Where each secret comes from

### Anthropic API key
1. Sign in to <https://console.anthropic.com>.
2. Open **Settings → API Keys → Create Key**. Pick the production
   workspace; do not reuse a personal key.
3. Copy the `sk-ant-...` value — it will not be shown again.
4. Set `ANTHROPIC_API_KEY` in Vercel (see §3) and in your local
   `.env.local`.

### Voyage embedding key
1. Sign in to <https://dash.voyageai.com>.
2. **API Keys → Create new key**.
3. Copy the `pa-...` value into `VOYAGE_API_KEY`.

### OpenAI embedding key (only if `EMBEDDER=openai`)
1. <https://platform.openai.com/api-keys> → **Create new secret key**.
2. Restrict the key to only the embeddings endpoint if your workspace
   supports scoped keys.
3. Copy the `sk-...` value into `OPENAI_API_KEY`.

### Vercel Postgres (with pgvector)
1. In the Vercel dashboard, open the project → **Storage → Create
   Database → Postgres**. Pick a region close to the Edge runtime your
   functions deploy to.
2. **Connect Database** → select the project. Vercel auto-injects
   `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, and friends into the
   project's Production / Preview / Development env scopes.
3. The first migration (`scripts/llm/migrate.ts`) runs
   `CREATE EXTENSION IF NOT EXISTS vector;`. On Vercel Postgres
   pgvector is preinstalled at the cluster level, so this is a no-op
   permission-wise. On self-hosted Postgres you must install the
   extension once at the cluster level before running migrations.

### Vercel KV (Upstash Redis)
1. **Storage → Create Database → KV**.
2. **Connect Database** → select the project. Vercel injects
   `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and the read-only variants
   into all three env scopes.
3. The rate limiter only needs the read/write `KV_REST_API_TOKEN`.

---

## 3. Syncing env vars to local development

The local source of truth is `.env.local`. It is gitignored. Do not
hand-edit it once you have a working Vercel setup — pull instead, so
the local file matches what is actually deployed.

```sh
# One-time
npm i -g vercel
vercel login
vercel link            # connect this folder to the Vercel project

# Pull the active env into .env.local
vercel env pull .env.local

# To pull a different scope (preview/production)
vercel env pull .env.local --environment=preview
```

If you do not have Vercel access, copy `.env.example` to `.env.local`
and fill in the placeholders by hand using the keys you obtained
above.

`.env.example` is committed; `.env.local`, `.env*.local`, and `.env`
are gitignored — see [`.gitignore`](../.gitignore).

---

## 4. Rotating a secret

If a secret has been exposed (committed accidentally, leaked in logs,
shared in a screenshot), assume it is compromised and rotate it
**before** you do anything else.

1. **Revoke immediately at the provider.** Do not wait until a new
   key is in place. A revoked key cannot be exploited; a "we'll
   rotate it later" key can.
   - Anthropic Console → **API Keys → … → Revoke**.
   - Voyage Dashboard → **API Keys → … → Delete**.
   - OpenAI → **API Keys → … → Revoke**.
   - Vercel Postgres / KV → **Storage → … → Settings → Reset
     credentials** (this rotates the connection strings/tokens).
2. **Issue a new key** at the same provider.
3. **Update Vercel:** Project → **Settings → Environment Variables**,
   replace the value across Production, Preview, and Development
   scopes.
4. **Redeploy** — env changes only take effect on new deployments.
   Trigger a fresh deploy on `main` (and any active preview branches
   that need the new value).
5. **Refresh local env:** `vercel env pull .env.local` so your dev
   shell stops using the dead key.
6. **Audit downstream:** if the exposed key is for Anthropic/OpenAI,
   skim recent usage on the provider dashboard for unfamiliar calls
   while the old key was live. If the key was committed to git,
   rotation is the fix — purging history does not retroactively
   protect a key that was already public.

---

## 5. How `src/lib/env.ts` enforces the rules

- The schema is defined with `zod`. Required fields with no default
  fail validation if missing, and the thrown error names the
  variable.
- `env` is a `Proxy`. Accessing `env.ANTHROPIC_API_KEY` from a client
  context (where `typeof window !== "undefined"`) throws before any
  `process.env` lookup, so a leaked import path cannot exfiltrate the
  value at runtime.
- Validation is memoized after the first successful access. If a
  required env var is missing in production, the first request that
  needs it surfaces a single, named error in the server logs.
- Tests can call `__resetEnvCacheForTests()` to clear the memo
  between cases — this helper is the only public override and is not
  intended for runtime code.
