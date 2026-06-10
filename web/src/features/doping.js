/**
 * Sport/doping flag warnings — shows sport-risk indicators on cards and
 * detail views.
 *
 * Schema 3.1: flags come from the structured per-entry `sportRisk` field
 * ({ status: "banned" | "caution", reason }) in peptide-info-database.json,
 * replacing the old hardcoded title-substring map (PRD §10 P2).
 */

import { escapeHtml } from "../utils.js";
import { getEntryByTitle } from "../state.js";

/** Returns the sport-risk reason string for an entry, or "" when the entry
 *  carries no `sportRisk` data. Used by the card-level flag and the Safety &
 *  status row inside the detail modal. */
export function findDopingReason(entry) {
  return entry?.sportRisk?.reason || "";
}

/** Resolve a rendered card/detail title back to its entry's sportRisk. */
function sportRiskForTitle(title) {
  const entry = getEntryByTitle((title || "").trim());
  return entry?.sportRisk || null;
}

export function initDoping() {
  // On cards
  const applyToCards = () => {
    document.querySelectorAll(".card").forEach(card => {
      if (card.querySelector(".doping-flag")) return;
      const title = card.querySelector(".card__title")?.textContent || "";
      const risk = sportRiskForTitle(title);
      if (!risk) return;
      const flag = document.createElement("span");
      flag.className = "doping-flag";
      flag.textContent = "\u26A0 Sport ban";
      flag.title = risk.reason;
      const metaRow = card.querySelector(".card__meta-row");
      if (metaRow) metaRow.appendChild(flag);
    });
  };

  const grid = document.getElementById("grid");
  if (grid) {
    const obs = new MutationObserver(applyToCards);
    obs.observe(grid, { childList: true });
    applyToCards();
  }

  // On detail modal — insert before the wellness chips row (.detail__cats)
  // when present, otherwise after the answer zone.
  const detailObs = new MutationObserver(() => {
    const detailBody = document.getElementById("detail-body");
    if (!detailBody || detailBody.querySelector(".doping-banner")) return;
    const title = document.getElementById("detail-title")?.textContent || "";
    const risk = sportRiskForTitle(title);
    if (!risk) return;
    const banner = document.createElement("div");
    banner.className = "doping-banner";
    banner.setAttribute("role", "note");
    banner.innerHTML = `<strong>\u26A0 Sport / doping notice:</strong> ${escapeHtml(risk.reason)}`;
    const anchor = detailBody.querySelector(".detail__cats")
      || detailBody.querySelector(".detail__answer-zone");
    if (anchor) anchor.after(banner);
    else detailBody.prepend(banner);
  });

  const dialog = document.getElementById("detail-dialog");
  if (dialog) detailObs.observe(dialog, { childList: true, subtree: true });
}
