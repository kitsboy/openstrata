# OpenStrata Design System

**Status:** GUI foundation v0.3  
**Last updated:** 2026-10-16

## Product character

OpenStrata is an operating workspace for strata and condominium communities. The interface is calm enough for financial and legal work, but distinctive enough to feel like a modern product rather than property-management software from another decade.

- **Voice:** clear, direct, practical, human
- **Density:** information-rich with strong grouping and visible next actions
- **Interaction model:** progressive disclosure, one primary action per surface, three taps to a frequent task
- **Trust posture:** legal sources and system status are visible, not hidden in a marketing layer

## Visual system

- **Canvas:** `#f6f8f9`
- **Ink:** `#18232b`
- **Navigation ink:** `#102d3b`
- **Primary accent:** `#f97348` coral orange
- **Success:** `#36b989` mint green
- **Information:** `#3f8efc` sky blue
- **Insight:** `#8f76e8` violet
- **Caution:** `#e7a942` amber
- **Critical:** `#e86b72` coral red
- **Surface:** `#ffffff`
- **Border:** `#e4e9eb`

The palette deliberately uses separate semantic hues for action, health, caution, risk, information, and analytics. Avoid dark blue-only, purple-only, or orange-only UI surfaces.

### Fixed surfaces and the ramp they own

The theme flips the ramp at night, which is what keeps `text-slate-900` legible as ink on dark
paper — and what turns the same step into a near-white *fill* if it is used as one. Three
surfaces are navy in **both** themes, so they are fixed surfaces and each one owns its own ramp
rather than borrowing the shell's flipping tokens:

| Surface | Ramp | Why it is scoped |
|---|---|---|
| Dashboard sidebar (`aside.sidebar`) | `--chrome-ink` / `-muted` / `-faint` / `-accent` / `-link` / `-line` | `.sidebar` re-points six shell tokens (`--ink`, `--muted`, `--faint`, `--line`, `--orange-text`, `--brand-text`) at the chrome ramp for its whole subtree, so a rule — or a component's scoped style — inside the chrome cannot reach a flipping step by accident. |
| Inverse plates (`--color-slab*`), incl. the pay dock, the page footer and the auth modal's brand panel | `--color-slab-ink` / `-muted` / `-faint` / `-accent` / `-line` | `.site-footer`, `.bg-slab` and `.bg-slab-raised` re-point the *accent* ink for their subtree too, so a focus ring on navy stays visible. |
| The QR plate and printed documents | `--color-qr-plate` / `--color-on-qr` | A QR code needs a light quiet zone, and paper is white in both themes; `@media print` is the one place a literal white fill is correct. |

Rules that follow from this:

- **A fill is a role, never a ramp step.** `bg-slab`, `bg-surface-2`, `var(--paper)`, `.qr-plate`.
  A literal `#fff` card in `src/app.css` is now a build failure outside a print block.
- **A token that does not exist is a silent failure.** `var(--surface-3, #eef2f2)` resolved to the
  fallback, i.e. a fixed near-white plate under light ink. Referencing an undefined `--token` now
  fails the audit by file and line.
- **Measure ink against the plate it is really on.** A translucent glow is painted *over* an
  opaque plate, so ink that sits in a glow is measured against the composite — that is where the
  auth panel's 10px trust lines were failing while the plate alone looked fine.

Status steps for accents and statuses are split into a *glow* and a *text* step (`--orange` vs
`--orange-solid` / `--orange-text`, and the same shape for success, warning, danger, blue, purple)
so an accent can be bright as a fill and dark enough as a label.

## Typography

- **Primary:** Manrope, with system fallback
- **Metadata and system labels:** DM Mono, with monospace fallback
- **Headings:** 700 to 800 weight, tight but readable line-height
- **Body:** 400 to 600 weight, comfortable line-height
- **System labels:** uppercase, small, monospaced, positive letter spacing
- **Letter spacing:** no negative letter spacing in UI labels; display headings use restrained optical tightening only

## Layout

