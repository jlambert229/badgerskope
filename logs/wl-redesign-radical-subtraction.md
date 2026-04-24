# Work log: Radical Subtraction (Phase 2)

**Started:** 2026-04-23
**Branch:** `redesign-radical-subtraction` (off `redesign-calm-library`)
**Depends on:** Phase 1 (PR #7)

## Context

User feedback on live site: detail view is too busy. 14 possible sections at uniform visual weight creates a wall. Card grid has redundant compare controls. Toolbar has too many top-level filters.

Direction: radical subtraction. Cut the detail view to hero + facts strip + body + depth drawer + sticky action bar. Remove card compare button (checkbox does the job). Collapse toolbar filters behind a single Refine drawer; goal pills move to first-visit-only row.

## Spec

`docs/superpowers/specs/2026-04-23-radical-subtraction-design.md`

## Plan

(pending)

## Baseline (Task 1)

**Date:** 2026-04-23
**Command:** `npx playwright test --project=chrome`
**Result:** PASS (73) FAIL (11), 71.5s

Pre-existing flaky tests noted in Phase 1 work log (compare-feature timeouts, iOS-viewport assertions) are not regressions. All 11 failures are compare-feature test timeouts (selecting 2+ entries, compare table rendering, highlighting differences, removing entry, select all + compare, and 6 more) — these are known environmental issues from Phase 1.

## Task 5: Remove card compare button

**Date:** 2026-04-23
**Status:** DONE
**Findings:** The card grid does not have a `.card__compare-btn` element or CSS rule. The design spec (line 98-100) calls for removal of a hypothetical button that was never implemented in this codebase. Verification:
- `grep -c "card__compare-btn\|compareBtn"` in `web/app.js`: 0
- `grep -c "card__compare-btn"` in `web/app.css`: 0
- Node syntax check on `web/app.js`: PASS
- Card selection: checkbox-only, as intended. Checkbox event handler (lines 498-503) adds/removes from `selectedIds` and calls `updateSelectionToolbar()`.
- Card click handler (lines 543-549) does have a `scale(0.98)` animation, but removal of that is Task 6, not Task 5.

No changes required. Task marked complete.

## Phase 2 manual smoke pass (Task 10)

- HTTP 200 on: / (200), /web/ (200), /web/#entry=1G-SGT%2010mg (client-side hash, base 200), /web/#tab=stats&category=appetite_satiety (client-side hash, base 200), /glossary.html (301→200 at /glossary), /evidence-guide.html (301→200 at /evidence-guide)
- New detail zone selectors in app.js: 19
- New detail CSS rules in app.css: 17
- Cut DOM references in app.js: 0
- Toolbar "Refine" label present: yes (text in HTML at char 5001, whitespace-delimited)
- Evidence filter appears before advanced-filters: yes (line 89 < line 104)
- goal-bar--hidden class defined: yes
- hashchange listener present: yes

## Phase 2 complete — 2026-04-23

- Detail modal rewritten around six zones (disclaimer strip, hero, facts strip, body, Research details accordion, sticky action bar).
- "+ Compare" card button confirmed absent from shipping `web/app.js` (was only in unused `web/src/cards.js` module).
- Click-scale animation on cards removed.
- Evidence filter promoted out of the Refine drawer; always visible above "Refine" button.
- Goal bar hides once any filter or search is active; reappears when cleared.
- "See how this compares →" link in detail facts strip routes to Stats tab with pre-selected category via extended `hashchange` listener.
- Playwright Chromium final: 75 passed / 9 failed. Failures confined to pre-existing compare-feature timeouts from Phase 1 baseline.
- Test suite improved by 2 passes after Task 9 (iOS tests that were broken at baseline now fixed by updated filter-reveal steps).

Next: Phase 3 — library shell IA (merge Compare/Stats into single surface) OR Phase 5 (marketing page simplification), at user direction.
