/**
 * Goal buttons - primary browsing entry point.
 * Placed between search and the grid so Alex sees them first.
 */

const GOAL_DESCRIPTIONS = {
  metabolic_incretins: "Peptides people ask about for losing weight or controlling appetite. Some have strong science behind them; others are mostly gym lore.",
  tissue_healing: "Peptides studied for helping injuries heal faster, from tendons to gut lining. Evidence ranges from FDA-level to animal-only.",
  neuro_mood_sleep: "Peptides people look into for sharper thinking, less anxiety, or better sleep. Most are still early in research.",
  immune_mucosal: "Peptides explored for strengthening your immune system or calming inflammation. A mix of established and experimental science.",
  aging_bioregulators: "Short peptides marketed for slowing aging at the cellular level. Interesting research, but most evidence is limited.",
  growth_hormone_axis: "Peptides that trigger your body to release more growth hormone. Many are banned in sports.",
  skin_tanning_libido: "Peptides researched for skin darkening, tanning, or sexual health. Some carry serious safety concerns.",
  mitochondria_nad_redox: "Peptides and molecules targeting your cells' energy factories. Promising science, but still mostly early-stage.",
};

export function initGoals() {
  const searchZone = document.querySelector(".lib-search");
  const browseToolbar = document.querySelector(".lib-toolbar");
  const insertTarget = browseToolbar || searchZone;
  if (!insertTarget) return;

  const goals = [
    { label: "Weight loss", filter: "known-for", value: "metabolic_incretins", icon: "\u2696\uFE0F" },
    { label: "Healing & repair", filter: "known-for", value: "tissue_healing", icon: "\uD83E\uDE79" },
    { label: "Brain & mood", filter: "known-for", value: "neuro_mood_sleep", icon: "\uD83E\uDDE0" },
    { label: "Immune support", filter: "known-for", value: "immune_mucosal", icon: "\uD83D\uDEE1\uFE0F" },
    { label: "Anti-aging", filter: "known-for", value: "aging_bioregulators", icon: "\u231B" },
    { label: "Growth hormone", filter: "known-for", value: "growth_hormone_axis", icon: "\uD83D\uDCAA" },
    { label: "Skin & tanning", filter: "known-for", value: "skin_tanning_libido", icon: "\u2728" },
    { label: "Cell energy", filter: "known-for", value: "mitochondria_nad_redox", icon: "\u26A1" },
  ];

  const bar = document.createElement("div");
  bar.className = "goal-bar goal-bar--hero";
  bar.innerHTML = '<span class="goal-bar__label">What are you looking for?</span>' +
    '<div class="goal-bar__buttons">' +
    goals.map(g =>
      `<button type="button" class="goal-btn" data-filter="${g.filter}" data-value="${g.value}">${g.icon} ${g.label}</button>`
    ).join("") +
    '</div>' +
    '<p class="goal-bar__desc" id="goal-desc" hidden></p>';

  insertTarget.after(bar);

  bar.querySelectorAll(".goal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const isActive = btn.classList.contains("goal-btn--active");

      bar.querySelectorAll(".goal-btn").forEach(b => b.classList.remove("goal-btn--active"));

      const descEl = document.getElementById("goal-desc");

      if (isActive) {
        const filterEl = document.getElementById(btn.dataset.filter);
        if (filterEl) {
          filterEl.value = "";
          filterEl.dispatchEvent(new Event("change"));
        }
        if (descEl) descEl.hidden = true;
        return;
      }

      btn.classList.add("goal-btn--active");
      const filterEl = document.getElementById(btn.dataset.filter);
      if (filterEl) {
        filterEl.value = btn.dataset.value;
        filterEl.dispatchEvent(new Event("change"));
      }

      if (descEl) {
        const desc = GOAL_DESCRIPTIONS[btn.dataset.value] || "";
        if (desc) {
          descEl.textContent = desc;
          descEl.hidden = false;
        } else {
          descEl.hidden = true;
        }
      }
    });
  });

  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      bar.querySelectorAll(".goal-btn").forEach(b => b.classList.remove("goal-btn--active"));
      const descEl = document.getElementById("goal-desc");
      if (descEl) descEl.hidden = true;
    });
  }
}
