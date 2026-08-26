# Context Map — OpenStrata (Hermes Strata)

Updated: 2026-08-26

## Stack
Framework: SvelteKit 2 + Svelte 5
Language: TypeScript
Build: Vite 6
CSS: Tailwind CSS v4
Hosting: Cloudflare Pages (static SPA)

## Phase 3 Backend (`backend/`)
Runtime: Node 22 + TypeScript (ESM)
API: Fastify 5
DB: PostgreSQL 17 + pgvector
Orchestration: Docker Compose (Tailscale-only exposure)
Tests: Vitest (isolated from frontend suite)

Services: ledger (append-only trust ledger), rosa (compliance RAG), ziggy (treasury state machine), billing (strata-fee billing + late notices), enforcement (bylaw state machine), forms (Form B/F), meetings (quorum + voting), rails (Bitcoin/L2 payments), auth (multi-tenant councils — JWT bearer tokens, admin/treasurer/member roles, tenant-scoped routes), api (Fastify).

Commands (from backend/):
- `npm run typecheck`, `npm test`, `npm run dev`
- `npm run cli -- rosa ingest`   validate + probe the BC compliance corpus (pure, no DB)
- `npm run cli -- ziggy simulate` walk treasury scenarios through the state machine (pure)
- Migrate: `npm run migrate`; seed: `npm run seed`

API reference: `backend/API.md` (full request/response shapes).

## Directory Structure
openstrata/
backend/
  docker-compose.yml
  API.md
  src/{config.ts,index.ts,cli.ts}
  src/ledger/     schema.sql, migrations/*.sql, model.ts, ledger.ts, store.ts
  src/rosa/       rosa.ts, bc-corpus.ts
  src/ziggy/      ziggy.ts
  src/trf/        recon.ts
  src/billing/    billing.ts
  src/enforcement/ enforcement.ts
  src/forms/      forms.ts
  src/meetings/   meetings.ts
  src/rails/      rails.ts, payment-request.ts, payment-store.ts
  src/auth/       model.ts, jwt.ts, passwords.ts, store.ts, mem-store.ts, pg-store.ts
  src/api/        server.ts
  tests/          memstore.ts, {ledger,rosa,ziggy,billing,enforcement,forms,meetings,rails,server,auth}.test.ts, e2e-smoke.test.ts (runs only with DATABASE_URL)
src/
  app.html                  SvelteKit HTML shell
  app.css                   Tailwind CSS entry point
  routes/                   SvelteKit file-based routes
    +layout.svelte          Root layout (UI shell)
    +page.svelte            Homepage
    about/+page.svelte
    blog/+page.svelte
    compliance/+page.svelte    BCFSA compliance tools
    docs/+page.svelte
    faq/+page.svelte
    legal/+page.svelte
    pitch/+page.svelte
    roadmap/+page.svelte
    rss/+page.svelte
    rss.xml/+server.ts      Prerendered RSS 2.0 feed
    spec/+page.svelte
    templates/+page.svelte
    tools/+page.svelte
    tools/wizard/+page.svelte
  lib/
    components/
      BarChart.svelte, Icon.svelte, LineChart.svelte
      JobsDropdown.svelte, DonateModal.svelte
    data.ts, nav.ts, icons.ts
    compliance.ts, marketing.ts, strata-tool.ts
public/
docs/
  KIMI-HANDOFF.md
  diligence/               Self-evolving packs

## Routes
/  /about  /blog  /compliance  /docs  /faq  /legal  /pitch
/roadmap  /rss  /rss.xml  /spec  /templates  /tools  /tools/wizard

## Deployment
Auto-deploy from GitHub main to Cloudflare Pages (project: openstrata)