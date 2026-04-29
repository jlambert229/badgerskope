import { test, expect } from "@playwright/test";

/**
 * PR E — mobile responsive shell fixes.
 *
 * Issue 1: At 390x844 (iPhone 14) the library H1 (.lib-meta-strip) was
 * inheriting the UA default <h1> font-size of 32px and stacking onto 4+
 * lines. Root cause: a stray `}` at app.css (orphan from PR #24) was
 * dropping the .lib-meta-strip rule entirely. Fix: re-wrap the orphan
 * block in its @media rule + apply clamp(8px, 2.2vw, 11px) and tighter
 * tracking on phones so the default copy sits on a single line.
 *
 * Issue 2: At <=700px the right cluster (EVIDENCE / GLOSSARY / HELP) had
 * `display: none` with no fallback — those destinations became
 * unreachable from the topnav. Fix: dual-instance with mobile-only
 * mirrors inside .nav-tabs (the existing horizontal scroller) so all six
 * destinations stay reachable.
 */

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

test.describe("Library — mobile shell @ 390x844", () => {
  test("H1 (lib-meta-strip) is on a single visual line", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // Every direct-child <span> of the H1 must share the same y-baseline.
    // If any wrap, their `top` values diverge by ~line-height.
    const tops = await page.$$eval(
      "h1.lib-meta-strip > span",
      (els) => els.map((e) => Math.round(e.getBoundingClientRect().top)),
    );
    expect(tops.length).toBeGreaterThanOrEqual(2);
    const uniqueTops = [...new Set(tops)];
    expect(uniqueTops.length).toBe(1);

    // Sanity: clamp() shrunk the size below 11px on a 390px viewport.
    const fontSize = await page.evaluate(() => {
      const h = document.querySelector("h1.lib-meta-strip");
      return parseFloat(getComputedStyle(h).fontSize);
    });
    expect(fontSize).toBeLessThan(11);
    expect(fontSize).toBeGreaterThanOrEqual(8);
  });

  test("EVIDENCE / GLOSSARY / HELP are reachable in the tab row", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    // .nav-end (the desktop right cluster) is hidden at narrow widths.
    const navEndDisplay = await page.evaluate(
      () => getComputedStyle(document.querySelector(".nav-end")).display,
    );
    expect(navEndDisplay).toBe("none");

    // Mirrors live inside .nav-tabs and are visible (display !== "none").
    const mirrors = await page.$$eval(
      ".nav-tabs .nav-tab--secondary",
      (els) =>
        els.map((e) => ({
          text: e.textContent.trim(),
          display: getComputedStyle(e).display,
        })),
    );
    const labels = mirrors.map((m) => m.text).sort();
    expect(labels).toEqual(["EVIDENCE", "GLOSSARY", "HELP"]);
    for (const m of mirrors) {
      expect(m.display).not.toBe("none");
    }

    // Each mirror has a >=44px hit area (Apple HIG touch target).
    const heights = await page.$$eval(
      ".nav-tabs .nav-tab--secondary",
      (els) => els.map((e) => Math.round(e.getBoundingClientRect().height)),
    );
    for (const h of heights) {
      expect(h).toBeGreaterThanOrEqual(44);
    }
  });

  test("EVIDENCE mirror navigates to /evidence-guide.html", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
    const link = page.locator('.nav-tabs .nav-tab--secondary[href="/evidence-guide.html"]');
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBe("/evidence-guide.html");
  });
});

test.describe("Library — desktop shell @ 1280x900", () => {
  test(".nav-end renders and mobile mirrors are hidden", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });

    const navEndDisplay = await page.evaluate(
      () => getComputedStyle(document.querySelector(".nav-end")).display,
    );
    expect(navEndDisplay).not.toBe("none");

    const mirrorDisplay = await page.evaluate(
      () => getComputedStyle(document.querySelector(".nav-tab--secondary")).display,
    );
    expect(mirrorDisplay).toBe("none");

    // Desktop H1 stays at the top of the clamp range (11px).
    const fs = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.querySelector("h1.lib-meta-strip")).fontSize),
    );
    expect(fs).toBeCloseTo(11, 0);
  });
});
