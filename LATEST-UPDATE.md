# openstrata — Last Updated 2026-09-18 by Buffy (M3)

**Brief:** v0.3.20 — three improvements and two real defects found making them. **(1)** The **pre-rebrand logo is retired everywhere** — `/pitch` was the last page still showing it, and the link preview on every share was a 237×377 image every crawler upscaled and cropped; there is now a 1200×630 `/og.png` that `npm run icons` renders. **(2)** **Every payment carries a per-site label** (`OST northgate U302 pay-9142`) so money can never be confused between projects — Cam's mandate, done while the rail is still off. **(3)** **`/custody`** — a plain-language page for the question behind “0% custody”: where the money sits at each step, what the software cannot do, what a council can check, and what is not live yet.

**Commit:** `893d995` (docs) · `459e5c0` (release) · `9bc8c03` (code) — all pushed, then live-verified.

---

## 1. One mark everywhere

The mark had quietly become four pieces of artwork. The header, sidebar, footer and printed letterhead used the vector `BrandMark`; the browser tab used a simplified favicon rendition (necessary — the full mark is 283×448 and at 16px its strokes fall under one device pixel); the PWA icons were rendered from the favicon art; and **`/pitch` still shipped `static/logo.png`, the pre-rebrand raster**, which was also the `og:image` and `twitter:image` on every page of the site.

All four now agree:

- `/pitch` uses the same **mark-on-navy plate** as everything else (`#102d3b` plate, the orange mark, the same radius family as the favicon and the PWA icons).
- Link previews point at a new **1200×630 `/og.png`** — the size Facebook, LinkedIn and X all crop against — with `twitter:card` upgraded to `summary_large_image`.
- `npm run icons` renders it from `icon.svg` plus an SVG text overlay, so the card updates when the art does.
- `static/logo.png` and `public/logo.png` are **deleted**, and `src/lib/brand-assets.test.ts` fails if either ever comes back or if the inline mark drifts from the vector it is drawn from.

**Because nothing should break silently, the new tests are the point:** the inline `BrandMark.svelte` must match `static/icon.svg` path-for-path, the favicon must stay a strictly simpler square rendition, `og.png` must be 1200×630, the manifest must point at rasters, and `app.html` must declare every browser-facing icon.

## 2. Payment labels that name the site

A rail invoice used to be labelled with **the rail's own name** — `Lightning Network`, `Bitcoin (on-chain)`. That string is identical in every Give A Bit project, so a node operator, a council treasurer or anyone reading a wallet history could not tell whose money had arrived. On a family of sites that all handle money, that is the wrong default.

Every quote now carries a label shaped like this:

```
OST  northgate  U302  pay-9142
^^^  ^^^^^^^^^  ^^^^  ^^^^^^^^^
site  council   unit   request
```

`backend/src/rails/receive-label.ts` builds it as a **pure function of keys the payment request already persists** (`communityId` + `unitRef` + `refId`) — so there is no migration, and the label on the node, in the wallet and on the stored row cannot drift apart. **21 tests** cover it. Details worth keeping:

- **The site code table is explicit** (OST / SATO / TAD / MOTO / SHER / STRA / KATO / LIND / CAMD / BTCM / GAB) so two projects colliding on the same three letters is a visible edit rather than a coincidence of spelling.
- **`assertReceiveLabelFor` refuses a foreign label loudly** at the rail seam — a SATO label arriving at an OpenStrata node throws rather than being accepted quietly.
- **The label is sanitized and length-capped** before it is joined: wallets truncate, and a label that ends in an ellipsis failed at its one job.
- **The API returns `receiveLabel`** and the checkout panel shows it as **Payment name**, next to the payment instructions, so the string a council writes on an e-transfer is the string the node records.

## 3. `/custody` — how your money is held

`0% custody` was four words inside a popup: the strongest promise the product makes, and the hardest one for a council to check. `/custody` is that promise made readable and testable, in four sections in the order a skeptical treasurer asks:

1. **Where the money sits** — an owner pays → the council holds it → OpenStrata writes it down. In none of the three does the money pass through us.
2. **What OpenStrata cannot do** — stated as impossibilities: move money, change a posted ledger entry, act as custodian or escrow, see private keys, take a cut. Each line is something no employee, bug or court order can make the software do.
3. **What a council can check, any time** — verify the chain, export everything as JSON and CSV, read the exact Form B the software would issue, run the whole thing on its own server. Every line is a button, not a request to us.
4. **Where this stands today** — honestly: the rails ship switched off, no money has moved through OpenStrata yet, and the payment server has not run on a public host.

It is hooked to the **home page's 0% custody proof card** (which used to link to `/tools`, the wrong destination for that claim) and the footer, and it is indexed for site search — but it is **not** in the header nav. Cam asked for a simpler UI, so a new top-level item was the wrong instinct.

**One deliberate rule:** the page's body prose stays **English**, in `src/lib/custody.ts`, while its chrome (12 keys) is in all 9 locales. A machine translation of “we never hold your money” is a materially false statement, and custody wording is the last place to accept one. `documents.ts` and `manual.ts` already follow this rule.

## 4. Two defects found on the way

- **`static/icon.svg` could not be rasterised at all.** Its comment contained a double hyphen (`--mark-orange`), which is a hard XML error — so the rasteriser refused the file. The master mark had **never** actually been rendered from its own source until `og.png` needed it. Fixed the comment; the art is unchanged.
- **The changelog's front-matter was malformed** (`project: openstrataversion_history:` — a missing newline that swallowed the project name). Fixed, with the v0.3.20 history entry written the way the other entries are.

---

## Verified

`npm run check` → **0 errors, 0 warnings** · `npm test` → **164 passed** (was 143) · backend typecheck clean, **214 passed** (was 191) · `npm run audit:i18n` → **886 keys × 9 locales**, parity green · `npm run audit:contrast` → **116 pairs**, all at or above floor · build green, `/custody` prerenders, sitemap lists it.

Browser verification against the production preview, with the service worker unregistered first:

- **`/custody`** renders its 4 sections, 3 steps, 5 limits, 4 checks and 3 honesty lines with **0 horizontal overflow** at 1440px and in dark mode; the dark-mode heading resolves to the light ink.
- **`/pitch`** serves **0 raster logos** and 4 vector marks, each on the navy plate (`rgb(16, 45, 59)`) with the mark in the brand orange (`rgb(240, 128, 26)`).
- **`/og.png`** returns **200**; the retired **`/logo.png` returns 404**.
- **The checkout** shows `OST demo U101 demo` with its **Payment name** label and explanation in light and dark, at 0 overflow.

## Known issues

- **The backend still has not run on a public host.** The website is live; the money-handling server is not. That remains the one thing between demo and product, and it waits on THOR.
- **THOR's bitcoind has no wallet loaded** (`listwallets` = `[]`, verified by Kimi on the box). Cam greenlit `createwallet` on 2026-09-18; it has not been created yet. The PSBT workflow seam needs it.
- **`/custody` body prose is English-only by decision** — do not machine-translate it.
- **The mark is a vector redraw of Cam's attached image, not the original file.** If the source SVG or a high-resolution PNG ever appears, dropping it into `static/icon.svg` plus `npm run icons` updates the whole set in one command.
