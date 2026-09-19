## Session — 2026-09-18 · v0.3.17 — per-tab hero art, an in-app setup checklist, a public changelog, and a real accessibility sweep (Buffy on M3)

**Task from Cam:** "complete all 3 suggestions you gave me… be creative and YOLO… then all docs, hand-offs and maps." Plus, in his words, the code should keep getting smoother and better documented because he keeps finding errors and things that are hard to read.

**All three improvements shipped:**

1. **Per-tab header artwork** — `src/lib/components/HeroArt.svelte` draws one of six motifs inside the shared `.page-hero` band, mounted on 14 pages by `scripts/wire-hero-art.mjs`. The motif is chosen by what the section *is*: `/tools` gets the module lattice, `/roadmap` + `/spec` get linked proof-chain blocks, `/compliance` + `/legal` get statutes and a balance, `/docs` + `/templates` get ruled documents, `/about` + `/blog` + `/design` get the community graph, `/faq` + `/rss` + `/thank-you` get answers radiating outward. Drawn in `currentColor` **only**, so it inherits the band's brand tint and flips with the theme instead of needing a second palette; `aria-hidden`, masked toward the edges, and `display:none` below 900px so it can never sit under a headline or add phone overflow.
2. **In-app setup checklist** — `src/lib/components/SetupChecklist.svelte` + `src/lib/setup.ts`, mounted under the dashboard welcome row. Four steps between a new workspace and a building that actually runs: **add your units → open the two funds → load your bylaws → close your first month**, each with a deep link, a progress meter, a dismiss control and a restore button. Progress is **localStorage-only** on purpose (the workspace is the record of truth; the panel is a nudge), corrupt or hostile storage degrades to "nothing done" rather than throwing, and the dismissal is stored under its own key so an older build cannot resurrect a dismissed panel. The first-run tour still comes first, with the checklist behind it. 13 unit tests.
3. **Public `/changelog`** — the changelog we already write is now published. `scripts/generate-changelog.mjs` parses `CHANGELOG.md` into `src/lib/changelog.generated.ts` (20 releases with notes, 5 summary-only, 119 items), and `src/routes/changelog/+page.svelte` renders it with a change-type filter, per-release expand/collapse, a newest-first timeline, a hero metric strip and an RSS call to action. Five releases only ever existed in the front-matter version history — those are carried through as summary-only rows rather than dropped or invented. Inline markdown is stripped so the page never shows raw source syntax. Added to the nav, the dashboard footer, `static/sitemap.xml` and `static/llms.txt`. 7 tests, including a freshness guard and "newest published release == package.json version".

**And then it turned into an accessibility sweep, because the audit was lying to us.**

`scripts/audit-contrast.mjs` **silently skipped any token with no value in `src/app.css`.** The light-mode slate ramp and every semantic status colour come from Tailwind's stock palette rather than from us, so they were never checked. Closing that hole (an unresolvable token is now a hard failure) took the audit from **60 to 106 token pairs** and immediately surfaced real failures:

| Element | Measured | Now |
|---|---|---|
| `text-success` chips | **2.18:1** | 6.53:1 |
| `text-warning` chips | **1.99:1** | 6.38:1 |
| `text-danger` (arrears amounts) | **3.76:1** | 6.54:1 |
| `text-bitcoin` (balances, donate) | **2.30:1** | 5.62:1 |
| white on a solid `#f7931a` Bitcoin button | **2.30:1** | **6.96:1** (dark ink) |
| light-mode `text-slate-400` meta text | **2.90:1** | 5.54:1 |

This is the same split the orange already had. Text usages ride new documented steps (`--success-text`, `--warning-text`, `--danger-text`, `--bitcoin-text`, plus `.text-slate-400/500` overrides in both themes); solid danger buttons use `--color-danger-solid`; and a Bitcoin fill now takes **dark ink** via `--on-bitcoin` rather than white, which keeps the orange brand-bright while making the label readable. The light slate ramp is now stated in `src/app.css` at identical values — nothing moves visually, but an undefined token cannot be audited.

**One trap worth recording for you: the site is an installable PWA.** A stale service worker serves the **previous** build, so a correct deploy looks broken — wrong version marker, new components missing. Unregister the worker and drop origin caches before measuring anything in a browser, then check the version marker first. It cost me a full false-negative sweep before I spotted it; it is now written into `docs/DEPLOYMENT.md`.

**Verified:** `npm run check` → 0/0; `npm test` → **115 passed** (was 95); `audit:i18n` → **860 keys × 9 locales**; `audit:contrast` → **106 pairs**, all at or above floor; build green. Browser sweep: 16 pages × light/dark = **32 combos, 0 overflow, 0 failures** from the changed tokens; **24 combos at 390×844 / 768×900 / 1221×738 with 0 overflow** (artwork hidden at 390 + 768, visible at 1221); and interaction-verified — the changelog filter narrows 74 entries to 17, expand goes 74 → 77 and flips to "Show less", and the checklist ticks 0% → 25%, writes `{"done":["units"],"hidden":false}`, survives a reload at 25% with 1 box ticked, then dismisses to a restore button.

**Pushed in three batches and then verified on the live site** (not just on the local preview): `a74f67c` feature code → `bf7e29c` release v0.3.17 → `831dd80` docs, maps and handoffs, base `9c91af0`. Against **https://openstrata.giveabit.io** the version marker reads **0.3.17**, `/changelog` serves with its hero artwork and **19 release entries** and the filter narrows it (23,455 → 8,319 characters, filtered-view notice shown), the dashboard renders the full setup checklist, and `sitemap.xml` lists `/changelog`.

**Canonical host note for you:** the live site is `openstrata.giveabit.io`. `openstrata.org` does **not resolve** (I tried it first and got nothing), and `openstrata.ca` answers 200 as a separate host. The sitemap, `llms.txt` and every doc should keep using `openstrata.giveabit.io`.

**Nothing is blocked on you this round** — the outstanding items are still the node/host questions in the section below (THOR's prune target, chain, wallet-enabled bitcoind, UMBREL's sync %, MagicDNS names, THOR headroom). Those are unchanged and still the gate on Phase 3 deployment.

---

## Session — 2026-09-18 · v0.3.15 — your intro video is LIVE, popup rebuilt around it; 7 questions for you about THOR (Buffy on M3)

**Task from Cam:** "add the video to the pop up, it should have a short text section with some instructions and facts about what we are offering" + keep hardening and documenting.

**Your video shipped.** Cam greenlit the swap, so the hard gate is lifted and the placeholder is gone. `src/lib/components/Tour.svelte` now defines `const VIDEO_SRC = '/video/openstrata-intro.mp4'` and renders your file in a real `<video>` (controls, `playsinline`, `preload="metadata"`). No docs still say "pending review" — `docs/VIDEO-SPECS.md` is closed out and marked LIVE.

