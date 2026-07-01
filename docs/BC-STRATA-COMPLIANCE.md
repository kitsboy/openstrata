# BC Strata Compliance — Knowledge Base

> **RETAIN THIS DOCUMENT.** Source of truth for Hermes architecture, Rosa RAG corpus, and Kimi execution.  
> **Also in code:** `src/lib/compliance.ts` · **Live UI:** `/compliance` on the Hermes Strata site  
> **Contact:** hello@giveabit.io

---

## Regulatory Framework

| Item | Detail |
|------|--------|
| Primary legislation | Strata Property Act (SPA), Strata Property Regulation |
| Licensing regulator | BC Financial Services Authority (BCFSA) |
| Dispute resolution | Civil Resolution Tribunal (CRT) — almost all strata disputes |
| Agent model | Licensed strata management company acts as agent for democratically elected Strata Council |

---

## 1. Five Functional Domains

Every Hermes module maps to one of these pillars.

### 1.1 Financial Management & Trust Accounting

Strata corporations have **unique, separate funds that cannot be co-mingled.**

| Fund | Purpose | DB Key |
|------|---------|--------|
| Operating Fund | Daily/annual expenses (utilities, minor repairs, landscaping) | `fund_operating` |
| Contingency Reserve Fund (CRF) | Long-term capital (roofing, elevators) | `fund_crf` |
| Special Levies | One-off accounts per voter-approved capital project | `fund_special_levy` |
| Accounts Receivable | Monthly strata fees, move-in/out fees, fines | `fund_ar` |

**Real estate transactions:**
- **Form B** (Information Certificate): fees, arrears, pending CRT/court cases, CRF balance — **7-day statutory delivery**
- **Form F** (Certificate of Payment): confirms $0.00 owed — **blocks sale if balance due**

### 1.2 Physical Asset & Operational Maintenance

- **Common Property vs Strata Lot** tracking
- **Depreciation Reports**: updated every **5 years**, 30-year capital projection — link to CRF budget
- **Vendor management**: contracts, WCB insurance compliance, preventative maintenance
- **EPR 2026**: Metro Vancouver energy performance reporting

### 1.3 Governance, Compliance & Record Keeping

- **Bylaw enforcement** state machine (see Section 2)
- **SPA s.35 record retention** (see Section 5)
- **CRT evidence export**: unalterable PDF of notices, communications, ledger balances

### 1.4 Meeting Logistics

- AGM, SGM, Council meeting notifications and agendas
- Proxy tracking, hybrid/electronic voting (permanent SPA amendments)
- Quorum and voting engines (see Section 3)

### 1.5 Real Estate Transactions (Conveyancing)

See Section 2.2 — Forms B & F workflow.

---

## 2. Operational Workflows

### 2.1 Bylaw Enforcement Flow

**CRT will overturn if steps are skipped or timelines violated.**

| Step | Day | Action | System Lock |
|------|-----|--------|-------------|
| 1 | Day 1 | Receive written complaint with evidence (photo, audio, log) | — |
| 2 | Day 2–5 | Issue Notice of Complaint. Min 14 days to respond or request hearing | — |
| 3 | Min 14 days | Review window — monitor response/hearing request | `BLOCK_FINE_ACTIONS` |
| 4 | Next Council Meeting | Council votes on breach. Decision in minutes | `REQUIRE_QUORUM + REQUIRE_MINUTES` |
| 5 | Post-Meeting | Issue Fine Notice. Add to ledger | — |

**Fine caps:**
- Standard infraction: **$200 max**
- Short-term rental / Airbnb: **$1,000** in BC

### 2.2 Real Estate Conveyancing — Forms B & F

| Step | Form | Action |
|------|------|--------|
| 1 | Form F | Check ledger. Balance > $0 → **WITHHELD** state. Sale blocked. |
| 2 | Form B | Comprehensive summary within **7 days** of request |
| 3 | — | Clear arrears → Form F shows $0.00 → release withheld |

---

## 3. Governance — Quorum & Voting

### 3.1 Quorum Rules (SPA s.48, s.19)

