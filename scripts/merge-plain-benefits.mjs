/**
 * Rewrites reportedBenefits in plain English for all entries.
 * Run: node peptides/scripts/merge-plain-benefits.mjs
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

const BENEFITS = {
  '1G-SGT': [
    "Clinical trials: significantly lowers blood sugar (HbA1c) in people with type 2 diabetes.",
    "Clinical trials (STEP program): produces meaningful weight loss when combined with diet and exercise.",
    "Heart health (SELECT trial): reduced major heart events in people with obesity and heart disease.",
    "Also reported: modest drops in blood pressure and cholesterol in trial participants.",
    "How it works: slows stomach emptying and reduces appetite, leading to eating less and better blood sugar control.",
  ],
  '2G-TZ': [
    "Clinical trials: lowers blood sugar more effectively than many single-target diabetes drugs.",
    "Clinical trials (SURMOUNT program): produces greater weight loss than older single-pathway drugs, including in head-to-head comparisons.",
    "Also reported: reductions in waist size and improvements in heart-risk blood markers.",
    "How it works: activates two gut-hormone receptors (GIP and GLP-1) for stronger appetite and blood sugar control than either alone.",
  ],
  '3G-RT': [
    "Phase 2 trials: produced some of the largest average weight-loss numbers reported for any drug in this class.",
    "Also reported: improvements in fasting blood sugar and insulin levels at higher doses.",
    "Early data: positive shifts in triglycerides and liver enzyme markers in some participants.",
    "Still in development: combines three hormone pathways (GIP, GLP-1, glucagon) for weight and blood sugar effects.",
  ],
  '5-amino-1mq': [
    "Animal studies: reduced body fat and improved blood sugar control in obese mice.",
    "Rodent data: confirmed the compound gets absorbed into the body after dosing.",
    "No human trials: there is no accepted clinical evidence that it works or is safe for people.",
  ],
  'AOD-9604': [
    "Clinical trials: the major human trials did not meet their weight-loss or metabolic goals.",
    "Animal and early data: originally showed fat-burning potential tied to the growth hormone fragment theory.",
    "Wellness market claims: positioned as a fat burner without the side effects of full growth hormone, but human evidence is weak compared to approved alternatives.",
  ],
  'ARA-290': [
    "Clinical trials: showed signals for reducing nerve pain and improving small nerve fiber health.",
    "Designed to activate the body's natural repair pathways without thickening the blood like the hormone it was based on (EPO).",
    "Early data: some improvements in inflammatory and metabolic blood markers in small studies.",
  ],
  'BPC-157': [
    "Animal studies: speeds up healing of tendons, muscles, bones, and gut lining in multiple rodent experiments.",
    "Animal studies: protects the stomach lining and promotes new blood vessel growth in gut injury models.",
    "Human evidence: very limited formal clinical trials; most claims come from case reports and athlete testimonials.",
    "Sport status: banned by WADA (World Anti-Doping Agency) since 2022.",
  ],
  Bronchogen: [
    "Russian specialty literature: marketed for supporting lung tissue health during aging.",
    "No large Western clinical trials: benefit claims should be treated as unproven hypotheses.",
    "Evidence comes mainly from small studies in niche journals and vendor course materials.",
  ],
  'Cag-10mg': [
    "Clinical trials: produces dose-dependent weight loss on its own as a long-acting amylin-type drug.",
    "Combination data: adding it to a GLP-1 drug (like semaglutide) produced more weight loss than the GLP-1 drug alone.",
    "How it works: slows stomach emptying and increases fullness signals on top of what appetite drugs already do.",
  ],
  'CJC-1295': [
    "Human studies (GHRH analogs): produces sustained increases in growth hormone and IGF-1 levels.",
    "Human studies (Ipamorelin): triggers natural growth hormone pulses with fewer stress-hormone side effects than older drugs in its class.",
    "Combined use theory: the two peptides stimulate growth hormone through different pathways for a stronger overall effect; however, long-term body-composition trial data for this retail combination is thin.",
    "Monitoring note: may cause fluid retention, joint discomfort, and changes in insulin sensitivity that need medical oversight.",
  ],
  DSIP: [
    "Older human studies: showed mixed and inconsistent effects on sleep stages and sleep quality.",
    "Animal research: various brain and hormone effects reported depending on the model.",
    "Current standing: not enough reliable evidence to compare it to approved sleep medications.",
  ],
  Epithalon: [
    "Lab and animal studies: showed activation of telomerase (the enzyme that maintains chromosome tips) and pineal gland effects.",
    "Small human studies: mixed results on aging biomarkers; no large independent studies have confirmed the claims.",
    "Market positioning: longevity and sleep-cycle claims are far ahead of the actual published evidence.",
  ],
  'FOXO4-DRI': [
    "Mouse studies: improved physical function and reduced markers of damaged senescent cells in aging models.",
    "No mature human trials: safety and effectiveness for people are completely undefined.",
    "How it works: designed to trigger self-destruction of old, damaged cells that accumulate with age.",
  ],
  'GHK-Cu': [
    "Lab studies: stimulates collagen production, attracts immune cells to wounds, and promotes new blood vessel growth.",
    "Skin care evidence: clinical data supports topical use for improving skin firmness, fine lines, and wound healing.",
    "Injectable claims: less well-supported than topical use; most strong evidence is for skin applications.",
  ],
  'GLOW 70': [
    "Vendor blend: combines peptides individually studied for tissue repair (BPC-157, TB-500) and cellular support (NAD+ components).",
    "Component-level evidence: each ingredient has its own research base, but this exact combination has never been clinically tested.",
    "Marketed for recovery and repair: convenience of one product, but no guarantee the ingredients work better together than alone.",
  ],
  Glutathione: [
    "Medical use: studied for people with genuine deficiency states like cystic fibrosis, HIV, and certain cancers where oxidative stress is high.",
    "IV wellness use: temporarily raises antioxidant levels in blood tests, but lasting health benefits for healthy adults are inconsistent in studies.",
    "Biology: the body's most important internal antioxidant and detoxification helper, found in virtually every cell.",
  ],
  Ipamorelin: [
    "Human studies: triggers the pituitary gland to release growth hormone in natural pulses.",
    "Considered \"cleaner\" than older drugs in its class because it causes less of a spike in cortisol (stress hormone) and prolactin.",
    "Used in wellness clinics for body composition, recovery, and anti-aging goals, though long-term outcome data is limited.",
  ],
  Kisspeptin: [
    "Clinical research: acts as the master on-switch for the entire reproductive hormone chain (GnRH, LH, FSH).",
    "Fertility medicine: being studied as a tool to trigger egg maturation and diagnose reproductive hormone disorders.",
    "Biology: the brain's gatekeeper for puberty timing and ongoing fertility signaling.",
  ],
  KLOW: [
    "Vendor blend: extends the GLOW formula by adding KPV (an anti-inflammatory peptide) to the repair peptide mix.",
    "Component-level evidence: each ingredient (BPC-157, TB-500, GHK-Cu, KPV) has individual research, but no trial exists for this exact combination.",
    "Marketed for combined healing and anti-inflammatory benefits in one product.",
  ],
  KPV: [
    "Animal studies: reduced gut inflammation and protected the intestinal lining in colitis models.",
    "How it works: a three-amino-acid fragment of a natural anti-inflammatory hormone (alpha-MSH) that retains its calming effects.",
    "Human translation: still early; no approved use for inflammatory bowel conditions yet.",
  ],
  'LIPO-C': [
    "Ingredients are well-known nutrients (methionine, inositol, choline, B12) involved in fat metabolism.",
    "Clinic popularity: widely offered as a \"fat-burning shot\" in weight-loss programs.",
    "Evidence: limited controlled trials showing the injectable combination is more effective than diet alone for weight loss.",
  ],
  'LL-37': [
    "Lab studies: kills a wide range of bacteria, viruses, and fungi on contact at effective concentrations.",
    "Immune signaling: also activates the body's defense systems including wound-healing and barrier-repair pathways.",
    "Caution: too much LL-37 is linked to inflammatory skin conditions in some people, so context matters.",
  ],
  'MOTS-c': [
    "Animal studies: improved insulin sensitivity, stress resistance, and exercise performance in multiple experiments.",
    "Small human studies: early-phase data showing metabolic and exercise-related biomarker changes.",
    "How it works: a naturally occurring signal from mitochondria that helps regulate how muscles and fat use energy.",
  ],
  'MT-1': [
    "Approved abroad: used as a slow-release implant for people with a rare sun-sensitivity disorder (EPP) to increase sun tolerance.",
    "How it works: strongly stimulates melanin production in skin cells, causing tanning without UV exposure.",
    "Off-label use: popular for cosmetic tanning, but requires monitoring for mole changes and blood pressure effects.",
  ],
  'MT-II': [
    "User reports: produces strong skin tanning, nausea, blood pressure changes, and increased sexual arousal.",
    "Pharmacology: activates melanocortin receptors broadly across the body, causing widespread effects beyond just tanning.",
    "Safety concerns: can cause lasting skin color changes and cardiovascular effects; not approved for any medical use.",
  ],
  'N-acetyl Selank': [
    "Russian clinical data: small trials showing reduced anxiety and improved cognitive performance under stress.",
    "How it works: appears to influence serotonin and GABA systems (the brain's main calming pathways) in animal models.",
    "Modified form: the N-acetyl version is marketed as longer-lasting; Western clinical confirmation is very limited.",
  ],
  'N-acetyl Semax': [
    "Russian clinical use: prescribed there for stroke recovery and cognitive support with brain-growth-factor claims.",
    "Animal studies: increases BDNF (a key brain growth protein) after nasal delivery in lab experiments.",
    "Modified form: the N-acetyl version is marketed as more stable; not part of any US FDA approval pathway.",
  ],
  'NAD+': [
    "Supplement studies (NR, NMN precursors): reliably raise NAD+ levels in blood and tissues.",
    "Anti-aging results: mixed evidence for muscle performance, insulin sensitivity, and blood pressure in healthy adults.",
    "Biology: an essential molecule in every cell for converting food to energy and repairing DNA.",
  ],
  Orbitzen: [
    "Vendor blend: benefits depend entirely on which components are actually included and at what doses (check the certificate of analysis).",
    "Marketing: positioned as a multi-receptor weight-management product combining several active ingredients in one vial.",
    "No standalone clinical trials: this exact mix has not been tested as a combined product in any formal study.",
  ],
  Oxytocin: [
    "Approved medical use: induces labor contractions and controls postpartum bleeding in hospital settings.",
    "Social/mood research: nasal spray studies on trust, social bonding, and autism-related behaviors show small and inconsistent effects across reviews.",
    "Breastfeeding: supports the milk let-down reflex in nursing mothers.",
  ],
  Pinealon: [
    "Russian bioregulator marketing: positioned for brain health and cognitive aging support.",
    "Published human outcomes: very limited compared to the volume of marketing claims.",
    "Evidence comes from niche journals and vendor materials; independent Western confirmation is absent.",
  ],
  'PT-141': [
    "FDA-approved (as Vyleesi): improved sexual desire scores in premenopausal women with clinically low sexual desire in registration trials.",
    "Common side effects: nausea, flushing, temporary blood pressure changes, and occasional skin darkening at injection sites.",
    "How it works: activates melanocortin receptors in the brain to increase arousal, a completely different pathway from blood-flow drugs like Viagra.",
  ],
  Selank: [
    "Russian clinical use: prescribed for generalized anxiety and stress-related complaints in small domestic trials.",
    "Animal studies: shows anti-anxiety behavior plus some immune-modulating effects.",
    "Immune research: early lab studies suggest it may influence inflammatory signaling, but this is not yet clinically established.",
  ],
  Semax: [
    "Russian clinical use: prescribed there as an add-on therapy for stroke recovery and cognitive support.",
    "Animal studies: protected brain tissue after simulated strokes and increased brain growth factor (BDNF) levels.",
    "Delivery: given as a nasal spray; based on a fragment of ACTH but without the strong hormonal side effects of full ACTH.",
  ],
  Sermorelin: [
    "Human studies: raises growth hormone and IGF-1 levels over weeks of nightly use in aging and GH-deficient adults.",
    "Side effects: flushing, headache, and injection-site reactions reported in trials; rare allergic reactions possible.",
    "Important limitation: only works if your pituitary gland still has the capacity to produce growth hormone.",
  ],
  'SLU-PP-332': [
    "Mouse studies: improved running endurance and shifted muscle fibers toward endurance types.",
    "Lab studies: increased expression of fat-burning genes in muscle cell experiments.",
    "No human data: a pure research compound with no approved use and unknown safety in people.",
  ],
  SomatoPulse: [
    "Tesamorelin component: FDA-approved for reducing belly fat in HIV lipodystrophy; raises growth hormone and IGF-1.",
    "Ipamorelin component: triggers clean growth hormone pulses with fewer stress-hormone side effects than older alternatives.",
    "Combined product: stacks two growth-hormone mechanisms in one vial, but this exact pairing has no combined clinical trial data.",
  ],
  'SS-31': [
    "Clinical development: being tested for Barth syndrome (a rare mitochondrial disease) and heart failure.",
    "How it works: binds to a specific fat molecule inside mitochondria to stabilize energy production in stressed cells.",
    "Trial data: some improvements in walking distance and oxygen use in patients with mitochondrial diseases.",
  ],
  Survodutide: [
    "Clinical trials: showed significant weight loss and blood sugar improvements versus placebo.",
    "How it works: the GLP-1 side reduces appetite while the glucagon side increases calorie burning, attacking weight from both directions.",
    "Development stage: still in trials and not yet approved; being compared against other next-generation weight-loss drugs.",
  ],
  'TB-500': [
    "Animal studies: faster wound healing and new blood vessel growth in rodent and large animal injury models.",
    "How it works: related to thymosin beta-4, a natural protein that helps cells move to injury sites for repair.",
    "Human evidence: very limited formal clinical trials; popular in sports recovery but flagged by anti-doping agencies.",
  ],
  Tesa: [
    "FDA-approved: significantly reduces belly fat in people with HIV-related lipodystrophy versus placebo.",
    "Monitoring required: can raise blood sugar and insulin resistance, so regular lab work is needed during use.",
    "Off-label use: popular in anti-aging clinics for body composition goals, but that use lacks the same level of clinical evidence.",
  ],
  'Thymosin Alpha-1': [
    "Approved in multiple countries: used as a vaccine booster and immune support for chronic hepatitis B.",
    "Cancer research: explored as an immune-system add-on in various cancer treatment studies with mixed but encouraging results.",
    "COVID era: used compassionately in some settings, but not adopted as a standard antiviral treatment in major guidelines.",
  ],
  Vilon: [
    "Russian bioregulator marketing: positioned for thymus and immune aging support.",
    "Western clinical evidence: very limited; treat benefit claims as speculative.",
    "Evidence comes from niche Russian-language journals and vendor peptide course materials.",
  ],
  VIP: [
    "Medical relevance: used to understand and treat VIPoma tumors that overproduce this hormone, causing severe diarrhea and electrolyte imbalances.",
    "Lung research: shows anti-inflammatory effects in animal models of lung injury and has been explored for severe asthma.",
    "Gut barrier: lab studies suggest it helps stabilize the protective lining of the intestine.",
  ],
  Wolverine: [
    "Combines BPC-157 and TB-500: each has its own animal evidence for tissue repair and healing.",
    "Vendor marketing: positioned as a maximum-recovery product for athletes and injury recovery.",
    "No combined trial data: the side effects and interactions of these two peptides together at high doses have not been formally studied.",
  ],
};

function main() {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  db.meta.schemaVersion = '2.8';
  db.meta.builtAt = new Date().toISOString();

  let unknown = 0;
  let updated = 0;
  for (const entry of db.entries) {
    const key = resolveKey(entry.catalog?.title || '');
    const row = BENEFITS[key];
    if (!row) { unknown++; continue; }
    entry.reportedBenefits = row;
    updated++;
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
  console.error(`wrote ${dbPath} schema ${db.meta.schemaVersion}; updated ${updated} entries; unresolved keys: ${unknown}`);
}

main();
