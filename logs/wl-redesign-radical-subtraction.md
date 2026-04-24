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
