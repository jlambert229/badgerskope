# BadgerSkope — Multi-Perspective Audit, Exhaustive Fix List

Date: 2026-05-12
Author: Multi-agent audit (mobile/frontend, design, systems, layperson) +
final iteration pass.
Source materials: full read of `index.html`, `glossary.html`,
`evidence-guide.html`, `web/index.html`, `web/src/*`, `marketing.css`,
`design-tokens.css`, `web/app.css`, `web/sw.js`,
`peptide-info-database.json`, `netlify.toml`, `.github/workflows/`,
+ 36 Chromium screenshots at 375/768/1280.

Total: **~210 deduplicated fixes** across 4 priority bands, plus 8 open
design questions and 11 observation notes.

---

## P0 — CRITICAL (broken site, broken trust, broken deep link, broken data, no fallback)

### Navigation & access
1. **Mobile marketing nav is unreachable below 1100px.** `marketing.css:1016`
   sets `.nav-links { display: none }` at ≤1100px, and `marketing.css:1347-1349`
   drops `.nav-cta-group` at ≤380px. At 768px there is no METHOD / RECEIPTS /
   EVIDENCE / GLOSSARY / FAQ; at 375px there is also no OPEN LIBRARY /
   SUBSCRIBE. There is no hamburger replacement. Fix: implement a hamburger
   sheet that exposes all primary destinations; move the `.nav-links` hide
   breakpoint to ≤700px to match the SPA pattern.
2. **Glossary + evidence-guide also hide the wordmark on mobile.**
   `glossary.html:226`, `evidence-guide.html:212` set
   `.nav-brand span { display: none }`, leaving only the badger circle.
   Combined with #1, sub-pages have *no* visible brand and no menu. Fix:
   keep the wordmark at every viewport.
3. **Hero "READ THE FULL FILE" deep-link is correct (`#entry=3G-RT`) but the
   anchor card "SEE HOW WE GRADED THIS" link is wrong: `index.html:153`
   uses `#entry=BPC-157%2010mg` which decodes to `BPC-157 10mg` — no entry
   with that title exists.** Fix: change to `#entry=BPC-157`.

