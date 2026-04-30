import { test, expect } from "@playwright/test";

/**
 * PR F — typography token + tactile polish.
 *
 * Verifies:
 *   1. .lib-row__select has a >=44×44 hit area (Apple HIG / WCAG 2.5.5).
 *   2. The "APPETITE & FULLNESS" wellness chip renders on a single line at
 *      desktop width (no mid-phrase wrap).
 *   3. The --text-label token resolves to 11px and is applied to mono caps
 *      labels (table head, filter row labels).
 */

test.describe("PR F — token + tactile polish", () => {
  // ".lib-row__select wrapper has >=44×44 hit area" — removed. The
  // select-for-compare wrapper no longer exists; the COMPARE feature was
  // retired along with the per-row select checkbox.

  test("'APPETITE & FULLNESS' wellness chip renders on a single line", async ({ page, viewport }) => {
    // Skip on viewports where .lib-row__wellness is hidden by responsive CSS
    // (the chip is intentionally not rendered below ~1100px). The single-line
    // requirement only applies where the chip is visible.
    test.skip((viewport?.width ?? 0) < 1100, "wellness chip hidden below 1100px");

    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const chip = page.locator(".card__category", { hasText: /APPETITE/i }).first();
    await expect(chip).toBeVisible();

    const dims = await chip.evaluate((n) => {
      const cs = getComputedStyle(n);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const innerH = n.scrollHeight - padY;
      const lines = Math.max(1, Math.round(innerH / lh));
      return {
        text: n.innerText.trim(),
        whiteSpace: cs.whiteSpace,
        minWidth: cs.minWidth,
        fontSize: cs.fontSize,
        lines,
      };
    });

    expect(dims.text).toMatch(/APPETITE\s*&\s*FULLNESS/i);
    expect(dims.lines).toBe(1);
    // Sanity: nowrap is the load-bearing rule. If this regresses, the chip
    // will start wrapping again on narrow rows.
    expect(dims.whiteSpace).toBe("nowrap");
  });

  test("--text-label token resolves to 11px and is used on mono caps labels", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const tokenValue = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text-label")
        .trim()
    );
    expect(tokenValue).toBe("11px");

    // Sample two visually-identical mono caps labels — they should now both
    // render at exactly --text-label (was 10px and 11px before this PR).
    const headSize = await page.locator(".lib-table__head").first().evaluate(
      (n) => getComputedStyle(n).fontSize
    );
    const fieldLabelSize = await page.locator(".lib-field-label").first().evaluate(
      (n) => getComputedStyle(n).fontSize
    );
    expect(headSize).toBe("11px");
    expect(fieldLabelSize).toBe("11px");
  });
});
