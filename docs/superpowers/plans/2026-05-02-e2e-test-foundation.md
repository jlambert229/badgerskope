# E2E Test Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the CI baseline for the Playwright test suite and correct the design doc's coverage statuses via a verification pass over existing specs.

**Architecture:** Two GitHub Actions workflows under `.github/workflows/` — `test.yml` (Chromium, required PR check) and `webkit.yml` (WebKit, informational, scheduled + dispatch). One verification pass that opens each existing spec file, cross-references its assertions to the matrix in `docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md`, and corrects the status column. The recomputed counts table replaces the presumed numbers from revision 2.

**Tech Stack:** GitHub Actions YAML, Playwright (existing), Markdown (design doc edits).

**Reference spec:** `docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md` (revision 2)

---

## File structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `.github/workflows/test.yml` | Required PR check; runs Chromium projects via `PLAYWRIGHT_WEBKIT=0` |
| Create | `.github/workflows/webkit.yml` | Informational WebKit run on schedule + dispatch |
| Modify | `docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md` | Update status column for verified rows; recompute counts table |

No source code changes. No new test files. No package.json changes.

---

## Task 1: Required CI workflow (Chromium)

**Files:**
- Create: `.github/workflows/test.yml`

- [ ] **Step 1: Create the workflow file**

Write `.github/workflows/test.yml` with this exact content:

```yaml
name: Tests

# Playwright E2E suite, Chromium projects only.
# WebKit projects are skipped via PLAYWRIGHT_WEBKIT=0 (see playwright.config.js).
# WebKit fails environmentally on Linux with the bundled WPEWebKit (ICU mismatch);
# Chromium is the canonical baseline.

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: tests-${{ github.workflow }}-${{ github.head_ref || github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  playwright:
    name: Playwright (Chromium)
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Resolve Playwright version
        id: pw
        run: echo "version=$(node -p \"require('@playwright/test/package.json').version\")" >> "$GITHUB_OUTPUT"

      - name: Cache Playwright browsers
        id: cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-chromium-${{ runner.os }}-${{ steps.pw.outputs.version }}

      - name: Install Playwright browsers
        if: steps.cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps chromium

      - name: Install Playwright system deps (cache hit)
        if: steps.cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps chromium

      - name: Run Playwright tests
        env:
          PLAYWRIGHT_WEBKIT: "0"
        run: npx playwright test --reporter=github,html

      - name: Upload Playwright HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Upload test results (failures)
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 14
```

- [ ] **Step 2: Lint the YAML locally**

Run:

```bash
cd /home/owner/Repos/badgerskope
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/test.yml'))" && echo "YAML OK"
```

Expected: `YAML OK`. If it errors, the file has a syntax problem — fix before continuing.

- [ ] **Step 3: Verify the suite runs locally with the same env as CI**

Run:

```bash
cd /home/owner/Repos/badgerskope
PLAYWRIGHT_WEBKIT=0 npx playwright test --reporter=line
```

Expected: Chromium projects (`chrome`, `chrome-iphone`, `chrome-ipad`) run. WebKit projects (`safari-*`, `ipad`) are not listed in the run output. Final line shows pass count and (if any) fail count.

If tests fail locally before this PR: that is a pre-existing red baseline that this plan does not address. Note the failures and continue — they are out of scope here.

- [ ] **Step 4: Commit**

```bash
cd /home/owner/Repos/badgerskope
git add .github/workflows/test.yml
git commit -m "ci: add required Playwright Chromium workflow

Runs the Playwright suite on PR / push to main / manual dispatch with
PLAYWRIGHT_WEBKIT=0 to skip WebKit projects. Caches browsers keyed on
Playwright version, uploads HTML report on every run, uploads
test-results/ on failure.

Branch protection should require the 'Playwright (Chromium)' check
once this lands on main."
```

---

## Task 2: Informational WebKit workflow

**Files:**
- Create: `.github/workflows/webkit.yml`

- [ ] **Step 1: Create the workflow file**

Write `.github/workflows/webkit.yml` with this exact content:

