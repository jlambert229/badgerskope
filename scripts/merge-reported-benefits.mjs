/**
 * Replaces reportedBenefits[] with researched, evidence-tier-labeled bullets per compound class.
 * Run: node peptides/scripts/merge-reported-benefits.mjs
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

/** @type {Record<string, string[]>} */
const BENEFITS = {
  '1G-SGT': [
    'Clinical trials (semaglutide): lower HbA1c and fasting glucose in type 2 diabetes versus placebo and many active comparators.',
    'Clinical trials (STEP program, semaglutide 2.4 mg): large mean weight loss versus placebo with lifestyle counseling.',
    'Clinical outcomes (SELECT, semaglutide 2.4 mg): lower composite MACE in adults with obesity and cardiovascular disease without diabetes.',
    'Trial literature: reductions in systolic blood pressure and some lipid parameters commonly reported as secondary or exploratory endpoints.',
    'Label and trial narratives: delayed gastric emptying and reduced energy intake contributing to glycemic and weight effects.',
  ],
  '2G-TZ': [
    'Clinical trials (SURPASS-class, tirzepatide): robust HbA1c lowering versus placebo and versus several GLP-1 comparators in type 2 diabetes.',
    'Clinical trials (SURMOUNT program): substantial mean weight loss versus placebo in obesity, including greater reduction than semaglutide 1 mg in the published head-to-head obesity trial.',
    'Trial reports: adjustments in waist circumference and cardiometabolic risk markers alongside core glycemic and weight endpoints.',
    'Mechanistic theme from class data: dual GIP/GLP-1 action on insulin, glucagon, and satiety pathways beyond GLP-1 alone.',
  ],
  '3G-RT': [
    'Phase 2 obesity trial reports (retatrutide): dose-dependent mean weight loss among the largest placebo-adjusted signals published for an incretin-class agent.',
    'Trial literature: improvements in fasting glucose, insulin, and dysglycemia prevalence in obese or overweight cohorts receiving higher doses.',
    'Exploratory endpoints in published trial summaries: favorable shifts in some triglyceride or liver enzyme surrogates (population and dose specific).',
    'Ongoing development narrative: retention of glycemic benefits alongside weight effects due to glucagon-arm biology at tolerated doses.',
  ],
  '5-amino-1mq': [
    'Preclinical (diet-induced obesity mice, NNMT inhibitor class): lower adiposity and improved glucose tolerance versus vehicle in published work.',
    'Preclinical pharmacokinetics (rodent): measurable systemic exposure after administration of the methylquinolinium scaffold.',
    'Human tier: no broadly accepted outcome trial establishes anti-obesity efficacy or safety for consumer use of research materials.',
  ],
  'AOD-9604': [
    'Historical pharma trials: primary cardiometabolic or weight endpoints were not met in the prominent development programs summarized in reviews.',
    'Preclinical and early clinical lore: fat-mass and lipid-oriented hypotheses tied to the GH 177-191 fragment narrative.',
    'Grey-market discourse: positioned for lipolysis without full-length GH exposure; human equipoise versus approved obesity pharmacotherapy is poor.',
  ],
  'ARA-290': [
    'Clinical-stage trials (cibinetide / innate repair receptor): neuropathic pain and small-fiber pathology signals in sponsor-led protocols.',
    'Mechanistic design: cytoprotective signaling without strong erythropoietic drive compared with native erythropoietin.',
    'Exploratory cardiometabolic and inflammatory biomarker themes reported in early-phase summaries (program dependent).',
  ],
  'BPC-157': [
    'Rodent literature: accelerated healing in tendon, muscle, bone, and gastrointestinal injury models after systemic or local administration in multiple labs.',
    'Preclinical: cytoprotective and angiogenic themes in gut mucosa and NSAID-ulcer models.',
    'Human evidence: limited prospective RCTs; case series and athlete anecdotes dominate public discourse versus trial proof.',
    'Regulatory sport note: WADA listed BPC-157 as prohibited in competition as of the 2022 prohibited list update.',
  ],
  Bronchogen: [
    'Bioregulator literature (Russian and specialty peptide sources): lung tissue homeostasis and age-related airway biology narratives.',
    'Western confirmatory trials: sparse versus marketing volume; treat benefit claims as hypothesis grade.',
    'Preclinical or ex vivo reports in niche journals described in vendor peptide course materials (independent replication uneven).',
  ],
  'Cag-10mg': [
    'Clinical trials (cagrilintide, amylin analog class): dose-dependent weight loss versus placebo.',
    'Development combination reports: additive adiposity reduction when paired with GLP-1 agonists versus GLP-1 monotherapy in published phase work.',
    'Physiology theme: delayed gastric emptying and central satiety addition on top of incretin appetite suppression.',
  ],
  'CJC-1295': [
    'Ph pharmacology (GHRH analogs with albumin-binding extensions): sustained elevations of GH and IGF-1 versus baseline in healthy adults in published studies.',
    'Ipamorelin human pharmacology: pulsatile GH release with comparatively modest prolactin and cortisol excursion versus some older GHRPs.',
    'Stacking narrative: combined GHRH and GHRP receptor activation to raise secretory tone; long-term body-composition RCT proof for retail blends is thin.',
    'Monitoring theme from endocrine literature: IGF-1 rise, fluid retention, joint discomfort, and insulin sensitivity warrant prescriber oversight when studied.',
  ],
  DSIP: [
    'Small human IV studies (historic): variable changes in sleep staging or subjective sleep quality; replication with modern endpoints is limited.',
    'Animal work: diverse CNS and endocrine endpoints reported depending on model and route.',
    'Contemporary tier: insufficient robust RCT evidence to rank alongside approved sleep pharmacotherapy.',
  ],
  Epithalon: [
    'Cell and animal models: telomerase expression and pineal peptide themes in specialty aging literature.',
    'Human open-label or small trials: mixed biomarker narratives; independent large cohort replication is absent.',
    'Commercial positioning: longevity and circadian regulation claims outpace guideline-grade human outcomes.',
  ],
  'FOXO4-DRI': [
    'Mouse models (published senescence work): improved physical function scores and reduced senescent cell burden markers in organ contexts after modeled interventions.',
    'Translational tier: human gerotherapy trials are not mature; safety and efficacy for DIY use are undefined.',
    'Mechanism narrative: targeted interference with FOXO4 signaling in stressed cells driving apoptosis-prone phenotypes in model systems.',
  ],
  'GHK-Cu': [
    'Dermatology and cosmetic science: improved collagen synthesis, elasticity metrics, and wound closure in topical human or ex vivo studies.',
    'Copper coordination: facilitates matrix remodeling enzymes and angiogenic signaling in bench models.',
    'Systemic injection benefit claims: far less trial support than topical formulations; risk-benefit depends on jurisdiction and purity.',
  ],
  'GLOW 70': [
    'Component inheritance: BPC-157 and TB-500 motifs carry rodent repair literature; NAD+ carries redox bench and mixed human precursor trial narratives.',
    'Blend tier: no registrational trial exists for this exact SKU ratio; synergy is vendor narrative rather than pivotal outcome data.',
  ],
  Glutathione: [
    'Clinical contexts: repletion strategies studied in cystic fibrosis, HIV, cancer adjuvant, and malabsorption settings where oxidative stress is high.',
    'IV wellness use: transient increases in plasma thiol markers in some studies; durable clinical superiority versus placebo for healthy adults is inconsistent.',
    'Biochemistry tier: central intracellular antioxidant and phase II conjugation cofactor universally taught in medical biochemistry.',
  ],
  Ipamorelin: [
    'Healthy volunteer studies: GH and IGF-1 elevation after acute dosing with selective GHRP receptor activation profile in the literature.',
    'Older-adult exploratory trials: short-duration changes in lean mass or fat mass in some small published protocols (not home-use guidance).',
    'Compared with other GHRPs: reduced acute cortisol and prolactin spikes in multiple pharmacology papers (dose and population specific).',
  ],
  Kisspeptin: [
    'Human pharmacology: potent stimulation of LH and FSH secretion; used in research diagnostic stimulation and fertility physiology studies.',
    'Reproductive endocrinology: restores pulsatile GnRH drive themes in hypogonadotropic models under investigator control.',
    'Clinical tier: specialist-only contexts; not a general wellness peptide in mainstream guidelines.',
  ],
  KLOW: [
    'GHK-Cu component: cosmetic dermal remodeling and wound-healing literature as a copper tripeptide.',
    'BPC-157 and TB-500 components: rodent tissue repair narratives as described for each monotherapy class.',
    'Blend tier: retail ratio lacks combined RCT outcomes; evaluate claims per ingredient.',
  ],
  KPV: [
    'Rodent colitis models: reduced inflammation scores and mucosal damage with alpha-MSH C-terminal fragment biology in published work.',
    'Immune modulation theme: melanocortin anti-inflammatory signaling distinct from steroid mechanisms in bench papers.',
    'Human translation: early stage compared with approved IBD pharmacotherapy.',
  ],
  'LIPO-C': [
    'Practice literature MIC and lipotropic injections: marketed for adjunct fat metabolism and liver fat handling in weight clinics.',
    'Evidence tier: randomized controlled outcomes in obesity are limited versus popularity; composition varies by supplier.',
    'Vitamin B12 co-administration: addresses deficiency or supports energy metabolism when deficiency exists (general nutrition principle).',
  ],
  'LL-37': [
    'In vitro: broad antimicrobial peptide activity against Gram-positive, Gram-negative, and some fungal organisms at model concentrations.',
    'Host-response biology: modulates autophagy, NETosis, and epithelial barrier signaling in immunology literature.',
    'Clinical nuance: excessive LL-37 expression associates with inflammatory skin diseases in some human datasets; context matters.',
  ],
  'MOTS-c': [
    'Rodent models: improved insulin sensitivity, mitochondrial stress resistance, and exercise tolerance in multiple published mitochondrial-peptide reports.',
    'Human exploratory studies: metabolic exercise response and biomarker shifts in small cohorts (early phase).',
    'Mechanism narrative: regulates muscle and fat energy expenditure via nuclear-encoded feedback from mitochondrial-encoded signaling motifs.',
  ],
  'MT-1': [
    'Regulatory approvals abroad: afamelanotide implant for erythropoietic protoporphyria to increase light tolerance.',
    'Pharmacology: superpotent MSH receptor stimulation driving eumelanin production.',
    'Cosmetic off-label discourse: UV-independent tanning with monitoring for moles and blood pressure effects.',
  ],
  'MT-II': [
    'Human experience reports and cases: pronounced generalized pigmentation, nausea, stretching yawning, and erectile or libido changes from nonselective melanocortin agonism.',
    'Preclinical: potent central and peripheral melanocortin receptor activation across subtypes.',
    'Safety note: long-lasting pigment alterations and hemodynamic effects appear in case literature.',
  ],
  'N-acetyl Selank': [
    'Russian clinical and preclinical corpora: anxiolytic and cognitive performance signals in small trials summarized in regional reviews.',
    'Mechanistic themes: modulation of serotonin turnover and GABAergic tone in animal models.',
    'Amidated N-acetyl variant: marketed as more stable; Western pivotal replication is sparse.',
  ],
  'N-acetyl Semax': [
    'Russian clinical tradition: adjuvant use in stroke rehabilitation and cognitive complaints with neurotrophic marketing themes.',
    'Animal models: BDNF/trkB signaling increases reported after intranasal administration.',
    'N-acetylation: altered pharmacokinetic profile versus native Semax in vendor descriptions (not US FDA pathway).',
  ],
  'NAD+': [
    'Precursor trials (NR, NMN): reliably raise whole-blood or tissue NAD metabolite pools in published supplementation studies.',
    'Clinical benefit signals for healthy aging: mixed across muscle performance, insulin sensitivity, and blood pressure substudies.',
    'Biochemistry tier: obligate electron carrier for oxidoreductases; universal to aerobic cells.',
  ],
  Orbitzen: [
    'Vendor blend: benefit expectations track each constituent (GLP-1-class, glucagon-class, GIP-class themes) only if identity and dose match development molecules.',
    'Market positioning: single vial multi-receptor agonist convenience versus monotherapy vials (evidence depends on COA, not catalog text).',
    'Regulatory tier: not an approved fixed combination product at pharm grade in most jurisdictions for grey-market SKUs.',
  ],
  Oxytocin: [
    'Obstetric uses: uterine contraction for induction or augmentation and postpartum hemorrhage management in approved protocols.',
    'Neuroscience trials: intranasal oxytocin effects on trust, social cognition, or autism-related measures show small and inconsistent effect sizes in meta-analyses.',
    'Lactation physiology: milk ejection reflex support in lactation medicine.',
  ],
  Pinealon: [
    'Bioregulator commerce: cognitive support and neuronal aging narratives tied to ultra-short peptide theory.',
    'Peer-reviewed human pivotal outcomes: limited versus anecdote and course marketing.',
    'Preclinical specialty journals (CIS): neuroprotective themes in stress or aging models as cited by peptide course vendors.',
  ],
  'PT-141': [
    'FDA-approved product (bremelanotide SC): improved sexual desire endpoints in premenopausal women with hypoactive sexual desire disorder in registration trials.',
    'Adverse events from trials: nausea, flushing, blood pressure changes, focal hyperpigmentation themes in labels and reviews.',
    'Male sexual dysfunction development history includes melanocortin pathway arousal effects distinct from PDE5 nitric-oxide dependence.',
  ],
  Selank: [
    'Russian anxiolytic peptide literature: generalized anxiety and neurasthenia small trials summarized in regional pharmacology reviews.',
    'Animal data: anxiolytic-like behavior in models with serotonergic and immune-modulatory secondary themes.',
    'Immune narrative: alteration of interferon and cytokine expression in some ex vivo human cell studies (early).',
  ],
  Semax: [
    'Russian stroke and cognitive protocols: adjuvant therapy claims with neurotrophic framing in domestic guidance.',
    'Animal models: cognitive protection after ischemic insult and increased BDNF expression in select experiments.',
    'Acth-derived peptide: distinct from classical steroid ACTH pharmacology at used doses in published rodent work.',
  ],
  Sermorelin: [
    'Older trials in GH deficiency and healthy aging cohorts: raises GH and IGF-1 over weeks of nightly administration in published summaries.',
    'Adverse effect profile in studies: flushing, headache, injection site reactions, and rare hypersensitivity themes.',
    'Pituitary dependency: minimal effect if somatotroph reserve is exhausted (clinical physiology teaching).',
  ],
  'SLU-PP-332': [
    'Mouse endurance models: prolonged running performance and oxidative fiber shift with experimental PPAR-delta agonism.',
    'In vitro: increased fatty acid oxidation gene expression programs in myotube systems.',
    'Human tier: research chemical without therapeutic approval; translatability and safety unknown for self-experimentation.',
  ],
  SomatoPulse: [
    'Tesamorelin pivotal story: visceral adiposity reduction in HIV-associated lipodystrophy with IGF-1 rise monitored on label.',
    'Ipamorelin theme: GH secretagogue pulses with favorable acute endocrine side-effect profile versus some GHRPs in pharmacology papers.',
    'Combined retail product: stacks two pituitary-axis mechanisms; long-term outcome trials for this exact pairing are not large public RCTs.',
  ],
  'SS-31': [
    'Clinical development (elamipretide): Barth syndrome and heart failure energetics programs with mitochondrial targeting narrative.',
    'Bench science: binds cardiolipin on the inner mitochondrial membrane and normalizes cristae ultrastructure in stressed models.',
    'Biomarkers in trials: improved walking distance or peak VO2 in some mitochondrial disease cohort substudies (indication specific).',
  ],
  Survodutide: [
    'Phase trial summaries (GLP-1/glucagon dual agonist class): meaningful weight loss and glycemic improvements versus placebo in sponsor-reported programs.',
    'Mechanistic theme: glucagon arm adds energy expenditure flavor while GLP-1 arm restrains intake; balance defines tolerability.',
    'Relative to triple incretins: development positioning depends on head-to-head and dose-finding outcomes as programs mature.',
  ],
  'TB-500': [
    'Rodent and large animal wound models: faster re-epithelialization and angiogenesis attributed to thymosin-beta-4 biology.',
    'Cell migration theme: G-actin sequestering and cytoskeletal dynamics tied to repair in vitro literature.',
    'Human sports injury RCT proof for TB-500 fragment products: not equivalent to rodent depth; anti-doping risk remains.',
  ],
  Tesa: [
    'Registration trials (tesamorelin): significant reduction in visceral adipose tissue versus placebo in HIV lipodystrophy with monitoring of IGF-1 and glucose.',
    'Label themes: potential insulin resistance and glucose elevation require surveillance during therapy.',
    'Non-HIV off-label body composition discourse exists in wellness markets without the same pivotal evidence anchor.',
  ],
  'Thymosin Alpha-1': [
    'Adjuvant uses in some countries: hepatitis B vaccination enhancement and chronic hepatitis immune modulation in historical regulatory filings.',
    'Oncology adjuvant exploratory trials: IFN pathway and lymphocyte count modulation in subsets (heterogeneous results).',
    'COVID-era compassionate-use reports: varied quality; not a universal antiviral standard of care in high-income guidelines.',
  ],
  Vilon: [
    'Bioregulator marketing: thymus and immune aging support narratives in Khavinson peptide course literature.',
    'Western double-blind longevity outcomes: very limited; treat benefits as speculative versus thymalfasin-grade data.',
    'Rodent immune aging models: niche published immunorestorative endpoints in specialty Russian-language bodies of work.',
  ],
  VIP: [
    'Replacement therapy in VIP-deficient neuroendocrine tumor syndromes: corrects secretory diarrhea, electrolyte loss, and flushing clusters.',
    'Pulmonary research: anti-inflammatory effects in murine lung injury models and exploratory severe asthma protocols.',
    'Barrier biology: stabilizes epithelial tight junction themes in intestinal organoid and cell papers.',
  ],
  Wolverine: [
    'High milligram BPC-157 and TB-500 style stack: inherits each component rodent repair literature separately.',
    'Vendor narrative: maximal tissue recovery positioning for athletes; human outcome trials for combined high doses absent.',
    'Risk stacking: side-effect and drug-interaction profiles are not studied as a fixed pair at grey-market doses.',
  ],
};

