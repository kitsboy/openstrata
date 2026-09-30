# OpenStrata Design System

**Status:** GUI foundation v0.2  
**Last updated:** 2026-08-25

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

## Interaction and accessibility

- Every icon-only button has an accessible label.
- Keyboard focus is visible on controls.
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