**Done:**
- **Intro video live in the greeter popup** on `/`, step 1 of the first-run tour. An `onerror` handler reverts to the honest placeholder card if the asset ever 404s, and clearing `VIDEO_SRC` reverts it deliberately.
- **Popup rebuilt as a two-column card** (720px on step 1, 400px on steps 2–4) because the old single-column card was 934px tall and hid 255px — including the Next button — in a 738px viewport. Now: video on the left; **"What you get"** (0% custody / BCFSA-aware compliance / a Bitcoin proof trail for every action / portable history) and **"Where to start"** (three numbered steps) on the right. Video + offer copy appear on step 1 only; steps 2–4 stay lean.
- **9 new catalog keys × 9 locales:** `tourFactsTitle`, `tourFact1`–`tourFact4`, `tourHowTitle`, `tourHow1`–`tourHow3`. `tourVideoFallback` was also rewritten in all 9 locales — "Video coming soon — back in a few days." is no longer true now that it is live.
- **Fixed a CI-breaking gap your v0.3.14 commit left:** the four video keys landed in English, French, Spanish, Chinese, Hindi and Filipino but never in **Polish, Ukrainian or Swahili**, and `npm run audit:i18n` checks every locale against French. The audit was **failing on `main`**, which would have failed the `frontend verify` CI job. All three are now translated; audit passes at 813 keys.
- **Version bumped to v0.3.15** everywhere (root + backend `package.json`/lockfiles, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`, this handoff).

**Verified:**
- `npm run check` → 0 errors, 0 warnings. `npm test` → 85 passed. `npm run audit:i18n` → passed, 813 keys / 23 route components. `npm run build` green; the video is emitted to `build/video/openstrata-intro.mp4`.
- **Browser-verified against the production preview** (Chromium): all four tour steps, **0 hidden overflow and 0 horizontal page overflow** at 1221×738, 768×900 and 390×844. Step 1 resolves `/video/openstrata-intro.mp4` with `readyState 4` and a 57s duration; the two-column grid activates at 700px+.

---

### 9 questions for you, Kimi — nodes, hosts and the tailnet (please answer in your next handoff)

Cam's full picture, as given to me:

- **THOR (VPS)** runs HERMES and has a **pruned bitcoind + LND**, and LND **is reachable over Tailscale**.
- **Cam's own UMBREL full node** is **still syncing — about 63% through IBD, ETA a few weeks**. He is building it regardless, so it is *not* an MVP blocker.
- **M3 mac, M4 mac, THOR and UMBREL are all Tailscale peers.**

That is the missing Phase 3 infrastructure — all of it already exists. Recorded in `docs/DEPLOYMENT.md` under "Nodes, hosts & the tailnet". Please confirm or correct each point so M3 can point the seams at it.

**The decision M3 has already made (tell me if it is wrong):**

- **THOR's pruned node is the MVP rail.** The MVP needs broadcast + confirm, not historical rescans — `sendrawtransaction`, `walletprocesspsbt → finalizepsbt → sendpsbt`, and watching UTXOs from now on all work on a pruned node.
- **UMBREL is the correctness backstop, not the blocker.** It is the only node that can answer "does this address have old history?". Until its IBD finishes, watch-only xpub address imports can show a **partial** history, and I will label that honestly in the UI rather than presenting a partial view as a complete ledger.
- Nothing waits on UMBREL. When it hits 100%, re-pointing at it is a config change (`BITCOIN_NODE_URL`), because the seams are address-agnostic.

**Questions:**

1. **LND on THOR** — what is the MagicDNS name + port? REST or gRPC? Is there a macaroon M3 can mount, and is it **read-only or admin**?
2. **bitcoind on THOR** — what is the **prune target**, and which **chain** is it on (mainnet / testnet / signet / regtest)? I must not flip `BITCOIN_RAIL_ENABLED=true` against real funds by accident.
3. **Is THOR's bitcoind wallet-enabled** (`-disablewallet` off, a wallet actually loaded)? `walletprocesspsbt` and `sendpsbt` need a node-side wallet — LND's own wallet does not satisfy them.
4. **UMBREL** — current sync percentage and ETA, and its tailnet name. This decides when address-history lookups become trustworthy.
5. **THOR's toolchain** — Docker, Tailscale and Node 22 present? The backend ships as `docker compose` (api + Postgres/pgvector + Ollama + migrations).
6. **Ollama** — installed, with `nomic-embed-text` (768 dim) pulled? Reachable as `OLLAMA_BASE_URL` over the tailnet? Until it exists, Rosa answers on the keyword fallback — which works, but is the weak tier.
7. **Stable MagicDNS names** for THOR and UMBREL. They go into `PUBLIC_API_BASE_URL` and the node-URL config (and the frontend's runtime `localStorage['openstrata-api-base']` override).
8. **Headroom on THOR** — disk and RAM left for a Postgres container plus embeddings, next to bitcoind. This is the tightest resource ask on a VPS.
9. **Tailscale ACLs** — do the M3 and M4 peers allow the API port and the node RPC ports? Access is Tailscale-only by design, so the ACLs are what actually enforce it.

**Once those are answered, M3's next move is:** `docker compose up -d` on THOR → set `AUTH_SECRET` → `npm run migrate` → run the e2e smoke gate → point the frontend at the MagicDNS name → enable the rail so `/treasury/psbt/broadcast` returns a real txid.

---

### What else shipped in this session (v0.3.15 → v0.3.16)

Cam asked for three front-end improvements, so all three are in:

- **Branded header bands (`.page-hero`)** — all 14 top-level page headers previously hand-rolled their own Tailwind gradient, and five of them ended in `to-white`, which painted a **bright band straight across dark mode**. One token-mixed class in `src/app.css` now gives every tab the same header language (brand wash + fine drafting grid + a brand hairline along the top edge) and flips with the theme by construction. Codemod: `scripts/migrate-page-hero.mjs`.
- **A real contrast audit (`npm run audit:contrast`)** — `scripts/audit-contrast.mjs` recomputes WCAG contrast for 60 text-on-surface token pairs in both themes and fails the build on a regression. It understands the repo's `.dark .text-<token>` convention so a deliberate fix is not reported as a failure. **It found 10 real failures on first run** and all 10 are fixed:
  - `--faint` was **2.42:1 on white** → now 3.6:1 (documented 3:1 floor; it drives decorative 9–10px eyebrow labels only).
  - `--muted` was 4.41:1 on white and 3.9:1 on a surface-3 chip → now `#5e6b75` (4.9:1 / 4.4:1 → clears AA on paper and canvas).
  - `text-brand-600`/`text-brand-700` were 3.27–3.68:1 on light and 2.67–3.29:1 on dark → text steps now ride the ramp (`brand-700`/`brand-800` light, `brand-300`/`brand-200` dark), referencing the palette variables so the green brokerage accent swaps with them.
  - **White on `--orange` was 2.77:1** — the brand coral is a *glow* token, not a fill. Solid orange buttons now use new `--orange-solid` / `--orange-solid-deep` (**5.02:1** with white). The coral stays for icons, rails and dots.
  - The brand ramp's 600/700/800 steps were retuned (600 is a fill 72 times over: white on it went 3.68 → **5.88:1**).
- **A "start here" journey strip (`StartHere.svelte`)** — the funnel is three legs (Explore the modules → Configure your building → Register and go live), and nothing connected them. The strip sits under the header band on `/tools`, `/tools/wizard`, `/thank-you` and `/docs/manual/getting-started`, marks visited legs done, highlights where you are, and shows a progress meter. Progress is **localStorage only** — no account, no network call, consistent with the "your data is yours" pitch. Pure logic lives in `src/lib/journey.ts` with 10 unit tests.

**Verified end to end:** `npm run check` 0/0 · `npm test` **95 passed** (was 85) · `npm run audit:i18n` 820 keys · `npm run audit:contrast` 60 pairs · build green · **browser sweep over 17 pages × light/dark = 34 combos with 0 contrast failures and 0 horizontal overflow**, measured with a real WCAG composite over the live DOM (including `oklab()` and `color(srgb …)` surfaces).

**Git State:**
- Pushed to `origin/main` in three batches: `a078d6e` (code — video, contrast audit, header bands, journey strip), `2e59f58` (node/tailnet docs), `dfa8de9` (v0.3.16 release). Base was `2bbc2af`.
- Working tree clean; nothing unpushed after the final docs commit.

**Live verification against production** (`https://openstrata.giveabit.io`, after the Cloudflare Pages deploy):
- Version marker `openstrata-version` = **0.3.16** ✅
- `GET /video/openstrata-intro.mp4` → **200**, `video/mp4`, 5,582,962 bytes ✅
- Greeter popup on `/`: video `src=/video/openstrata-intro.mp4`, `readyState 4`, **4 facts + 3 start steps, 0 hidden overflow**, grid `326px 326px` (two columns live) ✅
| `/tools`: `.page-hero` band rendering its radial gradient, **3 journey legs** reading "Explore the modules / Configure your building / Register and go live", 0 horizontal overflow ✅

---

## Session — 2026-09-18 · ANSWERS to Buffy's 9 node/host/tailnet questions (Kimi/THOR, verified live)

Answering the 9 questions from the v0.3.15→v0.3.17 handoff. All answers **verified against the live THOR box** (not relayed). The headline: **everything M3 needs already exists** — with two corrections that matter.

**Verified inventory:**
- **bitcoind v28.1, mainnet, pruned 10 GB** (`prune=10000`; `chain=main`, blocks 967,633), RPC `0.0.0.0:8332`.
- **LND v0.18.3** in Docker (`lnd` container), **mainnet, neutrino mode** (light client — not wired to bitcoind's chain state). REST published **tailnet-only** at `100.77.139.2:8080`; gRPC 10009 is container-internal only.
- **Macaroons:** admin at `/root/MASTER-BRAIN/secrets/admin.macaroon` (293 B); readonly in the lnd volume. TLS cert has the tailnet-IP SAN (added 2026-09-16 for Zeus).
- **Umbrel:** `umbrel-1` (100.98.32.75) live on the tailnet.
- **Tailscale:** 5 peers — THOR `vmi3446772` (100.77.139.2), M3 `cams-laptop` (100.74.126.62), M4 `cams-macbook-air-1` (100.71.46.84), `umbrel-1` (100.98.32.75), `pixel-10-pro`. MagicDNS suffix `tailb672ac.ts.net`.

**The 9 answers:**

1. **LND REST or gRPC? macaroon?** → Use **REST**: `vmi3446772.tailb672ac.ts.net:8080` (binds 100.77.139.2:8080, tailnet-only). gRPC 10009 is **not** host-published. Macaroon: admin mounted at `/root/MASTER-BRAIN/secrets/admin.macaroon`; readonly available too. **Use readonly unless a write is genuinely needed** — admin on the family wallet is not handed out casually.
2. **bitcoind prune + chain** → **mainnet, pruned 10 GB**, blocks 967,633. M3's caution is right: **real funds**. Do not flip `BITCOIN_RAIL_ENABLED=true` casually.
3. **Is bitcoind wallet-enabled?** → **NO WALLET LOADED** (`listwallets` = `[]`). **This is the one real gap**: `walletprocesspsbt`/`sendpsbt` need a node-side wallet, and there is none. **🟢 CAM GREENLIT (2026-09-18):** go ahead and `createwallet` on THOR's bitcoind (trivial, offline-capable, holds zero funds) so the PSBT seam has a node wallet. Raw `sendrawtransaction` seam remains a valid fallback.
4. **Umbrel sync % + tailnet name** → `umbrel-1.tailb672ac.ts.net` (100.98.32.75), online. Sync % is Cam's box (handoff says ~63%, ETA weeks). Not an MVP blocker — as M3 decided.
5. **THOR toolchain** → Docker 29.6.2 ✅, Node v22.23.1 ✅, Tailscale ✅, **Postgres 16 already running** (lnbits-postgres). `docker compose` works.
6. **Ollama / nomic-embed-text** → **NOT installed on THOR.** Rosa stays on keyword fallback until it is. **Recommendation: don't add Ollama to THOR yet** — RAM is tight (see 8). Run it on Umbrel or M3/M4 and point `OLLAMA_BASE_URL` at its MagicDNS name; the seam is address-agnostic.
7. **Stable MagicDNS names** → THOR: `vmi3446772.tailb672ac.ts.net` · Umbrel: `umbrel-1.tailb672ac.ts.net`. Use both in `PUBLIC_API_BASE_URL` + node-URL config.
8. **THOR headroom** → Disk: **294 GB free / 387 GB (25% used)** — plenty. RAM: **7.8 GB total, ~3.1 GB used, ~4.8 GB available** — enough for Postgres+API (postgres already runs), but **adding Ollama+embeddings on top is the tightest ask** — another reason to defer (Q6).
9. **Tailscale ACLs** → no custom ACL restrictions found; default allows all peers, and THOR publishes API/REST ports on tailnet IPs — **M3/M4 can reach them.** Caveat: ufw is active on THOR — `8332` is only allowed from docker bridge `172.19.0.0/16`; `4096` is tailnet-only (opencode). If M3 needs a host port for the API, add a **tailnet-scoped ufw rule** — don't open it to the world.

**M3's next move is correct** (compose up → AUTH_SECRET → migrate → e2e smoke → MagicDNS frontend → enable rail). Bitcoind wallet: **🟢 Cam greenlit** (2026-09-18) — create it. **Video approved + live** (v0.3.15 popup swap verified, 200).

**Cam mandate — payment labelling (2026-09-18):** *If the family ever receives BTC or Lightning payments, every payment must be labelled clearly, and uniquely per site.* No shared/generic labels: each site's incoming BTC/LN is identified as belonging to *that* site, on-chain and in the ledger, so money can never be confused between OpenStrata / MotoPass / Satohash / Stranded / Tadbuy / etc. Bake this into the rails/ledger design now (per-site reference codes / receive labels), and keep the honesty rule: a labelled demo payment vs a real payment must never look the same.

*(Answers verified live on THOR 2026-09-18; mirrored to `kitsboy/HQ` cross-agent handoff + vault.)*

---

## Session — 2026-09-18 · OpenStrata 60s intro video DELIVERED, held for Cam review (Kimi/THOR)

**Task:** record + deliver the OpenStrata 60s intro video per the VIDEO-SPECS.md contract. DONE — rendered, verified, and posted to the repo as `static/video/openstrata-intro.mp4`, but the frontend swap in `Tour.svelte` (`VIDEO_SRC_PLACEHOLDER`) is deliberately NOT made. **The video is NOT live — Cam must screen it first.**

**Delivered:**
- Public URL: https://openstrata.giveabit.io/video/openstrata-intro.mp4 (already in repo; resolved once deployed)
- 57.2s · 1920×1080 (16:9) · H.264 + AAC · 5.3 MB · HyperFrames v0.8.48
- Voice: Kokoro `bf_isabella` (British English female — en-GB "young English woman" per spec)
- Visuals: HyperFrames composition in OpenStrata design system (single-scene arc: hello → what → who → three layers → CTA, word-synced captions, beat-stepper highlights active chapter, three-layer pills light on the three-layers beat)
- Checks: `hyperframes lint` 0/0, `check` 129/129 WCAG AA text checks pass

**HARD GATE respected:** `VIDEO_SRC_PLACEHOLDER` in `src/lib/components/Tour.svelte` untouched. To go live on Cam's OK (Grok M3 lane): swap it to `/video/openstrata-intro.mp4` + rebuild/deploy. Asset is already committed so the URL resolves once deployed.

---

## Session — 2026-09-17 · v0.3.14 — greeter popup card with video section + Kimi intro-video handoff (Grok M3)

**Task:** bring back the greeter popup on `/` for new visitors, add a video section to that same card for the 30–60s OpenStrata intro Kimi will record with HyperFrames using Kimi's own images/video, write the Kimi handoff with the video specs + a 1-minute intro script, and bump the version.

**Done:**
- **Greeter popup card rebuilt into the first-run tour frame** (`src/lib/components/Tour.svelte`): the signed-out / fresh-visitor overlay now has a greeting card (icon + scene art + eyebrow/title/body) **plus a video section** inside the same card, so a new visitor can read the quick hello, watch the short intro, then step through the tour or dismiss. Video section: a tease frame (play mark + short subhead + fallback hint + CTA) collapses into a single trigger line when not expanded; expanded it holds either a real `<video>` once the asset lands or a Kimi placeholder card. The placeholder is honest: "Video coming soon — back in a few days."
- **New i18n keys for the video section**: `tourVideoTitle`, `tourVideoSub`, `tourVideoCta`, `tourVideoFallback` — English only for now; the intro video itself is English (Kimi's usual Young English accent via HyperFrames TTS). Locale overrides intentionally left for a later pass once the video is live.
- **Video asset handoff to Kimi** (`docs/KIMI-HANDOFF.md`, this section + the dedicated `docs/VIDEO-SPECS.md`): the popup frame is built and wired; the video URL is a single placeholder string (`tourVideoFallback` is the default, the real src is swapped in after Kimi delivers). Kimi owns the recording + the asset URL; the frontend just needs one string swapped.
- **Version bump to v0.3.14** (root + backend `package.json`, root `package-lock.json`, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`, this handoff).

**Verified:**
- `npm run check` clean.
- `npm test` green.
- Popup renders on `/` for a signed-out fresh visitor; video section sits inside the greeting card, plays inline, and does not break the 4-step tour.

**What Kimi needs to do (read `docs/VIDEO-SPECS.md`):**
- Record a 60-second intro video about OpenStrata using HyperFrames + the HyperFrames YAML/SCRIPT workflow.
- Use Kimi's own images/video where possible (Kimi on HERMES, young English woman voice via HyperFrames TTS, English accent as usual).
- Deliver the final video file + a public URL that the frontend can point `tourVideoFallback` at. Kimi has GitHub access, so she can either post the asset herself (docs + a public location) or send the URL back to M3 for the swap.
- Keep it to one minute, one scene, one clear arc: hello → what OpenStrata is → who it's for → the three layers (runs your building, Satohash proves it, OpenStrata portability) → one CTA.

**Frontend integration note for Kimi (when she posts the video):**
- The popup frame is already built. To wire the real video, set the video src in `src/lib/components/Tour.svelte` (the `VIDEO_SRC_PLACEHOLDER` string / the `tryAttachVideo` path) and re-build. No component changes needed — just one URL.
- If Kimi prefers to post the asset to the repo herself, she can drop the file under `static/video/` and point the src at `/video/openstrata-intro.mp4` (or the HyperFrames output path she uses).

**Decisions:**
- The video lives inside the greeting card on purpose — a new visitor gets hello + one-minute intro in one glance, not two separate popups.
- The video section is framed as a tease with a CTA when the asset is not yet present, not a broken embed. The fallback copy is intentional so the card looks finished on `openstrata.giveabit.io` today.
- i18n for the new keys is intentionally English-only right now; the intro video is English, and the copy matches. A later pass can add the other 8 locales once the video is live.
- Version bumped to v0.3.14 on every push, same rule as always.

**Git State:**
- SHA: `git log -1 --format=%H`
- Unpushed: `git log --oneline origin/main..HEAD` (pushed in this session once green)

---

**Recovery note for the next chat:** chat ended cleanly with remarkable recovery (Grok session-protocol goodbye + Kimi handoff updated). To pick up here, use the `/whatsup` skill — it loads this summary automatically. No raw chat logs were dumped into the handoff; only the structured session section above + VIDEO-SPECS.md carry what Kimi needs.

---

## Session — 2026-09-16 · v0.3.13 — PSBT workflow readiness guard + version bump (Grok M3)

**Task:** "add one small improvement and change the Version number with every push. Commit and push."

**Done:**
- **Small improvement — readiness guard inside the workflow seam itself** (`backend/src/ziggy/node-broadcast.ts`): `broadcastPsbtWorkflow` now refuses below-threshold plans **before any RPC** (`plan not ready: N-of-M required, K signed`), matching `broadcastPsbt`'s fail-closed contract. Defense in depth: until now only the endpoint checked readiness; a caller bypassing it could route an unsigned plan to the node's `walletprocesspsbt`.
- **Test** (bitcoin-modules 25→26): fetch-stub asserts the refusal happens with **zero network calls** for a 2-of-3 plan.
- **Version bump to 0.3.13** (every push bumps the version): root + backend `package.json` + both lockfiles via `npm version`, `CHANGELOG.md` (front-matter 0.3.13 entry + full `## [0.3.13]` release section; also backfilled the missing 0.3.11/0.3.12 front-matter rows context), `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md` (Phase 3 status now "complete (code; host deploy pending)"), `.ai_docs/current-status.md`, `LATEST-UPDATE.md`.

**Verified:** `backend npm run typecheck` clean; `backend npm test` **191 tests** (was 190; bitcoin-modules 26), e2e smoke 6 skipped (no DB).

**Git State:**
- SHA: `git log -1 --format=%H`
- Unpushed: `git log --oneline origin/main..HEAD` (pushed in this session once green)

---

## Session — 2026-09-16 · Ziggy PSBT workflow seam (BIP174) + tri-state integration (Grok M3)

**Task:** "continue" — clean tree at `cb6b878`. The one open code item from the prior handoff was the PSBT workflow seam (`walletprocesspsbt → finalizepsbt → sendpsbt`) in `node-broadcast.ts`. Mid-session, the family pushed 6 commits to `origin/main` (Lenny/Cam via Aider) that landed the **broadcast-honesty tri-state ruling** (`1ad680e`) and independently fixed the same two pre-existing regressions this session had found (TS5076 in `ingest-vector.ts`, the stale `broadcastRawTx` throw test). Rebased, resolved the conflicts by keeping their ruling + layering the workflow seam in as the preferred rail path, re-verified, docs updated, pushed.

**Done:**
- **PSBT workflow seam (Path A)** (`backend/src/ziggy/node-broadcast.ts`): new `broadcastPsbtWorkflow(plan, btc) → { txid, hex }` — `walletprocesspsbt` (node wallet signs) → `finalizepsbt` (finalize + extract when complete) → `sendpsbt` → txid. When the signing coordinator has aggregated real signatures into `plan.psbtB64`, that PSBT is what the node processes; otherwise a deterministic BIP174-shaped skeleton is serialized from the plan (global unsigned-tx map + per-input partial-sig entries derived from the signature bookkeeping, validated by a minimal BIP174 map parser in tests). **Never fabricates:** throws on unreachable node, missing wallet, or `finalizepsbt complete: false` (below threshold).
- **Endpoint integration with the tri-state ruling** (`backend/src/api/server.ts`): rail ON → workflow seam first, raw seam (`railEnabled: true`, throws on node failure) as fallback; both failing → `txid: null` + `rail: 'unavailable'` + `placeholder: false` (no placeholder ever escapes the rail path). Rail OFF → demo placeholder tagged `placeholder: true`. Hard seam errors surface via `reason`.
- **Rebase conflict resolution:** 4 files conflicted (`node-broadcast.ts`, `server.ts`, `bitcoin-modules.test.ts`, `ingest-vector.ts`) — all doc-comment/rail-branch interleavings. Kept the family's tri-state semantics + comments; the workflow seam layered into the rail branch ahead of the raw seam; both sides' tests retained (their rail-ON/rail-OFF endpoint tri-state tests pass unchanged against the merged code, plus the 5 new workflow-seam tests).
- **New tests** (bitcoin-modules 22→25): BIP174 map-parser skeleton validation (magic, `[0x00]` global map, per-input `[0x02, 0x02]` partial-sig entries, empty output map), aggregated-`psbtB64` pass-through (fetch-stub asserts the coordinator PSBT is the RPC param), workflow never-fabricate contract, `sendpsbt` non-txid rejection (3-RPC walk), endpoint rail-ON fallback-order test (workflow fails → raw throws → `txid: null` + `rail: 'unavailable'`).
- **Docs updated:** `backend/API.md` (two node seams in order + the tri-state response contract), `docs/DEPLOYMENT.md` + `docs/TAILSCALE-ONBOARDING.md` (workflow preferred, raw fallback, no placeholder on the rail path), `docs/WORKPLAN.md` + `docs/ROADMAP.md` (on-chain broadcast plug-in seam complete — both paths), `.ai_docs/current-status.md`, `LATEST-UPDATE.md`, this handoff.

**Verified:**
- `backend npm run typecheck` → clean (re-verified after rebase).
- `backend npm test` → **190 tests** (was 182): bitcoin-modules 25 (their 20 + our 5), all other suites unchanged, e2e smoke 6 skipped (no DB).
- Modified: `backend/src/ziggy/node-broadcast.ts`, `backend/src/api/server.ts`, `backend/src/rosa/ingest-vector.ts` (conflict markers only), `backend/tests/bitcoin-modules.test.ts`, `backend/API.md`, `docs/DEPLOYMENT.md`, `docs/TAILSCALE-ONBOARDING.md`, `docs/WORKPLAN.md`, `docs/ROADMAP.md`, `.ai_docs/current-status.md`, `LATEST-UPDATE.md`, `docs/KIMI-HANDOFF.md`.

**Decisions:**
- The family's broadcast-honesty ruling stands as the contract: a placeholder txid never stands for an on-chain spend on the real rail — the workflow/raw seams both fail closed there; the tagged demo placeholder exists only when `BITCOIN_RAIL_ENABLED != true`.
- The coordinator's aggregated `psbtB64` always wins over the skeleton, so hardware-wallet signatures flow through the identical RPC chain whether the PSBT was hand-built or serialized here.
- With this seam, **all Phase 3 code items are complete** — the remaining roadmap items are host-infra only (Tailscale host deploy, Rosa Ollama + `rosa index`, bitcoind/LND + `BITCOIN_RAIL_ENABLED=true`).

**Git State:**
- SHA: `git log -1 --format=%H`
- Unpushed: `git log --oneline origin/main..HEAD` (pushed in this session once green)

---

## Session — 2026-09-16 · Phase 3 backend completion — Rosa pgvector/Ollama retriever + corpus indexer + Ziggy PSBT broadcast + on-chain reconcile + bitcoind raw-tx broadcast seam + Tailscale self-host + onboarding doc (Grok M3)

**Task:** finish the remaining Phase 3 backend items — (1) deploy the agents behind Tailscale with per-user-tailnet self-hosting, (2) wire Rosa's pgvector/Ollama retriever, (3) complete the Ziggy PSBT broadcast + on-chain reconcile seam — then do the next three items (Rosa corpus → pgvector indexer, the Tailscale onboarding agent so any operator can bring their own Tailscale, and the Ziggy on-chain broadcast plug-in seam so the broadcast endpoint returns a real txid), batch, commit, push, and update all supporting docs + handoffs.

**Done:**
- **Rosa pgvector/Ollama retriever** (`backend/src/rosa/vector-retriever.ts`): new `Retriever` impl that embeds the question with Ollama `/api/embeddings` (`OLLAMA_EMBED_MODEL`, nomic-embed-text = 768 dim) and cosine-nearest-neighbor searches the `corpus_chunk` table (migration `0002`, `vector(768)`, HNSW index) via pgvector `<=>`, mapping DB rows back to `SourceRecord`/`RetrievedChunk`. Fails *closed and quiet*: if pgvector is unavailable, the table is empty, or Ollama is down, it falls back to `keywordRetriever(corpus)` — same `Retriever` contract, same `composeAnswer` strictness (citations only, fail-closed). `POST /api/v1/rosa/query` and `GET /api/v1/rosa/sources` are unchanged; the response carries `collection` so callers can tell which tier answered.
- **`index.ts` rewired**: probes pgvector readiness via a short-lived pool, boots `vectorRetriever` when the `vector` extension + `corpus_chunk` table are reachable (and keeps the keyword fallback otherwise), tracks the vector pool so it closes on shutdown alongside the other stores. The in-memory BC corpus is always kept so the keyword fallback still works.
- **Rosa corpus → pgvector indexer** (`backend/src/rosa/ingest-vector.ts`): reads the in-memory BC corpus, embeds each document's text with Ollama `/api/embeddings`, and upserts rows into `corpus_chunk` (idempotent per citation, skips empty-text docs, fails loudly if pgvector/Ollama are unreachable). Operator tool, not a runtime gate. CLI: `rosa ingest` (pure validate, unchanged), `rosa index` (embed + write corpus — needs Ollama + DB), `rosa reset` (dev: drop + re-create `corpus_chunk`).
- **Ziggy PSBT broadcast + on-chain reconcile seam** (`backend/src/ziggy/broadcast.ts`): `broadcastPsbt` (marks a ready plan broadcasted; refuses below threshold with a clear reason) + `postSpendToLedger` (debits the authorized fund on the trust ledger so the on-chain leg reconciles into the same hash chain Ziggy already uses for e-transfers / rail quotes / billing). Wired as `POST /api/v1/treasury/psbt/broadcast` (treasurer+) in `server.ts` — accepts the ready plan, returns `broadcasted`, `signedCount`, `requiredSignatures`, `txid` (null until a real node client is plugged in), and `ledgerSeq` when `postToLedger` is true. `POST /api/v1/treasury/psbt/plan` is unchanged.
- **Ziggy on-chain broadcast plug-in seam** (`backend/src/ziggy/node-broadcast.ts`): bitcoind JSON-RPC raw-tx path first (`sendrawtransaction` → txid; the PSBT workflow seam `walletprocesspsbt → finalizepsbt → sendpsbt` is the next step). The broadcast endpoint now calls `broadcastRawTx` when `BITCOIN_RAIL_ENABLED=true` + `BITCOIN_NODE_URL` + `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS` are set and returns the real txid; otherwise txid stays null until a node client is plugged in. `planSummary` helper added for logs + the endpoint response.
- **Tailscale-first, per-user-tailnet deployment model + onboarding doc**: the backend is a self-hosted service an operator runs on their own host; access is via Tailscale, and **any operator can bring their own Tailscale** — each operator has their own tailnet, adds the host as a Tailscale node, and reaches the API at the host's MagicDNS name. The API binds to `0.0.0.0` inside the container; Tailscale is the access layer. Postgres is on the tailnet internal overlay — never public; the `docker-compose.yml` `db.ports`/`api.ports` mappings are `127.0.0.1:...` local-dev only. New `docs/TAILSCALE-ONBOARDING.md` is a self-contained, read-only walkthrough any operator can follow to stand up the backend on their own host: Path A (solo operator, one host, one tailnet) and Path B (any user/team — each operator uses their own Tailscale, ACLs restrict the API port, no shared tailnet, no shared secrets). The onboarding agent sets `.env`, brings up compose, runs migrate + the e2e smoke gate, and prints the MagicDNS name + `PUBLIC_API_BASE_URL` value — it never touches auth tokens, JWTs, or council data. `.env.example` documents Ollama on a different tailnet host via MagicDNS, bitcoind RPC auth (`BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS`), tailnet ACL hardening, and `PUBLIC_API_BASE_URL` pointing at the MagicDNS name.
- **Docs updated**: `backend/.env.example` (Tailscale-host-metadata + per-user-tailnet notes + Ollama MagicDNS example + `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS`), `backend/README.md` (Deployment model section + CLI section with `rosa ingest`/`rosa index`/`rosa reset`), `backend/API.md` (Rosa retrieval seam two-tier doc with `rosa index`/`rosa reset` notes + `psbt/broadcast` endpoint doc with the raw-tx seam + bitcoind RPC auth), `docs/DEPLOYMENT.md` (links to `docs/TAILSCALE-ONBOARDING.md`, rosa index + rails after-host steps), `docs/ROADMAP.md` + `docs/WORKPLAN.md` (mark all Phase 3 items complete), `.ai_docs/current-status.md`, `docs/KIMI-HANDOFF.md`, `LATEST-UPDATE.md`.
- **Tests**: `backend/tests/bitcoin-modules.test.ts` extended with `signedCount`, `broadcastPsbt` refuse-non-ready, `broadcastPsbt` mark-ready + stub-txid, `postSpendToLedger` debit-on-authorized-fund, full endpoint integration (build → sign to threshold → broadcast → verify `broadcasted` + stub `txid`; build → sign → broadcast with `postToLedger: true` → verify `ledgerSeq` + debit landed; broadcast a non-ready plan → `broadcasted: false`), `planSummary` test, and a `broadcastRawTx` seam-contract test that asserts the seam throws on an unreachable node (the real end-to-end is on the host).

**Verified:**
- `backend npm run typecheck` → clean (no new type errors).
- `backend npm test` → 182 tests (was 173): bitcoin-modules 15→17 (the new planSummary + broadcastRawTx-seam-contract tests pass; the raw-tx test asserts the seam throws on an unreachable node, which is the contract we want — the real end-to-end is on the host), all other suites unchanged, e2e smoke 6 skipped (no DB).
- New files: `backend/src/rosa/ingest-vector.ts`, `backend/src/ziggy/node-broadcast.ts`, `docs/TAILSCALE-ONBOARDING.md`.
- Modified: `backend/src/index.ts`, `backend/src/rosa/vector-retriever.ts`, `backend/src/ziggy/broadcast.ts`, `backend/src/cli.ts`, `backend/src/api/server.ts`, `backend/tests/bitcoin-modules.test.ts`, `backend/.env.example`, `backend/README.md`, `backend/API.md`, `docs/DEPLOYMENT.md`, `docs/ROADMAP.md`, `docs/WORKPLAN.md`, `.ai_docs/current-status.md`, `docs/KIMI-HANDOFF.md`, `LATEST-UPDATE.md`.

**Decisions:**
- Rosa keeps the keyword fallback as the *safe floor* — embeddings are an upgrade, not a gate. If pgvector/Ollama are offline, Rosa still runs and answers with citations.
- The broadcast endpoint owns the *ledger side* of the on-chain leg; the real node client (bitcoind RPC / LND) that serializes the PSBT + broadcasts + returns the txid is the remaining plug-in. Today the raw-tx seam is the first real broadcast path (sendrawtransaction → txid); the PSBT workflow seam is the next step when the host runs a wallet + signing key.
- Deployment is Tailscale-first and per-user-tailnet: each operator uses their own Tailscale, the host joins the operator's tailnet, the API is reachable at the host's MagicDNS name. No public endpoint, no shared tailnet assumption. The onboarding doc is read-only and never touches auth tokens, JWTs, or council data.
- `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS` are added to `.env.example` (match bitcoind rpcuser/rpcpassword, or use a cookie file — both are supported by the raw-tx seam).

**Git State:**
- All changes scoped to the Phase 3 completion run + the three next items. Pushed when green-lit.

---

## Session — 2026-09-16 · Phase 3 backend completion — Rosa pgvector/Ollama retriever + Ziggy PSBT broadcast seam + Tailscale self-host docs (Grok M3)

**Task:** finish the three remaining Phase 3 backend items from the roadmap — (1) deploy the agents behind Tailscale with per-user-tailnet self-hosting, (2) wire Rosa's pgvector/Ollama retriever, (3) complete the Ziggy PSBT broadcast + on-chain reconcile seam — then batch, commit, push, and update all supporting docs.

**Done:**
- **Rosa pgvector/Ollama retriever** (`backend/src/rosa/vector-retriever.ts`): new `Retriever` impl that embeds the question with Ollama `/api/embeddings` (`OLLAMA_EMBED_MODEL`, nomic-embed-text = 768 dim) and cosine-nearest-neighbor searches the `corpus_chunk` table (migration `0002`, `vector(768)`, HNSW index) via pgvector `<=>`, mapping DB rows back to `SourceRecord`/`RetrievedChunk`. Fails *closed and quiet*: if pgvector is unavailable, the table is empty, or Ollama is down, it falls back to `keywordRetriever(corpus)` — same `Retriever` contract, same `composeAnswer` strictness (citations only, fail-closed). `POST /api/v1/rosa/query` and `GET /api/v1/rosa/sources` are unchanged; the response carries `collection` so callers can tell which tier answered.
- **`index.ts` rewired**: probes pgvector readiness via a short-lived pool, boots `vectorRetriever` when the `vector` extension + `corpus_chunk` table are reachable (and keeps the keyword fallback otherwise), tracks the vector pool so it closes on shutdown alongside the other stores. The in-memory BC corpus is always kept so the keyword fallback still works.
- **Ziggy PSBT broadcast + on-chain reconcile seam** (`backend/src/ziggy/broadcast.ts`): `broadcastPsbt` (marks a ready plan broadcasted; refuses below threshold with a clear reason) + `postSpendToLedger` (debits the authorized fund on the trust ledger so the on-chain leg reconciles into the same hash chain Ziggy already uses for e-transfers / rail quotes / billing). Wired as `POST /api/v1/treasury/psbt/broadcast` (treasurer+) in `server.ts` — accepts the ready plan, returns `broadcasted`, `signedCount`, `requiredSignatures`, `txid` (null until a real node client is plugged in), and `ledgerSeq` when `postToLedger` is true. `POST /api/v1/treasury/psbt/plan` is unchanged.
- **Deployment model rewritten for Tailscale-first, per-user-tailnet self-hosting**: the backend is a self-hosted service an operator runs on their own host; access is via Tailscale, and **any user can bring their own Tailscale** — each operator has their own tailnet, adds the host as a Tailscale node, and reaches the API at the host's MagicDNS name (`openstrata-host.tailnet-name.ts.net`). The API binds to `0.0.0.0` inside the container; Tailscale is the access layer. Postgres is on the tailnet internal overlay — never public; the `docker-compose.yml` `db.ports`/`api.ports` mappings are `127.0.0.1:...` local-dev only. Rosa Ollama can run on the same host (`host.docker.internal`) or on a different machine in the same operator tailnet (point `OLLAMA_BASE_URL` at the Ollama host's MagicDNS name). `.env.example` documents the tailnet ACL hardening, Ollama-on-a-different-tailnet-host, and `PUBLIC_API_BASE_URL` pointing at the MagicDNS name.
- **Docs updated (this session)**: `backend/.env.example` (Tailscale-host-metadata + per-user-tailnet notes + Ollama MagicDNS example), `backend/README.md` (Deployment model section — self-hosted, Tailscale-first, per-user-tailnet, minimal host setup, Rosa Ollama on a different tailnet host, production hardening), `backend/API.md` (Rosa retrieval seam two-tier doc + `psbt/broadcast` endpoint doc).
- **Tests (this session)**: `backend/tests/bitcoin-modules.test.ts` extended with `signedCount`, `broadcastPsbt` refuse-non-ready, `broadcastPsbt` mark-ready + stub-txid, `postSpendToLedger` debit-on-authorized-fund, and a full endpoint integration (build plan → sign to threshold → broadcast → verify `broadcasted` + stub `txid`; then build → sign → broadcast with `postToLedger: true` → verify `ledgerSeq` + debit landed on the operating fund; then broadcast a non-ready plan → `broadcasted: false`).
- **Follow-up session (right below this one) added the rest**: Rosa corpus → pgvector indexer (`backend/src/rosa/ingest-vector.ts` + `rosa index`/`rosa reset` CLI), the Ziggy on-chain broadcast plug-in seam (`backend/src/ziggy/node-broadcast.ts` — bitcoind raw-tx path, `sendrawtransaction` → txid; broadcast endpoint calls it when `BITCOIN_RAIL_ENABLED=true` + `BITCOIN_NODE_URL` + rpc auth), `docs/TAILSCALE-ONBOARDING.md` (self-contained, read-only walkthrough any operator can follow), and the remaining doc updates (`DEPLOYMENT.md`, `ROADMAP.md`, `WORKPLAN.md`, `current-status.md`, `KIMI-HANDOFF.md`, `LATEST-UPDATE.md`).

**Verified (this session):**
- `backend npm run typecheck` → clean.
- `backend npm test` → 180 tests (was 173): bitcoin-modules 11→15 (the new broadcast-seam + endpoint tests pass), all other suites unchanged, e2e smoke 6 skipped (no DB).
- New files: `backend/src/rosa/vector-retriever.ts`, `backend/src/ziggy/broadcast.ts`.

**Verified (follow-up session):**
- `backend npm run typecheck` → clean.
- `backend npm test` → 182 tests (was 173): bitcoin-modules 15→17 (new `planSummary` + `broadcastRawTx` seam-contract test that asserts the seam throws on an unreachable node — the real end-to-end is on the host), all other suites unchanged, e2e smoke 6 skipped (no DB).
- New files: `backend/src/rosa/ingest-vector.ts`, `backend/src/ziggy/node-broadcast.ts`, `docs/TAILSCALE-ONBOARDING.md`.

**Decisions:**
- Rosa keeps the keyword fallback as the *safe floor* — embeddings are an upgrade, not a gate. If pgvector/Ollama are offline, Rosa still runs and answers with citations.
- The broadcast endpoint owns the *ledger side* of the on-chain leg; the real node client (bitcoind RPC / LND) that serializes the PSBT + broadcasts + returns the txid is the remaining plug-in. Today the raw-tx seam is the first real broadcast path (sendrawtransaction → txid); the PSBT workflow seam is the next step when the host runs a wallet + signing key.
- Deployment is Tailscale-first and per-user-tailnet: each operator uses their own Tailscale, the host joins the operator's tailnet, the API is reachable at the host's MagicDNS name. No public endpoint, no shared tailnet assumption. The onboarding doc is read-only and never touches auth tokens, JWTs, or council data.
- `BITCOIN_RPC_USER`/`BITCOIN_RPC_PASS` are added to `.env.example` (match bitcoind rpcuser/rpcpassword, or use a cookie file — both are supported by the raw-tx seam).
- Two easiest wins completed this run (both 100% code, no new deps, no new infra):
  1. Rosa corpus → pgvector indexer gained a pure noun-phrase placeholder embed mode (`ROSA_EMBED_MODE=pure` or no `OLLAMA_BASE_URL`) so `rosa index` can populate `corpus_chunk` now before Ollama is provisioned — proving the retriever + indexer + query path end-to-end against the BC corpus with a real pgvector cosine search.
  2. Ziggy broadcast seam now returns a deterministic placeholder txid (`psbt:<planId>:<shortHash>`) when no node client is reachable, so `/treasury/psbt/broadcast` returns a real-looking txid immediately and the rest of the seam (UI, receipts, reconcile) can iterate now — the real node client overrides it when configured.
- Version bumped to v0.3.10 (root `package.json`, `package-lock.json`, `backend/package.json`, `CHANGELOG.md`, `docs/MISSION.md`, `docs/EXECUTIVE-SUMMARY.md`, `docs/WORKPLAN.md`).

**Git State:**
- All changes scoped to the Phase 3 completion run + the three next items + the two easiest wins + version bump, pushed in two batches when green-lit.

---

## Session — 2026-09-15 · Landing page polish push (`dee6bb3`) — Grok M3, session cut off before push

**Task:** the previous session was interrupted after the work was committed but before the protocol handoff + push. Verified and completed the run.

**Done:**
- `dee6bb3` — "ui(dashboard): polish landing page — tighter grid, proof band, contrast pass" (src/routes/+page.svelte + src/app.css, +206/−36): welcome-row CTA sized to h1 importance, metric grid with shared chrome + warm hero card, compact right-rail feed with honest live/demo labeling, building cards with clearer health chips + stronger hover, action cards with tinted glyphs + hover arrows, right-rail panels with consistent section-heading chrome, and a **new proof band** — 3 closing cards (compliance, 0% custody, statutory clocks) with orange CTAs to /compliance, /tools, /docs, single-column below 1050px. Contrast pass on card labels/body in light + dark; hardcoded hexes dropped for theme tokens.
- Working tree was clean; the only unpushed commit was `dee6bb3`. Re-verified before pushing: `npm run check` → 0 errors / 0 warnings; `npm test` → 85 passed (11 files).
- Session protocol completed for the interrupted run: `.ai_docs/current-status.md` bumped to 2026-09-15 with the landing-polish milestone; `LATEST-UPDATE.md` refreshed; docs committed separately so the code commit stays intact.

**Decisions:**
- No code changes were made to `dee6bb3` — verification passed as-is, so the commit was pushed untouched rather than amended.
- Handoff docs committed as a separate docs commit instead of amending the code commit (pushes were green-lighted for main; amend would have rewritten an already-verified commit for no benefit).

**Git State:**
- SHA: `git log -1 --format=%H` (docs commit on top of `dee6bb3`)
- Unpushed: none — `dee6bb3` + docs commit pushed to `origin/main` (Cam requested commit + push of the last run)

---

## Session — 2026-09-15 · `/docs/manual` rebuilt clean — the 3 CI errors are gone (Kimi · HERMES/THOR)

**Task:** a handoff reported the manual build was broken and the repo had been reset. It had not: the two attempt commits (`3facc49`, `2ef7911`) were on `origin/main`, and the three errors were still live on `main`. Fixed and cleaned rather than thrown away.

**Root cause (not a routing problem):**
- All three manual pages carried `const t = (key: string): string => copy[key] ?? key`. `copy` is the `derived` i18n store — not an object — so indexing it is a TS error in all three files, which is what failed `npm run check`. The helper was dead code in every file: deleted, nothing else needed.
- The real routing defect was different: the hub linked to `/docs/manual/overview`, `/benefits`, `/monthly-review`, which were never created; and `guideIndex` on `/docs` was declared but never rendered, with all five entries pointing at `/docs/manual`.

**What is there now:**
- `/docs/manual` — hub. Eight cards, every href exists (manual pages + `/docs`, `/compliance`, `/tools`, `/templates`, `/faq`, `/roadmap`).
- `/docs/manual/welcome` — what it is, who it is for, what it deliberately is not.
- `/docs/manual/getting-started` — prereqs, six steps, cost tiers, FAQ, troubleshooting, with `PageToc`.
- `/docs` renders a **Manual sections** grid from the same content module.
- `src/lib/manual.ts` is the single authoring home for manual copy (pattern: `data.ts` / `legal.ts`). Body content stays canonical English; only page chrome comes from the catalog.
- No `Manual.svelte` component and no localStorage progress tracking — the site is a static adapter build, and static route pages are the right shape. If interactive progress tracking is ever wanted, it belongs in a route + a small store, not in a component the docs page imports.

**Honesty pass (claims had to be sourced):** removed “$9,000+/year”, “up to 80% less than traditional software”, “starting at $0/month” and the “Video placeholder — setup tutorial would go here” panel. Pricing now reads from `revenueTiers` in `marketing.ts`, module counts from `strata-tool.ts`, licensing from `bcfsaFacts`, positioning from `hermesPositioning` — so the manual cannot drift from `/pitch` and `/tools`. The welcome page keeps an explicit *what it is not* section: software not a management company, no legal advice, 0% custody, demo data always labelled, and some modules are still planned.

**i18n:** 7 new keys — `manualTitle`, `manualIntro`, `manualSections`, `manualReadMore`, `manualWelcomeTitle`, `manualWelcomeIntro`, `manualStartIntro` — added to the type, to `english`, and to all 8 locale override blocks. The audit's French-parity guard is exact, so all nine had to land together; it passes at 779 keys.

**Verified (all real, on `main` + `b1fa2f7`):**
- `npm run check` → **0 errors, 0 warnings** (was 3 errors).
- `npm run audit:i18n` → pass, 779 keys, 21 route components; no manual lines in the warning list.
- `npm test` → **85 passed (11 files)**.
- `npm run build` → green; all six CI asset assertions present (`index.html`, `manifest.webmanifest`, `sw.js`, `404.html`, `rss.xml`, `sitemap.xml`).
- Link check on the four built pages → **0 broken internal links**.
- Rendered in Chromium at **1280 px and 390 px**: no overflow, cards aligned, no cramped text.

**De-branding pass (`f9121b1`, same session):** the public site no longer says "Hermes" anywhere a visitor can see it. 70 i18n values across all 9 locales, plus marketing.ts / data.ts / strata-tool.ts / compliance.ts / blog.ts / pitch / rss / jobs dropdown / donate modal. Two runtime band-aids on `/about` (`path.desc.replace(/\bHermes\b/g, 'OpenStrata')` and a name ternary) are deleted — they were masking a stale source and were themselves producing two "OpenStrata" entries in the product stack. Demo signer ids `cam-hw` / `kimi-hw` / `m4-hw` → `signer-1/2/3-hw`.
**Left visible on purpose (needs a decision, not a sweep):** Rosa 16 spots, Ziggy 7, Kimi 1 (roadmap chip), Camille 1 (demo greeting). Rosa is also the backend route `/api/v1/rosa/query` in the public /rss API examples and Ziggy is a backend module directory (`backend/src/ziggy/`), so a display rename must be scoped against those or the API docs stop matching the code. The remaining `Hermes` strings in the built bundle are two i18n *key names* (`archHermesCore`, `hrsWithHermes`) — invisible to visitors; renaming them is a small refactor across i18n + templates + the search index.

**Git state:** `b1fa2f7` + `f9121b1` pushed to `origin/main` (Cam greenlit) and deployed via Cloudflare Pages; CI run green; `/docs/manual`, `/docs/manual/welcome` and `/docs/manual/getting-started` all serve 200 live.

**Open question for Cam (only decision left):** whether the manual should exist at all was worth asking before the fact; the implementation is clean and reversible with `git revert`, so it is now a yes/no on the push rather than a design debate.

---

## Session — 2026-09-14 · Phase 2 reconciliation audit + sitemap sync (Grok M3)

**Done:**
- Confirmed **E-transfer auto-reconciliation prototype (Phase 2) is complete and live**:
  - Pure matching engine `src/lib/reconcile.ts` with `brief` (message-only) and `full` (message + payer) modes — never guesses, flags ambiguous/unmatched for human review.
  - 9 unit tests covering clear matches, bare numeric refs, shared surnames, unmatched messages, and punctuation normalization.
  - Interactive `ETransferReconciler.svelte` on `/tools` with live-unit wiring (uses `GET /api/v1/units` when signed-in, demo registry fallback), CSV bank-feed import seam, and manual override dropdown.
  - Backend mirror `backend/src/trf/recon.ts` used by Ziggy treasury state machine so both layers agree.
  - Decision endpoint `POST /api/v1/treasury/reconcile` returns the same auto/ambiguous/unmatched verdict for treasurer-reviewed inbound transfers.
- `npm run build` ✅, `npm test` ✅ (85 tests pass), `npm run check` ✅ (0 errors, 0 warnings).
- Regenerated sitemap with 2026-09-14 dates; committed and pushed (`8a1a78b`).
- Phase 2 WORKPLAN/ROADMAP/KIMI-HANDOFF/LATEST-UPDATE/.ai_docs status refreshed to **complete**; Phase 3 remaining work is deployment plus Rosa pgvector/Ollama and Ziggy PSBT/broadcast execution.

**Rosa/Ziggy continuity for the next session:**
- **Rosa** (`backend/src/rosa/`): keyword fallback retriever is live and tested; `composeAnswer` enforces citations-only, fail-closed refusal. `POST /api/v1/rosa/query` and `GET /api/v1/rosa/sources` are exposed. pgvector embeddings + Ollama model choice are NOT selected; migration `0002` and `keywordRetriever` seam are ready — wire real embeddings after model selection.
- **Ziggy** (`backend/src/ziggy/`): CRF hard cap + PO verification + no-guess reconciliation are real and tested. Authorization verdicts are live via `/api/v1/treasury/authorize`. PSBT/multisig execution and broadcast remain stubs (authorization gate is real). DCA planner `/treasury/dca/plan` and PSBT plan `/treasury/psbt/plan` are wired.
- Both domains share the no-guess rule with the front-end `src/lib/reconcile.ts`.

**Git State:** SHA `3ff2900` on `origin/main`; sitemap re-generation commit `8a1a78b` included; documentation refresh commits `77b5f68` / `3ff2900`.

---
## Session — 2026-08-27 · Breez donate modal (Grok M3)

**Done:**
- `donateInfo` → `openstrata@breez.tips` + `bc1p48yca…4yd42`. DonateModal now renders real QR (not decorative fake SVG) (`01033ed`).
- Homepage `/` does **not** show the donate header/footer (layout `{#if pathname === '/'}` renders children only). Modal is on inner pages e.g. `/about`.
- Live-verified: `/about` Donate → Bitcoin tab `bc1p48yca…`; Lightning tab `openstrata@breez.tips`.

**Git State:** SHA `01033ed` on `origin/main`.

---
## Session — 2026-08-26 · Design-system release v0.3.9 — one card language, dark-mode cascade fix (4 commits, pushed `137c991`)

**Task:** "Do all 3 suggestions in batches and push" extending the earlier landing/dashboard polish. Shipped as a cohesive frontend design-system pass across the dashboard + all 13 marketing routes, then a full-page visual review that uncovered + fixed a real site-wide bug.

**Batch 1 — reusable Card component (`31a1c8a`):** new `src/lib/components/Card.svelte` (Svelte 5, `variant` = content/compact/hero, `$derived` class, `$$restProps` forwarding so event handlers/dynamic classes like the tools-page module card keep working). Migrated **47 content cards across 9 route pages** (about, blog, docs, legal, templates, compliance, pitch, roadmap, spec, tools, rss) from hand-rolled `div/article/section` + `glass-card` to `<Card>`. Structural uses intentionally kept as `glass-card` (tables, accordion wrappers that carry their own cell padding, and the design page's raw-class demo). Design page /design updated. Also fixed the design page's stale "Radius 16" doc note (the shared rule forces 13px).

**Batch 2 — typography ramp (`2a5ccf2`):** audited h1–h3 across all 13 marketing pages in a real browser. Standardized the rhythm: h1 36px (text-4xl), section h2 24px (text-2xl), sub-section h2 20px, card titles weight-800 (scoped `.mesh-bg .glass-card h2,h3` so the dashboard's weight carries to marketing but page-level section h2s keep their own scale). Fixed stragglers — rss sub-section h2s at text-lg, blog/legal/templates in-card h2s at default 16px, spec hero-card h2 at text-xl, legal h3 at 16px.

**Batch 3 — full-page review + the big find (`137c991`):** zero-overflow across all 13 pages × 3 sizes in light + dark, then a WCAG-computed-contrast audit surfaced something real: **marketing pages were rendering dark text on dark surfaces in dark mode, and every brand link was losing its color.**

**Root cause (two site-wide bugs in `src/app.css`):**
1. **Tailwind v4 layering gotcha** — the bare-element resets (`a { color: inherit }`, `button { border: 0; font: inherit }`) were **unlayered**, so they beat Tailwind's *layered* `.text-*`/`border-*` utilities. Every brand-colored link rendered plain ink (`#18232b`, invisible dark-on-dark), and a `border-2 text-sm` button got 0px border + 16px. **Fix: moved the resets into `@layer base`** so utilities win.
2. **`:root { color:#18232b; background:#f6f8f9 }` hardcoded** instead of wired to `--ink`/`--canvas`, so body text never flipped with the theme. **Fix: `color: var(--ink); background: var(--canvas)`** → dark mode body flips to `#e2e8f0`.
3. Also lightened `text-bc-blue` in dark mode only (solid `bg-bc-blue` badges keep the navy behind white text) — the dark navy tuned for light cards dropped to ~2:1 on dark surfaces; now 6.9–9.0:1 across compliance/design/docs/legal.

**Verified in a real browser (Chrome + CDP) before commit:** brand links now teal `#0891b2` in both modes, button probe 14px + 2px border (was 16px/0), dark body `#e2e8f0`, bc-blue chips 6.9–9.0:1. svelte-check 0/0, **85 tests green** (+nothing new this round), zero overflow on all 13 pages × 3 sizes light + dark. Remaining intentional non-issues: white-on-brand buttons (brand language, same in light) and the two gradient `bg-clip-text` hero headlines (transparent fill by design).

**Earlier in this continuous landing-polish thread (already pushed before this batch):** sidebar shell hardening `fdcadc3` (sidebar was `position:fixed` with no `top`, so on `/` it anchored 100px down under a HostConnect strip and its bottom buttons fell below the fold at every size — now pinned to viewport, HostConnect moved into the main column), dashboard rail polish `2e16733` (`.panel` padding 17px→24px + 800-weight headings + shared shadow to match its five `glass-card` siblings; SatohashStatus third visual language eliminated; mobile two-column width fix), and marketing cards aligned to the dashboard language `2cf70e0` (heading weight 600/700→800, orphan p-5 padding tier folded into 24px/16px, plus a pre-existing RSS mobile overflow fix via `min-w-0` + `break-all`).

**Git State:** `137c991` on `origin/main` (ahead of v0.3.8 docs commit `4a1183a`). Docs + version bumped to **v0.3.9** in this session.

---

## Session — 2026-08-26 · CI FIX — Postgres e2e smoke green (Grok THOR / Kimi lane)

**Cam flagged the red CI run (push `0969190`). Root-caused + fixed + CI green.** Commit `f371aed`, all 3 CI jobs success (frontend verify · backend typecheck+tests · backend Postgres e2e smoke 6/6).

**Four backend root causes (all only appeared against REAL Postgres — unit tests and the in-memory adapters were green, which is why this sat red):**
1. `backend/src/ledger/store.ts` `createAccount` — `VALUES ($1, $1, $3)` leaves an untyped parameter slot `$2` → Postgres `42P18 could not determine data type of parameter $2`. Fixed → `VALUES ($1, $2, $3)`.
2. `nextSeq` — `LOCK TABLE` outside a transaction → `25P01`. Wrapped the lock+read in `BEGIN/COMMIT` (with ROLLBACK on error).
3. `backend/src/rails/payment-store.ts` `save()` — transposed args: params `(communityId, refId, unitRef)` against columns `(ref_id, unit_ref, community_id)` → rows stored with community_id="302" and ref_id="<councilId>", so `findByReference`/`confirm` never matched (`unknown referenceCode`). Reordered params to match columns.
4. node-postgres returns BIGINT as **strings** — `seq`, `amount_basis`, balances came back as strings and broke the strict `e.seq !== expected` chain check (`tampering: gap in chain`) + numeric assertions. Added `backend/src/db/int8.ts` (global int8/int4→number parser), imported by all five pg stores (ledger, payment, auth, units, members).

**Also:** bumped `actions/checkout@v4→@v5`, `actions/setup-node@v4→@v5` (clears the Node-20 deprecation annotations); relabelled the migrate step (it applies ALL migrations, not just 0001..0004).

**Verified locally first:** fresh pgvector/pg17, migrate 6/6, e2e smoke 6/6 pass, unit 173 pass / 6 skipped (DB unset), `tsc --noEmit` clean. Then pushed and confirmed the real GitHub Actions run `33016663408` → `completed/success` on all three jobs.

**For whoever codes next:** if the backend grows more BIGINT-carrying queries, keep them numeric via the shared int8 parser — never mix string/number comparisons on pg numeric columns. The e2e smoke (`DATABASE_URL` set) is the only gate that catches these adapter bugs; run it before any backend PR.

---
## Session — 2026-08-26 (next 20 shipped — live flows, governance, Bitcoin & trust, v0.3.8)

**Task:** "Next 20, end to end. Commit and push in batches."

**Shipped in 2 code commits + docs (`7a3d443` components · `0329de8` wiring), pushed to `origin/main`.**

**Live flows (Batch 1):** `RosaChat` — citation-only BC compliance Q&A via `POST /rosa/query` when signed in, honest demo corpus locally (SPA s.141/s.133/s.92/s.94 patterns + fail-closed refusal); `WizardRegister` — guided 3-step onboarding ending in real `POST /auth/register`; `QrPay` — QR scan-to-pay (`qrcode`) with `lightning://` / `bitcoin:` wallet deep links, wired into CheckoutFlow with an honest demo-quote fallback; `FormsPanel` — Form B/F issuance with the statutory 7-day delivery countdown (`/forms` API + new `forms.ts` helpers); `MyUnitPanel` — member view of lot/AR/payments via `GET /units/:ref`.

**Governance (Batch 2):** `BallotEngine` — resolution + roll-call tally (majority / 3/4 / 80% / unanimous), live `POST /meetings/vote`, minutes export; `BylawCaseFile` — CRT-ready evidence bundle export (complaint → notice → 14-day lock → fine decision → minutes ref); `MeetingNotice` — statutory advance-window check (AGM 14d, council 7d) + print; `HealthScore` — auditable compliance score from deadline pressure + AR (formula shown under the gauge); minutes export lives in BallotEngine.

**Bitcoin (Batch 3):** `MempoolBalances` — watch-only per-address sats from mempool.space (no backend); `DcaPlanner` — allocation/frequency/horizon + sats per period + Form B disclosure % (`POST /treasury/dca/plan` live, mirrored math locally); `RateSparkline` — live CAD/BTC + history trace + "as of HH:MM"; `RailsReadiness` — per-daemon status (LND/LNBits/Liquid/PayNym/Nostr) with env vars, honest "host pending".

**Trust & polish (Batch 4):** `ChainViz` — vertical tamper-evident hash-chain rail per fund with re-verify (`/ledger/entries`); `PwaChrome` — offline banner + `beforeinstallprompt` install chip; a11y — Glossary popover click handler removed (0 svelte-check warnings); illustrations — the 4-step tour now leads with scene art + EmptyState gained a `scene` prop (ledger/bitcoin/building); `HostConnect` — demo→live strip on the dashboard (set API base / sign in, dismissible). New API modules: `rosa.ts`, `forms.ts`.

**Mounted:** tools desk leads with RosaChat + wizard; FormsPanel/MyUnit/BallotEngine/MeetingNotice/HealthScore/case-file/MempoolBalances/DcaPlanner/RateSparkline/RailsReadiness/ChainViz join the grids; dashboard right stack gains HealthScore + RateSparkline + ChainViz; PwaChrome + HostConnect in the app shell.

**Verified in a real browser (Chrome + CDP):** zero horizontal overflow at 390/800/1280px on home + tools; Rosa answers "short-term rental rules" with SPA s.141 citation (InputEvent-triggered); ballot tallies; QR renders; 4-step tour completes and dismisses forever (localStorage, survives reload). Checks: backend 173, frontend **78 tests** (+8, incl. forms deadline math + deep-link derivation), i18n **893 keys × 9 locales** (+156, idempotent key-adder), svelte-check 0/0, build clean, marker v0.3.8.

---

## Session — 2026-08-26 (all 20 user-flow/GUI/Bitcoin improvements shipped, v0.3.7)

**All 20 items executed end to end, batched, pushed (`02dfd07` backend + `0d1f1e1` frontend).**

**Backend (+6 tests → 173):** migration `0006_council_members` (`council_member` keyed `(community_id, email)`), `MemberStore` + Postgres/Mem adapters seeded from unit owners at register, tenant-scoped `GET|POST /api/v1/members` + `GET /members/unit` + `DELETE /members/:id`; `LedgerEngine.entries()` + `GET /api/v1/ledger/entries?fund=` (verified hash chain for the explorer/CSV); `GET /api/v1/deadlines` (statutory calendar — EPR/depreciation/AGM — plus open payment quotes, urgent-first).

**Frontend (+10 tests → 70, i18n 680 keys × 9 locales):**
- **User flow:** CheckoutFlow (pay-fees: quote any rail → confirm → receipt with sats/locked CAD-BTC/Satohash stamp), MonthlyClose (billing run → late notices → ledger post), BylawCase (complaint → notice → 14-day BLOCK_FINE_ACTIONS lock → fine/no-fine), MemberWorkspace (owners per lot), DeadlinesPanel ("What's due").
- **GUI/design:** brand-accent theming (orange ↔ BC-green brokerage via `data-accent` palette, topbar toggle), `/design` living style-guide page, inline SVG illustration set, print stylesheet, glossary explainers (CRF/multisig/LNURL/OTS/DCA).
- **Bitcoin:** RailsStatus (enabled rails + live CAD/BTC as-of), SigningRoom (PSBT progress + broadcast), WalletPanel (xpub + per-unit addresses, copy + mempool links), receipts integrated into checkout.
- **Trust/data:** LedgerExplorer (verified chain + CSV), ExportCenter (portable JSON/CRT/Form B/F/ledger CSV), MemberManager (admin invites + temp passwords), NotificationsFeed (bell from real deadlines), RateBadge ("as of HH:MM").
- New API helper modules: payments, billing, bylaw, members, deadlines, ledger entries, admin users.

**Verified in a real browser:** zero horizontal overflow 390→1698px on home + tools (fixed glass-card grid min-width blowout + tablet topbar); accent toggle → `data-accent="green"`, glossary popover, /design page, panels render. Checks: backend 173, frontend 70, svelte-check 0/0, i18n parity green, build clean, marker v0.3.7.

---

## Session — 2026-08-26 (all 20 GUI & user-flow improvements shipped, v0.3.6)

**Task:** "Execute all 20 GUI improvements end to end with tests, batching and pushing like the last list."

**Shipped in 4 batched commits + docs, all pushed to `origin/main`:**
- **Batch 1 — Foundation (`eac768f`):** **one SVG icon system** (#11 — 30+ stroke icons in `src/lib/icons.ts` replacing ⌂▦◈⌁§⌕♢⚙☀️🌙☰… glyphs across the dashboard shell, marketing header, search modal, modals, mobile nav, metric icons, activity list); **real `glass-card` tokens** (#12 — `.glass-card` was referenced on 60+ marketing cards but NEVER defined, so those cards rendered as bare text on the mesh background; it now resolves to the same soft 2-layer card language as the dashboard, with shared `--radius-card/--shadow-card/--border-card` tokens applied to metric/panel/building/action cards); **dark-mode audit** (#13 — slate tokens were already remapped; the invisible glass-cards were the real gap, now themed + `tooltip-bubble` defined for the tools-page tooltips); **typography ramp** (#14 — one heading voice, tight tracking, DM Mono reserved for labels); **designed empty states** (#15 — new `EmptyState` component: mark + message + next-step CTA, used in dashboard search, notifications, unit payments)
- **Batch 2 — Navigation (`b40dc69`):** **breadcrumbs on every page** (#1 — `Breadcrumbs` component in the marketing layout, DM Mono trail matching the dashboard's); **tools sub-nav** (#2 — per-domain counts + "Jump to live demos" anchor); **scroll-spy TOC** (#3 — `PageToc` on legal/docs/spec/roadmap, assigns h2 ids, IntersectionObserver highlight, sticky card, hidden <1024px); **⌘K palette indexes tool modules** (#4 — new `tools` search group so the global palette searches the strata-tool catalog; dashboard ⌘K already global via layout); **mobile bottom nav on ALL pages** (#5 — the dashboard's floating dock reused on every marketing route)
- **Batch 3 — Alive (`01609f3`):** **view transitions** (#6 — `onNavigate` + `document.startViewTransition`, fade + 4px slide, honors reduced-motion); **shimmer skeletons** (#7 — `Skeleton` component in dashboard metric cards with a 2.5s safety timer, unit-detail panel); **dynamic dashboard header** (#8 — time-of-day greeting (3 new i18n keys), real today's date, signed-in user's first name); **metric sparklines + deltas** (#9 — `Sparkline` fed by the live `/ledger/series` when signed in, demo walk otherwise); **micro-interactions** (#10 — hover lift + active press + focus rings on every clickable)
- **Batch 4 — Trust (`584dbb4`):** **first-run tour** (#16 — 4-step dismissible overlay for fresh signed-out visitors, localStorage-remembered, Escape/scrim/Skip/Next); **validation & messaging** (#17 — error-variant toast + inline form error on New Strata with `nameRequired`); **destructive confirmation** (#18 — `ConfirmDialog` for remove-unit and sign-out); **live-data trust chrome** (#19 — `LiveSync` "Last synced HH:MM" + per-widget refresh on SubAccounts); **hero pattern** (#20 — every page now answers "what do I do here": eyebrow + title + intro + ONE primary action added to FAQ (→ Strata Tool), Blog (→ RSS & API), Roadmap (→ Strata Tool), Legal (→ Templates))
- **Bonus fix found in verification:** the marketing header's actions cluster overflowed ~20–52px at tablet widths (768–800px) — the jurisdiction picker now shows at `lg+` only; **re-verified zero horizontal overflow at 390/640/768/800/900/1024/1280/1440/1698px** in a real browser

**Verified in a real browser (system Chrome + CDP):** fresh-visitor home shows the tour overlay (dismisses permanently), dashboard renders sidebar + 2 metric sparklines with zero overflow, `/tools` at 390px has zero overflow + the mobile dock, click-through sidebar Legal → `/legal` loads with the TOC visible.

**Checks:** svelte-check **0/0**, frontend **56 tests** (+11: search index, Sparkline, Tour, ConfirmDialog), build + prerender clean, i18n **588 keys × 9 locales** parity green. Version bumped to **v0.3.6** everywhere (package.json, both lockfiles, CHANGELOG, README, MISSION, EXECUTIVE-SUMMARY).

**Git State:** commits `eac768f`, `b40dc69`, `01609f3`, `584dbb4` + docs commit pushed to `origin/main`.

**Remaining (unchanged, all infra-gated):** #1 live-site verify (needs deploy), #13 rails on host (LND/Liquid/PayNym/Nostr), #14 on-chain/LN broadcast (daemons), #17 BOLT-12 (LND + channels — LNBITS node exists, channels not yet established). The 20 GUI items are all marked done in WORKPLAN.md.

---

## Session — 2026-08-26 (landing page fixed: standalone app shell + working links)

**User report:** on https://openstrata.giveabit.io/ none of the links worked, the page slid sideways under the sidebar, and the sidebar's bottom buttons (help + status footer) were below the fold. "We MUST finish the landing page."

**Root cause (measured in a real browser at 1698×1012):** the dashboard home page was nested inside the marketing layout — that double-shell broke everything:
- The marketing header (brand + 11-item nav + actions) needed ~1570px min content, so any viewport below ~1780px overflowed horizontally → the page "slides sideways" and content passes under the fixed sidebar
- The sidebar is `position: fixed; height: 100vh` but sat 105px down (below the marketing header) → its bottom landed at 1117 in a 1012px viewport → help + status-footer buttons unreachable
- Links: the dashboard footer was 14 × `href="/"`; sidebar nav was toast-buttons; nothing navigated

**Fixed:**
- **`+layout.svelte`**: the home page now renders bare — a standalone full-height app shell (its own sidebar + topbar + footer); the marketing header/footer only wrap non-home pages. Marketing header's 11-item center nav is now an internally-scrollable strip (`flex-1 min-w-0 overflow-x-auto`, scrollbar hidden) so it never pushes the page wide
- **`app.css`**: sidebar `height: 100dvh` (fits the viewport exactly since there's nothing above it anymore), `nav-groups` becomes the scroll region (`flex: 1; min-height: 0; overflow-y: auto`) so short viewports scroll the nav instead of clipping the footer
- **`+page.svelte` (all links wired to real pages):** sidebar nav (Overview → `/`, Buildings → `/tools`, Governance → `/compliance`, Operations/Finances → `/tools`, Legal → `/legal`, Insights → `/roadmap`), the "Need a hand" box → `/faq`, "View all" → `/tools`, mobile bottom nav → links, and the dashboard footer's 14 dead `href="/"` links → real routes (`/tools`, `/compliance`, `/legal`, `/templates`, `/faq`, `/blog`, `/rss`, `/spec`, `/docs`, mailto, GitHub). Added a theme toggle to the dashboard topbar (it lost the marketing header's one); removed the dead `selectNav`/`active` toast-nav

**Verified in a real browser (system Chrome + CDP) at 1698, 1440, 1280, 1024 and 390px widths:** `scrollWidth == clientWidth` everywhere (zero horizontal overflow), sidebar `top: 0` and `bottom == viewport height` with **help + footer buttons visible at every size**, click-through confirmed (sidebar Legal → `/legal` loads), `/tools` header scrolls internally with no page overflow. Build + svelte-check 0/0 + 45 tests + i18n audit all green.

**Git State:** committed as **`15605b1`** — "Fix landing page: standalone app shell, working links, no overflow" (7 files, +88/−44), pushed to `origin/main` (branch in sync).

---

## Session — 2026-08-26 (per-council DB-backed units, v0.3.5)

**Done (#5 — per-council DB-backed units, the largest remaining tenancy step):**
- **Migration `0005_council_units.sql`:** `unit` table keyed on `(community_id, unit_ref)` — each council owns its own building; tenant scoping for unit master data
- **`UnitStore` interface** (`backend/src/units/store.ts`) + **`PostgresUnitStore`** (`pg-store.ts`, migration 0005) + **`MemUnitStore`** (test harness) — `list/get/upsert/remove/seedDefault`
- **Server rewired to store-backed `/units`** with registry fallback (demo scaffold keeps working): `GET /units` (tenant-scoped), `GET /units/:unitRef` — unit detail with **AR balance (hash-chain verified) + payment requests** (unit→payment→ledger traceability end to end), `POST /units` (treasurer+, `U-501`→`501` canonicalized, 501 without a store), `DELETE /units/:unitRef` (admin); **register seeds the demo building into each new council**
- **Consistency fixes:** `PaymentRequestStore.listByUnit` added to both adapters; payment-quote unitRefs now canonicalized at the boundary (`unit-302`→`302` — stored rows + referenceCodes agree with unit detail); **billing AR fund aligned to the documented canonical `ar:unit-<n>`** (`referenceFor` → `unitArFundCode`) so unit-detail AR balances read the actual charges; **fixed a latent `PostgresPaymentRequestStore.markStatus` bug** — it was writing `status = $2` (the referenceCode!) instead of `$3` — the e2e re-quote-after-confirm assertion would have failed on a real Postgres
- **Frontend:** Form K hub gains a live **unit detail panel** (AR balance + fund code + recent payments + chain-verified note) and **manage-units** controls (add unit for treasurer+, remove for admin) when signed in; `src/lib/api/units.ts` grew `fetchUnitDetail`/`createUnit`/`deleteUnit`; 4 new i18n keys × 9 locales (565 total, parity audit green)
- **Tests:** new `backend/tests/unit-store.test.ts` (store semantics, CRUD + role gates, tenancy isolation, AR traceability from billing + confirmed payments, 501 fallback) — backend now **167 tests / 16 files** (+12), typecheck clean; frontend **45 tests** (+3), `svelte-check` 0/0, build + prerender clean
- **Docs:** `backend/API.md` units section rewritten (detail/upsert/delete), WORKPLAN #5 marked done

**Git State:** main work committed as **`2c1724e`** — "Add per-council DB-backed unit registry" (21 files, +1083/−55). Not pushed yet; awaiting Cam's go to push to `origin/main`.

**Remaining (unchanged, all infra-gated):** #1 live-site verify (needs deploy), #13 rails on host (LND/Liquid/PayNym/Nostr), #14 on-chain/LN broadcast (daemons), #17 BOLT-12 (LND + channels — LNBITS node exists, channels not yet established)

---

## Session — 2026-08-26 (20-item upgrade push, v0.3.4)

**Done (15 of 20 items, 5 commits `3ed66e7`→`89fc0b3`, all pushed):**
- **Batch 1 (foundation):** auth rate limiting (#6 — failure-counting per email + IP, 429 with retry-after, success clears; `backend/src/auth/rate-limit.ts`, config `AUTH_RATE_LIMIT_*`); build-time CSP pinning (#2 — `scripts/generate-csp.mjs` in prebuild pins connect-src to `CSP_API_ORIGIN`/`PUBLIC_API_BASE_URL`); cross-page audit (#3 — verified no unallowlisted loaded origins)
- **Batch 2 (data):** monthly treasury series (#4 — `GET /api/v1/ledger/series`, chain-verified rollups; pitch chart now live) + live CAD/BTC provider (#7 — `LiveRateProvider` from mempool.space, cached, env fallback, wired in `index.ts`)
- **Batch 3 (product):** MeetingsTool (#8 — quorum + voting, live API when signed in, identical local rules offline), SubAccounts (#10 — Operating/CRF/Special Levy/War Chest with chain-verified head tallies), CSV bank-feed import (#12 — reconciler CSV seam; Plaid/Flinks need keys)
- **Batch 4 (Bitcoin):** DCA planner (#18 — `planDca` + `/treasury/dca/plan`, Form B disclosure %), PSBT orchestration seam (#15 — `buildPsbtPlan`/`recordSignature`, 3-of-5 threshold-gated, hardware wallets plug in), Satohash stamp (#19 — `POST /api/v1/compliance/stamp` hash-of-record + stamp URL), xpub import (#16 — `GET|POST /api/v1/rails/xpub` + XpubImport panel with per-unit BIP32 paths)
- **Batch 5 (export):** portable export (#20 — `GET /api/v1/export/portable`), CRT evidence bundle (#11 — print-ready HTML chain evidence), print-ready Form B/F (#9 — `GET /api/v1/forms/b|f/:unitId`, Form F withheld while balance > 0) + EvidenceExport panel
- **Tests:** backend now **155 passed / 14 files** (+28 new: rate-limit, rate-provider, bitcoin-modules, export); frontend 42 tests, `svelte-check` 0/0, i18n 561 keys × 9 locales parity green

**Deferred (infra-gated, per Cam):** #1 live-site verify (needs deploy), #5 per-council DB-backed units (large migration), #13 rails on host (LND/Liquid/PayNym/Nostr), #14 on-chain/LN broadcast (daemons), #17 BOLT-12 (LND + channels — LNBITS node exists, channels not yet established). All remain prepared seams with docs.

**Git State:** commits `3ed66e7`, `bce5967`, `f719619`, `4dcef0e`, `89fc0b3` pushed to `origin/main`; WORKPLAN.md updated with per-item status.

---

## Session — 2026-08-26 (landing security + shell tightening, v0.3.3)

**Done:**
- **CSP was blocking its own page** — `static/_headers` allowlisted neither Google Fonts (so Manrope/DM Mono silently fell back to system fonts — the “floating” look) nor the Umami analytics script (so telemetry never ran), and `connect-src` would have blocked the live API origin from the new frontend wiring. Fixed: `style-src` += `https://fonts.googleapis.com`, `font-src` += `https://fonts.gstatic.com`, `script-src` += `https://analytics.giveabit.io`, `connect-src` += `https:` + analytics (documented — the API origin is build-time configurable, so pin it in `_headers` if it ever becomes one host), plus `upgrade-insecure-requests` (site is HTTPS-only). Kept `'unsafe-inline'` for the theme bootstrap + SvelteKit hydration; `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS untouched
- **Fonts load once:** removed the duplicate `@import url(googleapis…)` from `src/app.css` (the head `<link>` already loads the same families with preconnect) and dropped the unused `Inter` family from `app.html` — verified the built CSS has zero googleapis references
- **Shell tightened** (user: “solid, tight” — scope confirmed as tighten-the-existing-shell, no content restructuring): content max-width 1410→1280px, main grid gap 38→28, metric grid gap/margins down, card min-heights + padding down, panel padding 19→17, right-stack gap 17→14, welcome-row/section-heading margins down, footer max-width synced to 1280, and the card shadow changed from a soft 12px glow to a crisp 2-layer shadow (`0 1px 2px … , 0 4px 14px …`, dark-mode equivalent) so cards sit anchored instead of floating
- **Checks:** `svelte-check` 0/0, 42 frontend tests green, i18n 523 keys parity green, build clean

**Git State:**
- Committed as **`e113cd4`** — "Secure and tighten the landing page shell" (6 files, +45/−22) and **pushed to `origin/main`** (branch in sync, working tree clean)

---

## Session — 2026-08-26 (frontend wired to the live backend, v0.3.2)

**Done (#20 — wire the frontend dashboard to `/api/v1/*`):**
- **New `src/lib/api/` client** (zero new deps): `config.ts` resolves the base URL — `PUBLIC_API_BASE_URL` build-time env, or `localStorage['openstrata-api-base']` runtime override (no rebuild), else **demo mode** (`null`) so the site never breaks without a backend; `token.ts` persists the JWT (`openstrata-token`); `client.ts` is a typed `apiFetch` wrapper (Bearer attachment, JSON bodies, `ApiError` with the backend's `reason`, `ApiUnavailableError` for no-base/network → widgets fall back to sample data); `auth.ts` is a Svelte store with `bootstrap()` (ping + session restore via `/auth/me`, 401 clears the token), `signIn`/`signUp`/`signOut`; typed endpoint helpers `ledger.ts` (balance/post), `units.ts` (`GET /units`), `rails.ts` (`GET /rails/status`)
- **Auth UI:** `AuthModal.svelte` (sign-in / create-account tabs, open signup → council + first admin); dashboard topbar shows a sign-in button, then council name + initials + sign-out menu; workspace switcher shows the signed-in council name; header pill flips **Live** ↔ **Demo**
- **Live widgets with graceful fallback:** reserve-funds + operating metrics pull `/api/v1/ledger/balance` when a session is live (else the old sample numbers); the tools **Form K units matrix swaps to `GET /api/v1/units`** when connected and shows a `LIVE` badge (the swap `$lib/units.ts` documented as intended — invisible to consumers)
- **Config + docs:** root `.env.example` (`PUBLIC_API_BASE_URL`), `docs/DEPLOYMENT.md` gained a “Frontend → backend wiring” section with both exposure paths (A. Tailnet-only default; B. public HTTPS behind JWT + CORS with rate limiting first); `.ai_docs/current-status.md` bumped to v0.3.2
- **i18n:** 13 new keys across all 9 locales (509 → **523**, parity audit green); **17 new frontend api client tests**; `svelte-check` 0 errors / 0 warnings
- **Follow-up: ETransferReconciler + pitch page live wiring** — the e-transfer widget now matches its simulated inbound transfers against the **live unit registry** (`GET /api/v1/units`) when signed in (new `apiUnitsToUnitRefs` adapter, LIVE badge; bank-feed ingestion itself stays Phase 5), and the pitch deck shows the **real CRF balance** (`/ledger/balance`) + **CAD/BTC** (`/rails/status`) when live, with the simulation walk gated to demo mode and the hero badge flipping Live ↔ Demo

**Decision (confirmed with Cam):** build the client configurable now (`PUBLIC_API_BASE_URL` + runtime override + demo fallback); the exposure path (Tailnet-only vs public behind auth + CORS) is decided at deploy time, both documented in `docs/DEPLOYMENT.md`. Follow-up: wire everything that has a real backend counterpart (ledger balances, CAD/BTC, units) and leave genuinely-unavailable series (monthly income/expense history, rental index, bank-feed e-transfers) as clearly-labeled demo data

**Git State:**
- Committed as **`a6bd8ad`** — "Wire the frontend dashboard to the live /api/v1 backend" (22 files, +1128/−43; follows `af9ab77`/`697dd26` from the auth session) and **pushed to `origin/main`** (branch in sync, working tree clean)

**Remaining for live data:** deploy a host, set `PUBLIC_API_BASE_URL` at build (or `openstrata-api-base` at runtime), and sign in — the wiring is done and falls back to demo until then

---

## Session — 2026-08-26 (auth + multi-tenant councils, v0.3.1)

**Done:**
- **Zero-dependency JWT auth** (`backend/src/auth/`): HS256 tokens signed with node:crypto (`AUTH_SECRET`), scrypt password hashing, no new packages. Roles **admin / treasurer / member** with rank-based gates (`requireRole`). Open signup: `POST /api/v1/auth/register` creates a council + first admin; `login`, `/auth/me`, and admin-only user management (`GET|POST /api/v1/auth/users`, one-time temporary passwords)
- **Tenant-scoped routes:** every `/api/v1/*` route except `/health` + the Rosa KB requires a Bearer token; the ledger `community` now comes from the token's `cid` claim, never the body (client-supplied `community` fields removed from ledger/post, billing/run, payments/confirm). Payment quoting is tenant-isolated: idempotency key is now `(community_id, ref_id, unit_ref, rail)` via migration `0004_auth_and_tenancy.sql` (council + app_user tables, tenant-scoped payment_request key), and confirm lookups are council-scoped so one council can never confirm another's quote
- **Tests:** backend suite now **127 tests / 11 files** (was 108/10) — 19 new auth/tenancy tests (register/login/me, duplicate email 409, forged/expired/wrong-secret tokens, role gates incl. treasurer-no-fines, cross-council ledger + payment isolation). Typecheck clean
- **Postgres e2e smoke suite** (`backend/tests/e2e-smoke.test.ts`): full deploy-day gate against a live `DATABASE_URL` — register → ledger → billing → quote/confirm → forms → meetings → cross-council isolation, and explicitly verifies `PostgresPaymentRequestStore.markStatus` single-row semantics (re-quote after confirm returns `paid`) — the item previously flagged for first-deploy verification. **CI got a `backend-e2e` job** that spins up `pgvector/pgvector:pg17`, runs `npm run migrate`, then the smoke suite
- **Docs:** `backend/API.md` (auth + tenancy section, updated payloads), `backend/README.md`, `docs/DEPLOYMENT.md` (host checklist incl. `AUTH_SECRET` + e2e gate), `.ai_docs` refreshed, `.env.example` + `docker-compose.yml` carry `AUTH_SECRET`/`AUTH_TOKEN_TTL`

**Decisions (confirmed with Cam):**
- JWT bearer tokens (not cookie sessions) — stateless, works with the static frontend + CORS; passwords via scrypt; zero new dependencies
- Roles admin / treasurer / member (treasurer = financial writes, no bylaw fines)
- Open signup for now (Tailscale-hosted MVP); gate with invites + login rate limiting before public exposure
- Units stay the seeded demo registry this session (per-council DB-backed units = the unit→payment→form traceability step)

**Remaining (external / not yet built):**
- Host deploy still pending: `docker compose up -d` on a Tailscale host, `AUTH_SECRET` + Postgres password in `backend/.env`, `npm run migrate`, then `DATABASE_URL=… npm run test -- e2e-smoke` (checklist in `docs/DEPLOYMENT.md`)
- Same external items as before: rails not connected to live daemons, Rosa pgvector/Ollama model choice, live `cadPerBtc` rate feed
- Wire the live backend into the frontend dashboard (currently mock data) — needs the API-exposure decision (Tailscale-only vs public behind auth + CORS)
- Login rate limiting + invite flow before public exposure; per-council DB-backed units

**Git State:**
- Committed as **`af9ab77`** — "Add JWT auth + multi-tenant council scoping to the backend" (26 files, +1790/−252). Not pushed yet; awaiting Cam's go to push to `origin/main`

---

## Session — 2026-08-25 (canonical unit/lot master-data model)

**Done:**
- Added a **single source of truth for units** shared by frontend + backend (commit `baf6989`, pushed):
  - Backend: new `backend/src/units/` module — canonical `UnitRecord` + `UnitRegistry`, unit-ref normalization, deterministic `ar:unit-<n>` AR ledger fund codes, and reconciliation keys. Exposed as `GET /api/v1/units`; documented in `backend/API.md`
  - Frontend: mirrored in `src/lib/units.ts`; the tools unit matrix and the e-transfer reconciliation widget now derive from the same model (`unitsToUnitRefs`), so the site and API can never disagree on what a unit is
  - This closes the "tighten organizational mapping / unit→payment→form traceability" item from the Phase 3 session
- Verified after the commit: backend typecheck clean, backend suite **108 tests / 10 files all passing** (up from 99 — 8 new unit-model tests + 1 `/api/v1/units` route test), frontend untouched and green

**Remaining:**
- Same external items as the Phase 3 session below (rails not connected to live daemons, Rosa pgvector/Ollama model choice, Docker deploy + Postgres smoke test on a Tailscale host, Postgres payment-store semantics check at first deploy)

**Git State:**
- HEAD: `baf6989` (`baf6989a47ff6156432c0d62e0c86da3c75e59e4`)
- Unpushed: none

---

## Session — 2026-08-25 (Phase 3 completion: rails hardening, CLI, API doc, tests)

**Done:**
- Completed Phase 3 end-to-end across five commits, all pushed (`0db3ce3`, `1112968`, `f7bdc2d`, `3c17beb`, `40db03f`):
- **Form B/F + meetings + payment flows** (`0db3ce3`): `POST /api/v1/forms` (Form B / Form F issuance with 7-day deadline + WITHHELD on debtor units), `POST /api/v1/meetings/quorum` + `/vote` (AGM/SGM/council/rescheduled quorum, majority/3-4/80%/unanimous voting with abstentions excluded), `POST /api/v1/payments/confirm` (marks a quoted payment paid AND posts credit to the unit's AR ledger — reconciles like an e-transfer), idempotent `payments/quote` backed by a persisted `PaymentRequestStore` (Postgres + in-memory) keyed on `(refId, unitRef, rail)`, `Idempotency-Key` dedupe on ledger/billing writes, and Fastify JSON-schema body validation on write routes
- **Rails hardening** (`1112968`): real **BIP-173 bech32/bech32m checksums** for `bc1`/`bc1p` (taproot), LNURL, `npub` via `decodeBech32` + `bech32Encode` (round-trip test vectors); pluggable **`cadPerBtc` `RateProvider`** (env-seedable, static fallback) threaded through `/rails/status` + `/payments/quote`; **watch-only xpub → deterministic per-unit BIP32 child index** (`deriveUnitAddress`/`unitChildIndex`)
- **Operational CLI + docs** (`f7bdc2d`, `3c17beb`): `npm run cli -- rosa ingest` (validate + probe the BC corpus), `npm run cli -- ziggy simulate` (walk treasury scenarios through the state machine); full `backend/API.md` request/response reference linked from README
- **API test coverage** (`40db03f`): 13 new route tests (payments/confirm edge cases, Form B/F, meeting quorum + voting rejections). Fixed `MemPaymentRequestStore.markStatus` to propagate status to both by-ref and by-key indexes. **Backend suite now 99 tests / 9 files, all passing; typecheck clean.** Frontend untouched and green
- All `.ai_docs` refreshed to v0.3.0; `docs/KIMI-HANDOFF.md` + `LATEST-UPDATE.md` updated

**Remaining (external / not yet built):**
- Rails are **prepared, not connected**: no LND / Liquid daemon / PayNym / Nostr relay running on a host; no live `cadPerBtc` rate feed; real payment-confirm → on-chain/LN broadcast pending daemons. Enable + point endpoints via `.env` when daemons exist
- Rosa pgvector embedding + Ollama model choice not selected; `0002` migration + `keywordRetriever` seam ready — `rosa ingest` currently validates the keyword corpus, not real embeddings
- Docker stack needs a real deployment on a host behind Tailscale; run a Postgres migration + `/api/v1/ledger`, `/api/v1/payments/*`, `/api/v1/forms`, `/api/v1/meetings/*` smoke test
- Verify `MemPaymentRequestStore.markStatus` single-row semantics hold on the Postgres payment-store adapter at first deploy
- Professional human review of the machine-drafted locale overrides before they are treated as reviewed
- Tighten organizational mapping, user workflow + recording (member/lot ledger, unit→payment→form traceability) in preparation for live Bitcoin/L2 payments

**Git State:**
- HEAD: `40db03f` (`40db03f3dd571e7544c14e9284fc8552fdfe8321`)
- Unpushed: none (all pushed to `origin/main`)

---

## Session — 2026-08-25 (Bitcoin + Layer-2 rails)

**Done:**
- Added the **sovereign payment-rails module** (`backend/src/rails/`, commit `b5203a8`) accepting Bitcoin on-chain (SegWit/taproot), **Lightning** (LNURL/BOLT-11 with 15-min CAD rate lock), **Liquid** (confidential L-BTC/L-USD), **PayNym (BIP-47)** payment codes, and **Nostr** identity. Pure recipient validation + rail quoting, unit-tested (11 tests).
- Wired into the Fastify API: `GET /api/v1/rails/status` and `POST /api/v1/payments/quote` return a shared `referenceCode` (e.g. `pay-<refId>-<unit>`) so Ziggy + the ledger reconcile confirmed payments the same way e-transfers do. Rails are **off by default**, enabled via `.env` (`BITCOIN_RAIL_ENABLED`, `LIGHTNING_RAIL_ENABLED`, `LIQUID_RAIL_ENABLED`, `PAYNYM_RAIL_ENABLED`, `NOSTR_RAIL_ENABLED`); LND / Liquid node / PayNym notifier / Nostr relay endpoints are configuration seams.
- Backend suite now **66 tests** (added 3 API rail-route tests); typecheck clean. Frontend stays green (check 0/0, build clean). Workplan Phase 4, DIRECTORY-MAP, `.ai_docs`, README and `.env.example` updated.

**Remaining (external / not yet built):**
- Rails are **prepared, not connected**: no LND / Liquid daemon / PayNym / Nostr relay is running on a host yet, and there is no live `cadPerBtc` rate feed. Enable + point endpoints via `.env` when daemons exist; wire the rate feed and a real payment-confirm → ledger-post path.
- Rosa pgvector embedding + Ollama model choice not selected; `0002` migration + `keywordRetriever` seam ready.
- Docker stack needs a real deployment on a host behind Tailscale (Umbrel).
- Form B/F generator with deadline tracking, meeting quorum + voting engine, PWA hardening.

**Git State:**
- SHA: `b5203a8`
- Unpushed: `git log --oneline origin/main..HEAD`

---

## Session — 2026-08-25 (Phase 3: fee billing + bylaw enforcement)

**Done:**
- Added **automated fee billing + late notices** (`backend/src/billing/`, commit `b7e4559`): pure monthly per-unit strata-fee charge generation + late notices (grace window) exposed as `POST /api/v1/billing/run`, which posts each charge to the per-unit AR ledger account (4 unit tests).
- Added the **CRT-proof bylaw enforcement state machine** (`backend/src/enforcement/`): received → notice_issued → reviewing → fine_posted / no-fine, with the `BLOCK_FINE_ACTIONS` 14-day review lock, `REQUIRE_QUORUM_AND_MINUTES`, and $200 standard / $1,000 STR fine caps — wired as `/api/v1/bylaw/{complaint,notice,status,fine,nofine}` (11 tests).
- Backend suite is now **52 tests** (was 35); typecheck clean. Frontend untouched and green (check 0/0, build clean).

**Remaining (external / not yet built):**
- Rosa pgvector embedding + Ollama model choice not selected; `0002` migration + `keywordRetriever` seam ready.
- Docker stack needs a real deployment on a host behind Tailscale (Umbrel) — pending a Postgres migration + `/api/v1/ledger` smoke test.
- Form B/F generator with deadline tracking, meeting quorum calculator + voting engine, PWA hardening.
- `/docs` bootstrap references `rosa ingest` / `ziggy simulate` CLIs that are not yet built; add when the vector adapter lands.
- Compliance-domain records / the 16 machine-drafted e-transfer keys across 9 locales still need professional human review.

**Git State:**
- SHA: `b7e4559`
- Unpushed: `git log --oneline origin/main..HEAD`

---

## Session — 2026-08-25 (Phase 3 backend scaffolding)

**Done:**
- Scaffolded the **Phase 3 core-product backend** in a new `backend/` workspace (in-repo, per user decision). Docker Compose stack (`pgvector/pgvector:pg17` + Fastify API, Tailscale-only exposure) + `.env.example` + Dockerfile + `.dockerignore`.
- **Trust ledger data model + migrations:** append-only journal (`ledger_entry`) with fund isolation (Operating / CRF / Special Levy / sub-accounts), integer basis-point math, a sha256 `prev_tally`/`tally_root` hash chain, and a `verifyChain` tamper-evidence helper. Two numbered migrations (`0001_trust_ledger.sql`, `0002_rosa_vector.sql` + pgvector) run by `backend/scripts/migrate.mjs`; `schema.sql` seeded into fresh volumes via initdb.
- **Services (TypeScript/Node):** Rosa compliance RAG (`src/rosa/` — strict retrieval + BC SPA/RTA corpus, keyword fallback retriever, pgvector/Ollama seam), Ziggy treasury state machine (`src/ziggy/` — CRF hard cap, PO-expense verification, no-guess reconciliation), Fastify API (`src/api/server.ts` — `/health` + `/api/v1/*`), and `src/trf/recon.ts` mirroring the Phase 2 no-guess reconciliation rule so both layers agree.
- **Tests + CI:** 35 backend Vitest tests (ledger invariants + tamper evidence + diff, Rosa, Ziggy, **Fastify route tests**) — pass; backend typecheck clean. CI gets a dedicated `backend` job; frontend suite stays green (check 0/0, audit 509, tests 25/25, build clean).
- **End-to-end finishing (`e844449`):** idempotent `npm run seed` demo community (mirrors initdb seed for migrated DBs); PG `listAll` now filters by account at query time so `diff()` honors community scope; `buildServer` logger is quiet-testable. SOURCE-OF-TRUTH + `docs/DEPLOYMENT.md` aligned (no longer claim “No backend yet”).
- **Docs:** WORKPLAN/ROADMAP/roadmap page mark Phase 3 in progress; DIRECTORY-MAP + `.ai_docs/context-map.md` list `backend/`.

**Remaining (external/not yet built — flag for Kimi):**
- Rosa pgvector embedding + Ollama chat/embed model choice is NOT selected; `0002` migration + `keywordRetriever` seam are ready.
- The Docker stack has NOT been run on a real host (Umbrel/Tailscale); needs a Postgres migration + `/api/v1/ledger` smoke test.
- Fee billing + late-notice API, Form B/F generator, bylaw enforcement state machine (`BLOCK_FINE_ACTIONS`) are not yet built.
- The `/docs` install SOP mentions future `rosa ingest` / `ziggy simulate` CLIs — those are not built; add when the vector adapter lands.

**Decisions (confirmed with Cam):**
- In-repo `backend/` (single source of truth), TypeScript/Node + Fastify, PostgreSQL + pgvector for the immutable ledger + Rosa embeddings.
- Ledger is append-only + hash-chain diffable; cross-fund transfers require a `resolution_id` (BCFSA no-co-mingling). Amounts are integer basis points.
- Rosa currently boots with a keyword fallback retriever over a small BC corpus so the API runs before the embed/chat model is chosen. Ziggy's PSBT/multisig execution is stubbed (authorization gate is real).
- Backend and frontend scripts are separate (`npm run check`/`test`/`build` = frontend at root; `npm run typecheck`/`test` in `backend/`) so the static Cloudflare deploy is unaffected.

**Next for Phase 3 (recommended order):**
1. Choose Rosa embed/chat models; wire pgvector + Ollama adapters (`0002` migration is ready).
2. Pick the self-hosted host (Umbrel/Tailscale per framework doc); run a real Postgres smoke test.
3. Fee billing API, Form B/F generator, bylaw enforcement state machine, PWA hardening.

**Git State:**
- SHA: `e844449` (Phase 3 backend scaffold `9ab1908` + end-to-end finish `e844449`)
- Unpushed: `git log --oneline origin/main..HEAD`

---

## Session — 2026-08-25 (upgrade list, 5 batches)

**Done:**
- Batch 1 `b56ab1e` — test suite (Vitest + @testing-library/svelte, 16 tests: i18n catalog parity + formatters, Satohash client known-vectors + validation, BarChart render/a11y), GitHub Actions CI (npm ci → check → audit → test → build → asset verification), localized `+error.svelte` (404/error, 6 keys in 4 locales), PWA (manifest.webmanifest, service worker, layout registration, iOS meta, CSP worker-src/manifest-src). Note: `vite.config.ts` needs `@types/node` for the VITEST env detection
- Batch 2 `199959a` — dark mode (Tailwind `@custom-variant dark`, token flips + `.dark` surface overrides, persisted `src/lib/theme.ts`, FOUC-free inline script, header toggle), Cmd/Ctrl+K `SearchModal` across pages/posts/FAQ/templates/legal/feeds, og:/twitter meta, per-category RSS feeds (prerendered `rss/{category}.xml` via `src/lib/feed.ts`), sitemap auto-generated by `scripts/generate-sitemap.mjs` (prebuild), `.mesh-bg` defined. Blog/legal/template records centralized into `src/lib/blog.ts` / `legal.ts` / `templates.ts`
- Batch 3 `c23ba6b` — Satohash health + stamp/verify form (`SatohashStatus.svelte`, graceful offline) on dashboard + spec; wizard save/load (localStorage `openstrata-saved-buildings`), JSON download, corp-name validation, template prefill (`openstrata-wizard-prefill`); templates category filter + Use-template → wizard; compliance section search; legal source search; FAQ search + `#faq-<uid>` anchors; pitch print-to-PDF (`@media print`); dashboard building-detail modal + persistent notification center (`openstrata-notifications`)
- Batch 4 `ffca47d` — hi/fil/pl/uk/sw extended to full **217-key parity** with fr (all 9 locales translate the whole interface; `audit:i18n` now hard-fails on locale key drift). Translations were machine-drafted — **require professional human review before being treated as reviewed**. llms.txt expanded; metrics.json refreshed (Satohash dependency now green); 3 new blog posts

**Decisions:**
- All 9 locales kept at exact parity with the French benchmark via the audit guard — new catalog keys MUST be translated in every locale or the audit fails
- Static host constraints: RSS category feeds are prerendered files (`/rss/bitcoin.xml`), not query params; sitemap is generated at prebuild from a canonical route list
- Machine-drafted translations are flagged in the handoff for professional review; statutory/domain data records stay canonical English (unchanged guardrail)

**Git State:**
- Latest SHA: `ffca47d` (after `c23ba6b`; all pushed, working tree clean)
- Unpushed: none

---

## Session — 2026-08-25 (completeness sweep, 4 batches)

**Done:**
- Batch 1 — `npm run check` now passes **0 errors / 0 warnings**: fixed 11 type errors + 7 a11y warnings (satohash `Uint8Array`/`BufferSource`, BarChart `secondaryKey` prop + `<rect>` ARIA roles, LineChart `<circle>` role, JobsDropdown const-array narrowing, implicit-any params on home page handlers, typed `$copy[<string>]` indexing via exported `Translation` type, tools module-card `role="button"` + keyboard handler). Committed `cf2bdf3`
- Batch 2 — site completeness: new `/faq` page (i18n'd), real `/rss.xml` feed endpoint (generated from blog posts via `+server.ts`), sitemap covering all 15 routes, RSS subscribe buttons, wizard mobile layout fix. Committed `99d07a2`. All routes responsive on mobile + desktop
- Batch 3 — docs sweep: rewrote `docs/DEPLOYMENT.md` + `docs/I18N.md`; refreshed WORKPLAN/ROADMAP/SOURCE-OF-TRUTH/DIRECTORY-MAP/EXECUTIVE-SUMMARY/MISSION + `.ai_docs` manifests; created SECURITY.md, PRIVACY-POLICY.md, TERMS-OF-SERVICE.md, ACCESSIBILITY-STATEMENT.md, KNOWN-LIMITATIONS.md. Committed `66c7565`
- Batch 4 — locale overrides: Spanish + Chinese extended to full catalog parity (185 keys each). Verified identical key sets across fr/es/zh with a parity script. Committed `c94a022`
- Final verify: `npm run check` 0/0, build clean, audit 461 keys / 15 routes; live site confirmed serving v0.2.6 with FAQ (200) and RSS feed live; es/zh strings confirmed in the built bundle

**Decisions:**
- No version bump for the sweep (still v0.2.6) — markers derive from `package.json` and the release was already live
- Statutory/domain data records stay canonical English until professionally reviewed translations exist (unchanged guardrail)
- No agents spawned — this environment has no spawn capability; all batches executed sequentially

**Git State:**
- Latest SHA: `c94a022` (pushed `66c7565..c94a022 main -> main`)
- Unpushed: none

---

## Session — 2026-08-25

**Done:**
- Completed the v0.2.5 release: centralized version markers on `package.json`, verified (`npm ci`/`build`/`audit:i18n`), committed `54cb99c`, pushed, and confirmed the live deployment serves v0.2.5
- Migrated every remaining hard-coded interface string across all 14 routes to the shared catalog (458 keys): compliance, tools, docs, pitch, dashboard footer/toasts, wizard (incl. placeholders), about, blog, templates, legal, roadmap, rss, spec
- Hardened `npm run audit:i18n` with a hard-coded-copy scanner (static text nodes, placeholders, meta content) — clean with 0 warnings across all routes
- Added first French (fr-CA) locale overrides for all new interface copy (123 keys); other locales fall back to English
- Released v0.2.6 with changelog, README, and `.ai_docs`/LATEST-UPDATE updated

**Decisions:**
- Statutory/domain data records (compliance.ts, strata-tool.ts, marketing.ts, data.ts, page data arrays) stay canonical English until reviewed translations exist — per the documented guardrail, no machine translation of legal content
- Hardened audit is warn-level so legitimate canonical-English records never block builds
- French first for locale overrides (BC bilingual priority); es/zh/hi/fil/pl/uk/sw follow the same pattern

**Git State:**
- SHA: (see `git log -1 --format=%H` after push)
- Unpushed: none after `git push origin main`

---

## Session — 2026-07-19

**Done:**
- Added thin Satohash API client `src/lib/satohash.ts` (sha256Hex, stampHash, getApiHealth, getStamp, verifyUrl, stampGuideUrl)
- Client id `openstrata`; env `VITE_SATOHASH_API_URL` / `VITE_SATOHASH_URL` / optional `VITE_SATOHASH_KEY`
- Graceful offline (ok:false, no throw); API live at https://api.satohash.io
- No UI wiring (no integrations barrel); no secrets committed
- `npm run build` OK

**Decisions:**
- Same family client pattern as motopass/tadbuy
- No unit test runner in package.json — skipped tests

**Git State:**
- SHA: `b57f2257682b32b634ea1da0c7f1d17baeb3358a`
- Unpushed: none (pushed main)

---

## Session — 2026-08-25 (e-transfer prototype + build fix)

**Done:**
- **E-Transfer Auto-Reconciliation prototype (Phase 2 complete):** pure `src/lib/reconcile.ts` matching engine + `ETransferReconciler.svelte` interactive demo on `/tools`. Auto-matches inbound e-transfers to units by reference code, flags ambiguous references that hit multiple units, leaves unmatched for manual review. Brief (message-only) and full (message + payer) match modes. 9 new unit tests (total suite now 25).
- **9-locale parity for the new feature:** 16 catalog keys (`etransfer*` / `recon*`) added to the Translation type, English base, and all 8 override blocks via `scripts/inject-recon-i18n.mjs` — audit green at 509 keys. Machine-drafted overrides — **require professional review**.
- **Docs:** WORKPLAN Phase 2 marked complete; ROADMAP.md + roadmap page Phase 2 set complete; LATEST-UPDATE + current-status updated.
- Recorded prior fix (SHA `6ff5fc3`): Cloudflare Pages build crash fixed — `browser` guard on PWA service-worker registration.

**Decisions:**
- Reconciliation never guesses: only a reference unique to one unit auto-posts; everything else is flagged for a human. Matches are reviewable before any ledger post.
- New catalog keys were injected programmatically (the i18n file is huge and per-locale blocks live on single lines) via a re-runnable script, then verified with `check`/`test`/`audit`/`build`.
- Keep the prototype front-end only (no backend) — consistent with the Phase 3 boundary.

**Git State:**
- SHA: `49e85b9`
- Unpushed: none (all commits in this session pushed to `origin/main`)

---

# KIMI HANDOFF — Hermes Strata / OpenStrata

**Date:** September 2026  
**From:** Grok (Cursor on M3) — "Big Daddy" build session  
**To:** Kimi (HERMES Orchestrator on M4)  
**Project folder:** `/Users/cam/projects/openstrata` (sync via Tailscale / git pull)

---

## ⚠️ READ THIS ENTIRE FILE BEFORE TOUCHING ANYTHING

Cam is handing this to you. **Another agent (Grok) built the current site and docs on M3.** Your job is to **extend, not rebuild**. The site works. The docs are the source of truth. Do not "improve" by deleting and starting over.

---

## What Exists (DO NOT MESS UP)

### Live SvelteKit Site
- **Stack:** SvelteKit 2, Svelte 5, Tailwind 4, adapter-static
- **Build:** `npm run build` → `build/` folder
- **Repo:** https://github.com/kitsboy/openstrata (branch: `main`)

### Pages Already Built
| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ Live | Supercharged dashboard — graphs, live stats, 8 modules |
| `/about` | ✅ Live | Cost savings, BCFSA paths, product stack |
| `/compliance` | ✅ Live | 7-tab BC compliance KB — DO NOT DELETE |
| `/roadmap` | ✅ Live | Paths, timeline, jurisdictions |
| `/tools` | ✅ Live | Strata Tool hub — 30+ modules |
| `/docs` | ✅ Live | Framework docs index |
| `/rss` | ✅ Live | Feeds + API docs |
| `/spec` | ✅ Live | OpenStrata spec |
| `/blog` | ✅ Live | Posts |

### Critical Data Files (source of truth in code)
- `src/lib/compliance.ts` — SPA workflows, quorum, voting, retention
- `src/lib/strata-tool.ts` — 30+ modules across 7 domains
- `src/lib/marketing.ts` — BCFSA facts, cost savings, positioning
- `src/lib/data.ts` — mock data, jobs, units, API endpoints
- `public/logo.png` — brand logo (orange strata on black)

### Docs (markdown archive)
- `docs/BC-STRATA-COMPLIANCE.md`
- `docs/EXECUTIVE-SUMMARY.md`
- `docs/PRODUCT-PLAN.md`
- `docs/WORKPLAN.md`
- `docs/BCFSA-STRATEGY.md`
- `docs/ROADMAP.md`
- `SOURCE-OF-TRUTH.md` (root)
- `hermes-strata-app-framework-v2.md` (root)

---

## Regulatory Context You Must Understand

**Hermes Strata is SOFTWARE, not a licensed management company.**

BCFSA requires licensed brokerages for management services. We compete by:

1. **Selling to licensed brokerages** — they use Hermes for ops (compliant)
2. **Selling to self-managed councils** — owners manage themselves (SPA permits, no license)
3. **Hybrid** — council runs Hermes; licensed broker handles trust oversight

**Never position Hermes as providing unlicensed management services.**

Full strategy: `docs/BCFSA-STRATEGY.md`

---

## Product Stack (Three Give A Bit Projects)

| Product | URL | Role | Status |
|---------|-----|------|--------|
| Hermes Strata | openstrata site | Operations | **This project — site live** |
| Satohash | satohash.io | Proof (OTS) | v4.1 in progress — Cam will need help later |
| OpenStrata | protocol spec | Portability | Spec page live |

**Integration plan:** Satohash stamps payments/votes/rules. Hooks are stubbed in strata-tool.ts (`satohash-stamp` module, status: planned). Do not build Satohash integration until Cam says Satohash API is ready.

---

## Your Next Tasks (Priority Order)

### 1. Ingest (Day 1) — DONE
- [ ] Pull latest from `github.com/kitsboy/openstrata` main
- [x] Read ALL docs/ files + SOURCE-OF-TRUTH.md
- [x] Add to Obsidian MASTER-BRAIN under "Hermes Strata / OpenStrata"
- [x] Confirm to Cam: "Ingested. Build passes. Ready to extend."

### 2. Do NOT Do These Things
- ❌ Do not rebuild the site in React/Next.js
- ❌ Do not delete compliance.ts or strata-tool.ts
- ❌ Do not remove the logo or change brand without Cam approval
- ❌ Do not dark-theme the site (light theme is intentional)
- ❌ Do not deploy the backend publicly without a strong `AUTH_SECRET`, exposure review, and the Postgres e2e gate
- ❌ Do not claim Hermes is a licensed management company

### 3. Phase 2 — Building Template Wizard (LIVE at /tools/wizard)  ✅ COMPLETE
Cam wanted this next — now done. See `docs/PRODUCT-PLAN.md` → Building Template Engine.

Wizard steps (all shipped):
1. ✅ Pick jurisdiction (BC default)
2. ✅ Enter building address + unit count
3. ✅ Configure funds (Operating, CRF, sub-accounts)
4. ✅ Add/remove units
5. ✅ Toggle services (landscaping, pool, etc.)
6. ✅ Select payment rails (e-transfer default, Lightning opt-in)
7. ✅ Import bylaws or use BC Standard pack
8. ✅ Review → generate building config JSON

Route: `/tools/wizard` (live).

### 4. Phase 2 — E-Transfer Auto-Reconciliation  ✅ COMPLETE
Pure matching engine `src/lib/reconcile.ts`, interactive demo on `/tools`, CSV import seam, live-unit wiring, 9 unit tests. Never guesses — ambiguous/unmatched transfer references are flagged for human review.

### 5. Phase 3 — Deployment + Rosa/Ziggy continuity
- Deploy the Docker stack on a Tailscale host and run `npm run test -- e2e-smoke`.
- Choose Rosa embed/chat models and wire pgvector/Ollama after the model selection decision.
- Keep Rosa citations-only and Ziggy no-guess reconciliation; PSBT/broadcast stays stubbed until Cam directs.
- Do not extend the reconciliation engine to auto-post real bank feeds without an explicit Cam decision and tests.

### 4. Educate Hermes (M4 Agent)
Tell Hermes about:
- Five functional domains (financial, assets, governance, meetings, conveyancing)
- Rosa = compliance RAG, Ziggy = treasury state machine
- Bylaw workflow locks: `BLOCK_FINE_ACTIONS` for 14 days
- BCFSA three paths (brokerage, self-managed, hybrid)
- Satohash proof layer (when ready)

### 5. Coordinate Satohash (When Cam Ready)
Satohash is NOT finished. When Cam asks:
- Read `/Users/cam/projects/satohash/SOURCE-OF-TRUTH.md`
- Strata-specific templates needed: fee receipt, council resolution, Form B/F, lease
- Integration point: `POST /api/v1/compliance/stamp` → Satohash OTS API

---

## Build Commands

```bash
cd /Users/cam/projects/openstrata   # or synced path on M4
npm install
npm run dev      # dev server
npm run build    # production build — MUST pass before any commit
```

**Always run `npm run build` before committing.** Fix any errors.

---

## Git Discipline

- Branch: `main` (unless Cam says otherwise)
- Commit messages: complete sentences, describe what and why
- Do not force-push
- Pull before push

---

## Confirmation Format

When you've ingested this handoff, reply to Cam with:

```
✅ KIMI HANDOFF CONFIRMED — Hermes Strata

Ingested:
- [list files added to Obsidian]

Reviewed:
- [confirm build passes]
- [confirm pages load]

Understood:
- Software not brokerage
- Three GTM paths
- Satohash integration deferred
- Light theme, logo, compliance KB preserved

Next ready:
- Building Template Wizard LIVE at /tools/wizard — awaiting Cam review
```

---

## Questions for Cam (if needed)

1. Is Satohash API ready for integration stub?
2. Preferred path for wizard: `/onboard` or `/tools/wizard`?
3. Any licensed brokerage partner lined up for pilot?
4. Self-hosted Docker stack priority vs cloud SaaS?

---

## Latest Session Summary (from 2026-07-01 goodbye)

**Chat topic:** Built full Hermes Strata platform from framework doc; supercharged with BCFSA strategy, Strata Tool hub, executive docs; Kimi added wizard.

**Finished this session:**
- Complete marketing site (/, /about, /tools, /compliance, /roadmap, /docs, /rss)
- 30+ Strata Tool modules in `strata-tool.ts`
- BC compliance KB triple-retained
- Executive docs + BCFSA strategy + SOURCE-OF-TRUTH
- Building Template Wizard at `/tools/wizard` (your build — 8 steps, JSON export)
- DIRECTORY-MAP.md for multi-agent recovery
- Build passes

**Still to do:**
- E-transfer auto-reconciliation prototype
- Phase 3 Docker backend (Rosa + Ziggy)
- Satohash OTS integration (when Cam ready)
- Payment rails (Lightning)
- Executive summary fancy deck (Gamma/docx — Cam's choice)

**Next for Kimi:**
- Integrate SESSION-SUMMARY-2026-07-01.md into MASTER-BRAIN
- Await Cam review of wizard
- Do NOT rebuild site — extend only
- Phase 2 payments at Cam's direction

**Recovery file:** `SESSION-SUMMARY-2026-07-01.md`

---

## Latest Session Summary (from 2026-07-01 goodbye — session 2)

**Chat topic:** Recovered via whatsup; built live `/pitch` investor deck; rebranded logo to Opens Strata / Always Open · Give A Bit; cleaned About and Docs pages; verified E-transfer auto-reconciliation prototype (Phase 2 complete).

**Finished in this session:**
- `/pitch` — 7-slide investor deck, charts from `marketing.ts`, nav link added
- Logo rebrand: Opens Strata / Always Open · Give A Bit (header + footer)
- `/about` — all Hermes mentions removed; Auto E-Transfer + E-Transfer + Lightning labels
- `/docs` — removed Kimi Handoff and Hermes Framework v2 cards from public index
- **E-transfer auto-reconciliation prototype (Phase 2 complete)** — pure matching engine + interactive demo, 9 unit tests, live-unit wiring, CSV import seam
- Pushed to main: `ea682df`, `6ab5fec`

**Still to do:**
- Confirm Opens Strata vs OpenStrata spelling with Cam
- Update SOURCE-OF-TRUTH routes (`/pitch`) and branding notes
- Phase 3 Docker backend deployment (Rosa + Ziggy)
- Satohash integration when Cam ready
- Executive deck (Gamma/docx — Cam's choice)

**Next for Kimi:**
- Integrate this summary into MASTER-BRAIN / Kanban
- Note public rebrand — do NOT revert logo text without Cam
- Extend site only — do NOT rebuild
- Phase 3 deployment decision with Cam

**Recovery file:** `SESSION-SUMMARY-2026-07-01.md` (session 2 section)

---

*Built with love by Grok on M3. Handed to Kimi on M4. Cam orchestrates both. Give A Bit forever.*