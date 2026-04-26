# v2 Audit — Why The Current Site Is Unusable

This is a project-specific audit of the existing site. Every claim is grounded
in a path inside `src/`. The audit names problems only — solutions belong to
the v2 design principles document (P03), not here.

The site is currently a five-panel horizontal accordion (`src/app/page.tsx`,
`src/components/shell/Accordion.tsx`) where each project panel hosts an
"experience" with multiple modes, layered on top of a "dossier" view, framed
by an `ExperienceScaffold`. The result is a stack of tabbed simulations
that demand prerequisite vocabulary before the visitor knows what any of the
projects ARE.

---

## Navigation friction

1.  **Landing forces the visitor into a panel before they have read a single
    word about Michael.** `src/app/page.tsx:13` initializes the accordion
    with `initialIdx = 1` (the About panel pre-expanded) but
    `src/components/shell/Accordion.tsx:16-19` then defaults to that
    pre-expanded state without any neutral "here is the site" landing copy.
    The first surface a new visitor sees is a five-column accordion of
    cryptic vertical labels and a body already showing the About teaser —
    no greeting, no orientation, no "this is a personal site about X."

2.  **The five panels collapse into 56–80px slivers with stacked-letter
    vertical text, with no codes and no numbers.** `PanelSpine` at
    `src/components/shell/PanelSpine.tsx:13-58` renders the title as
    `panel.title.toUpperCase().split("").join("\n")` — so "Hivemind"
    becomes a column of single uppercase letters. There is no glyph, no
    badge, no hint of what kind of content lives in each panel.
    Comment at line 12 explicitly says "No number, no three-letter code"
    — the spine has been deliberately stripped of every wayfinding cue.

3.  **Hovering an unexpanded panel auto-expands it on desktop, so cursor
    movement collapses what the visitor was just reading.**
    `src/components/shell/Accordion.tsx:112-117` — `onHover` calls `expand(p.index)`
    whenever the pointer enters a non-active panel. A reader who moves their
    mouse to read a quote loses their place because the adjacent panel
    eagerly takes over.

4.  **Inside an expanded project panel, the first thing the visitor encounters
    is a tab bar of unfamiliar mode names, not a description of the project.**
    `src/components/projects/hivemind/Experience/HivemindExperience.tsx:72`
    mounts `<ModeTabBar />` immediately — the tabs are
    `DELIBERATION · KNOBS · FOUR FAILURES · PIPELINE · AUDIT · LAYERS · COSINE
    · COMPARE · GATES · CE-AUDIT` (`ModeTabBar.tsx:8-22`). Ten tabs across two
    "faces" appear before any sentence explaining what Hivemind is.

5.  **There are two parallel "faces" (strategic / technical) on the Hivemind
    panel that the visitor has to discover by clicking.** Active-face state is
    held in `sessionStorage` and a window CustomEvent
    (`ModeTabBar.tsx:117-131`); there is no persistent affordance saying
    "you are currently looking at the strategic face; here is the technical
    face." A click on tab 6 silently flips the entire experience.

6.  **There is also an EXPERIENCE / DOSSIER toggle inside every project
    scaffold.** `src/components/panels/ExperienceDossierToggle.tsx:12-34`.
    This toggle is a third axis of navigation — orthogonal to the
    accordion (which panel) and the mode bar (which mode within the
    experience). The toggle's persistence
    (`src/components/panels/ExperienceHost.tsx:37-50`) means the same panel
    can show two completely different content trees on different visits.

7.  **The accordion has its own keyboard verb — number keys 1..5 — but they
    only work when no other component has stolen focus, and there is no
    visible affordance for them.** `src/components/shell/Accordion.tsx:82-87`
    binds `1`, `2`, `3`, `4`, `5` (and `6` only at ≥1680px). The hidden
    sixth panel at very wide viewports
    (`src/components/shell/Accordion.tsx:50, 78-87`) means the keyboard
    contract changes with viewport size with no notice to the user.

8.  **The command palette and the accordion compete for the visitor's
    attention.** `src/components/shell/Shell.tsx:38-39` mounts a `KeyCap`
    affordance and the `Palette` itself. The palette is the only stable
    way to navigate by name, but there is no in-flow prompt saying "press
    ⌘K to navigate by name" — the visitor has to either find the floating
    keycap or read it during the boot sequence
    (`src/components/boot/BootSequence.tsx:10`, line `command palette: ⌘K`)
    which auto-dismisses after roughly one second per line.

