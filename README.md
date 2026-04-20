# The Nash Lab

A research company for strategy. This repository ships the marketing site
for **Hivemind**, a multi-agent AI that replaces consulting engagements
with peer-reviewed, auditable strategic analysis.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm run typecheck
```

## Deploy to Vercel

One-click: import the repo at https://vercel.com/new — Vercel detects
Next.js and ships with no config.

CLI:
```bash
npx vercel       # preview
npx vercel --prod
```

`vercel.json` already sets the security headers (X-Content-Type-Options,
X-Frame-Options, Referrer-Policy).

## Routes

| Route             | Purpose                                                            |
| ----------------- | ------------------------------------------------------------------ |
| `/`               | Landing — Hero, Four Failures, Demo, Architecture, Audiences, CTA  |
| `/architecture`   | Long-form technical brief                                          |
| `/company`        | About + Core Beliefs + Hiring + Contact                            |
| `/investors`      | Pitch + 6 pillars + Request the deck                               |
| `/demo`           | Demo request form                                                  |
| `/waitlist`       | Individual / small-org waitlist                                    |
| `/api/submit`     | POST endpoint for all three forms                                  |
| `/sitemap.xml`    | Auto-generated                                                     |
| `/robots.txt`     | Auto-generated                                                     |

## Form environment variables

All three are optional. Without any of them, submissions are still
console.logged and the user receives `{ ok: true }`.

| Var                | Purpose                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `FORM_WEBHOOK_URL` | If set, every payload is POSTed here. Errors swallowed.            |
| `RESEND_API_KEY`   | Plus `NOTIFY_TO_EMAIL`, sends a plain-text summary via Resend.     |
| `NOTIFY_TO_EMAIL`  | Destination address for the Resend summary.                        |

## Customizing

| What                 | Where                                                          |
| -------------------- | -------------------------------------------------------------- |
| Hero subhead         | `components/Hero.tsx` — `SUBHEAD` constant                     |
| Demo scenarios       | `lib/scenarios.ts`                                             |
| Five components copy | `components/Architecture.tsx` — `COMPONENTS`                   |
| Four failures copy   | `components/FourFailures.tsx` — `FAILURES`                     |
| Core beliefs         | `components/CoreBeliefs.tsx` — `BELIEFS`                       |
| Hiring procedures    | `app/company/page.tsx` — `HIRING`                              |
| Investor pillars     | `app/investors/page.tsx` — `PILLARS`                           |
| Audience cards       | `components/AudienceSplit.tsx` — `CARDS`                       |
| Theorist roster      | `lib/scenarios.ts` — `THEORIST_DB`                             |
| Colors               | `tailwind.config.ts` + `app/globals.css` `:root`               |
| Typography           | `tailwind.config.ts` `fontFamily`, `fontSize`                  |
| Form fields          | `components/{Demo,Investor,Waitlist}Form.tsx` — `FIELDS`       |
| OG image             | `app/opengraph-image.tsx`                                      |
| Favicon              | `app/icon.svg`                                                 |

## Project layout

```
app/
  api/submit/route.ts       form receiver
  architecture/page.tsx
  company/page.tsx
  demo/page.tsx
  investors/page.tsx
  waitlist/page.tsx
  globals.css               tokens + utilities (.eyebrow, .marquee, .noise…)
  icon.svg                  favicon
  layout.tsx                root layout — Nav / Footer / metadata
  opengraph-image.tsx       1200×630 OG card
  page.tsx                  landing composition
  robots.ts                 robots.txt
  sitemap.ts                sitemap.xml
components/
  Architecture.tsx
  AudienceSplit.tsx
  CoreBeliefs.tsx
  CTABand.tsx
  DemoForm.tsx | InvestorForm.tsx | WaitlistForm.tsx
  DemoGraph.tsx             SVG visualization for the demo
  Footer.tsx
  Form.tsx                  reusable form primitive
  FourFailures.tsx
  Hero.tsx
  HivemindDemo.tsx          demo orchestrator (state machine)
  Nav.tsx
  NetworkBackground.tsx     canvas drifting-nodes background
  TheoristsRail.tsx         marquee of theorists
  Wordmark.tsx              hex+network mark
lib/
  scenarios.ts              three scripted demo scenarios
public/
  .gitkeep                  drop-in for OG/favicons later
```

## Notes

- **Reduced motion.** Shimmer, marquee, and `NetworkBackground` animation
  all respect `prefers-reduced-motion: reduce`.
- **No browser storage.** The site sets no cookies and uses no
  localStorage / sessionStorage.
- **Demo is scripted.** `HivemindDemo` runs against the data in
  `lib/scenarios.ts`, not a live model. The state machine, transcript,
  and audit trail are real; the substantive content is hand-authored.
- **Operator site archive.** A prior iteration of this repo (Next 15
  operator-aesthetic accordion site) lives under `_archive_operator/`
  for reference.