| Meeting | Requirement | Formula |
|---------|-------------|---------|
| AGM / SGM | 1/3 eligible voters (in person or proxy) | `Math.ceil(eligibleVoters / 3)` |
| AGM / SGM delayed | **30-Minute Rule**: no quorum in 30 min → reschedule +7 days. Delayed meeting: whoever shows = quorum | Auto-trigger |
| Council | Majority of council members | 5 members → 3; 7 members → 4 |

**Conditions:** Voters must be in good standing — no registered lien / Form G for unpaid fees.

### 3.2 Voting Thresholds

**Abstentions are ALWAYS excluded from calculation.**

| Type | Threshold | Denominator | Used For |
|------|-----------|-------------|----------|
| Majority | >50% | Yes + no from present/proxy | Budget, council election, rules |
| 3/4 Vote | ≥75% | Yes + no from present/proxy | Bylaw changes, CRF spending, special levies |
| 80% Vote | ≥80% | All eligible voters (present or not) | Winding up, selling entire property |
| Unanimous | 100% | All eligible voters | Rare statutory requirements |

**Tie-breaker:** Council President casts deciding vote (BC Standard Bylaws). Exception: 2-unit stratas.

---

## 4. Localization — BC → US Expansion

**Decouple regional terminology from day one.** Database uses neutral keys; UI maps via `config.yaml`.

| BC Concept | US Equivalent | DB Element |
|------------|---------------|------------|
| Strata Corporation | HOA / Condo Association | `Entity_Master` |
| Strata Lot | Unit / Condo / Parcel | `Property_ID` |
| Common Property | Common Elements / Common Areas | `Asset_Shared` |
| Strata Council | Board of Directors | `Governance_Board` |
| Bylaws & Rules | CC&Rs | `Compliance_Rules` |
| CRF | Reserve Fund | `Long_Term_Asset_Account` |
| Form B / Form F | Estoppel / Resale Certificate | `Real_Estate_Closing_Doc` |
| CRT | Small claims / arbitration (varies) | `Dispute_Forum` |

---

## 5. SPA s.35 Record Retention

| Document | Retention |
|----------|-----------|
| Registered bylaws | Permanent |
| Rules | Permanent |
| Meeting minutes | Permanent |
| Correspondence | 2 years |
| Financial records | 6 years |
| Income tax records | 6 years |
| Contracts | 6 years after expiry |
| Engineering / depreciation reports | Permanent |
| Owner lists & Form K | Permanent |
| Legal opinions | Permanent |

---

## 6. Architecture Mandates

1. **Multi-Account Trust Isolation** — Operating, CRF, Special Levy ledgers never co-mingle. US states (FL, CA) have similar rules.
2. **Hybrid & Electronic Meetings** — Token-based digital voting, proxy tracking, real-time attendance.
3. **CRT Evidence Export** — Unalterable PDF package: notices, communications, ledger balances.
4. **Statutory Workflow Locks** — 14-day bylaw window, 7-day Form B, 30-min quorum delay. Rosa flags overrides.
5. **Localization Engine Day One** — Neutral DB keys, regional labels in UI layer only.

---

## 7. Hermes Module → Domain Map

| Module | Domain | Trigger |
|--------|--------|---------|
| Form K Hub | governance | 14-day reminder on missing |
| EPR 2026 Monitor | assets | Breach → Form B disclosure |
| Tax/Occupancy Matrix | financial | EHT/SVT auto-flag |
| Dual Pay Treasury | financial | CRF 10% block on capital invoice |
| Bylaw Enforcement Engine | governance | BLOCK_FINE_ACTIONS until day 14 |
| Forms B/F Generator | conveyancing | WITHHELD on arrears > $0 |
| Meeting & Voting | meetings | Reschedule +7d on quorum fail |
| Depreciation Tracker | assets | 5-year renewal reminder |
| CRT Export | governance | On-demand PDF evidence package |

---

*Part of the [Give A Bit](https://giveabit.io) / Hermes Strata project. Safe Harbour: educational purposes only — consult qualified professionals for legal and financial decisions.*