# openstrata — Last Updated 2026-09-18 by Buffy (M3)

**Brief:** v0.3.18 — three things Cam asked for, plus the dark-mode defect the second one exposed. **(1)** The new **brand mark is live** everywhere: one master vector, a bold small-size favicon, and a generator (`npm run icons`) that produces `favicon.ico` + PWA + apple-touch PNGs. **(2)** The **header navigation is grouped** — twelve flat links needed ~1490px inside a 1232px bar, so the strip scrolled internally on every laptop and hid half the site. **(3)** **`/documents` — print-ready documents**: meeting notice, minutes, Form B and Form F, laid out as real paper with a letterhead, reference codes and signature lines.

**And then the navigation work exposed a real dark-mode bug.** `bg-brand-50` / `bg-brand-100` are tints used ~25 times as a *selected-state plate*, and neither step was ever remapped for dark mode: the plate stayed near-white while its label stepped up to brand-200 or slate-800 — **about 1.2:1**. Every "this one is selected" state on the wizard and the tools page was effectively invisible in dark mode. Fixed at the token, and `audit:contrast` gained a tint-pair section so it cannot return.

**Commits:** pushed to `origin/main` in batches; Cloudflare Pages deploys on push.

**Live-verified after deploy:** see the verification record at the end of this file.

---

## What shipped

### 1. The new icon is the site's icon

The attached mark is a brush drawing — a dab, three stacked layers, a settling drop. It is now one piece of artwork used everywhere instead of three different ones:

| File | What it is |
|---|---|
| `static/icon.svg` | The master vector (283×448), transparent, orange `#f0801a` |
| `static/favicon.svg` | A **bold small-size rendition**. The full mark is very tall and thin; at 16px its strokes fall below one device pixel and turn to mush. The favicon keeps the three strata layers that make the mark recognisable, drawn bold on the brand navy so it reads on light *and* dark browser chrome |
| `static/favicon.ico` | 32×32, PNG payload in an ICO container |
| `static/icon-192.png` / `icon-512.png` | PWA / Android, mark inside the maskable safe zone |
| `static/apple-touch-icon.png` | 180×180, fully opaque (iOS composites transparency onto black) |

`scripts/generate-icons.mjs` (`npm run icons`) produces every raster from the two vectors — the PNGs are committed so a build never depends on it having run. `src/lib/components/BrandMark.svelte` draws the same paths inline in `currentColor`, and it has **replaced the old three-CSS-bars-in-an-orange-plate mark** in the header, the app sidebar, the landing footer, the auth card and the error page. The favicon, the in-app logo and the printed letterhead are now the same drawing.

`static/sw.js`'s cache name went `openstrata-v1` → **`openstrata-v2`**, which is what evicts the previous build's shell from an installed PWA.

### 2. The navigation finally fits

Twelve flat links plus the actions cluster need roughly **1490px inside a 1232px bar** (`max-w-7xl`). The old strip compensated by scrolling internally — which means every ordinary laptop hid half the site behind a scrollbar nobody notices.

The header now carries **four inline destinations** and **two grouped menus**:

- Inline: **Dashboard · Strata Tool · Compliance · Docs** (~500px total)
- **Library** ▾ — Legal library · Templates · Print-ready documents · FAQ · Changelog
- **Company** ▾ — About · Pitch · Roadmap · Blog · RSS & API

Each menu item carries a one-line description, because a menu that only repeats link names is a menu that wastes the space.

Design decisions worth keeping:

- **`src/lib/nav.ts` is the one authoring home.** The flat `navItems` list that the footer column and the breadcrumb trail read is now *derived* from the grouped structure, so a link added to the header cannot go missing from either.
- **The desktop bar starts at `xl` (1280px), not `lg`.** Between 1024 and 1280 six items still could not fit alongside the actions cluster, so below `xl` the **grouped drawer** and the floating bottom dock carry navigation — instead of a bar that clips its own edges.
- **The mobile drawer mirrors the same grouping**, with `Library` and `Company` headings, and scrolls internally because it is now taller than a short phone viewport.
- **Menu behaviour is explicit and tested:** hovering opens, clicking a hover-opened menu *pins* it (it does not toggle shut — that was a real bug, see below), the next click closes, and Escape / outside-click / navigation all close it.

### 3. Print-ready documents

Councils hand each other paper. This was the half of the product that had never been designed for it.

`/documents` renders four documents — **Notice of Council Meeting**, **Minutes of Council Meeting**, **Form B (Information Certificate)** and **Form F (Certificate of Payment)** — as a white sheet: letterhead with the mark, a reference code, a meta table, disclosure tables, and signature lines.

