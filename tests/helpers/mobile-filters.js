/**
 * Mobile filter helper.
 *
 * At ≤768px viewport, the desktop `.filter-strip` is hidden and the filter
 * controls are reparented inside a bottom sheet. Tests that interact with
 * filter controls must open that sheet first; on desktop this is a no-op.
 *
 * Use in any test that needs to interact with #category, #compound,
 * #known-for, #evidence-filter, #sort, or #group-by:
 *
 *   import { ensureFiltersReachable } from "./helpers/mobile-filters.js";
 *   ...
 *   await ensureFiltersReachable(page);
 *   await page.locator("#sort").selectOption("title");
 */
export async function ensureFiltersReachable(page) {
  // Trigger button is `display: none` at >768px, visible at ≤768px.
  // We probe the body class set by the breakpoint logic.
  const isMobile = await page.evaluate(() =>
    document.body.classList.contains("is-mobile-filters"),
  );
  if (!isMobile) return; // desktop — strip is always visible
  const trigger = page.locator("#mobile-filter-trigger");
  if (await trigger.isVisible()) {
    const sheet = page.locator("#mobile-filter-sheet");
    const isOpen = await sheet.evaluate((el) =>
      el.classList.contains("mobile-filter-sheet--open"),
    );
    if (!isOpen) await trigger.click();
  }
}
