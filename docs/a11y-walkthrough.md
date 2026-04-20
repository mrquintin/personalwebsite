# Screen-reader walkthrough scripts

## VoiceOver (macOS)

1. Open `/`. After boot dismisses, focus should land on the skip-link
   "Skip to content."
2. Tab into the accordion. Each spine announces "button, expanded /
   collapsed, Open panel HVM — Hivemind."
3. Press Enter on a spine; the panel body becomes a `region` with the
   correct `aria-labelledby`.
4. ⌘K opens the palette. The dialog is announced. Type to filter.
   Arrow keys navigate; selected option is announced via
   `aria-activedescendant`.
5. F1 opens the help modal. Esc closes.

## Notes

- The boot overlay is `aria-hidden="true"`; AT users see the accordion
  immediately.
- Decorative box-drawing characters (`──`) are wrapped in `aria-hidden`
  where they appear without semantic meaning.
- Status bar has `role="status"` + `aria-live="polite"`. Ticker rotates
  every 8s; throttled to avoid spam.
