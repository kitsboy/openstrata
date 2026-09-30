# OpenStrata - Quick Contributor Guide

## Who This Is For
If you're 16 or older and want to help build the **OpenStrata** project, you're in the right place! This is a friendly, no-fluff guide for getting started, contributing code, and growing with the team.

## What Is OpenStrata?
OpenStrata is a full-stack property management platform for British Columbia strata buildings. It includes:

- **Live demo site** at https://openstrata.giveabit.io
- **SvelteKit frontend** (TypeScript + Tailwind)
- **Fastify backend** (Docker + PostgreSQL + pgvector)
- **36+ strata tools** (reconciliation, wizard, compliance, payments)
- **Auto-reconciliation** that cuts manual work from 4 hours to 15 minutes a month

## How to Use This Guide

### 1. Set Up Your Environment

```bash
cd ~/projects/openstrata
npm run dev
```

If you see the SvelteKit dev server running on http://localhost:5173, you're good to go!

### 2. Explore the Site

Visit the demo site and play around:

- **Dashboard** — operations hub with graphs, live stats, and unit matrix
- **Tools** — 30+ interactive tool modules
- **Compliance** — BC legal rules and requirements
- **Roadmap** — future features and phases

The public site ships in **demo mode**: every community, balance and action you
see is sample data, and the page labels it as such. There is no public API to
register against — the backend is self-hosted behind Tailscale by design (see
`docs/DEPLOYMENT.md`). To run the app against a real backend, use
[Running your own host](#running-your-own-host-operators) below.

### 3. Learn the Ropes

#### Basic Workflow

1. **Read the docs** — start with this README and the Manual section
2. **Run tests** — the project has 85+ automated tests to catch bugs
3. **Make a change** — open an issue or PR if you're stuck
4. **Get feedback** — contributors review everything before merging

#### Git Basics (if you're new)

```bash
# Clone the repo
cd /path/to

git clone https://github.com/kitsboy/openstrata.git

# Stay on the latest work
cd openstrata
git checkout main

# Run the tests to make sure everything works
npm test

# Build for production (required before committing)
npm run build

# Stage and commit your changes
git add .
git commit -m "feat: add your feature"

# Push (someone else will review)
git push origin main
```

### 4. Contribute Code

#### Choose a Good First Issue
Look for issues labeled:
- `good first issue`
- `help wanted`
- `beginner`

Search the repo for "good first issue" or ask the team.

#### Fork and Branch

1. Fork the repo on GitHub
2. Clone your fork locally
3. Create a feature branch

```bash
git checkout -b feature/your-name-short-desc
```

#### Make Your Changes

- Follow existing code style (ESLint/TSLint)
- Write tests for any new functionality
- Add documentation for new features
- Keep commits focused and meaningful

#### Test, Commit, and Push

```bash
# Run tests before committing
npm test

# Stage and commit with a clear message
git add .
git commit -m "feat: add your feature"

# Push to your fork
git push origin feature/your-name-short-desc
```

#### Open a Pull Request (PR)

On GitHub, click **Compare & pull request**. Fill out the PR template, assign reviewers (if anyone is watching), and submit.

The team will review your changes, ask questions if needed, and merge when ready.

### 5. Stay Updated

- **Read the session handoffs** — look for `docs/KIMI-HANDOFF.md`
- **Watch the repo** on GitHub for notifications
- **Check Discord/Slack** (if the project uses one)
- **Star the repo** — helps others find good contributions

## Important Files to Know

| File | What It Does |
|------|--------------|
| README.md (you're reading this) | Quick start and overview |
| docs/KIMI-HANDOFF.md | Session-by-session handoffs from M3 to Kimi |
| SOURCE-OF-TRUTH.md | Project identity and current status |
| docs/PRODUCT-PLAN.md | Feature roadmap |
| docs/WORKPLAN.md | Detailed task tracking (Phase 2026–2027) |
| CHANGELOG.md | Version history |

## Running your own host (operators)

This is the developer/operator path — it is deliberately **not** shown to
visitors. The app resolves its API base in this order
(`src/lib/api/config.ts`):

1. `localStorage['openstrata-api-base']` — runtime override, no rebuild needed.
   In the app the operator affordance is the quiet **“Running your own host?”**
   link inside the demo notice on the dashboard.
2. `PUBLIC_API_BASE_URL` — build-time env (Vite exposes `PUBLIC_*` to the client).
3. **Neither set → demo mode.** Every widget renders curated sample data, and
   the notice on the dashboard says so.

```bash
# Local build pointed at your own backend
PUBLIC_API_BASE_URL=http://<tailscale-host>:8080 npm run build

# On Cloudflare Pages (project `openstrata`) set the same value in
# Settings -> Environment variables (Production) so it survives every deploy.
```

The backend is Tailscale-only by design: never publish Postgres or the API to
the open internet. Full walkthrough — host deploy checklist, migrations, Rosa
indexing, payment rails — is in `docs/DEPLOYMENT.md` and
`docs/TAILSCALE-ONBOARDING.md`.

## Best Practices

1. **Test everything** — the CI runs 85+ tests automatically
2. **Keep commits small** — easier to review and revert if needed
3. **Write clear commit messages** — start with `feat`, `fix`, `docs`, etc.
4. **Follow the coding style** — Prettier + ESLint
5. **Be respectful** — the team is mostly volunteers helping a good cause

## Need Help?

1. **Read existing issues** — someone may have answered your question already
2. **Ask on GitHub** — open an issue with a clear title and description
3. **Reach out to maintainers** — look at the recent commits to see who's actively working
4. **Check Discord/Slack** — community channels for quick chat

## Enjoy Building!

OpenStrata is a **Give A Bit** project — part of the larger Bitcoin sovereignty ecosystem. Your contributions help building owners save money and stay compliant.

Remember: **no prior experience required** — just curiosity, willingness to learn, and a bit of persistence. The team appreciates every contribution, big or small.

Good luck, and happy coding! 🚀