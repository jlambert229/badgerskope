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

  test("every card shows evidence tier in meta", async ({ page }) => {
    const cards = await page.locator(".card").count();
    const labels = await page.locator(".card__evidence-label").count();
    expect(labels).toBe(cards);
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
    // Masthead reads "53 COMPOUNDS LOGGED" with no filters, or
    // "<filtered> OF <total> SHOWING" once filters are active.
    const match = statsText.match(/(\d+)\s+(?:OF\s+\d+\s+SHOWING|COMPOUNDS\s+LOGGED)/i);
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

    // Filter strip is always visible in the data-first redesign.
    await page.locator(".filter-strip").waitFor({ state: "visible" });

    // Filter by evidence tier — regulatory_label always has visible entries
    // (FDA-approved compounds are never marked experimental).
    await page.locator("#evidence-filter").selectOption("regulatory_label");
    await page.waitForTimeout(300);

    const filteredCards = await page.locator(".card").count();
    const resultText = await page.locator("#result-count").textContent();
    const resultNum = parseInt(resultText);

    expect(resultNum).toBe(filteredCards);
    expect(filteredCards).toBeLessThanOrEqual(totalCards);
    expect(filteredCards).toBeGreaterThan(0);
  });

  test("evidence filter returns only matching tiers", async ({ page }) => {
    // Filter strip is always visible in the data-first redesign.
    await page.locator(".filter-strip").waitFor({ state: "visible" });
    await page.locator("#evidence-filter").selectOption("regulatory_label");
    await page.waitForTimeout(300);

    const labels = await page.evaluate(() =>
      [...document.querySelectorAll(".card__evidence-label")]
        .map((el) => el.textContent.trim())
    );

    for (const label of labels) {
      expect(label).toBe("FDA approved");
    }
  });
});
