# Latest Update — OpenStrata v0.3.8

**2026-08-26 · Next 20 shipped — live flows, governance, Bitcoin & trust** — frontend batches committed and pushed to `origin/main` (Cloudflare Pages auto-deploy).

## What shipped

**Frontend** (`7a3d443` components · `0329de8` wiring · 78 tests · 893 i18n keys × 9 locales)

| Lens | Panels |
|---|---|
| Live flows | **RosaChat** (citation-only compliance Q&A — live `POST /rosa/query`, honest demo corpus) · **WizardRegister** (3-step onboarding → real `POST /auth/register`) · **QR scan-to-pay** (`qrcode`, `lightning://` + `bitcoin:` wallet deep links) · **FormsPanel** (Form B/F issuance with the statutory 7-day delivery countdown) · **MyUnitPanel** (member lot, AR balance, payments) |
| Governance | **BallotEngine** (roll-call tally — majority / 3/4 / 80% / unanimous — + minutes export) · **BylawCaseFile** (CRT-ready evidence bundle) · **MeetingNotice** (AGM 14d / council 7d advance check + print) · **HealthScore** (auditable compliance score) |
| Bitcoin | **MempoolBalances** (watch-only sats from mempool.space) · **DcaPlanner** (allocation → sats/period + Form B disclosure %) · **RateSparkline** (live CAD/BTC + as-of) · **RailsReadiness** (LND / LNBits / Liquid / PayNym / Nostr checklist) |
| Trust & polish | **ChainViz** (ledger hash-chain rail with re-verify) · **PwaChrome** (offline banner + install chip) · **a11y 0-warning pass** · **illustrations in the tour + empty states** · **HostConnect** (demo→live strip) |

**Mounted:** the tools page is now a full operations desk — Rosa + wizard lead the demos, then forms, my unit, ballots, notices, health, mempool, DCA, rate, readiness, and chain panels; the dashboard right stack gains HealthScore + RateSparkline + ChainViz; the app shell carries PwaChrome + HostConnect.

## Verified in a real browser

- **Zero horizontal overflow at 390 / 800 / 1280 px on home + tools**
- Rosa answers "short-term rental rules" with an **SPA s.141** citation (fail-closed refusal otherwise); ballots tally; scan-to-pay QR renders
- The 4-step tour now leads with illustration scenes, completes, and dismisses forever (survives reload)

## Checks

- Backend **173 tests / 18 files** · frontend **78 tests** (+8) · svelte-check **0/0** · i18n **893 keys × 9 locales** parity green · build clean · version marker **v0.3.8**

## Still pending (infra-gated, unchanged)

Live-site verify needs the host deploy; LND/Liquid/PayNym/Nostr rails, real broadcast, and BOLT-12 wait on the LND + LNBITS channels you said we'll establish later.
