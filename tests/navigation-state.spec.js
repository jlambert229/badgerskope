import { test, expect } from "@playwright/test";
import { ensureFiltersReachable } from "./helpers/mobile-filters.js";

test.describe("Navigation and state — bugs that lose user context", () => {
  test("search state persists in URL hash", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.fill("#search", "bpc");
    await page.waitForTimeout(300);

    const hash = await page.evaluate(() => location.hash);
    expect(hash).toContain("search=bpc");
  });

  test("URL hash restores filters on reload", async ({ page }) => {
    // Use "semaglutide" — an FDA-approved compound (non-experimental, visible by default).
    await page.goto("/web/#search=semaglutide");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const searchValue = await page.locator("#search").inputValue();
    expect(searchValue).toBe("semaglutide");

    const cardCount = await page.locator(".card").count();
    expect(cardCount).toBeGreaterThan(0);
    expect(cardCount).toBeLessThan(45);
  });

  test("deep link to entry opens detail modal", async ({ page }) => {
    // Catalog title must match getEntryByTitle() (case-insensitive).
    // After the dedupe pass dropped SKU size variants, the canonical
    // catalog title for Semaglutide is "1G-SGT" (no trailing dose).
    await page.goto("/web/#entry=1G-SGT");
    await page.waitForSelector(".card", { timeout: 10_000 });
    await page.waitForTimeout(500);

    const open = await page.evaluate(() =>
      document.getElementById("detail-dialog")?.open
    );
    expect(open).toBe(true);
    const title = await page.evaluate(() =>
      document.getElementById("detail-title")?.textContent?.trim()
    );
    expect(title?.toLowerCase()).toContain("semaglutide");
    const catalogSku = await page.evaluate(() =>
      document.getElementById("detail-title")?.dataset?.catalogTitle?.trim()
    );
    expect(catalogSku?.toLowerCase()).toContain("1g-sgt");
    const hash = await page.evaluate(() => location.hash);
    expect(hash).toContain("entry=");
  });

  test("deep link by common drug name opens same entry", async ({ page }) => {
    await page.goto(
      "/web/#entry=" + encodeURIComponent("Semaglutide")
    );
    await page.waitForSelector(".card", { timeout: 10_000 });
    await page.waitForTimeout(500);
    const sku = await page.evaluate(() =>
      document.getElementById("detail-title")?.dataset?.catalogTitle?.trim()
    );
    expect(sku).toBe("1G-SGT");
  });

  test("back button does not break after modal close", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // Open and close a modal
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(400);
    await page.locator("#detail-close").click();
    await page.waitForTimeout(300);

    // Page should still be functional
    const cards = await page.locator(".card").count();
    expect(cards).toBeGreaterThan(0);
  });

  test("tab state persists in URL", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.click("#tab-stats");
    await page.waitForTimeout(300);

    const hash = await page.evaluate(() => location.hash);
    expect(hash).toContain("tab=stats");
  });

  // "selection survives tab switching" — removed. The COMPARE feature
  // was retired along with the per-row select checkbox and the
  // selection-count bar. Nothing to persist across tab switches anymore.

  test("bookmarks survive page reload", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.locator(".card__bookmark").first().click();
    await page.waitForTimeout(200);

    // Reload
    await page.reload();
    await page.waitForSelector(".card", { timeout: 10_000 });

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("peptide-bookmarks") || "[]")
    );
    expect(stored.length).toBeGreaterThan(0);
  });

  test("reset filters clears all state", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // Filter strip is always reachable — open the mobile sheet if needed.
    await ensureFiltersReachable(page);

    await page.fill("#search", "test");
    await page.locator("#category").selectOption({ index: 1 });
    await page.waitForTimeout(300);

    // PR C: close the sheet before clicking the search-bar reset, since
    // the sheet covers the bottom 85vh on mobile.
    const trigger = page.locator("#mobile-filter-trigger");
    if (await trigger.isVisible()) {
      const done = page.locator("#mobile-filter-done");
      if (await done.isVisible()) await done.click();
    }

    // Reset
    await page.click("#reset-filters");
    await page.waitForTimeout(300);

    expect(await page.locator("#search").inputValue()).toBe("");
    expect(await page.locator("#category").inputValue()).toBe("");

    const hash = await page.evaluate(() => location.hash);
    expect(hash).toBe("" );
  });
});