```yaml
name: Tests (WebKit)

# Informational WebKit run on schedule + manual dispatch.
# Not required for PR merge — WebKit fails environmentally on the dev
# Linux host, but may pass on GitHub's runners. If this consistently
# stays green for several cycles, promote to required by removing
# PLAYWRIGHT_WEBKIT=0 from test.yml.

on:
  schedule:
    - cron: "0 14 * * 1"  # Mondays 14:00 UTC, 1h after source-liveness
  workflow_dispatch:

permissions:
  contents: read

jobs:
  playwright:
    name: Playwright (WebKit)
    runs-on: ubuntu-latest
    timeout-minutes: 30
    continue-on-error: true
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Resolve Playwright version
        id: pw
        run: echo "version=$(node -p \"require('@playwright/test/package.json').version\")" >> "$GITHUB_OUTPUT"

      - name: Cache Playwright browsers
        id: cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-webkit-${{ runner.os }}-${{ steps.pw.outputs.version }}

      - name: Install Playwright (WebKit)
        if: steps.cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps webkit

      - name: Install Playwright system deps (cache hit)
        if: steps.cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps webkit

      - name: Run Playwright tests (WebKit projects)
        run: npx playwright test --project=safari-ios --project=safari-ios-landscape --project=ipad --project=safari-desktop --reporter=github,html

      - name: Upload Playwright HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-webkit
          path: playwright-report/
          retention-days: 14

      - name: Upload test results (failures)
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-webkit
          path: test-results/
          retention-days: 14
```

- [ ] **Step 2: Lint the YAML locally**

Run:

```bash
cd /home/owner/Repos/badgerskope
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/webkit.yml'))" && echo "YAML OK"
```

Expected: `YAML OK`.

- [ ] **Step 3: Commit**

```bash
cd /home/owner/Repos/badgerskope
git add .github/workflows/webkit.yml
git commit -m "ci: add informational WebKit workflow

Runs the four WebKit Playwright projects on Mondays 14:00 UTC and on
manual dispatch. Not required for PR merge — WebKit fails
environmentally on the dev Linux host. If this stays green for several
cycles on GitHub runners, promote to required by removing the
PLAYWRIGHT_WEBKIT=0 gate from test.yml.

continue-on-error keeps the Actions tab from showing red Xs on the
scheduled run when WebKit fails."
```

---

## Task 3: Verify marketing-area specs

This task and Tasks 4–5 form the **verification pass**. The goal: open each spec, cross-reference its assertions to matrix rows that cite it, and correct any inflated status claims in `docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md`.

**Method per spec file:**

1. Read the spec.
2. List every `test()` and `test.describe()` block with its assertion(s).
3. Find every matrix row in the design doc that cites this spec file in the **Spec file** column.
4. For each row: does the listed assertion in the spec actually prove the row's scenario?
   - **Yes, fully** → leave as `covered`
   - **Yes, partly** (e.g., asserts presence but not behavior) → set status to `partial`
   - **No** → set status to `gap` and clear the spec file column to `—`

**Files:**
- Modify: `docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md`
- Read-only: `tests/marketing-cohesion.spec.js`, `tests/mobile-spacing-pass.spec.js`, `tests/pr-f-token-polish.spec.js`

- [ ] **Step 1: Verify `tests/marketing-cohesion.spec.js`**

Read the file. List every assertion. Find every matrix row that cites this file (search the design doc for `marketing-cohesion.spec.js`). For each row, decide `covered` / `partial` / `gap` based on the actual assertions. Edit the design doc accordingly.

- [ ] **Step 2: Verify `tests/mobile-spacing-pass.spec.js`**

Same method. This spec is a regression guard for PR #78 + #79; many of its assertions cover MKT rows. Confirm each cited row is actually proven by the spec.

- [ ] **Step 3: Verify `tests/pr-f-token-polish.spec.js`**

Same method. Cites: brand-integrity rows in MKT-brand and MKT-anchor.

- [ ] **Step 4: Commit the marketing-area corrections**

```bash
cd /home/owner/Repos/badgerskope
git add docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md
git commit -m "docs(testing): verify marketing-area spec status claims

Cross-referenced assertions in marketing-cohesion, mobile-spacing-pass,
and pr-f-token-polish specs against MKT-* matrix rows that cite them.
Corrected status for rows where the cited spec doesn't fully prove the
scenario."
```

---

## Task 4: Verify library-area specs

**Files:**
- Modify: `docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md`
- Read-only: `tests/library-default-state.spec.js`, `tests/library-mobile-shell.spec.js`, `tests/library-mobile-filter-sheet.spec.js`, `tests/library-responsive-labels.spec.js`, `tests/library-dedupe.spec.js`, `tests/pr-i-search-floating.spec.js`, `tests/ios-detail-modal.spec.js`, `tests/ios-css-issues.spec.js`, `tests/ios-touch-interactions.spec.js`

- [ ] **Step 1: Verify `tests/library-default-state.spec.js`**

Same method as Task 3. Cites: LIB-tabs-001, LIB-search-002, LIB-filter-003, LIB-filter-004 + regression entry.

- [ ] **Step 2: Verify `tests/library-mobile-shell.spec.js`**

Cites: LIB-grid-001, LIB-grid-003.

- [ ] **Step 3: Verify `tests/library-mobile-filter-sheet.spec.js`**

Cites: LIB-msheet-001 through LIB-msheet-005.

