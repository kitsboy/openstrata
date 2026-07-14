# Hermes Strata — Product Plan

**Vision:** Every BC strata corporation — managed or self-managed — runs on Hermes. Cheaper, faster, provable.

---

## Product Stack

```
┌─────────────────────────────────────────────────────────┐
│                    HERMES STRATA                         │
│  Operations: fees, compliance, governance, treasury      │
│  30+ modules covering full management company scope      │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Satohash │  │OpenStrata│  │  Rosa +  │
   │  Proof   │  │Portable  │  │  Ziggy   │
   │   OTS    │  │  Nostr   │  │  Agents  │
   └──────────┘  └──────────┘  └──────────┘
```

**Hermes runs your strata. Satohash proves it happened. OpenStrata lets you take your history.**

---

## Building Template Engine

Every strata starts from a **jurisdiction-aware template**:

| Layer | Configurable |
|-------|-------------|
| Entity | Corp name, BCFSA license #, SPA registration, fiscal year |
| Physical | Suites (add/remove), sqft, parking, storage, EV |
| People | Owners, tenants, council, manager agent |
| Funds | Operating bank, CRF bank, special levies, sub-accounts |
| Bitcoin | Watch-only xpub, multisig provider, Lightning node URL |
| Services | Landscaping, cleaning, insurance, depreciation — toggle |
| Bylaws | Import existing or BC Standard Bylaws pack |
| Fees | Per-unit monthly schedule, late penalties, move-in/out |
| Rails | E-transfer (default), Lightning (opt-in), BTC (advanced) |
| Proof | Satohash instance URL, OTS on every material event |

**Onboarding:** Pick BC template → address + unit count → wizard pre-fills → council reviews → live in 30 minutes.

---

## Payment Rails

### Tier 1 — Standard (every strata)
- E-Transfer with auto-reference matching
- PAD/pre-authorized debit
- Cheque manual entry (legacy)

### Tier 2 — Sovereign Instant (opt-in)
- Lightning LNURL, 15-min CAD rate lock
- BOLT-12 recurring monthly offers
- Satohash stamp on every receipt

### Tier 3 — Advanced (premium)
- On-chain L1 for large CRF moves
- Nostr Zaps for amenity micropayments
- PayNym / silent payments (privacy)
- Agent-orchestrated pay (HERMES/Grok)

**Principle:** Fiat primary. Bitcoin additive. Never custody.

---

## Transparent Sub-Accounts

```
Strata Treasury
├── Operating Fund
├── CRF (10% mandatory)
├── Pool Maintenance
├── Garden Committee
├── BTC War Chest (1–2% council vote)
└── Special Levy #2026-01 (auto-closes when funded)
```

Each: fiat bank link, optional watch-only BTC, rolling 12-month ledger, Satohash anchor on material transactions.

---

## BTC War Chest

- Council votes 3/4 to allocate 1–2% of annual budget
- Monthly DCA into 3-of-5 multisig (council hardware wallets)
- Hermes: watch-only + PSBT generation
- Disclosed on Form B
- Purpose: inflation hedge, not speculation

---

## Satohash Integration (when ready)

| Event | Stamped |
|-------|---------|
| Strata fee payment | Receipt hash |
| Council vote / AGM resolution | Minutes hash |
| Bylaw change | Bylaw document hash |
| Bylaw complaint notice | Notice hash (proves 14-day start) |
| Lease agreement | Contract hash |
| Form B/F issuance | Certificate hash |

---

## Agent Payments

Owner → Agent (HERMES/Grok) → Hermes API → LNURL invoice → external wallet pays → Ziggy reconciles → Satohash stamps → Nostr DM confirmation.

Agents never custody. They orchestrate to predefined sub-accounts.

---

## Module Count: 30+

See `src/lib/strata-tool.ts` for full module map across 7 domains:
Financial, Assets, Governance, Meetings, Conveyancing, People, Sovereign.

---

## Pricing

| Tier | Price | Includes |
|------|-------|----------|
| Community | Free | Self-hosted Docker, BC template |
| Standard | $4/unit/mo | E-transfer, compliance, forms |
| Sovereign | $6/unit + $49/bldg | + Lightning, Satohash proofs |
| Advanced | +$99/bldg/mo | + Multisig, war chest, agent pay |
| Brokerage Pro | Custom | Multi-building, white-label, API |

---
**Diligence pack:** [docs/diligence/](../diligence/) (investor + architecture + ask)
