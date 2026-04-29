# PR C — Mobile Filter Sheet

## Goal
On viewports ≤768px, replace the three-row desktop filter strip with:
- A single full-width `FILTERS · N` trigger button (above the chip row)
- A bottom sheet that contains the same controls (reparented), with header (DONE) + footer (RESET / APPLY).

Desktop ≥769px must remain unchanged.

## Approach
**Reparenting** (not mirroring). On mobile breakpoint:
1. JS hides `.filter-strip` via a class on `<body>` (`body.is-mobile-filters`).
2. JS moves the **filter row + toggles row + view row inner content** into the sheet body wrapper, preserving the same DOM nodes (so existing event listeners still fire).
3. On resize back to desktop, JS moves them back into the original parents.

Reparenting is simpler than mirroring: no need to sync state between two copies of every control.

## Files
- `web/index.html` — add trigger button + sheet container near `.lib-search`
- `web/app.css` — add mobile media-query for hiding strip, showing trigger, sheet styles
- `web/src/main.js` — add reparent logic, sheet open/close, count badge updates
- `tests/library-mobile-filter-sheet.spec.js` — new tests

## Hard Gates
- [x] On feature branch (worktree-agent-a7d673bedbe2c24b7)
- [x] Work log created
- [x] Tests pass on chromium projects (chrome / chrome-iphone / chrome-ipad)
- [x] No regressions vs 266 baseline

## Receipts
- `npx playwright test --project=chrome --project=chrome-iphone --project=chrome-ipad`: **PASS (290) FAIL (0)** in 176s
- New tests: 8 specs × 3 chromium projects = +24 (266 → 290)
- Screenshots: `/tmp/mobile-trigger.png` (FILTERS · 0 button at 375px),
  `/tmp/mobile-sheet-open.png` (sheet open with stacked controls + RESET/APPLY footer),
  `/tmp/mobile-sheet-with-filter.png` (count goes 0 → 1 after selecting first category)
- Active count badge updates: confirmed via screenshot (`count after select: 1`)

## Test sync notes
At ≤768px the desktop `.filter-strip` is `display: none`. Several pre-existing
tests that did `await page.locator(".filter-strip").waitFor({ state: "visible" })`
were timing out on `chrome-iphone` (390px viewport). Added a small helper
`tests/helpers/mobile-filters.js` that opens the sheet on mobile and is a
no-op on desktop. Updated affected specs to use it. Changed
`#result-count` assertion in `ios-touch-interactions.spec.js` to use the
viewport-stable `#row-count` line instead, since `#result-count` lives
inside the toggles row that is reparented into the sheet (where its
display is suppressed by CSS).
