/**
 * Goal buttons - primary browsing entry point.
 * Placed between search and the grid so Alex sees them first.
 */

const GOAL_DESCRIPTIONS = {
  metabolic_incretins: "Compounds researched for weight loss and appetite control. Evidence quality varies.",
  tissue_healing: "Compounds studied for injury recovery, tissue repair, and wound healing.",
  neuro_mood_sleep: "Compounds explored for cognitive function, mood, and sleep quality.",
  immune_mucosal: "Compounds investigated for immune system support and gut health.",
  aging_bioregulators: "Short peptides studied for age-related changes and cellular maintenance.",
  growth_hormone_axis: "Compounds that interact with growth hormone pathways.",
  skin_tanning_libido: "Compounds researched for skin, tanning, and sexual health.",
  mitochondria_nad_redox: "Compounds studied for cellular energy production and metabolic health.",
};

export function initGoals() {
  const controls = document.querySelector(".controls");
  if (!controls) return;

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
  bar.className = "goal-bar goal-bar--primary";
  bar.innerHTML = '<span class="goal-bar__label">What are you looking for?</span>' +
    '<div class="goal-bar__buttons">' +
    goals.map(g =>
      `<button type="button" class="goal-btn" data-filter="${g.filter}" data-value="${g.value}">${g.icon} ${g.label}</button>`
    ).join("") +
    '</div>' +
    '<p class="goal-bar__desc" id="goal-desc" hidden></p>';

  controls.after(bar);

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
