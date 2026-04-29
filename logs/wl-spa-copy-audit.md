# WL — SPA copy audit (`/web/`)

Branch: `audit/spa-copy-review`
Base: `main` @ `0ced2a3`
Date: 2026-04-29
Scope: user-facing copy in `web/index.html` and `web/src/*.js`. Out of
scope: marketing surfaces (audited in #41), entry source URLs (audited
in #44), entry source content accuracy (separate pass).

## TL;DR

Most SPA copy is accurate. The HELP modal had **four aspirational
claims** referencing features that aren't actually implemented:

| Claim | Status | Action |
|---|---|---|
| `Click REFINE for filters by …` | No `REFINE` button exists | Removed; replaced with accurate filter-strip / mobile-sheet description |
| `Hover over units (mg, mcg, IU) and acronyms (HbA1c, IGF-1, BDNF) for plain-English definitions` | No tooltip implementation | Removed |
| `"best" badges mark strongest evidence` (Compare tab) | No `card--best` / best-badge implementation | Trimmed to "Differences are highlighted side-by-side" |
| `Your last 6 viewed entries surface above the grid for quick re-access` | No recent-entries feature | Removed |

Replaced one with a freshly-accurate item:
- Added a **"Collapsible sections"** entry under READING AN ENTRY,
  reflecting the recent #48 collapsibility shipping in the detail modal.

## What was checked and found accurate

- **Filter labels** — BODY AREA / SUBSTANCE / RESEARCH / EVIDENCE
  match the live select boxes.
- **Empty-state copy** — three rotating sarcastic headlines plus a
  CLEAR ALL FILTERS action. Brand-voice consistent, one-per-session
  to avoid surprise. Working as designed.
- **Tier chip subtitles** in `constants.js` (`Regulators reviewed
  the data and said yes`, etc.) — clear, plain-language, accurate
  to what each tier means.
- **Disclaimer banner** on the library page — `Educational reference
  only — not medical advice. Read full scope →` links to
  `evidence-guide.html#scope`. Accurate.
- **Search placeholder** — `SEARCH 45 COMPOUNDS` matches the actual
  entry count (kept in sync via the soften pass).
- **Bookmarks / Notes / Share & print** copy — all backed by real
  feature modules (`bookmarks.js`, `features/notes.js`,
  `features/share.js`).
- **Sport-flag copy** — backed by `features/doping.js` with a real
  WADA_BANNED dictionary.
- **Synergy / compare-tab descriptions** — `web/src/compare.js` does
  surface `synergisticWith` data; the help text is fair.
- **Footer / shortcuts dialog** — keyboard hints (`Esc`, `←/→`, `/`,
  `?`, `h`, `b`, `f`) all match the keymap in `web/src/keyboard.js`
  (spot-checked).

## Methodology

1. Extracted user-facing strings from `web/index.html` (HELP, FAQ,
   filter labels, masthead, footer) and key `web/src/*.js` modules.
2. For each non-trivial claim, grep'd the live source for the
   feature it referenced.
3. Where the feature didn't surface, checked the rendered DOM via
   Playwright at desktop and mobile widths.

Spot-checks for "Recently viewed" turned up nothing in `cards.js`,
`main.js`, `state.js`, or `bookmarks.js`. Same for "best" badges
in `compare.js`. Same for inline glossary tooltips in any `features/`
module.

## Receipts

```
$ grep -rn "REFINE\|class.*refine" web/src/ web/index.html
  (only the HELP modal's reference to REFINE — no implementation)

$ grep -rn "card--best\|stat-best\|best evidence" web/src/
  (no matches)

$ grep -rn "recently.viewed\|recentlyViewed" web/src/
  (no matches)

$ grep -rn "data-tooltip\|hover.*glossary" web/src/
  (no matches)

$ npx playwright test --project=chrome
  139 passed / 0 failed / 2 skipped
```

## Out of scope

- **Per-entry claim accuracy** vs. cited sources — separate audit
  (`logs/wl-entry-source-accuracy.md`, future).
- **`peptide-info-database.json`** field-level copy
  (`researchSummary`, `notes`, `dosingTimingNotes`,
  `distinctiveQuality.headline`) — large surface, sample-based audit
  recommended.
- Tooltip implementation (was an aspirational claim — could be
  added as a real feature in a follow-up if there's appetite).
