/**
 * Adds distinctiveQuality (public reputation / what the class is most credited for) + filter themes.
 * Run from repo: node peptides/scripts/merge-known-for.mjs
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
 * High-level "known for" buckets for filtering and grouping.
 * Intentionally coarse: several legacy drug classes roll up under one tag.
 */
const KNOWN_FOR_THEME_INDEX = {
  metabolic_incretins:
    'Appetite, weight, and glucose narratives built on GLP-1, GIP/GLP-1 dual, triple incretin, amylin, or GLP-1/glucagon co-agonist programs.',
  growth_hormone_axis:
    'Pituitary GH release via GHRH- or GHRP-class peptides; includes tesamorelin-style visceral-fat label stories.',
  tissue_healing:
    'Repair and recovery reputation for tendon, muscle, gut, or wound biology (usually one main act per SKU).',
  multi_ingredient_stack:
    'Vendor-prepared blend of multiple actives where the story is the bundle, not a single mechanism.',
  skin_tanning_libido:
    'Cosmetic skin, melanin or tanning pathways, or melanocortin-driven sexual arousal products.',
  mitochondria_nad_redox:
    'Mitochondrial targeting peptides, NAD+ or redox cofactors, and major cellular antioxidants.',
  immune_mucosal:
    'Host defense, antimicrobial peptides, thymic immunomodulators, barrier or innate-repair signaling, mucosal anti-inflammatory fragments.',
  neuro_mood_sleep:
    'Cognition, anxiolytic, nootropic, or sleep-hypothesis peptides.',
  reproduction_social:
    'Fertility-axis probes, labor or lactation hormones, oxytocin-family social and bonding research.',
  experimental_weight_adjunct:
    'Non-incretin adjuncts: lipotropic shots, GH-fragment lore, research small molecules, or exercise-mimetic probes sold in metabolic spaces.',
  aging_bioregulators:
    'Longevity, senescence, or ultra-short \"bioregulator\" aging narratives (often light on Western pivotal trials).',
};

