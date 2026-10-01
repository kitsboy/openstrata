# Project Summary — OpenStrata (Hermes Strata)

**What:** A SvelteKit-based strata property management and compliance platform.
**Domain:** openstrata.giveabit.io
**Version:** v0.3.28 + Evergreen House workspace (SvelteKit 2 + Svelte 5, backend in `backend/`)
**Last Updated:** 2026-09-30

## One-Liner
OpenStrata brings Bitcoin sovereignty to strata property management — with BCFSA compliance tools, interactive wizards, pitch decks, and a complete documentation suite for strata councils.

## Core Features
- Evergreen House demo: 40 lots, 4 floors, three separate funds, and a CRA desk (sample data, not a filing)
- Pay page where e-transfer, Bitcoin, and Lightning are always offered. Destinations are demo-only
- UI refinement is standing work, not a finished phase. Four upgrades are offered and not started (floor plan, one-lot pay sheet, September close, one 30-day strip). After every UI push, offer exactly four and wait for a pick of one or two. See `docs/ROADMAP.md`
- Compliance tools (BCFSA — BC Financial Services Authority)
- Strata wizard for property setup and management
- Bar/Line chart visualizations for financial data
- Pitch deck for investor/stakeholder presentations
- Blog, roadmap, and documentation portal
- RSS feed for updates
- Donation modal for community funding
- Tools for strata fee calculations and projections

## Tech Stack
SvelteKit 2 + Svelte 5 + TypeScript + Vite 6 + Tailwind CSS v4
Static SPA deployed to Cloudflare Pages

## Integrations
- Satohash API client present in `src/lib/satohash.ts` (thin HTTP client, graceful offline) — UI wiring deferred until Satohash API is confirmed ready
- Phase 3 backend (`backend/`): immutable trust ledger, Rosa compliance RAG, Ziggy treasury, fee billing + late notices, bylaw enforcement, Form B/F, meetings, and sovereign payment rails (Bitcoin on-chain, Lightning/LNURL, Liquid, PayNym BIP-47, Nostr) with BIP-173 checksum validation, wired as `/api/v1/*` behind Fastify. Rails are prepared-but-not-connected (daemons provisioned later)

## Quality gates
- `npm run check` passes (0 errors, 0 warnings) as of the Evergreen House commit
- `npm test` at the repo root: 248 frontend tests as of 2026-09-30. Key count moves; run `npm run audit:i18n` rather than trusting an old number
- `npm run build` passes via Cloudflare Pages auto-deploy from main
- `backend/` — `npm test` inside `backend/`. Last recorded count was 229 at v0.3.26; re-run before quoting it

