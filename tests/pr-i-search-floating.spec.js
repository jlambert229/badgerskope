import { test, expect } from "@playwright/test";

/**
 * PR I — search input affordance + floating UI collision fix.
 *
 * Issue 11: the literal `/` glyph in the library search prefix is replaced
 * with an inline SVG magnifier. The `/` keyboard shortcut still focuses
 * the input.
 *
 * Issue 12: bookmark bar (bottom-left) and back-to-top (bottom-right)
 * must not overlap on narrow viewports. At ≤480px wide, the bookmark bar
 * stacks above the back-to-top.
 *
 * Note: navigates to `/web/?nosw=1` and unregisters service workers before
 * the assertion. A previously-registered SW (from another test run or
 * worktree on the shared :5173 port) can otherwise serve a stale `index.html`
 * that still has the literal `/` glyph.
 */

async function gotoFreshLibrary(page, context) {
  // Strip any service worker registration + cache that a previous run on
  // this same :5173 server may have left behind. We do this twice because
  // the very first navigation may already have been served by a SW that
  // was registered before the addInitScript hook fired.
  await page.addInitScript(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((rs) => Promise.all(rs.map((r) => r.unregister())))
        .catch(() => {});
    }
    if ("caches" in self) {
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {});
    }
  });
  await page.goto("/web/?nosw=" + Date.now());
  // Second navigation guarantees the post-unregister DOM, never a SW response.
  await page.goto("/web/?nosw=" + (Date.now() + 1));
}

test.describe("PR I — search prefix SVG icon", () => {
  test("search prefix renders an aria-hidden inline SVG, not a literal slash", async ({ page }) => {
    await gotoFreshLibrary(page);
    await page.waitForSelector(".lib-search-input", { timeout: 10_000 });

    const prefix = page.locator(".lib-search-prefix");
    await expect(prefix).toHaveAttribute("aria-hidden", "true");

    // SVG present
    const svg = prefix.locator("svg");
    await expect(svg).toHaveCount(1);

    // No literal "/" text rendered
    const visibleText = (await prefix.innerText()).trim();
    expect(visibleText).toBe("");

    // Magnifier shape: a circle and a line
    await expect(svg.locator("circle")).toHaveCount(1);
    await expect(svg.locator("line")).toHaveCount(1);
  });

  test("'/' keypress focuses the search input", async ({ page }) => {
    await gotoFreshLibrary(page);
    await page.waitForSelector(".lib-search-input", { timeout: 10_000 });

    // Ensure no input is currently focused
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("/");

    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe("search");
  });
});

test.describe("PR I — floating UI collision (bookmark bar + back-to-top)", () => {
  test("at 320x568 bookmark bar and back-to-top do not overlap", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await gotoFreshLibrary(page);
    await page.waitForSelector(".card", { timeout: 10_000 });

    // Force both floating elements visible by bookmarking one card and scrolling.
    await page.evaluate(() => {
      const bar = document.getElementById("bookmarks-bar");
      const btt = document.getElementById("back-to-top");
      if (bar) bar.removeAttribute("hidden");
      if (btt) btt.removeAttribute("hidden");
    });

    const barBox = await page.locator("#bookmarks-bar").boundingBox();
    const bttBox = await page.locator("#back-to-top").boundingBox();
    expect(barBox).not.toBeNull();
    expect(bttBox).not.toBeNull();

    // No bounding-box overlap (axis-aligned rectangles).
    const horizontallyDisjoint =
      barBox.x + barBox.width <= bttBox.x || bttBox.x + bttBox.width <= barBox.x;
    const verticallyDisjoint =
      barBox.y + barBox.height <= bttBox.y || bttBox.y + bttBox.height <= barBox.y;
    expect(horizontallyDisjoint || verticallyDisjoint).toBe(true);
  });

  test("back-to-top sits above bookmark-bar in stacking order", async ({ page }) => {
    await gotoFreshLibrary(page);
    await page.waitForSelector(".card", { timeout: 10_000 });

    const z = await page.evaluate(() => {
      const get = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        return parseInt(window.getComputedStyle(el).zIndex, 10);
      };
      return { btt: get("back-to-top"), bar: get("bookmarks-bar") };
    });
    expect(z.btt).toBeGreaterThanOrEqual(z.bar);
  });
});
