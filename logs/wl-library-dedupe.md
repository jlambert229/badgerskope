# Library dedupe — drop SKU size variants, strip "(N mg)" suffixes

Branch: `data/library-dedupe-base-compound` (off `679d870`)
Owner: claude (agent worktree)
Goal: Each compound appears exactly once in `/web/` library. Sizes belong on a vendor SKU page, not the editorial table.

## Problem

`peptide-info-database.json` ships 53 entries. Four base compounds are duplicated solely to expose vendor SKU dose sizes:

| Compound | Variants | Diff |
|---|---|---|
| Tirzepatide | 4 (`2G-TZ 10mg/15mg/30mg/60mg`) | only `catalog.title` + `catalog.commonDrugName` |
| Retatrutide | 3 (`3G-RT 10mg/20mg/36mg`) | only `catalog` |
| Semaglutide | 2 (`1G-SGT 10mg/20mg`) | only `catalog` |
| Tesamorelin | 3 (`Tesa-10mg/15mg/20mg`) | only `catalog` (NB: SomatoPulse is a separate combo entry, not a dupe) |

Confirmed via diff probe: every non-`catalog` field is byte-identical across each group.

## Plan

1. Drop 9 entries (3 TZ + 2 RT + 1 SGT + 2 TES non-combo). Keep the lowest-mg variant per group as canonical: `2G-TZ 10mg`, `3G-RT 10mg`, `1G-SGT 10mg`, `Tesa-10mg`.
2. Strip `\s*\(\d+\s*mg\)\s*$` (case-insensitive) from `catalog.title` and `catalog.commonDrugName` on every remaining entry. Same regex strips trailing dose suffix from SKU titles too (`Tesa-10mg` → `Tesa-`, then we trim the trailing dash).
3. Also strip a trailing space-separated dose like `2G-TZ 10mg` → `2G-TZ` and `3G-RT 10mg` → `3G-RT`. Same for `BPC-157 10mg`, `Selank 10mg`, etc. Pattern: `/[\s-]*\d+\s*mg\s*$/i`.
4. Result: 53 → 44 entries; no remaining `(N mg)` or trailing dose in any title.

## Affected code paths (verified)

- `web/src/state.js::getEntryByTitle()` matches by catalog.title or commonDrugName (lowercase). Existing curated list `start-here.js` calls `getEntryByTitle("Semaglutide")` — currently FAILS to resolve because commonDrugName is `"Semaglutide (10 mg)"`. Dedupe fixes this.
- `tests/navigation-state.spec.js:31` deep-links via `1G-SGT 10mg` and `:53` via `Semaglutide (10 mg)`. Update to use `1G-SGT` / `Semaglutide`.
- `tests/navigation-state.spec.js:26` and `tests/edge-cases.spec.js:80` assert `< 53` row count. Update to `< 44`.
- `web/index.html:115` placeholder `SEARCH 53 COMPOUNDS` → `SEARCH 44 COMPOUNDS`.
- Stats template `${total} COMPOUNDS LOGGED` reads from db.length, so it auto-updates.
- Marketing landing index.html "142 FILES" copy is decorative and unrelated to actual count — leave alone (per scope).

## Receipts to capture

- entry count before/after (`db.entries.length`)
- grep showing no `(N mg)` or trailing `Nmg` in any title
- Playwright Chromium pass count

## Out of scope

- WebKit projects (ICU lib mismatch on this host)
- Any UI/CSS changes
