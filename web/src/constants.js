/**
 * Evidence tiers, theme ordering, and lookup helpers.
 */

export const DATA_URL = "/peptide-info-database.json";

export const KNOWN_FOR_THEME_ORDER = [
  "metabolic_incretins",
  "growth_hormone_axis",
  "tissue_healing",
  "multi_ingredient_stack",
  "skin_tanning_libido",
  "mitochondria_nad_redox",
  "immune_mucosal",
  "neuro_mood_sleep",
  "reproduction_social",
  "experimental_weight_adjunct",
  "aging_bioregulators",
];

// Brand tier ramp — must match the CSS --tier-a..--tier-f tokens in
// design-tokens.css. JS-side colors here drive stat bars (web/src/stats.js),
// detail evidence badges, and inline-styled chips in detail.js. CSS tier
// ramp lives at the same hex values; if you bump one, bump both.
// Two categories map to A (approved + pivotal): the label distinguishes them.
export const EVIDENCE_TIERS = [
  { key: "regulatory_label",    tier: "approved",    grade: "A", color: "#2DA89C", label: "FDA approved",        subtitle: "Reviewed and approved by drug regulators",                            rank: 0 },
  { key: "pivotal_trials",      tier: "pivotal",     grade: "A", color: "#2DA89C", label: "Strong human trials", subtitle: "Tested on thousands of people in carefully designed studies",         rank: 1 },
  { key: "phase1_human",        tier: "phase1",      grade: "B", color: "#4A9F1F", label: "Early human studies", subtitle: "Tested on a small number of people — promising, but not proof",  rank: 2 },
  { key: "preclinical_animal",  tier: "preclinical", grade: "C", color: "#C68A0A", label: "Animal studies only", subtitle: "Tested in mice or rats, not yet in humans",                           rank: 3 },
  { key: "compounded_practice", tier: "practice",    grade: "D", color: "#D9621B", label: "Clinic practice",     subtitle: "Used by some clinics, but no controlled studies to back it up",       rank: 4 },
  { key: "unknown_identity",    tier: "unknown",     grade: "F", color: "#9C1818", label: "Unknown",             subtitle: "We couldn't verify what this compound is or what it does",            rank: 5 },
];

export function tierForKey(key) {
  return EVIDENCE_TIERS.find((t) => t.key === key) || EVIDENCE_TIERS[EVIDENCE_TIERS.length - 1];
}

export function highestTier(entry) {
  const guidelines = entry.doseGuidelines || [];
  let best = null;
  for (const g of guidelines) {
    const t = tierForKey(g.evidenceBasis);
    if (!best || t.rank < best.rank) best = t;
  }
  return best || tierForKey("unknown_identity");
}

export function evidenceTierExplainer(tierKey) {
  const explainers = {
    approved: "Approved by the FDA (or an equivalent agency). The strongest level of evidence available.",
    pivotal: "Backed by large, well-designed clinical trials in humans \u2014 the kind of data that drives regulator decisions.",
    phase1: "Tested in small studies on humans. Promising signals, but the studies aren't big enough to be conclusive yet.",
    preclinical: "Only tested in animals or cells in a dish. Interesting research, but unproven in people.",
    practice: "Used in wellness clinics, but no controlled trials back it up.",
    unknown: "We couldn't verify the active ingredient or the evidence behind the claims."
  };
  return explainers[tierKey] || "Evidence tier for this compound.";
}

export function compoundTypeExplainer(type) {
  const map = {
    peptide: "A short chain of amino acids \u2014 the building blocks of proteins.",
    peptide_incretin: "A peptide that copies gut hormones involved in appetite and blood-sugar control (the same family as Ozempic).",
    peptide_secretagogue: "A peptide that tells your body to release one of its own hormones \u2014 usually growth hormone.",
    peptide_blend: "A vendor's mix of two or more peptides in a single product.",
    peptide_blend_secretagogue: "A vendor mix of peptides designed to release growth hormone.",
    peptide_blend_incretin: "A vendor mix of peptides targeting appetite and blood-sugar control.",
    peptide_bioregulator: "A very short peptide (2\u20134 amino acids) sold for organ-specific support. Most of the underlying research comes from Russian labs and is preliminary.",
    peptide_hormone: "A natural hormone made by the body that happens to be a peptide.",
    small_molecule: "A regular chemical drug, not a peptide. Listed here because it's sold in the same markets.",
    cofactor: "A nutrient the body uses to run its own chemistry. Not a peptide, but commonly sold alongside them.",
    blend_injection: "An injection mixing vitamins, amino acids, or other nutrients, usually made on demand by a compounding pharmacy.",
    unknown_blend: "A vendor blend whose exact ingredients aren't publicly confirmed."
  };
  return map[type] || "The chemical class of this compound.";
}
