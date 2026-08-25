# OpenStrata Product Build Plan

**Status:** Master implementation backlog  
**Scope:** BC launch, Canada expansion, North America readiness  
**Owner:** OpenStrata engineering and product team  
**Last reviewed:** 2026-08-25

## Product boundary

OpenStrata is a secure operating system for strata and condominium communities. It can guide formation, produce reviewed templates, track legal and operational obligations, run meetings and votes, manage records, coordinate maintenance, and automate communications. It must not represent itself as a law firm, provide unreviewed legal advice, create a legally recognized corporation without the required registrar/land-title process, certify engineering or financial work, or replace licensed professionals.

Every legal workflow must show the jurisdiction, source title, section or form, effective date, last verified date, and a plain-language explanation. Legal content requires review and approval by qualified counsel before being labelled approved for production.

## Delivery order

- [ ] Establish the product, legal, privacy, and security operating model.
- [ ] Build the BC foundation and one complete strata workspace.
- [ ] Launch a controlled pilot with real strata councils and licensed professionals.
- [ ] Add jurisdiction packs one at a time, beginning with Alberta and Ontario.
- [ ] Add North American jurisdiction packs only after local legal, privacy, tax, records, and voting review.

## 1. Product foundation

- [ ] Define the canonical OpenStrata vocabulary: strata corporation, condominium corporation, strata lot, unit, owner, tenant, occupant, council, board, manager, owner developer, common property, limited common property, section, phase, fund, levy, bylaw, rule, resolution, notice, record, hearing, dispute, work order, vendor, asset, jurisdiction, and authority.
- [ ] Define the supported customer types: existing strata, newly forming strata, bare-land strata, phased development, leasehold strata, mixed-use strata, commercial condominium, and small self-managed community.
- [ ] Define the non-goals and prohibited claims in product copy, onboarding, templates, notifications, AI output, and marketing.
- [ ] Define the supported jurisdictions and feature maturity for each jurisdiction: research, draft, counsel-reviewed, pilot, production, and deprecated.
- [ ] Create a jurisdiction registry with province/state/country, governing terminology, legislation, regulations, prescribed forms, filing authorities, tribunals, privacy regime, language requirements, retention rules, and effective dates.
- [ ] Build a legal-content registry that stores source URL, official publisher, citation, section/form, jurisdiction, effective-from date, effective-to date, retrieved date, hash, reviewer, review status, notes, and superseded content.
- [ ] Define an immutable audit model for every material action and generated document.
- [ ] Define tenant isolation and the rule that no user can access another community's data without an explicit authorized relationship.
- [ ] Establish development, staging, pilot, and production environments.
- [ ] Establish backup, restore, disaster-recovery, incident-response, and business-continuity targets.
- [ ] Establish a data-classification policy for public, internal, confidential, personal, financial, legal-privileged, and highly sensitive data.
- [ ] Establish a support model with response targets, escalation paths, emergency handling, and after-hours boundaries.
- [ ] Establish a change-control process for legal content, workflow rules, financial calculations, and notification templates.

## 2. Technical architecture

- [ ] Recover or recreate the missing application source layer in the repository; the current workspace contains generated SvelteKit output and documentation but no readable `package.json` or route source files.
- [ ] Confirm the deployment target and environment-variable contract.
- [ ] Define the database schema and migrations.
- [ ] Implement tenant-aware authorization at the server boundary and database query boundary.
- [ ] Implement an API layer with request validation, idempotency keys, pagination, filtering, rate limits, and structured errors.
- [ ] Implement background jobs for reminders, document generation, imports, exports, recurring charges, and legal-source checks.
- [ ] Implement object storage for documents with encryption, checksums, virus scanning, versioning, retention, legal hold, and secure signed downloads.
- [ ] Implement full-text search with tenant and permission filters.
- [ ] Implement a notification abstraction for email, in-app, SMS where lawful and consented, and future integrations.
- [ ] Implement a template/rendering service for HTML, PDF, accessible PDF, CSV, and archival packages.
- [ ] Implement a rules engine with jurisdiction-versioned rules, explicit inputs, explainable outputs, and test fixtures.
- [ ] Implement an event log and outbox so automations are reliable and replayable.
- [ ] Implement application health checks, job health, dependency health, error tracking, audit monitoring, and security alerts.
- [ ] Add automated type checking, linting, unit tests, integration tests, end-to-end tests, accessibility tests, migration tests, and PDF snapshot tests.
- [ ] Add seeded demo data that is clearly synthetic and cannot be mistaken for a real strata record.

