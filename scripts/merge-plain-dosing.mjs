/**
 * Rewrites dosingTimingNotes, cyclingNotes, and doseGuidelines[].minimumEffectiveDoseNotes
 * in plain English for all entries.
 * Run: node peptides/scripts/merge-plain-dosing.mjs
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

const DOSING = {
  '1G-SGT': {
    timing: "Injected under the skin once a week on any chosen day. The oral version has different rules. Research-grade vials sold online are not the same as the pharmacy product.",
    cycling: "Doses are gradually increased under medical supervision, not cycled on and off. Stopping suddenly in diabetes can cause blood sugar to worsen without a transition plan.",
    guidelines: [
      {
        indicationOrContext: "Type 2 diabetes (pharmacy semaglutide)",
        evidenceBasis: "regulatory_label",
        minimumEffectiveDoseNotes: "Start at a low dose and increase every 4 weeks. Many people stay on 0.5 mg or 1 mg once weekly for blood sugar control. The starting doses are ramp-up steps, not the final effective dose. Check the current prescribing information for exact numbers.",
      },
      {
        indicationOrContext: "Weight loss (pharmacy semaglutide 2.4 mg program)",
        evidenceBasis: "pivotal_trials",
        minimumEffectiveDoseNotes: "Trials ramped up to 2.4 mg once weekly for maximum weight loss. Lower doses still beat placebo, but 2.4 mg weekly was the target maintenance dose after the ramp-up period.",
      },
    ],
  },
  '2G-TZ': {
    timing: "Injected under the skin once a week with gradual dose increases. Follow the label for timing around meals.",
    cycling: "Same as other prescription weight-loss injections: doses are increased slowly to manage nausea. Stopping suddenly can be risky for people with diabetes.",
    guidelines: [
      {
        indicationOrContext: "Type 2 diabetes or weight loss (pharmacy tirzepatide)",
        evidenceBasis: "regulatory_label",
        minimumEffectiveDoseNotes: "Start at 2.5 mg once weekly and increase monthly. The first dose is mainly to build tolerance. The effective maintenance doses in trials were in the mid-range of available strengths. Check the current Mounjaro or Zepbound label for the exact schedule.",
      },
    ],
  },
  '3G-RT': {
    timing: "Injected weekly with gradual dose increases in clinical trials. The exact schedule depends on the study protocol.",
    cycling: "Still in clinical trials with no consumer dosing standard. Gradual dose increases are expected to manage gut side effects.",
    guidelines: [
      {
        indicationOrContext: "Weight loss (investigational retatrutide)",
        evidenceBasis: "pivotal_trials",
        minimumEffectiveDoseNotes: "Phase 2 trials used weekly doses that were slowly increased. Meaningful weight loss appeared at mid-range doses and got bigger at higher doses. No consumer dosing guide exists outside of clinical trials.",
      },
    ],
  },
  '5-amino-1mq': {
    timing: "Only tested in rodents. No established human dosing schedule or timing. Oral absorption has only been studied in animals.",
    cycling: "No published human regimen. Long-term safety is unknown, and any cycling schedule would be purely speculative.",
    guidelines: [
      {
        indicationOrContext: "Human use",
        evidenceBasis: "preclinical_animal",
        minimumEffectiveDoseNotes: "Animal studies used weight-based doses in mice. There is no established minimum effective dose for humans.",
      },
    ],
  },
  'AOD-9604': {
    timing: "The original clinical trials used oral doses, which are different from the injectable vials sold in wellness markets. No validated injection schedule exists in public labels.",
    cycling: "No standard cycle. The main development programs ended without gaining approval.",
    guidelines: [
      {
        indicationOrContext: "Historical oral development",
        evidenceBasis: "pivotal_trials",
        minimumEffectiveDoseNotes: "The original trials tested daily oral doses in milligrams, but the drug did not meet its weight-loss goals. There is no widely accepted minimum effective dose for the injectable grey-market vials.",
      },
    ],
  },
  'ARA-290': {
    timing: "Injected under the skin on schedules defined by clinical trial protocols. No universal timing recommendation.",
    cycling: "Treatment length is defined by clinical trial design. Self-directed cycling is not supported by evidence.",
    guidelines: [
      {
        indicationOrContext: "Nerve pain trials (injection)",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Clinical trials used fixed daily or intermittent injection schedules at specific doses. Follow published trial designs, not online calculators.",
      },
    ],
  },
  'BPC-157': {
    timing: "No FDA-approved dosing. Human data is minimal. Animal studies typically use once or twice daily injections, but there is no universal human schedule.",
    cycling: "No evidence-based cycling template exists. Banned in sport by WADA since 2022.",
    guidelines: [
      {
        indicationOrContext: "Animal injury models",
        evidenceBasis: "preclinical_animal",
        minimumEffectiveDoseNotes: "Rat studies commonly use about 10 micrograms per kilogram of body weight per dose, sometimes split into two daily injections. A validated human equivalent dose has not been established.",
      },
    ],
  },
  Bronchogen: {
    timing: "Sold in short courses, but the timing is not backed by Western clinical guidelines.",
    cycling: "Often described as short repeated courses by vendors. The evidence for optimal course length and rest periods is weak.",
    guidelines: [
      {
        indicationOrContext: "Human use",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Vendor course materials describe microgram-to-milligram short courses. No Western clinical trial has established a minimum effective dose.",
      },
    ],
  },
  'Cag-10mg': {
    timing: "Designed as a weekly injection, similar to other weight-loss injectables. Retail vials may not match the exact doses used in pharmaceutical trials.",
    cycling: "Should follow supervised dose increases if used medically. Informal cycling is not established.",
    guidelines: [
      {
        indicationOrContext: "CagriSema combination (investigational)",
        evidenceBasis: "pivotal_trials",
        minimumEffectiveDoseNotes: "Phase 3 trials describe matched weekly doses of cagrilintide and semaglutide (e.g. 2.4 mg of each once weekly after ramp-up). Retail 10 mg vials may not correspond directly to trial dosing ratios.",
      },
    ],
  },
  'CJC-1295': {
    timing: "Ipamorelin is short-acting (about 2 hours), so some protocols call for multiple daily injections. CJC-1295 without DAC is also shorter-acting than the DAC version. Evening dosing is discussed online to mimic natural nighttime growth hormone release, but this is not guideline-backed.",
    cycling: "Online forums suggest weeks on/off to prevent the body from becoming less responsive, but there is little human proof for the optimal schedule. Growth hormone secretagogues are restricted by WADA.",
    guidelines: [
      {
        indicationOrContext: "Growth hormone release (grey market)",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "No FDA-approved dose exists for this combination in healthy adults. Early human studies used microgram-per-kilogram doses that successfully raised growth hormone levels, but the long-term minimum effective dose for body composition has not been established in formal trials.",
      },
    ],
  },
  DSIP: {
    timing: "Older studies used IV infusions; there is no widely accepted modern dosing schedule for sleep.",
    cycling: "No standard cycle. The research base is old and has not been updated with modern sleep study methods.",
    guidelines: [
      {
        indicationOrContext: "Sleep research",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Small, dated studies used IV doses that produced inconsistent sleep results. There is not enough evidence to state a reliable minimum effective dose.",
      },
    ],
  },
  Epithalon: {
    timing: "Typically sold as short injection courses. Timing protocols come from specialty aging literature, not mainstream guidelines.",
    cycling: "Often described as periodic short courses (e.g. 10-20 days) with rest periods. Evidence for the ideal schedule is very limited.",
    guidelines: [
      {
        indicationOrContext: "Anti-aging use",
        evidenceBasis: "preclinical_animal",
        minimumEffectiveDoseNotes: "Cell and animal studies showed telomerase activation at specific doses. Small human studies used short milligram-level injection courses. No large trial has established a minimum effective dose for longevity outcomes.",
      },
    ],
  },
  'FOXO4-DRI': {
    timing: "Only tested in mice. No established human dosing schedule exists.",
    cycling: "Purely experimental. Any cycling protocol is speculative.",
    guidelines: [
      {
        indicationOrContext: "Senescent cell clearance (mouse studies)",
        evidenceBasis: "preclinical_animal",
        minimumEffectiveDoseNotes: "Mouse studies used specific weight-based doses over defined periods. There is no validated human dose or schedule.",
      },
    ],
  },
  'GHK-Cu': {
    timing: "Topical skin products are applied once or twice daily. Injectable timing is not standardized by any clinical guideline.",
    cycling: "Topical use is typically ongoing. Injectable cycling has no evidence-based schedule.",
    guidelines: [
      {
        indicationOrContext: "Topical skincare",
        evidenceBasis: "pivotal_trials",
        minimumEffectiveDoseNotes: "Skin care studies used creams with specific concentrations applied daily. The effective topical concentration is well-documented in cosmetic research. Injectable doses lack the same level of evidence.",
      },
      {
        indicationOrContext: "Injectable use",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "No clinical trial has established a minimum effective injectable dose for GHK-Cu in humans.",
      },
    ],
  },
  'GLOW 70': {
    timing: "Follow the most conservative timing recommendation among the individual ingredients. No unified schedule exists for the blend.",
    cycling: "No evidence-based cycle for this combination. Each component has its own research base.",
    guidelines: [
      {
        indicationOrContext: "Vendor blend",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Evaluate each ingredient (BPC-157, TB-500, NAD+ components) against its own published literature. A minimum effective dose for this specific blend does not exist.",
      },
    ],
  },
  Glutathione: {
    timing: "IV infusions vary widely across clinics. Oral supplements have much lower absorption than IV. Timing is not standardized.",
    cycling: "Some clinics offer weekly or monthly IV series. Chronic oral supplementation also exists. The evidence quality depends on the specific medical condition.",
    guidelines: [
      {
        indicationOrContext: "IV wellness infusions",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Clinic protocols range from hundreds of milligrams to several grams per infusion. There is no standardized minimum effective dose for general wellness claims.",
      },
    ],
  },
  Ipamorelin: {
    timing: "Short-acting (about 2 hours), so some protocols suggest multiple daily injections. Evening dosing is discussed to align with natural nighttime growth hormone release, but this is not guideline-backed.",
    cycling: "Online protocols commonly suggest periods on and off to maintain sensitivity. Formal human proof for the optimal schedule is limited.",
    guidelines: [
      {
        indicationOrContext: "Growth hormone release (healthy volunteers)",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Published studies used weight-based injection doses that successfully raised growth hormone levels in the short term. The minimum effective dose for long-term body composition changes has not been established.",
      },
    ],
  },
  Kisspeptin: {
    timing: "Used as timed IV infusions in research settings. The dosing pattern (pulsed vs. continuous) changes the biological effect.",
    cycling: "Not a consumer supplement. Dosing is entirely research-protocol-dependent.",
    guidelines: [
      {
        indicationOrContext: "Fertility and hormone research",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Research infusions use microgram-per-kilogram doses to stimulate LH release. Whether the infusion is pulsed or continuous changes the outcome. The minimum effective dose depends entirely on the specific research question.",
      },
    ],
  },
  KLOW: {
    timing: "Follow the most conservative schedule among the individual ingredients. No unified timing exists for the blend.",
    cycling: "No evidence-based cycle. Each component has its own considerations.",
    guidelines: [
      {
        indicationOrContext: "Vendor blend",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Check the certificate of analysis for the milligram split between ingredients, then compare each to its own published research. A combined minimum effective dose does not exist.",
      },
    ],
  },
  KPV: {
    timing: "Tested in animals via injection and oral routes. Human dosing timing has not been established.",
    cycling: "Animal studies used limited treatment windows. There is no proven human cycling protocol.",
    guidelines: [
      {
        indicationOrContext: "Gut inflammation (animal models)",
        evidenceBasis: "preclinical_animal",
        minimumEffectiveDoseNotes: "Animal studies used microgram-to-milligram per kilogram doses depending on the route. The human minimum effective dose has not been determined.",
      },
    ],
  },
  'LIPO-C': {
    timing: "Typically given as a weekly intramuscular injection at wellness clinics. Not standardized like a prescription drug.",
    cycling: "Clinic-specific series, often weekly for a set number of weeks. Stop if side effects occur.",
    guidelines: [
      {
        indicationOrContext: "Wellness clinic injections",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Clinic protocols use standard injection volumes with a mix of MIC nutrients plus B12. No controlled trial has established a minimum effective dose for weight loss with this combination.",
      },
    ],
  },
  'LL-37': {
    timing: "Research reagent only. Human therapeutic dosing has not been established. Too much may actually increase inflammation.",
    cycling: "Only theoretical intermittent use has been discussed. The safe dosing range in humans is unclear.",
    guidelines: [
      {
        indicationOrContext: "Research use",
        evidenceBasis: "preclinical_animal",
        minimumEffectiveDoseNotes: "Animal infection studies used localized microgram doses with a narrow safety window. There is no defined minimum effective human dose, and the margin between helpful and harmful amounts is unclear.",
      },
    ],
  },
  'MOTS-c': {
    timing: "Animal studies use repeated daily or multi-day injection schedules. Human dosing timing is still experimental.",
    cycling: "The research field is too early for any established cycling protocol. Current schedules are speculative.",
    guidelines: [
      {
        indicationOrContext: "Metabolic research (animal models)",
        evidenceBasis: "preclinical_animal",
        minimumEffectiveDoseNotes: "Mouse studies used weight-based injection doses given over days to weeks. Converting these to human equivalents is speculative, and no formal human minimum effective dose exists.",
      },
    ],
  },
  'MT-1': {
    timing: "The approved form is a slow-release implant placed under the skin every 60 days, not a daily injection.",
    cycling: "The implant replacement schedule is defined by the product label for the approved medical condition.",
    guidelines: [
      {
        indicationOrContext: "Sun sensitivity disorder (approved implant)",
        evidenceBasis: "regulatory_label",
        minimumEffectiveDoseNotes: "The approved dose is a 16 mg implant placed under the skin about every 60 days for people with erythropoietic protoporphyria. This is not a daily microdosing regimen.",
      },
    ],
  },
  'MT-II': {
    timing: "No approved dosing schedule. The line between an effective tanning dose and nausea is very thin.",
    cycling: "Tanning communities describe intermittent low-dose protocols, but no medical standard exists.",
    guidelines: [
      {
        indicationOrContext: "Cosmetic tanning (unapproved use)",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "User reports describe very small microgram injections under the skin because higher amounts cause strong nausea. There is no approved minimum effective dose for cosmetic use.",
      },
    ],
  },
  'N-acetyl Selank': {
    timing: "Typically used as a nasal spray twice daily in Russian prescribing. The N-acetyl version follows similar timing.",
    cycling: "Usually described as 2-4 week courses. Strong clinical trial evidence for the ideal cycle is limited.",
    guidelines: [
      {
        indicationOrContext: "Anti-anxiety (regional nasal products)",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Russian product packaging describes hundreds of micrograms per day divided into multiple nasal doses. No Western clinical trial has established a minimum effective dose.",
      },
    ],
  },
  'N-acetyl Semax': {
    timing: "Used as a nasal spray multiple times daily in Russia. The N-acetyl version is marketed as more stable and longer-lasting.",
    cycling: "Given in treatment courses of defined length, not open-ended continuous use.",
    guidelines: [
      {
        indicationOrContext: "Cognitive support (regional nasal products)",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Similar microgram-per-day divided nasal doses as the parent compound (Semax), based on Russian product information. No US FDA-pathway dosing exists.",
      },
    ],
  },
  'NAD+': {
    timing: "IV sessions at wellness clinics vary widely in dose and frequency. Oral precursors (NR, NMN) have different absorption and timing.",
    cycling: "Wellness IV treatments are often given weekly or monthly. The ideal frequency has not been established by strong clinical evidence.",
    guidelines: [
      {
        indicationOrContext: "IV wellness infusions",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Clinic infusion doses range widely from hundreds of milligrams to over a gram. There is no consensus minimum effective dose for anti-aging or general wellness outcomes.",
      },
    ],
  },
  Orbitzen: {
    timing: "Vendor-specific, not publicly disclosed in detail. Check with the supplier.",
    cycling: "Unknown without full ingredient disclosure.",
    guidelines: [
      {
        indicationOrContext: "Vendor blend (unknown formula)",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Cannot determine a minimum effective dose without confirmed active ingredients and their amounts.",
      },
    ],
  },
  Oxytocin: {
    timing: "For labor: given as a controlled IV drip in a hospital. For research: typically a single nasal spray dose.",
    cycling: "Not a supplement to cycle. Medical uses are episode-specific (childbirth, breastfeeding, research sessions).",
    guidelines: [
      {
        indicationOrContext: "Labor induction (IV, approved)",
        evidenceBasis: "regulatory_label",
        minimumEffectiveDoseNotes: "Hospital protocols use carefully titrated IV infusions measured in milliunits per minute. This is not a self-administered dose.",
      },
      {
        indicationOrContext: "Social/mood research (nasal spray)",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Behavioral studies typically use a single nasal dose in the range of 20-40 international units. Results have been inconsistent across studies.",
      },
    ],
  },
  Pinealon: {
    timing: "Sold as sublingual (under-the-tongue) doses. Timing is not verified by Western clinical guidelines.",
    cycling: "Described as short repeated courses by vendors. The evidence for this approach is thin.",
    guidelines: [
      {
        indicationOrContext: "Brain health (bioregulator marketing)",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Vendor materials describe short sublingual courses at microgram-to-milligram levels. No clinical trial has locked down a minimum effective dose.",
      },
    ],
  },
  'PT-141': {
    timing: "Inject under the skin at least 45 minutes before anticipated sexual activity. There are limits on how often it can be used per the product label.",
    cycling: "Not for daily continuous use. Nausea limits how frequently most people can use it. Follow the label's maximum frequency guidance.",
    guidelines: [
      {
        indicationOrContext: "Low sexual desire (FDA-approved autoinjector)",
        evidenceBasis: "regulatory_label",
        minimumEffectiveDoseNotes: "The approved dose is 1.75 mg injected under the skin as needed, at least 45 minutes before sex, with frequency limits. This is a flat dose, not a dose that needs to be gradually increased.",
      },
    ],
  },
  Selank: {
    timing: "Given as daily divided doses (nasal or injection) in Russian clinical practice.",
    cycling: "Typically used in multi-week treatment courses rather than indefinitely.",
    guidelines: [
      {
        indicationOrContext: "Anxiety (regional nasal/injectable products)",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Commercial products abroad describe divided microgram or low-milligram daily totals. The minimum effective dose has not been harmonized across different countries.",
      },
    ],
  },
  Semax: {
    timing: "Given as nasal drops multiple times daily according to Russian prescribing practice.",
    cycling: "Used in defined treatment courses, not as a lifelong daily supplement.",
    guidelines: [
      {
        indicationOrContext: "Cognitive and stroke recovery (regional nasal products)",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Russian product inserts describe divided microgram-per-day nasal schedules during treatment courses. Check the national label for the specific country's dosing.",
      },
    ],
  },
  Sermorelin: {
    timing: "Typically injected nightly under the skin to align with the body's natural nighttime growth hormone pulse.",
    cycling: "Some doctors pause treatment after several months to reassess growth hormone and IGF-1 levels, but there is no universal protocol.",
    guidelines: [
      {
        indicationOrContext: "Growth hormone deficiency (historical US label)",
        evidenceBasis: "regulatory_label",
        minimumEffectiveDoseNotes: "The original US label used nightly weight-based injection doses for children. Adult anti-aging protocols are off-label and do not have a single agreed minimum effective dose.",
      },
    ],
  },
  'SLU-PP-332': {
    timing: "Only tested in animals. Human absorption and timing are publicly unknown.",
    cycling: "Purely preclinical. No information on how long humans could safely use it.",
    guidelines: [
      {
        indicationOrContext: "Endurance research (mouse models)",
        evidenceBasis: "preclinical_animal",
        minimumEffectiveDoseNotes: "Mouse studies used oral weight-based doses that activated endurance-related pathways. The human equivalent dose is unknown.",
      },
    ],
  },
  SomatoPulse: {
    timing: "Would follow each ingredient's own schedule: tesamorelin is normally a daily injection, while ipamorelin is short-acting and sometimes given multiple times daily.",
    cycling: "Follow the tesamorelin label monitoring schedule for that component. Combining two peptides adds complexity.",
    guidelines: [
      {
        indicationOrContext: "Combined tesamorelin + ipamorelin (retail blend)",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "The listing contains 10 mg tesamorelin plus 3 mg ipamorelin per vendor. Compare each to its own solo label or published data. A minimum effective dose for the combined product has not been established in clinical trials.",
      },
    ],
  },
  'SS-31': {
    timing: "Given as IV infusions or injections on schedules defined by clinical trial protocols.",
    cycling: "Treatment periods are trial-defined. Not available for consumer self-dosing.",
    guidelines: [
      {
        indicationOrContext: "Mitochondrial disease (clinical trials)",
        evidenceBasis: "pivotal_trials",
        minimumEffectiveDoseNotes: "Trial protocols use weight-based or flat milligram daily doses for specific mitochondrial conditions. There is no self-administration dosing guide outside clinical studies.",
      },
    ],
  },
  Survodutide: {
    timing: "Weekly injection with gradual dose increases in clinical trials to manage gut side effects.",
    cycling: "Supervised dose titration only. Still investigational and not available outside clinical trials.",
    guidelines: [
      {
        indicationOrContext: "Weight loss and liver disease (Phase 2 trials)",
        evidenceBasis: "pivotal_trials",
        minimumEffectiveDoseNotes: "Trial participants received gradually increasing weekly doses, with effective doses in the mid-to-high milligram range. Follow the published trial protocol, not retail vial calculations.",
      },
    ],
  },
  'TB-500': {
    timing: "Online protocols describe a \"loading phase\" with more frequent injections followed by less frequent \"maintenance\" doses. This comes from forums, not clinical trials.",
    cycling: "Forum-based loading and maintenance schedules are common but not evidence-backed. Thymosin beta-4 products are banned by WADA.",
    guidelines: [
      {
        indicationOrContext: "Tissue repair (animal models)",
        evidenceBasis: "preclinical_animal",
        minimumEffectiveDoseNotes: "Animal studies using the thymosin beta-4 family vary widely in dosing per kilogram. The TB-500 fragment does not have a published human minimum effective dose like a drug label.",
      },
    ],
  },
  Tesa: {
    timing: "Injected under the skin of the abdomen once daily per the FDA label. IGF-1 and blood sugar levels should be monitored during use.",
    cycling: "Continued based on medical assessment, not informal on/off cycles. The label defines when to stop or continue.",
    guidelines: [
      {
        indicationOrContext: "HIV-related belly fat (FDA-approved)",
        evidenceBasis: "regulatory_label",
        minimumEffectiveDoseNotes: "The approved dose is 2 mg injected into the abdomen once daily. This is the tested effective dose, not a starting point for gradual increase.",
      },
    ],
  },
  'Thymosin Alpha-1': {
    timing: "Injected under the skin twice weekly in many countries where it is approved. The US does not have an approved version.",
    cycling: "Treatment courses are defined for specific conditions (e.g. alongside hepatitis antivirals).",
    guidelines: [
      {
        indicationOrContext: "Hepatitis B/C immune support (non-US labels)",
        evidenceBasis: "regulatory_label",
        minimumEffectiveDoseNotes: "Many national labels prescribe about 1.6 mg injected under the skin twice weekly alongside standard antiviral therapy. Check the specific country's prescribing information.",
      },
    ],
  },
  Vilon: {
    timing: "Described as short courses of low doses by vendors. Timing is not verified by Western clinical data.",
    cycling: "Short pulsed courses are described in marketing materials. The evidence is weak.",
    guidelines: [
      {
        indicationOrContext: "Immune aging (bioregulator marketing)",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Vendor materials describe low-milligram short courses taken orally or by injection. No Western clinical trial has established a minimum effective dose.",
      },
    ],
  },
  VIP: {
    timing: "Given as IV infusions or inhaled in clinical research settings. The route and timing are highly specific to the condition being studied.",
    cycling: "Treatment periods are defined by research protocols.",
    guidelines: [
      {
        indicationOrContext: "Investigational (inflammation and gut barrier research)",
        evidenceBasis: "phase1_human",
        minimumEffectiveDoseNotes: "Doses are protocol-specific, using microgram-per-kilogram infusions in some inflammation trials. There is no consumer dosing guide.",
      },
    ],
  },
  Wolverine: {
    timing: "Combines two short-acting peptides with different timing needs. No unified evidence-based schedule exists for the combination.",
    cycling: "Follow the more conservative schedule of the two components. Note that both BPC-157 and TB-500 are WADA-banned substances.",
    guidelines: [
      {
        indicationOrContext: "Retail blend (BPC-157 + TB-500)",
        evidenceBasis: "compounded_practice",
        minimumEffectiveDoseNotes: "Check the certificate of analysis for the actual milligram split between ingredients, then compare each to its own published research. There is no combined minimum effective dose.",
      },
    ],
  },
};

function main() {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  db.meta.schemaVersion = '2.9';
  db.meta.builtAt = new Date().toISOString();

  let unknown = 0;
  let updated = 0;
  for (const entry of db.entries) {
    const key = resolveKey(entry.catalog?.title || '');
    const row = DOSING[key];
    if (!row) { unknown++; continue; }
    entry.dosingTimingNotes = row.timing;
    entry.cyclingNotes = row.cycling;
    entry.doseGuidelines = row.guidelines;
    updated++;
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
  console.error(`wrote ${dbPath} schema ${db.meta.schemaVersion}; updated ${updated} entries; unresolved keys: ${unknown}`);
}

main();
