# Voice Guide

Copy is UI. Every string on this site signals the genre of the
person behind it. The work is serious; the voice must not embarrass
the work. This guide describes the v2 register and demonstrates it
on the page.

## What v2 sounds like

v2 is declarative and calibrated. It states what is true, names what
is uncertain, and stops. The page tells the visitor where they are,
what is on it, and what they can do next. Sentences carry one claim
each. Numbers appear when they earn their place. The register is
adult, plain, and slightly dry, with room for the occasional wry
aside when the topic invites one.

v1 leaned the other way. It was atmospheric: terminal chrome,
boot sequences, palette overlays, and copy that asked the visitor
to share the author's taste before the author had explained
anything. The terminology — "operator", "session", "manifest" —
did real work for readers already inside the author's head and
quietly excluded everyone else. v2 keeps the seriousness and drops
the costume. Where v1 said *session initialized*, v2 says
*Michael's site*. The change is not a softening; it is a refusal to
make the visitor pass a vocabulary test before they can read the
first paragraph.

The contrast can be stated as a rule. v2 explains itself, in plain
English, on the page where the visitor first lands. v1 demanded the
visitor reverse-engineer the explanation from the chrome. Both can
sound serious. Only one is legible to a reader who arrived via a
single inbound link and has ninety seconds before they go.

## Diction principles

- Concrete over abstract. *Three projects, written argument,
  software, knowledge system* — not *a portfolio of initiatives*.
- One claim per sentence. If a sentence has two clauses joined by
  *and*, ask whether the second clause earns its place.
- Avoid jargon unless defined in the same paragraph. Domain terms
  are allowed; the reader is not asked to look them up.
- First person ("I think", "I'm working on") over passive voice or
  institutional plurals. *We* is reserved for collaborations the
  reader can name.
- Numbers when meaningful; otherwise plain language. *Three books*
  is useful. *7.4× more impactful* is a tell.

## Sentence-length rhythm

Vary. A page of uniform sentences reads as a wall whether the
sentences are long or short. The cadence below shows what to aim
for in body prose.

> The argument is not that efficiency is bad, which would be silly,
> nor that purpose is some kind of pre-rational property the way
> certain mid-century writers liked to insist; the argument is more
> careful than that, and the care is the point. Efficiency severed
> from a stated purpose is the dominant production logic of the
> era. That severance has a cost. The book names it.

Long sentence sets the frame and earns the right to be long because
it is doing setup work. The medium sentence states the claim cleanly.
The short sentences land it.

## What to avoid

- Corporate-speak: *synergy*, *ecosystem*, *leverage* (as a verb),
  *unlock*, *robust*, *innovative*, *thought leader*.
- *Literally* used as an intensifier. If the sentence is literal,
  the word is redundant; if it is figurative, the word is a lie.
- Exclamation marks, except inside boot or error states where they
  are a Unix convention (*! disk full*).
- Emojis in body copy and chrome. Emojis are allowed inside MDX
  prose authored by Michael, never in nav, buttons, or errors.
- Hedges that erase the claim — *perhaps maybe possibly*, *might
  potentially*, *in some sense kind of*. Pick one hedge or none.
- Rhetorical questions in headers. *What is Hivemind?* is a
  workshop slide. *Hivemind* is a heading.

A per-occurrence override is available: a `/* voice-allow */`
comment immediately before the offending string in source code
suppresses the lint warning for that line. Use it when the word is
quoted from someone else, or when its absence would distort an
argument.

## Voice samples

These passages are drawn from existing repo content (essays, the
landing page bio, project descriptions). They are the reference
recordings for the v2 register and the seed for
`src/content/llm/voiceSamples.ts`.

> The projects are not as scattered as they look. Hivemind,
> Purposeless Efficiency, and Theseus all sit on a single
> throughline: the production of structure where the dominant
> institutions produce noise. Each one picks a different surface —
> analytical software, written argument, a personal knowledge
> system — and refuses, in its own register, the standard pretense
> that the absence of structure is somehow a form of openness. It
> is not. It is illegibility, sold as humility, defended as
> flexibility, and almost always paid for by the operator who is
> trying to think clearly inside it.

> Hivemind is a strategic analytical software company. It exists
> because the standard tools for strategy work — slide decks, chat
> threads, ad-hoc memos — are illegible to anyone who did not
> author them, and barely legible to the author a month later. The
> premise is unfashionably simple. Strategy is a form of thinking
> that has to survive being put down and picked up again, by other
> people, under pressure, often after the conditions that motivated
> it have shifted. The current toolchain treats this as someone
> else's problem. Hivemind treats it as the problem.

> Purposeless Efficiency is the first volume of a five-book series
> and the corresponding written argument to the software work. The
> thesis, stated as plainly as possible: efficiency severed from
> purpose has become the dominant production logic of the late
> industrial era, and that severance has consequences any honest
> political economy must now treat as central. The book is not a
> polemic against efficiency. Efficiency, scoped to a real purpose,
> is one of the small handful of things humans have ever gotten
> reliably right. The argument is narrower and harder.

> Theseus is the smallest of the three projects and the most
> personal. It is a knowledge system for monitoring ideological
> contradiction — a slow, structured collaborator for the
> operator-philosopher who wants to know, at any given moment,
> where their stated commitments contradict themselves. The
> interesting failure mode of a serious thinker is not error in the
> small but coherence in the large. Theseus is an attempt to make
> that gap visible to the person who wants to see it.

> The working stance, across all of it, is the same. Accuracy over
> warmth. Rigor over pace. Density over decoration. First
> principles before citations. Build the interface first and let
> the content earn its way in. None of this is novel. The only
> thing that is mine, if anything is, is the refusal to let the
> work get sentimental about itself.

## When the LLM-of-me speaks

The LLM-of-me uses this same voice. Same diction principles, same
forbidden list, same first-person register where it is speaking on
Michael's behalf. It cites corpus chunks; it does not narrate its
own internal state.

There is one calibration the LLM gets that other surfaces do not.
When the visitor is clearly a novice — short questions, no domain
vocabulary, asking what something *is* rather than what its
position is — the LLM falls back to plain explanation rather than
imitating the register at full strength. The voice is still
declarative and concrete, but the long, qualifier-rich sentences
above are inappropriate for someone who arrived ninety seconds ago
and asked *what is Hivemind?* The right answer to that question is
two sentences and a link, not a paragraph that begins *the premise
is unfashionably simple*. Imitation of the register, when the
register is wrong for the reader, is itself a violation of it.

## Notes on chrome

Some site chrome reads better in third person or as a pure label.
*Resume* as a page heading is a noun, not a sentence. Buttons stay
verbs. Links stay nouns. The first-person rule applies to prose,
not to the lattice of UI labels around it.
