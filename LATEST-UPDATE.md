# OpenStrata — Last Updated 2026-08-26 by Grok

Brief: Landing page secured + tightened (v0.3.3). The CSP in `static/_headers` was blocking the page's own assets — Google Fonts and Umami analytics weren't allowlisted (the site rendered in fallback system fonts, which is the "floating" look) and the live-API origin would have been blocked too. Fixed all three source lists, added `upgrade-insecure-requests`, and removed the duplicate Google Fonts `@import` (plus unused `Inter`) so fonts load once via the head link. Tightened the dashboard shell per "solid, tight": content width 1410→1280px, gaps and card padding down across the metric grid / main grid / panels / right stack, footer synced, and card shadows switched from a soft glow to a crisp 2-layer shadow (dark mode too). Checks: svelte-check 0/0, 42 frontend tests green, i18n 523 keys parity green, build clean.

Commit: (uncommitted — working tree; follows `0969190` on main)
