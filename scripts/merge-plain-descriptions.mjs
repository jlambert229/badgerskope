/**
 * Replaces researchSummary and distinctiveQuality.headline with plain-English versions.
 * Run: node peptides/scripts/merge-plain-descriptions.mjs
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

const PLAIN = {
  '1G-SGT': {
    summary:
      'A weekly injectable in the same family as Ozempic (semaglutide). It mimics a natural gut hormone called GLP-1 that tells your brain you are full and helps your body manage blood sugar. Large clinical trials showed meaningful weight loss and better blood sugar control. The vendor code "1G-SGT" is shorthand; always confirm the actual contents with a certificate of analysis.',
    headline:
      'Best known as a semaglutide-class weight-loss and blood-sugar drug, one of the most widely prescribed injectable peptides in the world.',
  },
  '2G-TZ': {
    summary:
      'A weekly injectable related to Mounjaro/Zepbound (tirzepatide). It works on two gut-hormone pathways (GIP and GLP-1) instead of one, which in trials produced even larger drops in weight and blood sugar than older single-pathway drugs. Doses are raised gradually to manage side effects like nausea.',
    headline:
      'Best known as a dual-action weight-loss and diabetes drug (tirzepatide class) that targets two hormone receptors at once.',
  },
  '3G-RT': {
    summary:
      'An investigational injectable (retatrutide class) that hits three hormone receptors: GIP, GLP-1, and glucagon. Early trials reported some of the largest average weight reductions seen for any drug in this space. Still in development and not yet approved anywhere.',
    headline:
      'Best known as a next-generation triple-action weight-loss peptide still in clinical trials, with some of the largest weight-loss numbers reported so far.',
  },
  '5-amino-1mq': {
    summary:
      'A small research molecule (not actually a peptide) that targets an enzyme called NNMT, which plays a role in how fat cells handle energy. Showed promising fat-reduction results in mice, but has not been tested in proper human trials. Sold as a research chemical.',
    headline:
      'Known as an experimental fat-metabolism research chemical that worked in mice but has no proven human weight-loss benefit.',
  },
  'AOD-9604': {
    summary:
      'A short fragment of growth hormone that was originally developed as a weight-loss drug. The company behind it did not get approval because the main clinical trials did not hit their goals. It is still sold in the wellness market with fat-burning claims, but the evidence behind those claims is weak compared to approved options.',
    headline:
      'Known as a growth-hormone fragment once tested for weight loss that failed to win approval, yet remains popular in wellness circles.',
  },
  'ARA-290': {
    summary:
      'A small peptide (also called cibinetide) designed to activate a natural repair pathway in the body without the blood-thickening effects of the hormone it was inspired by (erythropoietin). It has been tested in small human trials for nerve pain and nerve fiber damage.',
    headline:
      'Known as an experimental nerve-repair peptide tested in clinical trials for pain and nerve damage.',
  },
  'BPC-157': {
    summary:
      'A synthetic peptide originally isolated from a protective protein in stomach juice. Animal studies show it speeds up healing of tendons, muscles, and gut lining. Extremely popular in the wellness and sports recovery world, but there are very few published human clinical trials to back up the claims. Banned in sport by WADA since 2022.',
    headline:
      'Best known as the most popular "healing peptide" in wellness culture, backed by strong animal data but very limited human proof.',
  },
  Bronchogen: {
    summary:
      'A short synthetic peptide from Russian bioregulator research, said to support lung tissue health. The evidence comes mostly from small studies in Russian journals and vendor materials. It has not been tested in large Western clinical trials.',
    headline:
      'Known as a Russian-origin lung-support bioregulator peptide with limited evidence outside specialty markets.',
  },
  'Cag-10mg': {
    summary:
      'A long-acting version of amylin, a hormone your pancreas makes alongside insulin that tells your brain you are full. Being developed as an add-on to semaglutide (the combo is called CagriSema) to produce even more weight loss than either drug alone.',
    headline:
      'Known as the amylin-class appetite drug being paired with semaglutide to boost weight loss beyond what either can do alone.',
  },
  'CJC-1295': {
    summary:
      'A combination product pairing two growth-hormone-releasing peptides. CJC-1295 (a GHRH analog) tells your pituitary gland to make more growth hormone, while Ipamorelin (a GHRP) amplifies that signal. Commonly sold together as a "GH stack" in wellness clinics. Neither has an FDA-approved indication for this combined use.',
    headline:
      'Known as the classic two-peptide growth-hormone "stack" used in anti-aging and body-composition wellness protocols.',
  },
  DSIP: {
    summary:
      'A small peptide discovered decades ago and named "delta sleep-inducing peptide" based on early experiments. Despite the name, modern research has not consistently shown it helps people sleep better. It remains available in peptide markets riding on its name more than strong evidence.',
    headline:
      'Named after sleep but lacking strong modern proof it actually improves sleep quality in people.',
  },
  Epithalon: {
    summary:
      'A four-amino-acid synthetic peptide linked to the pineal gland. Popularized in longevity circles for claims about telomerase activation (the enzyme that maintains chromosome tips). Most evidence comes from cells and animals; large human trials have not been published.',
    headline:
      'Known as a longevity and anti-aging peptide marketed around telomere science, with very limited human clinical proof.',
  },
  'FOXO4-DRI': {
    summary:
      'A specially engineered peptide designed to clear out old, damaged "senescent" cells that accumulate with age. Showed promise in mouse studies for improving physical function. Still a niche research tool with no approved human use.',
    headline:
      'Known as an anti-aging research peptide that targets damaged senescent cells in lab and animal studies.',
  },
  'GHK-Cu': {
    summary:
      'A naturally occurring copper-binding tripeptide found in blood and saliva. Widely used in skincare products for its ability to stimulate collagen production and support wound healing. The strongest evidence is for topical skin use; injectable claims are less well supported.',
    headline:
      'Best known as a copper peptide used in skincare and wound healing, with strong topical evidence but weaker injectable proof.',
  },
  'GLOW 70': {
    summary:
      'A vendor-made blend that combines several popular peptides (typically BPC-157, TB-500, and NAD+ components) into one product aimed at recovery and tissue repair. No clinical trials exist for this exact combination; the evidence comes from each ingredient studied separately.',
    headline:
      'A multi-peptide recovery blend whose ingredients have individual research behind them but have never been tested as this specific mix.',
  },
  Glutathione: {
    summary:
      'The body\'s most important natural antioxidant, found inside nearly every cell. It neutralizes damaging molecules, helps detoxify harmful substances, and supports immune function. Popular as an IV drip in wellness clinics; clinically meaningful in people with genuine deficiency states.',
    headline:
      'Known as the body\'s master antioxidant, used medically for deficiency states and in IV wellness drips for general health claims.',
  },
  Ipamorelin: {
    summary:
      'A growth-hormone-releasing peptide that triggers your pituitary gland to release natural growth hormone in pulses. Considered "cleaner" than older drugs in its class because it causes less of a spike in stress hormones like cortisol. Used in wellness clinics for body composition and recovery goals.',
    headline:
      'Known as a gentler growth-hormone-releasing peptide popular in anti-aging clinics for recovery and body composition.',
  },
  Kisspeptin: {
    summary:
      'A naturally occurring hormone that acts as the master switch for the reproductive hormone cascade. It triggers the brain to release GnRH, which then stimulates LH and FSH, the hormones that drive fertility. Used in specialist research and fertility medicine.',
    headline:
      'Known as the master trigger for reproductive hormones, used in fertility research and specialist clinical settings.',
  },
  KLOW: {
    summary:
      'A vendor blend that extends the "GLOW" formula by adding KPV (an anti-inflammatory peptide fragment). Typically contains BPC-157, TB-500, GHK-Cu, and KPV in one product. Designed for combined repair and anti-inflammatory goals. No trials exist for the exact blend.',
    headline:
      'A multi-peptide blend combining healing and anti-inflammatory ingredients; evidence exists per component, not for the combo.',
  },
  KPV: {
    summary:
      'A three-amino-acid fragment from alpha-MSH (a natural anti-inflammatory hormone). Studied in animal models of gut inflammation where it reduced damage to the intestinal lining. Being explored for inflammatory bowel conditions but is still early in human translation.',
    headline:
      'Known as a short anti-inflammatory peptide fragment studied for gut inflammation and intestinal health in animal models.',
  },
  'LIPO-C': {
    summary:
      'A clinic-compounded injection combining lipotropic nutrients (methionine, inositol, choline, often with carnitine) plus vitamin B12. Marketed as a fat-metabolism booster in weight-loss clinics. The individual ingredients are well-known nutrients, but the injectable combination has limited controlled trial evidence for weight loss.',
    headline:
      'Known as a lipotropic "fat-burning shot" popular in weight-loss clinics, with limited clinical trial support for the combination.',
  },
  'LL-37': {
    summary:
      'The only antimicrobial peptide of its kind that humans naturally produce. It kills bacteria, viruses, and fungi on contact and also signals the immune system to respond to threats. Studied for infections and wound healing, but too much of it can worsen inflammatory skin conditions.',
    headline:
      'Known as the human body\'s own antimicrobial peptide, studied for fighting infections and supporting wound defense.',
  },
  'MOTS-c': {
    summary:
      'A small peptide naturally made by mitochondria (the energy factories in your cells). Animal studies suggest it improves how the body uses energy during exercise and helps with insulin sensitivity. Sometimes called an "exercise-in-a-peptide" in wellness marketing, though human proof is still early.',
    headline:
      'Known as a mitochondrial "exercise mimetic" peptide that may improve energy use and insulin response, mostly proven in animals.',
  },
  'MT-1': {
    summary:
      'A synthetic version of the body\'s natural tanning hormone (alpha-MSH). Approved in some countries as a slow-release implant for people with a rare sun sensitivity disorder. Also used off-label for cosmetic tanning. Works by stimulating melanin production in skin cells.',
    headline:
      'Known as a clinical tanning peptide approved abroad for sun-sensitivity conditions and used off-label for cosmetic darkening.',
  },
  'MT-II': {
    summary:
      'A more potent and less selective version of MT-1. Produces strong skin tanning but also triggers side effects across many body systems including nausea, blood pressure changes, and sexual arousal. Popular in underground tanning culture despite significant safety concerns including potential changes to moles.',
    headline:
      'Known as the potent but risky tanning-and-libido peptide, widely used in grey markets despite notable side effects.',
  },
  'N-acetyl Selank': {
    summary:
      'A modified version of Selank, a Russian-developed anti-anxiety peptide. The N-acetyl modification is said to make it more stable and longer-lasting. Used in Russia and CIS countries for anxiety and stress. Western clinical trials are very limited.',
    headline:
      'A stabilized version of a Russian anti-anxiety peptide used abroad for stress relief, with minimal Western clinical data.',
  },
  'N-acetyl Semax': {
    summary:
      'A modified version of Semax, a Russian-developed brain-boosting peptide based on a fragment of the stress hormone ACTH. Used in Russia for stroke recovery and cognitive support. The N-acetyl form is marketed as more stable. Very limited evidence from Western clinical trials.',
    headline:
      'A stabilized version of a Russian nootropic peptide used for focus and brain recovery, with minimal Western trial evidence.',
  },
  'NAD+': {
    summary:
      'A coenzyme found in every living cell that is essential for turning food into energy and repairing DNA. NAD+ levels decline with age, which has made it a centerpiece of anti-aging research. Delivered by IV drip in wellness clinics. Oral precursors (NR, NMN) are more common supplements.',
    headline:
      'Known as a core energy molecule that declines with age, popular in IV anti-aging wellness treatments.',
  },
  Orbitzen: {
    summary:
      'A vendor-specific blend name that combines multiple weight-management peptide components into one product. The exact ratio and composition are defined by the supplier rather than by clinical trial design. Evaluate each component\'s evidence individually.',
    headline:
      'A vendor-blended weight-management product combining multiple active ingredients; no standalone clinical trials for the mix.',
  },
  Oxytocin: {
    summary:
      'A natural hormone produced in the brain, most famously involved in childbirth contractions and breastfeeding. Also widely studied for its role in social bonding, trust, and emotional connection. Used medically to induce labor; nasal spray versions have been explored for social and mood benefits with mixed results.',
    headline:
      'Known as the "bonding hormone" used medically for labor and studied for social connection, trust, and mood effects.',
  },
  Pinealon: {
    summary:
      'A three-amino-acid bioregulator peptide from Russian longevity research, marketed for brain and pineal gland support. Evidence comes from specialty journals and vendor materials. It has not been evaluated in large Western clinical trials.',
    headline:
      'A Russian-origin brain bioregulator peptide marketed for cognitive aging, with very limited clinical evidence.',
  },
  'PT-141': {
    summary:
      'Also known as bremelanotide (brand name Vyleesi), this is an FDA-approved on-demand injection for low sexual desire in premenopausal women. It works through melanocortin receptors in the brain rather than blood-flow pathways like Viagra. Common side effects include nausea and temporary blood pressure changes.',
    headline:
      'The only FDA-approved on-demand peptide for low sexual desire, working through brain pathways rather than blood flow.',
  },
  Selank: {
    summary:
      'A synthetic anti-anxiety peptide developed in Russia, based on a natural immune-system fragment called tuftsin. Used clinically in Russia for generalized anxiety, stress, and mild cognitive complaints. Also shows some immune-modulating effects. Limited clinical data outside Russian and CIS medical literature.',
    headline:
      'A Russian-developed anti-anxiety and mild cognitive-support peptide with limited evidence outside Eastern Europe.',
  },
  Semax: {
    summary:
      'A synthetic brain-boosting peptide developed in Russia from a fragment of ACTH (a stress-related hormone). Used clinically there for stroke recovery, cognitive support, and focus enhancement. It promotes brain growth factors like BDNF. Delivered as a nasal spray. Minimal Western clinical trial data.',
    headline:
      'A Russian-developed cognitive peptide used for brain recovery and focus, delivered as a nasal spray.',
  },
  Sermorelin: {
    summary:
      'One of the earliest growth-hormone-releasing peptides, mimicking a natural brain signal (GHRH) that tells the pituitary gland to release growth hormone. Once FDA-approved for children with growth-hormone deficiency. Now widely used off-label in anti-aging clinics. Only works if your pituitary gland is still functional.',
    headline:
      'The original growth-hormone-releasing peptide, now a staple of anti-aging clinics for natural GH stimulation.',
  },
  'SLU-PP-332': {
    summary:
      'An experimental research compound (not a peptide) that activates receptors involved in endurance exercise adaptation. In mice, it improved running performance and shifted muscle fibers toward endurance types. Not tested in humans and not approved for any use.',
    headline:
      'An experimental "exercise in a pill" research compound that improved mouse endurance but has no human safety or efficacy data.',
  },
  SomatoPulse: {
    summary:
      'A retail product that combines tesamorelin (a growth-hormone-releasing peptide) with ipamorelin (another GH-releasing peptide) in one vial. The idea is to stimulate growth hormone release from two different angles. Each component has its own evidence base, but this exact pairing has not been tested in a combined clinical trial.',
    headline:
      'A two-in-one growth-hormone product combining tesamorelin and ipamorelin, each studied separately but not together.',
  },
  'SS-31': {
    summary:
      'A small peptide (also called elamipretide) designed to protect mitochondria, the energy powerhouses inside cells. It binds to a specific fat molecule on the inner mitochondrial membrane to stabilize energy production. Being developed for rare mitochondrial diseases and heart failure.',
    headline:
      'Known as a mitochondria-protecting peptide in clinical development for rare energy-production diseases and heart conditions.',
  },
  Survodutide: {
    summary:
      'An investigational injectable that activates both the GLP-1 and glucagon receptors. GLP-1 reduces appetite while glucagon increases energy burning, potentially offering weight loss from both sides. In early trials it showed significant weight reduction. Not yet approved.',
    headline:
      'A next-generation dual-action weight-loss peptide that reduces appetite and increases calorie burning simultaneously.',
  },
  'TB-500': {
    summary:
      'A synthetic version of a fragment from thymosin beta-4, a natural protein involved in cell movement and tissue repair. Popular in sports recovery for claims about faster healing of injuries. Animal evidence is solid, but human clinical trials are scarce. Flagged in anti-doping contexts.',
    headline:
      'Known as a tissue-repair peptide popular in sports recovery, with strong animal data but limited human clinical proof.',
  },
  Tesa: {
    summary:
      'Tesamorelin is an FDA-approved growth-hormone-releasing peptide specifically indicated for reducing excess belly fat in people with HIV-related lipodystrophy. It works by signaling the pituitary gland to produce more growth hormone. Used off-label in anti-aging clinics for body composition goals.',
    headline:
      'An FDA-approved growth-hormone peptide for HIV-related belly fat, also used off-label for body-composition goals.',
  },
  'Thymosin Alpha-1': {
    summary:
      'A natural immune-system peptide produced by the thymus gland. Approved in several countries as a vaccine enhancer and immune booster, particularly for hepatitis B. Also explored as immune support in cancer and chronic infections. Not FDA-approved in the US but available through compounding.',
    headline:
      'A thymus-derived immune peptide approved in multiple countries for hepatitis support and vaccine enhancement.',
  },
  Vilon: {
    summary:
      'A two-amino-acid peptide from Russian bioregulator research, marketed for thymus and immune support during aging. Evidence comes mainly from Russian specialty journals and peptide vendor course materials. Not tested in large Western trials.',
    headline:
      'A Russian dipeptide bioregulator marketed for immune aging support, with very limited clinical evidence outside Russia.',
  },
  VIP: {
    summary:
      'Vasoactive intestinal peptide is a natural 28-amino-acid hormone involved in gut function, blood vessel dilation, and immune regulation. Clinically relevant in VIPoma tumors that overproduce it. Being researched for lung inflammation and gut barrier protection.',
    headline:
      'A natural gut-and-immune hormone studied for lung inflammation and intestinal barrier health, known from VIPoma biology.',
  },
  Wolverine: {
    summary:
      'A vendor-named product that combines high doses of BPC-157 and TB-500, two popular tissue-repair peptides, in one vial. Named for the pop-culture reference to rapid healing. Each ingredient has animal evidence individually, but the combination has no clinical trial data as a pair.',
    headline:
      'A high-dose healing peptide combo (BPC-157 + TB-500) named after pop culture, with no clinical data for the combined product.',
  },
};

function main() {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  db.meta.schemaVersion = '2.7';
  db.meta.builtAt = new Date().toISOString();

  let unknown = 0;
  for (const entry of db.entries) {
    const key = resolveKey(entry.catalog?.title || '');
    const row = PLAIN[key];
    if (!row) { unknown++; continue; }
    entry.researchSummary = row.summary;
    if (entry.distinctiveQuality) {
      entry.distinctiveQuality.headline = row.headline;
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
  console.error(`wrote ${dbPath} schema ${db.meta.schemaVersion}; unresolved keys: ${unknown}`);
}

main();