## 3. Accounts, identity, and permissions

- [ ] Add account creation, email verification, password reset, session management, logout-all-sessions, and device/session visibility.
- [ ] Add optional MFA and require stronger authentication for administrators, financial actions, exports, legal holds, and ownership changes.
- [ ] Support invitation-based onboarding for owners, tenants, council/board members, managers, accountants, lawyers, engineers, auditors, vendors, and observers.
- [ ] Implement role-based permissions.
- [ ] Implement resource-level permissions for private owner records, council records, legal files, financial records, maintenance files, and community announcements.
- [ ] Implement temporary access grants with start date, expiry date, scope, approver, and audit trail.
- [ ] Implement delegation, proxy, alternate contact, and acting-role records.
- [ ] Implement ownership verification and a review queue for changes.
- [ ] Implement tenant/occupant status, lease dates, landlord assignment, and voting-right assignment where applicable.
- [ ] Implement conflict-of-interest declarations for council/board members and vendors.
- [ ] Implement account suspension, offboarding, data export, and access revocation.
- [ ] Prevent privileged users from silently editing audit history.

## 4. New strata or condominium formation workflow

- [ ] Create a guided intake wizard for jurisdiction, municipality, property type, number of units/lots, phased status, mixed-use status, owner-developer status, and target formation date.
- [ ] Explain which parts require a lawyer, land surveyor, architect/engineer, accountant, insurance broker, lender, property manager, registrar, or land-title office.
- [ ] Create a formation checklist with dependencies, owners, due dates, status, evidence, reviewer, and escalation.
- [ ] Capture legal entity name, address for service, fiscal year, registered office, directors/council, unit entitlement, voting rights, common property, limited common property, parking, storage, sections, phases, and easements.
- [ ] Support upload and structured extraction of draft and registered plans, disclosure statements, title documents, permits, warranties, manuals, engineering reports, insurance documents, contracts, and developer records.
- [ ] Require human confirmation for every extracted legal, ownership, unit-entitlement, or financial value.
- [ ] Generate a jurisdiction-specific document checklist.
- [ ] Generate a formation timeline based on selected jurisdiction and property type.
- [ ] Track land-title/registrar filings and return filing status, receipt, rejection, correction, and approval.
- [ ] Track first conveyance and owner-developer control transition.
- [ ] Track interim budget, first annual budget, initial insurance, contingency reserve fund, first annual general meeting, transfer of records, and transition tasks.
- [ ] Track professional sign-offs and retain the signed evidence.
- [ ] Provide a “ready for lawyer review” export and a “ready for filing” export without claiming that OpenStrata itself filed anything.
- [ ] Provide a formation completion report listing completed, blocked, missing, stale, and counsel-required items.
- [ ] Support conversion of a formation workspace into an operating community workspace.

## 5. Community onboarding and configuration

- [ ] Create a building profile with address, municipality, timezone, language, emergency contacts, access instructions, and building type.
- [ ] Import or manually configure the strata/condo plan and all units/lots.
- [ ] Configure unit entitlements, voting entitlements, parking, storage, lockers, limited common property, sections, and owner relationships.
- [ ] Import owners and tenants through a secure CSV template with validation and duplicate detection.
- [ ] Provide a migration assistant for documents, financial balances, meeting history, maintenance records, vendor lists, and current bylaws/rules.
- [ ] Provide a verification report before imported information becomes authoritative.
- [ ] Provide a community-specific data retention and privacy configuration constrained by the jurisdiction pack.
- [ ] Configure notification preferences, quiet hours, emergency override, languages, and delivery channels.
- [ ] Configure approval thresholds and workflow signatories using the jurisdiction pack, not arbitrary user settings.
- [ ] Provide a visible “legal configuration needs review” status until a qualified reviewer approves the setup.

