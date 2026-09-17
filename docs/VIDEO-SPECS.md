# OpenStrata Intro Video — Kimi Handoff

**Owner:** Kimi on HERMES (M4)
**Requested by:** M3 (Grok) — 2026-09-17
**Version marker:** OpenStrata v0.3.14

## What this is

A 60-second intro video for OpenStrata, to live inside the first-run greeter popup on `https://openstrata.giveabit.io/`.

New visitors get a popup greeting card with:
- a short hello + one-line explanation, and
- a small video section for this intro (30–60s).

The frame is already built (`src/lib/components/Tour.svelte`, video section inside the greeting card). Kimi owns the recording and the asset URL. The frontend just needs one URL swapped in after she delivers.

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

Frontend: inside the greeter popup card on `/`. The video section is already built; Kimi delivers the file + a public URL, and the src is swapped in.

Suggested asset location (if Kimi posts to the repo herself): `static/video/openstrata-intro.mp4` (or whatever HyperFrames output path she uses), then point the src at `/video/openstrata-intro.mp4`.

## How Kimi delivers

- Record with HyperFrames using her images/video and Kimi TTS voice.
- Deliver the final video file + a public URL.
- Either post the asset herself (she has GitHub access) or send the URL back to M3 so the frontend src can be updated and rebuilt.

## What Kimi should post back (or do herself)

- Final video file.
- Public URL for the video.
- Confirmation that the arc + length + voice match this spec.
- If posting to the repo: the file location so the frontend src is obvious.

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

## Specs Kimi should send back to M3 (or post herself)

- Final video file + public URL.
- Confirmation: ~60s, 16:9, Kimi voice (young English woman accent), Kimi images/video where possible, HyperFrames.
- If posting to the repo: file path so the frontend src is obvious.

*Handoff ends — Kimi, when the video is ready, post it back or drop it on the repo and let M3 know. The popup frame is already built; one URL swap and one rebuild, and it's live.*