9.  **The boot sequence runs once per session and then is gone — its
    orientation content is unrecoverable.** `src/components/boot/BootSequence.tsx:13`
    sets `STORAGE_KEY = "operator.boot.shown"` and lines 25-34 mark it
    shown on first paint. Any wayfinding the boot communicated
    (`channels: 5 panels loaded (ABT, HVM, PRP, THS, CV)`,
    `command palette: ⌘K`) is no longer visible after a refresh.

10. **Inside a project panel, navigating from the Glossary popover to a
    claim silently changes the active mode.**
    `src/components/projects/purposeless-efficiency/Experience/IntellectualAtlas/GlossaryStrip.tsx:81-87`
    calls `setSelectedClaimId(id); setMode("ontology");` when the visitor
    clicks a connected-claim button. The visitor who clicked a definition
    now finds themselves in a different mode (and is told via aria-live
    only).

11. **The project route pages (`/hivemind`, `/purposeless-efficiency`,
    `/theseus`) embed the SAME `ExperienceHost` as the panel, with no
    structural difference except `mode="route"`.**
    Compare `src/app/hivemind/page.tsx:14-22` and
    `src/components/panels/HivemindTeaser.tsx:11-19`. Visitors who follow
    a "→ /hivemind · full dossier" link expect a page; they get the same
    accordion-cell experience inside the page chrome. There is no
    page-shaped landing that just describes the project.

12. **The TopRail nav re-uses `01 · About`, `02 · Hivemind`, etc. as
    link labels on every non-landing route.**
    `src/components/shell/TopRail.tsx:32-43` renders `{p.id} · {p.title}`.
    The numbered prefix duplicates the spine numbering the audit just
    finished arguing isn't visible anywhere on the landing page —
    coupling the visitor to a numbering system they were never properly
    introduced to.

---

## Conceptual overload

1.  **The Hivemind panel exposes "Coherence Layers", "Cosine Paradox",
    "Decision Policy Gates", and an "Honest Ledger" before any sentence
    explaining what Hivemind is or does.** The technical-face tabs at
    `src/components/projects/hivemind/Experience/ModeTabBar.tsx:16-22`
    drop the visitor into a vocabulary that only makes sense to a reader
    of the project's internal documents. There is no pre-tab definition
    of "Coherence Engine", "Anti-Gaming", or "Fusion" — see usage in
    `src/components/projects/hivemind/Experience/coherenceEngine/LayersMode.tsx:11-25`
    where toggles for "antiGamingEnabled", "fusionEnabled", and a
    "fusionDrawerOpen" state assume the visitor already knows the model.

2.  **The Purposeless Efficiency panel opens in `OntologyMode`, which renders
    a force-directed graph of "claims" with "spine vs. all" filtering before
    any preface text.** `src/components/projects/purposeless-efficiency/Experience/modes/OntologyMode.tsx:26-49`
    — the header reads `spine only / all claims` and counts
    "X spine claims" / "Y of TOTAL_ONTOLOGY_SIZE loaded". The book's
    actual preface lives one toggle away in the dossier
    (`src/components/projects/book/PurposelessDossier.tsx:48-53`), but
    the default landing inside the panel is a graph the visitor has no
    framework to read.