- **One printable document, not two.** The dashboard's notice builder used to assemble *its own* print page as a string, in a popup, with its own inline fonts and colours — so the printed notice had no letterhead and drifted from the template the moment either changed. It now hands the council's date, time, place and agenda to `/documents` through the query string (the same pattern the templates page uses to prefill the wizard). There is exactly one printable notice in the codebase.
- **On-screen preview is a paper sheet**, not a themed web page — so a council sees the page it is about to sign, and dark mode cannot change what a printed Form B looks like.
- **`@page { size: letter }`** with real margins, because the first market is BC. Printing hides the chrome, drops the sheet's padding, radius and shadow, and puts each document of a full-set print on its own page.
- **The documents carry their own honesty.** Every one says it is a template preview with sample data and is not a filed record. Form F shows the **withheld** state and says plainly that a balance above zero blocks a sale — matching the backend rule, so the paper cannot contradict the software. Form B's 7-day delivery window matches `FORM_B_DAYS` in the backend. The notice windows (AGM 14 days, council 7 days) are the ones the site already asserts.

Content lives in `src/lib/documents.ts` with pure helpers — `docReference`, `addDays`, `daysBetween`, `applyNoticeParams` — and **28 tests**.

### 4. The bug the navigation work exposed

`bg-brand-50` / `bg-brand-100` are used ~25 times as a selected-state plate — chosen jurisdiction, chosen bylaw pack, active decision pill — normally paired with a brand or slate label. **Neither step was ever remapped for dark mode.** So the plate stayed near-white (`#ecfeff`) while its label stepped *up* to brand-200 (`#a5f3fc`) or slate-800 (`#e2e8f0`) — around **1.2:1**. Every "this one is selected" state in the wizard and the tools page was invisible in dark mode.

Both steps now have dark values (`#113441` / `#16414f`), with a separate pair for the green "brokerage" accent, which declares its own ramp. `audit:contrast` gained a **tint-pair** section, taking it from 106 to **116 pairs**.

Three smaller real bugs went with it:

- **`.marketing-mobile-nav` was missing from the print hide list** — on a phone, the floating bottom dock printed across the foot of every page.
- **The printed sheet kept its screen styling**: the print overrides lost to the component's *scoped* `.print-doc.svelte-hash` rules, leaving 44px padding, a 14px radius and a drop shadow on paper.
- **A hover-then-click on a grouped menu closed it** — the pointer opened it and the click toggled it shut.

---

## Verified

`npm run check` → **0 errors, 0 warnings** · `npm test` → **143 passed** (was 115) · `npm run audit:i18n` → **872 keys × 9 locales** · `npm run audit:contrast` → **116 pairs**, all at or above floor · build green · `/documents` prerenders and `sitemap.xml` lists it.

Browser verification against the production preview, with the service worker unregistered first:

- **114 page/theme/viewport combos** — 19 pages × light/dark × 1440 / 1024 / 390px — with **0 horizontal overflow** and **0 text below floor on a brand tint**.
- **Nav measured at 1023 / 1024 / 1279 / 1280 / 1440 / 1920px**: the grouped bar renders from 1280 with **0 strip overflow**; below that the grouped drawer opens with its headings and scrolls internally.
- **Menu behaviour**: hover → open · click → pins · second click → closes · Escape → closes · outside click → closes.
- **Icons**: `/favicon.ico`, `/favicon.svg`, `/icon.svg`, `/icon-192.png`, `/icon-512.png`, `/apple-touch-icon.png` all **200**; `app.html` declares ico + svg + 192 + apple-touch; the manifest points at the PNGs.
- **Print media emulation**: chrome hidden, sheet at `padding: 0`, `border-radius: 0`, `box-shadow: none`; the full set prints **4 sheets** with the right titles and refs; the notice handoff renders `Notice of Annual General Meeting` with the council's own date, place and agenda, and flags the window correctly.

## Known issues

- **The backend is still not deployed.** The website is live; the money-handling server has never run on a real host. That remains the one thing between "demo" and "product", and it is waiting on THOR.
- **THOR's bitcoind has no wallet loaded** (`listwallets` = `[]`). Cam greenlit `createwallet` on 2026-09-18; it has not been created yet. The preferred PSBT workflow seam needs it; the raw `sendrawtransaction` seam does not.
- **Ollama is deliberately not on THOR** (RAM is the tightest resource). Rosa answers on the keyword fallback until it runs on UMBREL or M3/M4 and `OLLAMA_BASE_URL` points there.
- **`static/logo.png` is still the pre-rebrand artwork** and is used by `/pitch`. Left untouched so the pitch deck's layout does not shift; it should be replaced with the new mark in a follow-up.

## The mark is a vector redraw — one honest caveat

Cam attached the icon as an image, not as a source file. The vectors here are a faithful hand-redrawn interpretation of that artwork, which is why the favicon needed a simplified small-size version. If there is an original SVG or a high-resolution PNG, dropping it in and re-running `npm run icons` will make the match exact — everything else already reads from those two files.
