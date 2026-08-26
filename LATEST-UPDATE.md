# Latest Update — OpenStrata v0.3.7

**2026-08-26 · All 20 user-flow / GUI / Bitcoin improvements shipped** — backend + frontend batches committed and pushed to `origin/main` (Cloudflare Pages auto-deploy).

## What shipped

**Backend** (`02dfd07` · 173 tests)
- **Migration `0006_council_members`** — per-council member registry (`council_member` keyed on `(community_id, email)`); `MemberStore` + Postgres/Mem adapters, seeded from unit owners at register
- **`GET|POST /api/v1/members`, `GET /members/unit`, `DELETE /members/:id`** — the owner/occupant layer over units
- **`GET /api/v1/ledger/entries?fund=`** — the verified hash chain itself (new `LedgerEngine.entries()`), powering the explorer + CSV export
- **`GET /api/v1/deadlines`** — the "What's due" calendar: statutory (EPR, depreciation, AGM) + open payment quotes, sorted urgent-first

**Frontend** (`0d1f1e1` · 70 tests · 680 i18n keys × 9 locales)

| Lens | Panels |
|---|---|
| User flow | **CheckoutFlow** (pay fees → quote → rail picker → confirm → receipt with sats + locked rate + Satohash stamp) · **MonthlyClose** (billing → late notices → ledger) · **BylawCase** (complaint → notice → 14-day lock → fine) · **MemberWorkspace** · **DeadlinesPanel** |
| GUI & design | **Brand-accent theming** (orange ↔ BC-green brokerage, one-click topbar toggle) · **`/design` system page** · SVG illustration set · print stylesheet · glossary explainers (CRF / multisig / LNURL / OTS / DCA) |
| Bitcoin | **RailsStatus** (enabled rails + live CAD/BTC as-of) · **SigningRoom** (PSBT signature progress + broadcast) · **WalletPanel** (xpub + per-unit addresses, copy + mempool links) · receipts integrated into checkout |
| Trust & data | **LedgerExplorer** (verified chain + CSV) · **ExportCenter** (portable JSON / CRT / Form B+F / ledger CSV) · **MemberManager** (invites + temp passwords) · **NotificationsFeed** (bell from real deadlines) · **RateBadge** |

## Verified in a real browser

- **Zero horizontal overflow at 390 → 1698 px on home + tools** (fixed a grid min-width blowout on mobile and a tablet topbar overflow)
- Accent toggle flips `data-accent` to `green` (BC-green palette site-wide); glossary popovers open; `/design` renders; panels mount in demo mode
- Mobile: panels stack to one column, tables scroll internally, topbar stays within the viewport

## Checks

- Backend **173 tests / 18 files** (+6) · frontend **70 tests** (+10) · svelte-check **0/0** · i18n **680 keys × 9 locales** parity green · build clean · version marker **v0.3.7**

## Still pending (infra-gated, unchanged)

Live-site verify needs the host deploy; LND/Liquid/PayNym/Nostr rails, real broadcast, and BOLT-12 wait on the LND + LNBITS channels you said we'll establish later.