const KNOWN = {
  '1G-SGT': {
    headline:
      'Credited as the mainstream long-acting GLP-1 receptor agonist class (semaglutide-scale trials) for large glycemic and weight effects after titration.',
    themes: ['metabolic_incretins'],
    basisNote: 'Human registration trial and label class; vendor shorthand not a separate molecular claim.',
  },
  '2G-TZ': {
    headline:
      'Credited as the GIP plus GLP-1 dual incretin class (tirzepatide-scale trials) for incremental metabolic and adiposity signals versus GLP-1 alone.',
    themes: ['metabolic_incretins'],
    basisNote: 'Human pivotal trial class for tirzepatide; verify vial identity against pharmacy drug product.',
  },
  '3G-RT': {
    headline:
      'Known clinically as the triple incretin class (GIP/GLP-1/glucagon) associated with some of the largest reported placebo-subtracted weight signals in phase narratives.',
    themes: ['metabolic_incretins'],
    basisNote: 'Retatrutide clinical program discourse; grey-market labels may not match pharmaceutical quality.',
  },
  '5-amino-1mq': {
    headline:
      'Known in niche metabolic research as an NNMT-oriented small molecule probe explored for adipocyte energy expenditure mechanisms.',
    themes: ['experimental_weight_adjunct'],
    basisNote: 'Preclinical and specialty chemical literature predominates over human outcome proof.',
  },
  'AOD-9604': {
    headline:
      'Famous in wellness marketing as a growth-hormone fragment tied to lipolysis lore distinct from incretin obesity drugs.',
    themes: ['experimental_weight_adjunct'],
    basisNote: 'Human obesity registration success does not parallel approved incretin or AOM sets for this fragment.',
  },
  'ARA-290': {
    headline:
      'Best known for company-led innate immune repair and neuropathic-pain trial narratives built around a helix B insulin fragment analog (cibinetide pathway).',
    themes: ['immune_mucosal'],
    basisNote: 'Special-protocol human trials; not interchangeable with insulin products.',
  },
  'BPC-157': {
    headline:
      'Most famous in grey-market and rodent literature for gastroprotection, angiogenesis, and soft-tissue healing folklore despite thin prospective human RCT branding.',
    themes: ['tissue_healing'],
    basisNote: 'Reputation exceeds large Western confirmatory human outcome datasets.',
  },
  Bronchogen: {
    headline:
      'Known primarily as a Khavinson-style lung bioregulator peptide in Eastern peptide narratives rather than Western pivotal indications.',
    themes: ['aging_bioregulators'],
    basisNote: 'Limited large international trial footprint versus marketing lore.',
  },
  'Cag-10mg': {
    headline:
      'Credited as the long-acting amylin-family analog class positioned for satiation layered on incretin obesity strategies.',
    themes: ['metabolic_incretins'],
    basisNote: 'Cagrilintide clinical class; combination with semaglutide studied as CagriSema.',
  },
  'CJC-1295': {
    headline:
      'Known as a long-acting GHRH analog (without DAC naming) bundled with ipamorelin in classic GH-axis \"stack\" retail products.',
    themes: ['growth_hormone_axis', 'multi_ingredient_stack'],
    basisNote: 'Single SKU combines two secretagogue mechanisms; evidence is wellness and pharmacology literature, not one combined FDA indication.',
  },
  DSIP: {
    headline:
      'Historically named for delta-sleep induction; public reputation outruns robust controlled human sleep outcomes.',
    themes: ['neuro_mood_sleep'],
    basisNote: 'Mixed and dated human data versus catchy peptide label.',
  },
  Epithalon: {
    headline:
      'Most publicized Khavinson bioregulator tied to pineal, melatonin, and telomerase lore in longevity media.',
    themes: ['aging_bioregulators'],
    basisNote: 'Human confirmatory trials are sparse versus narrative prominence.',
  },
  'FOXO4-DRI': {
    headline:
      'Known in longevity research circles as a senolytic apoptosis-modulating D-peptide construct aimed at senescent cells.',
    themes: ['aging_bioregulators'],
    basisNote: 'Specialized translational niche; not a mainstream approved therapy class.',
  },
  'GHK-Cu': {
    headline:
      'Famous cosmetic and dermal ingredient associated with copper-dependent ECM remodeling and wound-healing bench science.',
    themes: ['skin_tanning_libido'],
    basisNote: 'Topical and aesthetic literature strongest; systemic injection claims vary by jurisdiction.',
  },
  'GLOW 70': {
    headline:
      'Known as a vendor \"GLOW\" repair stack blending BPC/TB/NAD-style motifs rather than a single mechanistic breakthrough.',
    themes: ['multi_ingredient_stack', 'tissue_healing'],
    basisNote: 'Marketing-defined blend; combine-at-your-own-risk complexity versus monotherapy evidence.',
  },
  Glutathione: {
    headline:
      'Universally credited as a master intracellular antioxidant and conjugation cofactor central to redox homeostasis teaching.',
    themes: ['mitochondria_nad_redox'],
    basisNote: 'Clinical stories differ for repletion versus generic \"wellness IV\" marketing.',
  },
  Ipamorelin: {
    headline:
      'Often described as a comparatively \"clean\" GHRP-class secretagogue selective for pulsatile GH with lighter acute stress-hormone folklore.',
    themes: ['growth_hormone_axis'],
    basisNote: 'Human label claims differ from grey-market use; pituitary physiology still governs efficacy.',
  },
  Kisspeptin: {
    headline:
      'Famous upstream neuropeptide for GnRH pulse generation, puberty timing, and fertility physiology probes.',
    themes: ['reproduction_social'],
    basisNote: 'Research and specialized clinical-use contexts; not a primary care drug everywhere.',
  },
  KLOW: {
    headline:
      'Known as a retail KLOW stack (GHK/BPC/TB motifs) bundling repair-associated peptides in one SKU definition.',
    themes: ['multi_ingredient_stack', 'tissue_healing', 'skin_tanning_libido'],
    basisNote: 'Vendor bundle; per-component evidence should be evaluated separately.',
  },
  KPV: {
    headline:
      'Known as a C-terminal alpha-MSH fragment explored for mucosal anti-inflammatory and barrier biology (IBD-adjacent research lore).',
    themes: ['immune_mucosal'],
    basisNote: 'Early human translation compared with legacy melanocortin drugs.',
  },
  'LIPO-C': {
    headline:
      'Famous in clinic menus as a lipotropic \"MIC\" injectable adjunct bundled with B12 in weight protocols.',
    themes: ['experimental_weight_adjunct'],
    basisNote: 'Evidence quality is mixed and practice-pattern heavy.',
  },
  'LL-37': {
    headline:
      'Best known academically as the major human cathelicidin antimicrobial peptide linking innate immunity to tissue inflammation.',
    themes: ['immune_mucosal'],
    basisNote: 'Dual host-defense and dysregulated inflammation themes in advanced research.',
  },
  'MOTS-c': {
    headline:
      'Credited as an exercise-related mitochondrial-derived peptide signal tied to metabolic stress resistance in rodent and early human exploratory work.',
    themes: ['mitochondria_nad_redox'],
    basisNote: 'Bench and small human pharmacology reports; chronic outcome claims vary.',
  },
  'MT-1': {
    headline:
      'Associated with afamelanotide-class photoprotection and tanning pharmacology rather than the stronger central side-effect folklore of MT-II.',
    themes: ['skin_tanning_libido'],
    basisNote: 'Regulated differently by region; cosmetic misuse still occurs.',
  },
  'MT-II': {
    headline:
      'Most famous melanotan in grey-market discourse for aggressive tanning and libido-adjacent melanocortin stimulation.',
    themes: ['skin_tanning_libido'],
    basisNote: 'Nausea, blood pressure, and mole darkening risks feature in case literature.',
  },
  'N-acetyl Selank': {
    headline:
      'Known overseas as an amidated N-acetyl variant tied to Russian anxiolytic glyproline peptide development lore.',
    themes: ['neuro_mood_sleep'],
    basisNote: 'Western replication and registration thinner than domestic narrative.',
  },
  'N-acetyl Semax': {
    headline:
      'Known overseas as an N-acetyl ACTH-derived nootropic peptide with neurotrophic marketing themes.',
    themes: ['neuro_mood_sleep'],
    basisNote: 'CIS clinical experience dominates English-language RCT coverage.',
  },
  'NAD+': {
    headline:
      'Famous in anti-aging and IV wellness culture as the redox cofactor powering sirtuin and mitochondrial ATP-generation narratives.',
    themes: ['mitochondria_nad_redox'],
    basisNote: 'Oral bioavailability and indication-specific evidence are product-dependent.',
  },
  Orbitzen: {
    headline:
      'Known as a vendor-br capped blend SKU (\"Orbitzen\") combining several incretin/AOM-class motifs in one ratioed presentation.',
    themes: ['metabolic_incretins', 'multi_ingredient_stack'],
    basisNote: 'Blend identity and stability are vendor claims; compare to single-agent pivotal data carefully.',
  },
  Oxytocin: {
    headline:
      'Classic nonapeptide hormone best known for labor physiology and extensive social bonding, trust, and affective neuroscience research.',
    themes: ['reproduction_social'],
    basisNote: 'Simple intranasal hype outpaces replicated enhancement trials.',
  },
  Pinealon: {
    headline:
      'Described in bioregulator commerce as a brain-pineal short peptide; Western pivotal indications are limited versus narrative.',
    themes: ['aging_bioregulators', 'neuro_mood_sleep'],
    basisNote: 'Class overlaps epithalon-adjacent longevity marketing ecosystems.',
  },
  'PT-141': {
    headline:
      'Best known as bremelanotide, a melanocortin receptor agonist with an FDA narrative for on-demand arousal in specific cohorts.',
    themes: ['skin_tanning_libido'],
    basisNote: 'Hypertension and nausea are labeled concerns; distinct from PT-141 grey-market vial variance.',
  },
  Selank: {
    headline:
      'Russian glyproline anxiolytic peptide famous domestically for stress, cognition, and immune-modulation crossover stories.',
    themes: ['neuro_mood_sleep'],
    basisNote: 'Export and compounding use may not mirror native clinical formulations.',
  },
  Semax: {
    headline:
      'Russian ACTH-derived nootropic peptide best known for attention, stroke rehab adjacency, and BDNF-related mechanistic marketing.',
    themes: ['neuro_mood_sleep'],
    basisNote: 'Regulatory status and concentration differ between regions.',
  },
  Sermorelin: {
    headline:
      'Historic GHRH (1-29) analog famous as an older GH-secretagogue peptide predecessor to longer-acting GHRH engineering.',
    themes: ['growth_hormone_axis'],
    basisNote: 'Still common in wellness anti-aging menus; pituitary capacity limits response.',
  },
  'SLU-PP-332': {
    headline:
      'Known experimentally as a biased PPAR-delta agonist discussed as an exercise-mimetic research compound, not an approved drug class.',
    themes: ['experimental_weight_adjunct'],
    basisNote: 'Animal and in vitro literature; human consumption is not guideline-supported.',
  },
  SomatoPulse: {
    headline:
      'Known as a co-packaged tesamorelin-strength plus ipamorelin-strength retail definition combining GHRH-axis and GHRP-axis motifs.',
    themes: ['growth_hormone_axis', 'multi_ingredient_stack'],
    basisNote: 'Single product stacks two mechanisms; label story follows components individually.',
  },
  'SS-31': {
    headline:
      'Famous as Elamipretide / Szeto-Schiller peptide targeting mitochondrial cardiolipin for cytoprotection in rare disease and aging research.',
    themes: ['mitochondria_nad_redox'],
    basisNote: 'Clinical development concentrated in specific indications; cosmetic generalization is premature.',
  },
  Survodutide: {
    headline:
      'Credited clinically as a GLP-1 plus glucagon receptor dual agonist class pursued for adiposity with complementary energy-balance biology.',
    themes: ['metabolic_incretins'],
    basisNote: 'Boehringer/Zealand program discourse; not interchangeable with vendor vial claims.',
  },
  'TB-500': {
    headline:
      'Best known regenerative-sports lore as a thymosin-beta-4 fragment motif tied to cell migration and actin-binding repair narratives.',
    themes: ['tissue_healing'],
    basisNote: 'Human athletic doping panels and regulatory scrutiny exist for TB4-related peptides.',
  },
  Tesa: {
    headline:
      'Known as tesamorelin-class GHRH analog material associated with visceral adiposity reduction in its approved HIV lipodystrophy indication story.',
    themes: ['growth_hormone_axis'],
    basisNote: 'Off-label body-composition use is not the FDA indication anchor.',
  },
  'Thymosin Alpha-1': {
    headline:
      'Famous globally as an immune-modulating thymic peptide used historically as a vaccine adjuvant and immune support injectable in parts of the world.',
    themes: ['immune_mucosal'],
    basisNote: 'Regulatory acceptance varies; contamination and counterfeit risks exist in grey supply.',
  },
  Vilon: {
    headline:
      'Khavinson dipeptide bioregulator most cited in Russian immune and restorative peptide course marketing versus broad Western trials.',
    themes: ['aging_bioregulators'],
    basisNote: 'Evidence depth uneven versus course testimonials.',
  },
  VIP: {
    headline:
      'Classic neuropeptide famous for VIPoma secretory diarrhea physiology and wider neuro-immune barrier research.',
    themes: ['immune_mucosal'],
    basisNote: 'Systemic administration differs sharply from topical airway experimental narratives.',
  },
  Wolverine: {
    headline:
      'Vendor stack name most associated with high-dose TB/BPC-style repair peptide bundling for sports recovery marketing.',
    themes: ['multi_ingredient_stack', 'tissue_healing'],
    basisNote: 'Named after pop-culture meme; clinical evidence is per-component, not stack-pivotal.',
  },
};

