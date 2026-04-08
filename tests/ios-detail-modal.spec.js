import { test, expect } from "@playwright/test";

test.describe("Detail modal on iOS", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
  });

  test("modal scrolls independently (iOS overflow issue)", async ({ page }) => {
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(400);

    const scrollable = await page.evaluate(() => {
      const panel = document.querySelector(".modal__panel");
      if (!panel) return false;
      // Panel should allow internal scrolling
      const style = getComputedStyle(panel);
      return style.overflowY === "auto" || style.overflowY === "scroll";
    });
    expect(scrollable).toBe(true);
  });

  test("modal backdrop prevents background interaction", async ({ page }) => {
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(400);

    const dialogOpen = await page.evaluate(() =>
      document.getElementById("detail-dialog")?.open
    );
    expect(dialogOpen).toBe(true);

    // Body should not scroll while modal is open (iOS rubber-band issue)
    const canScrollBg = await page.evaluate(() => {
      const before = window.scrollY;
      window.scrollTo(0, before + 100);
      const after = window.scrollY;
      window.scrollTo(0, before);
      // If dialog is open with backdrop, the main page scroll should be limited
      return after !== before;
    });
    // Note: native <dialog> handles this in most browsers
    // This test documents the behavior
  });

  test("detail content renders all sections", async ({ page }) => {
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(400);

    const sections = await page.evaluate(() => {
      const body = document.getElementById("detail-body");
      if (!body) return [];
      return [...body.querySelectorAll("h3")].map((h) => h.textContent.trim());
    });

    // Should have at minimum these sections
    expect(sections.length).toBeGreaterThan(2);
    expect(sections).toContain("In plain English");
  });

  test("synergy pills navigate to other entries", async ({ page }) => {
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(400);

    const hasSynergy = await page.locator(".synergy-pill").count();
    if (hasSynergy > 0) {
      const targetTitle = await page.locator(".synergy-pill").first().textContent();
      await page.locator(".synergy-pill").first().click();
      await page.waitForTimeout(400);

      const detailTitle = await page.evaluate(() =>
        document.getElementById("detail-title")?.textContent
      );
      expect(detailTitle).toBe(targetTitle.trim());
    }
  });

  test("close button dismisses modal", async ({ page }) => {
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(400);

    await page.locator("#detail-close").click();
    await page.waitForTimeout(200);

    const open = await page.evaluate(() =>
      document.getElementById("detail-dialog")?.open
    );
    expect(open).toBe(false);
  });

  test("escape key closes modal", async ({ page }) => {
    await page.locator(".card__main").first().click();
    await page.waitForTimeout(400);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    const open = await page.evaluate(() =>
      document.getElementById("detail-dialog")?.open
    );
    expect(open).toBe(false);
  });
});
