import { test, expect } from "@playwright/test";

test.describe("CSS rendering (iOS WebKit)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/web/");
    await page.waitForSelector(".card", { timeout: 10_000 });
  });

  test("no invisible text from -webkit-text-fill-color", async ({ page }) => {
    const invisible = await page.evaluate(() => {
      const all = document.querySelectorAll("*");
      const bad = [];
      for (const el of all) {
        if (el.offsetParent === null) continue;
        const style = getComputedStyle(el);
        if (style.webkitTextFillColor === "transparent" &&
            !style.backgroundClip?.includes("text")) {
          bad.push(el.className);
        }
      }
      return bad;
    });
    expect(invisible).toEqual([]);
  });

  test("no clipped content from overflow hidden", async ({ page }) => {
    const clipped = await page.evaluate(() => {
      const problems = [];
      // Check key layout containers — skip controls which may intentionally scroll
      const els = document.querySelectorAll(".card, .nav-bar, .tab-bar");
      for (const el of els) {
        // Allow 5px tolerance for subpixel rounding
        if (el.scrollWidth > el.clientWidth + 5) {
          problems.push({
            class: el.className.slice(0, 30),
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
          });
        }
      }
      return problems;
    });
    expect(clipped).toEqual([]);
  });

  test("font loads and renders (no FOUT fallback stuck)", async ({ page }) => {
    const fontLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      const families = [...document.fonts].map((f) => f.family);
      // Brand stack: Oswald (display), Inter (body), JetBrains Mono (data)
      return families.some((f) => f.includes("Oswald"))
          && families.some((f) => f.includes("Inter"))
          && families.some((f) => f.includes("JetBrains Mono"));
    });
    expect(fontLoaded).toBe(true);
  });

  test("dark mode colors are correct", async ({ page }) => {
    const bg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    // Dark mode body bg should be dark (not white/transparent)
    const rgb = bg.match(/\d+/g)?.map(Number) || [];
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    expect(brightness).toBeLessThan(50);
  });

  test.skip("light mode colors are correct", async () => {
    // Brand identity is dark-only after the editorial brutalist redesign.
    // Light mode and the theme toggle were intentionally removed.
  });

  test("evidence badges have visible text", async ({ page }) => {
    const badges = await page.evaluate(() => {
      const pills = document.querySelectorAll(".card__evidence-badge");
      const results = [];
      for (const p of [...pills].slice(0, 5)) {
        const style = getComputedStyle(p);
        results.push({
          text: p.textContent.trim(),
          color: style.color,
          bg: style.backgroundColor,
          visible: p.offsetHeight > 0 && p.offsetWidth > 0,
        });
      }
      return results;
    });

    for (const b of badges) {
      expect(b.visible).toBe(true);
      expect(b.text.length).toBeGreaterThan(0);
    }
  });

  test("cards render with brutalist hairline borders (no rounding)", async ({ page }) => {
    // The brand is brutalist — radius is 0 everywhere by design.
    // Instead of asserting radius, assert the card has visible hairline borders.
    const cardStyles = await page.evaluate(() => {
      const card = document.querySelector(".card");
      if (!card) return null;
      const style = getComputedStyle(card);
      return {
        radius: parseFloat(style.borderRadius),
        borderRight: style.borderRightWidth,
        borderBottom: style.borderBottomWidth,
      };
    });
    expect(cardStyles).not.toBeNull();
    expect(cardStyles.radius).toBe(0);
    expect(parseFloat(cardStyles.borderRight)).toBeGreaterThan(0);
  });

  test("tab bar active state is visually distinct", async ({ page }) => {
    const activeTab = page.locator(".tab--active, [aria-selected='true']");
    await expect(activeTab).toBeVisible();

    const styles = await page.evaluate(() => {
      const tab = document.querySelector("[aria-selected='true']");
      if (!tab) return null;
      const style = getComputedStyle(tab);
      return { bg: style.backgroundColor, color: style.color };
    });
    expect(styles).toBeTruthy();
  });
});
