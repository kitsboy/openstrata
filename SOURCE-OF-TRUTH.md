# SOURCE-OF-TRUTH — OpenStrata / Hermes Strata

**Generated:** July 2026  
**Machine:** M3 (dev) ↔ M4 HERMES / Obsidian via Tailscale  
**GitHub:** https://github.com/kitsboy/openstrata

---

## Project Identity

- **Name:** Hermes Strata (OpenStrata protocol)
- **One-line:** BCFSA-aware strata operations software — cheaper, faster, provable. Fiat + optional Bitcoin sovereignty.
- **Folder:** `/Users/cam/projects/openstrata`
- **Live:** Deployed via Cloudflare (static SvelteKit build)
- **Parent:** Give A Bit (https://giveabit.io)
- **Contact:** hello@giveabit.io

---

## Related Give A Bit Projects

| Project | Role | Status |
|---------|------|--------|
| **Satohash** (satohash.io) | Proof layer — OpenTimestamps | v4.1 in progress |
| **OpenStrata** (this repo) | Operations + protocol | Marketing site live |
| **Hermes** (M4) | Orchestrator agent | Kimi on M4 |

---

## Tech Stack

- **Frontend:** SvelteKit 2 + Svelte 5 + Tailwind CSS 4
- **Build:** Vite 6, adapter-static → Cloudflare
- **No backend yet** — mock data in `src/lib/`. Phase 3 adds Docker API.

```bash
npm install && npm run dev    # localhost:5173
npm run build                 # output: build/
```

---

## Critical Files — DO NOT DELETE OR REORGANIZE WITHOUT READING

| File | Purpose |
|------|---------|
| `src/lib/compliance.ts` | BC SPA/BCFSA structured knowledge — Rosa corpus source |
| `src/lib/strata-tool.ts` | 30+ tool modules — product map |
| `src/lib/marketing.ts` | Facts, savings, BCFSA positioning |
| `src/lib/data.ts` | Mock data, API endpoints, jobs, units |
| `src/lib/nav.ts` | Navigation — update here for new pages |
| `docs/BC-STRATA-COMPLIANCE.md` | Compliance markdown archive |
| `docs/KIMI-HANDOFF.md` | **Read this first on M4** |
| `docs/WORKPLAN.md` | Phase tracker |
| `public/logo.png` | Brand logo — header, footer, favicon |

---

## Routes

| Path | Page |
|------|------|
| `/` | Dashboard (homepage) |
| `/about` | Marketing, cost savings, product stack |
| `/compliance` | BC compliance knowledge base |
| `/roadmap` | Paths, timeline, jurisdictions |
| `/tools` | Strata Tool hub (30+ modules) |
| `/docs` | Framework docs index |
| `/rss` | RSS feeds + API reference |
| `/spec` | OpenStrata protocol spec |
| `/blog` | Announcements |

---

## Regulatory Positioning

**Hermes is software, not a licensed management company.**

Three paths: Licensed Brokerage Partner | Self-Managed Council | Hybrid.

See `docs/BCFSA-STRATEGY.md`.

---

## What Was Built (Jul 2026 Session — Grok/Cursor on M3)

1. Full light-themed marketing site from hermes-strata-app-framework-v2.md
2. BC compliance KB (triple retention)
3. 30+ Strata Tool modules
4. Executive docs, workplan, product plan, roadmap
5. About page, supercharged homepage with graphs
6. Kimi handoff prompt
7. Brand logo integration
8. Satohash/OpenStrata product stack positioning

---

## Next Actions for Kimi

1. Read `docs/KIMI-HANDOFF.md` in full
2. Ingest into Obsidian MASTER-BRAIN
3. Do NOT rebuild from scratch — extend existing SvelteKit site
4. Phase 2 next: Building Template Wizard
5. Coordinate with Satohash handoff when Cam ready

---

*© Give A Bit — Bitcoin sovereignty first.*