## 6. Document and records management

- [ ] Build a central document library with folders, tags, document types, permissions, versions, status, effective dates, expiration dates, source, owner, and review date.
- [ ] Support drag-and-drop upload, mobile capture, OCR, text extraction, malware scanning, checksum, duplicate detection, and redaction.
- [ ] Preserve the original file and every generated derivative.
- [ ] Provide immutable version history and comparison for text documents.
- [ ] Support legal hold and prevent deletion while a hold is active.
- [ ] Implement jurisdiction-specific retention schedules.
- [ ] Implement permanent-retention categories where required.
- [ ] Implement records-access request workflows with identity verification, scope, redaction, fee tracking, delivery, and audit log.
- [ ] Generate secure document request links with expiry and download logging.
- [ ] Generate annual records packages and transition packages.
- [ ] Support certified-copy workflow with human certification, date, signer, and certificate metadata.
- [ ] Provide accessible HTML views and tagged accessible PDFs.
- [ ] Provide export in an open structured format plus original documents.
- [ ] Track document acknowledgements and required reading.
- [ ] Add document expiration alerts for insurance, contracts, permits, reports, warranties, licenses, and professional certifications.

## 7. Legal source library and knowledge system

- [ ] Build a public-facing legal resource library separated from a private community document library.
- [ ] Show only official primary sources as “law” links; label government guidance, tribunal decisions, case law, association guidance, and commentary separately.
- [ ] Store a source record for every legal link with title, authority, jurisdiction, citation, topic, language, current-status URL, historical URL, effective date, last checked, and reviewer.
- [ ] Add source health checks for broken links, redirects, changed titles, changed content hashes, and superseded legislation.
- [ ] Add point-in-time legal versions so a historical meeting or decision can be evaluated against the law in effect on that date.
- [ ] Add section-level citations to every generated checklist, deadline, template, calculation, and warning.
- [ ] Add plain-language summaries with a prominent “not legal advice” label and counsel-review status.
- [ ] Add a search page with filters for jurisdiction, topic, source type, current/historical, language, and reviewed status.
- [ ] Add change alerts for administrators and counsel when monitored sources change.
- [ ] Add a legal-content approval queue with draft, legal-review, approved, published, superseded, and withdrawn states.
- [ ] Add an evidence trail showing who approved the content and which source version they reviewed.
- [ ] Add a source conflict workflow when government guidance and legislation appear inconsistent.
- [ ] Never let AI answer a legal question without citing the source records used, showing uncertainty, and offering escalation to counsel.
- [ ] Never silently infer a deadline when required facts are missing.

## 8. BC legal and operating coverage

