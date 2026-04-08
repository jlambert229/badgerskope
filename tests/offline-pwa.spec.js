import { test, expect } from "@playwright/test";

test.describe("Offline / PWA — users on flaky connections", () => {
  test("service worker registers", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const swRegistered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    });
    expect(swRegistered).toBe(true);
  });

  test("app shell loads after going offline", async ({ page, context }) => {
    // First visit to populate cache
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // Wait for SW to cache assets
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Try loading again
    await page.reload();
    await page.waitForTimeout(3000);

    // The page HTML should still load from cache
    const title = await page.title();
    expect(title).toContain("BadgerSkope");
  });

  test("JSON data loads from cache offline", async ({ page, context }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
    await page.waitForTimeout(2000);

    await context.setOffline(true);
    await page.reload();
    await page.waitForTimeout(3000);

    // Cards should still render from cached JSON
    const cards = await page.locator(".card").count();
    expect(cards).toBeGreaterThan(0);
  });

  test("slow network still loads within reasonable time", async ({ page }) => {
    // Simulate slow 3G
    const client = await page.context().newCDPSession(page);
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500kbps
      uploadThroughput: (500 * 1024) / 8,
      latency: 400,
    }).catch(() => {}); // CDP not available on all browsers

    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 20_000 });

    const cards = await page.locator(".card").count();
    expect(cards).toBeGreaterThan(0);
  });
});
