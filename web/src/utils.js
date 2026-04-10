/**
 * Shared utility functions and label maps.
 */

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Stable catalog SKU; used for bookmarks and #entry= URLs. */
export function getCatalogTitle(entry) {
  return String(entry?.catalog?.title || "").trim();
}

/** Primary visible label: INN-style or common research name when present. */
export function getDisplayName(entry) {
  const title = getCatalogTitle(entry);
  const common = String(entry?.catalog?.commonDrugName || "").trim();
  return common || title || "Untitled";
}

export const FRIENDLY_COMPOUND_TYPES = {
  peptide: "Peptide",
  peptide_incretin: "Weight & appetite peptide",
  peptide_secretagogue: "Growth hormone booster",
  peptide_blend: "Peptide blend",
  peptide_blend_secretagogue: "GH booster blend",
  peptide_blend_incretin: "Weight peptide blend",
  peptide_bioregulator: "Bioregulator peptide",
  peptide_hormone: "Hormone",
  small_molecule: "Research chemical",
  cofactor: "Nutrient / cofactor",
  blend_injection: "Nutrient injection",
  unknown_blend: "Vendor blend (unknown)",
};

export function formatCompoundType(raw) {
  if (!raw) return "";
  return FRIENDLY_COMPOUND_TYPES[raw] || String(raw).replace(/_/g, " ");
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export const FRIENDLY_CATEGORIES = {
  appetite_satiety: "Appetite & fullness",
  body_composition: "Weight & body fat",
  cardiovascular_metabolic: "Heart & metabolism",
  cognitive_mood: "Brain & mood",
  energy_mitochondria: "Energy & mitochondria",
  gastrointestinal: "Gut & digestion",
  immune_inflammation: "Immune system",
  longevity_cellular_aging: "Aging & longevity",
  recovery_tissue_repair: "Healing & recovery",
  reproductive_endocrine: "Hormones & fertility",
  respiratory_airway: "Lungs & airways",
  skin_pigmentation_aesthetics: "Skin & appearance",
  sleep_circadian: "Sleep",
  supports_accessory: "Supplies & solvents",
};

export function wellnessLabel(index, key) {
  if (!key) return { short: "", full: "" };
  const full = index[key];
  const short = FRIENDLY_CATEGORIES[key] || key.replace(/_/g, " ");
  return { short, full: full || key };
}
