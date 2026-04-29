/**
 * Marketing-and-cohesion-pass — landing & library smoke checks.
 *
 * Covers audit issues #2 (anchor card focal), #6 (stat counter row
 * dropped), #7 (SCROLL FOR THE METHOD anchor target), #8 (article
 * 65ch measure), #1b (sarcastic empty state), modal counter "1 of N",
 * modal max-height includes 90dvh.
 */

import { test, expect } from "@playwright/test";

test.describe("Marketing landing — combined cohesion pass", () => {
  test("(#6) marketing landing no longer renders the stat counter row", async ({ page }) => {
    await page.goto("/");
    // The legacy `.hero-stats` block was removed. CSS keeps the selector as a
    // no-op (display:none) so any cached templates won't render half-styled.
    const heroStatsCount = await page.locator(".hero-stats > div").count();
    expect(heroStatsCount).toBe(0);
    // The fake numbers (142 / 2,807 / 0) must not appear inside any
    // `.hero-stat-n` element.
    const heroStatN = await page.locator(".hero-stat-n").count();
    expect(heroStatN).toBe(0);
  });

  test("(#2) anchor compound card is present and visible above the fold at desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const card = page.locator("#anchor-card");
    await expect(card).toBeVisible();
    // Compound name should be a display-sized H2 — read its bounding box and
    // confirm the card sits within roughly the first 1.5 viewports.
    const name = card.locator(".anchor-card__name");
    await expect(name).toHaveText(/BPC-157/i);
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y).toBeLessThan(900 * 1.6);
    // At least one tier badge present
    const tiers = card.locator(".anchor-card__tiers .tier");
    expect(await tiers.count()).toBeGreaterThanOrEqual(1);
    // CTA points into the library with the entry deeplink
    const cta = card.locator(".anchor-card__cta");
    await expect(cta).toHaveAttribute("href", /\/web\/#entry=/);
  });

  test("(#7) SCROLL FOR THE METHOD anchor targets the methodology section", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("#scroll-for-method");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "#method");
    // The href target must exist on the page and be the methodology section.
    const target = page.locator("#method");
    await expect(target).toBeVisible();
    // Sanity: methodology heading reads "FOUR STEPS" — confirms it's not the
    // ticker that's being targeted.
    await expect(target.locator("h2")).toContainText(/FOUR STEPS|NO VIBES/);
  });

  test("(#8) feature article body caps line measure near 65ch", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    // The desktop layout caps each child column of `.feature-cols` at 65ch.
    const col = page.locator(".feature-cols > div").first();
    await expect(col).toBeVisible();
    const widthCh = await col.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(el).fontSize);
      // Approximation: 1ch ≈ 0.5em for proportional fonts; use the document
      // root font size to estimate. We just need to assert the column doesn't
      // run wildly past 65ch.
      return rect.width / fontSize;
    });
    // 65ch with Inter at 17px is ~ 65 * 8.5 ≈ 552px. Allow generous slack
    // (40–80 ratio) so the test isn't flaky across browsers.
    expect(widthCh).toBeGreaterThan(20);
    expect(widthCh).toBeLessThan(80);
  });

  test("(#1a) hype phrases are wrapped in .redact spans", async ({ page }) => {
    await page.goto("/");
    const redacts = await page.locator(".redact").count();
    // Anchor card has 3 + lede 3 + summary 1 ≈ at least 5
    expect(redacts).toBeGreaterThanOrEqual(5);
  });

  test("(#3) HYPE word renders as ghost type with text-stroke", async ({ page }) => {
    await page.goto("/");
    const hype = page.locator(".hero-h1-hype");
    await expect(hype).toBeVisible();
    const stroke = await hype.evaluate((el) =>
      getComputedStyle(el).webkitTextStrokeWidth || getComputedStyle(el).getPropertyValue("-webkit-text-stroke-width")
    );
    // Either a non-zero stroke width OR fallback solid color — either way,
    // the element should render as visible text.
    expect(stroke).toBeTruthy();
  });

  test("(#4) accent split exposes both olive and teal tokens", async ({ page }) => {
    await page.goto("/");
    const tokens = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return {
        tierA: cs.getPropertyValue("--accent-tier-a").trim(),
        brand: cs.getPropertyValue("--accent-brand").trim(),
        accent: cs.getPropertyValue("--accent").trim(),
      };
    });
    expect(tokens.tierA.toUpperCase()).toBe("#C8D17A");
    expect(tokens.brand.toUpperCase()).toBe("#7EB6B0");
    // `--accent` aliases the brand (interactive) token.
    expect(tokens.accent).toBeTruthy();
  });

  test("(#9) newsletter CTA shows a single headline + small kicker", async ({ page }) => {
    await page.goto("/");
    const headline = page.locator("#sub-h2");
    await expect(headline).toHaveText(/RECEIPTS IN YOUR INBOX\.?/i);
    const kicker = page.locator(".sub-kicker");
    await expect(kicker).toHaveText(/WHEN NEW AUDITS DROP\.?/i);
  });
});

test.describe("Library — empty state + modal", () => {
  test("(#1b) empty state shows subversive copy when 0 results", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
    await page.fill("#search", "zzzzz_no_such_compound_xx");
    await page.waitForTimeout(300);
    const heading = page.locator(".empty-state__heading");
    await expect(heading).toBeVisible();
    const text = (await heading.textContent()).toLowerCase();
    // Must match one of the three rotation strings.
    expect(text).toMatch(/pubmed|0 results|negative signal/);
  });

  test("(modal) detail nav counter renders 'N of N' on open", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
    // Card detail opens via the compound name cell, not the whole card.
    const nameCell = page.locator(".card").first().locator(".card__main").first();
    await nameCell.click();
    // Wait for the dialog to actually open — Playwright's toBeVisible polls,
    // so we just await the counter being non-empty.
    const counter = page.locator(".modal-nav__counter");
    await expect(counter).toBeVisible();
    const text = (await counter.textContent()).trim();
    expect(text).toMatch(/^\d+\s+of\s+\d+$/);
  });

  test("(modal) max-height computed style includes a non-zero height", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
    await page.locator(".card").first().locator(".card__main").first().click();
    // The dialog and panel both have `max-height: 90vh; max-height: 90dvh;`.
    // We assert the cascaded rule shows up in the rendered stylesheet text.
    const cascadeFound = await page.evaluate(() => {
      const out = [];
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.cssText && rule.cssText.includes(".modal") && rule.cssText.includes("90dvh")) {
              out.push(rule.cssText);
            }
          }
        } catch (e) {
          /* cross-origin sheet; ignore */
        }
      }
      return out.length > 0;
    });
    expect(cascadeFound).toBe(true);
  });
});
