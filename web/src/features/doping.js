/**
 * Sport/doping flag warnings — shows WADA ban indicators on cards and detail views.
 */

import { escapeHtml } from "../utils.js";

const WADA_BANNED = {
  "BPC-157": "Banned by WADA since 2022",
  "TB-500": "Banned by WADA (thymosin beta-4 related)",
  "Ipamorelin": "Growth hormone secretagogue \u2014 banned in sport",
  "Sermorelin": "Growth hormone releasing factor \u2014 banned in sport",
  "CJC-1295": "GHRH analog \u2014 banned in sport",
  "GHRP": "Growth hormone releasing peptide \u2014 banned in sport",
  "SomatoPulse": "Contains banned GH secretagogues",
  "Tesa": "Tesamorelin \u2014 growth hormone axis, monitored in sport",
  "MT-II": "Melanotan II \u2014 not approved, safety concerns flagged by regulators",
  "SLU-PP-332": "Exercise mimetic \u2014 not approved for any use",
  "FOXO4-DRI": "Experimental senolytic \u2014 no approved human use",
};

export function initDoping() {
  // On cards
  const applyToCards = () => {
    document.querySelectorAll(".card").forEach(card => {
      if (card.querySelector(".doping-flag")) return;
      const title = card.querySelector(".card__title")?.textContent || "";
      for (const [key, reason] of Object.entries(WADA_BANNED)) {
        if (title.includes(key)) {
          const flag = document.createElement("span");
          flag.className = "doping-flag";
          flag.textContent = "\u26A0 Sport ban";
          flag.title = reason;
          const metaRow = card.querySelector(".card__meta-row");
          if (metaRow) metaRow.appendChild(flag);
          break;
        }
      }
    });
  };

  const grid = document.getElementById("grid");
  if (grid) {
    const obs = new MutationObserver(applyToCards);
    obs.observe(grid, { childList: true });
    applyToCards();
  }

  // On detail modal
  const detailObs = new MutationObserver(() => {
    const detailBody = document.getElementById("detail-body");
    if (!detailBody || detailBody.querySelector(".doping-banner")) return;
    const title = document.getElementById("detail-title")?.textContent || "";
    for (const [key, reason] of Object.entries(WADA_BANNED)) {
      if (title.includes(key)) {
        const banner = document.createElement("div");
        banner.className = "doping-banner";
        banner.innerHTML = `<strong>\u26A0 Sport/Doping notice:</strong> ${escapeHtml(reason)}`;
        const heroBar = detailBody.querySelector(".detail__hero-bar");
        if (heroBar) heroBar.after(banner);
        break;
      }
    }
  });

  const dialog = document.getElementById("detail-dialog");
  if (dialog) detailObs.observe(dialog, { childList: true, subtree: true });
}
