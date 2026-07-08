# SOP — OpenStrata (Hermes Strata)

> **Stack**: SvelteKit 2 + Svelte 5 + TypeScript + Vite 6 + Tailwind CSS 4
> **Type**: SPA / static site (SPA fallback via adapter-static)
> **Domain**: openstrata.giveabit.io
> **Repo**: https://github.com/kitsboy/openstrata

---

## Prerequisites

- Node.js >= 18
- npm (ships with Node.js)

---

## 1. Install

```bash
npm install
```

Installs all dependencies from `package-lock.json`. No runtime dependencies — all packages are devDependencies (SvelteKit, Vite, Tailwind, TypeScript, Wrangler, adapters).

---

## 2. Dev (local development server)

```bash
npm run dev
```

Launches the **SvelteKit dev server** (via `vite dev`). Default port: **5173**.

- Opens at `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Compiles on the fly — no build step needed
- SvelteKit handles both client and server-side logic (even in SPA/static mode, dev server provides full routing)

---

## 3. Build (production)

```bash
npm run build
```

Produces a static export into `build/` (via `vite build` + `@sveltejs/adapter-static`).

- **Adapter**: `@sveltejs/adapter-static` with `fallback: "404.html"` (SPA fallback — all unknown routes served by the root)
- **Output**: `build/` directory containing:
  - `index.html`, `about.html`, `blog.html`, `compliance.html`, `docs.html`, `pitch.html`, `roadmap.html`, `rss.html`, `spec.html`, `tools.html`, `404.html` — one `.html` per route
  - `_app/immutable/` — hashed JS/CSS bundles
  - `_headers`, `_redirects` — Cloudflare Pages config
- **No server runtime** — purely static HTML + JS + CSS

---

## 4. Preview (local production test)

```bash
npm run preview
```

Serves the `build/` directory locally (via `vite preview`). Default port: **4173**.

- Tests the static build output before deploying
- Does NOT require a build step to have been run separately (but build must exist from a prior `npm run build`)

---

## 5. Deploy

Deployed to **Cloudflare Pages** (via Wrangler CLI or Cloudflare dashboard).

```bash
npx wrangler pages deploy build/ --project-name openstrata
```

- Build output directory: `build/`
- Custom domain: `openstrata.giveabit.io`
- SPA fallback: `404.html` (configured in svelte.config.js -> adapter-static)
- `_headers` and `_redirects` files in both `public/` and `build/` are respected by Cloudflare

---

## Notes

- **Not React** — this is a SvelteKit project using Svelte 5 runes syntax
- Both `public/` and `static/` directories exist (contents are identical — `_headers`, `_redirects`, `logo.png`)
- TypeScript strict mode enabled in `tsconfig.json`
- The `archive/` directory contains deprecated/backup files
