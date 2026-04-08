/**
 * Adds doseGuidelines (minimum-effective-style hints from labels or literature) to peptide-info-database.json.
 * Not prescribing. Run: node scripts/merge-dose-guidelines.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'peptide-info-database.json');

function resolveKey(title) {
  const t = title.trim();
  if (/^1G-SGT\b/i.test(t)) return '1G-SGT';
  if (/^2G-TZ\b/i.test(t)) return '2G-TZ';
  if (/^3G-RT\b/i.test(t)) return '3G-RT';
  if (/^5-amino-1mq$/i.test(t)) return '5-amino-1mq';
  if (/^AOD-9604/i.test(t)) return 'AOD-9604';
  if (/^ARA-290$/i.test(t)) return 'ARA-290';
  if (/^BPC-157/i.test(t)) return 'BPC-157';
  if (/^Bronchogen$/i.test(t)) return 'Bronchogen';
  if (/^Cag-10mg$/i.test(t)) return 'Cag-10mg';
  if (/CJC-1295.*IPA/i.test(t)) return 'CJC-1295';
  if (/^DSIP/i.test(t)) return 'DSIP';
  if (/^Epithalon$/i.test(t)) return 'Epithalon';
  if (/^FOXO4-DRI/i.test(t)) return 'FOXO4-DRI';
  if (/^GHK-Cu$/i.test(t)) return 'GHK-Cu';
  if (/^GLOW 70$/i.test(t)) return 'GLOW 70';
  if (/^Glutathione/i.test(t)) return 'Glutathione';
  if (/^Ipamorelin/i.test(t)) return 'Ipamorelin';
  if (/^Kisspeptin$/i.test(t)) return 'Kisspeptin';
  if (/^KLOW$/i.test(t)) return 'KLOW';
  if (/^KPV$/i.test(t)) return 'KPV';
  if (/^LIPO-C/i.test(t)) return 'LIPO-C';
  if (/^LL-37/i.test(t)) return 'LL-37';
  if (/^MOTS-c$/i.test(t)) return 'MOTS-c';
  if (/^MT-1$/i.test(t)) return 'MT-1';
  if (/^MT-II$/i.test(t)) return 'MT-II';
  if (/N-acetyl Selank/i.test(t)) return 'N-acetyl Selank';
  if (/N-acetyl Semax/i.test(t)) return 'N-acetyl Semax';
  if (/^NAD\+/i.test(t)) return 'NAD+';
  if (/^Orbitzen/i.test(t)) return 'Orbitzen';
  if (/^Oxytocin/i.test(t)) return 'Oxytocin';
  if (/^Pinealon$/i.test(t)) return 'Pinealon';
  if (/^PT-141$/i.test(t)) return 'PT-141';
  if (/^Selank 10mg$/i.test(t)) return 'Selank';
  if (/^Semax 10mg$/i.test(t)) return 'Semax';
  if (/^Sermorelin/i.test(t)) return 'Sermorelin';
  if (/^SLU-PP-332/i.test(t)) return 'SLU-PP-332';
  if (/^SomatoPulse/i.test(t)) return 'SomatoPulse';
  if (/^SS-31$/i.test(t)) return 'SS-31';
  if (/^Survodutide/i.test(t)) return 'Survodutide';
  if (/^TB-500/i.test(t)) return 'TB-500';
  if (/^Tesa-/i.test(t)) return 'Tesa';
  if (/^Thymosin Alpha-1/i.test(t)) return 'Thymosin Alpha-1';
  if (/^Vilon/i.test(t)) return 'Vilon';
  if (/^VIP /i.test(t)) return 'VIP';
  if (/^Wolverine/i.test(t)) return 'Wolverine';
  return 'UNKNOWN';
}

/**
 * Each row: indicationOrContext, minimumEffectiveDoseNotes, evidenceBasis
 * evidenceBasis: regulatory_label | pivotal_trials | phase1_human | clinical_exploratory | preclinical_animal | compounded_practice | not_applicable_peptide | unknown_identity
 */
