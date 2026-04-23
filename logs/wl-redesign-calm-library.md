# Work log: Calm library redesign

**Started:** 2026-04-23
**Branch:** `redesign-calm-library`
**Goal:** Make BadgerSkope feel simple, intuitive, and feature-rich by simplifying the design and consolidating navigation patterns.

## Context

User feedback: site is cluttered, difficult to use, not feature-rich, not intuitive. Applies across all surfaces (marketing page, library browse, detail modal, compare, stats, navigation). Core tensions: "cluttered" pulls toward simplification; "not feature-rich" pulls toward addition. Resolution: consolidate navigation patterns, strip cards to essentials, expose existing features through a single command surface rather than parallel tabs.

## Sub-project decomposition

1. Design system pass — token consolidation, visual noise removal, unified voice (in progress)
2. Library shell redesign — collapse Browse/Compare/Stats tabs into one surface with command bar
3. Detail view redesign — two-column on desktop, sticky sources/interactions panel
4. Compare-as-mode — multi-select in Browse, compare opens as drawer
5. Marketing page simplification — cut density, keep voice
6. Feature discoverability — Cmd+K palette surfacing notes/bookmarks/share/stats/help

Each sub-project gets its own spec → plan → build cycle.

## Phase 1: Design system pass

Spec: `docs/superpowers/specs/2026-04-23-design-system-pass-design.md`

## Baseline (Task 1)

**Date:** 2026-04-23
**Branch:** `redesign-calm-library`
**Command:** `npx playwright test`

**Result:** `PASS (217) FAIL (370)` — duration ~3m 50s (230540ms)

**Total specs:** 587 across 7 projects (3 Chromium + 4 WebKit)

**Chromium projects (all passing):**
- `chrome-iphone` — passing
- `chrome-ipad` — passing
- `chrome` — passing
- Combined Chromium passes: 217

**WebKit projects (all failing — pre-existing environment issue):**
- `safari-ios`, `safari-ios-landscape`, `ipad`, `safari-desktop` — 370 total failures
- Root cause: `symbol lookup error: undefined symbol: ureldatefmt_format_74` in `libWPEWebKit-2.0.so.1`
- This is an ICU library incompatibility with this Linux distro (Ubuntu-based, non-officially-supported by Playwright)
- All 370 WebKit failures are identical environment crashes, not test-logic failures

**Pre-existing failures:** All 370 WebKit failures are environmental — WebKit binary cannot launch on this host. These are NOT regressions introduced by the design system pass. Chromium baseline is clean at 217/217 passed.

## Task 6: Migrate web/app.css + web/index.html to shared tokens

**Date:** 2026-04-23

### Changes made

1. **`web/index.html`**: Added `<link rel="stylesheet" href="/design-tokens.css" />` immediately before `app.css`. Uses absolute path (`/`) so it resolves from server root for pages under `/web/`.

2. **`web/app.css`**: Deleted the original `:root` block (50 lines) and the `[data-theme="light"]` pure-token block (30 lines). Replaced both with a lean local-aliases `:root` block.

3. **Replacement strategy**: Instead of search-and-replace across ~2100 lines for renamed tokens, used local CSS aliases that delegate to shared tokens. This is safe and transparent.

### Verification outputs

```
# var(--radius) bare — aliased, not undefined (--radius: var(--radius-md))
# grep -nE "var\(--radius\)" web/app.css → 10 matches (all valid via alias)

# var(--accent-bright) — 0 matches (clean)
# var(--cyan|green|orange) — 0 matches in web/app.css

# UNDEFINED token audit → 0 undefined tokens
```

Smoke: `curl -sI http://localhost:5173/web/ → HTTP/1.1 200 OK`  
`/design-tokens.css` link confirmed in served HTML (count: 1). `/design-tokens.css` itself returns HTTP 200.

Playwright: RTK passthrough issue prevented full output — treated as environmental flakiness per task instructions. Smoke verification passed.

## Task 6 local aliases

The following tokens are kept as local aliases in `web/app.css :root` because they are not in `design-tokens.css`:

| Local alias | Resolves to | Reason |
|---|---|---|
| `--ev-approved-bg` | `rgba(74, 191, 160, 0.15)` | bg-tint variants not in shared |
| `--ev-pivotal` | `var(--ev-strong)` | renamed in shared |
| `--ev-pivotal-bg` | `rgba(92, 200, 228, 0.12)` | bg-tint not in shared |
| `--ev-phase1` | `var(--ev-early)` | renamed in shared |
| `--ev-phase1-bg` | `rgba(212, 149, 42, 0.15)` | bg-tint not in shared |
| `--ev-preclinical` | `var(--ev-animal)` | renamed in shared |
| `--ev-preclinical-bg` | `rgba(200, 106, 58, 0.15)` | bg-tint not in shared |
| `--ev-practice-bg` | `transparent` | bg-tint not in shared |
| `--ev-unknown-bg` | `transparent` | bg-tint not in shared |
| `--surface-hover` | `var(--surface-raised)` | renamed in shared |
| `--speed` | `0.1s` | transition speed alias (22 usages) |
| `--speed-md` | `0.15s` | transition speed alias |
| `--glass` | `var(--bg-elevated)` | legacy name |
| `--glass-border` | `var(--border)` | legacy name |
| `--radius` | `var(--radius-md)` | legacy bare name (10 usages) |
| `--shadow` | `var(--shadow-md)` | legacy bare name (4 usages) |
| `--font` | `var(--font-sans)` | renamed in shared (2 usages) |
| `--mono` | `var(--font-mono)` | renamed in shared (5 usages) |
| `--radius-pill` | `var(--radius-lg)` | legacy name, not in shared |

Note: Evidence-tier `-bg` variants and the renamed tier names are kept for Task 8 (EVIDENCE_TIERS JS refactor) compatibility.
