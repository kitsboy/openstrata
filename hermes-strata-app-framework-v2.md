# Project Hermes: Sovereign Strata App Framework v2

> **For Kimi (HERMES Orchestrator) | BC-First MVP**  
> Extensible to Provinces/States via config · Target: M4 Docker + Umbrel + Local Ollama  
> **Philosophy:** Institutional backend power. Mobile-sexy PWA frontend. Progressive disclosure.

**Contact:** [hello@giveabit.io](mailto:hello@giveabit.io) · [GitHub](https://github.com/kitsboy/openstrata) · [X](https://x.com/giveabit)

---

## Table of Contents

1. [Architecture](#architecture)
2. [BC Compliance Knowledge Base](#bc-compliance-knowledge-base) ← **RETAIN**
3. [Kimi Agents](#kimi-agents)
4. [UI/UX Design System](#uiux-design-system)
5. [Install & Digest SOP](#install--digest-sop)
6. [Core Modules (BC MVP)](#core-modules-bc-mvp)
7. [Treasury Rails](#treasury-rails)
8. [Extensibility & Config](#extensibility--config)
9. [RSS, API & Feeds](#rss-api--feeds)
10. [FAQ](#faq)
11. [Kimi Execution Notes](#kimi-execution-notes)

---

## Architecture

Local-first sovereignty. **Data never leaves the stack.**

```
Mobile PWA (Sexy) / Desktop Console
          ↓ Tailscale Secure Gateway
Hermes Core (Rosa: Compliance RAG | Ziggy: Treasury State Machine)
          ↓
Fiat Rail (CAD Ledger + Mandatory 10% CRF)  |  Bitcoin Rail (3-of-5 PSBT Multisig + LNURL CAD-pegged Instant Pay)
```

| Layer | Component | Purpose |
|-------|-----------|---------|
| Frontend | SvelteKit PWA | Mobile-first dashboard, bottom sheets, Lightning QR |
| Gateway | Tailscale | Secure remote access to local stack |
| Compliance | Rosa | BC SPA/RTA/CRT/bylaws strict RAG |
| Treasury | Ziggy | Invoice → CRF → PSBT → multisig → reconcile |
| Fiat | CAD Ledger | Mandatory 10% Contingency Reserve Fund |
| Bitcoin | 3-of-5 Multisig | PSBT workflow + LNURL instant pay |

---

## BC Compliance Knowledge Base

> **Do not forget.** Full SPA + BCFSA regulatory breakdown preserved in three places:
> - **Site:** `/compliance` (interactive UI)
> - **Code:** `src/lib/compliance.ts` (structured data for Rosa/Ziggy)
> - **Docs:** `docs/BC-STRATA-COMPLIANCE.md` (markdown source of truth)

### Five Functional Domains
1. **Financial & Trust Accounting** — Operating, CRF, Special Levy, AR (isolated ledgers). Forms B & F.
2. **Physical Assets** — Common property vs strata lots, depreciation reports (5yr/30yr), vendor WCB.
3. **Governance & Records** — Bylaw enforcement (14-day lock), SPA s.35 retention, CRT export.
4. **Meetings** — Quorum (1/3 AGM, Council majority), 30-min reschedule, hybrid voting.
5. **Conveyancing** — Form F blocks sale on arrears; Form B within 7 days.

### Critical Workflow Locks
| Workflow | Lock / Trigger |
|----------|----------------|
| Bylaw enforcement | `BLOCK_FINE_ACTIONS` for min 14 days after Notice of Complaint |
| Form F | `WITHHELD` when unit balance > $0 |
| Form B | 7-day statutory delivery deadline |
| AGM quorum fail | Reschedule +7 days at 30-minute mark |
| CRF spend | 3/4 vote + Ziggy cap check |

### Voting Engine
- Majority (>50%), 3/4 (≥75%), 80% (all eligible), Unanimous — **abstentions always excluded**
- Council tie-breaker: President casts deciding vote (Standard Bylaws)

### Canada → US Localization
Database uses neutral keys (`Entity_Master`, `Property_ID`, `Compliance_Rules`). UI maps BC/US/EU terms via config.

---

## Kimi Agents

### Rosa — Compliance RAG
- Ingest → strict RAG on BC SPA/RTA/CRT/bylaws
- Extract timelines, flag risks
- Auto-remind loops (14-day Form K, EPR deadlines)
- High threshold — **source citations only**

### Ziggy — Treasury State Machine
- Parse invoices → enforce CRF cap
- Generate PSBT → coordinate multisig quorum
- Reconcile ledger on broadcast
- Cross-check PO + invoice text before any signature

---

## UI/UX Design System

**Stack:** SvelteKit + Tailwind + shadcn/ui. Mobile-first. PWA now → Tauri/Capacitor native later.

**Theme:** Light premium (not dark). Teal/BC-green primary. Bitcoin orange accents. Subtle glassmorphism.

| Pattern | Implementation |
|---------|----------------|
| Actions | Bottom sheets — pay, upload, approve. 48px+ touch targets |
| Payments | Instant Lightning QR modals — copy/share/haptic |
| Toggles | Sovereign Pay — smooth flip + color shift |
| Feedback | Status pills, progress rings, micro-animations |
| Disclosure | Multisig/JSON behind "Sovereign Mode" toggle. 3 taps max |
| Offline | PWA manifest + service worker + Add to Home Screen |
| Trust | Inline citations, real-time badges, audit drawer |
| Desktop | Hover expands cards. Same components, responsive |

**Dashboard vibe:** Clean unit cards. Tap → bottom sheet. Live status. Pull-to-refresh.

---

## Install & Digest SOP

Kimi execute precisely:

| Step | Action | Command / Detail |
|------|--------|------------------|
| 1 | **Bootstrap** | `docker compose up -d` — Ollama isolated, vector DB on M4 SSD, API, web. Tailscale on. Umbrel BTC link. |
| 2 | **Seed Rosa** | Ingest BC SPA, RTA, EPR rules, bylaws, minutes → local vector DB. Strict RAG. Validate 3 test queries. |
| 3 | **Pipeline** | Watch folder + email webhook → file lock → local OCR → clean text → Rosa buffer. |
| 4 | **Treasury Validation** | Simulate: Invoice → Ziggy parse + CRF 10% block check → PSBT → mock 3-sig → broadcast + reconcile. Confirm fail-safe triggers. |
| 5 | **UI Deploy** | Build responsive components. Mobile touch + desktop hover test. Enable PWA install prompt. |

---

## Core Modules (BC MVP)

### Form K Hub — SPA §146
- Toggle Signed/Missing → Rosa 14-day auto-reminder
- CSV occupants → evacuation manifest
- Bylaw received checkbox
- Tooltip: Prevents sudden enforcement

### EPR 2026 Monitor — Metro Van mandatory
- Dropdown: Pro credentials (PEng/Technologist/Technician)
- kW capacity input
- Visual progress to 2026-12-31
- EV % cap input → breach alert + load-share suggestion

### Tax/Occupancy Matrix
- Unit cards: EHT (Vancouver) / SVT (BC) auto-flagged from utility signatures
- Auto declaration reminders
- Dashboard: Verified / Alert states

### Dual Pay
- **Resident:** E-transfer upload OR "Sovereign Instant" toggle → Lightning QR (15-min CAD rate lock)
- **Council:** Approve → Ziggy PSBT → local secure notify (Matrix) → 3 sigs → on-chain + auto reconcile

---

## Treasury Rails

| Rail | Currency | Mechanism |
|------|----------|-----------|
| Fiat | CAD | Ledger + mandatory 10% CRF allocation |
| Bitcoin | BTC | 3-of-5 PSBT multisig — no single point of failure |
| Lightning | BTC/CAD peg | LNURL instant pay with 15-min rate lock |

**Donations:** Bitcoin on-chain + Lightning via footer modal. Contact: hello@giveabit.io

---

## Extensibility & Config

```yaml
jurisdiction: BC
law_packs: [spa, rta, epr]
bitcoin: true
currencies: [CAD, BTC, USD, EUR]
languages: [en, fr]  # expand: es, zh, pt, de, sw, hi, ar
feeds:
  - url: https://www2.gov.bc.ca/gov/content/housing-tenancy/strata-housing/rss
    category: Regulation
  - twitter_list: strata-bc
```

**Rollout order:** BC → Canada (ON, AB) → US (WA, etc.) → EU (multi-language)

Kimi swaps RAG corpus per jurisdiction. One codebase.

---

## RSS, API & Feeds

Growable feed infrastructure for strata intelligence:

| Source Type | Examples |
|-------------|----------|
| RSS | BC Government, CRT decisions, CMHC rental data |
| Social | Twitter/X lists (strata-bc) |
| Bitcoin | Bitcoin Optech, Give A Bit blog |
| API | `/api/v1/feeds/rss`, `/api/v1/market/rates`, `/api/v1/rosa/query` |

See live UI: `/rss` page on the Hermes Strata site.

---

## FAQ

### Governance
- **Long-term rentals ban?** Invalid province-wide. Short-term (Airbnb) ban OK with fines to $1k/day.
- **Secret e-AGM ballots?** No. Must verify every voter for CRT-proof results.

### Infrastructure
- **Refuse EV charger request?** No. Must decide in writing within 3 months. Owner pays all costs.
- **Miss Dec 31 2026 EPR?** No immediate fine but must disclose on Form B (mortgage/insurance hit). Owners can CRT enforce.

### Bitcoin Rails
- **3-of-5 multisig protection?** No single point of failure/theft. Requires 3 independent cryptographic keys.
- **Invoice-payout match?** Ziggy cross-checks PO + invoice text. Side-by-side review before any signature.

---

## Kimi Execution Notes

- Enforce clean structure, local-only, strict RAG
- CRF hard blocks — never bypass
- Mobile UX priority — 3 taps max to any task
- All outputs cite sources
- Work all the time

---

*Part of the [Give A Bit](https://giveabit.io) family — Bitcoin sovereignty first.*