# E2E Test Plan — design

**Date**: 2026-05-02
**Status**: Draft for review (revision 2 — trimmed after shipped-surface audit)
**Author**: jlambert229 (with Claude)

---

## 1. Purpose & scope

Single document with two functions:

1. **Coverage matrix** — every shippable feature across all four user-facing surfaces, each with a coverage status (`covered` / `partial` / `gap` / `out-of-scope`) and a pointer to the spec file (or `—`) that proves it.
2. **Scenario spec** — for every row, a one-line description of what an E2E test must assert. Sufficient detail to write a test from, without duplicating selectors or pseudo-code.

**Surfaces in scope**:
- `index.html` — marketing landing
- `web/` — library SPA (entry: `web/src/main.js`)
- `glossary.html` — glossary reference
- `evidence-guide.html` — evidence methodology reference

**Out of scope** (rows tagged `out-of-scope` rather than `gap`):
- Visual regression (no baseline snapshots maintained)
- Performance budgets and CLS metrics
- Backend / data ingestion (no backend; data is a static JSON file)
- No-JS fallbacks (the SPA and marketing surfaces both require JS for primary behavior)

**Status disclaimer (revision 2)**: covered/partial markings are *presumed* based on spec filename and feature mapping, not verified by reading every assertion. A verification pass is queued in the writing-plans backlog. Treat day-one statuses as directional, not authoritative.

---

## 2. Conventions

### Test types

| Type | Meaning |
|------|---------|
| `happy` | A typical user flow succeeds, or a structural/visual property holds |
| `failure` | A specific failure mode is handled gracefully (offline, empty data, invalid input) |
| `a11y` | Keyboard nav, screen-reader semantics, focus management, ARIA correctness |
| `invariant` | Data guarantees only (`peptide-info-database.json` shape, no duplicate IDs, every entry has a tier). Brand/structural assertions use `happy`. |

### Status taxonomy

