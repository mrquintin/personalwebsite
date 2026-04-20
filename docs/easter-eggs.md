# Easter eggs (currently shipped)

Document each so future maintenance does not strip them by accident.

- **404 page.** A deliberate ASCII directory listing in operator voice.
  Source: `src/app/not-found.tsx`.
- **Boot sequence.** Plays once per session; skippable on any keypress
  or click. Source: `src/components/boot/BootSequence.tsx`.
- **Accordion neutral state.** Press Escape on `/` to flatten the
  accordion to equal-width spines.
- **Print stylesheet on /purposeless-efficiency.** Adds a small folio
  line at the bottom of the printed page (`I · Purposeless Efficiency
  · Michael Quintin`). Source: `src/styles/print.css`.

Not yet shipped (see prompt 12 for spec): Konami code, `clear` command,
hold ⌘+Shift+T overlay, palette `sudo`, time-based late-night status.
