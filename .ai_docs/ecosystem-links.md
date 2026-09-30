# Ecosystem Links — OpenStrata

**Last Updated:** 2026-08-25

## Connections to Other Projects
| Project | Relationship |
|---------|-------------|
| GiveABit (parent) | Hosted at openstrata.giveabit.io; shares CF Pages + Nostr infrastructure |
| Satohash | PLANNED: timestamp strata meeting minutes, compliance docs, and reports via OTS |
| Stranded | PLANNED: cross-reference property data with stranded site economics |
| Tadbuy | PLANNED: marketplace for strata management supplies/services |

## Bitcoin / Layer-2 Rail Integration Seams (Phase 3 `backend/src/rails/`)
Rails are prepared but **not connected** — daemons must be provisioned on the self-hosted host and unlocked via `backend/.env`:
| Rail | Enable env var | Endpoint env var | Purpose |
|------|----------------|------------------|---------|
| Fiat (ledger) | always | — | CAD trust ledger (never custody) |
| Bitcoin on-chain | `BITCOIN_RAIL_ENABLED=true` | `BITCOIN_NODE_URL` (or `LND_URL`) | SegWit/taproot inbound + PSBT 3-of-5 outbound |
| Lightning | `LIGHTNING_RAIL_ENABLED=true` | `LND_URL`, `LIGHTNING_NETWORK` | LNURL/BOLT-11 with 15-min CAD rate lock |
| Liquid | `LIQUID_RAIL_ENABLED=true` | `LIQUID_URL` | Confidential L-BTC/L-USD assets |
| PayNym (BIP-47) | `PAYNYM_RAIL_ENABLED=true` | `PAYNYM_NOTIFIER_URL` | Reusable payment codes (comment-code) |
| Nostr | `NOSTR_RAIL_ENABLED=true` | `NOSTR_RELAYS` | Unit identity / receipts / DMs (not a transfer) |

`GET /api/v1/rails/status` lists enabled rails + the `cadPerBtc` rate (pluggable `RateProvider`, static fallback). Recipients are validated with real BIP-173 bech32/bech32m checksums.

## Shared Infrastructure
- Cloudflare Pages (openstrata-specific project, auto-deploy from GitHub main)
- Nostr NIP-05 at giveabit.io/.well-known/nostr.json
- GitHub kitsboy organization

## Give A Bit Ecosystem
See MASTER-BRAIN/docs/GIVE-A-BIT-ECOSYSTEM.md for the full ecosystem overview.