function main() {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  db.meta = db.meta || {};
  db.meta.schemaVersion = '2.6';
  db.meta.builtAt = new Date().toISOString();
  db.meta.reportedBenefitsLegend = {
    prefix_clinical: 'Human registration trials, phase programs, or prescribing information for a pharmaceutical comparator class.',
    prefix_trial: 'Published human clinical trial cohorts (may be phase 1 or 2).',
    prefix_preclinical: 'Animals, cells, or ex vivo models; not proof of human benefit.',
    prefix_biochemistry: 'Fundamental biology teaching; not a therapeutic outcome claim.',
    prefix_practice: 'Clinic or wellness practice patterns; randomized outcomes often thin.',
    prefix_vendor: 'Marketing or bundled SKU framing without pivotal combined trial.',
    prefix_human_experience: 'Case reports, surveys, or unstructured human use narratives (weak tier).',
    caveat:
      'Each line is a reported-benefit summary for literacy, not a promise that a research-use vial will reproduce trials. Identity, purity, and medical supervision determine real outcomes.',
  };

  const extra =
    ' reportedBenefits lines are evidence-tier-labeled summaries from labels, trials, or bench literature; they are not individualized outcome promises for grey-market products.';
  if (!db.disclaimer.includes('reportedBenefits lines')) {
    db.disclaimer += extra;
  }

  let unknown = 0;
  for (const entry of db.entries) {
    const key = resolveKey(entry.catalog?.title || '');
    const row = BENEFITS[key];
    if (!row) {
      unknown++;
      entry.reportedBenefits = [
        'Database gap: expand reported benefits for resolver key ' +
          key +
          '; see researchSummary and sources for interim context.',
      ];
      continue;
    }
    entry.reportedBenefits = [...row];
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
  console.error(`wrote ${dbPath} schema ${db.meta.schemaVersion}; unknown benefit keys: ${unknown}`);
}

main();