- [ ] Model the BC Strata Property Act and all applicable strata regulations.
- [ ] Model Schedule of Standard Bylaws and strata-specific bylaw/rule overrides.
- [ ] Model owner-developer duties, transition, first AGM, interim budget, records, and contracts.
- [ ] Model council eligibility, elections, duties, standard of care, conflicts, remuneration, hearings, and accountability.
- [ ] Model AGM and SGM notice, agenda, quorum, attendance, proxies, voting, minutes, resolutions, and adjournment.
- [ ] Implement majority, 3/4, 80%, unanimous, and other prescribed vote calculations with explainable math.
- [ ] Validate eligible voters, shared votes, proxies, tenant assignments, mortgagee rights, arrears restrictions, and special voters.
- [ ] Support electronic and hybrid meetings with attendance, identity, communications, voting records, and meeting package distribution.
- [ ] Model Form B, Form F, Form C, Form W, Form V, and other applicable prescribed forms after counsel verification of the current regulation.
- [ ] Build a prescribed-form renderer that uses the current approved form version and blocks stale forms.
- [ ] Model strata corporation records and retention periods.
- [ ] Model budgets, financial statements, operating fund, contingency reserve fund, special levies, user fees, late charges, investments, and approvals.
- [ ] Model depreciation reports, five-year cycles, exemptions, qualified providers, report contents, and regional deadlines.
- [ ] Model electrical planning reports and EV charging infrastructure requests where applicable.
- [ ] Model insurance, deductibles, claims, renewals, coverage evidence, and owner notifications.
- [ ] Model repair and maintenance duties, common property, limited common property, alterations, access, emergencies, and work orders.
- [ ] Model bylaws, rules, enforcement notices, hearings, fines, chargebacks, exemptions, and appeal/dispute escalation.
- [ ] Model rental restrictions, tenant notices, assignments, move-in/move-out, and residential-tenancy boundaries.
- [ ] Model privacy obligations under BC PIPA and strata records access.
- [ ] Model Human Rights Code considerations and accommodation requests with restricted access.
- [ ] Model local government requirements, permits, waste rules, parking rules, fire/safety requirements, and emergency plans by municipality.
- [ ] Model tax and accounting handoffs without presenting tax advice.
- [ ] Link CRT and court escalation information, limitation warnings, and legal-referral workflows.

## 9. Governance and meetings

- [ ] Create meeting templates for council/board, AGM, SGM, committee, hearing, mediation, and emergency meetings.
- [ ] Generate compliant notices based on jurisdiction, delivery method, audience, agenda, and deadline.
- [ ] Track notice delivery, bounce, acknowledgement, proxy, attendance, and non-delivery remediation.
- [ ] Build agenda items with proposer, supporting documents, conflict declaration, motion text, required threshold, and decision state.
- [ ] Provide a resolution builder with plain-language explanation and counsel citation.
- [ ] Support live attendance and electronic participation.
- [ ] Support roll call, quorum calculation, chair, recorder, time-boxing, motions, amendments, points of order, and adjournment.
- [ ] Support secret-ballot handling only where the jurisdiction and meeting method permit it.
- [ ] Support anonymous vote presentation while retaining lawful audit evidence.
- [ ] Prevent voting when eligibility, proxy, quorum, or threshold requirements are unresolved.
- [ ] Generate minutes from structured meeting events, never only from free-form AI transcription.
- [ ] Require human approval before minutes or resolutions become official.
- [ ] Publish approved minutes and resolutions according to permissions and privacy rules.
- [ ] Track follow-up tasks from every meeting.
- [ ] Build election nomination, ballot, counting, result, challenge, and office-holder workflow.
- [ ] Provide a council/board dashboard showing upcoming obligations, unresolved decisions, expiring appointments, and conflicts.

## 10. Finance and payments

- [ ] Model owner ledgers, strata fees, assessments, special levies, interest, credits, adjustments, and arrears.
- [ ] Model operating fund and contingency/reserve fund separately.
- [ ] Build annual budget workflow with assumptions, historical actuals, forecast, allocations, approvals, and publication.
- [ ] Build special-levy workflow with purpose, amount, allocation, threshold, due dates, notices, payment status, and approval evidence.
- [ ] Provide invoice intake, purchase approval, coding, duplicate detection, vendor verification, and payment status.
- [ ] Provide bank reconciliation import and exception review.
- [ ] Provide monthly financial package generation.
- [ ] Provide year-end accountant/auditor package export.
- [ ] Track deposits, transfers, authorized signers, dual approvals, and investment records.
- [ ] Add payment provider integration only after provider selection, privacy review, fees review, and reconciliation design.
- [ ] Never store full card numbers or banking credentials in OpenStrata.
- [ ] Support receipts, payment plans, hardship requests, arrears notices, and legal escalation with jurisdiction-specific controls.
- [ ] Provide financial audit logs and prevent silent balance edits.
- [ ] Provide read-only owner statements and downloadable tax/accounting records.

## 11. Maintenance, assets, and building operations

