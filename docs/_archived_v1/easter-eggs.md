# Easter eggs (currently shipped)

Document each so future maintenance does not strip them by accident.

- **404 page.** Operator-voice ASCII directory listing. `src/app/not-found.tsx`.
- **Boot sequence.** Plays once per session; skippable on any keypress
  or click. `src/components/boot/BootSequence.tsx`.
- **Accordion neutral state.** Press Escape on `/` to flatten the
  accordion to equal-width spines.
- **Accordion hover-expand.** Desktop only (>=768px, fine pointer).
- **Konami code.** ↑↑↓↓←→←→BA opens the palette and toasts
  "you have good taste. welcome." (`Palette.tsx`).
- **`clear`.** On `/`, type `clear` and Enter to flash "screen cleared."
  and reset the accordion to neutral. (`EasterEggs.tsx`)
- **⌘+Shift+T.** Hold to reveal an ASCII page outline overlay listing
  every H1/H2/H3 on the page. Release to dismiss. (`EasterEggs.tsx`)
- **`sudo`.** Prefix any palette query with `sudo ` to get a theatrical
  permission-granted toast before the command runs.
- **Late-night.** Between 00:00 and 06:00 local, a one-shot session
  flash reads "STATUS: late — respect your sleep."
- **Print stylesheet on /purposeless-efficiency.** Adds a folio line at
  the bottom of the printed page. `src/styles/print.css`.
