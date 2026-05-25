#!/usr/bin/env node
/**
 * BAD-48: Apply public research refresh to peptide-info-database.json
 * Run: node scripts/apply-research-updates.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, "../peptide-info-database.json");

/** @typedef {{ label: string, url: string }} Source */
/** @typedef {{ researchSummary?: string, reportedBenefits?: string[], sources?: Source[], notes?: string, doseGuidelines?: object[], potentialApplications?: object[], distinctiveQuality?: object }} Patch */

/** @type {Record<string, Patch>} */
const PATCHES = {
  "1G-SGT": {
    researchSummary:
      "A weekly injectable in the same family as Ozempic (semaglutide). It mimics GLP-1 to reduce appetite and improve blood sugar. Large trials support weight loss and diabetes control. FDA expanded Wegovy in 2024 for cardiovascular risk reduction in obesity with heart disease, and in August 2025 for metabolic-associated steatohepatitis (MASH) with moderate-to-advanced liver scarring under accelerated approval. Vendor code \"1G-SGT\" is shorthand; confirm vial contents with a certificate of analysis.",
    reportedBenefits: [
      "Clinical trials: significantly lowers blood sugar (HbA1c) in type 2 diabetes.",
      "Clinical trials (STEP program): meaningful weight loss with diet and exercise.",
      "Heart health (SELECT trial): reduced major cardiovascular events in obesity with established heart disease.",
      "FDA 2025 (MASH): in the STEER trial, 63% of Wegovy patients had MASH resolution without fibrosis worsening vs 34% placebo (accelerated approval; confirmatory outcomes pending).",
      "How it works: slows stomach emptying and reduces appetite.",
    ],
    sources: [
      { label: "FDA: Wegovy cardiovascular indication (Mar 2024)", url: "https://www.fda.gov/news-events/press-announcements/fda-approves-first-treatment-reduce-risk-serious-heart-problems-specifically-adults-obesity-or" },
      { label: "FDA: Wegovy MASH accelerated approval (Aug 2025)", url: "https://www.fda.gov/drugs/news-events-human-drugs/fda-approves-treatment-serious-liver-disease-known-mash" },
      { label: "PubMed: SELECT cardiovascular outcomes (NEJM 2023)", url: "https://pubmed.ncbi.nlm.nih.gov/37952131/" },
    ],
  },
  "2G-TZ": {
    researchSummary:
      "A weekly injectable (Mounjaro for type 2 diabetes, Zepbound for weight management). It activates GIP and GLP-1 receptors, producing larger weight and blood sugar improvements than single-pathway drugs in trials. Label updates through 2025–2026 added Zepbound approval for moderate-to-severe obstructive sleep apnea in adults with obesity, and expanded Mounjaro use to adolescents aged 10+ with type 2 diabetes.",
    reportedBenefits: [
      "Clinical trials: lowers blood sugar more effectively than many single-target diabetes drugs.",
      "Clinical trials (SURMOUNT program): substantial weight loss, including head-to-head advantages vs semaglutide in some trials.",
      "FDA label (Zepbound): approved for obesity-related obstructive sleep apnea.",
      "FDA label (Mounjaro): glycemic control in adults and pediatric patients 10+ with type 2 diabetes.",
    ],
    sources: [
      { label: "FDA: Zepbound prescribing information (OSA indication)", url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/217806Orig1s020lbl.pdf" },
      { label: "FDA: Mounjaro prescribing information (pediatric T2D)", url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/215866s009lbl.pdf" },
      { label: "PubMed: SURMOUNT-1 tirzepatide obesity trial", url: "https://pubmed.ncbi.nlm.nih.gov/35658024/" },
    ],
  },
  "3G-RT": {
    researchSummary:
      "An investigational once-weekly triple agonist (GIP + GLP-1 + glucagon) from Eli Lilly. Phase 2 reported up to ~24% weight loss over 48 weeks. Phase 3 readouts in 2025–2026 strengthened the profile: TRIUMPH-4 (Dec 2025) showed up to 28.7% weight loss plus knee pain relief in obesity with osteoarthritis; TRIUMPH-1 (May 2026) reported up to 28.3% mean weight loss at 80 weeks with 45% of patients reaching ≥30% loss; TRANSCEND-T2D-1 (Mar 2026) met glycemic endpoints with up to ~17% weight loss in type 2 diabetes. Not FDA-approved; available only in trials.",
    reportedBenefits: [
      "Phase 2: ~24% average weight loss at 12 mg weekly over 48 weeks.",
      "Phase 3 TRIUMPH-1 (2026 topline): up to 28.3% weight loss at 80 weeks; extension cohort with BMI ≥35 reached ~30.3% at 104 weeks.",
      "Phase 3 TRIUMPH-4 (2025): up to 28.7% weight loss and ~76% knee pain reduction in obesity with knee osteoarthritis.",
      "Phase 3 TRANSCEND-T2D-1 (2026): A1c reductions up to ~2.0% and weight loss up to ~17% in type 2 diabetes.",
    ],
    sources: [
      { label: "PubMed: Retatrutide Phase 2 (NEJM 2023)", url: "https://pubmed.ncbi.nlm.nih.gov/37366315/" },
      { label: "Lilly: TRIUMPH-4 topline (Dec 2025)", url: "https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-delivered-weight-loss-average" },
      { label: "Lilly: TRIUMPH-1 Phase 3 topline (May 2026)", url: "https://www.prnewswire.com/news-releases/lillys-triple-agonist-retatrutide-delivered-powerful-weight-loss-in-pivotal-phase-3-obesity-trial-302778859.html" },
      { label: "ClinicalTrials.gov: TRIUMPH-1 (NCT05929066)", url: "https://clinicaltrials.gov/study/NCT05929066" },
    ],
    distinctiveQuality: {
      headline:
        "Investigational triple-agonist obesity drug with Phase 3 weight loss reaching high-20% to ~30% in 2025–2026 readouts — not yet approved.",
      themes: ["metabolic_incretins"],
      basisNote: "Based on Lilly Phase 2–3 trial disclosures; grey-market vials are not pharmaceutical retatrutide.",
    },
  },
  Cag: {
    researchSummary:
      "A long-acting amylin analog (cagrilintide) developed with semaglutide as the fixed-dose combo CagriSema. NEJM published REDEFINE 1 (June 2025): −20.4% mean weight vs −3.0% placebo at 68 weeks in adults with overweight/obesity without diabetes. REDEFINE 2 in type 2 diabetes showed −13.7% vs −3.4% placebo. Novo Nordisk submitted a U.S. NDA; FDA review was ongoing as of late 2025. Not approved as a standalone retail vial.",
    reportedBenefits: [
      "REDEFINE 1 (NEJM 2025): CagriSema −20.4% body weight at 68 weeks vs −3.0% placebo.",
      "REDEFINE 2 (NEJM 2025): −13.7% weight in obesity/overweight with type 2 diabetes vs −3.4% placebo.",
      "Mechanism: amylin-class satiety plus GLP-1 pathway — designed to exceed semaglutide alone.",
    ],
    sources: [
      { label: "NEJM: CagriSema REDEFINE 1 (Jun 2025)", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2502081" },
      { label: "NEJM: CagriSema REDEFINE 2 T2D (Jun 2025)", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2502082" },
      { label: "ClinicalTrials.gov: REDEFINE 1 (NCT05567796)", url: "https://clinicaltrials.gov/study/NCT05567796" },
    ],
  },
  Survodutide: {
    researchSummary:
      "An investigational GLP-1/glucagon dual agonist (BI 456906) from Boehringer Ingelheim/Zealand Pharma. Phase 3 SYNCHRONIZE-1 completed in adults with obesity without diabetes: sponsor reported up to ~16.6% mean weight loss at 76 weeks vs ~3.2% placebo (Apr 2026). SYNCHRONIZE-2 in obesity with type 2 diabetes also completed. A large cardiovascular outcomes trial (SYNCHRONIZE-CVOT) remains active. Not FDA-approved.",
    reportedBenefits: [
      "Phase 3 SYNCHRONIZE-1: up to ~16.6% weight loss at 76 weeks vs ~3.2% placebo (Boehringer topline, Apr 2026).",
      "Up to ~85% of survodutide patients achieved ≥5% weight loss vs ~39% placebo in SYNCHRONIZE-1.",
      "Fast Track (2021) and Breakthrough Therapy (2024) U.S. designations for obesity.",
    ],
    sources: [
      { label: "ClinicalTrials.gov: SYNCHRONIZE-1 (NCT06066515)", url: "https://clinicaltrials.gov/study/NCT06066515" },
      { label: "ClinicalTrials.gov: SYNCHRONIZE-2 T2D (NCT06066528)", url: "https://clinicaltrials.gov/study/NCT06066528" },
      { label: "HCPLive: SYNCHRONIZE-1 results summary (Apr 2026)", url: "https://www.hcplive.com/view/synchronize-1-survodutide-achieves-significant-weight-loss-versus-placebo" },
    ],
  },
  "SS-31": {
    researchSummary:
      "Elamipretide (SS-31) binds cardiolipin on the inner mitochondrial membrane to stabilize energy production. In September 2025 the FDA granted accelerated approval to Forzinity (elamipretide) for Barth syndrome in patients weighing ≥30 kg — the first approved use — based on improved knee extensor muscle strength. Heart failure Phase 2 programs (PROGRESS-HF, RESTORE-HF) did not meet primary functional endpoints. Primary mitochondrial myopathy Phase 3 (MMPOWER-3) was negative.",
    reportedBenefits: [
      "FDA 2025: Forzinity approved under accelerated approval for Barth syndrome (muscle strength endpoint).",
      "Recommended dose on label: 40 mg subcutaneous once daily for patients ≥30 kg.",
      "Heart failure and general mitochondrial myopathy programs did not confirm broad efficacy.",
    ],
    notes:
      "Forzinity (elamipretide) is FDA-approved only for Barth syndrome. Wellness-market SS-31 vials are not the approved drug. Heart failure development was deprioritized after mixed Phase 2 results.",
    sources: [
      { label: "FDA: Forzinity approval for Barth syndrome (Sep 2025)", url: "https://www.fda.gov/news-events/press-announcements/fda-grants-accelerated-approval-first-treatment-barth-syndrome" },
      { label: "FDA: Forzinity prescribing information", url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/215244s000lbl.pdf" },
      { label: "PubMed: SS-31 cardiolipin mechanism", url: "https://pubmed.ncbi.nlm.nih.gov/24134698/" },
    ],
    distinctiveQuality: {
      headline: "First FDA-approved mitochondrial peptide (Forzinity) for Barth syndrome; broader heart-failure claims are not supported.",
      themes: ["mitochondria_nad_redox"],
      basisNote: "Regulatory label limits approved use to Barth syndrome; other indications remain investigational or negative.",
    },
  },
  "BPC-157": {
    researchSummary:
      "A synthetic gastric pentadecapeptide with extensive preclinical repair data (tendon, muscle, gut) and very limited human evidence. A 2025 narrative review counted only three small human pilots (knee pain, interstitial cystitis, IV PK/safety) and called for rigorous trials. A 2024 pilot reported symptom improvement in interstitial cystitis. Historical Phase II ulcerative colitis work (PL-14736) was not advanced. Banned in sport by WADA since 2022.",
    reportedBenefits: [
      "Preclinical: consistent tendon, muscle, and gut healing signals in rodent models.",
      "Human pilots: small open-label/pilot studies only; 2024 IC pilot (Altern Ther Health Med).",
      "2025 review: human data remain extremely limited despite wellness-market popularity.",
      "Sport status: WADA prohibited since 2022.",
    ],
    sources: [
      { label: "Springer: BPC-157 musculoskeletal narrative review (2025)", url: "https://link.springer.com/article/10.1007/s12178-025-09990-7" },
      { label: "Altern Ther Health Med: BPC-157 interstitial cystitis pilot (2024)", url: "http://www.alternative-therapies.com/oa/pdf/11423.pdf" },
      { label: "Frontiers: BPC-157 wound healing review", url: "https://www.frontiersin.org/journals/pharmacology/articles/10.3389/fphar.2021.627533/full" },
    ],
  },
  "MOTS-c": {
    researchSummary:
      "A mitochondria-encoded peptide linked to metabolic homeostasis and exercise-mimetic effects in preclinical models. A May 2025 Nature Aging paper reported MOTS-c reduces pancreatic islet senescence and delays diabetes progression in mice, with lower circulating MOTS-c in type 2 diabetes patients. A Phase 2a trial (NCT07505745, Hudson Biotech) began recruiting in 2026 to test 12 weeks of subcutaneous MOTS-c for insulin sensitivity in prediabetes with overweight/obesity. Not FDA-approved.",
    reportedBenefits: [
      "Preclinical: improved insulin sensitivity and exercise capacity in rodent models.",
      "2025 (Nature Aging): islet senescence and glucose intolerance improved in diabetic mouse models.",
      "Phase 2a NCT07505745 (2026): recruiting for insulin sensitivity in prediabetes/obesity.",
    ],
    sources: [
      { label: "PMC: MOTS-c islet senescence (Nature Aging 2025)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12411631/" },
      { label: "ClinicalTrials.gov: MOTS-c Phase 2a (NCT07505745)", url: "https://clinicaltrials.gov/study/NCT07505745" },
      { label: "PMC: MOTS-c review", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9570330/" },
    ],
  },
  "GHRP-6": {
    researchSummary:
      "A synthetic ghrelin-receptor (GHS-R1a) agonist that stimulates GH release. Human Phase 1 PK after IV dosing is published. A 2024 Phase I/II trial tested GHRP-6 combined with epidermal growth factor for acute ischemic stroke (Frontiers in Neurology): primary safety endpoint met with secondary signals on neurological scores. Strong orexigenic effects are documented for the GHRP class (especially GHRP-2). WADA-prohibited.",
    reportedBenefits: [
      "Phase I/II (2024): EGF + GHRP-6 combination reported safe in acute ischemic stroke with functional secondary endpoints.",
      "Human PK characterized after IV bolus (Phase 1).",
      "Potent GH secretagogue in human and animal studies; appetite stimulation is class effect.",
    ],
    sources: [
      { label: "Frontiers: EGF + GHRP-6 stroke Phase I/II (2024)", url: "https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2024.1303402/full" },
      { label: "PubMed: GHRP-6 Phase 1 PK", url: "https://pubmed.ncbi.nlm.nih.gov/23099431/" },
    ],
  },
  "GHRP-2": {
    researchSummary:
      "A ghrelin-receptor agonist used as a GH diagnostic in Japan and studied for appetite and GH stimulation. Human infusion studies show increased food intake and GH release. A 2024 JPEM paper examined GHRP-2 provocative testing in adolescents. Case literature describes intranasal GHRP-2 in severe anorexia nervosa with weight gain. No FDA-approved therapeutic indication.",
    reportedBenefits: [
      "Human studies: robust GH responses and increased ad libitum food intake during infusion.",
      "2024: GHRP-2 provocative test data in adolescents (J Pediatr Endocrinol Metab).",
      "Used clinically in Japan as a GH secretagogue diagnostic agent.",
    ],
    sources: [
      { label: "PubMed: GHRP-2 appetite/GH infusion study", url: "https://pubmed.ncbi.nlm.nih.gov/15699539/" },
      { label: "PubMed: GHRP-2 in adolescents (JPEM 2024)", url: "https://doi.org/10.1515/jpem-2024-0115" },
    ],
  },
  "PNC-27": {
    researchSummary:
      "An experimental anticancer peptide that binds membrane-associated HDM-2 on cancer cells, forming pores and inducing selective necrosis ('poptosis'). 2024 publications extended the mechanism to mitochondrial membrane disruption after uptake. Preclinical activity spans solid and hematologic tumor models. No human clinical trials are registered.",
    reportedBenefits: [
      "Preclinical: selective tumor cell necrosis via HDM-2-targeted membrane pores.",
      "2024: dual plasma-membrane and mitochondrial disruption mechanism described (PubMed 38802154).",
      "2024 review: activity against chemo-resistant and primary tumors in mouse models.",
    ],
    sources: [
      { label: "PubMed: PNC-27 HDM-2 and mitochondrial disruption (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/38802154/" },
      { label: "PubMed: Poptosis review (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/38927351/" },
    ],
  },
  Thymalin: {
    researchSummary:
      "A calf thymus polypeptide complex (Khavinson bioregulator) with decades of Russian clinical use. Long-term observational studies in elderly cohorts reported lower mortality with thymic plus pineal bioregulators. A randomized trial in severe COVID-19 older patients reported faster immune recovery and halved in-hospital mortality when Thymalin was added to standard care. Approved drug in Russia; not FDA-approved.",
    reportedBenefits: [
      "Gerontology cohort studies: improved immune and cardiovascular indices and lower mortality over 6–8 years (PMID 12577695).",
      "COVID-19 RCT: faster lymphocyte/NK recovery and reduced hospital mortality vs standard care alone.",
      "Mechanism reviews: short peptides in complex proposed to modulate immune gene expression.",
    ],
    sources: [
      { label: "PubMed: Thymalin geroprotective long-term study", url: "https://pubmed.ncbi.nlm.nih.gov/12577695/" },
      { label: "PMC: Thymalin in severe COVID-19 older patients", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8654498/" },
    ],
  },
  "Thymosin Alpha-1": {
    researchSummary:
      "Thymalfasin (Tα1) is a thymic peptide used internationally for immune modulation. The 2025 TESTS phase 3 sepsis trial (n=1106) found no overall 28-day mortality benefit vs placebo, though subgroup signals were reported. A 2024 HIV immunological-nonresponder pilot showed immune subset changes without CD4 gain. FDA compounding review of thymosin alpha-1 occurred in 2024 PCAC proceedings.",
    reportedBenefits: [
      "TESTS phase 3 (2025): no overall sepsis mortality benefit; subgroup analyses reported in older/diabetic patients.",
      "HIV pilot (2024): immune phenotype shifts in immunological nonresponders.",
      "Decades of international use for hepatitis and immune support; evidence quality varies by indication.",
    ],
    sources: [
      { label: "PubMed: TESTS thymosin α1 sepsis Phase 3 (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/39814420/" },
      { label: "PubMed: Thymosin α1 in HIV immunological nonresponders (2024)", url: "https://link.springer.com/article/10.1186/s12879-024-08985-y" },
    ],
  },
  Tesa: {
    researchSummary:
      "Tesamorelin is an FDA-approved GHRH analog (Egrifta) for HIV-associated lipodystrophy. It stimulates pulsatile GH and reduces visceral fat. 2024–2025 trials in people with HIV on integrase inhibitors confirmed sustained visceral and hepatic fat reductions over 12 months; a 2025 phase 2 study in HIV with abdominal obesity did not show significant neurocognitive benefit between groups despite waist reduction.",
    reportedBenefits: [
      "FDA-approved: reduces excess abdominal fat in HIV lipodystrophy.",
      "2024 RCT subgroup: 12-month visceral/hepatic fat reductions with good tolerability on INSTI-based ART.",
      "2025 phase 2: waist reduction without significant neurocognitive improvement vs standard care.",
    ],
    sources: [
      { label: "PubMed: Tesamorelin neurocognition Phase 2 (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/39813152/" },
      { label: "PMC: Tesamorelin 12-month INSTI subgroup (2024)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11365754/" },
    ],
  },
  Kisspeptin: {
    researchSummary:
      "A hypothalamic hormone that triggers GnRH/LH/FSH release for puberty and fertility. A 2025 randomized crossover trial showed intranasal kisspeptin-54 safely stimulated gonadotropins in healthy volunteers and hypothalamic amenorrhea. Phase 2 subcutaneous pulsatile kisspeptin for hypothalamic amenorrhea (NCT07224438) began recruiting in late 2025. FDA reviewed kisspeptin-10 for 503A compounding in 2024.",
    sources: [
      { label: "PubMed: Intranasal kisspeptin RCT (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/40215751/" },
      { label: "ClinicalTrials.gov: Hypothalamic amenorrhea Phase 2 (NCT07224438)", url: "https://clinicaltrials.gov/study/NCT07224438" },
    ],
  },
  "GHK-Cu": {
    researchSummary:
      "A copper-binding tripeptide with strong topical wound-healing and collagen literature. 2024–2025 work focused on nanoparticle/liposome delivery improving skin penetration. A Phase 2 paired punch-biopsy wound trial of topical 0.1% GHK-Cu gel (CuHeal) is recruiting; peer-reviewed human efficacy readouts from that trial were not available as of early 2026.",
    sources: [
      { label: "PubMed: GHK-Cu regenerative peptide review", url: "https://pubmed.ncbi.nlm.nih.gov/29703431/" },
    ],
  },
  "TB-500": {
    researchSummary:
      "TB-500 is the synthetic fragment of thymosin beta-4 (residues 17–23). Full-length recombinant thymosin beta-4 has Phase 2 cardiac data: a 2025 STEMI trial (n=96) showed overall infarct reduction was not significant, with benefit only in patients treated within 8 hours post-PCI. No verified human trials of the TB-500 fragment itself were identified in 2024–2026.",
    sources: [
      { label: "PubMed: rhTβ4 STEMI trial (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/41229390/" },
      { label: "ClinicalTrials.gov: Thymosin beta-4 AMI Phase 2 (NCT05984134)", url: "https://clinicaltrials.gov/study/NCT05984134" },
    ],
  },
  "CJC-1295 (No DAC)": {
    researchSummary:
      "Mod GRF(1-29) is a DPP-IV-resistant GHRH analog without the DAC albumin-binding extension — shorter acting than CJC-1295 with DAC. Human pharmacology is extrapolated from sermorelin/GHRH(1-29) studies showing GH and IGF-1 stimulation. Published CJC-1295 human PK trials used the WITH-DAC form, not this SKU.",
    sources: [
      { label: "PubMed: Modified GRF(1-29) GH stimulation", url: "https://pubmed.ncbi.nlm.nih.gov/1379256/" },
      { label: "PubMed: Sermorelin/GHRH human GH data", url: "https://pubmed.ncbi.nlm.nih.gov/8772599/" },
    ],
  },
  "CJC-1295 With DAC": {
    researchSummary:
      "Long-acting GHRH analog with maleimidopropionyl albumin binding (~6–8 day half-life). Placebo-controlled trials in healthy adults showed multi-day GH and IGF-1 elevation with preserved pulsatility after single or repeat SC doses (Teichman 2006; Ionescu 2006). A Phase 2 HIV visceral obesity trial (NCT00267527) ended early without published results.",
    sources: [
      { label: "PubMed: CJC-1295 with DAC Phase 1/2 (2006)", url: "https://pubmed.ncbi.nlm.nih.gov/16352683/" },
      { label: "PubMed: CJC-1295 trough GH pulsatility (2006)", url: "https://pubmed.ncbi.nlm.nih.gov/17018654/" },
      { label: "ClinicalTrials.gov: HIV lipodystrophy Phase 2 (NCT00267527)", url: "https://clinicaltrials.gov/study/NCT00267527" },
    ],
  },
  "IGF-1 LR3": {
    researchSummary:
      "An engineered IGF-1 analog with reduced IGFBP binding, increasing free IGF-1R signaling in preclinical models. More potent than native IGF-1 for anabolic endpoints in rats; no published human clinical efficacy trials for LR3 specifically. FDA-approved native IGF-1 is mecasermin (Increlex), not LR3.",
    sources: [
      { label: "PubMed: LR3IGF-I potency vs native IGF-I", url: "https://pubmed.ncbi.nlm.nih.gov/8371075/" },
      { label: "PubMed: LR3-IGF-1 in Alzheimer mouse model (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/39610283/" },
    ],
  },
  "PEG-MGF": {
    researchSummary:
      "Pegylated mechano-growth factor (IGF-1Ec E-domain region) marketed to extend the very short native MGF half-life. Preclinical work shows MGF activates satellite cells and promotes myoblast proliferation. No PubMed-indexed human efficacy trials specifically for PEG-MGF were found.",
    sources: [
      { label: "PubMed: MGF and satellite cells review", url: "https://pubmed.ncbi.nlm.nih.gov/20130113/" },
      { label: "PubMed: Synthetic MGF and porcine satellite cells", url: "https://pubmed.ncbi.nlm.nih.gov/22875667/" },
    ],
  },
  "AHK-Cu": {
    researchSummary:
      "Copper tripeptide-3 (Ala-His-Lys-Cu) studied for hair follicle biology. Ex vivo human follicle work reported increased follicle elongation, dermal papilla proliferation, and anti-apoptotic signaling at nanomolar concentrations. Distinct from the better-studied GHK-Cu; no randomized clinical hair-loss trials identified.",
    sources: [
      { label: "PubMed: AHK-Cu human hair follicle ex vivo study", url: "https://pubmed.ncbi.nlm.nih.gov/17703734/" },
    ],
  },
  Cartalax: {
    researchSummary:
      "Khavinson tripeptide bioregulator (AED/Kartalax) proposed to modulate chondrocyte gene expression and cartilage aging. Review literature cites animal OA models and reported oral use in older OA patients within the Khavinson research program; independent Western RCTs were not identified.",
    sources: [
      { label: "PubMed: Cartalax/Kartalax chondrocyte SASP review (2023)", url: "https://pubmed.ncbi.nlm.nih.gov/37782637/" },
      { label: "PMC: Khavinson peptide bioregulator review", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8619776/" },
    ],
  },
  Adamax: {
    researchSummary:
      "A modified Semax derivative (adamantyl group) sold for enhanced CNS penetration. No PubMed-indexed Adamax-specific trials were found; mechanism is inferred from parent Semax (ACTH 4–10 analog), which increases BDNF in preclinical models and has human stroke-recovery studies.",
    sources: [
      { label: "PubMed: Semax BDNF upregulation", url: "https://pubmed.ncbi.nlm.nih.gov/16635254/" },
      { label: "PubMed: Semax stroke recovery human study", url: "https://pubmed.ncbi.nlm.nih.gov/11517472/" },
    ],
  },
  Cortagen: {
    researchSummary:
      "Brain-cortex tetrapeptide bioregulator (AEDP) from the Cortexin lineage. Mouse microarray studies reported altered cardiac and neural gene expression after short courses; Khavinson-program literature also describes human peripheral nerve recovery narratives. Western RCTs for Cortagen alone were not identified.",
    sources: [
      { label: "PubMed: Cortagen gene expression in mice", url: "https://pubmed.ncbi.nlm.nih.gov/15159690/" },
    ],
  },
  "Cerebro Protein": {
    researchSummary:
      "Maps to cerebral cortex hydrolysate / Cortexin-class neuropeptide mixtures used in Russian nootropic practice. Preclinical work shows neuroprotection in brain ischemia models; a 2022 systematic review found only one small eligible human Cortexin trial (n=80) with weak overall evidence for animal-derived nootropics.",
    sources: [
      { label: "PMC: Cortexin neuroprotection preclinical", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8279368/" },
      { label: "PubMed: Animal-derived nootropics systematic review (2022)", url: "https://pubmed.ncbi.nlm.nih.gov/36324709/" },
    ],
  },
  "Snap-8": {
    researchSummary:
      "Acetyl octapeptide-3 (SNAP-25 mimetic) marketed as a topical muscle-relaxing cosmetic peptide extending the Argireline sequence. Parent Argireline reduced wrinkle depth in a manufacturer-sponsored 30-day study via SNARE-complex interference. Independent Snap-8 human RCTs in PubMed are sparse.",
    sources: [
      { label: "PubMed: Argireline SNARE/wrinkle study", url: "https://pubmed.ncbi.nlm.nih.gov/18498523/" },
    ],
  },
  "Semax/Selank": {
    researchSummary:
      "Fixed-ratio Semax (ACTH 4–10 nootropic) and Selank (tuftsin-derived anxiolytic) blend. No published trial of this pre-mixed product was found; human data exist for each peptide separately — Selank RCTs in generalized anxiety and Semax stroke-recovery studies.",
    sources: [
      { label: "PubMed: Selank GAD trial", url: "https://pubmed.ncbi.nlm.nih.gov/18454096/" },
      { label: "PubMed: Semax stroke recovery", url: "https://pubmed.ncbi.nlm.nih.gov/11517472/" },
    ],
  },
  "BPC157+TB500+KPV": {
    researchSummary:
      "Vendor lyophilized triple blend of BPC-157, thymosin beta-4 fragment (TB-500), and KPV. No indexed combination trial exists; each component has separate preclinical repair (BPC-157, Tβ4) or anti-inflammatory (KPV) literature.",
    sources: [
      { label: "PubMed: BPC-157 review", url: "https://pubmed.ncbi.nlm.nih.gov/34267654/" },
      { label: "PubMed: KPV colitis model", url: "https://pubmed.ncbi.nlm.nih.gov/18061177/" },
    ],
  },
  "GHK-Cu / KPV": {
    researchSummary:
      "Dual blend pairing GHK-Cu (copper tripeptide tissue remodeling) with KPV (alpha-MSH tripeptide anti-inflammatory). Each peptide has separate preclinical literature; no clinical trial of this fixed ratio was found.",
    sources: [
      { label: "PubMed: GHK-Cu regenerative review", url: "https://pubmed.ncbi.nlm.nih.gov/29703431/" },
      { label: "PubMed: KPV anti-inflammatory", url: "https://pubmed.ncbi.nlm.nih.gov/18061177/" },
    ],
  },
  "Cartalax / TB4 / BPC-157": {
    researchSummary:
      "Vendor triple blend combining Cartalax bioregulator, TB-4 fragment, and BPC-157. No indexed combination study; rationale stacks cartilage, migration, and angiogenic repair mechanisms from component preclinical literature only.",
    sources: [
      { label: "PubMed: Cartalax/Kartalax review", url: "https://pubmed.ncbi.nlm.nih.gov/37782637/" },
      { label: "PubMed: BPC-157 review", url: "https://pubmed.ncbi.nlm.nih.gov/34267654/" },
    ],
  },
  "5-amino-1mq": {
    researchSummary:
      "A small-molecule NNMT (nicotinamide N-methyltransferase) inhibitor studied for obesity, sarcopenia, and metabolic aging. 2024 mouse papers report NNMT inhibition (including 5-amino-1MQ) improves obesity-related metabolism and augments exercise effects on aged skeletal muscle by raising NAD+ and SAM. No human clinical trials registered as of 2026.",
    sources: [
      { label: "PubMed: NNMT inhibition + exercise in aged muscle (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/39161060/" },
      { label: "PubMed: NNMT inhibition in obesity metabolism (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/38969654/" },
    ],
  },
  "AOD-9604": {
    researchSummary:
      "A modified hGH 177-191 fragment marketed for fat loss with weak human evidence. The FDA Pharmacy Compounding Advisory Committee (PCAC) reviewed AOD-9604 (free base and acetate) on December 4, 2024 for proposed 503A bulks-list inclusion (proposed use: obesity). FDA briefing materials flagged limited efficacy and safety data; no FDA drug approval issued.",
    sources: [
      { label: "FDA: PCAC meeting Dec 4, 2024 (AOD-9604 review)", url: "https://www.fda.gov/advisory-committees/advisory-committee-calendar/updated-meeting-time-and-public-participation-information-december-4-2024-meeting-pharmacy" },
      { label: "FDA: AOD-9604 briefing material (2024)", url: "https://www.fda.gov/media/183584/download" },
    ],
  },
  "ARA-290": {
    researchSummary:
      "Cibinetide (ARA-290) is a non-erythropoietic erythropoietin-derived 11-mer that signals via the innate repair receptor. 2025 preclinical paper in mice mapped ARA-290 protection in apical periodontitis via SIRT1/NF-κB/IL-1β. No new ARA-290/cibinetide human trials registered in 2024–2026.",
    sources: [
      { label: "PubMed: ARA290 SIRT1/NF-κB in apical periodontitis (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/40680515/" },
    ],
  },
  "DSIP": {
    researchSummary:
      "Delta sleep-inducing peptide (emideltide), a 9-mer with sedative/sleep effects in older Russian and rodent literature. A 2024 mouse study of a DSIP fusion peptide (DSIP-CBBBP) in PCPA-induced insomnia improved neurotransmitter balance over DSIP alone. FDA scheduled emideltide for 503A bulks-list review at PCAC on July 24, 2026 and lists it among bulk substances with significant compounding safety concerns.",
    sources: [
      { label: "PubMed: DSIP fusion peptide PCPA insomnia mice (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/?term=10.3389/fphar.2024.1439536" },
      { label: "FDA: PCAC July 23-24, 2026 (emideltide on agenda)", url: "https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026" },
      { label: "FDA: bulk substances with significant safety concerns", url: "https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks" },
    ],
  },
  "Epithalon": {
    researchSummary:
      "Khavinson tetrapeptide marketed as a telomerase/longevity peptide. A 2025 in vitro human cell-line paper reported dose-dependent telomere extension via hTERT/telomerase in normal cells and ALT-pathway activity in cancer lines. FDA scheduled epitalon for 503A review July 24, 2026 and lists it among bulk substances with significant compounding safety concerns. No human RCT verified.",
    sources: [
      { label: "PubMed: Epitalon hTERT/telomere in vitro (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/40908429/" },
      { label: "FDA: PCAC July 23-24, 2026 (epitalon on agenda)", url: "https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026" },
      { label: "FDA: bulk substances with significant safety concerns", url: "https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks" },
    ],
  },
  "FOXO4-DRI": {
    researchSummary:
      "A FOXO4-p53 interaction disruptor peptide tested as a senolytic. 2024–2026 work remains preclinical: pulmonary fibrosis mouse update (2024) and endothelial senescence mechanism paper (2026). No human clinical trial registered; no FDA action.",
    sources: [
      { label: "PubMed: FOXO4-DRI pulmonary fibrosis (2024 update)", url: "https://pubmed.ncbi.nlm.nih.gov/35510614/" },
      { label: "PubMed: FOXO4-DRI endothelial senescence (2026)", url: "https://pubmed.ncbi.nlm.nih.gov/41625068/" },
    ],
  },
  "Glutathione": {
    researchSummary:
      "Endogenous tripeptide antioxidant. A 2026 randomized crossover human trial (NCT06345950) reported improved oral GSH bioavailability with a micellar formulation versus standard or liposomal GSH, with acceptable 30-day tolerability. No new FDA drug approval in window.",
    sources: [
      { label: "PubMed: Micellar oral glutathione bioavailability RCT (2026)", url: "https://pubmed.ncbi.nlm.nih.gov/41897500/" },
      { label: "ClinicalTrials.gov: Glutathione bioavailability (NCT06345950)", url: "https://clinicaltrials.gov/study/NCT06345950" },
    ],
  },
  "Ipamorelin": {
    researchSummary:
      "A selective ghrelin-receptor (GHS-R1a) agonist that stimulates GH release without raising cortisol or prolactin. The FDA PCAC reviewed ipamorelin (free base and acetate) on October 29, 2024 for proposed 503A bulks-list inclusion (proposed uses: growth hormone deficiency, postoperative ileus). FDA briefing cited significant safety concerns. No new human efficacy trial verified in 2024–2026.",
    sources: [
      { label: "FDA: PCAC meeting Oct 29, 2024 (ipamorelin review)", url: "https://www.fda.gov/advisory-committees/advisory-committee-calendar/october-29-2024-meeting-pharmacy-compounding-advisory-committee-10292024" },
      { label: "FDA: ipamorelin briefing material (2024)", url: "https://www.fda.gov/media/182088/download" },
    ],
  },
  "KPV": {
    researchSummary:
      "Alpha-MSH C-terminal tripeptide (Lys-Pro-Val) with anti-inflammatory activity in animal colitis and IBD models. A 2024 mouse paper used KPV-rapamycin self-assembled nanoparticles for vascular calcification. FDA scheduled KPV for 503A bulks-list review July 23, 2026 and states no identified human exposure data for compounded KPV. No human RCT registered.",
    sources: [
      { label: "PubMed: KPV-rapamycin nanoparticles vascular calcification (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/39252648/" },
      { label: "FDA: PCAC July 23-24, 2026 (KPV on agenda)", url: "https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026" },
      { label: "FDA: bulk substances with significant safety concerns", url: "https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks" },
    ],
  },
  "LL-37": {
    researchSummary:
      "Human cathelicidin LL-37 is an endogenous antimicrobial and immunomodulatory peptide. 2025 reviews updated mechanism and local cytotoxicity at infection sites; a 2025 paper characterized LL-37-derived analogs against multidrug-resistant E. coli and ESKAPE pathogens. No new LL-37 human wound RCT verified in window.",
    sources: [
      { label: "PubMed: LL-37 mechanism review (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/40063262/" },
      { label: "PubMed: LL-37-derived peptides vs MDR pathogens (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/41102328/" },
    ],
  },
  "MT-1": {
    researchSummary:
      "Afamelanotide (Scenesse) is an alpha-MSH analog approved by FDA in 2019 for erythropoietic protoporphyria. A Phase 3 vitiligo trial (NCT06109649, CUV105) combining afamelanotide with narrowband UVB is active, with primary completion estimated December 2025 and study completion June 2026.",
    sources: [
      { label: "ClinicalTrials.gov: Afamelanotide Phase 3 vitiligo (NCT06109649)", url: "https://clinicaltrials.gov/study/NCT06109649" },
    ],
  },
  "MT-II": {
    researchSummary:
      "Melanotan II is a synthetic alpha-MSH analog widely sold online for tanning and sexual effects but not approved by any regulator. FDA lists Melanotan II among bulk substances with significant compounding safety concerns, citing immunogenicity and serious adverse event case reports. No legitimate new MT-II human clinical trial registered in 2024–2026.",
    sources: [
      { label: "FDA: bulk substances with significant safety concerns (Melanotan II)", url: "https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks" },
    ],
  },
  "NAD+": {
    researchSummary:
      "NAD+ precursor research (NR, NMN, NAD+ directly) accelerated in 2024–2026. A 2024 NR trial in PAD improved 6-min walk distance; a 2024 NMN RCT in older adults raised blood NAD+ and improved sleep; a 2025 NR crossover in SCD/MCI lowered plasma pTau217 Alzheimer biomarker. A 2026 systematic review concluded NAD boosters reliably raise NAD biomarkers but clinical anti-aging outcomes remain inconclusive. A May 2026 Nature Metabolism paper found whole-blood NAD+ is relatively stable with age/lifestyle but responds to NR supplementation.",
    sources: [
      { label: "PubMed: NR PAD 6MWD trial (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/38871717/" },
      { label: "PubMed: NMN older adults RCT (2024)", url: "https://pubmed.ncbi.nlm.nih.gov/38789831/" },
      { label: "PubMed: NR SCD/MCI pTau217 crossover (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/39817194/" },
      { label: "PubMed: NAD boosters systematic review (2026)", url: "https://pubmed.ncbi.nlm.nih.gov/41655607/" },
      { label: "Nature Metabolism: Whole-blood NAD+ across age (2026)", url: "https://www.nature.com/articles/s42255-026-01537-5" },
    ],
  },
  "Oxytocin": {
    researchSummary:
      "Intranasal oxytocin research expanded in 2024–2026 with multiple trials: a completed fear-processing fMRI trial (NCT05892939, completed April 2024); a Phase 2 postoperative delirium prevention trial (NCT06945926, registered April 2025); and a brain-route mechanistic trial (NCT07425938) recruiting from January 2026. Outside research use, oxytocin remains FDA-approved IV/IM for labor and postpartum hemorrhage; intranasal formulations are investigational in the US.",
    sources: [
      { label: "ClinicalTrials.gov: Intranasal oxytocin fMRI (NCT05892939)", url: "https://clinicaltrials.gov/study/NCT05892939" },
      { label: "ClinicalTrials.gov: Oxytocin postop delirium Phase 2 (NCT06945926)", url: "https://clinicaltrials.gov/study/NCT06945926" },
      { label: "ClinicalTrials.gov: Oxytocin brain-route (NCT07425938)", url: "https://clinicaltrials.gov/study/NCT07425938" },
    ],
  },
  "PT-141": {
    researchSummary:
      "Bremelanotide (Vyleesi) is an FDA-approved melanocortin-receptor agonist for hypoactive sexual desire disorder in premenopausal women (2019). A Phase 2 trial (NCT06565611) combining bremelanotide with tirzepatide for obesity started August 2024 with estimated completion March 2025; peer-reviewed efficacy data not yet published. No new FDA approval action in 2024–2026 verified.",
    sources: [
      { label: "ClinicalTrials.gov: Bremelanotide + tirzepatide Phase 2 (NCT06565611)", url: "https://clinicaltrials.gov/study/NCT06565611" },
    ],
  },
  "Semax": {
    researchSummary:
      "An ACTH(4–10) analog used in Russia as a neuroprotective/nootropic. 2025 mouse papers reported cognition and amyloid effects in Alzheimer's model, plus spinal cord injury recovery via μ-opioid receptor / USP18 / deubiquitination pathway. FDA scheduled Semax for 503A review July 24, 2026 and lists it among bulk substances with significant compounding safety concerns. No new Western human RCT verified.",
    sources: [
      { label: "PubMed: Semax Alzheimer mouse model (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/41479572/" },
      { label: "PubMed: Semax SCI μ-opioid/USP18 (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/40692165/" },
      { label: "FDA: PCAC July 23-24, 2026 (semax on agenda)", url: "https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026" },
    ],
  },
  "SLU-PP-332": {
    researchSummary:
      "An estrogen-related receptor (ERR) agonist explored as an exercise mimetic with strong rodent endurance and metabolic effects. 2025–2026 work remains preclinical: structure-activity optimization (2025) and in vitro metabolism / doping-control characterization (2026). No human ClinicalTrials.gov record verified.",
    sources: [
      { label: "PubMed: SLU-PP-332 SAR optimization (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/41850449/" },
      { label: "PubMed: SLU-PP-332 metabolism / doping characterization (2026)", url: "https://pubmed.ncbi.nlm.nih.gov/41688415/" },
    ],
  },
  "VIP": {
    researchSummary:
      "Vasoactive intestinal peptide (28 aa) signals via VPAC1/VPAC2 with immunomodulatory and pulmonary vasodilatory effects. A peer-reviewed 2025 RCT (NCT04844580) of inhaled aviptadil (VIP analog) in hospitalized COVID-19 pneumonia reported shorter time to discharge versus placebo. Earlier IV aviptadil COVID trials had mixed primary endpoints. Aviptadil remains investigational in the US.",
    sources: [
      { label: "PubMed: Inhaled aviptadil COVID-19 RCT (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/39870064/" },
      { label: "ClinicalTrials.gov: Inhaled aviptadil COVID (NCT04844580)", url: "https://clinicaltrials.gov/study/NCT04844580" },
    ],
  },
};

function mergeSources(existing = [], incoming = []) {
  const seen = new Set(existing.map((s) => s.url));
  const out = [...existing];
  for (const s of incoming) {
    if (!seen.has(s.url)) {
      out.push(s);
      seen.add(s.url);
    }
  }
  return out;
}

function applyPatch(entry, patch) {
  const changes = [];
  if (patch.researchSummary) {
    entry.researchSummary = patch.researchSummary;
    changes.push("researchSummary");
  }
  if (patch.reportedBenefits) {
    entry.reportedBenefits = patch.reportedBenefits;
    changes.push("reportedBenefits");
  }
  if (patch.notes) {
    entry.notes = patch.notes;
    changes.push("notes");
  }
  if (patch.sources?.length) {
    entry.sources = mergeSources(entry.sources || [], patch.sources);
    changes.push("sources");
  }
  if (patch.distinctiveQuality) {
    entry.distinctiveQuality = { ...entry.distinctiveQuality, ...patch.distinctiveQuality };
    changes.push("distinctiveQuality");
  }
  return changes;
}

const db = JSON.parse(readFileSync(DB_PATH, "utf8"));
const log = [];

for (const entry of db.entries) {
  const title = entry.catalog.title;
  const patch = PATCHES[title];
  if (patch) {
    const changed = applyPatch(entry, patch);
    log.push({ title, status: "updated", fields: changed, newSources: patch.sources?.length || 0 });
  } else {
    log.push({ title, status: "verified_unchanged", note: "No material 2024–2026 public update applied; existing summary retained." });
  }
}

db.meta.builtAt = new Date().toISOString();
writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + "\n");

const updated = log.filter((x) => x.status === "updated");
console.log(`Updated ${updated.length} / ${log.length} entries`);
for (const row of updated) {
  console.log(`  ${row.title}: ${row.fields.join(", ")} (+${row.newSources} sources)`);
}

writeFileSync(
  resolve(__dirname, "../../logs/badgerskope-research-refresh-changelog.json"),
  JSON.stringify({ generatedAt: db.meta.builtAt, entries: log }, null, 2) + "\n",
);
