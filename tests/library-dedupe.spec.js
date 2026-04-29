import { test, expect } from "@playwright/test";

/**
 * Library dedupe regression — base compounds appear exactly once.
 *
 * Backstop for the dedupe pass that dropped SKU size variants
 * (Tirzepatide 15/30/60mg, Retatrutide 20/36mg, Semaglutide 20mg,
 * Tesamorelin 15/20mg) and stripped trailing "(N mg)" suffixes.
 *
 * If a future dataset edit re-introduces multiple rows for the same base
 * compound, these assertions fail loudly. SomatoPulse is the one exception:
 * it's a Tesamorelin + Ipamorelin combo product, not a Tesamorelin SKU dupe.
 */
test.describe("Library — dedupe by base compound", () => {
  test.beforeEach(async ({ page }) => {
    // Surface experimental rows so any stray duplicate isn't filtered out
    // by the default-state experimental hide. Set the storage key before
    // first paint so the initial render already includes them.
    await page.addInitScript(() => {
      try {
        localStorage.setItem("badgerskope.showExperimental", "1");
      } catch {
        /* ignore */
      }
    });
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
  });

  test("Tirzepatide appears exactly once", async ({ page }) => {
    const titles = await page.evaluate(() =>
      [...document.querySelectorAll(".card__title")].map((el) =>
        el.textContent.trim().toLowerCase()
      )
    );
    const matches = titles.filter((t) => t === "tirzepatide");
    expect(matches.length).toBe(1);
  });

  test("Retatrutide appears exactly once", async ({ page }) => {
    const titles = await page.evaluate(() =>
      [...document.querySelectorAll(".card__title")].map((el) =>
        el.textContent.trim().toLowerCase()
      )
    );
    const matches = titles.filter((t) => t === "retatrutide");
    expect(matches.length).toBe(1);
  });

  test("Semaglutide appears exactly once", async ({ page }) => {
    const titles = await page.evaluate(() =>
      [...document.querySelectorAll(".card__title")].map((el) =>
        el.textContent.trim().toLowerCase()
      )
    );
    const matches = titles.filter((t) => t === "semaglutide");
    expect(matches.length).toBe(1);
  });

  test("Tesamorelin appears exactly once (SomatoPulse combo is separate)", async ({ page }) => {
    // Default-state caps the table at 25 evidence-A rows, so SomatoPulse
    // (lower tier) won't render until a non-default filter trips the cap.
    // Searching "morelin" returns both Tesamorelin and SomatoPulse and
    // bypasses the 25-row default-state slice.
    await page.locator("#search").fill("morelin");
    await page.waitForTimeout(400);

    const titles = await page.evaluate(() =>
      [...document.querySelectorAll(".card__title")].map((el) =>
        el.textContent.trim().toLowerCase()
      )
    );
    const exact = titles.filter((t) => t === "tesamorelin");
    expect(exact.length).toBe(1);
    // SomatoPulse stays as its own combo entry.
    const combo = titles.filter((t) => t.includes("somatopulse"));
    expect(combo.length).toBe(1);
  });

  test("no card title contains a trailing '(N mg)' size suffix", async ({ page }) => {
    const titles = await page.evaluate(() =>
      [...document.querySelectorAll(".card__title")].map((el) =>
        el.textContent.trim()
      )
    );
    const offenders = titles.filter((t) => /\(\s*\d+\s*mg\s*\)\s*$/i.test(t));
    expect(offenders).toEqual([]);
  });
});
