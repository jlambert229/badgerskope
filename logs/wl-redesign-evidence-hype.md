# wl-redesign-evidence-hype

## Goal

Port the `design_handoff_badgerskope_redesign/` package into the live site as the canonical brand direction ("EVIDENCE > HYPE", olive `#C8D17A`, Oswald display + JetBrains Mono data, brutalist editorial). Scope: the entire site — both the root marketing pages and the `/web/` SPA — get the new visual system.

## Context

- Branch: `redesign-evidence-hype` off `main` (after fast-forward).
- A prior brand rework (`fd1770c`) was merged then reverted (`15f638f`) on origin/main. The handoff in `design_handoff_badgerskope_redesign/` is the more-developed v2 spec built around the new logo + tagline.
- The handoff prototype is React+Babel via CDN. The site is static HTML + vanilla JS served by `npx serve`. Implementation language: static HTML / vanilla JS / plain CSS. No React introduced.

## Approach (phased)

Each phase ends with a commit and a browser smoke check before moving on.

1. **Tokens & assets** — replace `design-tokens.css` with the handoff palette/typography tokens. Wire Google Fonts (Oswald + Inter + JetBrains Mono). Copy `assets/badger-256.png`, `badger-180.png`, `lockup.png` into the repo root.
2. **Marketing landing (`index.html`)** — full rebuild from handoff: Nav, Hero (with inline-SVG `>` chevron), Ticker, ProblemStrip, Method, GradeLegend, Library, FeatureFile, FAQ, Subscribe, Footer with mega-wordmark. Vanilla-JS micro-interactions (scroll-state nav, FAQ accordion, library filter, subscribe form). `marketing.css` replaced wholesale.
3. **Static content pages (`evidence-guide.html`, `glossary.html`)** — apply the new design system to existing copy: section rules, mono labels for data, tier chip component, footer mega-wordmark. Don't rewrite the prose.
4. **Web app home/landing — wholesale rethink** (`/web/`) — replace `web/app.css` and `web/features.css` wholesale with the new system, and rethink the Browse tab (the SPA's home/landing) editorially: filing-card grid (mono "FILE №XXXX" index, tier chips for Evidence/Safety/Access, plain-summary lines, brutalist surfaces, no rounded corners). Detail / Compare / Stats panels get the same brand system but their structure is preserved. JS DOM contracts (selectors, ids the modules depend on) preserved unless intentionally refactored. Bump `web/sw.js` cache version.
5. **Tests + cleanup** — update Playwright selectors that break, run the suite, manual smoke in a browser. Drop the tweaks-panel from the handoff (design-only). Add `redesign-radical-subtraction` cleanup note.

## Notes / risks

- Playwright suite (~1300 lines) targets the web app; expect selector drift in phase 4.
- The handoff README recommends asking the brand owner for a clean white SVG of the badger; for now we ship with the PNG-with-CSS-filter approach the prototype uses.
- The accent olive is pulled directly from the brand lockup tagline. Do not shift it.
- Film grain overlay is load-bearing for the editorial feel — keep it in.
- No rounded corners anywhere in the marketing surface; the web app may keep its existing rounding only where functional (focus rings) — flag any decision in the commit.

## Out of scope

- Rewriting the SPA's data layer / state / routing.
- Adding any backend, CMS, or build step. Site stays static.
- The Tweaks panel from the handoff (drop in production).
