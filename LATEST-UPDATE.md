# openstrata — Last Updated 2026-09-18 by Buffy (M3)

**Brief:** v0.3.17 — the three improvements Cam asked for, **plus the accessibility debt they exposed**. Per-tab **hero artwork** (six on-brand motifs across 14 pages), an in-app **setup checklist** on the dashboard (localStorage-only, 13 tests), and a **public `/changelog`** generated from the changelog we already write (7 tests). Then `audit:contrast` turned out to be **silently skipping 46 of its own checks** — closing that hole found `text-success` at **2.18:1**, `text-warning` at **1.99:1**, `text-danger` at **3.76:1**, `text-bitcoin` at **2.30:1** and white-on-Bitcoin-orange at **2.30:1**. All fixed.

**Commits:** `a74f67c` (feature code) · `bf7e29c` (release v0.3.17) · `831dd80` (docs, maps, handoffs) — pushed to `origin/main`; Cloudflare Pages deploys on push.

**Live-verified after deploy:** yes, against production at **https://openstrata.giveabit.io** — `openstrata-version` reads **0.3.17** on the live root, `/changelog` serves with its hero artwork and **19 release entries**, the change-type filter narrows the page (**23,455 → 8,319** characters of text and reports the filtered view), the dashboard renders the whole setup checklist (`Finish setting up`, `Add your units`, `Open the two funds`), and `sitemap.xml` lists `/changelog`. Note the canonical host is `openstrata.giveabit.io` — `openstrata.org` does not resolve and `openstrata.ca` is a separate 200.

---

## What shipped (three improvements, as asked)

### 1. Every tab got its own header artwork

The `.page-hero` band from v0.3.16 gave every tab one consistent header language — but it left them looking like siblings. `src/lib/components/HeroArt.svelte` now draws a single on-brand motif behind each headline, chosen by what the section **is**, not by rotation:

| Section | Motif |
|---|---|
| `/tools`, `/tools/wizard` | the module lattice |
| `/roadmap`, `/spec` | blocks linked into a proof chain |
| `/compliance`, `/legal` | statutes and a balance |
| `/docs`, `/templates` | stacked, ruled documents |
| `/about`, `/blog`, `/design` | the community graph |
| `/faq`, `/rss`, `/thank-you` | answers radiating outward |

