# openstrata — Context Map

## Stack
| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 5 |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Integration | Bitcoin, Lightning, Nostr |

## Ports
| Service | Port |
|---------|------|
| SvelteKit dev server | 5173 |

## Key Architecture
- Sovereign data portability platform
- BCFSA (British Columbia Financial Services Authority) aware
- Routes include /tools/wizard (Building Template Wizard — 8-step)
- Bitcoin, Lightning, and Nostr integration points
- Static landing page (SvelteKit prerender mode)
- Zero-knowledge: no user data stored

## Routes
| Route | Purpose |
|-------|---------|
| / | Landing page |
| /tools/wizard | 8-step Building Template Wizard |

## Hosting
Cloudflare Pages — auto-deploy from git push
Custom domain: openstrata.giveabit.io
