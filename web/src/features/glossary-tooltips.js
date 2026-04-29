/**
 * Inline glossary tooltips inside the detail modal.
 *
 * On each detail render, walks the text nodes inside .detail__what-it-is,
 * .detail__summary-prose, .detail__prose, .detail__benefits li, and the
 * dose-table cells; wraps any glossary term match in an <abbr> with a
 * title= so browsers show a native tooltip on hover. Whole-word, case-
 * insensitive, longest-first match.
 *
 * Curated subset of the full glossary (web/glossary.html). Update both
 * if you add a term — they are not yet a single source of truth.
 *
 * Why <abbr>: native semantics (screen readers announce the expansion)
 * and free hover-tooltip without JS. Styled with a dotted underline
 * + cursor: help so users see it's interactive.
 */

const TERMS = {
  // Units
  "mcg":  "Microgram — one millionth of a gram. 1,000 mcg = 1 mg.",
  "µg":   "Microgram — one millionth of a gram. 1,000 µg = 1 mg.",
  "mg":   "Milligram — one thousandth of a gram. Most peptide vials are mg-scale.",
  "IU":   "International Unit — a standard measure used for some hormones and vitamins.",

  // Common acronyms
  "ACTH":  "Adrenocorticotropic Hormone — pituitary signal that triggers cortisol release from the adrenal glands.",
  "BDNF":  "Brain-Derived Neurotrophic Factor — a protein that supports neuron growth and survival.",
  "BPC":   "Body Protection Compound — a peptide fragment found in human gastric juice.",
  "COA":   "Certificate of Analysis — third-party lab document confirming what's in a vial and its purity.",
  "FDA":   "Food and Drug Administration — US agency that approves drugs after rigorous safety and efficacy review.",
  "GH":    "Growth Hormone — pituitary hormone that affects growth, body composition, and metabolism.",
  "GHRH":  "Growth Hormone Releasing Hormone — brain signal that tells the pituitary to release growth hormone.",
  "GHRP":  "Growth Hormone Releasing Peptide — synthetic peptide that triggers GH release via the ghrelin receptor.",
  "GIP":   "Glucose-dependent Insulinotropic Peptide — gut hormone that works alongside GLP-1 to regulate insulin.",
  "GLP-1": "Glucagon-Like Peptide-1 — gut hormone that reduces appetite and helps control blood sugar.",
  "HbA1c": "Glycated Hemoglobin — blood test for average blood sugar over 2–3 months. Standard diabetes metric.",
  "HSDD":  "Hypoactive Sexual Desire Disorder — the indication FDA-approved for bremelanotide (PT-141).",
  "IGF-1": "Insulin-like Growth Factor 1 — liver hormone that mediates many effects of growth hormone.",
  "MASH":  "Metabolic dysfunction-Associated Steatohepatitis — liver disease driven by metabolic dysfunction.",
  "NAD+":  "Nicotinamide Adenine Dinucleotide — coenzyme for energy production and DNA repair. Levels decline with age.",
  "NNMT":  "Nicotinamide N-Methyltransferase — enzyme implicated in adipose energy handling.",
  "PT-141":"PT-141 — bremelanotide, an FDA-approved melanocortin agonist for HSDD.",
  "RCT":   "Randomized Controlled Trial — gold-standard study design where participants are randomly assigned.",
  "SC":    "Subcutaneous — injected under the skin into the fat layer (most common route for peptides).",
  "WADA":  "World Anti-Doping Agency — international body that maintains the prohibited-substance list for sport.",

  // Phrases
  "bioavailability":  "How much of a substance actually reaches the bloodstream and its target after dosing.",
  "double-blind":     "Study design where neither participants nor researchers know who got treatment vs placebo.",
  "half-life":        "Time for half of a substance to be cleared from the body — drives dosing frequency.",
  "in vitro":         "Done in a test tube or petri dish — outside a living organism.",
  "in vivo":          "Done in a living organism. More relevant than in-vitro, less than human trials.",
  "lipodystrophy":    "Abnormal fat distribution — the FDA-approved indication for tesamorelin in HIV-related cases.",
  "lyophilized":      "Freeze-dried — how most research peptides are stored before reconstitution.",
  "off-label":        "Using an FDA-approved drug for a purpose outside its official approval.",
  "preclinical":      "Research in animals or cell cultures, before any human testing.",
  "secretagogue":     "A substance that triggers the body to release a hormone, rather than replacing it directly.",
  "subcutaneous":     "Injected under the skin into the fat layer (most common peptide route).",
  "tachyphylaxis":    "Rapid drop in response to a drug after repeated doses — why some peptides need cycling.",
  "telomere":         "Protective cap on chromosome ends. Shortens each cell division; linked to aging.",
  "telomerase":       "Enzyme that rebuilds telomeres, counteracting their natural shortening.",
};

// Build a single regex that matches any term, longest first to avoid
// partial overlap (e.g. "GHRP" should match before "GH").
const sortedKeys = Object.keys(TERMS).sort((a, b) => b.length - a.length);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Word boundaries: terms with non-letter chars (mcg, µg, NAD+, GLP-1, PT-141)
// can't use \b cleanly. Use lookarounds against letters/digits.
const TERM_RE = new RegExp(
  "(?<![A-Za-z0-9_])(" + sortedKeys.map(escapeRe).join("|") + ")(?![A-Za-z0-9_])",
  "gi",
);

const SELECTORS = [
  ".detail__what-it-is",
  ".detail__summary-prose",
  ".detail__known-for",
  ".detail__prose",
  ".detail__benefits li",
  ".detail__apps li",
  ".safety-list li",
  ".synergy-list li",
  ".detail__help",
  "table.doses td",
];

function decorateNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue;
    if (!TERM_RE.test(text)) return;
    TERM_RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    while ((m = TERM_RE.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const abbr = document.createElement("abbr");
      abbr.className = "glossary-term";
      // Match key in TERMS dictionary case-insensitively but display original casing.
      const key = sortedKeys.find((k) => k.toLowerCase() === m[1].toLowerCase());
      abbr.title = TERMS[key] || "";
      abbr.textContent = m[1];
      frag.appendChild(abbr);
      last = m.index + m[1].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  // Skip elements that already contain glossary markup or that we shouldn't touch.
  if (node.tagName === "ABBR" || node.tagName === "A" || node.tagName === "CODE" || node.tagName === "KBD") return;
  // Iterate over a snapshot of children — replaceChild mutates the live list.
  for (const child of Array.from(node.childNodes)) decorateNode(child);
}

/** Walk the detail-body subtree and wrap any glossary term match in
 *  an <abbr>. Idempotent — skips elements already containing <abbr>
 *  glossary markup so it can be called repeatedly without nesting. */
export function decorateDetailBody() {
  const body = document.getElementById("detail-body");
  if (!body) return;
  for (const sel of SELECTORS) {
    for (const el of body.querySelectorAll(sel)) decorateNode(el);
  }
}

/** No-op kept for symmetry with other features/* init() exports.
 *  Real wiring is the call to decorateDetailBody() that detail.js
 *  makes inside showDetailAt() after each renderDetailHtml(). */
export function initGlossaryTooltips() {
  // intentionally empty — the per-render hook in detail.js handles
  // every entry, including the first one. A MutationObserver-based
  // hook was tried first but didn't fire reliably for the initial
  // dialog.showModal() render.
}
