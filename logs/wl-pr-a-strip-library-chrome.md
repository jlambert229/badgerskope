# PR A — Strip marketing chrome from the library page + redistribute disclaimer

## Goal

The library page at `/web/` currently presents like a marketing landing instead of a research tool. On a fresh load at 1440x900 the user sees: topnav, big black band, mid-page footer-style 4-column site directory, secondary BADGERSKOPE wordmark, a 300px "EVIDENCE > HYPE" hero, a 1300-character monospace disclaimer wall, then finally the search input — way below the fold.

The library is a research tool. Search must be near the top.

## Scope

Modify only:

- `web/index.html` — strip mid-page chrome blocks, insert one-line disclaimer banner above search.
- `web/app.css` — add styles for the new disclaimer banner; remove/clean styles only if they become orphaned and cause issues.
- `evidence-guide.html` — break the original 1300-char disclaimer into four anchor sections (`#scope`, `#vial-verification`, `#summaries-not-instructions`, `#education-only`) so the banner can deep-link to them.

Do NOT touch:

- `index.html` (root marketing landing) — its 300px "EVIDENCE > HYPE" hero is correct there.
- `web/app.js` — table rendering, default state, filter logic is PR D.
- The filter strip in `web/index.html` — PR B.
- The topnav itself.
- `design-tokens.css`, `marketing.css`.

## Baseline (evidence)

- `web/index.html` `<footer>` (lines 249-305) contains FOUR distinct chunks rendered mid-page below the panel content but above the bottom of body:
  1. `.footer-top` — secondary BADGERSKOPE wordmark + `.footer-cols` 4-column directory (LIBRARY/METHOD/ABOUT/LEGAL).
  2. `.footer-mega` — the 300px clamp-sized "EVIDENCE > HYPE" hero typographic display.
  3. `.footer-bot` — the 1300-character disclaimer paragraph (`#disclaimer`) + meta line (`#footer-meta`).
- `web/app.js` line 1547 populates `#disclaimer` with `db.disclaimer` (the wall text). Line 226-227 register both `disclaimer` and `footerMeta` element refs but with `if (els.disclaimer)` guard, so removing the `<p id="disclaimer">` is safe.
- `evidence-guide.html` already has a `#disclaimer` section (line 418) but it is conversational, not a regulatory parking spot.
- Tests: `tests/ios-viewport.spec.js:98` only excludes "footer" / "foot-h" classes from a touch-target audit — no positive assertions on the removed elements. No other test references.

## Plan

1. Delete `.footer-top` (wordmark + 4-col directory) — it duplicates topnav targets and looks like a misplaced footer. Do NOT relocate; the topnav already covers Library/Compare/Stats/Evidence/Glossary/Help.
2. Delete `.footer-mega` (the 300px "EVIDENCE > HYPE" hero) on `/web/` only.
3. Delete `<p id="disclaimer">` (the wall of text) — replace with a one-line banner above the search input, mono caps + muted color + accent-colored anchor link to `/evidence-guide.html#scope`.
4. Keep `.footer-bot-meta` (the "53 entries · v3.0 · ? shortcuts · h help" line) at the bottom of `<body>` so it stays as a quiet sentinel.
5. Add four `id`-tagged sections to `evidence-guide.html` carrying the original disclaimer content split as specified.
6. Verify with Playwright that search is above the fold at 1440x900 and Chromium pass count ≥ baseline (~217).

## Branch

`worktree-agent-a8c011adf067d9faa` (worktree off main).

## Receipts location

Smoke checks (curl + grep) and Playwright output captured below as work proceeds.
