/**
 * Merges person-centered potentialApplications into peptide-info-database.json
 * Run: node scripts/merge-potential-applications.mjs
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

/** @type {Record<string, { personCenteredBenefit: string, evidenceNote: string }[]>} */
const APP = {
  '1G-SGT': [
    { personCenteredBenefit: 'Help people with type 2 diabetes bring blood sugar down when used as prescribed GLP-1 therapy.', evidenceNote: 'Strong trial data for pharmacy semaglutide; identity of research vials must match.' },
    { personCenteredBenefit: 'Help some adults lose a meaningful amount of weight combined with diet and movement support.', evidenceNote: 'Strong RCT evidence for semaglutide; not interchangeable with unverified powders.' },
    { personCenteredBenefit: 'May lower risk of major heart events in certain high-risk adults (trial-defined group).', evidenceNote: 'SELECT-style cardiovascular trial context for semaglutide class.' },
  ],
  '2G-TZ': [
    { personCenteredBenefit: 'Improve blood sugar control in type 2 diabetes when the molecule is pharmacy tirzepatide used as directed.', evidenceNote: 'Robust dual GIP/GLP-1 trial data at approved doses.' },
    { personCenteredBenefit: 'Support substantial weight loss in obesity when used as prescribed.', evidenceNote: 'Trial-supported for tirzepatide where licensed.' },
  ],
  '3G-RT': [
    { personCenteredBenefit: 'May produce large weight reductions in trial volunteers when the agent is a triple incretin under study.', evidenceNote: 'Retatrutide-class trials; not a guaranteed outcome for grey-market products.' },
    { personCenteredBenefit: 'May improve glucose markers alongside weight in study participants.', evidenceNote: 'Development-stage; retail codes may not match trial material.' },
  ],
  '5-amino-1mq': [
    { personCenteredBenefit: 'Theoretically could bias metabolism toward less fat gain in obesity models.', evidenceNote: 'Almost only animal data; no proven benefit in people for this research chemical.' },
  ],
  'AOD-9604': [
    { personCenteredBenefit: 'Was explored to help people lose fat without full growth-hormone exposure.', evidenceNote: 'Key registrational weight trials did not win broad approval; human benefit today is unproven at consumer vials.' },
  ],
  'ARA-290': [
    { personCenteredBenefit: 'Aims to ease nerve-related pain and help repair small-fiber damage in development programs.', evidenceNote: 'Clinical-stage IRR peptide; not a take-home OTC cure.' },
  ],
  'BPC-157': [
    { personCenteredBenefit: 'Animal research suggests faster healing after tendon, muscle, or gut lining stress.', evidenceNote: 'Human proof is thin; sport bans apply; DIY use is not evidence-based medicine.' },
  ],
  Bronchogen: [
    { personCenteredBenefit: 'Marketed narratives claim calmer airways and easier breathing in aging lungs.', evidenceNote: 'Mostly preclinical and regional literature; treat claims cautiously.' },
  ],
  'Cag-10mg': [
    { personCenteredBenefit: 'Designed to help people lose more weight than GLP-1 alone by adding amylin-class satiety.', evidenceNote: 'Phase 3 CagriSema-style development; exact retail vial must match pharmaceutical specs to mean anything similar.' },
  ],
  'CJC-1295': [
    { personCenteredBenefit: 'Intended to raise a person\'s own growth-hormone pulses for recovery or body-composition goals in grey-market use.', evidenceNote: 'Long-term benefit in healthy adults is debated; pituitary desensitization is a risk theme in science reviews.' },
  ],
  DSIP: [
    { personCenteredBenefit: 'Early small studies hinted at deeper, steadier sleep after IV use.', evidenceNote: 'Dated human data; no modern home-use standard.' },
  ],
  Epithalon: [
    { personCenteredBenefit: 'Sold on the idea of supporting youthful cell behavior via telomerase-related biology.', evidenceNote: 'Mostly cells and animals; independent human replication is limited.' },
  ],
  'FOXO4-DRI': [
    { personCenteredBenefit: 'Conceptually helps tissues by clearing worn-out senescent cells.', evidenceNote: 'Rodent and dish work; human geriatric use is not established.' },
  ],
  'GHK-Cu': [
    { personCenteredBenefit: 'May improve how skin looks and feels and support healing after surface injury in cosmetic science.', evidenceNote: 'Topical human data strongest; systemic vials shift the risk-benefit picture.' },
  ],
  'GLOW 70': [
    { personCenteredBenefit: 'Bundles matrix repair, local healing signals, and cell-movement biology some users chase for visible recovery.', evidenceNote: 'Vendor blend; human outcome trials for the exact mix do not exist.' },
  ],
  Glutathione: [
    { personCenteredBenefit: 'Supports the body\'s main antioxidant buffer so cells handle stress and toxins better.', evidenceNote: 'IV wellness benefit varies by person and protocol; oral absorption limits differ.' },
  ],
  Ipamorelin: [
    { personCenteredBenefit: 'Briefly boosts natural GH release with selective pituitary signaling in study settings.', evidenceNote: 'Phase I exists; chronic body-composition or anti-aging benefit in lay use is unproven.' },
  ],
  Kisspeptin: [
    { personCenteredBenefit: 'Can restore or probe normal fertility hormone timing in research clinic infusions.', evidenceNote: 'Not a DIY fertility drug; dosing is protocol-driven.' },
  ],
  KLOW: [
    { personCenteredBenefit: 'Targets both quieting inflammation and speeding tissue remodeling in marketing copy.', evidenceNote: 'Four-peptide blend; evidence is mechanistic storytelling plus animal parts.' },
  ],
  KPV: [
    { personCenteredBenefit: 'May calm gut or skin inflammation pathways in animal inflammation models.', evidenceNote: 'Human IBD or dermatology benefit not nailed down for this tripeptide alone.' },
  ],
  'LIPO-C': [
    { personCenteredBenefit: 'Clinics pitch easier fat processing in the liver, steadier energy, and vitamin B12 support.', evidenceNote: 'Weight-loss RCT quality for the exact cocktail is weak compared with approved drugs.' },
  ],
  'LL-37': [
    { personCenteredBenefit: 'Nature uses it to fight bacteria and coordinate wound repair.', evidenceNote: 'Therapeutic use in people is experimental; wrong dose could inflame tissues.' },
  ],
  'MOTS-c': [
    { personCenteredBenefit: 'Mouse data suggest better insulin sensitivity, exercise-like metabolism, and healthier aging trajectories.', evidenceNote: 'Translation to humans is early; no OTC miracle dose.' },
  ],
  'MT-1': [
    { personCenteredBenefit: 'Gives people with certain light-allergy blood disorders safer sun tolerance via implant.', evidenceNote: 'Afamelanotide is FDA-approved for EPP, not casual tanning.' },
    { personCenteredBenefit: 'Can deepen skin pigment in research tanning contexts.', evidenceNote: 'Cosmetic tanning use is off-label or unapproved depending on region.' },
  ],
  'MT-II': [
    { personCenteredBenefit: 'Darkens skin with less UV and affects appetite and arousal pathways in animal and anecdotal human use.', evidenceNote: 'Not approved for cosmetic use; nausea and cardiovascular concerns exist.' },
  ],
  'N-acetyl Selank': [
    { personCenteredBenefit: 'Aims to take the edge off anxiety and stress reactivity like parent selank.', evidenceNote: 'Regional prescribing history; Western confirmatory trials are sparse.' },
  ],
  'N-acetyl Semax': [
    { personCenteredBenefit: 'Marketed for sharper focus and quicker cognitive bounce-back after stress or fatigue.', evidenceNote: 'Stability variant of semax; core evidence is regional and preclinical-heavy.' },
  ],
  'NAD+': [
    { personCenteredBenefit: 'Replenishes a cellular fuel molecule tied to energy, DNA repair enzymes, and stress resistance.', evidenceNote: 'IV wellness trends outpace uniform trial proof; precursors (NR, NMN) have more published human data than raw NAD+ for many goals.' },
  ],
  Orbitzen: [
    { personCenteredBenefit: 'Unknown until the seller publishes exactly what is in the vial.', evidenceNote: 'Cannot state personal benefit without identity and trials.' },
  ],
  Oxytocin: [
    { personCenteredBenefit: 'Helps childbirth progress safely under hospital protocols.', evidenceNote: 'IV uterotonic label use is established.' },
    { personCenteredBenefit: 'Research explores trust, bonding, and mood after nasal spray in some studies.', evidenceNote: 'Replication is mixed; not a solo fix for mental health.' },
  ],
  Pinealon: [
    { personCenteredBenefit: 'Sold for clearer thinking, better sleep rhythm, and calmer stress perception in bioregulator marketing.', evidenceNote: 'Human RCT backup is thin.' },
  ],
  'PT-141': [
    { personCenteredBenefit: 'Can restore sexual desire in premenopausal women with HSDD when used as FDA-approved bremelanotide.', evidenceNote: 'Nausea is common; timing follows the Vyleesi label.' },
  ],
  Selank: [
    { personCenteredBenefit: 'May ease anxiety and improve day-to-day stress coping in regimens used abroad.', evidenceNote: 'Russian approval context; export-level evidence differs.' },
  ],
  Semax: [
    { personCenteredBenefit: 'Used in some health systems after stroke or for attention and mental stamina support.', evidenceNote: 'Regional practice patterns; US FDA path is not the same.' },
  ],
  Sermorelin: [
    { personCenteredBenefit: 'Encourages the pituitary to release more GH for growth in children historically, and for vitality goals in some adult clinics.', evidenceNote: 'Pediatric product discontinued commercially in the US; adult benefit and safety need individualized medicine.' },
  ],
  'SLU-PP-332': [
    { personCenteredBenefit: 'In mice, mimics some benefits of exercise on endurance and fat mass.', evidenceNote: 'Human translation and safety are unknown publicly.' },
  ],
  SomatoPulse: [
    { personCenteredBenefit: 'Pairs belly-fat targeting GHRH action with a GH pulse secretagogue for combined axis drive.', evidenceNote: 'Named retail blend; monitor glucose and IGF-1 themes from tesamorelin pharmacology if real.' },
  ],
  'SS-31': [
    { personCenteredBenefit: 'Tries to make mitochondria produce energy more cleanly in rare disease and heart stress trials.', evidenceNote: 'Elamipretide development; benefit tied to trial population, not general wellness vials.' },
  ],
  Survodutide: [
    { personCenteredBenefit: 'Cuts weight and improves sugar control while also helping fatty liver scores in phase 2 reports.', evidenceNote: 'Dual GLP-1/glucagon agonist still under company development outside personal import.' },
  ],
  'TB-500': [
    { personCenteredBenefit: 'Animal and user narratives claim faster bounce-back from muscle strain, surgery sites, or overuse.', evidenceNote: 'Human TB-500-specific trials are scarce versus parent thymosin beta-4 drug programs.' },
  ],
  Tesa: [
    { personCenteredBenefit: 'Shrinks dangerous deep belly fat in people with HIV lipodystrophy when used as labeled tesamorelin.', evidenceNote: 'Daily monitoring themes on glucose and IGF-1; off-label cosmetic visceral fat claims are weaker.' },
  ],
  'Thymosin Alpha-1': [
    { personCenteredBenefit: 'Helps some hepatitis patients clear virus better with standard drugs in countries where it is approved.', evidenceNote: 'US FDA path differed; immune tuning not a casual immune booster for healthy people in guidelines.' },
  ],
  Vilon: [
    { personCenteredBenefit: 'Bioregulator story targets stronger immune resilience in aging.', evidenceNote: 'Rodent-heavy; Western confirmatory trials minimal.' },
  ],
  VIP: [
    { personCenteredBenefit: 'Explored to cool overactive immunity in gut and lung disease while protecting tissue barriers.', evidenceNote: 'Investigational; formulation and route decide whether any benefit appears.' },
  ],
  Wolverine: [
    { personCenteredBenefit: 'Popular for athletes wanting layered repair signals after joint, muscle, or connective tissue stress.', evidenceNote: 'Mechanism stack only; both parts are banned in many sports and not FDA lifestyle drugs.' },
  ],
  UNKNOWN: [
    { personCenteredBenefit: 'Benefit to a person cannot be stated until the exact molecule and purity are confirmed.', evidenceNote: 'Requires COA and prescriber context.' },
  ],
};

