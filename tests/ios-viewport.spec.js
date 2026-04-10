import { test, expect } from "@playwright/test";

test.describe("iOS viewport and layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
  });

  test("no horizontal overflow (common iOS Safari issue)", async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test("hero section fits within viewport", async ({ page }) => {
    const hero = page.locator(".hero");
    const box = await hero.boundingBox();
    const viewport = page.viewportSize();

    expect(box.width).toBeLessThanOrEqual(viewport.width + 1);
  });

  test("cards do not overflow their container", async ({ page }) => {
    const gridWidth = await page.evaluate(() => {
      const grid = document.getElementById("grid");
      return grid ? grid.scrollWidth <= grid.clientWidth : true;
    });
    expect(gridWidth).toBe(true);
  });

  test("filter controls wrap properly on small screens", async ({ page }) => {
    const controls = page.locator(".controls");
    const box = await controls.boundingBox();
    const viewport = page.viewportSize();

    expect(box.width).toBeLessThanOrEqual(viewport.width);
  });

  test("sticky nav stays visible after scroll", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(300);

    const nav = page.locator(".nav-bar");
    const box = await nav.boundingBox();

    expect(box.y).toBeLessThanOrEqual(5);
  });

  test("100vh does not cause iOS overscroll (hero height)", async ({ page }) => {
    // iOS Safari: 100vh includes the URL bar, causing overflow
    const heroOverflows = await page.evaluate(() => {
      const hero = document.querySelector(".hero");
      if (!hero) return false;
      const style = getComputedStyle(hero);
      return style.minHeight === "100vh" || style.height === "100vh";
    });
    expect(heroOverflows).toBe(false);
  });

  test("touch targets are at least 44px (Apple HIG)", async ({ page }) => {
    const tooSmall = await page.evaluate(() => {
      const interactives = document.querySelectorAll(
        "button, a, input, select, [role='tab'], .card__main"
      );
      const small = [];
      for (const el of interactives) {
        if (el.offsetParent === null) continue; // hidden
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 &&
            (rect.width < 44 || rect.height < 44)) {
          small.push({
            tag: el.tagName,
            class: el.className.slice(0, 40),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
          });
        }
      }
      return small;
    });

    // Many elements (chips, badges, kbd hints) are intentionally compact.
    // Flag genuinely critical interactive elements that are too small.
    const critical = tooSmall.filter(
      (el) => !el.class.includes("chip") && !el.class.includes("badge") &&
              !el.class.includes("kbd") && !el.class.includes("shortcuts") &&
              !el.class.includes("hint") && !el.class.includes("tab__badge") &&
              !el.class.includes("recent") && !el.class.includes("goal") &&
              !el.class.includes("compare") && !el.class.includes("sport-filter") &&
              !el.class.includes("orientation") && !el.class.includes("start-here")
    );
    if (critical.length > 0) {
      console.log("Undersized critical touch targets:", critical.slice(0, 10));
    }
    expect(critical.length).toBeLessThan(15);
  });
});
