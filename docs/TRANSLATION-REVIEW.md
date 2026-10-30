# Translation review — OpenStrata

The catalog is **not certified**. Automated parity and placeholder tests do not establish accuracy. The Spanish renewal-calendar strings and balance-status labels are machine-drafted. Earlier French review covered older copy only. English also needs editorial and BC legal review.

## Generate the review sheet

From the repository root, with dependencies installed:

```bash
npm run --silent export:i18n > translation-review.csv
```

The UTF-8 CSV has one row per key: `key`, English source, `fr`, `es`, `zh`, `hi`, `fil`, `pl`, `uk`, `sw`, and `review_notes`. An empty locale cell means no override; the site falls back to English. Preserve `{placeholder}` names exactly, including capitalization. Open the file as UTF-8 and do not alter numeric values or legal meaning. The sheet is a snapshot of the current working tree, so record its Git commit and whether there are local changes before sending it for review. Do not commit filled-in reviewer sheets containing personal information.

## Reviewer checklist

1. Record locale, reviewer, date, Git commit, and the scope reviewed. English and each of the eight translated locales need their own review.
2. Read each string alongside the English and in the interface: dashboard, search, units, accounting, payment, calendar, meetings, forms and printed documents. Check context, tone, truncation and screen-reader labels.
3. Check placeholders, amounts, dates, plurals, spelling and terminology; identify text that is misleading or missing, not merely awkward. Record a proposed correction and the key in `review_notes`.
4. A qualified British Columbia legal/financial reviewer must separately approve legal, payment, tax, bylaw and financial copy before production reliance. Translators must not infer legal facts from the UI.
5. Report hard-coded copy and canonical source text separately: they are **not** included in this catalog export. Run `npm run audit:i18n` to list known route warnings.
6. Return the reviewed sheet securely. An engineer updates `src/lib/i18n.ts` and `src/lib/locales/*.ts`, runs `npm run audit:i18n` and `npx vitest run src/lib/i18n.test.ts`, and records corrections and reviewer sign-off. A changed catalog needs a new review of affected copy.

No reviewer has been assigned or represented as having signed off by this document.
