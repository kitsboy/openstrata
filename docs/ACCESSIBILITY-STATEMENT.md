# Accessibility Statement — OpenStrata

**Status:** Draft — working toward WCAG 2.2 AA. See `docs/PRODUCT-BUILD-PLAN.md` §17 for the full accessibility backlog.
**Last updated:** 2026-10-16
**Contact:** hello@giveabit.io

## Our commitment

We aim to make OpenStrata usable by everyone, including people using screen
readers, keyboard-only navigation, high-contrast displays, and reduced-motion
preferences.

## What we have in place

- **Semantic HTML and ARIA** on interactive components (modals, dropdowns,
  tooltips, nav, accordions, language switcher).
- **Keyboard accessibility** — navigation, tool module cards, FAQ accordions,
  and wizard controls are operable via keyboard.
- **Charts** expose `graphics-symbol` roles with labels; chart tooltips are
  supplementary, not the only way to read the data.
- **Reduced motion** — `prefers-reduced-motion` disables animations/transitions.
- **Responsive layout** — the site is usable from 320px mobile through desktop.
- **Colour contrast, measured** — every rendered route and overlay was checked in Chrome in
  both themes: 28 routes × light and dark (56 page loads, 10,976 text nodes) plus the ⌘K search
  modal, the topbar menus and the auth modal, all at **zero text below 4.5:1**. The check runs
  against the computed styles, asserting that the current stylesheet is the one on screen (a
  service-worker-cached sheet is rejected rather than scored).
- **Contrast held in CI** — `npm run audit:contrast` recomputes 218 WCAG token pairs in both
  themes and additionally fails on four structural regressions: a surface whose ink does not
  follow its own ramp, a `var(--token)` that is defined nowhere (CSS drops the declaration and
  silently uses the fallback), a literal white fill in the stylesheet outside `@media print`,
  and a non-flipping fill literal in a component. Each guard was verified to fail on the exact
  line when the underlying bug is reintroduced.
- **Keyboard affordances** — one visible focus ring on every focusable element, and a
  skip-to-content link as the first tab stop on both shells (all nine locales).
- **Automated checks** — `npm run check` enforces Svelte accessibility rules
  (0 warnings) on every build.

## Known limitations

- Full WCAG 2.2 AA conformance testing is not yet complete: screen readers, zoom and testing
  with disabled users are still outstanding. Colour contrast is the one area with a measured
  result rather than an estimate.
- The contrast sweep is text-based. Ink that is painted by a gradient rather than by `color`
  (`background-clip: text` headlines) and gradient plates are evaluated with a worst-case
  composite of the stops, which is conservative in one direction and approximate in the other:
  it does not pixel-sample, so a glow's true falloff across a wide panel is approximated.
- Overlays were checked by opening them in a scripted browser session. States that require real
  credentials or a live host (a signed-in council's own dashboard, backend-backed panels) are
  covered by the token pairs in `audit:contrast`, not by a rendered sweep.
- Some legal/statutory record tables are data-dense; we provide
  `overflow-x-auto` containers for small screens.
- Translated interfaces rely on English fallback until reviewed translations
  are complete.

## Feedback

Found an accessibility issue? Email **hello@giveabit.io** and we will address
it. We plan formal accessibility testing with specialists before the backend
product phases.
