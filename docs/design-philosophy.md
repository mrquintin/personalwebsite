# Design Philosophy — The Operator's Portfolio

This is not a designer portfolio. It is a workstation. On first paint, a
visitor should understand that the owner thinks for a living. The site
is a research terminal, a classified archive, a Unix prompt — never a
brochure.

## Reference aesthetics (blend, do not copy)

- **Bloomberg Terminal.** Dense panes, function-key references, status
  bars, amber-on-near-black, ticker rhythms. Information is the
  ornament.
- **Palantir Gotham / Foundry.** Classified-document gravity. A
  low-chroma grey base with a single sharp accent. Monospace for data,
  Inter for prose, never decorative.
- **Unix Terminal.** Monospace prompt, blinking cursor, ASCII dividers,
  file paths as navigation. The page is a shell, not a poster.

## Principles

1. **Information is the ornament.** No gradients, no shadows deeper than
   1px hairlines, no rounded corners above 2px, no glassmorphism, no
   stock illustrations, no emoji in chrome. Visual weight comes from
   data, typography, or rule lines.

2. **Density with breath.** The page is dense but never cramped. Use the
   8/12/16/24/32/48/64/96 pixel spacing scale. Let lines of text be
   long (70–95ch) — readers read.

3. **Monospace is the default for structure.** Metadata, labels,
   navigation, numbers, code, and any UI chrome use a monospace
   typeface. Prose uses a humanist sans. Serif appears only inside the
   book project — nowhere else. This tri-face discipline is
   load-bearing.

4. **One accent.** Exactly one chromatic accent. Everything else is
   greyscale. Accent is for the cursor, the active state, the current
   location indicator, a single numeric highlight. Never body text,
   never decoration.

5. **Terminal rhythms.** Horizontal rules drawn with ASCII box-drawing
   characters where it does not harm accessibility. Status lines top
   and bottom. File-path breadcrumbs. Timestamps in ISO-8601.

6. **Keyboard is first class.** Every interactive element has a visible
   keyboard shortcut hint and a focus ring (2px solid accent + 2px
   inner offset). Unapologetic.

7. **Motion is functional, never ornamental.** No parallax. No
   scroll-jacking. No reveal-on-scroll fades. Motion is reserved for
   state transitions, the cursor blink, the accordion expansion, the
   boot sequence, and flash-on-change in data panes. Every animation
   respects `prefers-reduced-motion`.

## Worked example: a project detail header

```
─── DOSSIER :: HVM · HIVEMIND ─────────────────────── UNCLASSIFIED
~/projects/hivemind/README
Strategic analytical software.
```

- The rule is drawn with `─` characters extended across the row.
- `DOSSIER ::` and the panel code (`HVM`) are monospace, `--fg-mute`.
- Title (`HIVEMIND`) is monospace, `--fg-hi`.
- Classification right-aligned, monospace, `--fg-mute`. The value is
  semantic: `UNCLASSIFIED`, `CONTROLLED UNCLASSIFIED`, `CONFIDENTIAL`.
- Breadcrumb is a real file path. Each segment navigates upward.
- Subtitle is one declarative sentence, `--fg-dim`. No tagline-speak.

## Forbidden patterns

- Gradients, glassmorphism, drop shadows beyond 1px hairlines.
- Rounded corners > 2px. Default radius is 0.
- Emoji in chrome (allowed in user-authored MDX prose only).
- Tagline-speak: "Building things that matter." "Where ideas come
  alive." Delete on sight.
- Stock illustrations, 3D book mockups, parallax, scroll-jacking.
- Auto-playing video with sound. Auto-playing audio.
- Splash modals. Cookie banners that block content. (The site sets no
  cookies. There is nothing to consent to.)
- Marketing adjectives. See `docs/voice-guide.md`.

The discipline is not minimalism for its own sake. It is the visual
consequence of caring about what the visitor reads.

## v2 status: under revision (suite 13/20 updates this)