const MED = {
  '1G-SGT': [
    {
      indicationOrContext: 'Type 2 diabetes (semaglutide, subcutaneous, pharmacy product)',
      evidenceBasis: 'regulatory_label',
      minimumEffectiveDoseNotes:
        'US label titration usually begins below the chronic maintenance dose. Glycemic benefits in trials accrue after titration; many adults remain on 0.5 mg or 1 mg once weekly for maintenance (verify current Ozempic or local equivalent prescribing information). Doses under maintenance are induction steps, not the long-term efficacy anchor.',
    },
    {
      indicationOrContext: 'Obesity (semaglutide 2.4 mg program, pharmacy product)',
      evidenceBasis: 'pivotal_trials',
      minimumEffectiveDoseNotes:
        'STEP trial programs stepped dose upward toward 2.4 mg once weekly for maximal average weight loss. Lower weekly doses in the same trials still beat placebo, but the cornerstone maintenance dose for the obesity filing was 2.4 mg once weekly after titration.',
    },
  ],
  '2G-TZ': [
    {
      indicationOrContext: 'Type 2 diabetes or obesity (tirzepatide, pharmacy product)',
      evidenceBasis: 'regulatory_label',
      minimumEffectiveDoseNotes:
        'Labels start low (for example 2.5 mg once weekly) and increase monthly. The first dose is mainly tolerability. Lowest maintenance doses with sustained glycemic or weight separation in trials are typically mid-range weekly milligram doses; use the current Mounjaro or Zepbound PI for the exact schedule.',
    },
  ],
  '3G-RT': [
    {
      indicationOrContext: 'Obesity (retatrutide-class investigational triple agonist)',
      evidenceBasis: 'pivotal_trials',
      minimumEffectiveDoseNotes:
        'Published phase 2 obesity trials used escalating weekly milligram doses; clinically meaningful average weight loss appeared at mid-study dose levels and increased with higher assigned doses. No consumer titration sheet exists outside trials.',
    },
  ],
  '5-amino-1mq': [
    {
      indicationOrContext: 'Human use',
      evidenceBasis: 'preclinical_animal',
      minimumEffectiveDoseNotes:
        'Rodent obesity work used inhibitor doses with measurable plasma exposure; a human minimum effective dose is not established in peer-reviewed dosing guides.',
    },
  ],
  'AOD-9604': [
    {
      indicationOrContext: 'Historical oral development program',
      evidenceBasis: 'clinical_exploratory',
      minimumEffectiveDoseNotes:
        'Sponsored trials tested milligram oral daily regimens; registrational obesity success was not achieved. No current widely accepted human MED for injectable grey-market vials.',
    },
  ],
  'ARA-290': [
    {
      indicationOrContext: 'Neuropathy trials (SC)',
      evidenceBasis: 'clinical_exploratory',
      minimumEffectiveDoseNotes:
        'Phase programs used fixed daily or intermittent SC microgram-milligram regimens per protocol; follow trial publications or investigator brochures, not social calculators.',
    },
  ],
  'BPC-157': [
    {
      indicationOrContext: 'Animal injury models',
      evidenceBasis: 'preclinical_animal',
      minimumEffectiveDoseNotes:
        'Many papers use roughly 10 micrograms per kilogram body weight per dose (IP or SC) in rats, sometimes split daily, but species and route change exposure. Human equivalent exposure is not validated; no agreed human MED.',
    },
  ],
  Bronchogen: [
    {
      indicationOrContext: 'Human',
      evidenceBasis: 'preclinical_animal',
      minimumEffectiveDoseNotes:
        'Commercial microgram-milligram course lore exists without a single Western RCT anchor for MED.',
    },
  ],
  'Cag-10mg': [
    {
      indicationOrContext: 'CagriSema-style fixed dose (investigational product, pharmacy trial material)',
      evidenceBasis: 'pivotal_trials',
      minimumEffectiveDoseNotes:
        'Phase 3 narratives describe matched weekly doses of semaglutide and cagrilintide components (for example 2.4 mg each once weekly after titration in public summaries). Retail 10 mg vials may not map 1:1 to trial ratios.',
    },
  ],
  'CJC-1295': [
    {
      indicationOrContext: 'Human GH axis (grey market)',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'No FDA-approved chronic MED for this exact blend in healthy adults. Community posts cite microgram ranges for each peptide that exceed peer-reviewed outcome data. Treat any number as unverified.',
    },
  ],
  DSIP: [
    {
      indicationOrContext: 'Historic human IV sleep studies',
      evidenceBasis: 'clinical_exploratory',
      minimumEffectiveDoseNotes:
        'Old IV protocols used roughly tens of nanomoles per kilogram as single night-time doses in small cohorts. No modern subcutaneous MED standard.',
    },
  ],
  Epithalon: [
    {
      indicationOrContext: 'Human',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Bioregulator courses cite low milligram totals over days; randomized Western MED not defined.',
    },
  ],
  'FOXO4-DRI': [
    {
      indicationOrContext: 'Animal senolytic models',
      evidenceBasis: 'preclinical_animal',
      minimumEffectiveDoseNotes:
        'Rodent work used intermittent milligram-per-kilogram-equivalent peptide courses; human translation uncertain.',
    },
  ],
  'GHK-Cu': [
    {
      indicationOrContext: 'Topical cosmetics',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Cosmetic formulas use low percent copper-peptide; systemic injection MED for wellness is not evidence-anchored.',
    },
  ],
  'GLOW 70': [
    {
      indicationOrContext: 'Vendor blend totals',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'MED must be evaluated per component at its fractional dose inside 70 mg total; no combined clinical MED.',
    },
  ],
  Glutathione: [
    {
      indicationOrContext: 'IV wellness',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Clinic protocols vary widely (hundreds to multiple grams per infusion series). Controlled outcome MED for subjective wellness is not standardized.',
    },
  ],
  Ipamorelin: [
    {
      indicationOrContext: 'Healthy volunteer GH release (phase I)',
      evidenceBasis: 'phase1_human',
      minimumEffectiveDoseNotes:
        'Published IV and SC pharmacodynamic studies used microgram per kilogram boluses that increased GH; cumulative chronic benefit MED for body composition is not established from those acute designs.',
    },
  ],
  Kisspeptin: [
    {
      indicationOrContext: 'Research infusions',
      evidenceBasis: 'clinical_exploratory',
      minimumEffectiveDoseNotes:
        'Acute microgram-per-kilogram infusions stimulate LH; pulsatile versus continuous infusion changes the biology. MED depends entirely on the study question.',
    },
  ],
  KLOW: [
    {
      indicationOrContext: 'Vendor 80 mg blend',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Allocate milligrams per peptide from vendor COA, then compare each to its solo literature; a single MED for the bundle does not exist.',
    },
  ],
  KPV: [
    {
      indicationOrContext: 'Rodent colitis models',
      evidenceBasis: 'preclinical_animal',
      minimumEffectiveDoseNotes:
        'Effective anti-inflammatory signals in animals used microgram-to-milligram per kg regimens by route; human MED unsettled.',
    },
  ],
  'LIPO-C': [
    {
      indicationOrContext: 'IM wellness cocktails',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Typical clinic menus use weekly IM volumes with MIC plus B12 ingredients; no universal MED for weight loss endpoints.',
    },
  ],
  'LL-37': [
    {
      indicationOrContext: 'Research',
      evidenceBasis: 'preclinical_animal',
      minimumEffectiveDoseNotes:
        'Animal infection models use microgram local or systemic exposures with narrow safety windows; human therapeutic MED undefined.',
    },
  ],
  'MOTS-c': [
    {
      indicationOrContext: 'Rodent metabolic models',
      evidenceBasis: 'preclinical_animal',
      minimumEffectiveDoseNotes:
        'Studies used repeated SC or IP doses with mg-per-kg framing in mice; human conversion speculative.',
    },
  ],
  'MT-1': [
    {
      indicationOrContext: 'Erythropoietic protoporphyria (afamelanotide implant)',
      evidenceBasis: 'regulatory_label',
      minimumEffectiveDoseNotes:
        'Approved schedule is a 16 mg SC implant about every 60 days for photoprotection, not daily microdosing.',
    },
  ],
  'MT-II': [
    {
      indicationOrContext: 'Human tanning misuse reports',
      evidenceBasis: 'clinical_exploratory',
      minimumEffectiveDoseNotes:
        'Anecdotes describe very low microgram SC amounts because of nausea; no approved MED for cosmetic use.',
    },
  ],
  'N-acetyl Selank': [
    {
      indicationOrContext: 'Nasal regimens (regional products)',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Russian packaging cites hundreds of micrograms per day divided doses; Western RCT-derived MED absent.',
    },
  ],
  'N-acetyl Semax': [
    {
      indicationOrContext: 'Nasal regimens (regional products)',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Similar microgram-per-day divided intranasal courses to parent semax in commercial descriptions; confirm against national label if any.',
    },
  ],
  'NAD+': [
    {
      indicationOrContext: 'IV wellness',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Infusion doses span a wide gram range across clinics; objective biomarker MED not consensus-defined.',
    },
  ],
  Orbitzen: [
    {
      indicationOrContext: 'Unknown formula',
      evidenceBasis: 'unknown_identity',
      minimumEffectiveDoseNotes:
        'Cannot state MED until active ingredients and human data exist.',
    },
  ],
  Oxytocin: [
    {
      indicationOrContext: 'Labor IV (approved)',
      evidenceBasis: 'regulatory_label',
      minimumEffectiveDoseNotes:
        'Uterotonic infusion follows institutional obstetric protocols (milliunits per minute ranges), not a single universal milligram MED.',
    },
    {
      indicationOrContext: 'Intranasal research',
      evidenceBasis: 'clinical_exploratory',
      minimumEffectiveDoseNotes:
        'Behavior studies often used single international-unit nasal doses in the dozens of IU range; replication varies.',
    },
  ],
  Pinealon: [
    {
      indicationOrContext: 'Bioregulator marketing',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Sublingual microgram-milligram short courses claimed; MED not trial-locked.',
    },
  ],
  'PT-141': [
    {
      indicationOrContext: 'Hypoactive sexual desire (bremelanotide autoinjector)',
      evidenceBasis: 'regulatory_label',
      minimumEffectiveDoseNotes:
        'US label uses 1.75 mg subcutaneous as the single on-demand dose at least 45 minutes before sex, with frequency caps; that dose is the studied effective unit, not a titration ladder.',
    },
  ],
  Selank: [
    {
      indicationOrContext: 'Regional nasal or IM products',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Commercial courses cite divided microgram or low milligram daily totals; MED not harmonized globally.',
    },
  ],
  Semax: [
    {
      indicationOrContext: 'Regional intranasal products',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Typical package inserts abroad describe divided microgram-per-day nasal schedules during treatment courses.',
    },
  ],
  Sermorelin: [
    {
      indicationOrContext: 'Historical pediatric GHD (injectable)',
      evidenceBasis: 'regulatory_label',
      minimumEffectiveDoseNotes:
        'Historical US labeling used nightly SC microgram-per-kilogram pediatric schemes; adult wellness regimens quoted online are off-label and lack one MED.',
    },
  ],
  'SLU-PP-332': [
    {
      indicationOrContext: 'Mouse endurance models',
      evidenceBasis: 'preclinical_animal',
      minimumEffectiveDoseNotes:
        'Rodent mg-per-kg oral exposures drove ERR agonism; human equivalent unknown.',
    },
  ],
  SomatoPulse: [
    {
      indicationOrContext: 'Named blend (tesamorelin + ipamorelin)',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'SomatoPulse listing cites 10 mg tesamorelin plus 3 mg ipamorelin total mass per vendor name but human outcome MED for the pair is not trial-standardized. Compare each drug to its solo label or phase I data.',
    },
  ],
  'SS-31': [
    {
      indicationOrContext: 'Clinical trial IV or SC (elamipretide)',
      evidenceBasis: 'clinical_exploratory',
      minimumEffectiveDoseNotes:
        'Trial protocols used weight-based or flat milligram day schedules for mitochondrial indications; home MED not defined outside studies.',
    },
  ],
  Survodutide: [
    {
      indicationOrContext: 'Obesity or MASH phase 2 trials',
      evidenceBasis: 'pivotal_trials',
      minimumEffectiveDoseNotes:
        'Weekly subcutaneous milligram titrations with top doses near high single-digit to low double-digit milligrams in published cohorts; follow trial paper, not resale vial math.',
    },
  ],
  'TB-500': [
    {
      indicationOrContext: 'Animal models',
      evidenceBasis: 'preclinical_animal',
      minimumEffectiveDoseNotes:
        'Thymosin beta-4 family animal studies vary widely in microgram per kg; TB-500 fragment human MED not published like a drug label.',
    },
  ],
  Tesa: [
    {
      indicationOrContext: 'HIV lipodystrophy visceral fat (tesamorelin)',
      evidenceBasis: 'regulatory_label',
      minimumEffectiveDoseNotes:
        'US Egrifta label is 2 mg SC once daily into the abdomen; that is the registrational effective dose, not a sub-milligram MED ladder.',
    },
  ],
  'Thymosin Alpha-1': [
    {
      indicationOrContext: 'HBV/HCV programs (non-US labels historically)',
      evidenceBasis: 'regulatory_label',
      minimumEffectiveDoseNotes:
        'Many national regimens use about 1.6 mg SC twice weekly (or bioequivalent square-meter scaling) alongside standard antivirals; verify country PI.',
    },
  ],
  Vilon: [
    {
      indicationOrContext: 'Bioregulator lore',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'Low milligram short oral or injectable pulses in marketing; no Western consensus MED.',
    },
  ],
  VIP: [
    {
      indicationOrContext: 'Investigational infusions',
      evidenceBasis: 'clinical_exploratory',
      minimumEffectiveDoseNotes:
        'Dose is protocol-specific to indication (microgram per kg per day in some inflammation trials).',
    },
  ],
  Wolverine: [
    {
      indicationOrContext: 'Retail 20 mg blend (example 10 mg BPC-157 plus 10 mg TB-500 class split)',
      evidenceBasis: 'compounded_practice',
      minimumEffectiveDoseNotes:
        'MED must be computed per component after confirming actual milligram split on COA; combined human MED absent.',
    },
  ],
  UNKNOWN: [
    {
      indicationOrContext: 'Unmapped SKU',
      evidenceBasis: 'unknown_identity',
      minimumEffectiveDoseNotes:
        'Obtain identity and human or animal reference dosing before assigning any MED.',
    },
  ],
};

