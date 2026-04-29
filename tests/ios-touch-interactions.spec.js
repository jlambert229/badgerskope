import { test, expect } from "@playwright/test";
import { ensureFiltersReachable } from "./helpers/mobile-filters.js";

test.describe("Touch interactions (iOS)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
  });

  test("tap on card opens detail", async ({ page }) => {
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(400);

    const open = await page.evaluate(() =>
      document.getElementById("detail-dialog")?.open
    );
    expect(open).toBe(true);
  });

  test("checkbox tap toggles selection", async ({ page }) => {
    const checkbox = page.locator(".card__select input").first();
    await checkbox.check();
    await page.waitForTimeout(200);

    const checked = await checkbox.isChecked();
    expect(checked).toBe(true);

    const countText = await page.locator("#selection-count").textContent();
    expect(countText).toContain("1");
  });

  test("tab bar switches panels", async ({ page }) => {
    await page.locator("#tab-stats").click();
    await page.waitForTimeout(300);

    const statsVisible = await page.evaluate(() =>
      !document.getElementById("panel-stats")?.hidden
    );
    expect(statsVisible).toBe(true);

    await page.locator("#tab-browse").click();
    await page.waitForTimeout(300);

    const browseVisible = await page.evaluate(() =>
      !document.getElementById("panel-browse")?.hidden
    );
    expect(browseVisible).toBe(true);
  });

  test("bookmark star toggles", async ({ page }) => {
    const star = page.locator(".card__bookmark").first();
    const before = await star.textContent();

    await star.click();
    await page.waitForTimeout(200);

    const after = await star.textContent();
    expect(after).not.toBe(before);
  });

  test("filter dropdown responds", async ({ page }) => {
    // PR C: at ≤768px the strip moves into a sheet — open it first.
    await ensureFiltersReachable(page);

    const select = page.locator("#category");
    await select.selectOption({ index: 1 });
    await page.waitForTimeout(300);

    const value = await select.inputValue();
    expect(value).not.toBe("");

    // PR C: `#result-count` lives inside the toggle row, which is reparented
    // into the sheet on mobile (and hidden by sheet CSS). The user-facing
    // confirmation that filtering happened is now `#row-count` ("Showing N
    // of M entries"), which lives outside the strip and is always visible.
    const rowCountText = await page.locator("#row-count").innerText();
    expect(rowCountText).toMatch(/Showing \d+ of \d+ entries/i);
  });

  test("scroll through cards works", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    const endY = await page.evaluate(() => window.scrollY);
    expect(endY).toBeGreaterThan(100);
  });
});
