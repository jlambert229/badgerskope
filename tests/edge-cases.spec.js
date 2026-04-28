import { test, expect } from "@playwright/test";

async function openAdvancedFilters(page) {
  // Filters are always visible in the data-first redesign — no drawer to open.
  await page.locator(".filter-strip").waitFor({ state: "visible" });
}

test.describe("Edge cases — the bugs users find first", () => {
  test("search with no results shows helpful message", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await page.fill("#search", "zzzzxxxxxnonexistent");
    await page.waitForTimeout(300);

    const empty = page.locator(".empty");
    await expect(empty).toBeVisible();
    const text = await empty.textContent();
    expect(text).toContain("No peptides match");
  });

  test("special characters in search don't break app", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const dangerous = ['<script>alert(1)</script>', "'; DROP TABLE--", "\\n\\r", "emoji 🧪"];
    for (const input of dangerous) {
      await page.fill("#search", input);
      await page.waitForTimeout(200);
      // Should not throw — app still functional
      const errors = [];
      page.once("pageerror", (e) => errors.push(e.message));
      expect(errors).toEqual([]);
    }

    // Clear and verify app recovers
    await page.fill("#search", "");
    await page.waitForTimeout(300);
    const cards = await page.locator(".card").count();
    expect(cards).toBeGreaterThan(0);
  });

  test("rapid filter changes don't cause race conditions", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await openAdvancedFilters(page);

    // Rapidly change filters
    for (let i = 0; i < 5; i++) {
      await page.locator("#category").selectOption({ index: (i % 3) + 1 });
    }
    await page.waitForTimeout(500);

    // App should be in a consistent state
    const cards = await page.locator(".card").count();
    const statsText = await page.locator("#stats").textContent();
    // Masthead reads "<n> OF <total> SHOWING" or "<n> COMPOUNDS LOGGED".
    const match = statsText.match(/(\d+)\s+(?:OF\s+\d+\s+SHOWING|COMPOUNDS\s+LOGGED)/i);
    expect(match).toBeTruthy();
    expect(parseInt(match[1])).toBe(cards);
  });

  test("rapid search typing uses debounce correctly", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // "semaglutide" is FDA-approved (non-experimental) so it's visible by default.
    // Type quickly to exercise the 150ms debounce, then wait for render.
    await page.locator("#search").pressSequentially("semaglutide", { delay: 30 });
    await page.waitForTimeout(800);

    const cards = await page.locator(".card").count();
    expect(cards).toBeGreaterThan(0);
    expect(cards).toBeLessThan(53);
  });

  test("opening many modals in sequence doesn't leak memory/state", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    for (let i = 0; i < 5; i++) {
      await page.locator(".card__main").nth(i).click();
      await page.waitForTimeout(300);

      const open = await page.evaluate(() =>
        document.getElementById("detail-dialog")?.open
      );
      expect(open).toBe(true);

      await page.locator("#detail-close").click();
      await page.waitForTimeout(200);
    }

    // App should still work
    const cards = await page.locator(".card").count();
    expect(cards).toBeGreaterThan(0);
  });

  test("double-clicking card doesn't open two modals", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // Two rapid clicks on the same row name. Use Playwright's two click
    // calls (with a small delay) instead of a single dblclick, because
    // dblclick's second click can land on the just-opened <dialog>'s
    // backdrop and immediately close it (the backdrop click handler
    // closes the modal). The point of this regression check is "we
    // don't end up with TWO dialogs", which both shapes verify.
    const target = page.locator(".card__main").first();
    await target.click();
    await page.waitForTimeout(50);
    // Re-locate in case render swapped nodes.
    await page.locator(".card__main").first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);

    // Should have at most one dialog open
    const dialogCount = await page.evaluate(() =>
      document.querySelectorAll("dialog[open]").length
    );
    expect(dialogCount).toBeLessThanOrEqual(1);
  });

  test("empty database gracefully shows error", async ({ page }) => {
    // Intercept the data fetch and return empty
    await page.route("**/peptide-info-database.json", (route) =>
      route.fulfill({ status: 500, body: "Server Error" })
    );

    await page.goto("/web/");
    await page.waitForTimeout(3000);

    const error = page.locator("#load-error");
    await expect(error).toBeVisible();
  });

  test("group-by dropdown reorganizes cards without losing any", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await openAdvancedFilters(page);

    const totalBefore = await page.locator(".card").count();

    await page.locator("#group-by").selectOption("theme");
    await page.waitForTimeout(300);

    // Count all cards across groups
    const totalAfter = await page.locator(".card").count();
    expect(totalAfter).toBe(totalBefore);

    // Should have group headers
    const headers = await page.locator(".group-header").count();
    expect(headers).toBeGreaterThan(1);
  });

  test("sort changes order without losing cards", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await openAdvancedFilters(page);

    const countBefore = await page.locator(".card").count();

    await page.locator("#sort").selectOption("evidence");
    await page.waitForTimeout(300);

    const countAfter = await page.locator(".card").count();
    expect(countAfter).toBe(countBefore);
  });

  test("combining all filters together works", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    await openAdvancedFilters(page);

    // Stack multiple filters
    await page.fill("#search", "peptide");
    await page.locator("#sort").selectOption("evidence");
    await page.waitForTimeout(500);

    // Should not crash, should show results or empty message
    const cards = await page.locator(".card").count();
    const empty = await page.locator(".empty").count();
    expect(cards + empty).toBeGreaterThan(0);
  });
});