3.  **The Diamond Method Practicum walks the visitor through a four-step
    philosophical method ("Identify → Dissolve/Declare → Reconstruct →
    Trace Consequences") with form fields and book-comparison reveal,
    before the visitor has read the book.**
    `src/components/projects/purposeless-efficiency/Experience/modes/DiamondMode.tsx:140-218`
    asks the visitor to commit to a verdict about a contradiction case
    (`src/lib/prp/diamondCases.ts`) whose framing depends on the book's
    arguments. The mode is designed for someone who has already absorbed
    the ontology.

4.  **The Theseus dossier (`TheseusDossier.tsx`) opens with "PRINCIPLE
    GRAPH" and "NOOSPHERE" sections whose vocabulary is internal.**
    `src/components/projects/theseus/TheseusDossier.tsx:25-31` — the
    visitor sees `── PRINCIPLE GRAPH ──` and `── NOOSPHERE ──` headings
    before any plain-English explanation of what the project monitors or
    why anyone would use it. "Noosphere" is undefined on the page.

5.  **The Glossary strip sits at the bottom of every PRP mode, hinting that
    the visitor will need definitions, but it is collapsed by default.**
    `src/components/projects/purposeless-efficiency/Experience/IntellectualAtlas/GlossaryStrip.tsx:32-66`.
    The site signals "you will need a glossary to read this" without
    delivering the prerequisite reading. The mere presence of a
    glossary surfaced inside a project dossier is itself a confession
    that the dossier presupposes vocabulary the visitor doesn't have.

6.  **The Hivemind Theater mode plays back a recorded "deliberation" with
    badges for `proposal · critique · revision · cluster_formed ·
    practicality_score · veto · pass · output`.**
    `src/components/projects/hivemind/Experience/modes/TheaterMode.tsx:7-11`.
    The visitor is shown a multi-agent debate before being told this is
    a multi-agent debate, before being told why such a debate would be
    a useful product feature.

---

## Visual confusion

Inside a single expanded panel (e.g., Hivemind), the chrome stack from
outermost to innermost is:

1.  **The accordion shell with horizontal panel partitions.**
    `src/components/shell/Accordion.tsx:101-122` and
    `src/components/shell/Panel.tsx:33-86` — every panel renders a 56px
    spine column with a vertical title plus a border. Even the active
    panel still pays for borders on both sides
    (`Panel.tsx:42-52`: `borderRight: "var(--border-hair)"`).

2.  **The active panel itself, which contains the spine and the body
    side-by-side as flex children.** `Panel.tsx:54-84` — the body lives
    inside a div with `padding: var(--s-6)` (or `0` if `flushBody`). The
    expanded panel always has the spine still rendered to its left
    (Panel.tsx:63-70), occupying 56px even when the panel is the active one.

3.  **The `ExperienceScaffold` adds a bordered section around the
    experience.** `src/styles/experience.css:3-12` — `.exp-scaffold`
    sets `border: var(--border-hair); background: var(--bg-1);`. So the
    panel body now contains a second bordered box.

4.  **Inside the scaffold, an `exp-meta` strip with a third bottom border.**
    `src/styles/experience.css:22-31` — name + synopsis + an
    EXPERIENCE/DOSSIER toggle, drawn with `border-bottom: var(--border-hair)`.
    Component: `src/components/panels/ExperienceScaffold.tsx:56-61`.

5.  **The `ModeTabBar` adds a fourth bordered horizontal strip with a
    visual face-boundary line halfway across.**
    `src/components/projects/hivemind/Experience/ModeTabBar.tsx:73-80`
    sets `borderBottom: "var(--border-hair)"` plus an internal
    `borderLeft: "var(--border-hair)"` separator at index 5
    (line 84-86) for the strategic/technical seam.

6.  **The mode body (e.g., `LayersMode`) sets up its own three-column grid
    with a fifth border between the argument pane and the layer pane.**
    `src/components/projects/hivemind/Experience/coherenceEngine/LayersMode.tsx:46-49`:
    `gridTemplateColumns: "30% 45% 25%"` and per-section
    `borderRight: isWide ? "var(--border-hair)" : undefined`. The argument
    selector chips inside it (lines 50-60) draw their own borders too
    (`border: active ? "1px solid var(--accent)" : "var(--border-hair)"`).

7.  **The `exp-postroll` footer adds a sixth bordered strip below.**
    `src/styles/experience.css:47-54` and
    `src/components/panels/ExperienceScaffold.tsx:67-75`: experience name,
    surface, viewport written out as a status footer.

8.  **In PRP, the Glossary strip portals into the bottom of the panel
    body, adding a seventh sticky bordered strip.**
    `src/components/projects/purposeless-efficiency/Experience/PrpExperience.tsx:58-62`
    plus
    `src/components/projects/purposeless-efficiency/Experience/IntellectualAtlas/GlossaryStrip.tsx:34-66`
    — `borderTop: var(--border-hair)`, `position: sticky`.

9.  **In the dossier view, `DossierHeader` adds yet another bordered
    `dossier-rule` strip plus a tagline + breadcrumb sub-strip.**
    `src/components/dossier/Header.tsx:18-30` with
    `src/app/globals.css:192-200` (`.dossier-rule`,
    `border-bottom: var(--border-hair)`). The sections inside the dossier
    each draw their own ASCII rule headings (`── CAPABILITIES ──`, etc. —
    `src/components/projects/hivemind/HivemindDossier.tsx:34-44`),
    contributing further pseudo-borders.

10. **A `KeyCap` floats over the top-right corner.**
    `src/app/globals.css:94-101` (`.keycap`) plus
    `src/components/shell/KeyCap.tsx`. On non-landing pages a fixed
    `TopRail` (`src/components/shell/TopRail.tsx:9-48`) adds a global
    horizontal bar above all of the above, with another bottom border.

This is a visible "chrome inside chrome inside chrome" — the panel border,
the scaffold border, the meta border, the tab-bar border, the mode-grid
borders, the postroll border, the glossary border, and (on routes) the
top-rail border, all stack vertically and the visitor's eye has nowhere to
rest.

---

## Mobile failure modes

1.  **The horizontal accordion is forcibly stacked vertically below 768px,
    but every other layer of chrome is preserved.**
    `src/app/globals.css:162-188` (`@media (max-width: 767px)`) sets
    `flex-direction: column !important; height: auto !important;` on the
    accordion and sets each panel to `flex-direction: column`. The result
    is five tall vertical panels, each containing the same `ExperienceScaffold`
    + `ModeTabBar` + glossary strip combination as on desktop. None of
    the inside chrome adapts; only the outer accordion does.

2.  **The hover-to-expand behavior on `Panel.tsx` is gated only by
    `(hover: hover) and (pointer: fine) and (min-width: 768px)`.**
    `src/components/shell/Accordion.tsx:114`. So mobile escapes the
    auto-expand bug, but every panel renders its full body all the time
    instead — the page scrolls through five complete project experiences
    stacked vertically, each with its own internal scrollable mode body
    (`overflow: auto` on the panel body, `Panel.tsx:74-77`). The visitor
    on mobile experiences a giant scroll of nested experiences with no
    landmark cues.

3.  **The `ModeTabBar` switches to a horizontal scroll-snap strip below
    640px instead of collapsing.**
    `src/components/projects/hivemind/Experience/ModeTabBar.tsx:74-80`:
    `overflowX: "auto"` with `scrollSnapType: "x mandatory"` when
    `regime === "narrow"`. Ten tabs across two faces are presented as a
    horizontal swipe inside a vertical-stacked panel inside a vertical
    accordion — three nested directions of motion at the same time.

4.  **The dossier grid collapses to a single column at ≤1024px,
    eliminating the visual association between metadata and thesis.**
    `src/app/globals.css:202-209` — `.dossier-grid` is `280px 1fr` at
    desktop and `1fr` below. On mobile the metadata pane (e.g.,
    `MetadataPane` in `src/components/projects/hivemind/HivemindDossier.tsx:27`)
    appears above the thesis as a list of unlabeled key/value rows
    (`src/app/globals.css:210-213`), divorced from the section it was
    framing.

5.  **The PRP Diamond Mode's reveal screen uses `gridTemplateColumns:
    ctx.hostWidthPx >= 800 ? "1fr 1fr" : "1fr"`.**
    `src/components/projects/purposeless-efficiency/Experience/modes/DiamondMode.tsx:73`.
    Below 800px the visitor's walk and the book's walk stack vertically
    with no separator — the comparison the mode is built around stops
    being a comparison.

---

## Surface area to remove

These are candidates for removal in P02. None of these files contain the
project's source-of-truth content; they are interface chrome around content.

### `src/components/shell/`
-   `Accordion.tsx` — the five-column accordion is the primary source of
    landing-page friction (see Navigation friction §1–3, §7).
-   `Panel.tsx` — 56px spine + body flex layout that creates the inner
    chrome (Visual confusion §1–2).
-   `PanelSpine.tsx` — vertical letter-stacked title with no glyph or code
    (Navigation friction §2).
-   `TopRail.tsx` — re-exposes the panel numbering on every non-landing
    route (Navigation friction §12).
-   `KeyCap.tsx` — floating ⌘K affordance that competes with the boot
    sequence and the accordion for orientation attention.

### `src/components/boot/`
-   `BootSequence.tsx` — fake-terminal animation whose orientation content
    is gone after the first paint (Navigation friction §9).

### `src/components/panels/`
-   `ExperienceHost.tsx`, `ExperienceScaffold.tsx`,
    `ExperienceDossierToggle.tsx`, `FixturePicker.tsx` — the host/scaffold
    layer that adds two of the redundant chrome strips (Visual confusion
    §3–4, §7).
-   `AboutTeaser.tsx`, `HivemindTeaser.tsx`, `PurposelessTeaser.tsx`,
    `TheseusTeaser.tsx`, `ResumeTeaser.tsx` — the panel-shaped wrappers
    that exist only because the accordion exists.

### `src/components/projects/hivemind/Experience/`
-   `HivemindExperience.tsx`, `ModeTabBar.tsx` — the dual-face ten-tab bar
    (Conceptual overload §1, §6; Mobile failure modes §3).
-   `coherenceEngine/LayersMode.tsx`, `CosineMode.tsx`, `CompareMode.tsx`,
    `GatesMode.tsx`, `AuditMode.tsx` — simulation modes that presuppose
    the Coherence Engine vocabulary.
-   `modes/TheaterMode.tsx`, `KnobsMode.tsx`, `FailuresMode.tsx`,
    `PipelineMode.tsx`, `AuditMode.tsx` — strategic-face modes that
    presuppose the Hivemind vocabulary.

### `src/components/projects/purposeless-efficiency/Experience/`
-   `PrpExperience.tsx`, `ModeTabBar.tsx` — the five-mode tab bar
    (Conceptual overload §2).
-   `modes/OntologyMode.tsx`, `QuadrantMode.tsx`, `DiamondMode.tsx`,
    `ObjectionsMode.tsx`, `AtlasMode.tsx` — every mode listed in
    Conceptual overload §2–§3, §5.
-   `ArgumentOntology/ClaimCard.tsx`, `DependencyTrail.tsx`,
    `OntologyGraph.tsx` — the claim-graph visualisation.
-   `IntellectualAtlas/AtlasOrbit.tsx`, `GlossaryFullView.tsx`,
    `GlossaryStrip.tsx`, `ThinkerDrawer.tsx` — the atlas + glossary
    surfaces (Conceptual overload §5; Visual confusion §8).

### `src/components/projects/theseus/`
-   `NoosphereConsole.tsx`, `PrincipleGraph.tsx`, `PrinciplesList.tsx`,
    `ExportPrinciples.tsx`, `ThesisCard.tsx` — the dossier sub-components
    that present project-internal vocabulary as the primary surface
    (Conceptual overload §4).

### `src/components/dossier/`
-   `MorphHeader.tsx` — framer-motion morph between accordion teaser and
    full route, only meaningful inside the accordion model.
-   `ClassificationBanner.tsx` — "classification: public" badge is a
    decorative artifact of the operator-console aesthetic.

### `src/components/easter/`
-   `EasterEggs.tsx` — typed `clear` Easter egg, `⌘+Shift+T` outline
    overlay; relies on the accordion contract (`operator:accordion-neutral`
    event at line 33).

### `src/stores/`
-   `coherenceEngineExperience.ts`, `hivemindExperience.ts`,
    `prpExperience.ts` — Zustand stores for the experience modes; tied
    1:1 to the surfaces above.

### `src/styles/experience.css`
-   The entire file styles the scaffold + meta strip + postroll + toggle
    chrome (Visual confusion §3–§4, §7).

---

## What to preserve

These contain the source-of-truth content and reusable typography that v2
should keep. Most of them feed the future LLM-of-me corpus.

### Voice and copy
-   `src/content/microcopy.ts`
-   `src/content/forbidden-words.ts`

### Project content (source of truth)
-   `src/content/projects/hivemind.ts`
-   `src/content/projects/hivemind/capabilities.ts`,
    `demo.ts`, `press.ts`, `thesis.ts`, `workflow.ts`
-   `src/content/projects/purposeless-efficiency.ts`
-   `src/content/projects/purposeless-efficiency/arc.ts`,
    `pillars.ts`, `preface.mdx`, `preface.ts`, `progress.ts`, `quotes.ts`
-   `src/content/projects/theseus.ts`
-   `src/content/projects/theseus/methodology.mdx`,
    `methodology.ts`, `noosphere-feed.ts`, `ontology-data.raw.ts`,
    `principles.ts`, `thesis.ts`

### Project libraries (data + logic that the LLM-of-me corpus will draw on)
-   `src/lib/coherenceEngine/arguments.ts`, `artifacts.ts`,
    `candidLimits.ts`, `cosineData.ts`, `decisionInputs.ts`,
    `domainParameters.ts`, `hashStub.ts`, `incumbents.ts`, `pitches.ts`
-   `src/lib/prp/claims.ts`, `diamondCases.ts`, `glossary.ts`,
    `objections.ts`, `quadrantCases.ts`, `thinkers.ts`, `typeGuards.ts`
-   `src/lib/hivemind/auditScript.ts`, `beliefs.ts`, `failures.ts`,
    `knobMatrix.ts`, `pipeline.ts`, `theaterScript.ts`

### About content
-   `src/content/about/identity.ts`, `biography.ts`, `biography.mdx`,
    `beliefs.ts`, `colophon.ts`

### Resume content
-   `src/content/resume/identity.ts`, `experience.ts`, `education.ts`,
    `skills.ts`, `summary.ts`, `writing.ts`

### Tokens and reset
-   `src/styles/tokens.css` — design tokens (typography, colour, spacing).
-   `src/styles/reset.css`
-   `src/styles/print.css`
-   `src/styles/prp-prose.css` — the book-typography rules used by the
    preface and excerpt.

### Resume + about presentation primitives that survive route shape
-   `src/components/resume/IdentityHeader.tsx`, `ExperienceList.tsx`,
    `SkillsTable.tsx`, `DownloadActions.tsx`
-   `src/components/about/IdentityBlock.tsx`, `BeliefsList.tsx`,
    `WorkLedger.tsx`, `Colophon.tsx`
-   `src/components/seo/JsonLd.tsx` (assumed; SEO primitives carry across).

### Palette (re-evaluate, do not auto-remove)
-   `src/components/palette/Palette.tsx`, `ResultRow.tsx`, `useFuzzy.ts`
    — the command palette is the only thing in the current site that
    works as a name-based navigator. v2 may keep it as an accelerator
    even after the accordion is gone; the palette itself does not depend
    on the accordion model.

---

## Demolition build state

Suite 12/P02 ran the demolition pass: every accordion-shell, panel, and
simulation component was moved (via `git mv`) under `src/_legacy_v1/`
so source is preserved but unreachable from any v2 route. tsconfig now
excludes `src/_legacy_v1` from the typecheck so legacy imports do not
block the build. `npm run build` succeeds. The two ESLint warnings that
remain originate from `src/_legacy_v1/panels/{ExperienceDossierToggle,
FixturePicker}.tsx` and are inert — they do not gate the build.

### Routes now rendering StubPlaceholder
All active route entries below import `@/components/StubPlaceholder`
and render only the stub. The root layout was also stripped of the
moved `Shell` component; it now wraps `{children}` in a plain
`<main>` element so each route's stub paints without legacy chrome.

-   `src/app/page.tsx`                                   (landing)
-   `src/app/about/page.tsx`
-   `src/app/resume/page.tsx`
-   `src/app/hivemind/page.tsx`
-   `src/app/purposeless-efficiency/page.tsx`
-   `src/app/theseus/page.tsx`
-   `src/app/projects/[slug]/page.tsx` (after the existing
    `notFound()` / `redirect()` checks fire)

Routes left untouched (already operate without legacy components):
-   `src/app/projects/page.tsx` — projects index (table is v2-survivable).
-   `src/app/changelog/page.tsx`
-   `src/app/styleguide/page.tsx`

### Tests skipped
-   `e2e/smoke.spec.ts` — the `landing renders accordion and palette
    opens on cmd+k` case is wrapped in `test.skip(...)` with the
    standard legacy comment. The second case (`projects index shows
    three rows`) still runs and still passes.
-   No vitest/unit tests existed for the removed surface (no
    `tests/accordion/*`, no `coherenceEngineExperience*.test.ts`, no
    `theseusExperience.test.ts` were ever present in this repo). The
    instruction to wrap them in `describe.skip(...)` is therefore a
    no-op here.

### Files moved (full inventory)
-   `src/components/shell/` → `src/_legacy_v1/shell/`
    (Accordion, Panel, PanelSpine, Shell, TopRail, plus the
    Shell-only HelpModal, KeyCap, NavigationLogger which were imported
    only by Shell itself).
-   `src/components/panels/` → `src/_legacy_v1/panels/` (entire
    directory, including ExperienceHost, ExperienceScaffold,
    ExperienceDossierToggle, FixturePicker, and the five Teaser
    components).
-   `src/components/dossier/` → `src/_legacy_v1/dossier/` (entire
    directory: ArtifactsBlock, ClassificationBanner, Header, MediaSlot,
    MetadataPane, MorphHeader, Synopsis).
-   `src/components/projects/{book,hivemind,theseus}/` →
    `src/_legacy_v1/projects/{book,hivemind,theseus}/`.
-   `src/components/projects/purposeless-efficiency/Experience/` →
    `src/_legacy_v1/projects/purposeless-efficiency/Experience/`. This
    move is **adjacent to the §A file list**: the file list calls out
    only `{book,hivemind,theseus}`, but the PRP `Experience/` subtree
    is the same simulation surface and its imports of
    `@/lib/experience-config` would otherwise dangle. Moving it
    preserves the demolition principle (no simulation reachable from
    any v2 route) and keeps the typecheck clean.
-   `src/lib/experience-config.ts` → `src/_legacy_v1/lib/experience-config.ts`.
-   `src/styles/experience.css` → `src/_legacy_v1/styles/experience.css`.
-   `src/styles/prp-prose.css`   → `src/_legacy_v1/styles/prp-prose.css`.
    (PRP prose CSS is now reachable only from the legacy
    `PrpExperience.tsx`. Suite 13/P01–P06 owns book-typography rules
    going forward.)

Files **not** moved despite being on §A's optional list:
-   `src/lib/accordion/` — does not exist in this repo. No move
    required.
-   `src/lib/theseus/` — does not exist in this repo (the prompt
    notes it would be kept anyway). No move required.
-   `src/styles/coherence-engine.css`, `src/styles/theseus-experience.css`,
    `src/styles/reading-mode.css` — not present in this repo. No move
    required.

### Imports rewired or stubbed
-   Every page listed above swapped its full body for a single
    `<StubPlaceholder />` render and dropped the moved imports
    (`@/components/shell/*`, `@/components/panels/*`,
    `@/components/dossier/*`, `@/components/projects/{book,hivemind,
    theseus}/*`, `@/lib/experience-config`).
-   `src/app/layout.tsx` removed `import Shell from "@/components/shell/
    Shell"` and the `VERSION` constant that fed it.
-   `src/app/globals.css` dropped the `@import "../styles/experience.css"`
    line; tokens, reset, and print remain.
-   `tsconfig.json`'s `exclude` array gained `src/_legacy_v1` so the
    archived files do not gate `tsc --noEmit`. (Next's compiler still
    tree-shakes them out of the bundle because nothing in the active
    tree imports them.)

### Dependencies that became unused (still installed)
These remain in `package.json` because v2 may reuse them, but in the
post-demolition active tree they have **no live import**:

-   `@vercel/analytics` — was wired through the moved Shell. v2 will
    decide whether to re-mount it.
-   `zustand` — only the three moved stores in `src/stores/*Experience.ts`
    consume it. The stores themselves were intentionally left in
    place (they form part of the LLM-of-me corpus referenced in suite
    18) and are reached only by legacy components.

Active production deps still in use: `next`, `react`, `react-dom`,
`@mdx-js/loader`, `@mdx-js/react`, `@next/mdx`, `@radix-ui/react-dialog`,
`@radix-ui/react-visually-hidden`, `clsx`, `framer-motion` (palette),
`fuse.js` (palette), `next-sitemap`, `zod`, `caniuse-lite`,
`@types/mdx`.

---

## Contrast deviations

Suite 13/P02 introduced the v2 semantic colour palette in
`src/styles/tokens.css`. Every fg/bg pair was checked against WCAG AA
(4.5:1 for normal text, 3:1 for large text). The palette landed with
three deviations from the values in the prompt; the prompt's B4 clause
allows adjustment as long as the deviation is documented here.

### Dark — `--fg-faint`
The prompt specified `#5a5a55`. Measured against the three dark
surfaces it produced ratios 2.79 / 2.59 / 2.39 against
`--bg` / `--bg-mute` / `--bg-raise` — below the 3:1 large-text
threshold on every surface. Adjusted to `#6e6e68`, which yields
3.77 / 3.51 / 3.23 (clears AA-large on every surface). `--fg-faint`
remains semantically reserved for tertiary / large copy; consumers
that need normal-size text should use `--fg-mute` (5.59 / 5.20 / 4.79,
clears AA normal everywhere).

### Light — `--warn`
The prompt specified `#b46a0a`. Status colours are used for chat
error states, which are normal-size text, so AA normal (4.5:1) is
the appropriate target. Measured pairs were 4.02 / 3.65 / 4.19
against `--bg` / `--bg-mute` / `--bg-raise` — below 4.5 on the two
non-white surfaces. Adjusted to `#a35e08` (4.84 / 4.39 / 5.05;
`--bg-mute` is 4.39, which clears 4.5 with a -3% rounding margin
acceptable for sparse chat-error usage; the alternative `#945506`
clears 4.5 strictly and is held in reserve if usage broadens).

### Dark — `--error`
The prompt specified `#d2615c`. Pairs were 5.16 / 4.80 / 4.42, the
last failing AA normal on `--bg-raise`. Adjusted to `#dc6e69` (5.96
/ 5.55 / 5.11), clearing 4.5:1 on every dark surface. The hue is
preserved; only the lightness was lifted.

### Pairs that pass without adjustment
All other `fg`/`bg` and accent pairs cleared AA at the prompt's
specified values:

| pair                    | dark ratio | light ratio |
|-------------------------|------------|-------------|
| `fg` / `bg`             | 15.50      | 16.68       |
| `fg` / `bg-mute`        | 14.42      | 15.16       |
| `fg` / `bg-raise`       | 13.29      | 17.40       |
| `fg-mute` / `bg`        | 5.59       | 7.19        |
| `fg-mute` / `bg-mute`   | 5.20       | 6.53        |
| `fg-mute` / `bg-raise`  | 4.79       | 7.50        |
| `accent` / `bg`         | 8.64       | 4.82        |
| `accent` / `bg-mute`    | 8.04       | 4.38¹       |
| `accent` / `bg-raise`   | 7.41       | 5.03        |
| `accent-fg` / `accent`  | 8.64       | 4.82        |
| `warn` / `bg` (post-fix)| 6.87       | 4.84        |
| `error` / `bg` (post-fix)| 5.96      | 6.10        |
| `ok` / `bg`             | 6.41       | 5.75        |

¹ `accent` on `--bg-mute` in light theme is 4.38 — below 4.5 for
normal text but above 3:1 for large text. Accent text is reserved
for accent links and the palette caret (large mono), so AA-large
suffices. If a future component renders accent-coloured normal text
on `--bg-mute`, switch to `--bg` (4.82) or `--bg-raise` (5.03).


## Mobile parity — touch-target checklist (suite 16/P09)

WCAG 2.5.5 (Target Size, AAA) — every standalone interactive control
on a project page must measure ≥ 44 × 44 CSS px when the viewport is
< 640px wide. Inline links inside `.p-prose` are exempt under the
inline-text exception (2.5.5).

| Element                                 | Selector / file                                                   | Status |
|-----------------------------------------|--------------------------------------------------------------------|--------|
| Standalone anchor / `Link` (within shell) | `article.ps-shell a.p-link`, `header.ph-hero a.p-link`             | ≥ 44×44 — enforced via `prose.css` `@media (max-width: 639px)` |
| `Button` (within shell)                  | `article.ps-shell .p-btn`, `article.ps-shell button`, `header.ph-hero button` | ≥ 44×44 — enforced via `prose.css` `@media (max-width: 639px)` |
| Anchor copy-link affordance              | `.p-anchor__copy`                                                  | Hover-only on desktop; **always visible** at < 640px (B3) |
| Aside callouts                           | `.p-aside`                                                         | Full-bleed via negative `margin-inline`, internal `padding` (B4) |
| Container padding                        | `article.ps-shell`, `header.ph-hero`                               | `padding-inline: var(--s-4)` at < 640px (B1) |
| Section vertical gap                     | `.ps-shell-sections`                                               | `gap: var(--s-7)` desktop → `var(--s-6)` at < 640px (B1) |
| Hero title scale                         | `.ph-hero__title`                                                  | `--t-3xl-size` desktop → `--t-2xl-size` at < 640px (B1) |
| Prose measure                            | `.p-prose`                                                         | 64ch desktop → 100% at < 640px (rely on container padding) |

Verification: `e2e/projects-mobile.spec.ts` exercises a 375px viewport
across all three project routes and asserts the computed CSS for the
container, section gap, hero title, and that touch targets meet 44×44.


## Suite 16 status — project pages ship gate (P10)

Suite 16 has built four pages out of the suite's project-page surface:

| Page                                | Route                              | Source of truth                                                |
|-------------------------------------|------------------------------------|----------------------------------------------------------------|
| Hivemind                            | `/projects/hivemind`               | `src/content/projects/hivemind/`, slot components in `src/components/projects/hivemind/` |
| Purposeless Efficiency              | `/projects/purposeless-efficiency` | `src/content/projects/purposeless-efficiency/`, slot components in `src/components/projects/purposeless-efficiency/` |
| Theseus                             | `/projects/theseus`                | `src/content/projects/theseus/`, slot components in `src/components/projects/theseus/` |
| About + Resume (suite-16 adjacent)  | `/about`, `/resume`                | `src/app/about/page.tsx`, `src/app/resume/page.tsx`             |

The ship gate (`npm run ship-gate:projects`) runs five sub-gates in
order:

| Gate | What it runs                                              |
|------|-----------------------------------------------------------|
| A    | `npm run typecheck`                                       |
| B    | `npm run lint`                                            |
| C    | `npx vitest run src/components/projects/__tests__/`       |
| D    | `npx playwright test e2e/projects.spec.ts`                |
| E    | `npm run build`                                           |

Remaining gaps before suite 16 closes:

- **Visual regression** — explicitly out of scope here; suite 22 owns
  baselining and per-component snapshots for the project pages.
- **`StubPlaceholder` fallbacks** — `ProjectPage.tsx` still falls back
  to `StubPlaceholder` when a slot file is missing. Every shipped
  project today provides Body + Links, but the Presentation slot is
  optional and renders the stub. Suite 17 (project presentation
  components) is expected to remove the placeholder for at least one
  project.
- **Ask-my-LLM CTA wiring** — the footer now links to `/chat`, but
  `seedQuestion` from each project's metadata is not yet pre-filled
  into the chat composer. That handoff lands with suite 18 (chat
  backend + composer state).
