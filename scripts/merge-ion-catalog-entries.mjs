#!/usr/bin/env node
/**
 * One-off: append Ion Peptide catalog compounds not already in peptide-info-database.json.
 * Source: logs/ionpeptide-products.json (repo root ../logs/)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const DB_PATH = resolve(REPO_ROOT, "peptide-info-database.json");
const ION_PATH = resolve(REPO_ROOT, "../logs/ionpeptide-products.json");

function decodeHtml(s) {
  return String(s || "")
    .replace(/&#8211;/g, "–")
    .replace(/&amp;/g, "&")
    .trim();
}

function summaryFromIon(text, max = 420) {
  const clean = decodeHtml(text).replace(/\s+/g, " ").trim();
  if (!clean) return "Listed in the Ion Peptide research catalog; confirm vial identity with a certificate of analysis.";
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > max) break;
    out += s;
  }
  return out.trim() || clean.slice(0, max);
}

function ionProduct(slug) {
  const ion = JSON.parse(readFileSync(ION_PATH, "utf8"));
  const p = ion.products.find((x) => x.slug === slug);
  if (!p) throw new Error(`Ion product not found: ${slug}`);
  return p;
}

function baseEntry({ title, commonDrugName, compoundType, ionSlug, wellnessCategories, themes, headline, evidenceBasis = "preclinical_animal" }) {
  const ion = ionProduct(ionSlug);
  const researchSummary = summaryFromIon(ion.descriptionText);
  return {
    catalog: { title, commonDrugName },
    compoundType,
    cyclingNotes: "No established medical cycling schedule. Research-use vials are often sold without peer-reviewed human dosing guidance.",
    doseGuidelines: [
      {
        indicationOrContext: "Research catalog listing (Ion Peptide)",
        evidenceBasis,
        minimumEffectiveDoseNotes:
          "Vendor pages describe size variants only. No regulator-approved minimum effective dose exists for grey-market research vials.",
      },
    ],
    dosingTimingNotes: "Timing depends on the compound class and is not standardized for research SKUs sold online.",
    notes: `Ion Peptide catalog SKU: "${decodeHtml(ion.name)}" (${ion.permalink}). This entry was added from vendor catalog metadata; verify identity and purity with a certificate of analysis before relying on it.`,
    potentialApplications: [
      {
        evidenceNote: "Vendor research copy and preclinical literature only; not a treatment promise.",
        personCenteredBenefit: headline,
      },
    ],
    reportedBenefits: [
      `Vendor research description: ${researchSummary.slice(0, 280)}${researchSummary.length > 280 ? "…" : ""}`,
      "Preclinical or specialty-market evidence only unless a separate approved drug is named.",
    ],
    researchSummary,
    sources: [
      {
        label: "Ion Peptide product page",
        url: ion.permalink,
      },
    ],
    wellnessCategories,
    distinctiveQuality: {
      headline,
      themes,
      basisNote: "Based on Ion Peptide catalog text and class-level preclinical literature; not verified for any specific vial.",
    },
  };
}

const NEW_ENTRIES = [
  baseEntry({
    title: "CJC-1295 (No DAC)",
    commonDrugName: "CJC-1295 (Mod GRF 1-29)",
    compoundType: "peptide_secretagogue",
    ionSlug: "cjc-1295",
    wellnessCategories: ["body_composition", "recovery_tissue_repair"],
    themes: ["growth_hormone_axis"],
    headline: "A short-acting GHRH analog used in growth-hormone axis research, distinct from the long-acting DAC form.",
  }),
  baseEntry({
    title: "CJC-1295 With DAC",
    commonDrugName: "CJC-1295 with DAC",
    compoundType: "peptide_secretagogue",
    ionSlug: "cjc-1295-with-dac-5mg",
    wellnessCategories: ["body_composition", "recovery_tissue_repair"],
    themes: ["growth_hormone_axis"],
    headline: "Long-acting GHRH analog with albumin-binding DAC modification for sustained GH-release research.",
  }),
  baseEntry({
    title: "GHRP-2",
    commonDrugName: "GHRP-2",
    compoundType: "peptide_secretagogue",
    ionSlug: "ghrp-2",
    wellnessCategories: ["body_composition", "recovery_tissue_repair"],
    themes: ["growth_hormone_axis"],
    headline: "Potent ghrelin-receptor agonist GHRP studied for strong GH pulses in preclinical models.",
  }),
  baseEntry({
    title: "GHRP-6",
    commonDrugName: "GHRP-6",
    compoundType: "peptide_secretagogue",
    ionSlug: "ghrp-6",
    wellnessCategories: ["body_composition", "appetite_satiety"],
    themes: ["growth_hormone_axis"],
    headline: "Classic GHRP with strong GH release and notable appetite stimulation in research settings.",
  }),
  baseEntry({
    title: "IGF-1 LR3",
    commonDrugName: "IGF-1 LR3",
    compoundType: "peptide",
    ionSlug: "igf-lr3-1mg",
    wellnessCategories: ["body_composition", "recovery_tissue_repair"],
    themes: ["growth_hormone_axis"],
    headline: "Long-acting IGF-1 analog with reduced binding-protein interference, used in muscle and cell-growth research.",
  }),
  baseEntry({
    title: "PEG-MGF",
    commonDrugName: "PEG-MGF (Mechano Growth Factor)",
    compoundType: "peptide",
    ionSlug: "peg-mgf",
    wellnessCategories: ["recovery_tissue_repair", "body_composition"],
    themes: ["growth_hormone_axis"],
    headline: "Pegylated mechano growth factor isoform studied for muscle repair and satellite-cell signaling.",
  }),
  baseEntry({
    title: "AHK-Cu",
    commonDrugName: "AHK-Cu (Copper Tripeptide-3)",
    compoundType: "peptide",
    ionSlug: "ahk-cu-100mg",
    wellnessCategories: ["recovery_tissue_repair", "skin_pigmentation_aesthetics"],
    themes: ["tissue_healing"],
    headline: "Copper-binding tripeptide researched for follicle, matrix, and tissue-remodeling signaling distinct from GHK-Cu.",
  }),
  baseEntry({
    title: "Adamax",
    commonDrugName: "Adamax",
    compoundType: "peptide_bioregulator",
    ionSlug: "adamax-10mg",
    wellnessCategories: ["cognitive_mood"],
    themes: ["aging_bioregulators", "neuro_mood_sleep"],
    headline: "Neural-tissue bioregulator peptide marketed for gene-regulation and CNS research models.",
    evidenceBasis: "compounded_practice",
  }),
  baseEntry({
    title: "Cartalax",
    commonDrugName: "Cartalax",
    compoundType: "peptide_bioregulator",
    ionSlug: "cartalax-20mg",
    wellnessCategories: ["recovery_tissue_repair"],
    themes: ["aging_bioregulators"],
    headline: "Cartilage-associated Khavinson-style bioregulator peptide for joint and matrix research narratives.",
    evidenceBasis: "compounded_practice",
  }),
  baseEntry({
    title: "Cortagen",
    commonDrugName: "Cortagen",
    compoundType: "peptide_bioregulator",
    ionSlug: "cortagen-20mg",
    wellnessCategories: ["cognitive_mood"],
    themes: ["aging_bioregulators", "neuro_mood_sleep"],
    headline: "Cortical-tissue bioregulator peptide sold for brain aging and neuronal homeostasis research.",
    evidenceBasis: "compounded_practice",
  }),
  baseEntry({
    title: "Cerebro Protein",
    commonDrugName: "Cerebro Protein",
    compoundType: "peptide_bioregulator",
    ionSlug: "cerebro-protien-60g",
    wellnessCategories: ["cognitive_mood"],
    themes: ["aging_bioregulators", "neuro_mood_sleep"],
    headline: "Brain-derived peptide complex studied as a neurotrophic-mimetic research preparation.",
    evidenceBasis: "compounded_practice",
  }),
  baseEntry({
    title: "Thymalin",
    commonDrugName: "Thymalin",
    compoundType: "peptide_bioregulator",
    ionSlug: "thymalin-10mg",
    wellnessCategories: ["immune_inflammation", "longevity_cellular_aging"],
    themes: ["aging_bioregulators", "immune_mucosal"],
    headline: "Thymic peptide complex distinct from thymosin alpha-1, used in immune-aging research literature.",
    evidenceBasis: "compounded_practice",
  }),
  baseEntry({
    title: "PNC-27",
    commonDrugName: "PNC-27",
    compoundType: "peptide",
    ionSlug: "pnc-27-10mg",
    wellnessCategories: ["immune_inflammation"],
    themes: ["immune_mucosal"],
    headline: "p53-derived research peptide studied for membrane interaction and cell-signaling models.",
  }),
  baseEntry({
    title: "Snap-8",
    commonDrugName: "Acetyl Octapeptide-3 (Snap-8)",
    compoundType: "peptide",
    ionSlug: "snap-8",
    wellnessCategories: ["skin_pigmentation_aesthetics"],
    themes: ["skin_tanning_libido"],
    headline: "SNAP-25 fragment peptide used in expression-line and neuromuscular signaling research.",
    evidenceBasis: "preclinical_animal",
  }),
  {
    ...baseEntry({
      title: "Semax/Selank",
      commonDrugName: "Semax / Selank blend",
      compoundType: "peptide_blend",
      ionSlug: "semax-selank-10mg",
      wellnessCategories: ["cognitive_mood"],
      themes: ["neuro_mood_sleep", "multi_ingredient_stack"],
      headline: "Fixed-ratio Semax and Selank blend for combined cognitive and anxiolytic research narratives.",
      evidenceBasis: "compounded_practice",
    }),
    synergisticWith: [
      {
        catalogTitles: ["Semax", "Selank"],
        evidenceBasis: "co_packaged_definition",
        rationale: "Single vial combines Semax and Selank at a fixed vendor ratio.",
      },
    ],
  },
  {
    ...baseEntry({
      title: "BPC157+TB500+KPV",
      commonDrugName: "BPC-157 / TB-500 / KPV blend",
      compoundType: "peptide_blend",
      ionSlug: "bpc157tb500kpv-30mg",
      wellnessCategories: ["recovery_tissue_repair", "immune_inflammation"],
      themes: ["multi_ingredient_stack", "tissue_healing"],
      headline: "Triple-peptide recovery blend combining repair, migration, and anti-inflammatory tripeptide signals.",
      evidenceBasis: "compounded_practice",
    }),
    synergisticWith: [
      {
        catalogTitles: ["BPC-157", "TB-500", "KPV"],
        evidenceBasis: "co_packaged_definition",
        rationale: "Vendor lyophilized blend of BPC-157, TB-500 fragment, and KPV in one SKU.",
      },
    ],
  },
  {
    ...baseEntry({
      title: "GHK-Cu / KPV",
      commonDrugName: "GHK-Cu + KPV blend",
      compoundType: "peptide_blend",
      ionSlug: "ghk-cu-50mg-kpv-10mg",
      wellnessCategories: ["recovery_tissue_repair", "immune_inflammation"],
      themes: ["multi_ingredient_stack", "tissue_healing"],
      headline: "Copper peptide plus KPV anti-inflammatory tripeptide in one recovery-focused blend.",
      evidenceBasis: "compounded_practice",
    }),
    synergisticWith: [
      {
        catalogTitles: ["GHK-Cu", "KPV"],
        evidenceBasis: "co_packaged_definition",
        rationale: "Fixed-ratio GHK-Cu and KPV blend sold as a single product.",
      },
    ],
  },
  {
    ...baseEntry({
      title: "Cartalax / TB4 / BPC-157",
      commonDrugName: "Cartalax / TB-500 / BPC-157 blend",
      compoundType: "peptide_blend",
      ionSlug: "cartalax-tb4-bpc-157-40mg",
      wellnessCategories: ["recovery_tissue_repair"],
      themes: ["multi_ingredient_stack", "tissue_healing", "aging_bioregulators"],
      headline: "Multi-pathway cartilage and tissue-repair blend pairing bioregulator, TB-4, and BPC-157.",
      evidenceBasis: "compounded_practice",
    }),
    synergisticWith: [
      {
        catalogTitles: ["Cartalax", "TB-500", "BPC-157"],
        evidenceBasis: "named_stack_mechanism_complement",
        rationale: "Combines cartilage bioregulator narrative with TB-500 and BPC-157 repair mechanisms.",
      },
    ],
  },
];

function normTitle(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();
}

function main() {
  const db = JSON.parse(readFileSync(DB_PATH, "utf8"));
  const existing = new Set(db.entries.map((e) => normTitle(e.catalog?.title)));

  let added = 0;
  for (const entry of NEW_ENTRIES) {
    const key = normTitle(entry.catalog.title);
    if (existing.has(key)) {
      console.warn(`skip duplicate title: ${entry.catalog.title}`);
      continue;
    }
    db.entries.push(entry);
    existing.add(key);
    added++;
    console.log(`added: ${entry.catalog.title}`);
  }

  db.meta.entryCount = db.entries.length;
  db.meta.builtAt = new Date().toISOString();

  writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  console.log(`\nDone. Added ${added} entries. Total: ${db.meta.entryCount}`);
}

main();