### Trust signals
4. **"WHO PAYS FOR THIS?" answer is collapsed inside FAQ #2.** Newcomers
   never see the trust line ("Reader-funded. No vendor money. No affiliate
   links.") unless they expand. Fix: hoist a one-liner into the area
   directly under the hero deck and into every page header band.
5. **"Not medical advice" link targets are inconsistent.** `index.html:522`
   points to `evidence-guide.html#disclaimer`; `glossary.html:349` and
   `evidence-guide.html:568` point to `/#faq`. The most important legal
   link on the site goes to the FAQ on two of three pages. Fix: unify on
   `evidence-guide.html#disclaimer`. Promote a slim "NOT MEDICAL ADVICE"
   strip below every nav.

### Security / data integrity
6. **No Content-Security-Policy header.** `netlify.toml:14-17` only sets
   X-Frame-Options, X-Content-Type-Options, Referrer-Policy. Add
   `Content-Security-Policy` with `'self'` defaults, font-src for
   `fonts.gstatic.com`, style-src for `fonts.googleapis.com`, and
   either `'unsafe-inline'` for inline blocks or a build step that
   extracts them and applies SHA-256 hashes.
7. **No HSTS header.** Add `Strict-Transport-Security: max-age=31536000;
   includeSubDomains; preload`.
8. **`escapeHtml()` does not escape single-quote.** `web/src/utils.js:5-11`
   replaces `&<>"` only. Today every template uses double-quoted attrs so
   it's safe; one refactor introduces XSS. Fix: also replace `'` →
   `&#39;`.
9. **Subscribe form is theatre.** `index.html:475-478, 691-728` validates
   email client-side, never sends it anywhere, and replaces the form
   with "✓ FILED. CHECK YOUR INBOX FOR THE CONFIRMATION." No inbox
   confirmation will ever arrive. Either wire to Buttondown / ConvertKit
   / Resend / Netlify Forms (`netlify` attribute), or replace with a
   genuine "newsletter coming — DM us on GitHub" notice.
10. **`.netlify/state.json` is tracked in git** and contains the
    developer's siteId + geolocation. `git rm --cached .netlify/state.json`
    and verify `.gitignore` keeps it untracked. Same for
    `.swarm/state.json`.

### Service worker / offline
11. **SW pre-cache lists a file that no longer exists in the module
    graph.** `web/sw.js:40` includes `/web/src/features/start-here.js`
    but `web/src/main.js` does NOT import it. `cache.addAll()` is
    atomic — if `start-here.js` 404s, the entire install rejects and
    the user has *no* offline cache. Fix: remove the line, OR import
    the module, OR delete the file (also in repo).
12. **SW network-first has no timeout.** `web/sw.js:79-105` always
    fetches first; on a slow/lossy mobile network the user waits the
    full TCP timeout (~30s on iOS) before the cached version renders.
    Wrap fetch in `Promise.race([fetch(req), timeout(5000)])` and
    fall through to cache on timeout.
13. **SW is only registered from `/web/`.** Marketing pages have no
    offline support. Either accept that and document, or register a
    second SW at root for HTML/CSS/JS prefetch.

### Library default state
14. **Library hides 33 of 45 entries by default and the "[SHOW]" CTA
    clips off-screen on mobile.** The `#stats` span is inside `<h1>` so
    the visible H1 reads "LIBRARY · 12 OF 45 SHOWING · 33 EXPERIMENTAL
    HIDDEN [SHOW]". The H1 outline is gibberish; the [SHOW] button is
    after a `text-overflow: ellipsis` on mobile. Newcomers see "33
    HIDDEN…" and bounce because they can't tap [SHOW]. Fix: move the
    count out of the H1 entirely; surface the experimental toggle as a
    prominent first-class control above the table; rewrite the
    descriptor to plain English ("33 early-research peptides hidden by
    default — show all").

---

## P1 — HIGH (significant UX, perf, comprehension hits)

### Mobile / responsive
15. **Mobile library search placeholder clips: "SEARCH 45 COMPOUN…"**
    `web/app.css:320` reserves 110px right-padding for the CLEAR
    button even when CLEAR is hidden. Fix: dynamic padding when
    CLEAR is `hidden`; or shorten placeholder.
16. **iOS form-zoom: search and email inputs are <16px font-size.**
    `web/app.css:325` (14px), `glossary.html:81` (13px),
    `marketing.css:858` (13px). Safari zooms on focus. Set
    `font-size: 16px` and use letter-spacing for density.
17. **No `inputmode="search"` or `enterkeyhint="search"`** on either
    search input. Add to library + glossary searches.
18. **No `autocorrect="off" autocapitalize="off"`** on search inputs;
    iOS auto-caps "GLP-1" into "Glp-1".
19. **Detail dialog does not lock body scroll on iOS.** `<dialog>`
    `showModal()` does not freeze body on iOS Safari. Add
    `body:has(dialog[open]) { overflow: hidden }` or set
    `document.body.style.overflow = 'hidden'` in `openDetail()`.
20. **`<dialog>` uses `90dvh` but `mobile-filter-sheet` uses `85vh`.**
    Inconsistent + sheet covers URL-bar area on iOS. Switch to `dvh`.
21. **No `env(safe-area-inset-*)` anywhere.** `back-to-top`,
    `mobile-filter-trigger`, `bookmarks-bar` clip beneath the iPhone
    home indicator. Add `padding-bottom: max(16px,
    env(safe-area-inset-bottom))`.
22. **Skip-link lands under the notch.** `marketing.css:47-55` —
    `top: 0` doesn't account for `viewport-fit=cover`. Add
    `top: max(16px, env(safe-area-inset-top))`.
23. **`<main id="main">` is not focusable.** Skip-link target won't
    actually move focus. Add `tabindex="-1"`.
24. **`measureStickyOffsets` fires on every resize without RAF.**
    `web/src/main.js:590`. iOS Safari fires `resize` continuously
    during URL-bar transitions. Wrap in `requestAnimationFrame`.
25. **Mobile filter sheet "DONE" + "APPLY" do the same thing.**
    `mobile-filter-sheet.js:88, 152`. Remove DONE or make them
    semantically different (DONE = close-no-op, APPLY = re-render).

### Performance
26. **Google Fonts CDN is render-blocking on every page.** No preload,
    no preconnect priority. Self-host as woff2 and add
    `<link rel="preload" as="font" type="font/woff2" crossorigin>`
    for Oswald 700 + Inter 400/600.
27. **Module graph: 30+ ES modules served raw, no bundling.** Add an
    esbuild step that emits a single `web/dist/main.bundle.js`.
28. **`web/app.css` is 52KB + `features.css` is 24KB.** Split critical
    (table, nav) from lazy (modals, stats); inject the lazy bundle on
    first interaction.
29. **149KB JSON loaded on every visit.** Ship a slim manifest
    (slug + name + grade for all 45) and lazy-load full bodies on
    detail open.
30. **`marketing.css` is 41KB unminified.** Minify; consider inlining
    critical above-the-fold CSS.
31. **`lockup-og.png` is 524KB at 1200×630.** JPG quality 85 → ~80KB.
    Or AVIF/WebP. Re-export.
32. **Badger PNG is filtered to white via CSS filter 7×.** `index.html:42,
    466, 494; glossary.html:248, 321; evidence-guide.html:277, 540;
    web/index.html:42`. Replace with a single stroke-only SVG that
    uses `currentColor`. Saves ~35KB/page and removes the filter
    dependency.
33. **Ticker animation `80s linear infinite` is not paused offscreen.**
    `marketing.css:419`. Drain battery on idle tabs. Pause via IO.
34. **Ticker DOM is 2× duplicated in JS.** `index.html:600` — the
    `width:200% translateX(-50%)` keyframe already runs in CSS;
    drop the JS duplication.
35. **`.dot` pulse animation runs forever.** `marketing.css:243-245`.
    Battery + reduced-motion concern.
36. **Film-grain SVG `<image>` repaints on every scroll** at
    `z-index: 9999` with `mix-blend-mode: overlay`. Drop on mobile
    via `@media (max-width: 600px)` or `prefers-reduced-motion`.
37. **`backdrop-filter: blur(12px)` on nav + dialog ::backdrop.**
    iOS GPU compositor judder. Drop blur to 6px or remove on mobile.
38. **No `Cache-Control` per asset type.** `netlify.toml` is bare.
    Add long max-age for hashed assets, must-revalidate for HTML
    and JSON.

### Accessibility
39. **Heading order on `index.html` has 8 sibling h2s under one main.**
    Anchor card, problem, method, legend, library, feature, FAQ,
    subscribe all use `<h2>` at the same heading rank. Promote
    receipts feature; demote anchor card to `<h2>` sub of hero.
40. **Heading order on glossary**: only one `<h1>`; alphabet sections
    are `<h2 class="letter-heading">` but term `<dt>` elements are
    not within `<section>` landmarks. Wrap each letter group in
    `<section aria-labelledby="letter-A">`.
41. **`role="presentation"` + `aria-hidden="true"` on nav mirrors at
    `web/index.html:55-57`** makes EVIDENCE/GLOSSARY/HELP invisible
    to assistive tech on mobile, while `.nav-end` is `display:none`
    at the same width. Remove the aria-hidden when the mirrors are
    the only visible exposure.
42. **`aria-current="page"` styled inline with `style="color: var(...)"`**
    in `glossary.html:255`, `evidence-guide.html:283`. Move to CSS.
43. **`role="note"` on disclaimer banner.** `web/index.html:91` —
    poor SR support. Use `<p>` semantics or `role="region"
    aria-label="Disclaimer"`.
44. **Dialog `aria-describedby` points to keyboard hint** instead of
    entry summary. `web/index.html:320`. Move or remove.
45. **`aria-live="polite"` on `.detail-nav-pos` announces every
    Prev/Next click verbosely.** `web/index.html:325`. Use off, or
    announce only on keyboard activation.
46. **Tier badges on hero/anchor card lack `aria-label`.**
    `index.html:110-112, 144-146`. SR users hear bare letters. Add
    `aria-label="Evidence tier B"`.
47. **`.dead-link` spans claim `aria-disabled="true"` on non-interactive
    elements** (`glossary.html:350-351`, `evidence-guide.html:569-570`).
    aria-disabled only applies to interactive controls. Either drop
    the dead spans entirely or wire them up.
48. **Tier-D `#D9621B` chip on dark is ~4.7:1 — barely AA, at small
    text size.** `design-tokens.css:58`. Lift to ~`#E37A2E` or flip
    ink to `--fg`.
49. **`--fg-3` `#8A8775` on `--bg-2` `#232320` is ~3.7:1** — fails AA
    for the 11px mono caps it's used for. Lift to `#A6A290` or
    restrict to large text.
50. **Ticker is `aria-hidden="true"` but carries data-bearing
    statements.** Either expose a SR mirror or accept it's decoration.
51. **`<select>` `appearance: none` arrow won't render on Firefox
    Android.** `web/app.css:441`. Add a `::after` triangle on the
    wrapper label.
52. **Marketing `<nav>` uses bare `<a>` siblings** (`index.html:46-52`)
    — no `<ul>` list semantics. Wrap.

### Brand / design consistency
53. **2px radius softening pass contradicts the brutalist brand promise.**
    `design-tokens.css:140-143` and `:186-201`. Revert to `0` on
    layout containers (anchor-card, hero-card, feature-art, modal-panel,
    lib-table, stat-card, …). Keep 2px only on form controls if
    desired.
54. **Olive `#C8D17A` is dead but tokens still claim olive=Tier-A.**
    `design-tokens.css:36` `--accent-tier-a: #2DA89C` (teal), but
    comments at lines 30-42 and `marketing.css:8` still say "olive
    #C8D17A → Tier-A". Either restore olive on `--accent-tier-a`
    (and let teal stay interactive-only) or delete the lying
    comments and commit to all-teal.
55. **Filter dropdown SVG arrow is hardcoded olive** even on the
    all-teal palette. `web/app.css:442` `fill='%23C8D17A'`. Replace
    with `currentColor` or `%232DA89C`.
56. **JetBrains Mono was dropped in favor of Inter caps.**
    `design-tokens.css:88-90` aliases `--font-mono` to body. The
    "receipts/data/terminal" voice is the brand's differentiator;
    Inter caps reads as Stripe-marketing, not editorial. Reinstate
    JetBrains Mono on `.rule-label`, `.mono`, `.tier`,
    `.feature-receipts`, `.ticker-track`, `.filed`, `.hero-card-aka`,
    `.hero-card-row`, `.faq-n`, `.footer-bot .mono`.
57. **`.feature-cols strong` is teal.** `marketing.css:698-700`.
    Bold body text rendering as teal makes it look interactive when
    it isn't. Demote to `--fg`.
58. **Footer `.wordmark-tag` is teal.** `marketing.css:927`. Demote.
59. **Anchor card eyebrow has decorative text "READ THE RECEIPTS →"
    on the right that looks like a CTA but isn't.** `index.html:138`.
    Remove or wrap in `<a>`.
60. **Anchor card duplicates the feature article below**, both about
    BPC-157 with the same redact-bar phrases. `index.html:134-175`
    vs `:353-401`. Rotate the anchor to a different compound or
    convert it into a teaser ("this week's audit ↓").
61. **`.method-step:hover` turns 96px numeral teal on hover but the
    step is non-interactive.** `marketing.css:505`. Either wrap in
    an `<a href>` or kill the hover.
62. **Subscribe radial gradient uses the old teal `#7EB6B0`.**
    `marketing.css:802`. Update to `rgba(45,168,156,0.08)` or use
    `var(--accent-soft)`.
63. **Nav background `rgba(11,11,10,0.7)` uses pre-softening
    near-black** (`marketing.css:67`, `web/app.css:103`). Bg is now
    `#1A1A18`. Update to `rgba(26,26,24,0.78)`.

### SEO / metadata
64. **No robots.txt and no sitemap.xml.** Add.
65. **Homepage has no `<link rel="canonical">`.** Glossary + evidence
    guide do. Add.
66. **No JSON-LD structured data** on any page. Add `MedicalWebPage`
    + `Organization` on `/`, `FAQPage` for the FAQ, `DefinedTermSet`
    for glossary, `Article` for evidence-guide.
67. **`og:url` and canonical disagree on doc pages.** `glossary.html:15`
    `og:url=…/glossary`, `glossary.html:24` canonical=`…/glossary.html`.
    Pick one (no `.html` is cleaner).
68. **`og:type` mismatch.** Index is `website`, doc pages are
    `article` — but without `og:article:published_time` /
    `og:article:author`. Add those, or downgrade docs to `website`.
69. **Twitter card has no `twitter:site`.** Add when handle exists.
70. **No webmanifest** despite having an SW and Apple touch icon.
    Add `site.webmanifest` with name, short_name, theme_color, icons.

### Data / source-of-truth
71. **Marketing homepage hardcodes 8 library entries inline.**
    `index.html:614-623`. Drifts vs `peptide-info-database.json`.
    Either generate at build time, or fetch the JSON client-side.
72. **Total "45" is hardcoded in 4 places.** `web/index.html:107`,
    `index.html:345-346, 649`. Use `meta.entryCount`.
73. **JSON `meta.builtAt` is older than the issue strip.**
    JSON: `2026-04-07`. Hero: "Issue 027 / Q2 2026". Hardcoded.
    Centralize.
74. **JSON has an entry with `sources: []` and `compoundType:
    "unknown_blend"`** (Orbitzen 40). Library renders it like a
    graded compound — undermines "evidence > hype". Either add
    sources, hide unsourced unknown_blend, or surface "no sources
    filed yet" badge.
75. **JSON references undeclared evidenceBasis key
    `co_secretagogue_or_fixed_ratio`.** Renders as raw underscores.
    Add to `meta.synergyEvidenceLegend` or rename.

### Layperson onboarding (the headline issue)
76. **The site never defines what a peptide IS.** Glossary defines
    it once on the glossary page; homepage/hero/anchor/library/
    evidence-guide hero never do. Fix: add a 2-sentence definition
    between hero and anchor card.
77. **Hero "Current Watch" is jargon-stacked.** "RETATRUTIDE /
    LY3437943 / TRI-AGONIST / PHASE 3 / N=4,865 / Weight Δ @ 48W
    −24.2%". Six pieces of jargon, zero plain-English handle.
    Lead with what the drug *does*: "RETATRUTIDE — a next-gen
    weight-loss drug in late-stage trials. People lost ~24% of
    body weight in 48 weeks."
78. **Anchor card "BPC-157 / PL 14736 / PENTADECAPEPTIDE / ANIMAL
    DATA STRONG, HUMAN DATA SPARSE"** is the second thing you read.
    Same problem. Lead with the human-readable answer.
79. **"1G-SGT / 2G-TZ / 3G-RT" file codes look like vendor SKUs.**
    Newcomers wonder if SEMAGLUTIDE and 1G-SGT are different drugs.
    Label the column "FILE #" or drop the code from the marketing
    surface entirely.
80. **"EVIDENCE > HYPE" assumes the reader already shares the
    framing.** A reader who arrived from a podcast they trust gets
    called out before earning your trust. Add a subtitle that
    explains the framing in normal language; keep "EVIDENCE > HYPE"
    as the slogan, not the explainer.
81. **"NOW READING — THE LITERATURE SO YOU DON'T HAVE TO".**
    "Literature" reads as "books." Rewrite to "WE READ THE STUDIES
    SO YOU DON'T HAVE TO."
82. **WADA / "banned in sport" mentioned without context.** Non-
    athletes don't know if "banned in sport" means dangerous or
    illegal or just disqualifying. Append plain-English: "WADA-
    prohibited — competitive athletes can be disqualified."
83. **"Phase 1 PK study (N=42, status unknown since 2021)".**
    `index.html:379`. PK + N=42 + status-unknown stacked. Rewrite:
    "Phase 1 safety study, 42 people, no results published since
    2021."
84. **Mobile filter trigger "FILTERS · 0" gives no preview of what
    filters exist.** Add a tiny preview row or rename trigger:
    "FILTERS — BODY AREA, EVIDENCE, MORE."
85. **Filter labels and column labels disagree.** Filter says "BODY
    AREA"; column says "WELLNESS". Filter says "SUBSTANCE"; column
    says "COMPOUND". Group-by says "Wellness area". Unify the
    vocabulary across filters, headers, group-by, and detail view.
86. **Library mobile hides the wellness chip** at ≤760px
    (`web/app.css:875`) — the most useful facet for newcomers.
    Show wellness *instead* of the third line of summary.
87. **Library detail jargon lacks inline glossary hover.** Pentadeca-
    peptide, tri-agonist, melanocortin, secretagogue — all live in
    the glossary but the SPA doesn't tooltip them in detail view.
    Wire `glossary-tooltips.js` to detail-body text.
88. **"Five tiers, one scale" (home) vs "Six categories, five
    grades" (evidence-guide).** Two competing tier counts on the
    same site. Reconcile.
89. **Tier F is "SLOP" on home but "UNKNOWN" in evidence-guide.**
    Decide what F means: actively misleading marketing, or
    unverified composition. Don't conflate.
90. **BPC-157 graded "B/B/B" but the legend says B = "Human pilot
    data".** Yet two paragraphs later: "two registered human trials,
    neither completed." Either correct the grade to C or expand the
    rubric to explain when consistent animal evidence earns a B.
91. **Glossary first term is "ACTH — Adrenocorticotropic Hormone".**
    Signals "this glossary is for doctors." Lead with the terms
    users came to look up: peptide, GLP-1, BPC, vial, dosing, off-
    label, grey market. Add a "10 terms you'll need" block above
    the alphabetical list.
92. **No "About / who's behind this" page** anywhere. "The badger"
    is charming but doesn't substitute for a byline. Add an
    Editors / About page that names authors and editorial policy.
93. **"Receipts" is brand slang.** Define on first use:
    "The receipts — every primary source we cite."
94. **"FREE WHILE IN BETA" + "Issue 027 / Q2 2026" contradict.**
    If 27 issues have shipped, it's not beta. Reset or update.
95. **Newsletter copy promises "the week's slop"** — flippant for an
    injection-related reference. Soften the entry-CTA copy to
    "Weekly: new audits, grade changes, what to ignore."

---

## P2 — MEDIUM (worth doing in the next major pass)

### UX / IA
96. **"FILE 0X" numbering collides across pages.** Home, glossary,
    evidence-guide each have their own "FILE 00". Numbering should
    be a single spine.
97. **"FILE 04" Roman vs "FILED №0042" ordinal** in the same
    homepage. Pick one.
98. **Hero "EVIDENCE > HYPE" mega-type wraps weirdly on tablet 768px
    and goes tiny on mobile.** The `clamp(56px, 14vw, 220px)` decay
    is too aggressive. Lock a minimum 96px on mobile.
99. **Hero "HYPE" outlined text-stroke is 1px-clamped at narrow
    viewports** (`marketing.css:278-280`) — hard to see on subpixel
    grids. Min 1.25px.
100. **Hero deck `max-width: 62ch` orphaned against giant H1**
    (`marketing.css:292`). Tighten to 48ch.
101. **Hero `.dot` pulse is one of four teal indicator dots within
    500vh of scroll**, none semantically distinct. Differentiate.
102. **Three buttons in hero are visually equivalent**: OPEN THE
    LIBRARY, HOW WE GRADE, plus the nav OPEN LIBRARY. Promote one;
    demote the others to text links.
103. **Library count strings drift: "FILES" / "COMPOUNDS" /
    "ENTRIES".** Pick one ("FILES" matches the FILE-NN brand).
104. **Library row arrow column is mostly empty whitespace until
    hover.** `web/app.css:518`. Compress to 88px and always-show
    the bookmark star.
105. **`.lib-row__compare` and `.lib-row__select` CSS exists but
    cards.js renders neither.** Dead CSS (~80 lines).
106. **`.lib-row__arrow` CSS exists, no JS renders it.** Dead.
107. **Glossary letter-nav has no "current letter" indicator while
    scrolling.** Add IO-driven `data-current` highlight.
108. **`.letter-heading::after` 24×24 teal square next to each
    letter** scans as interactive. Demote to `var(--line-2)`.
109. **Glossary letter-nav at 375px takes 4 rows.** Either collapse
    behind a "Browse A–Z" button or convert to horizontal scroller.
110. **Empty state copy uses `Math.random()` at module level.**
    `web/src/main.js:202`. Flaky for tests. Use sessionStorage.
111. **`isDefaultState` ignores bookmarked-only + experimental
    toggle.** `web/src/main.js:62-65`. Clear filters keeps toggle
    on but re-applies evidence-sort + 25-cap.
112. **`renderActiveFilters` rebuilds DOM every render.** Trivial,
    but a perf-sensitive section.
113. **`detail.js` rebuilds entire DOM on every Prev/Next.** Use
    template cloning or fragment-replace.
114. **Hashchange re-runs `applyHashOnLoad`** without an "are we
    writing it ourselves" guard. `web/src/main.js:633-635`. Add a
    `isWritingHash` flag.
115. **No `history.scrollRestoration = 'manual'`.** After closing a
    modal and pressing back, scroll position is unpredictable.
116. **Library detail dialog uses a single static "Press Esc to
    close" hint.** Add it via `aria-keyshortcuts` not paragraph.
117. **Library shows tier badge AND second tag ("CLINIC PRACTICE",
    "STRONG HUMAN TRIALS").** Two different label sets in one view.
    Pick one.
118. **`#stats` is a child of `<h1>`.** Document outline reads as
    "LIBRARY · N OF M SHOWING …". Move out.
119. **`<dialog>` close button is `position: absolute` inside
    scrollable panel** — scrolls out of view. Use `position:
    sticky; top: 16px` or move outside the scroller.
120. **`.bookmarks-bar` star is Unicode `★` without variant
    selector.** Append `︎` for text rendering or use SVG.
121. **`.faq-a` max-height: 0 → 400px accordion** clips long
    answers. Use `grid-template-rows: 0fr → 1fr`.
122. **Subscribe form `is-invalid` flash timer clears border but
    leaves `aria-invalid="true"`.** Inconsistent SR signal.
123. **Glossary footer "The badger" links to `#faq`** — opaque label.
    Rename to "FAQ" or drop.
124. **Anchor card `data-anchor-cta` attribute is unread.** Dead.
125. **Anchor card claim labels render in `var(--accent)`** —
    `marketing.css:1098-1107`. They look like links. Demote.
126. **Hero card row figures use mixed glyph systems** (`,`, `−`,
    `&Delta;`, mono digits). Apply `font-feature-settings: "tnum"
    1` and align to the right.
127. **Pullquote `"` is sans curly glyph at 80px.**
    `marketing.css:715`. Replace with SVG block-quote mark.
128. **Hero scroll-for-method link is a giant horizontal rule** that
    scans as decoration. Add an arrow icon, make the link more
    obvious.
129. **Footer mega-type "EVIDENCE > HYPE" is 40px on mobile but
    should be a masthead.** Lift to clamp(48px, 16vw, 96px).
130. **"v.027.04 · BUILT IN A BURROW" is cute but the only
    attribution on the site.** Replace with author + last-updated.

### Code health / dead code
131. **`web/app.js` (60.9KB) and `web/features.js` (64.4KB) are dead.**
    Not loaded; not in SW; just sit in the repo. Delete.
132. **`web/src/features/start-here.js` is dead.** Not imported.
    Delete (also covered in P0 #11).
133. **`list.md` is 0 bytes and tracked.** Delete.
134. **`orbitrex-peptides.json` + `scrape-orbitrex-console.js` ship
    to production.** Vendor scrape + console paste at repo root.
    Move to `scripts/scrapers/` (gitignored) and 404 the public URLs.
135. **`deno.lock` is tracked** but no Deno usage exists. Delete.
136. **`playwright-report/` is tracked.** Add to `.gitignore` and
    `git rm -r --cached`.
137. **`scripts/_audit-shots.mjs` was tracked despite `.gitignore`.**
    Verify gitignore patterns; remove if needed.
138. **`.hero-stats` CSS rule is `display: none` dead code.**
    `marketing.css:336`. Remove.
139. **`.disclaimer` rule exists but isn't used.** `web/app.css:1217`.
    Remove.
140. **`scripts/apply_lay_content.py` is the only Python file in a
    Node repo.** Document or migrate.
141. **`db/001_initial_platform.sql`** is placeholder Postgres
    schema for a future that may never come. Delete or commit.
142. **`config/`, `templates/`** — unclear purpose; audit and remove
    unused dirs.

### Inline styles / CSP hygiene
143. **7 instances of `style="filter: brightness(0) invert(1)
    contrast(1.5)"`** on badger `<image>` elements. Move to
    `.brand-mark` class.
144. **Inline `style="position:absolute;..."` on `.visually-hidden`
    in `index.html:85`.** Move to `.visually-hidden` utility
    already in stylesheets.
145. **Inline `<style>` blocks of 200+ lines in glossary.html and
    evidence-guide.html.** Extract to `doc-pages.css`.
146. **Inline `<script>` blocks of 140 lines in index.html, 200
    lines in glossary.html.** Extract to dedicated `.js` files for
    CSP + cacheability.

### Misc
147. **`peptide-info-database.json` lives at root but SW scope is
    `/web/`.** The SW intercepts via suffix match. Document this
    asymmetry inline.
148. **`.toLocaleDateString()` uses browser locale.** Force `'en-US'`
    for an English-only site.
149. **`Permissions-Policy` header is missing.** Add the standard
    deny-all for camera, mic, geo, etc.
150. **`engines` not in `package.json` and no `.nvmrc`.** Pin Node 22.
151. **`npm run web` pulls `serve` from npx with no version pin.**
    Install as devDep or pin.
152. **`<dialog>` requires polyfill for iOS Safari <15.4.** Feature-
    detect `'showModal' in HTMLDialogElement.prototype` or accept
    cutoff.
153. **Resize handler & filter render not debounced together.**
    Already debounced separately; combine.
154. **`.lib-search-input` placeholder all caps but typed text isn't
    transformed.** Tone shift mid-field. Add
    `text-transform: uppercase` or lowercase the placeholder.
155. **Glossary search example placeholder "GLP-1, BIOAVAILABILITY,
    PLACEBO"** — three terms none of which is "Ozempic". Lead with
    likely-first searches.
156. **`<select>` styles use `appearance: none`** without a fallback
    arrow on Firefox Android. Add wrapper `::after` triangle.
157. **No `<noscript>` on the library SPA.** Add a link to the
    marketing landing.
158. **`<meta name="theme-color">` is set to one dark value;** site
    is dark-only. Document.
159. **Compare-tab code paths exist** (`compare.js`, `compare-table-wrap`
    CSS) but the SPA tablist only renders LIBRARY/STATS tabs
    (`web/index.html:49-58`). The "Compare" tab button was removed
    but the compare module is still imported (`web/src/main.js:24`).
    Dead branch or unfinished feature — decide.
160. **`setRouterCallbacks({ ... openDetail })`** — router calls open
    on hash-load; verify that an invalid `#entry=xyz` no-ops
    gracefully (it currently doesn't).
161. **`ev-compare`/`category-intro` inline DOM build with
    `innerHTML` in `web/src/detail.js`** — keep escapeHtml usage
    consistent.

---

## P3 — LOW / polish

162. **Footer cross-page links inconsistent:** "Recently filed" on
     glossary + evidence-guide goes to bare `/web/` (no such sort
     exists); "By evidence tier" goes to different anchors on
     different pages.
163. **"Privacy (soon) / Terms (soon)" placeholders** on glossary +
     evidence-guide footers. Either build them or remove the spans
     to match the homepage footer.
164. **`.gitignore` doesn't cover `logs/*.png` or
     `playwright-report/`.** Add.
165. **`encodeURIComponent` on slugs** is currently safe but slugs
     like `CJC-1295 (no DAC) + IPA` would need it; document.
166. **"Receipts" footnotes `[01] [02] [03]`** aren't referenced
     inline. Add superscript references.
167. **"WADA / FDA / HGH" auto-link to glossary on first occurrence
     per page.** Currently no auto-linking.
168. **Tier ramp "A teal, B forest green" reads too close at
     chip-letter scale.** Brighten Tier B to a yellow-green
     (`#7BB13D`) so it separates from teal.
169. **Mobile hero "EVIDENCE > HYPE" chevron renders alone on a
     line, looking like a CTA arrow.** Inline chevron with HYPE at
     narrow widths.
170. **Glossary's `J / Q / X / Y / Z` disabled letters at
     `opacity: 0.4`** drop below WCAG SC 1.4.11 (3:1) when combined
     with `--fg-3` over `--bg`. Raise opacity or change disabled
     styling.
171. **`.term-card` `<dt>` injects `<br>` to break term/abbreviation.**
     Use `<abbr>` semantics.
172. **`evidence-guide.html` requests `Inter:ital,...` but glossary
     + index do not.** Inconsistent italic loading.
173. **Pullquote `<blockquote class="pullquote">`** uses
     `text-align: center` mid-article — breaks the editorial-column
     rhythm. Left-align or use a margin-pulled treatment.
174. **`<button class="faq-toggle">` icons mix `+` and `&minus;`
     entities.** Normalize.
175. **`<button class="faq-q">` is `<button>` inside an h-something
     parent — verify outline.**
176. **`hero-card-link` is an `<a>` with no `aria-describedby`** for
     "opens the library at this entry."
177. **`<title>` strings are formatted with em-dash `—`** in some
     pages and hyphen in others.
178. **`<meta name="description">` length varies wildly across pages.**
     Tune to ~155 chars each.
179. **OG image is referenced as `lockup-og.png` at root** but a
     `public/` move would silently break.
180. **`<sub>` / `<sup>` and trademark symbols** are never used —
     fine, but watch for retatrutide/tirzepatide trademark
     considerations.
181. **`background-size: 13px`** on the select arrow looks fuzzy on
     hi-DPI; bump to a true SVG mask.
182. **`prefers-reduced-motion` disables `.ticker-track`** but not
     `.dot` pulse, the hero "scroll for method" subtle drift, or
     redact-bar transitions. Add to all.
183. **`.skip-link` `:focus` `top: 16px` is fine but doesn't
     announce "Skip to content" because the link text is
     unstyled.** Verify SR announcement.
184. **`.modal-hint` text is below the panel's `overflow-y: auto`
     boundary** — clipped on small screens. Move outside scroll
     area.
185. **`bookmarks-bar` is a `<button>` with `aria-pressed`** — good;
     verify `aria-label` updates on toggle.
186. **`stats.js` renders bar charts via inline width %** — works,
     but `aria-label` per bar would be useful.
187. **`.synergy-pill` `<button>` with no submit prevention** —
     verify all buttons have `type="button"`. Inspection shows yes,
     but worth a global lint.
188. **No `viewport` `maximum-scale` set** — good (a11y); but
     `viewport-fit=cover` + iOS notch handling needs verification.
189. **Tab `<button role="tab">` accessibility tree** — does the
     visible LIBRARY tab announce as "selected"?
190. **Library card hover state on touch** — Sticky `:hover` after
     tap; ensure styles are clean. Use `@media (hover: hover)`.
191. **No analytics**: with no Plausible, no Sentry, no metrics,
     ops is blind. Add cookie-free Plausible.
192. **`evidence-guide.html` page H1 includes inline `<br>`** —
     verify desktop wrap remains intentional.
193. **`.feature-receipts` ordered list `<ol>` is mono caps** —
     numerals are listed `[01], [02], [03]` but the `<ol>`
     `list-style` is default decimal. The visible `[NN]` is part
     of the `<li>` text. Remove default marker via
     `list-style: none`.
194. **All four pages preconnect to fonts.googleapis.com + fonts.gstatic.com**
     — good; but no `crossorigin` on the .googleapis preconnect. Fix.
195. **`peptide-info-database.json` includes vendor SKU titles like
     "1G-SGT"** alongside the human name. Verify whether the
     `commonDrugName` field is consistently populated; the SPA's
     `getDisplayName` falls back gracefully but the marketing list
     hardcoded SKUs (#71).
196. **`ev-compare` "Strongest in Appetite & Fullness (4 entries)"
     uses an em-dash but other "Above average" / "Below average"
     don't.** Normalize.
197. **`detail.js` "About this listing" section** uses `entry.notes`
     prose verbatim — verify no entries contain stale internal
     comments.
198. **`.feature-receipts a` link styling is identical to other
     accent text** — readers can't tell links from emphasis.

---

## Open design / product calls (need a human decision)

A. **Olive vs all-teal.** Strategic. Olive on dark is editorial /
   distinctive (print zine, law journal); teal on dark is SaaS-tech
   familiar (Linear/Stripe/Vercel). Pick. The current "tokens claim
   olive, values are teal" state is the worst of both.

B. **JetBrains Mono — accept the byte cost.** Brand voice vs ~25KB.

C. **2px softening pass — finalized or experiment?** If final,
   document and update brand memory.

D. **Anchor compound rotation strategy.** Currently anchor card and
   feature article both feature BPC-157. Same compound twice in 500vh.

E. **STATS tab — usage data first.** Is it earning its real estate
   on mobile?

F. **Mobile filter sheet vs always-visible filters.** For 45
   compounds, is the modal pattern overkill?

G. **"EVIDENCE > HYPE" mobile masthead height.** Pick a target
   visual weight.

H. **Brand voice surface area.** "Receipts," "files," "the badger,"
   "slop" — define which the newcomer learns and which is in-group.

---

## Notes (info only, not fixes)

- **WebKit ICU baseline** — ~370 WebKit Playwright failures are
  environmental; only Chromium counts.
- **Dead code confirmed**: `web/app.js`, `web/features.js`,
  `web/src/features/start-here.js`.
- **Service worker discipline**: comment at `sw.js:7-9` shows the
  team has been burned by stale caches before. Network-first
  strategy is correct; lacks timeout safety net.
- **`peptide-info-database.json` location** at repo root rather
  than under `/web/`. SW intercepts via suffix match.
- **No touch event listeners anywhere** — interaction is via click
  + keydown. Good — no passive issues.
- **CI workflows** in `.github/workflows/` cover Chromium baseline
  and WebKit-environmental-failure stream. No a11y / Lighthouse /
  visual-regression checks yet.
- **JSON schema 3.0** — `meta` declares several keys that no entry
  uses (`clinical_exploratory`, `evidence_note`,
  `not_applicable_peptide`, `unknown_identity`,
  `wellnessCategoryIndex.supports_accessory`). Forward-compat or
  prune.
- **Average 1.22 sources/entry** in the JSON. For "evidence > hype,"
  thin. Audit target: ≥2 sources per non-`unknown_blend` entry.
- **The "EVIDENCE > HYPE" claim is best supported on the evidence
  guide** by the lines: "BadgerSkope exists to help you ask better
  questions, not to replace the person who should be answering
  them" + "You don't need a science degree. You need ten minutes
  and a healthy distrust of marketing." Hoist these to the homepage
  hero.
- **Dialog focus return is implemented** at `detail.js:489-500` —
  good a11y discipline; keep.
- **`escapeHtml` is used consistently in the SPA** for
  user-influenced strings (notes, search, entry IDs). XSS surface
  is limited to the single-quote gap.

---

## Iteration 2 — additional findings (final pass)

199. **Marketing landing has no `preconnect` to fonts.gstatic.com.**
     `index.html:24-26` and `web/index.html:21-26` only list
     `fonts.googleapis.com`; glossary + evidence-guide have both.
     Result: marketing pages and library SPA wait an extra RTT to
     open the font connection. Add
     `<link rel="preconnect" href="https://fonts.gstatic.com"
     crossorigin>` to both.
200. **Print stylesheet only exists in `web/features.css:815-824`** —
     marketing pages have no `@media print` rule. Printing the
     homepage or evidence-guide produces dark-bg + grain overlay
     unreadable on paper. Add a minimal `@media print` block to
     `marketing.css`.
201. **`@media print` rule hides `.start-here`** at
     `web/features.css:817` — leftover from a deleted feature
     (start-here.js is dead). Selector is a no-op. Remove.
202. **Keyboard listener is attached to `document` globally in
     `web/src/keyboard.js:21`** — scoped only because the module is
     only imported on `/web/`. If main.js is ever loaded elsewhere
     the shortcuts fire site-wide and conflict with browser
     defaults. Add an explicit guard `if
     (!document.getElementById('panel-browse')) return;` or scope
     listener to `els.dialog` / `els.main`.
203. **28 instances of `innerHTML` across `web/src/`** — none I read
     are XSS-able today (all paired with `escapeHtml`), but the
     volume makes auditing fragile. Migrate to `textContent` +
     `createElement` for the highest-touched paths
     (`detail.js:445`, `main.js:633`).
204. **`peptide-info-database.json` is served from root**
     (`https://www.badgerskope.com/peptide-info-database.json`)
     and is therefore publicly indexable. Search engines may index
     this 149KB JSON file. Either add `X-Robots-Tag: noindex` for
     `*.json` in `netlify.toml`, or include it via `Disallow` in
     `/robots.txt` (which doesn't exist yet — finding #64).
205. **No `noindex` for `playwright-report/index.html`** if/when
     that path leaks to production. Combined with finding #136,
     this is a private artifact ending up indexable.
206. **The favicon is a 256×256 PNG, not multi-size .ico.**
     `index.html:11`. Old browsers + WebPageTest screenshots fail.
     Add a 32×32 and 16×16 sizes attribute, or ship an `.ico`.
207. **Apple touch icon is a single 180×180 PNG.** Modern iOS
     accepts a transparent-bg 180×180 just fine; verify a 192×192
     fallback for Android home screen install (related to webmanifest,
     finding #70).
208. **`netlify.toml` `[build] publish = "."`** publishes the
     entire repo root including `logs/`, `tests/`,
     `playwright.config.js`, `package.json`, `package-lock.json`,
     `templates/`, `db/`, `config/`, and (per finding #29)
     `orbitrex-peptides.json` and `scrape-orbitrex-console.js`.
     Move public assets to `public/` and publish that, or add
     explicit `[[redirects]]` blocks that 404 internal paths.
209. **`templates/peptide-entry.template.json`** is shipped to
     production at `/templates/peptide-entry.template.json`.
     Internal scaffold; should not be public.
210. **`config/connector-allowlist.json`** is shipped to production
     at `/config/connector-allowlist.json`. Same.

---

## What this list does NOT cover (out of scope for this audit)

- Actual user testing with first-time visitors (this is an expert
  review).
- A/B testing of copy alternatives.
- Final brand decisions (see Open Calls A–H).
- Implementation order / dependency graph for the fixes.
- Visual regression testing of the proposed changes.
