/**
 * Grouping constants and helpers for theme, compound, evidence, and category groups.
 */

import { highestTier, KNOWN_FOR_THEME_ORDER } from "./constants.js";
import { formatCompoundType, FRIENDLY_CATEGORIES } from "./utils.js";

export const GROUP_THEME_LABELS = {
  metabolic_incretins: "Weight loss & blood sugar",
  growth_hormone_axis: "Growth hormone boosters",
  tissue_healing: "Healing & tissue repair",
  multi_ingredient_stack: "Multi-ingredient blends",
  skin_tanning_libido: "Skin, tanning & sexual health",
  mitochondria_nad_redox: "Cell energy & antioxidants",
  immune_mucosal: "Immune support & defense",
  neuro_mood_sleep: "Brain, mood & sleep",
  reproduction_social: "Fertility & hormones",
  experimental_weight_adjunct: "Experimental weight aids",
  aging_bioregulators: "Anti-aging & longevity",
};

export const GROUP_EVIDENCE_LABELS = {
  approved: "FDA approved \u2014 strongest evidence",
  pivotal: "Strong human trials",
  phase1: "Early human studies \u2014 promising but small",
  preclinical: "Animal studies only \u2014 unproven in people",
  practice: "Used in clinics \u2014 limited formal proof",
  unknown: "Unknown or unconfirmed",
};

export function getGroupKey(entry, groupBy) {
  if (groupBy === "theme") {
    return (entry.distinctiveQuality?.themes || [])[0] || "other";
  }
  if (groupBy === "compound") {
    return entry.compoundType || "unknown";
  }
  if (groupBy === "evidence") {
    return highestTier(entry).tier;
  }
  if (groupBy === "category") {
    return (entry.wellnessCategories || [])[0] || "other";
  }
  return "";
}

export function getGroupLabel(key, groupBy) {
  if (groupBy === "theme") return GROUP_THEME_LABELS[key] || key.replace(/_/g, " ");
  if (groupBy === "compound") return formatCompoundType(key);
  if (groupBy === "evidence") return GROUP_EVIDENCE_LABELS[key] || key;
  if (groupBy === "category") return FRIENDLY_CATEGORIES[key] || key.replace(/_/g, " ");
  return key;
}

export function getGroupOrder(groupBy) {
  if (groupBy === "theme") return Object.keys(GROUP_THEME_LABELS);
  if (groupBy === "evidence") return ["approved", "pivotal", "phase1", "preclinical", "practice", "unknown"];
  return null; // sort alphabetically
}

export function sortKnownForKeys(kf) {
  const all = Object.keys(kf);
  const preferred = KNOWN_FOR_THEME_ORDER.filter((k) => kf[k]);
  const rest = all.filter((k) => !preferred.includes(k)).sort((a, b) => a.localeCompare(b));
  return [...preferred, ...rest];
}
