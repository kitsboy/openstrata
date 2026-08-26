# Latest Update — OpenStrata v0.3.9

**2026-08-26 · Design-system release (Grok)**

One card language across the dashboard + all 13 marketing pages, and a real site-wide fix. Extracted a reusable `Card` component (47 cards/9 pages migrated), normalized the marketing type scale, pinned the sidebar shell to the viewport, unified dashboard/marketing card tokens, and **fixed a Tailwind v4 cascade bug** where unlayered element resets (`a{color:inherit}`, `button{border:0}`) were beating utilities — brand links were rendering plain ink (invisible dark-on-dark) and buttons lost size/border. Resets now in `@layer base`; `:root` wired to `var(--ink)`/`var(--canvas)` for true dark mode; `text-bc-blue` lightened dark-only (2.35→9.0:1). Verified in a real browser: zero overflow on all 13 pages × 3 sizes, brand links teal in both modes, 85 tests green. See docs/KIMI-HANDOFF.md top.

Cam flagged red CI (push `0969190`). Root-caused 4 backend bugs that only surfaced against real Postgres (42P18 placeholder hole, 25P01 LOCK outside txn, transposed payment-store args, BIGINT-as-string breaking chain verify). Fixed in `f371aed`; all 3 CI jobs success; e2e 6/6. See docs/KIMI-HANDOFF.md top.
