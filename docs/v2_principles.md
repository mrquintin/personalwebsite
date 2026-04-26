# v2 Design Principles

## Intent

The owner's verbatim verdict on v1 was that the site is "completely unusable" — visually expressive but illegible to anyone who is not already inside the author's head. v2 exists to correct that. The goal is unambiguous: a site a non-technical visitor can navigate, read, and converse with in under five minutes. Every principle below is written so that any future change either conforms or doesn't, and the document tells you which. Suites 13 through 22 must cite these principles by number when justifying decisions.

## The eleven principles

1. Pages, not panels.
   Visitors arrive at URLs and scroll. No accordions, no left-right reveal, no nested toggles. Each project gets a dedicated `/projects/<slug>` URL that loads its own document, with its own scroll position, its own back button.
   Falsified by: any v2 component that animates layout when the visitor selects a project.

2. Content first; chrome last.
   Every page leads with the content — heading and first paragraph — within the first 600 pixels of the viewport. Site chrome (header, nav) sits above the content as a thin band; ambient detail (footer notes, related links, decorative atmosphere) sits below. The visitor sees the point before they see the frame.
   Falsified by: a hero block that pushes the first paragraph below the fold.

3. One idea per screen.
   Presentations advance one teach-worthy idea per phase. No phase asks the visitor to track two new concepts at once. If a second concept is required, the prior one must be grounded in a concrete example before the new one is introduced.
   Falsified by: a phase introducing more than one new term without grounding the previous.

4. Words over widgets.
   v2 prefers prose with anchors and links over inline interactive widgets. A widget appears only when prose cannot convey the same point in fewer characters. The bar to add an interactive surface is high; the bar to delete one is low.
   Falsified by: a widget added when its caption could replace it.

5. The visitor can always leave.
   Every page exposes the same primary nav. There are no modal traps, no hover-only menus, no states the visitor can reach but not retreat from. Escape closes overlays. The browser back button always does what the visitor expects.
   Falsified by: a state that hides the global nav.

6. Mono is the body face for technical content; serif for long-form narrative.
   Code-adjacent content — terminal output, command palettes, technical project pitches, chat messages — uses the mono family. Essays, biographies, project narratives use the serif family. Headlines use mono. The typeface tells the visitor which mode they are in.
   Falsified by: serif inside a project-pitch or chat message; mono inside an essay paragraph.

7. Dark is default; light is supported.
   The site ships dark-first because the owner prefers it and the corpus reads better against dark, but a light variant exists and respects `prefers-color-scheme`. Both variants are designed, not derived.
   Falsified by: any dark-only color value not paired with a light counterpart in `tokens.css`.

8. Motion is functional, never decorative.
   Animations communicate state changes — page transition, message arrival, focus shift, error appearance. There is no parallax, no ambient drift, no unprompted motion. If a visitor cannot name what state changed, the animation should not exist.
   Falsified by: motion without a state change behind it.

9. The LLM-of-me has citations.
   The chat surface always shows which corpus chunks fed a given response. The LLM may be wrong, and the visitor must be able to judge. A response without citations is a response without provenance, and the surface refuses to render it as such.
   Falsified by: a chat response without a chunk-citation footer.

10. Reduced motion is a first-class path, not an afterthought.
    Every animation has a no-motion equivalent that ships the same information. Page transitions become instant. Streaming chat responses still stream — token-by-token text reveal is information, not motion — but layout shifts use opacity-only crossfades. The reduced-motion path is designed alongside the default, not bolted on.
    Falsified by: an animation with no equivalent under `prefers-reduced-motion: reduce`.

11. Mobile is not a downgrade.
    The narrow viewport gets the same content, the same navigation, the same chat. Layout flexes; content does not shrink or hide. A feature that only works on desktop is a feature that doesn't work.
    Falsified by: a section hidden on mobile, or a feature reachable only on desktop.

## How to use this document

Future v2 prompts must cite principles by number when justifying a decision. The citation is the contract: it tells the reviewer which rule is in play and lets them check the falsifiability clause directly.

Concrete example. Suite 17 proposes replacing the v1 "diamond method" interactive quadrant with a paragraph plus a static figure. The justification reads: *Per principle 4 (Words over widgets), the diamond widget is replaced by a paragraph because the same point — that purpose and efficiency form independent axes — fits in two sentences with a 200×200 SVG. The widget's caption already did the explanatory work; the widget itself was decorative interactivity.* That citation is sufficient. A reviewer who disagrees argues against principle 4, not against the diamond decision in isolation.