const potentialApplicationEvidenceLegend = {
  how_to_read:
    'personCenteredBenefit is plain-language help a person might seek; evidenceNote states trial depth, regulatory context, or speculation so you do not confuse marketing with proof.',
  not_outcomes:
    'Listing a benefit does not mean this shop vial will produce it; identity, dose, purity, and medical supervision decide real-world results.',
};

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const disclaimer =
  db.disclaimer +
  ' potentialApplications state person-centered benefit language for education only; evidenceNote on each line limits the claim. Not a promise of results for any catalog SKU.';

const meta = {
  ...db.meta,
  builtAt: new Date().toISOString(),
  schemaVersion: '2.2',
  potentialApplicationEvidenceLegend,
};

const entries = db.entries.map((e) => {
  const k = resolveKey(e.catalog.title);
  const apps = APP[k] ?? APP.UNKNOWN;
  const row = {
    catalog: e.catalog,
    compoundType: e.compoundType,
    cyclingNotes: e.cyclingNotes,
    dosingTimingNotes: e.dosingTimingNotes,
    notes: e.notes,
    potentialApplications: apps.map((a) => ({
      evidenceNote: a.evidenceNote,
      personCenteredBenefit: a.personCenteredBenefit,
    })),
    reportedBenefits: e.reportedBenefits,
    researchSummary: e.researchSummary,
    sources: e.sources,
    synergisticWith: e.synergisticWith,
    wellnessCategories: e.wellnessCategories,
  };
  if (!row.notes) delete row.notes;
  if (!row.synergisticWith) delete row.synergisticWith;
  return row;
});

fs.writeFileSync(dbPath, JSON.stringify({ disclaimer, meta, entries }, null, 2) + '\n', 'utf8');
console.log('wrote', dbPath, 'schema', meta.schemaVersion);