- [ ] **Step 4: Verify `tests/library-responsive-labels.spec.js`**

Cites: LIB-grid-004.

- [ ] **Step 5: Verify `tests/library-dedupe.spec.js`**

Cites: LIB-grid-006.

- [ ] **Step 6: Verify `tests/pr-i-search-floating.spec.js`**

Cites: LIB-search-004, LIB-chrome-001, LIB-chrome-002 + regression entry.

- [ ] **Step 7: Verify `tests/ios-detail-modal.spec.js`**

Cites: LIB-detail-001, LIB-detail-003, LIB-detail-007.

- [ ] **Step 8: Verify `tests/ios-css-issues.spec.js`**

Cites: LIB-detail-008.

- [ ] **Step 9: Verify `tests/ios-touch-interactions.spec.js`**

Cites: LIB-detail-006.

- [ ] **Step 10: Commit the library-area corrections**

```bash
cd /home/owner/Repos/badgerskope
git add docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md
git commit -m "docs(testing): verify library-area spec status claims

Cross-referenced assertions in library-* and ios-* specs against LIB-*
matrix rows that cite them. Corrected status for rows where the cited
spec doesn't fully prove the scenario."
```

---

## Task 5: Verify cross-cutting specs

**Files:**
- Modify: `docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md`
- Read-only: `tests/app-loads.spec.js`, `tests/edge-cases.spec.js`, `tests/accessibility.spec.js`, `tests/tier-colors.spec.js`, `tests/data-integrity.spec.js`, `tests/offline-pwa.spec.js`, `tests/navigation-state.spec.js`

- [ ] **Step 1: Verify `tests/app-loads.spec.js`**

Cites: MKT-bootstrap-001, LIB-bootstrap-001.

- [ ] **Step 2: Verify `tests/edge-cases.spec.js`**

Cites: MKT-bootstrap-002, LIB-bootstrap-003.

- [ ] **Step 3: Verify `tests/accessibility.spec.js`**

Cites: heavily — MKT-faq-002, MKT-faq-003, MKT-subscribe-004, MKT-nav-006, LIB-tabs-002, LIB-search-005, LIB-filter-007, LIB-grid-008, LIB-detail-005, LIB-chrome-005.

- [ ] **Step 4: Verify `tests/tier-colors.spec.js`**

Cites: MKT-content-003, MKT-library-003, MKT-brand-002, LIB-grid-005, LIB-tier-001, LIB-tier-002, LIB-theme-003, EVD-tiers-002.

- [ ] **Step 5: Verify `tests/data-integrity.spec.js`**

Cites: LIB-data-001, LIB-data-002, LIB-data-003.

- [ ] **Step 6: Verify `tests/offline-pwa.spec.js`**

Cites: LIB-bootstrap-004, LIB-offline-001, LIB-offline-002.

- [ ] **Step 7: Verify `tests/navigation-state.spec.js`**

Cites: LIB-tabs-003, LIB-theme-001.

- [ ] **Step 8: Commit the cross-cutting corrections**

```bash
cd /home/owner/Repos/badgerskope
git add docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md
git commit -m "docs(testing): verify cross-cutting spec status claims

Cross-referenced assertions in app-loads, edge-cases, accessibility,
tier-colors, data-integrity, offline-pwa, and navigation-state specs
against matrix rows that cite them. Corrected status for rows where
the cited spec doesn't fully prove the scenario."
```

---

## Task 6: Recompute counts + remove verification disclaimer

**Files:**
- Modify: `docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md`

- [ ] **Step 1: Count the corrected rows by surface and status**

Run:

```bash
cd /home/owner/Repos/badgerskope
echo "rows by surface:" && for prefix in MKT LIB GLO EVD; do count=$(grep -cE "^\| $prefix-" docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md); echo "  $prefix: $count"; done
echo "by status (rough — section 2 taxonomy table contributes ~4 false positives):" && for s in covered partial gap out-of-scope; do count=$(grep -cE "\| $s \|" docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md); echo "  $s: $count"; done
```

Use these numbers as the starting point. Manually subtract the section-2 taxonomy-table false positives (one per status) to get the real status counts: `covered - 1`, `partial - 1`, `gap - 1`, `out-of-scope - 1`.

- [ ] **Step 2: Update the count table in section 3**

Find this block in the design doc:

```markdown
### Counts (initial inventory, 2026-05-02)

| Surface | covered | partial | gap | out-of-scope | total |
|---------|--------:|--------:|----:|-------------:|------:|
| Marketing (MKT) | 15 | 14 | 11 | 2 | 42 |
| Library SPA (LIB) | 20 | 23 | 63 | 0 | 106 |
| Glossary (GLO) | 0 | 0 | 15 | 0 | 15 |
| Evidence Guide (EVD) | 0 | 1 | 14 | 0 | 15 |
| **Total** | **35** | **38** | **103** | **2** | **178** |
```