const doseGuidelinesLegend = {
  clinical_exploratory: 'Small or special-protocol human studies; not a consumer dose card.',
  compounded_practice: 'Wellness or regional prescribing lore; wide variance, weak universal MED.',
  evidence_note:
    'minimumEffectiveDoseNotes summarizes where an effect first appears in the cited tier (label, pivotal trial, phase I, or animal). It is not your personal dose and not a substitute for a prescriber or trial protocol.',
  not_applicable_peptide: 'Excipient or solvent; MED for a drug effect does not apply.',
  phase1_human: 'Healthy volunteer pharmacology only; chronic benefit MED usually unknown.',
  pivotal_trials: 'Registration-quality trials that defined effective maintenance doses for an indication.',
  preclinical_animal: 'Animal only; human conversion is uncertain.',
  regulatory_label: 'FDA or other regulator-approved prescribing information for a matched pharmaceutical.',
  unknown_identity: 'Active unknown; MED cannot be stated.',
};

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const disclaimer =
  db.disclaimer +
  ' doseGuidelines summarize published label, trial, or animal literature about doses where effects were seen. They are not instructions to self-dose, convert animal doses, or match grey-market vials to pharmaceuticals.';

const meta = {
  ...db.meta,
  builtAt: new Date().toISOString(),
  doseGuidelinesLegend,
  schemaVersion: '2.3',
};

function buildRow(e) {
  const k = resolveKey(e.catalog.title);
  const doseGuidelines = MED[k] ?? MED.UNKNOWN;
  const o = {
    catalog: e.catalog,
    compoundType: e.compoundType,
    cyclingNotes: e.cyclingNotes,
    doseGuidelines,
    dosingTimingNotes: e.dosingTimingNotes,
    notes: e.notes,
    potentialApplications: e.potentialApplications,
    reportedBenefits: e.reportedBenefits,
    researchSummary: e.researchSummary,
    sources: e.sources,
    synergisticWith: e.synergisticWith,
    wellnessCategories: e.wellnessCategories,
  };
  if (!o.notes) delete o.notes;
  if (!o.synergisticWith) delete o.synergisticWith;
  return o;
}

const entries = db.entries.map(buildRow);
fs.writeFileSync(dbPath, JSON.stringify({ disclaimer, meta, entries }, null, 2) + '\n', 'utf8');
console.log('wrote', dbPath, 'schema', meta.schemaVersion);