| Status | Meaning |
|--------|---------|
| `covered` | At least one assertion in an existing spec maps directly to this row's scenario (presumed; pending verification pass) |
| `partial` | Scenario is partly covered (e.g., presence asserted but behavior isn't) |
| `gap` | No existing assertion covers this row; future test obligation |
| `out-of-scope` | Intentionally not covered — explained in the row's notes column or section 1's exclusions |

### Viewport defaults (per surface)

| Surface | Default viewport | Why |
|---------|------------------|-----|
| Marketing (`index.html`) | `chrome-iphone` (mobile) | Recent investment (PRs #70-#79) is mobile-focused; matches where existing specs live |
| Library SPA (`web/`) | `chrome-iphone` (mobile) | Interaction-heavy; mobile is primary use mode |
| Glossary (`glossary.html`) | `chrome-iphone` (mobile) | Long-form reference content read on phone |
| Evidence Guide (`evidence-guide.html`) | `chrome-iphone` (mobile) | Same as Glossary |

Promote a row to multi-viewport (`mobile+desktop`, `mobile+ipad+desktop`) only when the feature genuinely behaves differently per viewport (e.g., the mobile filter sheet is a ≤768px-only behavior).

### Row schema

Each row represents one independent test obligation — narrow enough that a single `test()` block could prove it. If two assertions naturally live in the same `test()`, they are one row.

| Column | Notes |
|--------|-------|
| `ID` | `<SURFACE>-<capability-slug>-<NNN>`. Stable identifier for cross-references. |
| `Scenario` | One-liner. GWT format only when the scenario has genuine multi-step interaction. |
| `Type` | `happy` / `failure` / `a11y` / `invariant` |
| `Viewport` | Default per-surface unless feature is viewport-sensitive |
| `Spec file` | Relative path to existing test, or `—` |
| `Status` | `covered` / `partial` / `gap` / `out-of-scope` |

### Surface prefixes

- `MKT` — Marketing (`index.html`)
- `LIB` — Library SPA (`web/`)
- `GLO` — Glossary (`glossary.html`)
- `EVD` — Evidence Guide (`evidence-guide.html`)

---

## 3. Master matrix

### Counts (initial inventory, 2026-05-02)

| Surface | covered | partial | gap | out-of-scope | total |
|---------|--------:|--------:|----:|-------------:|------:|
| Marketing (MKT) | 15 | 14 | 11 | 2 | 42 |
| Library SPA (LIB) | 20 | 23 | 63 | 0 | 106 |
| Glossary (GLO) | 0 | 0 | 15 | 0 | 15 |
| Evidence Guide (EVD) | 0 | 1 | 14 | 0 | 15 |
| **Total** | **35** | **38** | **103** | **2** | **178** |

> Counts update after each PR that flips a row. Glossary and Evidence Guide are nearly 100% gap — largest concentration relative to surface complexity.

### Reading the matrix

To find gaps quickly: search this file for `| gap |`. To find a feature: search for surface prefix + slug (e.g., `LIB-search-`). To find out-of-scope rows: search `| out-of-scope |`.

---

## 4. Marketing (`index.html`)

The marketing landing page. Static content with progressive enhancements (FAQ disclosure, ticker, anchor card, subscribe form).

**Default viewport**: `chrome-iphone` (mobile).

### 4.1 Page bootstrap

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-bootstrap-001 | Page returns 200, `<main>` renders, all declared section IDs (`hero-h1`, `anchor-card`, `problem`, `method`, `legend`, `library`, `receipts`, `faq`, `subscribe`) present | happy | mobile | — | gap |
| MKT-bootstrap-002 | No console errors on initial load | failure | mobile | — | gap |
| MKT-bootstrap-003 | Page renders without JS | happy | mobile | — | out-of-scope |

### 4.2 Hero

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-hero-001 | "EVIDENCE > HYPE" wordmark + inline-SVG `>` chevron render above the fold | happy | mobile+desktop | — | gap |
| MKT-hero-002 | Hero CTA links resolve to in-page anchors | happy | mobile | — | gap |
| MKT-hero-003 | Heading uses Oswald display font | happy | mobile | — | gap |
| MKT-hero-004 | Hero respects per-viewport spacing budget at 390px | happy | mobile | `tests/mobile-spacing-pass.spec.js` | covered |

### 4.3 Anchor card

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-anchor-001 | Anchor card displays a representative peptide name | happy | mobile | `tests/marketing-cohesion.spec.js` | covered |
| MKT-anchor-002 | Card uses brutalist editorial styling (no rounded corners) | happy | mobile | — | gap |
| MKT-anchor-003 | Redaction affordance + claim hierarchy render | happy | mobile | — | gap |

### 4.4 Problem + Method + Legend sections

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-content-001 | Problem, Method, and Legend sections render with headings and body copy | happy | mobile | `tests/marketing-cohesion.spec.js` | partial |
| MKT-content-002 | Method scroll trigger fires when section enters viewport | happy | mobile | — | gap |
| MKT-content-003 | Evidence-tier legend rows render in canonical order with token-derived colors | happy | mobile | `tests/tier-colors.spec.js` | partial |
| MKT-content-004 | Spacing budgets at 390px hold for problem/method/legend | happy | mobile | — | gap |

### 4.5 Library preview

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-library-001 | `library-rows` populates with example rows; `library-count` shows non-zero integer | happy | mobile | — | gap |
| MKT-library-002 | "Open library" CTA links to `web/` | happy | mobile | — | gap |
| MKT-library-003 | Tier badges in preview match `--tier-*` token colors | happy | mobile | `tests/tier-colors.spec.js` | partial |
| MKT-library-004 | Library preview header layout at 390px | happy | mobile | `tests/mobile-spacing-pass.spec.js` | partial |

### 4.6 Receipts / Ticker

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-receipts-001 | `ticker-track` renders with content and animates continuously | happy | mobile | — | gap |
| MKT-receipts-002 | Ticker pauses on hover/focus | a11y | desktop | — | gap |
| MKT-receipts-003 | Ticker animation runs without layout shift | happy | mobile | — | out-of-scope |

### 4.7 FAQ

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-faq-001 | All five FAQ entries (`faq-answer-01`–`05`) render | happy | mobile | — | gap |
| MKT-faq-002 | FAQ disclosure toggles answers on click + keyboard | a11y | mobile | — | gap |
| MKT-faq-003 | FAQ uses semantic `<details>`/`<summary>` or proper ARIA | a11y | mobile | — | gap |
| MKT-faq-004 | FAQ spacing budget at 390px | happy | mobile | `tests/mobile-spacing-pass.spec.js` | covered |

### 4.8 Subscribe form

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-subscribe-001 | Subscribe form renders with `sub-email` input typed `email` and required | happy | mobile | — | gap |
| MKT-subscribe-002 | Submit shows success state for valid email | happy | mobile | — | gap |
| MKT-subscribe-003 | Submit shows error for invalid email | failure | mobile | — | gap |
| MKT-subscribe-004 | Submit button has accessible label | a11y | mobile | — | gap |

### 4.9 Site nav + CTAs

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-nav-001 | `site-nav` renders with logo and primary CTAs | happy | mobile+desktop | — | gap |
| MKT-nav-002 | "Open library" CTA visible at all supported viewports ≥390px | happy | mobile+ipad+desktop | — | gap |
| MKT-nav-003 | "Subscribe" CTA hidden at ≤700px (per PR #79) | happy | mobile | — | gap |
| MKT-nav-004 | Nav-cta-group hidden entirely at ≤380px (iPhone SE) | happy | mobile | — | gap |
| MKT-nav-005 | Nav doesn't horizontally overflow viewport at 375/390/430px | happy | mobile | — | gap |
| MKT-nav-006 | Nav landmark has accessible label | a11y | mobile | — | gap |

### 4.10 Footer

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-footer-001 | Mega-wordmark renders in footer (per brand v2) | happy | mobile+desktop | — | gap |
| MKT-footer-002 | Footer secondary links resolve | happy | mobile | — | gap |
| MKT-footer-003 | Footer integrity (no broken layout) at all viewports | happy | mobile+desktop | — | gap |

### 4.11 Brand integrity (cross-cutting)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| MKT-brand-001 | No rounded corners on marketing surface elements | happy | mobile | — | gap |
| MKT-brand-002 | Olive accent `#C8D17A` applied via `--accent` token (not hardcoded) | happy | mobile | — | gap |
| MKT-brand-003 | Film grain overlay element present (load-bearing per brand spec) | happy | mobile | — | gap |
| MKT-brand-004 | Oswald, Inter, JetBrains Mono fonts loaded | happy | mobile | — | gap |

---

## 5. Library SPA (`web/`)

The interactive peptide library. ES-module SPA entered at `web/src/main.js`, with feature modules under `web/src/features/`.

**Note (revision 2)**: legacy `web/app.js` and `web/features.js` are not loaded by `web/index.html`; they are dead code. Rows below correspond to behaviors actually shipping via `web/src/`.

**Default viewport**: `chrome-iphone` (mobile).

### 5.1 App bootstrap

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-bootstrap-001 | App loads, `lib-status` reaches "ready", initial library data renders ≥1 entry | happy | mobile | `tests/app-loads.spec.js` | partial |
| LIB-bootstrap-002 | `load-error` renders when data fetch fails | failure | mobile | — | gap |
| LIB-bootstrap-003 | No console errors on initial load | failure | mobile | — | gap |
| LIB-bootstrap-004 | Service worker (`sw.js`) registers successfully | happy | mobile | `tests/offline-pwa.spec.js` | covered |

### 5.2 Tab navigation (Browse / Stats / Compare)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-tabs-001 | `tab-browse` is active by default; switching to `tab-stats` swaps panels | happy | mobile | — | gap |
| LIB-tabs-002 | Tab keyboard navigation (arrow keys, Home/End) and ARIA roles correct | a11y | mobile | `tests/accessibility.spec.js` | partial |
| LIB-tabs-003 | Tab state persists in URL hash (per `router.js`) and across reload | happy | mobile | `tests/navigation-state.spec.js` | partial |

### 5.3 Search

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-search-001 | Typing in `search` filters grid; matches against compound name, themes, and compound type | happy | mobile | — | gap |
| LIB-search-002 | Empty search shows full library; no-match query shows empty state | happy | mobile | `tests/library-default-state.spec.js` | partial |
| LIB-search-003 | Search debounces (no thrashing on fast typing) | happy | mobile | — | gap |
| LIB-search-004 | Search prefix SVG icon renders (per PR I) | happy | mobile | `tests/pr-i-search-floating.spec.js` | covered |
| LIB-search-005 | Search input has accessible label | a11y | mobile | `tests/accessibility.spec.js` | covered |
| LIB-search-006 | Autocomplete dropdown suggests entries (`features/search-enhance.js`) | happy | mobile | — | gap |
| LIB-search-007 | Search highlighting visually marks matched substrings | happy | mobile | — | gap |

### 5.4 Filter strip / chips (desktop)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-filter-001 | Filter strip renders evidence-tier toggles, compound-type chips, sport-ban toggle | happy | desktop | — | gap |
| LIB-filter-002 | Each filter type narrows results; multiple filters compose with AND semantics | happy | desktop | — | gap |
| LIB-filter-003 | Active filters render in `active-filters` summary; `reset-filters` clears all | happy | mobile+desktop | `tests/library-default-state.spec.js` | covered |
| LIB-filter-004 | Default-state chips render when no filter applied | happy | mobile+desktop | `tests/library-default-state.spec.js` | covered |
| LIB-filter-005 | Chip touch target ≥37px height at mobile (per PR #79) | a11y | mobile | — | gap |
| LIB-filter-006 | Clickable category chips on cards filter the grid (`features/chips.js`) | happy | mobile | — | gap |
| LIB-filter-007 | Chips are keyboard-operable | a11y | desktop | — | gap |

### 5.5 Mobile filter sheet

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-msheet-001 | `mobile-filter-trigger` visible at ≤768px and hidden above | happy | mobile+ipad+desktop | `tests/library-mobile-filter-sheet.spec.js` | covered |
| LIB-msheet-002 | Tapping trigger opens sheet with backdrop and reparented filter controls | happy | mobile | `tests/library-mobile-filter-sheet.spec.js` | covered |
| LIB-msheet-003 | Apply commits pending filters and closes; Reset clears pending; Done closes without applying | happy | mobile | `tests/library-mobile-filter-sheet.spec.js` | partial |
| LIB-msheet-004 | `mobile-filter-count` badge shows pending filter count | happy | mobile | `tests/library-mobile-filter-sheet.spec.js` | partial |
| LIB-msheet-005 | Backdrop click and Escape key close the sheet | happy | mobile | `tests/library-mobile-filter-sheet.spec.js` | partial |
| LIB-msheet-006 | Sheet traps focus and returns focus to trigger on close | a11y | mobile | — | gap |
| LIB-msheet-007 | Sheet dismisses when viewport widens past 768px | happy | mobile+ipad+desktop | — | gap |

### 5.6 Sort + Group-by

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-sort-001 | `sort` control reorders grid (alphabetical, evidence tier, compound type) | happy | mobile | — | gap |
| LIB-sort-002 | `group-by` adds section headers in canonical order (theme, evidence, type) | happy | mobile | — | gap |

### 5.7 Library grid (browse list)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-grid-001 | Grid renders one row per entry showing name, evidence tier, arrow | happy | mobile | — | gap |
| LIB-grid-002 | Mobile grid uses 3-column layout (name / tier / arrow) | happy | mobile | `tests/mobile-spacing-pass.spec.js` | partial |
| LIB-grid-003 | Desktop grid shows full column set; iPad hides cols 4 and 7 | happy | desktop+ipad | — | gap |
| LIB-grid-004 | Inline column labels render at narrow viewports | a11y | mobile | `tests/library-responsive-labels.spec.js` | covered |
| LIB-grid-005 | Tier badge color matches `--tier-*` token | happy | mobile | `tests/tier-colors.spec.js` | partial |
| LIB-grid-006 | Library dedupes by base compound | happy | mobile | `tests/library-dedupe.spec.js` | covered |
| LIB-grid-007 | `result-count` and `row-count` reflect filtered list size | happy | mobile | — | gap |
| LIB-grid-008 | Card key navigation (arrow keys move focus) | a11y | desktop | `tests/accessibility.spec.js` | partial |
| LIB-grid-009 | WADA-banned compounds show doping indicator (`features/doping.js`) | happy | mobile | — | gap |
| LIB-grid-010 | Read-state indicator shows for previously viewed entries (`features/scroll.js` read tracker) | happy | mobile | — | gap |

### 5.8 Detail modal

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-detail-001 | Tapping a row opens `detail-dialog`; `detail-body` populates with entry content | happy | mobile | `tests/ios-detail-modal.spec.js` | covered |
| LIB-detail-002 | Header shows name, tier badge, themes; body shows summary, sources, schema disclaimers | happy | mobile | — | gap |
| LIB-detail-003 | `detail-close`, backdrop click, and Escape all close modal | happy+a11y | mobile | `tests/ios-detail-modal.spec.js` | partial |
| LIB-detail-004 | `detail-prev` / `detail-next` navigate to adjacent entry; `detail-nav-pos` shows "X of Y" | happy | mobile | — | gap |
| LIB-detail-005 | Modal traps focus while open and returns focus to trigger on close | a11y | mobile | `tests/accessibility.spec.js` | partial |
| LIB-detail-006 | Swipe nav works on mobile (touch gestures) | happy | mobile | — | gap |
| LIB-detail-007 | Modal scroll-locks the page body | happy | mobile | — | gap |
| LIB-detail-008 | Modal renders without iOS-specific layout bugs | failure | mobile | `tests/ios-css-issues.spec.js` | partial |

### 5.9 Notes (per-entry)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-notes-001 | Notes textarea renders inside detail modal (`features/notes.js`) | happy | mobile | — | gap |
| LIB-notes-002 | Typing a note persists to localStorage scoped per entry | happy | mobile | — | gap |
| LIB-notes-003 | Notes survive page reload | happy | mobile | — | gap |
| LIB-notes-004 | Notes textarea has accessible label | a11y | mobile | — | gap |

### 5.10 Bookmarks

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-bookmark-001 | Bookmark toggle on each row adds/removes entry (`features/bookmarks-toggle.js`) | happy | mobile | — | gap |
| LIB-bookmark-002 | `bookmarks-bar` and `bookmarks-count` reflect bookmark state and persist via localStorage | happy | mobile | — | gap |
| LIB-bookmark-003 | "Bookmarked only" filter checkbox narrows browse + selection toolbar | happy | mobile | — | gap |
| LIB-bookmark-004 | Removing the last bookmark hides the bar | happy | mobile | — | gap |
| LIB-bookmark-005 | Bookmark bar has accessible label | a11y | mobile | — | gap |

### 5.11 Stats dashboard

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-stats-001 | Switching to Stats tab renders `stats-dashboard` with total + breakdowns | happy | mobile | — | gap |
| LIB-stats-002 | Breakdowns by compound type, evidence tier, category, and theme each populate | happy | mobile | — | gap |
| LIB-stats-003 | Stats reflect current filter state (or document otherwise) | happy | mobile | — | gap |

### 5.12 Comparison (compare table)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-compare-001 | Selecting ≥2 entries shows the selection toolbar with "Compare" CTA | happy | desktop | — | gap |
| LIB-compare-002 | Comparison table renders with selected entries as columns | happy | desktop | — | gap |
| LIB-compare-003 | Comparison rows include name, tier, type, themes, evidence basis | happy | desktop | — | gap |
| LIB-compare-004 | Clearing selection dismisses the comparison table | happy | desktop | — | gap |

### 5.13 Selection toolbar

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-select-001 | Selecting an entry surfaces the selection toolbar with count | happy | desktop | — | gap |
| LIB-select-002 | Toolbar offers Compare and Clear actions | happy | desktop | — | gap |
| LIB-select-003 | Selection persists across filter changes (or documents reset behavior) | happy | desktop | — | gap |

### 5.14 URL routing / deep links (`router.js`)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-router-001 | Filter state writes to URL hash (search, filters, sort, group, tab) | happy | mobile | — | gap |
| LIB-router-002 | Loading with filter hash restores filter state on render | happy | mobile | — | gap |
| LIB-router-003 | Deep-linking to an entry by title opens the detail modal | happy | mobile | — | gap |
| LIB-router-004 | History entries don't pollute the back button (uses `replaceState`) | happy | mobile | — | gap |

### 5.15 Help dialog + keyboard shortcuts

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-help-001 | `open-help` (desktop) and `open-help-mobile` open `help-dialog` | happy | mobile+desktop | — | gap |
| LIB-help-002 | `help-close` and Escape close the dialog | a11y | mobile | — | gap |
| LIB-shortcuts-001 | `?` keypress opens `shortcuts-dialog`; all advertised shortcuts render | a11y | desktop | — | gap |

### 5.16 Theme (light/dark)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-theme-001 | Theme toggle switches modes; preference persists across reload | happy | desktop | — | gap |
| LIB-theme-002 | Auto-theme respects `prefers-color-scheme` on first visit | happy | desktop | — | gap |
| LIB-theme-003 | Tier colors remain WCAG-passing in both themes | a11y | desktop | — | gap |

### 5.17 Evidence tier visual system

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-tier-001 | Each tier (E1–E4) has distinct accent color sourced from `--tier-*` CSS vars (no JS hardcoding) | happy | mobile | `tests/tier-colors.spec.js` | covered |
| LIB-tier-002 | Tier badges render with consistent label format | happy | mobile | — | gap |

### 5.18 Offline / PWA

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-offline-001 | Service worker registers on first visit | happy | mobile | `tests/offline-pwa.spec.js` | covered |
| LIB-offline-002 | Page and library data load from cache when offline | failure | mobile | `tests/offline-pwa.spec.js` | covered |
| LIB-offline-003 | App is installable as PWA (manifest + icons) | happy | mobile | — | gap |
| LIB-offline-004 | Offline indicator visible to user | failure | mobile | — | gap |

### 5.19 Sharing & print (`features/share.js`)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-share-001 | Share button renders inside detail modal and generates a deep link to the entry | happy | mobile | — | gap |
| LIB-share-002 | Deep link reopens the modal on the correct entry | happy | mobile | — | gap |
| LIB-share-003 | Print button opens print preview with detail-modal content | happy | desktop | — | gap |

### 5.20 Glossary tooltips (`features/glossary-tooltips.js`)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-gtt-001 | Glossary terms inside detail prose render with tooltip affordance | happy | desktop | — | gap |
| LIB-gtt-002 | Hover/tap shows the glossary definition inline | happy | mobile+desktop | — | gap |
| LIB-gtt-003 | Tooltip is keyboard-accessible | a11y | desktop | — | gap |

### 5.21 Interaction checker (`features/interactions.js`)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-interaction-001 | Detail modal highlights bookmarked compounds that overlap the current entry by mechanism or category | happy | mobile | — | gap |
| LIB-interaction-002 | Empty bookmark set results in no highlights (no false positives) | failure | mobile | — | gap |

### 5.22 Experimental toggle (`features/experimental-toggle.js`)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-exp-001 | "Show experimental" checkbox controls visibility of entries lacking side-effect data | happy | desktop | — | gap |
| LIB-exp-002 | Toggle state persists across visits via localStorage | happy | mobile | — | gap |

### 5.23 Sport-ban filter (`features/sport-filter.js`)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-sport-001 | Sport-ban checkbox in toolbar hides WADA-banned compounds | happy | desktop | — | gap |
| LIB-sport-002 | Doping indicators on remaining cards still render correctly | happy | mobile | — | gap |

### 5.24 Start-here picker (`features/start-here.js`)

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-starthere-001 | "Most looked-up compounds" picker renders with curated entries | happy | mobile | — | gap |
| LIB-starthere-002 | Picker uses brand voice (mono uppercase labels, accent border) | happy | mobile | — | gap |

### 5.25 Auxiliary chrome

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-chrome-001 | `back-to-top` appears after scroll threshold and scrolls to top | happy | mobile | — | gap |
| LIB-chrome-002 | Floating UI (back-to-top + bookmark bar) doesn't collide | happy | mobile | `tests/pr-i-search-floating.spec.js` | covered |
| LIB-chrome-003 | Scroll progress bar tracks position (`features/scroll.js`) | happy | mobile | — | gap |
| LIB-chrome-004 | `footer-meta` renders with site metadata | happy | mobile | — | gap |
| LIB-chrome-005 | Site nav landmark has accessible label | a11y | mobile | — | gap |

### 5.26 Data invariants

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| LIB-data-001 | `peptide-info-database.json` parses and every entry has unique `id` and ≥1 evidence tier | invariant | mobile | `tests/data-integrity.spec.js` | partial |
| LIB-data-002 | Every source URL is well-formed | invariant | mobile | `tests/data-integrity.spec.js` | partial |
| LIB-data-003 | WADA-flagged entries declare the flag explicitly | invariant | mobile | — | gap |
| LIB-data-004 | Schema/legend disclaimers present on entries that need them | invariant | mobile | — | gap |

---

## 6. Glossary (`glossary.html`)

Reference page listing terms with letter navigation and search.

**Default viewport**: `chrome-iphone` (mobile).

### 6.1 Page bootstrap

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| GLO-bootstrap-001 | Page returns 200, `<main id="main">` renders, `glossary-container` populates with terms | happy | mobile | — | gap |
| GLO-bootstrap-002 | No console errors on initial load | failure | mobile | — | gap |
| GLO-bootstrap-003 | Site nav consistent with marketing/library | happy | mobile | — | gap |

### 6.2 Letter navigation

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| GLO-letter-001 | `letter-nav` renders A–Z links; tapping scrolls to that section | happy | mobile | — | gap |
| GLO-letter-002 | Letters with no entries are visually deprioritized | happy | mobile | — | gap |
| GLO-letter-003 | Letter nav is keyboard-operable | a11y | desktop | — | gap |

### 6.3 Search

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| GLO-search-001 | `glossary-search` filters terms; `search-count` reflects result count; `no-results` panel shows on empty match | happy | mobile | — | gap |
| GLO-search-002 | Empty search restores full glossary | happy | mobile | — | gap |
| GLO-search-003 | Search input has accessible label | a11y | mobile | — | gap |

### 6.4 Term entries

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| GLO-term-001 | Each term renders with name + definition; anchors are unique and navigable | happy | mobile | — | gap |
| GLO-term-002 | Definitions render in plain English (no jargon-only) | happy | mobile | — | gap |
| GLO-term-003 | Heading hierarchy is semantic | a11y | mobile | — | gap |

### 6.5 Brand integrity

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| GLO-brand-001 | No rounded corners; olive accent applied via token; brand fonts loaded | happy | mobile | — | gap |
| GLO-brand-002 | Glossary tooltips on terms (cross-linked from library SPA) render correctly when navigated from a deep link | happy | mobile | — | gap |
| GLO-brand-003 | Footer + site nav match other surfaces | happy | mobile | — | gap |

---

## 7. Evidence Guide (`evidence-guide.html`)

Reference page explaining evidence tiers, methodology, and disclaimers.

**Default viewport**: `chrome-iphone` (mobile).

### 7.1 Page bootstrap

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| EVD-bootstrap-001 | Page returns 200, `<main id="main">` renders, all declared section IDs (`basics`, `tiers`, `flags`, `scope`, `verify`, `vial-verification`, `disclaimer`, `education-only`, `summaries-not-instructions`) present | happy | mobile | — | gap |
| EVD-bootstrap-002 | No console errors on initial load | failure | mobile | — | gap |
| EVD-bootstrap-003 | Site nav consistent with other surfaces | happy | mobile | — | gap |

### 7.2 Tier definitions

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| EVD-tiers-001 | All four tiers (E1–E4) defined with examples; tier order canonical (descending strength) | happy | mobile | — | gap |
| EVD-tiers-002 | Tier badge colors match `--tier-*` tokens | happy | mobile | — | gap |
| EVD-tiers-003 | Tier definitions use plain English | happy | mobile | — | gap |

### 7.3 Methodology sections

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| EVD-method-001 | `basics` and `scope` sections explain framework and what's in scope | happy | mobile | — | gap |
| EVD-method-002 | `summaries-not-instructions` explains editorial stance | happy | mobile | — | gap |
| EVD-method-003 | `verify` and `vial-verification` cover source/vial verification expectations | happy | mobile | — | gap |

### 7.4 Disclaimers & flags

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| EVD-disclaim-001 | `disclaimer` block visible without scrolling on mobile | happy | mobile | — | gap |
| EVD-disclaim-002 | `education-only` block disclaims medical advice | happy | mobile | — | gap |
| EVD-disclaim-003 | `flags` section explains WADA / sport-ban flags | happy | mobile | — | gap |

### 7.5 Brand integrity

| ID | Scenario | Type | Viewport | Spec file | Status |
|----|----------|------|----------|-----------|--------|
| EVD-brand-001 | No rounded corners; olive accent via token; brand fonts loaded | happy | mobile | — | gap |
| EVD-brand-002 | Footer + site nav match other surfaces | happy | mobile | — | gap |
| EVD-brand-003 | Cross-links from Library SPA detail modal land at correct in-page anchors | happy | mobile | — | gap |

---

## 8. Regression Guards (appendix)

A spec is a **regression guard** (not a feature spec) when its `describe()` title or filename references a specific PR number, commit, or past incident, and its primary purpose is preventing recurrence rather than asserting feature semantics. Listed flat so they're visible without polluting the matrix.

### Mobile spacing pass — homepage at 390px

- **Spec file**: `tests/mobile-spacing-pass.spec.js`
- **PR**: #78 + #79
- **Guards against**: 10+ spacing/overflow regressions on the marketing page at 390px (nav CTA overflow, hero spacing, FAQ rhythm, library preview header, chip touch targets)

### PR I — search prefix SVG icon + floating UI collision

- **Spec file**: `tests/pr-i-search-floating.spec.js`
- **PR**: PR I (pre-mobile-pass)
- **Guards against**: search icon disappearing when input refactored; bookmark bar overlapping back-to-top button

### PR F — token + tactile polish

- **Spec file**: `tests/pr-f-token-polish.spec.js`
- **PR**: PR F (pre-mobile-pass)
- **Guards against**: hardcoded hex colors creeping back into marketing components; loss of brutalist square corners from token regressions

### Library — dedupe by base compound

- **Spec file**: `tests/library-dedupe.spec.js`
- **PR**: (pre-redesign)
- **Guards against**: duplicate rows for variants of the same base compound

### Library — default populated state (PR D)

- **Spec file**: `tests/library-default-state.spec.js`
- **PR**: PR D
- **Guards against**: empty grid state showing on first load when no filters applied

---

## 9. CI & automation

### Browser baseline

- **Required (PR-blocking)**: Chromium projects only — `chrome`, `chrome-iphone`, `chrome-ipad`. WebKit projects skipped via `PLAYWRIGHT_WEBKIT=0`.
- **Why**: WebKit fails environmentally on the dev Linux host with bundled WPEWebKit (ICU mismatch). Chromium is the canonical baseline.
- **Informational**: WebKit runs separately on schedule + manual dispatch. Promote to required if it consistently passes on GitHub's runners.

### Workflows

Two workflow files in `.github/workflows/`:

**`test.yml`** — required PR check
- Triggers: `pull_request` to `main`, `push` to `main`, `workflow_dispatch`
- Job name: `Playwright (Chromium)` — wire this into branch protection
- Runs `npx playwright test --reporter=github,html` with `PLAYWRIGHT_WEBKIT=0`
- Concurrency: cancel in-progress runs on the same ref
- Browser cache: `actions/cache@v4` keyed on Playwright version
- Artifacts: HTML report (always, 14d), `test-results/` (failure only, 14d)

**`webkit.yml`** — informational, opt-in
- Triggers: `workflow_dispatch`, weekly `schedule` (Mondays alongside `source-liveness.yml`)
- Job name: `Playwright (WebKit)`
- Runs the four WebKit projects without the skip flag
- Not required for PR merge

### Load-bearing decisions (excerpts only — `.github/workflows/test.yml` is the source of truth)

**Browser skip flag** — passes through to the gate at `playwright.config.js:31`:
```yaml
- name: Run Playwright tests
  env:
    PLAYWRIGHT_WEBKIT: "0"
  run: npx playwright test --reporter=github,html
```

**Cache key** — version-pinned so a Playwright bump invalidates browsers automatically:
```yaml
key: playwright-chromium-${{ runner.os }}-${{ steps.pw.outputs.version }}
```

**Concurrency** — superseded commits don't burn CI minutes:
```yaml
concurrency:
  group: tests-${{ github.workflow }}-${{ github.head_ref || github.ref }}
  cancel-in-progress: true
```

**Trigger set** — PR + push covers all change paths:
```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:
```

### Required status check

Once the workflow lands on `main`, configure branch protection with:
- Required check name: **`Playwright (Chromium)`**
- "Require status checks to pass before merging": yes

### Future enhancement (not committed)

A small script (`scripts/check-matrix-coverage.mjs`) could grep matrix IDs (e.g., `LIB-search-001`) embedded in `test.describe()` titles to flag drift between matrix and tests. Not in scope for the initial implementation; tracked as a stretch task in the writing-plans backlog. **Do not assume this script exists.**

---

## 10. Maintenance protocol

### Update trigger

Any PR that adds, removes, or changes a user-visible feature should update the relevant rows in this doc (status flip, new row, deleted row). There is no PR-time enforcement — the quarterly review is the backstop.

### Counts reporting

Section 3's count table reports absolute integers (`covered` / `partial` / `gap` / `out-of-scope`), not percentages. Counts are honest; percentages invite gaming.

### Quarterly drift check

No later than every 3 months, walk each surface and compare actual features in code to enumerated rows here. Add rows for new features; remove rows for deleted ones.

After this doc lands, `/schedule` an agent in 90 days to run this check.

### Coverage goal

Not a percentage. The bar is:

> Every `gap` row has either a documented reason (move to `out-of-scope`), or appears in the writing-plans backlog (planned coverage).

A `gap` is acceptable only if intentional + explained. A silent `gap` is debt.

### Verification debt (revision 2)

The current matrix marks rows `covered`/`partial` based on filename + ID heuristics, not by reading every assertion. The first task in the writing-plans backlog is a verification pass: open each spec file, confirm assertions match claimed rows, and downgrade/upgrade status accordingly.

### Style for new rows

- One row per independent test obligation (a single `test()` block could prove it).
- If two assertions naturally live in the same `test()`, they are one row.
- Use the surface prefix.
- Default to one-liner scenarios; promote to GWT only for genuine multi-step user flows.
- Cite the spec file with a relative path; use `—` if `gap` or `out-of-scope`.
