# PR E — Mobile responsive shell fixes (library /web/)

Branch: `feat/pr-e-mobile-shell`
Base: `main` (`b2c399d`)
Scope: `web/index.html`, `web/app.css`, plus 1 new Playwright spec.

## Issues from UX audit

1. **H1 wraps catastrophically at 390px.** The library H1 is
   `<h1 class="lib-meta-strip">`. Investigation revealed the root cause
   is not just typography: a stray closing `}` at `web/app.css:1169`
   (introduced in commit `44b3eef`, PR #24) was poisoning CSS parsing
   so the `.lib-meta-strip { ... }` rule below was being **dropped
   entirely**. The H1 was therefore inheriting the UA default for
   `<h1>` (32px Inter) instead of the intended 11px mono. At 390x844
   the 32px copy stacks onto 4–6 lines.
2. **Right cluster (`EVIDENCE / GLOSSARY / HELP`) hidden ≤700px.**
   `app.css:1119` literally has `.nav-end { display: none; }` inside
   the `≤700px` block. Those three destinations become unreachable
   from the topnav. Fix: at ≤700px, fold the right cluster into the
   already-scrollable `.nav-tabs` row so all six items live in a
   single horizontal scroller.

## Approach

- **H1 fix.** Re-wrap the orphan declarations
  (`.lib-selection-actions`, `.lib-selection .btn`) inside the
  existing `@media (max-width: 700px)` block so the parser stops
  dropping `.lib-meta-strip` below. Then make the H1 itself a `block`
  with inline children, apply `font-size: clamp(8px, 2.2vw, 11px)`,
  tighten letter-spacing on phones, and make
  `.lib-meta-strip__action` (the `[SHOW]` button) inherit so it
  doesn't inflate the line height. Net effect: at 390x844 the
  default-state copy (`LIBRARY · 53 COMPOUNDS LOGGED · X
  EXPERIMENTAL HIDDEN [SHOW]`) sits on a single visual line; at
  desktop the H1 stays at 11px JetBrains Mono.
- **Nav reparent.** Pure-CSS dual-instance: duplicate `EVIDENCE /
  GLOSSARY / HELP` inside `.nav-tabs` as anchor/button elements with
  a new `.nav-tab--secondary` modifier, marked
  `aria-hidden="true"`, `role="presentation"`, `tabindex="-1"`. They
  are `display: none` by default. At ≤700px:
  - Show the secondary instances (`display: inline-flex`)
  - Keep `.nav-end` hidden (existing rule)
  - The `.nav-tabs` row already had `overflow-x: auto`; we add
    explicit `-webkit-overflow-scrolling: touch`,
    `scrollbar-width: none`, `::-webkit-scrollbar { display: none }`,
    and `min-height: 44px` per tab for Apple HIG touch targets.
  - The mobile HELP mirror needs to open the same dialog as the
    primary `#open-help` button. To avoid touching `web/src/main.js`,
    a tiny inline forwarder script in `index.html` does
    `mobileHelp.click() → primaryHelp.click()`.
- Brand: square edges, no shadows, olive accent for the active tab
  indicator (already in design tokens).

## Out of scope (do not touch)

- `.filter-strip*` (PR C in flight)
- `.lib-disclaimer-banner` (PR #26)
- `.active-filters`, `.empty-state` (PR #28)
- Marketing landing `/index.html` and `marketing.css`
- `design-tokens.css`
- `evidence-guide.html`, `glossary.html`
- WebKit Playwright projects (ICU mismatch — known host issue)
