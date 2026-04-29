# PR I — Search input affordance + floating UI collision fix

## Scope
- Issue 11: Replace literal `/` glyph in `.lib-search-prefix` with inline SVG search icon. Preserve `/` keyboard shortcut.
- Issue 12: Bookmark bar (`.bookmarks-bar`, fixed bottom-left) and back-to-top (`.back-to-top`, fixed bottom-right) overlap on narrow viewports. Apply `max-width` to bookmark bar; ensure back-to-top stacks above on small screens.

## Files
- `web/index.html` — replace `<span class="lib-search-prefix">/</span>` with inline SVG.
- `web/app.css` — adjust `.lib-search-prefix` rule (icon now centered/sized).
- `web/features.css` — add `max-width` to `.bookmarks-bar`, raise `.back-to-top` z-index, narrow-viewport stacking media query.

## Receipts
- `web/index.html:105` — current `<span class="lib-search-prefix" aria-hidden="true">/</span>`.
- `web/app.css:254-260` — current `.lib-search-prefix` rule with mono font.
- `web/features.css:576-587` — `.bookmarks-bar` fixed bottom: 24px left: 24px (no max-width).
- `web/features.css:596-612` — `.back-to-top` fixed bottom: 24px right: 24px, z-index 50 (same as bookmarks-bar).
- `web/src/keyboard.js:46-50` — `e.key === "/"` focuses search (preserved, no change needed).

## Plan
1. Replace span with inline SVG (16x16 magnifier, currentColor stroke, no fill).
2. Update `.lib-search-prefix` CSS: drop `font-size`/`font-family` (no text content); set color via currentColor.
3. Add `max-width: calc(100vw - 96px)` to `.bookmarks-bar`; truncate label overflow if needed.
4. At ≤480px, stack bookmarks-bar above back-to-top: e.g. bookmarks-bar `bottom: 80px` so they don't share a row.
5. Bump `.back-to-top` z-index to 51 to beat `.bookmarks-bar`.
6. Playwright smoke at 1440x900, 768x1024, 390x844, 320x568.
7. Add Chromium tests: SVG present in DOM; `/` keypress focuses input.

## Verification
- baseline test count = 312 (Chromium suite, 3 projects after PR F/C/G merged into main)
- after PR I = 324 (delta +12, all four PR I tests × 3 chromium projects)
- run `CI=1 npx playwright test --project=chrome --project=chrome-iphone --project=chrome-ipad`

## Notes / deferred
- The shared `:5173` port is sometimes held by `serve` instances from other
  worktrees on the same machine. When that happens, Playwright's
  `reuseExistingServer` flag causes tests to load HTML from the wrong tree.
  Run with `CI=1` to force a fresh server, or kill stale `serve` processes
  before invoking tests.
