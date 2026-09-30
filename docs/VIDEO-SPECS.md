# OpenStrata Intro Video — Kimi Handoff

**Owner:** Kimi on HERMES (M4)
**Requested by:** M3 (Grok) — 2026-09-17
**Version marker:** OpenStrata v0.3.15

## Status: LIVE — wired into the popup (2026-09-18)

**The 60s intro video is rendered, delivered, and now live in the greeter popup.** Cam greenlit the swap, so the frontend integration is done — this handoff is closed.

- **File:** `static/video/openstrata-intro.mp4` (in this repo; posted by Kimi)
- **Public URL:** https://openstrata.giveabit.io/video/openstrata-intro.mp4
- **Rendered:** 2026-09-18, HyperFrames v0.8.48, 1920×1080 (16:9), 57.2s, H.264 + AAC, 5.3 MB
- **Voice:** Kokoro `bf_isabella` (British English, young female — Kimi's usual en-GB voice family) via HyperFrames TTS
- **Visuals:** HyperFrames composition in OpenStrata's own design system (coral #E85E2F / ink #102d3b / Manrope + DM Mono), single-scene arc: hello → what → who → three layers → CTA, narration captions synced word-for-word, beat stepper highlights the active chapter, three-layer pills light up on the "three layers" beat
- **Source:** composition + generator in `/root/ref/openstrata/video/openstrata-intro/` (scratch) and THOR workspace

**Where it is wired (v0.3.15):**
1. `src/lib/components/Tour.svelte` defines `const VIDEO_SRC = '/video/openstrata-intro.mp4'` and renders it as a real `<video>` (controls, `playsinline`, `preload="metadata"`) inside step 1 of the greeter popup — no placeholder swap needed any more.
2. The popup's step 1 is a two-column card: video on the left, "What you get" + "Where to start" on the right. Steps 2–4 stay narrow and video-free.
3. Setting `VIDEO_SRC = ''` reverts to the honest placeholder card, and an `onerror` handler does the same at runtime if the asset ever 404s.

**If the video is ever re-rendered:** keep the same filename and path (`static/video/openstrata-intro.mp4` → `/video/openstrata-intro.mp4`) and the frontend picks it up with no code change. Prefer 16:9 and roughly one minute; the popup frame is sized for that ratio.

## What this is

A 60-second intro video for OpenStrata, to live inside the first-run greeter popup on `https://openstrata.giveabit.io/`.

New visitors get a popup greeting card with:
- a short hello + one-line explanation, and
- a small video section for this intro (30–60s).

The frame is built **and live** (`src/lib/components/Tour.svelte`, video inside the greeting card on step 1 of the tour). Kimi delivered the recording and the asset; M3 wired it in v0.3.15. Nothing is outstanding on this handoff.

## Video specs

| Item | Spec |
|------|------|
| Length | ~60 seconds (30–60s range acceptable) |
| Format | 16:9, web-safe, plays inline in the popup |
| Voice | Kimi — young English woman accent, as usual |
| Visuals | Kimi's own images/video where possible; HyperFrames composition |
| Tool | HyperFrames (YAML/SCRIPT workflow) |
| Tone | Welcoming, confident, plain English, no hard sell |
| Language | English (the popup card copy for the video section is English) |

## Arc (one minute, one scene, one clear pass)

1. **Hello** — friendly opener, who she is (Kimi), what this is (OpenStrata in a minute).
2. **What OpenStrata is** — the operating system for communities that govern themselves; BC strata first, designed for everywhere.
3. **Who it's for** — BCFSA-licensed brokerages, self-managed councils, hybrid councils; software, not unlicensed management.
4. **Three layers** — OpenStrata runs your building; Satohash proves every action happened on Bitcoin; the OpenStrata protocol lets you take your history with you.
5. **One CTA** — come set up a community; the tools and ledger are live on the site.

Keep it tight. One minute, one arc, one CTA. No jargon dumps.

## Where the video goes

Frontend: inside the greeter popup card on `/`, step 1 of the first-run tour. Live as of v0.3.15 — video on the left of a two-column card, "What you get" + "Where to start" on the right.

Suggested asset location (if Kimi posts to the repo herself): `static/video/openstrata-intro.mp4` (or whatever HyperFrames output path she uses), then point the src at `/video/openstrata-intro.mp4`.

## How Kimi delivers — DONE

- ~~Record with HyperFrames using her images/video and Kimi TTS voice.~~ Delivered 2026-09-18.
- ~~Deliver the final video file + a public URL.~~ Posted to `static/video/openstrata-intro.mp4`.
- ~~Either post the asset herself or send the URL back to M3.~~ She posted it; M3 made the swap in v0.3.15.

## What Kimi should post back (or do herself) — DONE

- ~~Final video file.~~ ✅
- ~~Public URL for the video.~~ ✅ `https://openstrata.giveabit.io/video/openstrata-intro.mp4`
- ~~Confirmation that the arc + length + voice match this spec.~~ ✅ 57.2s, 16:9, Kokoro `bf_isabella` (en-GB female), HyperFrames v0.8.48
- ~~If posting to the repo: the file location.~~ ✅ `static/video/openstrata-intro.mp4`

## Script — 1-minute OpenStrata intro (for Kimi to record)

> Hi, I'm Kimi. Here's OpenStrata in about a minute.
>
> OpenStrata is the operating system for communities that govern themselves — built first for British Columbia strata corporations, and designed to go everywhere after that.
>
> It's for the people who already run a building, or want to. BCFSA-licensed brokerages use it as their white-label ops platform. Self-managed councils use it directly. Hybrid councils run the day-to-day and bring in a licensed manager only where the law needs one.
>
> And it's software, not a management company. OpenStrata runs your building. Satohash proves every action happened, on Bitcoin, so there's a proof trail you can point at. The OpenStrata protocol means your strata data belongs to the corporation — you can take your history with you.
>
> Under the hood: trust accounting, compliance workflows, meetings, forms, and the Bitcoin rails — Lightning and multisig — when you're ready. Fiat first. Bitcoin optional. Zero custody.
>
> That's it in a minute. If you're running a strata — or want to — come set up a community. The tools and the ledger are live on the site.
>
> Thanks for stopping by.

**Timing note for Kimi:** read it at a natural pace; one minute is the target, not a hard ceiling. Cut the last line or shorten the three-layers sentence if it runs long — the arc matters more than the exact word count.

## Specs Kimi should send back to M3 (or post herself) — CLOSED

- Final video file + public URL. ✅
- Confirmation: ~60s, 16:9, Kimi voice (young English woman accent), Kimi images/video where possible, HyperFrames. ✅ (57.2s, 1920×1080, Kokoro `bf_isabella`, HyperFrames v0.8.48)
- If posting to the repo: file path. ✅ `static/video/openstrata-intro.mp4`

*Handoff closed 2026-09-18. The video shipped live in v0.3.15 on Cam's OK.*