- [ ] Create an asset register for buildings, roofs, envelopes, elevators, HVAC, plumbing, electrical, fire systems, security, landscaping, roads, amenities, and other common assets.
- [ ] Link each asset to location, manufacturer, serial number, install date, expected life, warranty, manuals, vendor, inspection schedule, and replacement plan.
- [ ] Import depreciation/reserve reports and map report components to assets.
- [ ] Create preventive-maintenance schedules with recurring tasks, seasonal rules, and escalation.
- [ ] Create work requests with category, priority, location, photos, access instructions, privacy controls, and requester.
- [ ] Create triage, approval, assignment, scheduling, dispatch, quote, completion, inspection, invoice, and closure states.
- [ ] Support emergency workflows for water, fire, power, elevator, security, hazardous conditions, and weather.
- [ ] Maintain emergency contact trees and escalation acknowledgements.
- [ ] Track permits, inspections, deficiencies, remediation, and reinspection.
- [ ] Track warranties, service contracts, renewals, SLAs, insurance claims, and vendor certificates.
- [ ] Maintain vendor profiles, licences, insurance, safety records, references, contracts, pricing, and conflicts.
- [ ] Support quote comparison and approval evidence.
- [ ] Provide resident updates without exposing private contractor or owner information.
- [ ] Generate maintenance history, asset history, reserve forecast, and outstanding-risk reports.
- [ ] Add optional building sensor integrations only with explicit privacy, security, retention, and procurement controls.

## 12. Resident and owner experience

- [ ] Build role-specific dashboards for owner, tenant, council/board, manager, vendor, professional, and administrator.
- [ ] Show tasks, notices, meetings, votes, balances, requests, documents, and alerts in one place.
- [ ] Provide a universal search scoped to the user's permissions.
- [ ] Provide a community announcement feed with expiry, audience, acknowledgement, translation, and emergency override.
- [ ] Provide resident service requests and status tracking.
- [ ] Provide move-in/move-out booking and elevator/loading-zone scheduling where configured.
- [ ] Provide amenity and common-space reservations with rules and deposits where lawful.
- [ ] Provide parking and storage records with controlled visibility.
- [ ] Provide package/visitor workflows only if the community elects to use them and privacy impact is approved.
- [ ] Provide issue reporting with optional confidential submission and anti-retaliation controls.
- [ ] Provide accessible mobile-responsive web experience before native apps.
- [ ] Provide notifications that link directly to the required action, not just a generic dashboard.
- [ ] Provide language selection and translated content review workflow.

## 13. Automation engine

- [ ] Build a visual workflow builder for authorized administrators.
- [ ] Include triggers: date, deadline, record created, document expires, payment overdue, vote state, meeting state, work-order state, vendor credential expiry, legal source change, and emergency declaration.
- [ ] Include actions: create task, assign task, send notice, request acknowledgement, generate document, request approval, escalate, schedule meeting, open work order, lock record, export package, and notify counsel.
- [ ] Include conditions based on jurisdiction, building type, role, status, threshold, amount, and required evidence.
- [ ] Include recurring schedules and holiday-aware deadline calculation.
- [ ] Include pause, resume, retry, idempotency, dead-letter, and manual recovery.
- [ ] Show the reason for every automated action and the rule/source that caused it.
- [ ] Require approval for legal notices, financial releases, official minutes, bylaw enforcement, ownership changes, and high-risk communications.
- [ ] Prevent automation from making legal determinations from incomplete data.
- [ ] Provide test mode with synthetic data and a preview of every generated message.
- [ ] Provide an automation activity log and per-community controls.
- [ ] Provide default BC automations, each counsel-reviewed before production.
- [ ] Add reminders for AGM, SGM, council meetings, insurance renewal, depreciation report, electrical planning report, tax/accounting dates, contracts, permits, and records requests.
- [ ] Add escalation ladders for overdue owner responses, unpaid levies, unresolved work orders, expiring coverage, and missing records.
- [ ] Add digest notifications to reduce unnecessary messages.
- [ ] Add emergency broadcast with approval, audience targeting, delivery confirmation, and post-event archive.

## 14. Templates to create and review