Replace the Marketing, Library SPA, and Evidence Guide rows with the per-surface counts you computed in step 1 (Glossary has no covered/partial — leave as-is unless the verification pass changed something). Recompute the **Total** row.

Update the date in the heading from `(initial inventory, 2026-05-02)` to `(verified, YYYY-MM-DD)` using today's date.

- [ ] **Step 3: Remove the presumed-status disclaimer**

In section 1 (Purpose & scope), find this line:

```markdown
**Status disclaimer (revision 2)**: covered/partial markings are *presumed* based on spec filename and feature mapping, not verified by reading every assertion. A verification pass is queued in the writing-plans backlog. Treat day-one statuses as directional, not authoritative.
```

Replace with:

```markdown
**Status verified (revision 3)**: covered/partial markings were verified against actual spec assertions on YYYY-MM-DD. Statuses are authoritative as of that date.
```

(Replace `YYYY-MM-DD` with today's date.)

In section 10, find this line:

```markdown
### Verification debt (revision 2)

The current matrix marks rows `covered`/`partial` based on filename + ID heuristics, not by reading every assertion. The first task in the writing-plans backlog is a verification pass: open each spec file, confirm assertions match claimed rows, and downgrade/upgrade status accordingly.
```

Delete this entire `### Verification debt (revision 2)` subsection.

- [ ] **Step 4: Verify the doc still parses cleanly**

Run:

```bash
cd /home/owner/Repos/badgerskope
grep -nE "TBD|TODO|XXX|FIXME" docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md || echo "no placeholders"
wc -l docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md
```

Expected: `no placeholders`. Line count should be slightly lower than before (verification debt subsection removed).

- [ ] **Step 5: Commit**

```bash
cd /home/owner/Repos/badgerskope
git add docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md
git commit -m "docs(testing): recompute counts after verification pass

Updated section 3 counts table with verified per-surface totals.
Removed the presumed-status disclaimer from section 1 and the
verification-debt subsection from section 10. Statuses are now
authoritative as of the commit date."
```

---

## Task 7: Open PR for the foundation branch

**Files:** none — this is a git operation.

- [ ] **Step 1: Push the branch**

```bash
cd /home/owner/Repos/badgerskope
git push -u origin docs/e2e-test-plan
```

Expected: branch pushed, remote tracking set.

- [ ] **Step 2: Open the PR**

```bash
cd /home/owner/Repos/badgerskope
gh pr create --title "docs+ci: e2e test plan + Chromium CI baseline" --body "$(cat <<'EOF'
## Summary

- Adds `docs/superpowers/specs/2026-05-02-e2e-test-plan-design.md` — coverage matrix + scenario spec for all four user-facing surfaces (178 rows).
- Adds `.github/workflows/test.yml` — required Chromium Playwright check on PR / push to main.
- Adds `.github/workflows/webkit.yml` — informational WebKit run on schedule + dispatch.
- Verification pass over the existing 19 spec files corrects status markings in the design doc; counts table reflects authoritative numbers.

## Test plan

- [ ] CI: `Playwright (Chromium)` check passes green on this PR.
- [ ] Local: `PLAYWRIGHT_WEBKIT=0 npx playwright test --reporter=line` passes (or matches the pre-PR baseline).
- [ ] Manual: trigger `Tests (WebKit)` workflow via Actions tab; observe it does not fail the PR even if WebKit projects fail.
- [ ] After merge: configure branch protection on `main` to require the `Playwright (Chromium)` check.

## Follow-ups (out of scope)

- Gap-closing test plans per surface (separate plans, separate branches).
- `/schedule` a quarterly drift check 90 days from merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

- [ ] **Step 3: Watch CI on the PR**

Run:

```bash
cd /home/owner/Repos/badgerskope
gh pr checks --watch
```

Expected: `Playwright (Chromium)` check completes. If green, the foundation is in. If red, fix any genuine regressions before merging.

---

## Manual follow-ups (post-merge, not plan tasks)

These need GitHub admin access and a human decision; they cannot be done from a code commit:

1. **Branch protection on `main`** — under Settings → Branches → Add rule for `main`, require status checks, add `Playwright (Chromium)` to the required list.
2. **Schedule the quarterly drift check** — `/schedule` an agent for 90 days from the merge date to walk the surfaces and verify the matrix is still current.
3. **Update workspace memory** — note that `web/app.js` and `web/features.js` are dead code; the canonical SPA entry is `web/src/main.js`. Update `reference_design_tokens.md` if it still references `web/app.js` for the `EVIDENCE_TIERS` constant.
