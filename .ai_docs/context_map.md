# Context Map — OpenStrata (Hermes Strata)

> **Project footprint**: SvelteKit 2 + Svelte 5 + TypeScript + Vite 6 + Tailwind CSS 4 static SPA

---

## Directory Structure

```
openstrata/
├── src/                          # Application source
│   ├── app.html                  # SvelteKit HTML shell
│   ├── app.css                   # Tailwind CSS entry point
│   ├── routes/                   # SvelteKit file-based routes
│   │   ├── +layout.ts            # Root layout (load function)
│   │   ├── +layout.svelte        # Root layout (UI shell)
│   │   ├── +page.svelte          # Homepage
│   │   ├── about/+page.svelte
│   │   ├── blog/+page.svelte
│   │   ├── compliance/+page.svelte
│   │   ├── docs/+page.svelte
│   │   ├── pitch/+page.svelte
│   │   ├── roadmap/+page.svelte
│   │   ├── rss/+page.svelte
│   │   ├── spec/+page.svelte
│   │   ├── tools/+page.svelte
│   │   └── tools/wizard/+page.svelte
│   └── lib/                      # Shared modules
│       ├── components/
│       │   ├── BarChart.svelte
│       │   ├── Icon.svelte
│       │   ├── LineChart.svelte
│       │   ├── JobsDropdown.svelte
│       │   └── DonateModal.svelte
│       ├── data.ts               # Data layer
│       ├── nav.ts                # Navigation config
│       ├── icons.ts              # SVG icon defs
│       ├── compliance.ts         # BCFSA compliance logic
│       ├── marketing.ts          # Marketing helpers
│       └── strata-tool.ts        # Strata tool modules
├── static/                       # Static assets (deployed as-is)
│   ├── _headers                  # Cloudflare headers config
│   ├── _redirects                # Cloudflare redirects config
│   └── logo.png
├── public/                       # Identical copy of static/ (legacy)
│   ├── _headers
│   ├── _redirects
│   └── logo.png
├── build/                        # Static build output
│   ├── index.html                # Homepage (prerendered)
│   ├── about.html                # About page
│   ├── blog.html
│   ├── compliance.html
│   ├── docs.html
│   ├── pitch.html
│   ├── roadmap.html
│   ├── rss.html
│   ├── spec.html
│   ├── tools.html
│   ├── tools/                    # Subroutes directory
│   ├── 404.html                  # SPA fallback
│   ├── _app/immutable/           # Hashed JS/CSS bundles
│   ├── _headers
│   ├── _redirects
│   └── logo.png
├── docs/                         # Additional documentation
├── archive/                      # Deprecated / backup files
├── .svelte-kit/                  # SvelteKit generated files (cache)
├── node_modules/
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
│
# Project docs (top-level)
├── DIRECTORY-MAP.md              # Multi-LLM directory index
├── SOURCE-OF-TRUTH.md            # Comprehensive reference
├── WORKPLAN.md                   # Active work plan
├── GROK-SESSION-PROTOCOL.md      # Grok session protocol
├── AGENTS.md                     # Agent instructions
├── hermes-strata-app-framework-v2.md
└── README.md
```

---

## Dependency Table

### Runtime Dependencies
None — `package.json` has no `dependencies` block.

### Dev Dependencies
| Package | Version | Purpose |
|---|---|---|
| `@sveltejs/adapter-cloudflare` | ^7.0.0 | Cloudflare Pages adapter (installed but not active) |
| `@sveltejs/adapter-static` | ^3.0.10 | **Active adapter** — static site export with SPA fallback |
| `@sveltejs/kit` | ^2.20.0 | SvelteKit framework core |
| `@sveltejs/vite-plugin-svelte` | ^6.2.4 | Svelte compiler plugin for Vite |
| `@tailwindcss/vite` | ^4.1.0 | Tailwind CSS Vite plugin |
| `svelte` | ^5.25.0 | Svelte 5 compiler |
| `tailwindcss` | ^4.1.0 | Tailwind CSS v4 |
| `typescript` | ^5.8.0 | TypeScript compiler |
| `vite` | ^6.3.0 | Vite build tool |
| `wrangler` | ^4.105.0 | Cloudflare Workers CLI (for Pages deploy) |

---

## SvelteKit Adapter

- **Active**: `@sveltejs/adapter-static` v3.0.10
  - `fallback: "404.html"` — enables SPA routing on static hosts
  - All routes prerendered to individual `.html` files in `build/`
  - Unknown routes fall through to `404.html` (client-side SvelteKit routing)
- **Also installed**: `@sveltejs/adapter-cloudflare` v7.0.0 (available but not configured in `svelte.config.js`)

---

## Build Output

| Property | Value |
|---|---|
| **Output directory** | `build/` |
| **Format** | Static HTML + JS + CSS |
| **Pre-rendered routes** | 11 HTML files (every route prerendered at build time) |
| **JS/CSS bundles** | `build/_app/immutable/` (content-hashed) |
| **SPA fallback** | `build/404.html` |
| **Cloudflare config** | `_headers`, `_redirects` included in build |

---

## Dev Server

| Property | Value |
|---|---|
| **Command** | `npm run dev` |
| **Underlying tool** | `vite dev` |
| **Default port** | 5173 |
| **HMR** | Yes — full hot module replacement |
| **Node.js version** | >= 18 required |

---

## Key Facts

- **Framework**: SvelteKit 2 (NOT React/Next.js)
- **Language**: TypeScript (strict mode)
- **CSS**: Tailwind CSS 4 via `@tailwindcss/vite` plugin
- **Type**: Static SPA with pre-rendered pages
- **Domain**: openstrata.giveabit.io
- **Hosting**: Cloudflare Pages
- **GitHub**: https://github.com/kitsboy/openstrata (branch: main)