- [ ] Formation intake and professional referral checklist.
- [ ] Owner-developer transition checklist.
- [ ] First AGM checklist, agenda, notice, attendance, resolutions, minutes, and handoff package.
- [ ] AGM and SGM notice, agenda, proxy, ballot, scrutineer, motion, minutes, and result templates.
- [ ] Council/board meeting agenda, minutes, decision register, conflict declaration, and action register.
- [ ] Budget approval, financial package, special levy, payment plan, arrears, and receipt templates.
- [ ] Form B, Form F, Form C, Form W, Form V, and all other current prescribed BC forms, subject to counsel verification.
- [ ] Records request, inspection appointment, response, redaction, and delivery templates.
- [ ] Bylaw/rule proposal, notice, hearing invitation, decision, fine, and follow-up templates.
- [ ] Maintenance request, access notice, emergency notice, work order, quote request, completion, and warranty claim templates.
- [ ] Insurance renewal, incident report, claim notification, deductible communication, and repair authorization templates.
- [ ] Depreciation-report procurement, provider request, review meeting, owner notice, and action-plan templates.
- [ ] Electrical planning report and EV request intake templates.
- [ ] Vendor onboarding, insurance certificate, licence verification, contract approval, and offboarding templates.
- [ ] Privacy notice, consent, access request, correction request, breach notice, retention notice, and deletion response templates.
- [ ] Accommodation request and confidential review templates.
- [ ] Dispute intake, internal complaint, council hearing, mediation preparation, CRT referral, and counsel referral templates.
- [ ] New-jurisdiction template packs with explicit local review status.

## 15. AI assistance with controls

- [ ] Limit AI to drafting, classification, extraction, summarization, search assistance, and workflow suggestions unless a human approves the output.
- [ ] Require source citations and confidence indicators for legal and compliance answers.
- [ ] Prevent AI from inventing statutes, sections, deadlines, forms, votes, balances, or meeting results.
- [ ] Require human confirmation for extracted names, amounts, dates, legal rights, ownership, unit entitlements, and vote eligibility.
- [ ] Keep private community data out of model training by contract and technical controls.
- [ ] Redact or minimize personal data sent to external model providers.
- [ ] Log prompts, retrieved sources, outputs, reviewer, final decision, and model version for high-risk workflows.
- [ ] Add prompt-injection and malicious-document defenses.
- [ ] Provide “show source,” “flag uncertainty,” “request human review,” and “do not use AI” controls.
- [ ] Red-team AI against fake legislation, stale law, conflicting bylaws, incomplete records, privacy leaks, and adversarial uploads.

## 16. Privacy, security, and trust

- [ ] Complete a privacy impact assessment for the BC launch.
- [ ] Appoint a privacy owner and define contact/escalation procedures.
- [ ] Publish privacy policy, collection notices, consent language, retention schedule, subprocessors, and breach process.
- [ ] Minimize personal data collection and make optional fields genuinely optional.
- [ ] Implement consent, withdrawal, access, correction, disclosure, retention, and deletion workflows where permitted.
- [ ] Separate community-public, owner-visible, council-visible, manager-visible, legal-private, and administrator-only records.
- [ ] Encrypt data in transit and at rest.
- [ ] Use managed secrets and rotate credentials.
- [ ] Add secure headers, CSRF protection, XSS defenses, SSRF defenses, upload validation, malware scanning, and rate limits.
- [ ] Add least-privilege service accounts and database credentials.
- [ ] Add immutable audit logs for authentication, permissions, records, financial actions, votes, notices, exports, and administrative changes.
- [ ] Add anomaly detection for bulk downloads, privilege escalation, unusual login, and unusual financial actions.
- [ ] Perform dependency, SAST, DAST, secret, and infrastructure scans.
- [ ] Commission an independent penetration test before production handling of real strata records.
- [ ] Define data residency and cross-border transfer policy before using external providers.
- [ ] Define breach triage, containment, notification, evidence preservation, and post-incident review.
- [ ] Ensure backups are encrypted, isolated, tested, and subject to retention/deletion rules.

