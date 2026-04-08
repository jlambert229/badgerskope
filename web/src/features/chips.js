/**
 * Clickable category chips — clicking a chip on a card filters the grid by that category.
 */

export function initChips() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  grid.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    e.stopPropagation();
    const catKey = chip.textContent.trim().replace(/\s+/g, "_");
    const catSelect = document.getElementById("category");
    if (catSelect) {
      for (const opt of catSelect.options) {
        if (opt.value === catKey) {
          catSelect.value = catKey;
          catSelect.dispatchEvent(new Event("change"));
          catSelect.style.outline = "2px solid var(--accent)";
          setTimeout(() => { catSelect.style.outline = ""; }, 1500);
          document.getElementById("grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
    }
  });
}
