/**
 * Quick-find goal buttons bar — lets users filter by wellness goal with one click.
 */

export function initGoals() {
  const grid = document.getElementById("grid");
  const controls = document.querySelector(".controls");
  if (!controls || !grid) return;

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
  bar.className = "goal-bar";
  bar.innerHTML = '<span class="goal-bar__label">Quick find:</span>' +
    goals.map(g =>
      `<button type="button" class="goal-btn" data-filter="${g.filter}" data-value="${g.value}">${g.icon} ${g.label}</button>`
    ).join("");

  controls.after(bar);

  bar.querySelectorAll(".goal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const filterEl = document.getElementById(btn.dataset.filter);
      if (filterEl) {
        filterEl.value = btn.dataset.value;
        filterEl.dispatchEvent(new Event("change"));
      }
      bar.querySelectorAll(".goal-btn").forEach(b => b.classList.remove("goal-btn--active"));
      btn.classList.add("goal-btn--active");
    });
  });

  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      bar.querySelectorAll(".goal-btn").forEach(b => b.classList.remove("goal-btn--active"));
    });
  }
}
