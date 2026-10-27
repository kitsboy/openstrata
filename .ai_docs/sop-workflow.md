# OpenStrata — Standard Operating Procedure

Updated: 2026-10-26

## Quick Commands (frontend, from repo root)
npm run dev              SvelteKit dev server
npm run build            Production build to build/
npm run preview          Preview production build
npm run check            SvelteKit type checking
npm run test             Vitest run (frontend)
npm run audit:i18n       locale parity (error) + hard-coded copy scan (warning)
npm run audit:contrast   WCAG contrast for every token pair, plus fill-literal and var() guards
npm run check:security   secret-hygiene gate — currently red on 15 fixtures, see current-status.md

CI runs check, audit:i18n, audit:contrast and build on every push. The two audits and
check:security also run locally; only the audits are live gates. audit:i18n's hard-coded
copy list is informational today (113 entries — six routes are not localized at all).

## Quick Commands (backend, from backend/)
npm run typecheck        tsc --noEmit
npm run build            tsc -p tsconfig.json (emit)
npm test                 Vitest run (isolated from frontend suite)
npm run dev              tsx watch on src/index.ts
npm run cli -- rosa ingest    validate + probe the BC compliance corpus (no DB)
npm run cli -- ziggy simulate walk treasury scenarios through the state machine (no DB)
npm run migrate          apply trust-ledger migrations (idempotent, serialized, checksummed)
npm run migrate:check    read-only preflight: checksums, missing and orphan drift (no writes)
npm run seed             seed a demo community (idempotent)

The Postgres E2E tests skip themselves when DATABASE_URL is unset, which is the normal
state here — 6 of the suite skip, so a green run does not cover the durable path.

## API Reference
Fastify surface at `backend/API.md` — every /api/v1 endpoint + payload shapes.

## Deployment
git push origin main triggers Cloudflare Pages auto-deploy of the static site (project: openstrata).
The `backend/` Phase 3 services deploy separately (Docker Compose on a Tailscale-only host) — not on Cloudflare Pages.

## Agent Protocol
1. Read GROK-SESSION-PROTOCOL.md
2. Read .ai_docs/current-status.md and project-summary.md
3. Work on project
4. Update .ai_docs/current-status.md and docs/KIMI-HANDOFF.md
5. Push to origin main