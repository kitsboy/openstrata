# Accessibility Statement — OpenStrata

**Status:** Draft — working toward WCAG 2.2 AA. See `docs/PRODUCT-BUILD-PLAN.md` §17 for the full accessibility backlog.
**Last updated:** 2026-08-25
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
- **Automated checks** — `npm run check` enforces Svelte accessibility rules
  (0 warnings) on every build.

## Known limitations

- Full WCAG 2.2 AA conformance testing (screen readers, zoom, colour contrast
  auditing, testing with disabled users) is not yet complete.
- Some legal/statutory record tables are data-dense; we provide
  `overflow-x-auto` containers for small screens.
- Translated interfaces rely on English fallback until reviewed translations
  are complete.

## Feedback

Found an accessibility issue? Email **hello@giveabit.io** and we will address
it. We plan formal accessibility testing with specialists before the backend
product phases.
