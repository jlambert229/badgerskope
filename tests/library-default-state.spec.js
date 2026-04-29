import { test, expect } from "@playwright/test";
import { ensureFiltersReachable } from "./helpers/mobile-filters.js";

/**
 * PR D — populated default state + active filter chips + empty-state panel.
 *
 * These tests verify the library `/web/` lands users on a populated table
 * (no headers-with-empty-body), exposes active filters as chips above the
 * table, and shows a brutalist "no matches" panel when filters yield zero.
 */

test.describe("Library — default populated state", () => {
  test("first paint renders >0 rows (no empty body under headers)", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
    const cardCount = await page.locator(".card").count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("'Showing N of M entries' is visible on first paint", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
    const text = await page.locator("#row-count").innerText();
    expect(text).toMatch(/Showing \d+ of \d+ entries/i);
  });
});

test.describe("Library — active filter chips", () => {
  test("selecting a wellness category creates a chip with the correct text", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // PR C: at ≤768px the strip moves into a sheet — open it first.
    await ensureFiltersReachable(page);
    // Pick the first non-empty category option
    const categorySelect = page.locator("#category");
    const optionValue = await categorySelect.locator("option").nth(1).getAttribute("value");
    expect(optionValue).toBeTruthy();
    await categorySelect.selectOption(optionValue);
    await page.waitForTimeout(200);

    const chip = page.locator(".chip-active").first();
    await expect(chip).toBeVisible();
    const chipText = await chip.innerText();
    expect(chipText).toMatch(/×/);
    expect(chipText).toMatch(/WELLNESS/i);
  });

  test("clicking a chip removes the filter and the chip", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // PR C: at ≤768px the strip moves into a sheet — open it first.
    await ensureFiltersReachable(page);
    const categorySelect = page.locator("#category");
    const optionValue = await categorySelect.locator("option").nth(1).getAttribute("value");
    await categorySelect.selectOption(optionValue);
    await page.waitForTimeout(200);

    expect(await page.locator(".chip-active").count()).toBeGreaterThanOrEqual(1);

    // On mobile, close the sheet so the chip row above the trigger is reachable.
    const trigger = page.locator("#mobile-filter-trigger");
    if (await trigger.isVisible()) {
      const done = page.locator("#mobile-filter-done");
      if (await done.isVisible()) await done.click();
    }

    await page.locator(".chip-active").first().click();
    await page.waitForTimeout(200);

    expect(await page.locator(".chip-active").count()).toBe(0);
    await expect(categorySelect).toHaveValue("");
  });

  test("active-filters container collapses (is empty) when no filters are set", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const container = page.locator("#active-filters");
    // CSS rule .active-filters:empty hides the container; ensure no chips inside.
    expect(await container.locator(".chip-active").count()).toBe(0);
  });
});

test.describe("Library — empty-state panel", () => {
  test("0-result filter combo shows the empty-state panel with sarcastic heading + Clear button", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.locator("#search").fill("zzzzz_no_match_query_pr_d");
    await page.waitForTimeout(300);

    const panel = page.locator(".empty-state");
    await expect(panel).toBeVisible();
    // Heading rotates among three subversive lines; assert one of the
    // canonical signal phrases is present rather than pinning to one string.
    await expect(panel.locator(".empty-state__heading"))
      .toHaveText(/PubMed|0 results|negative signal/i);
    await expect(panel.locator(".empty-state__clear")).toBeVisible();
  });

  test("clicking 'Clear all filters' in empty state restores default render", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.locator("#search").fill("zzzzz_no_match_query_pr_d");
    await page.waitForTimeout(300);
    await expect(page.locator(".empty-state")).toBeVisible();

    await page.locator(".empty-state__clear").click();
    await page.waitForTimeout(200);

    expect(await page.locator(".empty-state").count()).toBe(0);
    const cardCount = await page.locator(".card").count();
    expect(cardCount).toBeGreaterThan(0);
    await expect(page.locator("#search")).toHaveValue("");
  });
});
