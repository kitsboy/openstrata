# Project Summary — OpenStrata (Hermes Strata)

**What:** A SvelteKit-based strata property management and compliance platform.
**Domain:** openstrata.giveabit.io
**Version:** v0.2.6 (SvelteKit 2 + Svelte 5)
**Last Updated:** 2026-08-25

## One-Liner
OpenStrata brings Bitcoin sovereignty to strata property management — with BCFSA compliance tools, interactive wizards, pitch decks, and a complete documentation suite for strata councils.

## Core Features
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
- Lightning/payment rails planned for Phase 4

## Quality gates
- `npm run check` passes (0 errors, 0 warnings)
- `npm run audit:i18n` passes (461 keys, hard-coded-copy scanner)
- `npm run build` passes via Cloudflare Pages auto-deploy from main

