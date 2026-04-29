import { test, expect } from "@playwright/test";

/**
 * PR G — Inline column labels at narrow viewports (<1100px).
 *
 * At wide viewports the .lib-table__head row labels each column
 * (FILE / COMPOUND / EVIDENCE / WELLNESS / SUMMARY). At <1100px that
 * header is hidden by an existing rule, so each row cell self-labels via
 * a `::before` pseudo-element driven by `data-label="…"` set in cards.js.
 *
 * These tests use `page.setViewportSize` directly so they run regardless
 * of the device emulation profile. They only run in chromium-based desktop
 * projects (skipped on iPhone/iPad/Safari profiles where the layout target
 * is fundamentally different and viewport overrides may conflict with
 * device emulation).
 */

test.describe("Library — inline column labels at narrow viewports", () => {
  test("at 1024x768: header is hidden and ::before labels appear on row cells", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name.startsWith("safari") ||
        testInfo.project.name === "chrome-iphone" ||
        testInfo.project.name === "chrome-ipad" ||
        testInfo.project.name === "ipad",
      "narrow-desktop layout test",
    );
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/web/");
    await page.waitForSelector(".lib-row", { timeout: 10_000 });

    // Sticky table head should be display:none below 1100px.
    const headDisplay = await page.$eval(
      ".lib-table__head",
      (el) => getComputedStyle(el).display,
    );
    expect(headDisplay).toBe("none");

    // Each labeled cell should have a ::before whose content includes the label.
    const labels = await page.$$eval(
      ".lib-row:first-of-type [data-label]",
      (els) =>
        els
          .filter((el) => getComputedStyle(el).display !== "none")
          .map((el) => ({
            label: el.getAttribute("data-label"),
            beforeContent: getComputedStyle(el, "::before").content,
            beforeFontFamily: getComputedStyle(el, "::before").fontFamily,
            beforeTextTransform: getComputedStyle(el, "::before").textTransform,
          })),
    );

    // Spec: FILE / COMPOUND / EVIDENCE / SUMMARY are visible at <1100px.
    // (WELLNESS cell is itself hidden at this breakpoint by existing rule.)
    const visibleLabels = labels.map((l) => l.label).sort();
    expect(visibleLabels).toEqual(["COMPOUND", "EVIDENCE", "FILE", "SUMMARY"]);

    for (const l of labels) {
      // ::before content surfaces the label text. Browsers may quote the
      // attr() value, so check for substring rather than equality.
      expect(l.beforeContent).toContain(l.label);
      // Brand: mono uppercase metadata.
      expect(l.beforeFontFamily.toLowerCase()).toMatch(/mono/);
      expect(l.beforeTextTransform).toBe("uppercase");
    }
  });

  test("at 1440x900: header is visible and ::before labels are absent", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name.startsWith("safari") ||
        testInfo.project.name === "chrome-iphone" ||
        testInfo.project.name === "chrome-ipad" ||
        testInfo.project.name === "ipad",
      "wide-desktop layout test",
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/web/");
    await page.waitForSelector(".lib-row", { timeout: 10_000 });

    // Sticky table head should be visible (grid).
    const headDisplay = await page.$eval(
      ".lib-table__head",
      (el) => getComputedStyle(el).display,
    );
    expect(headDisplay).toBe("grid");

    // ::before content for each labeled cell should be `none` at this width
    // — the table head is doing the labeling job, no duplication.
    const beforeContents = await page.$$eval(
      ".lib-row:first-of-type [data-label]",
      (els) =>
        els.map((el) => ({
          label: el.getAttribute("data-label"),
          beforeContent: getComputedStyle(el, "::before").content,
        })),
    );

    expect(beforeContents.length).toBeGreaterThanOrEqual(4);
    for (const c of beforeContents) {
      expect(c.beforeContent).toBe("none");
    }
  });
});
