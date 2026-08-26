# Latest Update — OpenStrata v0.3.6

**2026-08-26 · All 20 GUI & user-flow improvements shipped** — four batched, tested commits pushed to `origin/main` (Cloudflare Pages auto-deploy).

## What changed

| Batch | Items | Commit |
|---|---|---|
| Foundation | #11 one SVG icon system · #12 real glass-card + shared tokens · #13 dark-mode audit · #14 typography ramp · #15 designed empty states | `eac768f` |
| Navigation | #1 breadcrumbs everywhere · #2 tools sub-nav · #3 scroll-spy TOC · #4 ⌘K indexes tool modules · #5 mobile dock on all pages | `b40dc69` |
| Alive | #6 view transitions · #7 shimmer skeletons · #8 dynamic greeting + real date · #9 metric sparklines · #10 micro-interactions | `01609f3` |
| Trust | #16 first-run tour · #17 error toasts + inline validation · #18 confirm dialogs · #19 last-synced chrome · #20 hero pattern CTAs | `584dbb4` |

## The biggest find

**`.glass-card` was never defined.** Every marketing page (60+ cards) had `class="glass-card …"` but no CSS rule existed — those cards rendered as bare text floating on the mesh background. It now resolves to the same soft 2-layer card language as the dashboard, via shared `--radius-card` / `--shadow-card` / `--border-card` tokens. The tools-page tooltip (`tooltip-bubble`) was phantom too — now real.

## Verified in a real browser

- **Zero horizontal overflow at 390 / 640 / 768 / 800 / 900 / 1024 / 1280 / 1440 / 1698 px** (found + fixed a tablet-width header overflow in the process)
- First-run tour overlay shows for fresh visitors and dismisses permanently
- Dashboard renders sidebar + metric sparklines; click-through navigation works; TOC appears on long pages

## Checks

- svelte-check **0/0** · frontend **56 tests** (+11) · i18n **588 keys × 9 locales** parity green · build + prerender clean

## Still pending (infra-gated, unchanged)

Live-site verify needs the host deploy; LND/Liquid/PayNym/Nostr rails, real broadcast, and BOLT-12 wait on the LND + LNBITS channels you said we'll establish later.
