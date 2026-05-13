# wl-multi-perspective-audit

Goal: Exhaustive evaluation of badgerskope from four perspectives:
- Mobile/frontend expert
- Design expert
- Systems expert
- Layperson first-time user, unfamiliar with peptides

Output: One categorized, prioritized fix list. Iterate until a pass yields no new fixes.

## Surfaces in scope (verified by ls)
- `/` → `index.html` (marketing landing, 733 lines)
- `/glossary.html` (587 lines)
- `/evidence-guide.html` (602 lines)
- `/web/` → `web/index.html` (library SPA, 422 lines, 17 JS modules in `web/src`)
- Assets: `marketing.css` (1349 lines), `design-tokens.css` (206 lines), `web/app.css` (52KB), `web/features.css` (24KB), `web/features/*.js` (13 modules)
- Data: `peptide-info-database.json` (149KB), `orbitrex-peptides.json` (7KB)
- Other: `web/sw.js` (service worker), `netlify.toml`, `web/app.js` + `web/features.js` (dead per memory)

## Constraints (from CLAUDE.md + memory)
- Static HTML + vanilla JS only; no build tooling required
- Brand: "EVIDENCE > HYPE", olive `#C8D17A`, Oswald + JetBrains Mono, brutalist editorial, no rounded corners
- Vendor-neutral, no commerce/dosing
- WebKit baseline failures are pre-existing ICU (ignore)
- Hard gate: branch must not be `main`. Current branch: `docs/e2e-test-plan` ✓
- `web/app.js`, `web/features.js` are dead code; canonical entry is `web/src/main.js`

## Plan
1. Inventory all surfaces by reading every HTML + key JS/CSS file
2. Boot dev server (`npm run web`), capture screenshots at 375/768/1280
3. Run four parallel persona-audit subagents on the inventoried materials
4. Compile, dedupe, prioritize fixes
5. Iterate until a pass produces zero new fixes

## Notes
- Audit is read-only; no code changes in this work log scope
