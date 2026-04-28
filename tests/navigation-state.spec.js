import { test, expect } from "@playwright/test";

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
    expect(cardCount).toBeLessThan(53);
  });

  test("deep link to entry opens detail modal", async ({ page }) => {
    // Catalog title must match getEntryByTitle() (case-insensitive)
    await page.goto("/web/#entry=1G-SGT%2010mg");
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
      "/web/#entry=" + encodeURIComponent("Semaglutide (10 mg)")
    );
    await page.waitForSelector(".card", { timeout: 10_000 });
    await page.waitForTimeout(500);
    const sku = await page.evaluate(() =>
      document.getElementById("detail-title")?.dataset?.catalogTitle?.trim()
    );
    expect(sku).toBe("1G-SGT 10mg");
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

  test("selection survives tab switching", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // Select two cards
    await page.locator(".card__select input").nth(0).check();
    await page.locator(".card__select input").nth(1).check();
    await page.waitForTimeout(200);

    // Switch to stats and back
    await page.click("#tab-stats");
    await page.waitForTimeout(300);
    await page.click("#tab-browse");
    await page.waitForTimeout(300);

    // Selections should persist
    const count = await page.locator("#selection-count").textContent();
    expect(count).toContain("2");
  });

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

    // Filter strip is always visible — no drawer to open.
    await page.locator(".filter-strip").waitFor({ state: "visible" });

    await page.fill("#search", "test");
    await page.locator("#category").selectOption({ index: 1 });
    await page.waitForTimeout(300);

    // Reset
    await page.click("#reset-filters");
    await page.waitForTimeout(300);

    expect(await page.locator("#search").inputValue()).toBe("");
    expect(await page.locator("#category").inputValue()).toBe("");

    const hash = await page.evaluate(() => location.hash);
    expect(hash).toBe("" );
  });
});
