# v2 Ship Checklist (suite 22/P05)

> **The user's verbatim diagnosis:** "completely unusable."
>
> The v2 rebuild was scoped against that single sentence. The ship gate
> is therefore a definitional gate, not just a numeric one: v2 ships
> when this complaint is no longer defensible by an honest reading of
> the deployed site. If a fair, unfriendly visitor could still type
> "completely unusable" without obvious bad faith, **stop and fix —
> regardless of what `npm run ship-gate` reports.**

## How to use this checklist

1. Run `npm run ship-gate`. It must exit 0. (That covers the
   programmatic half — typecheck, build, primitive tests, e2e, ingest
   dry-run, microcopy lint, Lighthouse, axe, smoke, visual.)
2. Walk through every box below in order. The checklist is the human
   half — what scripts cannot verify.
3. Sign off at the bottom. **Do not auto-ship on a green ship-gate.**

---

## Manual review

### Content read-through

- [ ] Read every project page top to bottom. (Hivemind, Purposeless
      Efficiency, Theseus — every section, not just the hero.)
- [ ] Click through every presentation deck — every slide, forward
      and back, including any deep-linked slide URLs.
- [ ] Skim `/about`, `/resume`, the changelog, and the styleguide for
      stale copy or v1 ghosts.

### Chat (`/chat`)

- [ ] Send 5 different chat questions covering: a project detail, a
      resume fact, a philosophical/voice question, a vague open-ended
      question, and a question that requires multi-source synthesis.
      Verify citations appear on grounded answers.
- [ ] Send an out-of-scope question (e.g. "what's the weather in
      Berlin?"). Verify graceful refusal in voice — no apology
      cascade, no hallucinated answer.
- [ ] Send an empty submit, a 5,000-character submit, and a submit
      with markdown / code fences. Nothing breaks.
- [ ] Trigger an error path (e.g. unplug network mid-stream). The
      retry affordance shows and works.

### Theme + responsiveness

- [ ] Switch to light theme on every page; nothing breaks. Contrast
      still passes; no dark-mode-only colours leak through.
- [ ] Resize from 320 px to 1920 px on the landing, projects index,
      a project detail, `/chat`, and a presentation. No horizontal
      scroll, no clipped focus rings.

### Keyboard + a11y

- [ ] Use only the keyboard for 5 minutes across landing → projects
      → project detail → chat → presentation. No focus traps. Skip-
      link works on every page. Command palette opens on `cmd-k` /
      `ctrl-k` and is fully operable without a mouse.
- [ ] Run a screen reader (VoiceOver / NVDA) on `/`, `/projects`,
      `/chat`. Headings announce in order; live regions speak chat
      streams; nothing reads "button button button".

### Real-device sanity

- [ ] Open on a real iPhone: chat works, mobile drawer opens and
      closes, fonts render (no FOUT into Times New Roman), the
      keyboard does not cover the chat input, hit targets are large
      enough.
- [ ] Open on a real Android phone (Chrome). Same checks.
- [ ] Open in Safari desktop and Firefox desktop — the site is not
      Chrome-only.

### Social + share surfaces

- [ ] Share landing on Twitter / Slack / iMessage; OG card looks
      intentional (right title, right image, right description).
      Repeat for `/chat`, a project detail, a presentation deck.
- [ ] View source on `/`: title, description, canonical, OG, Twitter
      card meta are all present and correct.

### Performance — real-world

- [ ] Lighthouse mobile run on each route from a fresh tab (not just
      CI). Performance ≥ target on a real network throttled to Slow
      4G. Largest Contentful Paint feels snappy, not just measured.
- [ ] Cold-load the site on a phone over cellular. The first
      meaningful paint isn't a blank dark rectangle for >1 s.

### Voice + copy drift

- [ ] Open `docs/voice-guide.md` next to three random pages of copy.
      Flag any drift: forbidden words, mixed casing in chrome,
      exclamation marks outside the Unix-error convention, anything
      that would feel like marketing fluff to a hostile reader.
- [ ] All UI strings live in `src/content/microcopy.ts`. Spot-check
      by grepping `src/components/**/*.tsx` for string literals that
      look like user-facing copy and aren't pulled from microcopy.

### Final passes

- [ ] Open every page once with DevTools console visible. No errors,
      no warnings about missing keys, no hydration mismatches.
- [ ] Open the deployed URL in an incognito window. No leftover
      auth, no cached state. The first impression is the test.
- [ ] Re-read this checklist. Anything you skipped because "it's
      probably fine" — go check it.

---

## Sign-off

- [ ] User signed off.
