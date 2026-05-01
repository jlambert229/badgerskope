// One-off verification spec for wl-mobile-spacing-pass.
// Run: npx playwright test --project=chrome-iphone tests/_verify-mobile-spacing-pass.spec.js
// This file is prefixed with _ so it can be deleted after the pass lands.
import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile spacing pass — all 10 issues at 390x844", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const measurements = await page.evaluate(() => {
    const get = (sel) => document.querySelector(sel);
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const rect = (el) => (el ? el.getBoundingClientRect() : null);

    const heroMeta = get(".hero-meta");
    const hero = get(".hero");
    const heroCta = get(".hero-cta");
    const subBtn = get('.sub-form button[type="submit"]');
    const subInput = get('.sub-form input[type="email"]');
    const filter = get(".library-filter");
    const chips = Array.from(document.querySelectorAll(".library-filter .chip"));
    const lthDivs = Array.from(document.querySelectorAll(".library-th > div"));
    const firstRow = document.querySelector(".library-row");
    const lrowDivs = firstRow ? Array.from(firstRow.children) : [];
    const library = get(".library");
    const subscribe = get(".subscribe");
    const faq = get(".faq");
    const footerTop = get(".footer-top");
    const footerMega = get(".footer-mega");

    return {
      heroMetaMarginBottom: cs(heroMeta).marginBottom,
      heroMetaFontSize: cs(heroMeta).fontSize,
      heroPaddingTop: cs(hero).paddingTop,
      heroCtaMarginBottom: cs(heroCta).marginBottom,
      subBtnPadding: cs(subBtn).padding,
      subBtnHeight: rect(subBtn).height,
      subInputHeight: rect(subInput).height,
      filterHeight: rect(filter).height,
      filterRows: (() => {
        const tops = chips.map((c) => Math.round(c.getBoundingClientRect().top));
        return new Set(tops).size;
      })(),
      chipCount: chips.length,
      thWidths: lthDivs
        .filter((d) => getComputedStyle(d).display !== "none")
        .map((d) => Math.round(d.getBoundingClientRect().width)),
      rowWidths: lrowDivs
        .filter((d) => getComputedStyle(d).display !== "none")
        .map((d) => Math.round(d.getBoundingClientRect().width)),
      libraryPaddingTop: cs(library).paddingTop,
      subscribePaddingTop: cs(subscribe).paddingTop,
      faqPaddingTop: cs(faq).paddingTop,
      footerTopGap: cs(footerTop).rowGap, // grid uses gap → row-gap/column-gap
      footerMegaFontSize: cs(footerMega).fontSize,
      footerMegaScrollWidth: footerMega.scrollWidth,
      footerMegaClientWidth: footerMega.clientWidth,
      viewportWidth: window.innerWidth,
    };
  });

  console.log("MEASUREMENTS:", JSON.stringify(measurements, null, 2));

  // #1 .hero-meta margin-bottom: 80px → 40px
  expect(measurements.heroMetaMarginBottom).toBe("40px");
  // #2 .hero padding-top: 56px → 32px (mobile)
  expect(measurements.heroPaddingTop).toBe("32px");
  // #3 .hero-cta margin-bottom: 56px → 32px
  expect(measurements.heroCtaMarginBottom).toBe("32px");
  // #4 .sub-form button vertical padding non-zero, height matches input
  expect(measurements.subBtnPadding).not.toMatch(/^0px /);
  expect(Math.abs(measurements.subBtnHeight - measurements.subInputHeight)).toBeLessThan(2);
  // #5 chip filter on one row
  expect(measurements.chipCount).toBe(6);
  expect(measurements.filterRows).toBe(1);
  // #6 library th and row column widths align
  expect(measurements.thWidths.length).toBe(measurements.rowWidths.length);
  for (let i = 0; i < measurements.thWidths.length; i++) {
    expect(Math.abs(measurements.thWidths[i] - measurements.rowWidths[i])).toBeLessThanOrEqual(1);
  }
  // #7 section padding-top reduced on mobile
  expect(measurements.libraryPaddingTop).toBe("64px");
  expect(measurements.subscribePaddingTop).toBe("64px");
  expect(measurements.faqPaddingTop).toBe("64px");
  // #8 footer-top gap: 64 → 40
  expect(measurements.footerTopGap).toBe("40px");
  // #9 footer-mega no horizontal overflow
  expect(measurements.footerMegaScrollWidth).toBeLessThanOrEqual(measurements.footerMegaClientWidth);
  // #10 hero-meta font-size: 9px → ≥11px
  expect(parseFloat(measurements.heroMetaFontSize)).toBeGreaterThanOrEqual(11);

  // Capture full-page after-screenshot for visual confirmation. Writes
  // outside test-results/ so Playwright doesn't clean it between runs.
  await page.screenshot({ path: "logs/mobile-spacing-after.png", fullPage: true });
});
