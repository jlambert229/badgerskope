import { test, expect } from "@playwright/test";

test.describe("Data integrity — silent data bugs users notice", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
  });

  test("every card has a title (no 'Untitled' entries)", async ({ page }) => {
    const titles = await page.evaluate(() =>
      [...document.querySelectorAll(".card__title")]
        .map((el) => el.textContent.trim())
    );
    expect(titles.length).toBeGreaterThan(0);
    const bad = titles.filter((t) => !t || t === "Untitled" || t === "undefined");
    expect(bad).toEqual([]);
  });

  test("every card has an evidence badge", async ({ page }) => {
    const cards = await page.locator(".card").count();
    const badges = await page.locator(".card__evidence-badge").count();
    expect(badges).toBe(cards);
  });

  test("no duplicate card titles in the grid", async ({ page }) => {
    const titles = await page.evaluate(() =>
      [...document.querySelectorAll(".card__title")].map((el) => el.textContent.trim())
    );
    const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect(dupes).toEqual([]);
  });

  test("all prices are formatted consistently ($ prefix)", async ({ page }) => {
    const prices = await page.evaluate(() =>
      [...document.querySelectorAll(".card__price")]
        .map((el) => el.textContent.trim())
        .filter((p) => p.length > 0)
    );
    const bad = prices.filter((p) => !p.startsWith("$") && !p.match(/^\d/));
    expect(bad).toEqual([]);
  });

  test("card count matches stats display", async ({ page }) => {
    const cardCount = await page.locator(".card").count();
    const statsText = await page.locator("#stats").textContent();
    const match = statsText.match(/Showing (\d+) of (\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match[1])).toBe(cardCount);
  });

  test("no broken source links in detail view", async ({ page }) => {
    // Open first card detail
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(400);

    const links = await page.evaluate(() =>
      [...document.querySelectorAll("#detail-body a[href]")]
        .map((a) => ({ href: a.href, text: a.textContent.trim() }))
    );

    for (const link of links) {
      expect(link.href).not.toBe("");
      expect(link.href).not.toBe("undefined");
      expect(link.href).not.toContain("javascript:");
      if (link.href.startsWith("http")) {
        expect(link.href).toMatch(/^https?:\/\/.+\..+/);
      }
    }
  });

  test("filter counts are accurate after filtering", async ({ page }) => {
    const totalCards = await page.locator(".card").count();

    // Apply a category filter
    await page.locator("#category").selectOption({ index: 1 });
    await page.waitForTimeout(300);

    const filteredCards = await page.locator(".card").count();
    const resultText = await page.locator("#result-count").textContent();
    const resultNum = parseInt(resultText);

    expect(resultNum).toBe(filteredCards);
    expect(filteredCards).toBeLessThanOrEqual(totalCards);
    expect(filteredCards).toBeGreaterThan(0);
  });

  test("evidence filter returns only matching tiers", async ({ page }) => {
    await page.locator("#evidence-filter").selectOption("regulatory_label");
    await page.waitForTimeout(300);

    const badges = await page.evaluate(() =>
      [...document.querySelectorAll(".card__evidence-badge")]
        .map((el) => el.textContent.trim())
    );

    for (const badge of badges) {
      expect(badge).toBe("FDA approved");
    }
  });
});