Constraints that stop it becoming decoration soup: drawn in `currentColor` **only** (so it inherits the band's brand tint and flips with the theme rather than needing a second dark palette), `aria-hidden` and `pointer-events:none` so it never carries or blocks anything, masked toward the edges so it cannot sit under a headline, and `display:none` below 900px. Mounted by `scripts/wire-hero-art.mjs`; idempotent, so re-running it is safe.

### 2. An in-app setup checklist on the dashboard

The public journey strip (v0.3.16) guides someone deciding whether to sign up. This is the other half: what a council must actually do **after** a workspace exists.

`SetupChecklist.svelte` + `src/lib/setup.ts` sit under the dashboard welcome row and track four steps, each with a deep link:

1. **Add your units** — every unit, so fees, ballots and Form K track correctly
2. **Open the two funds** — operating and reserve, kept separate; trust money may not be co-mingled
3. **Load your bylaws** — the standard set or your filed set, so enforcement has a basis
4. **Close your first month** — bill, reconcile, publish one real month to the ledger

Design decisions worth keeping: progress is **localStorage-only** (the workspace is the record of truth; the panel is only a nudge, and clearing storage costs clicks, not data), malformed/partial/**hostile** storage degrades to "nothing done" rather than throwing, and dismissal lives under its own key so an older build cannot resurrect a panel someone dismissed. The first-run tour still renders first; the checklist sits behind it, and a restore button brings it back.

### 3. A public `/changelog` page

The project ships several times a week and writes an honest changelog every time — so it now publishes that. `scripts/generate-changelog.mjs` parses `CHANGELOG.md` into `src/lib/changelog.generated.ts` and the page renders it:

- **20 releases with full notes, 5 summary-only, 119 bullet items.** Parses the markdown body (`## [x.y.z] — date` plus its `Added` / `Changed` / `Fixed` / `Verified` / `Known issues` groups), and carries the five releases that only ever existed in the front-matter version history through as summary-only rows instead of dropping or inventing them.
- **Nothing is reworded for marketing**, and the `Verified` group is shown rather than hidden — how a release was checked is part of the claim. Inline markdown (emphasis, code ticks, link targets) is stripped so the page never renders raw source syntax.
- Change-type filter, per-release expand/collapse (2 items per group until expanded), newest-first timeline, a hero metric strip (latest version / releases / total changes) and an RSS call to action.
- Wired into the nav, the dashboard footer, `static/sitemap.xml` and `static/llms.txt`.

**7 tests**, including a freshness guard and the assertion that the newest published release equals the `package.json` version — so the page cannot silently go stale.

## And then it turned into a real accessibility sweep

Cam's own words were "some text can still be hard to see, we are not perfect yet." He was right, and worse: **the audit was not looking.**

`scripts/audit-contrast.mjs` **silently skipped any token with no value in `src/app.css`** (`if (!fg) continue;`). The light-mode slate ramp and every semantic status colour come from Tailwind's stock palette rather than from us — so `--color-slate-400`, `--color-slate-500` and all of `success` / `warning` / `danger` / `bitcoin` were **never checked in light mode**. Closing that hole (an unresolvable token is now a hard failure) took the audit from **60 → 106 token pairs**, and the failures were real:

| Element | Was | Now |
|---|---|---|
| `text-success` chips | **2.18:1** | 6.53:1 |
| `text-warning` chips | **1.99:1** | 6.38:1 |
| `text-danger` — arrears amounts, enforcement chips | **3.76:1** | 6.54:1 |
| `text-bitcoin` — balances, donate links | **2.30:1** | 5.62:1 |
| white on a solid `#f7931a` Bitcoin button | **2.30:1** | **6.96:1** — dark ink |
| light-mode `text-slate-400` — dates, source notes, captions | **2.90:1** | 5.54:1 |

**How it was fixed** — the same split the orange already had, applied properly:

- Text usages ride new documented steps: `--success-text`, `--warning-text`, `--danger-text`, `--bitcoin-text`, plus `.text-slate-400` / `.text-slate-500` overrides in both themes, following the repo's established text-only-override convention so solid fills and 10%-tint chips are untouched.
- Solid danger buttons use new `--color-danger-solid` (**5.46:1** with white); decorative danger dots keep the bright coral glow, because a dot carries no text.
- A solid Bitcoin fill now takes **dark ink** via `--on-bitcoin` (**6.96:1**) instead of white on `#f7931a`. This is the better fix than darkening the token: the Bitcoin orange stays brand-bright, which is the whole point of the accent.
- The light-mode slate ramp is now **stated in `src/app.css`** at values identical to stock. Nothing moves visually — but an undefined token cannot be audited, and this is exactly what was hiding.

## Verified

- `npm run check` → **0 errors, 0 warnings**
- `npm test` → **115 passed** (14 files, +13 setup and +7 changelog tests)
- `npm run audit:i18n` → passed, **860 keys × 9 locales** (40 new keys)
- `npm run audit:contrast` → passed, **106 token pairs**, both themes, at or above floor
- `npm run build` → green

**Browser sweep (Chromium, production preview):**

- 16 pages × light + dark = **32 combinations: 0 horizontal overflow, 0 contrast failures** attributable to the changed tokens. Hero art present on all 13 hero pages, with the dashboard correctly having none (it is the app shell, not a marketing hero).
- **24 combinations at 390×844, 768×900 and 1221×738: 0 page overflow and 0 checklist overflow.** The header artwork is `display:none` at 390 and 768 as designed, and visible at 1221.
- **Interaction-verified, not just rendered:** `/changelog` filter narrows **74 → 17** entries and reports the active type; expanding the latest release goes **74 → 77** entries and the control flips to "Show less"; 5 summary-only earlier releases render; the setup checklist ticks **0% → 25%**, writes `{"done":["units"],"hidden":false}`, survives a reload at 25% with 1 box ticked, then dismisses to a restore button with `openstrata-setup-hidden=1`.

**One trap found while testing, now documented in `docs/DEPLOYMENT.md`:** the site is an installable PWA with a service worker, so a **stale worker serves the previous build** — a correct deploy looks broken (wrong version marker, new components missing). It cost a full false-negative sweep before it was spotted. Any browser verification against `npm run preview` must unregister the worker and drop origin caches first, then check the version marker.

## Pushed in batches

Three commits, then verified on the live site rather than only on the preview build:

| Commit | Batch |
|---|---|
| `a74f67c` | Feature code — hero artwork, setup checklist, changelog page, the contrast-audit fix |
| `bf7e29c` | Release v0.3.17 across the manifests, `CHANGELOG.md` and the changelog sync test |
| `831dd80` | Docs, maps, handoffs and the node/tailnet inventory |

Base before this session: `9c91af0`.

## What is still not done — honestly

- **The backend is not deployed.** The static frontend is live on Cloudflare Pages, but Phase 3 is still blocked on the host, not on code — the backend has never run on a real server.
- **Still waiting on Kimi** for the node/host answers in `docs/KIMI-HANDOFF.md`: THOR's prune target, which chain, whether bitcoind is wallet-enabled, UMBREL's sync percentage, MagicDNS names, and THOR's disk/RAM headroom. THOR's pruned node remains the chosen MVP rail; UMBREL remains the correctness backstop and is **not** a blocker.
- **Live rails are not connected.** Bitcoin, Lightning, Satohash stamping and Nostr identity are prepared seams, not running services.
- **Machine-drafted locales** (pl, uk, sw and the newer keys) still need professional human review before they are treated as reviewed.
