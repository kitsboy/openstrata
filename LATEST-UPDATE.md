# Latest Update — 2026-08-26

**Landing page fixed and finished (v0.3.5).** You reported: no working links, the page slides sideways under the sidebar, and the sidebar's bottom buttons are below the page. All three, root-caused and fixed.

## What was broken (measured in a real browser)
The home dashboard was nested inside the marketing layout — a double shell:
1. **Sideways slide** — the marketing header (brand + 11-item nav + actions) needed ~1570px of space, so at every common laptop width it overflowed horizontally and the page panned sideways, content sliding under the fixed sidebar
2. **Clipped sidebar buttons** — the sidebar is `height: 100vh` but sat 105px down the page (below the marketing header), so its bottom (Need a hand? + All systems operational) landed below the viewport and was unreachable
3. **Dead links** — the dashboard footer was 14 links all pointing at `/`; the sidebar nav were toast-buttons that navigated nowhere

## What's fixed
- **Home = standalone app shell.** The dashboard now renders by itself — no marketing header/footer above it. The sidebar now spans the exact viewport (`100dvh`), with the nav area scrolling internally on short screens so the bottom buttons are always visible
- **Every link works.** Sidebar nav → real pages (Overview `/`, Buildings `/tools`, Governance `/compliance`, Operations/Finances `/tools`, Legal `/legal`, Insights `/roadmap`); footer columns → `/tools`, `/compliance`, `/legal`, `/templates`, `/faq`, `/blog`, `/rss`, `/spec`, `/docs`, mailto + GitHub; "Need a hand" → `/faq`; "View all" → `/tools`; mobile bottom nav → links
- **Theme toggle** added to the dashboard topbar (it had lost the marketing header's)
- **Marketing pages fixed too** — the 11-item header nav now scrolls internally instead of pushing the page wide, so `/about`, `/tools`, etc. no longer slide either

## Verified in a real browser (Chrome, 5 viewports: 1698 / 1440 / 1280 / 1024 / 390)
- Zero horizontal overflow at every width
- Sidebar help + status-footer buttons visible at every width
- Click-through works: sidebar "Legal library" navigates to `/legal`
- `/tools` header scrolls internally, page doesn't slide

Checks: svelte-check 0/0, 45 tests, i18n 565 keys × 9 locales, build clean.

**Uncommitted** — ready to commit and push on your word.
