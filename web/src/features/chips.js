/**
 * Clickable category chips — clicking a chip on a card filters the grid by that category.
 */

export function initChips() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  grid.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip, .card__category");
    if (!chip) return;
    e.stopPropagation();
    const chipText = chip.textContent.trim().toLowerCase();
    const catSelect = document.getElementById("category");
    if (catSelect) {
      for (const opt of catSelect.options) {
        if (opt.text.trim().toLowerCase() === chipText || opt.value === chipText.replace(/\s+/g, "_")) {
          catSelect.value = opt.value;
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
