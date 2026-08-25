# Deployment — OpenStrata / Hermes Strata

**Production:** https://openstrata.giveabit.io
**GitHub:** https://github.com/kitsboy/openstrata (branch: `main`)
**Hosting:** Cloudflare Pages (project: openstrata), static SvelteKit build via `@sveltejs/adapter-static`

## Deploy

```bash
npm ci
npm run audit:i18n    # translation + hard-coded-copy audit
npm run build         # writes static output to build/
git push origin main  # Cloudflare Pages auto-deploys from main
```

Deploys are triggered by pushes to `main`. The live site version marker
(`openstrata-version` meta) is verified after each release against the
`package.json` version.

## Verification checklist

1. `npm run check` reports 0 errors and 0 warnings
2. `npm run build` completes cleanly
3. `npm run audit:i18n` passes (0 missing keys, 0 hard-coded-copy warnings)
4. Live site serves the expected version marker after deploy

See `SOURCE-OF-TRUTH.md` and `docs/KIMI-HANDOFF.md` for project context.
