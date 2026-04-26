# v2 Motion Guide

Motion is functional. Every animation answers a question the user just
asked: "did the system see my click?", "where did that panel go?",
"is the agent still typing?". Every animation has a no-motion path
(see Reduced motion below).

The vocabulary is small on purpose. Five durations, three curves.

## Durations

Defined in `src/styles/tokens.css` and consumed via `var(--d-*)`.

| Token         | Value | Use this for                                            |
| ------------- | ----- | ------------------------------------------------------- |
| `--d-instant` | 0ms   | Theme toggle, value swap — change without animating.    |
| `--d-tap`     | 80ms  | Button press feedback (active-state colour shift).      |
| `--d-fast`    | 160ms | Focus ring appearance, hover-state colour transitions.  |
| `--d-norm`    | 280ms | Page transition fade between routes.                    |
| `--d-slow`    | 480ms | Chat message arrival, large layout reveals.             |

If a transition feels like it needs something between these steps,
the answer is to pick the nearer one — not to add a sixth token.

## Curves

| Token           | Curve                              | Rationale                                                        |
| --------------- | ---------------------------------- | ---------------------------------------------------------------- |
| `--ease-out`    | `cubic-bezier(0.16, 1, 0.3, 1)`    | Anything that decelerates to rest. Default for entrances.        |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)`     | State toggles where both endpoints are equally important.        |
| `--ease-linear` | `linear`                           | Text streaming reveals — character cadence must stay uniform.    |

No spring physics. No bounce. No overshoot. The deceleration in
`--ease-out` is the only "softness" the system uses.

## Reduced motion contract

Under `@media (prefers-reduced-motion: reduce)` every duration token
collapses to `0ms`. The contract for components:

- Fades become instant. The opacity endpoint still applies, just
  without a transition.
- No slides. No `translateX/Y` transforms used purely for entrance.
- No scale-in or scale-out animations.
- No staggered children — items appear together.

If a component cannot honour this by token alone (e.g. a JS-driven
animation), it must branch on `prefers-reduced-motion` directly.

## What we don't do

- Parallax. Motion tied to scroll position is decorative, not functional.
- Scroll-driven background animations.
- Decorative orbiting elements, ambient drifts, idle "breathing".
- Mouse-tracking effects (cursor halos, tilt, magnetic hover).

If a motion does not answer a user's question, it does not ship.
