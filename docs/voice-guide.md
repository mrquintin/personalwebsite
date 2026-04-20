# Voice Guide

Copy is UI. Every string on this site signals the genre of the person
behind it. The work is serious; the voice must not embarrass the work.

## Ten principles

1. **Declarative over descriptive.** "Projects. 3 loaded." not "Check
   out some of the amazing projects I've been working on!" The first
   is a log entry. The second is an advertisement. This site is a log.

2. **No marketing adjectives.** Forbidden: revolutionary, game-changing,
   cutting-edge, seamless, effortless, empowering, delightful (unless
   ironic), passionate, synergy, ecosystem, leverage (verb), unlock,
   unleash, robust, innovative, thought-leader, visionary, disrupt,
   disruption. See `src/content/forbidden-words.ts`.

3. **No exclamation marks.** Except in boot/error states (`! disk
   full`), where they are a Unix convention.

4. **No emoji in chrome.** Emoji are allowed inside user-authored MDX
   prose only. Never in UI labels, button text, navigation, errors.

5. **ASCII and Unicode box-drawing as ornament.** `──` `··` `→` `↗` `⌘`
   `⎋` `⏎`. They do work that decoration cannot.

6. **All times are ISO-8601 UTC.** Relative time may appear as a suffix
   in parentheses: `2026-04-12 · 8d ago`.

7. **Buttons are verbs. Links are nouns.** Button: "Download PDF",
   "Copy email". Link: "hivemind.ai", "Book I". Never "Submit", "OK",
   or "Click here".

8. **Error copy is diagnostic, not apologetic.** "404. No file at
   /projects/foo. Try ⌘K to search." Not "Oh no!"

9. **Placeholders are not instructions.** "command or search" describes
   what the input holds. "Type here to search" patronizes.

10. **No 'we'.** The site is Michael's. Use "I" sparingly in
    biographical prose. Use no pronoun at all in UI copy where
    possible. Log-entry voice is person-less.

## Voice test (pick the operator)

| A                                       | B                                |
| --------------------------------------- | -------------------------------- |
| Grab my resume!                         | Download PDF                     |
| Welcome — let's build something amazing | session initialized · ⌘K to search |
| Sorry, that page is missing 😢          | 404. no file at /projects/foo    |

Operator is always the right column.
