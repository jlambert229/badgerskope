import { test, expect } from "@playwright/test";

/**
 * PR C — Mobile filter sheet (≤768px).
 *
 * At ≤768px, the desktop three-row filter strip is replaced by a single
 * `FILTERS · N` trigger button. Tapping the trigger opens a bottom sheet
 * containing the same filter controls (reparented, not mirrored). Sheet
 * has DONE / RESET / APPLY affordances and a backdrop that closes on tap.
 *
 * The desktop strip remains untouched at >768px.
 */

const MOBILE_VIEWPORT = { width: 375, height: 667 };  // iPhone SE
const DESKTOP_VIEWPORT = { width: 1280, height: 900 };

test.describe("Library — mobile filter sheet (≤768px)", () => {
  test("at 375px, desktop filter strip is hidden and FILTERS button is visible", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // Body has the mobile-filters mode flag.
    await expect(page.locator("body")).toHaveClass(/is-mobile-filters/);

    // Desktop filter strip is visually hidden (display: none via body class).
    const strip = page.locator("#filter-strip");
    await expect(strip).toBeHidden();

    // Trigger button is visible and full-width-ish.
    const trigger = page.locator("#mobile-filter-trigger");
    await expect(trigger).toBeVisible();
    const box = await trigger.boundingBox();
    expect(box).not.toBeNull();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test("tapping FILTERS opens the sheet (sheet + backdrop visible)", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const trigger = page.locator("#mobile-filter-trigger");
    const sheet = page.locator("#mobile-filter-sheet");
    const backdrop = page.locator("#mobile-filter-backdrop");

    await expect(sheet).toBeHidden();
    await expect(backdrop).toBeHidden();

    await trigger.click();

    await expect(sheet).toBeVisible();
    await expect(backdrop).toBeVisible();
    await expect(page.locator("body")).toHaveClass(/is-mobile-filter-sheet-open/);
  });

  test("sheet contains the same controls as the desktop strip (reparented)", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.locator("#mobile-filter-trigger").click();

    // The actual control nodes (#category, #compound, #known-for, etc) are
    // reparented inside the sheet body. We verify they're descendants of
    // the sheet body via DOM `.contains()`.
    const insideSheet = await page.evaluate(() => {
      const body = document.getElementById("mobile-filter-sheet-body");
      if (!body) return null;
      return {
        category: body.contains(document.getElementById("category")),
        compound: body.contains(document.getElementById("compound")),
        knownFor: body.contains(document.getElementById("known-for")),
        evidenceFilter: body.contains(document.getElementById("evidence-filter")),
        sort: body.contains(document.getElementById("sort")),
        groupBy: body.contains(document.getElementById("group-by")),
      };
    });
    expect(insideSheet).not.toBeNull();
    expect(insideSheet.category).toBe(true);
    expect(insideSheet.compound).toBe(true);
    expect(insideSheet.knownFor).toBe(true);
    expect(insideSheet.evidenceFilter).toBe(true);
    expect(insideSheet.sort).toBe(true);
    expect(insideSheet.groupBy).toBe(true);
  });

  test("selecting a filter inside the sheet updates the FILTERS · N count badge", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const countEl = page.locator("#mobile-filter-count");
    await expect(countEl).toHaveText("0");

    await page.locator("#mobile-filter-trigger").click();

    // Pick the first non-empty option of #category from inside the sheet.
    const categorySelect = page.locator("#category");
    const optionValue = await categorySelect.locator("option").nth(1).getAttribute("value");
    expect(optionValue).toBeTruthy();
    await categorySelect.selectOption(optionValue);
    await page.waitForTimeout(250);

    await expect(countEl).toHaveText("1");
  });

  test("DONE button closes the sheet", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.locator("#mobile-filter-trigger").click();
    const sheet = page.locator("#mobile-filter-sheet");
    await expect(sheet).toBeVisible();

    await page.locator("#mobile-filter-done").click();
    await expect(sheet).toBeHidden();
    await expect(page.locator("#mobile-filter-backdrop")).toBeHidden();
    await expect(page.locator("body")).not.toHaveClass(/is-mobile-filter-sheet-open/);
  });

  test("backdrop tap closes the sheet", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.locator("#mobile-filter-trigger").click();
    const sheet = page.locator("#mobile-filter-sheet");
    await expect(sheet).toBeVisible();

    // Backdrop covers the screen; clicking the top-left should close.
    await page.locator("#mobile-filter-backdrop").click({ position: { x: 10, y: 10 } });
    await expect(sheet).toBeHidden();
  });

  test("filter state persists across opening/closing the sheet", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.locator("#mobile-filter-trigger").click();

    const categorySelect = page.locator("#category");
    const optionValue = await categorySelect.locator("option").nth(1).getAttribute("value");
    await categorySelect.selectOption(optionValue);
    await page.waitForTimeout(250);

    await page.locator("#mobile-filter-done").click();
    await expect(page.locator("#mobile-filter-sheet")).toBeHidden();

    // Reopen — the same select value should still be set, count should still be 1.
    await page.locator("#mobile-filter-trigger").click();
    await expect(categorySelect).toHaveValue(optionValue);
    await expect(page.locator("#mobile-filter-count")).toHaveText("1");
  });
});

test.describe("Library — desktop strip preserved at >768px", () => {
  test("at 1280px, the desktop strip is visible and the mobile trigger/sheet are not", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // Body does NOT have the mobile-filters mode flag.
    await expect(page.locator("body")).not.toHaveClass(/is-mobile-filters/);

    // Desktop strip rows are still inside the strip element.
    const stripRowCount = await page.locator("#filter-strip .filter-strip__row").count();
    expect(stripRowCount).toBeGreaterThanOrEqual(3);

    // Trigger and sheet are not visible.
    await expect(page.locator("#mobile-filter-trigger")).toBeHidden();
    await expect(page.locator("#mobile-filter-sheet")).toBeHidden();
    await expect(page.locator("#mobile-filter-backdrop")).toBeHidden();
  });
});
