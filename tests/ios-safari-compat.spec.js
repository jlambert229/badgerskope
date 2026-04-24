import { test, expect } from "@playwright/test";

test.describe("iOS Safari compatibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
  });

  test("ES modules load in WebKit", async ({ page }) => {
    // Verify main.js loaded as a module
    const moduleLoaded = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="module"]');
      return scripts.length > 0;
    });
    expect(moduleLoaded).toBe(true);

    // Verify cards rendered (proves the module chain worked)
    const cards = await page.locator(".card").count();
    expect(cards).toBeGreaterThan(0);
  });

  test("CSS custom properties resolve correctly", async ({ page }) => {
    const hasVars = await page.evaluate(() => {
      const el = document.querySelector(".card");
      if (!el) return false;
      const style = getComputedStyle(el);
      const bg = style.backgroundColor;
      // Should be a real color, not empty or "transparent" from unresolved var
      return bg && bg !== "transparent" && bg !== "";
    });
    expect(hasVars).toBe(true);
  });

  test("dialog element works (iOS 15.4+)", async ({ page }) => {
    // Click first card to open detail modal
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(300);

    const dialogOpen = await page.evaluate(() => {
      const dialog = document.getElementById("detail-dialog");
      return dialog?.open === true;
    });
    expect(dialogOpen).toBe(true);

    // Close via the close button
    await page.locator("#detail-close").click();
    await page.waitForTimeout(200);

    const dialogClosed = await page.evaluate(() => {
      const dialog = document.getElementById("detail-dialog");
      return dialog?.open === false;
    });
    expect(dialogClosed).toBe(true);
  });

  test("localStorage works (bookmarks persist)", async ({ page }) => {
    // Bookmark the first card
    await page.locator(".card__bookmark").first().click();
    await page.waitForTimeout(200);

    const stored = await page.evaluate(() => {
      return localStorage.getItem("peptide-bookmarks");
    });
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored);
    expect(parsed.length).toBeGreaterThan(0);
  });

  test("select dropdowns are interactive", async ({ page }) => {
    // #category lives inside #advanced-filters (collapsed by default) — open it first
    await page.click("#filters-toggle");
    await page.locator("#advanced-filters").waitFor({ state: "visible" });

    const category = page.locator("#category");
    await expect(category).toBeVisible();

    // Get option count
    const optionCount = await category.locator("option").count();
    expect(optionCount).toBeGreaterThan(2);

    // Select an option
    await category.selectOption({ index: 1 });
    const value = await category.inputValue();
    expect(value).not.toBe("");
  });

  test("search input accepts text and filters", async ({ page }) => {
    const initialCount = await page.locator(".card").count();

    await page.fill("#search", "semaglutide");
    await page.waitForTimeout(300);

    const filteredCount = await page.locator(".card").count();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("theme toggle switches between dark and light", async ({ page }) => {
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );

    await page.click("#theme-toggle");
    await page.waitForTimeout(100);

    const newTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );

    expect(newTheme).not.toBe(initialTheme);
  });

  test("smooth scroll does not break (iOS scroll quirks)", async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: "smooth" }));
    await page.waitForTimeout(500);

    const scrollPos = await page.evaluate(() => window.scrollY);
    expect(scrollPos).toBeGreaterThan(100);

    // Back to top button should appear
    const backToTop = page.locator("#back-to-top");
    await expect(backToTop).toBeVisible();
  });

  test("position: sticky works in WebKit", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(300);

    const navVisible = await page.evaluate(() => {
      const nav = document.querySelector(".nav-bar");
      if (!nav) return false;
      const rect = nav.getBoundingClientRect();
      return rect.top >= -1 && rect.top <= 5;
    });
    expect(navVisible).toBe(true);
  });
});
