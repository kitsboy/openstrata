# OpenStrata — Standard Operating Procedure

Updated: 2026-08-25

## Quick Commands (frontend, from repo root)
npm run dev              SvelteKit dev server
npm run build            Production build to build/
npm run preview          Preview production build
npm run check            SvelteKit type checking

## Quick Commands (backend, from backend/)
npm run typecheck        tsc --noEmit
npm test                 Vitest run (isolated from frontend suite)
npm run dev              tsx watch on src/index.ts
npm run cli -- rosa ingest    validate + probe the BC compliance corpus (no DB)
npm run cli -- ziggy simulate walk treasury scenarios through the state machine (no DB)
npm run migrate          apply trust-ledger migrations (idempotent)
npm run seed             seed a demo community (idempotent)

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