## 17. Accessibility, language, and inclusive design

- [ ] Meet WCAG 2.2 AA for the web application and generated documents where practical and applicable.
- [ ] Support keyboard-only operation, focus management, screen readers, high contrast, zoom, reduced motion, and accessible error messages.
- [ ] Ensure meetings, votes, forms, PDFs, charts, and notifications are accessible.
- [ ] Provide plain-language explanations without hiding the original legal text.
- [ ] Support English first and design for French and additional languages from the beginning.
- [ ] Keep translations versioned and reviewed; never auto-publish machine translation of legal text.
- [ ] Support accommodation workflows with restricted confidential records.
- [ ] Test with disabled users and accessibility specialists.

## 18. Billing and commercial operations

- [ ] Define pricing by community size, modules, storage, automation volume, and professional services.
- [ ] Define trial, pilot, nonprofit, self-managed, manager-managed, and enterprise plans.
- [ ] Add organization billing roles separate from community governance roles.
- [ ] Add invoices, taxes, receipts, refunds, failed payments, plan changes, and cancellation.
- [ ] Add data export and offboarding before account cancellation.
- [ ] Add service terms, acceptable use, data processing terms, uptime policy, support terms, and professional-services terms.
- [ ] Make clear that subscription fees do not include legal, accounting, engineering, surveying, insurance, filing, or tribunal fees.
- [ ] Track professional referral relationships transparently and avoid undisclosed conflicts.

## 19. Integrations

- [ ] Design integrations around least privilege and revocable tokens.
- [ ] Add calendar integration for meetings, inspections, deadlines, and bookings.
- [ ] Add email delivery and inbound reply handling.
- [ ] Add optional SMS with consent, opt-out, delivery logging, and emergency policy.
- [ ] Add accounting export/import with reconciliation safeguards.
- [ ] Add payment provider integration after a documented provider review.
- [ ] Add video meeting integration with attendance and privacy controls.
- [ ] Add e-signature integration only after legal enforceability and identity requirements are reviewed per jurisdiction.
- [ ] Add municipal, land-title, registry, or filing integrations only where official APIs and authorization exist.
- [ ] Add property-management exports/imports using documented schemas.
- [ ] Add webhooks and API keys with scopes, expiration, rotation, and audit logs.
- [ ] Add an integration directory with status, data shared, permissions, subprocessor, and disconnect procedure.

## 20. Testing and acceptance

- [ ] Create jurisdiction-specific legal rule fixtures with counsel-approved expected outcomes.
- [ ] Test every voting threshold with normal, boundary, tie, proxy, shared-owner, arrears, and missing-data cases.
- [ ] Test deadline calculations across timezones, holidays, leap years, weekends, and point-in-time law versions.
- [ ] Test document rendering against current approved forms.
- [ ] Test retention, legal hold, export, deletion, and restore.
- [ ] Test tenant isolation with malicious cross-community requests.
- [ ] Test all role combinations and temporary permissions.
- [ ] Test notification delivery, bounce, retry, duplicate prevention, and opt-out.
- [ ] Test payment idempotency and reconciliation.
- [ ] Test emergency workflows under partial service failure.
- [ ] Test accessible workflows on keyboard, screen reader, zoom, and mobile.
- [ ] Test AI failure modes and citation requirements.
- [ ] Test migration from spreadsheets and common property-management exports.
- [ ] Run load tests for meetings, voting, document generation, and emergency broadcasts.
- [ ] Run disaster-recovery restore drills.
- [ ] Conduct pilot acceptance with a strata council, manager, owner, tenant, and licensed professional.

## 21. BC pilot and launch gates

