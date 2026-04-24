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
