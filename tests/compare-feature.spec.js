import { test, expect } from "@playwright/test";

test.describe("Compare feature — complex multi-step flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
  });

  test("compare tab shows empty state with <2 selections", async ({ page }) => {
    await page.click("#tab-compare");
    await page.waitForTimeout(300);

    const empty = page.locator("#compare-empty");
    await expect(empty).toBeVisible();
  });

  test("selecting 2+ entries enables compare button", async ({ page }) => {
    await page.locator(".card__select input").nth(0).check();
    await page.locator(".card__select input").nth(1).check();
    await page.waitForTimeout(200);

    const disabled = await page.locator("#compare-selected").isDisabled();
    expect(disabled).toBe(false);
  });

  test("compare table renders with correct column count", async ({ page }) => {
    // Select 3 entries
    await page.locator(".card__select input").nth(0).check();
    await page.locator(".card__select input").nth(1).check();
    await page.locator(".card__select input").nth(2).check();
    await page.waitForTimeout(200);

    await page.click("#tab-compare");
    await page.waitForTimeout(500);

    const headerCells = await page.locator(".compare thead th").count();
    // 3 entries + 1 label column = 4
    expect(headerCells).toBe(4);
  });

  test("compare highlights differences between entries", async ({ page }) => {
    await page.locator(".card__select input").nth(0).check();
    await page.locator(".card__select input").nth(1).check();
    await page.waitForTimeout(200);

    await page.click("#tab-compare");
    await page.waitForTimeout(500);

    // Should have at least some diff-highlighted cells
    const diffCells = await page.locator(".compare-diff").count();
    expect(diffCells).toBeGreaterThan(0);
  });

  test("removing entry from compare updates table", async ({ page }) => {
    await page.locator(".card__select input").nth(0).check();
    await page.locator(".card__select input").nth(1).check();
    await page.locator(".card__select input").nth(2).check();
    await page.waitForTimeout(200);

    await page.click("#tab-compare");
    await page.waitForTimeout(500);

    const before = await page.locator(".compare thead th").count();
    await page.locator(".compare-remove").first().click();
    await page.waitForTimeout(300);

    const after = await page.locator(".compare thead th").count();
    expect(after).toBe(before - 1);
  });

  test("select all then compare works", async ({ page }) => {
    await page.click("#select-visible");
    await page.waitForTimeout(200);

    const count = await page.evaluate(() => {
      const text = document.getElementById("selection-count")?.textContent;
      return parseInt(text) || 0;
    });
    expect(count).toBeGreaterThan(2);

    await page.click("#tab-compare");
    await page.waitForTimeout(500);

    // Compare table caps at 8 entries
    const headerCells = await page.locator(".compare thead th").count();
    expect(headerCells).toBeLessThanOrEqual(9); // 8 + label column
    expect(headerCells).toBeGreaterThan(2);
  });
});