- [ ] Select 3 to 5 pilot communities with different sizes and operating models.
- [ ] Obtain written pilot agreements and consent for test data.
- [ ] Complete counsel review of the BC legal pack and every production template.
- [ ] Complete privacy impact assessment and security review.
- [ ] Complete accessibility review.
- [ ] Complete professional review of financial, engineering, depreciation, insurance, and formation workflows.
- [ ] Complete migration and rollback plans for each pilot.
- [ ] Run shadow mode beside existing processes before automating notices or money movement.
- [ ] Require human approval for all legally significant outputs during pilot.
- [ ] Measure task completion, missed deadlines, support burden, notice delivery, records retrieval, vote accuracy, and user satisfaction.
- [ ] Create a legal-content incident process for stale or incorrect guidance.
- [ ] Publish launch limitations and supported use cases.
- [ ] Launch only after all critical security, privacy, legal, accessibility, and data-integrity gates pass.

## 22. Canada expansion

- [ ] Create a separate jurisdiction pack for every province and territory.
- [ ] Do not reuse BC names, forms, voting thresholds, reserve-fund rules, dispute paths, privacy rules, or notice periods across jurisdictions.
- [ ] Map local terminology: strata, condominium, condo corporation, syndicate, co-ownership, unit, lot, board, council, declaration, bylaws, rules, reserve fund, contingency fund, and maintenance fund.
- [ ] Map official legislation, regulations, prescribed forms, land-title/registry authority, registrar, tribunal/court, professional licensing, tax, privacy, accessibility, human-rights, tenancy, and building-safety sources.
- [ ] Obtain local counsel review for each pack.
- [ ] Add French language review for Quebec and federally relevant content.
- [ ] Add local holiday calendars, timezones, currencies, taxes, filing fees, and deadline rules.
- [ ] Add local formation and document-transfer workflows.
- [ ] Add local meeting, voting, records, reserve-fund, insurance, enforcement, and dispute workflows.
- [ ] Pilot each new jurisdiction separately before enabling production automation.
- [ ] Version and retire packs when legislation changes.

## 23. North America expansion

- [ ] Define a jurisdiction coverage policy for US states, territories, Mexico, and other markets.
- [ ] Treat every state/province as a separate legal product pack.
- [ ] Map condominium, HOA, co-op, strata, planned-community, and common-interest-community models separately.
- [ ] Map federal, state/provincial, county, municipal, building, fire, accessibility, fair-housing/human-rights, privacy, tax, records, and election requirements.
- [ ] Support US state-specific disclosure, resale certificate, reserve-study, insurance, collections, lien, meeting, proxy, ballot, and dispute rules.
- [ ] Support cross-border data-transfer, payment, tax, language, consumer-protection, and accessibility requirements.
- [ ] Establish local counsel and qualified professional networks before launch in each market.
- [ ] Never market “North America compliant” as a single feature; market supported jurisdictions and verified feature coverage.

## 24. Administration and quality controls

- [ ] Create an internal legal editorial board.
- [ ] Create a jurisdiction owner for every supported market.
- [ ] Schedule source checks at least weekly for high-risk legislation and monthly for lower-risk guidance, with manual review for every detected change.
- [ ] Maintain a change log for legislation, rules, templates, calculators, and workflows.
- [ ] Maintain a known-limitations register.
- [ ] Maintain a source-confidence and review-status indicator in the UI.
- [ ] Publish a transparent update policy and incident history where appropriate.
- [ ] Train support staff on escalation and prohibited legal advice.
- [ ] Train administrators on permissions, records, privacy, and emergency procedures.
- [ ] Provide in-product feedback and correction reporting.
- [ ] Run quarterly access reviews and annual security/privacy reviews.
- [ ] Run annual legal pack re-approval and after every material legal change.

## Definition of done for a production jurisdiction

- [ ] Primary legal sources are catalogued and monitored.
- [ ] Legislation, regulations, forms, terminology, deadlines, vote rules, records, privacy, disputes, and professional requirements are mapped.
- [ ] Counsel has reviewed the pack and production templates.
- [ ] Automated rules have fixtures and passing tests.
- [ ] Accessibility, security, privacy, and disaster-recovery gates pass.
- [ ] At least one real-world pilot has completed successfully.
- [ ] Support, escalation, correction, and legal-content incident processes are live.
- [ ] Product copy clearly states the supported scope and limitations.
