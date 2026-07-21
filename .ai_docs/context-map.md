# Context Map — OpenStrata (Hermes Strata)

Updated: 2026-07-16

## Stack
Framework: SvelteKit 2 + Svelte 5
Language: TypeScript
Build: Vite 6
CSS: Tailwind CSS v4
Hosting: Cloudflare Pages (static SPA)

## Directory Structure
openstrata/
src/
  app.html                  SvelteKit HTML shell
  app.css                   Tailwind CSS entry point
  routes/                   SvelteKit file-based routes
    +layout.ts              Root layout
    +layout.svelte          Root layout (UI shell)
    +page.svelte            Homepage
    about/+page.svelte
    blog/+page.svelte
    compliance/+page.svelte    BCFSA compliance tools
    docs/+page.svelte
    pitch/+page.svelte
    roadmap/+page.svelte
    rss/+page.svelte
    spec/+page.svelte
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
/  /about  /blog  /compliance  /docs  /pitch
/roadmap  /rss  /spec  /tools  /tools/wizard

## Deployment
Auto-deploy from GitHub main to Cloudflare Pages (project: openstrata)
