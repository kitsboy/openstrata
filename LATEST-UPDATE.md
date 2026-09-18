# openstrata — Last Updated 2026-09-18 by Buffy (M3)

**Brief:** v0.3.16 — design-system hardening pass. One branded header band for every tab (14 pages migrated off hand-rolled gradients, five of which painted a **white band across dark mode**), a new **`npm run audit:contrast`** that recomputes WCAG contrast for 60 token pairs in both themes and found **10 real failures** (all fixed), and a **"start here" three-leg journey strip** with localStorage-only progress. Plus the node/host inventory for the MVP rail: THOR's pruned node is the MVP rail, Cam's UMBREL full node is the correctness backstop.

**Commits:** `git log -1 --format=%h` (feat(ui): branded header bands, a real contrast audit, and the start-here journey strip, v0.3.16).

## What shipped (three batches, as asked)

**Batch 1 — contrast, enforced by a script instead of by eye**

- **`npm run audit:contrast`** (`scripts/audit-contrast.mjs`): recomputes WCAG 2.2 contrast for **60 text-on-surface token pairs** from `src/app.css` in light and dark. Reads `@theme` / `:root` / `.dark`, resolves `var()` references, and honours the repo's existing `.dark .text-<token>` text-only override convention so a deliberate fix is not reported as a failure. Wired into CI (`frontend verify`), the deployment checklist and `docs/SECURITY.md`.
- **It found 10 real failures on the first run, and all 10 are fixed:**
  - `--faint` sat at **2.42:1 on white** while driving every 9–10px uppercase eyebrow label → now 3.6:1, against a documented 3:1 floor for that decorative token.
  - `--muted` was 4.41:1 on white and **3.9:1 on a surface-3 chip** → now `#5e6b75`, clearing AA on canvas, paper and chips.
  - `text-brand-600` / `text-brand-700` were 3.27–3.68:1 in light and **2.67–3.29:1 in dark** → text usages now ride the ramp (`brand-700`/`brand-800` light, `brand-300`/`brand-200` dark), referencing palette variables so the green "brokerage" accent theme still swaps.
  - **White on `--orange` measured 2.77:1** — the brand coral is a *glow* token, not a fill. Solid orange fills now use new `--orange-solid` / `--orange-solid-deep` (**5.02:1** with white); the coral stays for icons, rails and dots.
  - The brand ramp's 600/700/800 steps were retuned: `--color-brand-600` is used as a fill 72 times, and white on the old `#0891b2` was only 3.68:1 → **now 5.88:1**.
- Two mid-page `from-slate-50 to-white` bands (`/pitch`, `/about`) also painted white in dark mode → `to-transparent`.

**Batch 2 — one branded header band for every tab**

- New `.page-hero` in `src/app.css`: a brand wash, a fine drafting grid faded toward the edges, and a brand hairline along the top edge — mixed entirely from theme tokens, so it flips with the theme by construction.
- All **14 top-level page headers** migrated off their hand-rolled Tailwind gradients (`scripts/migrate-page-hero.mjs`). Five of those gradients ended in `to-white` and painted a bright band straight across dark mode; that whole class of bug is now impossible.

**Batch 3 — "start here" journey strip**

- `StartHere.svelte` answers the question a first-time visitor actually has. Three legs: **Explore the modules → Configure your building → Register and go live.** Mounted under the header band on `/tools`, `/tools/wizard`, `/thank-you` and `/docs/manual/getting-started`; visited legs tick off, the current leg is highlighted, and a progress meter shows the whole path.
- Progress is **localStorage-only** — no account, no network call. A marketing funnel nudge should not be the one thing that phones home.
- Pure logic in `src/lib/journey.ts` with **10 unit tests**: malformed, partial or hostile storage degrades to "nothing reached" instead of throwing.
- **10 new i18n keys × 9 locales.**

## Node & host inventory (new — this unblocks Phase 3)

Recorded in `docs/DEPLOYMENT.md` under "Nodes, hosts & the tailnet"; the questions for Kimi are in `docs/KIMI-HANDOFF.md`.

| Machine | What it is | Node | Status |
|---|---|---|---|
| **THOR** (VPS) | Family VPS, runs HERMES | bitcoind **pruned** + **LND** | Running; LND reported reachable over Tailscale |
| **UMBREL** (Cam's) | Personal full node | bitcoind **full/unpruned** | **Syncing — ~63% IBD, ETA weeks** |
| **M3 / M4** | Cam's + Kimi's machines | none | Tailscale peers |

**The decision:** **THOR's pruned node is the MVP rail.** Broadcast and confirm need no historical rescan — `sendrawtransaction`, the PSBT workflow, and watching UTXOs from now on all work on a pruned node. **UMBREL is the correctness backstop**, not the blocker: it is the only node that can answer "does this address have old history?", so until its IBD finishes watch-only xpub imports may show a *partial* history, and the UI must say so rather than present it as a complete ledger. Nothing waits on UMBREL — re-pointing is a config change (`BITCOIN_NODE_URL`) because the seams are address-agnostic.

## Verified

- `npm run check` → **0 errors, 0 warnings**.
- `npm test` → **95 passed** (12 files; was 85 — +10 journey tests).
- `npm run audit:i18n` → **passed, 820 keys** across 23 route components.
- `npm run audit:contrast` → **passed, 60 token pairs**, both themes.
- `npm run build` → green.
- **Browser sweep: 17 pages × light + dark = 34 combinations, 0 contrast failures, 0 horizontal overflow.** Contrast was computed against the live DOM with a real WCAG alpha-composite (parsing `oklab()` and `color(srgb …)`), probing h1/h2/p/links/buttons/table cells at their actual rendered size and weight — not read off the stylesheet. `StartHere` renders 3 legs on all four journey pages; `.page-hero` is present on all 14 migrated pages.

## Next

- **Still blocked on Kimi's answers, not on code** — 9 questions covering LND reachability + macaroon, THOR's prune target and chain, whether THOR's bitcoind is wallet-enabled, UMBREL's sync ETA and tailnet name, THOR's Docker/Tailscale/Node toolchain, Ollama + `nomic-embed-text`, MagicDNS names, disk/RAM headroom, and Tailscale ACLs.
- Then: `docker compose up -d` on THOR → `AUTH_SECRET` → `npm run migrate` → e2e smoke gate → point the frontend at the MagicDNS name → `BITCOIN_RAIL_ENABLED=true` so `/treasury/psbt/broadcast` returns a real txid, and `rosa index` so Rosa's search stops using the keyword fallback.
- **Cam's remaining UI asks:** refine the user flow further, and the header *imagery* (the bands are now branded and consistent, but still vector/texture rather than real photography or illustration).