- Desktop navigation is a fixed 252px command sidebar.
- The topbar is sticky, translucent, and supports search, language, notifications, and profile context.
- Main content is capped at 1410px and uses dense data grids.
- Cards use a maximum 13px radius, quiet borders, and restrained shadows.
- Card fills are `var(--paper)`, which flips with the theme by construction — no per-surface dark-mode override is needed and none should be added.
- Mobile replaces the sidebar with a bottom action bar and a slide-in navigation drawer.
- Primary content collapses from four metric columns to two, then one column.
- Repeated elements maintain stable dimensions so status changes do not shift the layout.

## Core surfaces

- Workspace switcher
- Community health metric cards
- Building cards with health, progress, and current issue
- Quick-action launcher
- Live activity panel
- Upcoming events panel
- Formation workspace modal
- Legal, trust, privacy, and accessibility footer

### The one-lot pay sheet (`/pay`)

One amount, three choices, and the picked rail in full. The shape is deliberate, because a
payment page is the one place a visitor acts on what is on screen:

- **One number, biggest on the page.** The amount due is the only display-size number; no second
  total competes with it. Its parts (fee, arrears, late fee, fine, levy) sit under a dashed rule
  and only the parts that are actually owed are listed — an empty lot lists nothing.
- **Three large choices, as real radios.** The choice is an `<input type="radio">` under a styled
  `<label>` inside a `<fieldset>` with a screen-reader legend, so keyboard, arrow-keys and
  screen-reader behaviour are the browser's rather than a re-implementation. The picked card takes
  the brand border, a brand tint and a tick.
- **The rate lock is a stamp, not a control.** It states how long the fiat amounts are good for and
  nothing else. When it expires the sheet says so in words *and* moves the BTC/sats row to the
  warning ink, because a stale rate that still looks live is the one dishonest thing this page
  could do. `lockState`/`lockClock` are rules in `src/lib/pay-sheet.ts`, not colours in a template.
- **Exactly one writer per value.** The rail is owned by the component; `?rail=` seeds it once on
  arrival and is then an output. A second writer — an effect that reseeded from the URL — produced a
  sheet whose tick and URL said e-Transfer while the panel showed Lightning's invoice, which is how
  this rule was learned.
- **Nothing is offered that cannot be paid.** Destinations are demo strings, the QR plate is the one
  surface allowed to stay light in both themes, and PAD and cheque sit in a disclosure rather than
  competing with the three rails a treasurer sends from.

## Interaction and accessibility

- Every icon-only button has an accessible label.
- Keyboard focus is visible on controls: one authored ring (`3px solid var(--brand-text)`,
  offset 3px) on every focusable element, riding an audited token rather than a half-transparent
  literal, and re-pointed on the inverse surfaces so it stays visible on navy. Both shells open
  with a skip-to-content link as the first tab stop (translated in all nine locales).
- Text selection uses the brand tint with the page's own ink, so selecting copy can never make it
  unreadable.
- Contrast is measured rather than estimated: `npm run audit:contrast` recomputes WCAG pairs from
  `src/app.css` in both themes and holds four structural guards (chrome scope, undefined `var()`,
  literal-white fills, non-flipping fill literals); the rendered result is checked in Chrome
  across every route in both themes.
- High-frequency actions are available on mobile without opening the menu.
- Reduced-motion users receive minimal transitions.
- Modals use native dialog semantics.
- Legal, financial, and compliance actions must expose their status and approval requirements.
- Language selection is available in the global shell and is designed for future locale files rather than hard-coded page forks.

## Supported interface locales

English, French, Spanish, Simplified Chinese, Hindi, Filipino, Polish, Ukrainian, and Swahili are represented in the shell. Production translation must be reviewed by native speakers; legal content must receive jurisdiction-specific legal and language review before publishing.

## Content conventions

- Prefer action-oriented labels: `Create a strata`, `Plan a meeting`, `Find a legal source`.
- Put current state beside the thing it describes: `91/100`, `2 actions due this week`.
- Keep legal limitations close to legal workflows: `Information is general and not legal advice.`
- Use source titles and official links for legal references; do not imply that OpenStrata is a law firm.

## Safe Harbour

OpenStrata is part of the [Give A Bit](https://giveabit.io) family. Product workflows support community administration and do not replace qualified legal, financial, engineering, surveying, insurance, or accounting professionals.
