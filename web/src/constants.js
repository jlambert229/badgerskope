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
  { key: "regulatory_label",    tier: "approved",    grade: "A", color: "#DCEC1F", label: "FDA approved",        subtitle: "Regulators reviewed the data and said yes",            rank: 0 },
  { key: "pivotal_trials",      tier: "pivotal",     grade: "A", color: "#DCEC1F", label: "Strong human trials", subtitle: "Tested on thousands of people in controlled studies",  rank: 1 },
  { key: "phase1_human",        tier: "phase1",      grade: "B", color: "#7BE12C", label: "Early human studies", subtitle: "Small studies on people, but not conclusive yet",      rank: 2 },
  { key: "preclinical_animal",  tier: "preclinical", grade: "C", color: "#F2B011", label: "Animal studies only", subtitle: "Only tested on animals so far",                        rank: 3 },
  { key: "compounded_practice", tier: "practice",    grade: "D", color: "#F36715", label: "Clinic practice",     subtitle: "Used by some clinics, but little controlled research", rank: 4 },
  { key: "unknown_identity",    tier: "unknown",     grade: "F", color: "#DA1F1F", label: "Unknown",             subtitle: "Not enough data to grade",                             rank: 5 },
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
    approved: "This compound has FDA or regulator-approved prescribing information \u2014 the strongest level of evidence.",
    pivotal: "Backed by large, rigorous clinical trials in humans \u2014 the kind of data that gets drugs approved.",
    phase1: "Tested in small human studies or Phase 1 safety trials \u2014 promising but not conclusive.",
    preclinical: "Only tested in animals or lab dishes \u2014 interesting science, but unproven in people.",
    practice: "Used in clinics or wellness protocols, but formal controlled studies are thin.",
    unknown: "The active ingredient or evidence basis couldn't be confirmed."
  };
  return explainers[tierKey] || "Evidence tier for this compound.";
}

export function compoundTypeExplainer(type) {
  const map = {
    peptide: "A chain of amino acids \u2014 the building blocks of proteins.",
    peptide_incretin: "A peptide that mimics gut hormones involved in appetite and blood sugar control.",
    peptide_secretagogue: "A peptide that stimulates the body to release its own hormones (like growth hormone).",
    peptide_blend: "A vendor-made mix of multiple peptides in one product.",
    peptide_blend_secretagogue: "A blend of peptides designed to stimulate hormone release.",
    peptide_blend_incretin: "A blend of peptides targeting appetite and blood sugar pathways.",
    peptide_bioregulator: "A very short peptide marketed for organ-specific support, often from Russian research traditions.",
    peptide_hormone: "A naturally occurring hormone that is also a peptide.",
    small_molecule: "A chemical compound, not a peptide \u2014 included because it's sold alongside peptides.",
    cofactor: "A molecule the body needs for enzyme reactions \u2014 not a peptide but sold in the same markets.",
    blend_injection: "A compounded injection mixing vitamins, amino acids, or other nutrients.",
    unknown_blend: "A vendor blend whose exact composition isn't publicly confirmed."
  };
  return map[type] || "The chemical class of this compound.";
}