function main() {
  const raw = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(raw);

  db.meta = db.meta || {};
  db.meta.schemaVersion = '2.6';
  db.meta.builtAt = new Date().toISOString();
  db.meta.knownForThemeIndex = KNOWN_FOR_THEME_INDEX;
  db.meta.distinctiveQualityLegend = {
    headline_meaning:
      'Plain-language reputation: what clinicians, trialists, or popular discourse most associate with this class. Not a promise that any catalog vial delivers that reputation.',
    themes_meaning:
      'themes are deliberately broad buckets (about a dozen) so related mechanisms group together in filters; one product may appear under several buckets.',
    basisNote_meaning:
      'Short reminder of whether the reputation rests on pivotal human data, mixed trials, bench science, marketing, or excipient reality.',
  };

  const disclaimerExtra =
    ' distinctiveQuality summarizes class reputation and discourse only; it is not a verified identity claim for grey-market SKUs, not individualized advice, and filter themes are educational groupings only.';
  if (!db.disclaimer.includes('distinctiveQuality')) {
    db.disclaimer += disclaimerExtra;
  }

  let unknown = 0;
  for (const entry of db.entries) {
    const title = entry.catalog?.title || '';
    const key = resolveKey(title);
    const row = KNOWN[key];
    if (!row || key === 'UNKNOWN') {
      unknown++;
      entry.distinctiveQuality = {
        headline: 'Distinctive public reputation not yet tagged for this SKU key; see researchSummary and compoundType.',
        themes: [],
        basisNote: `Resolver key: ${key}`,
      };
      continue;
    }
    entry.distinctiveQuality = {
      headline: row.headline,
      themes: [...new Set(row.themes)],
      basisNote: row.basisNote,
    };
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
  console.error(`wrote ${dbPath} schema ${db.meta.schemaVersion}; unknown resolver count: ${unknown}`);
}

main();
