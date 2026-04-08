import { test, expect } from "@playwright/test";

test.describe("App bootstrap", () => {
  test("loads without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    expect(errors).toEqual([]);
  });

  test("renders peptide cards from JSON", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const count = await page.locator(".card").count();
    expect(count).toBeGreaterThan(10);
  });

  test("title includes compound count", async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const title = await page.title();
    expect(title).toMatch(/BadgerSkope.*\d+/);
  });

  test("no console warnings about module loading", async ({ page }) => {
    const warnings = [];
    page.on("console", (msg) => {
      if (msg.type() === "warning" || msg.type() === "error") {
        warnings.push(msg.text());
      }
    });

    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const moduleWarnings = warnings.filter(
      (w) => w.includes("import") || w.includes("module") || w.includes("MIME")
    );
    expect(moduleWarnings).toEqual([]);
  });
});
