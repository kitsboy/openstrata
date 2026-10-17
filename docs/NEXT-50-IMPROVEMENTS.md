# OpenStrata — next 50 high-impact improvements

Ranked by expected trust, user value, and unlock potential. Items are proposals, not a commitment; anything involving live money, legal interpretation, shared Give A Bit infrastructure, or the existing four-item UI queue needs Cam's decision before implementation.

## Foundation: trust, deployment, and data safety

1. **Durable ledger idempotency** — store idempotency key, council, fingerprint, result, and expiry transactionally beside the ledger write; survive restarts and multiple API instances.
2. **Deploy the Phase 3 backend** — establish a documented, backed-up host, TLS/Tailscale access, health monitoring, and verified migrations 0001–0006; currently no production host is confirmed.
3. **Database-backed sessions and revocation** — refresh tokens or opaque sessions, explicit logout/revoke, password changes, and per-user active-session review.
4. **Dedicated agent principals** — scoped, revocable, short-lived credentials with read-only capability scopes; avoid handing AI agents human admin/treasurer tokens.
5. **Tenant isolation audit** — systematic cross-council tests for every store, route, export, cache, and background task; fail closed if tenant identity is missing.
6. **Backup and restore drills** — encrypted automated Postgres backups, retention policy, documented restore, and periodic recovery proof with measured RPO/RTO.
7. **Ledger integrity monitoring** — background chain verification, tamper alarms, signed checkpoints, and an operator-facing reconciliation report.
8. **Idempotent multi-step money workflows** — transactional outbox for quote/confirm/ledger updates and replay-safe delivery to payment providers.
9. **Rate limits across instances** — durable/shared limiter with endpoint-specific budgets and trustworthy proxy/IP handling; current limiter is local-memory.
10. **Security threat model + abuse budget** — enumerate exposed paths (signup, Rosa, bill links, exports), threats, mitigations, telemetry, and incident response.
11. **Secrets lifecycle** — secret rotation without invalidating all users unexpectedly, key IDs, separate signing keys by purpose, and a rotation playbook.
12. **Audit log for privileged actions** — append-only actor, action, target, timestamp, source, and outcome records; never store secrets or unnecessary personal data.
13. **API schema contract** — publish OpenAPI from actual route schemas, add compatibility tests, and generate typed clients from the canonical contract.
14. **Database migration guardrails** — migration status endpoint/CLI, checksum tracking, backup-before-migrate checks, and preflight compatibility verification.
15. **Health/readiness split** — separate liveness from dependency readiness and report sanitized database/vector/payment-provider states.

## Money paths: correctness before connecting real rails

16. **Production payment-provider selection** — decide whether OpenStrata shares any Give A Bit Stripe/account/payment infrastructure before adding a provider; make no assumption about shared accounts.
17. **Interac real-provider certification** — obtain bank-issued credentials, verify callback signatures and replay protection, and test the full request/status/refund path in a provider sandbox.
18. **Payment state machine persistence** — make every provider transition durable, monotonic, audited, and recoverable after worker restarts.
19. **Webhook inbox** — authenticate, persist, deduplicate, and asynchronously process provider events with dead-letter replay tooling.
20. **Reconciliation exception desk** — match bank/rail settlements to quotes and ledger entries, surface unmatched/partial/duplicate amounts, and require human resolution.
21. **Payment refunds and reversals** — model refunds as new compensating ledger entries with approval, evidence, and provider-status confirmation.
22. **Per-council rail capability settings** — replace global/config-only enablement with council-controlled, permissioned, audited setup and clear demo/live state.
23. **Bitcoin address derivation persistence** — store xpub metadata encrypted, derive addresses with network/path validation, and never return an xpub through ordinary member APIs.
24. **PSBT broadcast hardening** — validate network, fee ceilings, recipient/output totals, change, signer thresholds, expiry, and replay at the server boundary before any RPC.
25. **Treasury approval workflow** — dual control for large spends, policy thresholds, meeting-resolution linkage, and a human-readable approval packet.
26. **CAD/BTC rate provenance** — record source, timestamp, freshness, spread, and fallback state for every quote; refuse stale rates above policy thresholds.
27. **Per-unit payment privacy** — minimize what bill links reveal, add secure revocation, and offer optional additional verification for sensitive statements.
28. **Payment link lifecycle** — revoke/replace links, audit issuance, configure safe TTL, and prevent bearer credentials from appearing in analytics/referrers.
29. **Settlement operations dashboard** — queue depth, provider incidents, retries, exception age, and money-in-flight totals with explicit demo/live badges.
30. **Money-path chaos tests** — simulate timeouts after provider acceptance, duplicated webhooks, out-of-order events, process restarts, DB failures, and partial ledger writes.

## Product value for strata councils

31. **Actual owner/member portal** — secure owner-specific balance, notices, documents, and payments without exposing neighbors' data.
32. **Document ingestion and extraction** — upload minutes, bylaws, budgets, invoices, and statements; OCR + structured extraction with provenance and human verification.
33. **Invoice capture to ledger draft** — parse vendor invoices, suggest account codes and GST treatment, then require treasurer approval before posting.
34. **Bank statement reconciliation import** — CSV/OFX upload, mapping, duplicate detection, and explainable suggested matches.
35. **Budget builder and scenario planning** — compare fees, operating costs, CRF contributions, inflation, reserve studies, and special levies with traceable assumptions.
36. **Reserve-fund study workspace** — asset inventory, component lifecycle, engineering assumptions, funding plan scenarios, and dated source attachments.
37. **Maintenance and work-order lifecycle** — issue intake, triage, vendor bids, approvals, scheduling, completion evidence, and unit-level communications.
38. **Meeting-to-action pipeline** — agendas, notice windows, quorum, resolutions, minutes, votes, assigned actions, and deadlines in one linked record.
39. **Owner communication center** — notices and messages with consent, delivery logs, language preferences, and sensitive-content handling.
40. **Document access controls** — per-document audience, expiry, redaction, download audit, and secure owner sharing.
41. **Strata data portability** — tested export/import format for members, units, ledger, documents, and audit trail, with checksums and a migration preview.
42. **Multi-building portfolio mode** — shared operator identity with strict building boundaries, consolidated dashboard, and delegated site roles.
43. **Accounting close checklist** — bank tie-out, accruals, payroll/GST checks, board approval, evidence attachments, and immutable close snapshot.
44. **Tax calendar sourced from CRA/BC** — verified dates by fiscal profile, official source links, jurisdiction metadata, and an explicit review/refresh date.
45. **Legal content governance** — primary-source citations, effective dates, version history, reviewer sign-off, and an expiry/revalidation queue; no automated legal conclusions.

## Access, operations, and adoption

46. **Full accessibility audit** — screen reader, keyboard-only, zoom/reflow, touch targets, reduced motion, and accessible PDF output across real workflows.
47. **Localization completion** — move remaining demo/accounting page copy into the catalog, review French with a qualified reviewer, and localize dates/currency legally.
48. **End-to-end browser suite** — CI journeys for onboarding, bills, payment link, mobile navigation, dark mode, exports, and failure states against a seeded ephemeral API.
49. **Observability and privacy-aware diagnostics** — structured request IDs, error traces, latency histograms, redaction rules, opt-in diagnostics, and no personal financial payload capture.
50. **Council onboarding and readiness wizard** — guide host choice, migration checks, domain/CORS wiring, first admin setup, sample-data removal, backup proof, and live-rail readiness without pretending incomplete steps are complete.
