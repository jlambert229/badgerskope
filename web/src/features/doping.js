/**
 * Sport/doping flag warnings — shows WADA ban indicators on cards and detail views.
 */

import { escapeHtml } from "../utils.js";

// Exported so detail.js can render the same flag in the inline Safety &
// status row without duplicating the title-substring \u2192 reason mapping.
export const WADA_BANNED = {
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

/** Returns a sport/doping reason string if the title matches a WADA-listed
 *  compound, otherwise an empty string. Used by both the card-level flag
 *  and the Safety & status row inside the detail modal. */
export function findDopingReason(title) {
  if (!title) return "";
  for (const [key, reason] of Object.entries(WADA_BANNED)) {
    if (title.includes(key)) return reason;
  }
  return "";
}

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

  // On detail modal \u2014 prior implementation inserted the banner after
  // `.detail__hero-bar`, a class that no longer exists in the template.
  // The banner was dead code for every entry. Insert before the wellness
  // chips row (.detail__cats) when present, otherwise after the answer
  // zone \u2014 both selectors are real in the current template.
  const detailObs = new MutationObserver(() => {
    const detailBody = document.getElementById("detail-body");
    if (!detailBody || detailBody.querySelector(".doping-banner")) return;
    const title = document.getElementById("detail-title")?.textContent || "";
    for (const [key, reason] of Object.entries(WADA_BANNED)) {
      if (title.includes(key)) {
        const banner = document.createElement("div");
        banner.className = "doping-banner";
        banner.setAttribute("role", "note");
        banner.innerHTML = `<strong>\u26A0 Sport / doping notice:</strong> ${escapeHtml(reason)}`;
        const anchor = detailBody.querySelector(".detail__cats")
          || detailBody.querySelector(".detail__answer-zone");
        if (anchor) anchor.after(banner);
        else detailBody.prepend(banner);
        break;
      }
    }
  });

  const dialog = document.getElementById("detail-dialog");
  if (dialog) detailObs.observe(dialog, { childList: true, subtree: true });
}
