import { test, expect } from "@playwright/test";

/**
 * Tier color delineation — five-step ramp.
 *
 * Verifies that each evidence tier renders its OWN distinct color, not
 * a single olive blob. Asserts:
 *   1. design-tokens.css resolves --tier-a..--tier-f to expected hex.
 *   2. The methodology "FIVE TIERS. ONE SCALE." legend chips on `/`
 *      render with the correct background per data-grade.
 *   3. The legend-bar fill on each row picks up its tier color (not olive
 *      across all rows).
 *   4. Tier F chip flips ink to --fg (rust on dark text fails AA).
 */

const TIER_RGB = {
  A: "rgb(45, 168, 156)", // #2DA89C deep teal
  B: "rgb(74, 159, 31)",  // #4A9F1F forest green
  C: "rgb(198, 138, 10)", // #C68A0A mustard
  D: "rgb(217, 98, 27)",  // #D9621B burnt orange
  F: "rgb(156, 24, 24)",  // #9C1818 crimson
};

const TIER_HEX = {
  A: "#2DA89C",
  B: "#4A9F1F",
  C: "#C68A0A",
  D: "#D9621B",
  F: "#9C1818",
};

test.describe("tier color delineation", () => {
  test("--tier-a..--tier-f tokens resolve to the expected ramp", async ({ page }) => {
    await page.goto("/");

    const tokens = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const norm = (s) => s.trim().toLowerCase();
      return {
        a: norm(cs.getPropertyValue("--tier-a")),
        b: norm(cs.getPropertyValue("--tier-b")),
        c: norm(cs.getPropertyValue("--tier-c")),
        d: norm(cs.getPropertyValue("--tier-d")),
        f: norm(cs.getPropertyValue("--tier-f")),
      };
    });

    // --tier-a is var(--accent-tier-a) which itself is #C8D17A; lower-cased
    // hex compare so we don't trip on case.
    expect(tokens.a).toBe(TIER_HEX.A.toLowerCase());
    expect(tokens.b).toBe(TIER_HEX.B.toLowerCase());
    expect(tokens.c).toBe(TIER_HEX.C.toLowerCase());
    expect(tokens.d).toBe(TIER_HEX.D.toLowerCase());
    expect(tokens.f).toBe(TIER_HEX.F.toLowerCase());
  });

  for (const grade of ["A", "B", "C", "D", "F"]) {
    test(`legend tier ${grade} chip background is ${TIER_HEX[grade]}`, async ({ page }) => {
      await page.goto("/");
      const chip = page.locator(`.legend-row[data-grade="${grade}"] .tier-letter`);
      await expect(chip).toBeVisible();

      const bg = await chip.evaluate((n) => getComputedStyle(n).backgroundColor);
      expect(bg).toBe(TIER_RGB[grade]);
    });

    test(`legend tier ${grade} bar fill is ${TIER_HEX[grade]}`, async ({ page, viewport }) => {
      // .legend-bar is intentionally hidden below 1100px (mobile collapse).
      test.skip((viewport?.width ?? 0) < 1100, "legend-bar hidden below 1100px");

      await page.goto("/");
      const bar = page.locator(`.legend-row[data-grade="${grade}"] .legend-bar > span`);
      await expect(bar).toBeVisible();

      const bg = await bar.evaluate((n) => getComputedStyle(n).backgroundColor);
      expect(bg).toBe(TIER_RGB[grade]);
    });
  }

  test("tier F chip uses --fg ink (rust fails AA against dark)", async ({ page }) => {
    await page.goto("/");
    const chip = page.locator('.legend-row[data-grade="F"] .tier-letter');
    const color = await chip.evaluate((n) => getComputedStyle(n).color);
    // --fg is #F2EFE5 → rgb(242, 239, 229).
    expect(color).toBe("rgb(242, 239, 229)");
  });

  test("tier A chip retains dark ink (olive vs dark passes AA)", async ({ page }) => {
    await page.goto("/");
    const chip = page.locator('.legend-row[data-grade="A"] .tier-letter');
    const color = await chip.evaluate((n) => getComputedStyle(n).color);
    // Ink references --bg (#1A1A18 → rgb(26, 26, 24)).
    expect(color).toBe("rgb(26, 26, 24)");
  });
});
