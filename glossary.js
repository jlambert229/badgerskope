  (function () {
    'use strict';

    // Nav scroll-state + hamburger live in marketing-nav.js (loaded in head).

    // ---- Term data ----
    var terms = [
      { term: 'ACTH', full: 'Adrenocorticotropic Hormone', def: 'A stress-related hormone produced by the pituitary gland. It signals the adrenal glands to release cortisol, which helps your body respond to stress.' },
      { term: 'Amino acid', full: '', def: 'The basic building blocks of proteins and peptides. There are 20 standard amino acids that combine in different sequences to form every protein in your body.' },
      { term: 'Amylin', full: '', def: 'A hormone made by the pancreas alongside insulin that signals fullness to the brain. It slows stomach emptying and helps regulate blood sugar after meals.' },
      { term: 'Anabolic', full: '', def: 'Relating to the building up of complex molecules in the body, especially muscle tissue. The opposite of catabolic (breaking down).' },
      { term: 'Bioavailability', full: '', def: 'How much of a substance actually gets absorbed into your bloodstream and reaches its target. A peptide injected subcutaneously typically has higher bioavailability than one taken orally.' },
      { term: 'Bioregulator', full: '', def: 'A very short peptide (2–4 amino acids) marketed for organ-specific support, often originating from Russian research (Khavinson peptides). Evidence is limited and mostly preclinical. A 2–4 amino-acid chain that retunes a specific organ on command would be a Nobel Prize, not a $30 vial.' },
      { term: 'BPC', full: 'Body Protection Compound', def: 'A peptide fragment originally found in human stomach juice. BPC-157 is the most studied variant, researched for its potential effects on gut healing and tissue repair, mostly in animal models. Beloved by podcasts, studied mostly in rats — both things are true at once.' },
      { term: 'Catabolic', full: '', def: 'Relating to the breakdown of complex molecules into simpler ones, often releasing energy. Muscle wasting and fat loss are catabolic processes.' },
      { term: 'Certificate of Analysis', full: 'COA', def: 'A document from an independent lab confirming what is actually in a vial and its purity. A legitimate COA should come from a third-party lab, not the vendor itself. A COA the seller printed for itself is decoration, not verification.' },
      { term: 'Clinical trial', full: '', def: 'A formal study testing a drug or treatment in human volunteers. Trials follow strict protocols and are registered publicly (e.g., on ClinicalTrials.gov).' },
      { term: 'Compounding pharmacy', full: '', def: 'A pharmacy that custom-mixes medications to order, sometimes used to prepare peptides. Quality and regulation vary significantly between compounding pharmacies. "Compounded" means "mixed to order" — it is not a quieter way of saying "FDA-approved."' },
      { term: 'Cytokine', full: '', def: 'Small signaling proteins released by cells that regulate inflammation and immune responses. Some peptides are studied for their effects on cytokine levels.' },
      { term: 'Double-blind', full: '', def: 'A study design where neither the participants nor the researchers know who got the real treatment versus placebo. This reduces bias and is considered more reliable than open-label studies.' },
      { term: 'Dose titration', full: '', def: 'Gradually increasing a dose over time to find the right amount and manage side effects. Most peptide protocols start low and titrate up over days or weeks.' },
      { term: 'Endogenous', full: '', def: 'Produced naturally inside the body. For example, growth hormone is endogenous — your pituitary gland makes it. Contrast with exogenous (introduced from outside).' },
      { term: 'Exogenous', full: '', def: 'Introduced from outside the body. Injecting a peptide is administering an exogenous substance, even if the body naturally produces something similar.' },
      { term: 'FDA', full: 'Food and Drug Administration', def: 'The US federal agency responsible for approving drugs, biologics, and medical devices. FDA approval means a substance has passed rigorous safety and efficacy testing.' },
      { term: 'GH', full: 'Growth Hormone', def: 'A hormone produced by the pituitary gland that affects growth, body composition, and metabolism. Also called somatotropin. Levels naturally decline with age.' },
      { term: 'GHRH', full: 'Growth Hormone Releasing Hormone', def: 'A brain signal (hypothalamic hormone) that tells the pituitary gland to release growth hormone. Some research peptides like CJC-1295 are GHRH analogs.' },
      { term: 'GHRP', full: 'Growth Hormone Releasing Peptide', def: 'A synthetic peptide that triggers growth hormone release by activating the ghrelin receptor. Examples include GHRP-2 and GHRP-6. Not the same mechanism as GHRH.' },
      { term: 'GLP-1', full: 'Glucagon-Like Peptide-1', def: 'A gut hormone (incretin) that reduces appetite and helps control blood sugar. Semaglutide and liraglutide are GLP-1 receptor agonists — the drugs behind Ozempic and Wegovy.' },
      { term: 'GIP', full: 'Glucose-dependent Insulinotropic Peptide', def: 'Another gut hormone that works alongside GLP-1 to regulate insulin and blood sugar. Tirzepatide (Mounjaro) targets both GLP-1 and GIP receptors.' },
      { term: 'Grey market', full: '', def: 'Products sold legally but outside official pharmaceutical channels, with uncertain quality and authenticity. Most “research peptides” fall into this category. “Not for human consumption” on the label is the legal fiction that keeps the storefront open.' },
      { term: 'Half-life', full: '', def: 'How long it takes for half of a substance to be eliminated from your body. A peptide with a 6-hour half-life means roughly half is gone after 6 hours. This determines dosing frequency.' },
      { term: 'HbA1c', full: 'Glycated Hemoglobin', def: 'A blood test measuring average blood sugar levels over 2–3 months. It is the standard metric for long-term blood sugar control in diabetes management.' },
      { term: 'Homeostasis', full: '', def: 'The body’s tendency to maintain stable internal conditions (temperature, pH, blood sugar, etc.). Many peptides work by nudging the body back toward homeostatic balance. “Restores balance” is also the favorite phrase of things that do nothing — always ask: balance of what, measured how?' },
      { term: 'IGF-1', full: 'Insulin-like Growth Factor 1', def: 'A hormone produced mainly by the liver that mediates many effects of growth hormone. When GH goes up, IGF-1 typically follows. It is often measured as a proxy for GH activity.' },
      { term: 'Incretin', full: '', def: 'A gut hormone that helps control blood sugar and appetite by stimulating insulin release after eating. GLP-1 and GIP are the two main incretins. The “incretin effect” explains why oral glucose triggers more insulin than IV glucose.' },
      { term: 'In vitro', full: '', def: 'Experiments done in a test tube or petri dish, outside a living organism. “It worked in vitro” means it worked in a lab dish — not necessarily in a living body. A petri dish has no liver and no kidneys; your body has both, and they get a vote.' },
      { term: 'In vivo', full: '', def: 'Experiments done in a living organism (animal or human). More relevant than in vitro, but animal in vivo results don’t always translate to humans.' },
      { term: 'Lipodystrophy', full: '', def: 'Abnormal fat distribution in the body. Can be a side effect of certain medications (including some HIV drugs) or repeated injections in the same spot.' },
      { term: 'Lyophilized', full: '', def: 'Freeze-dried — how most research peptides are stored before reconstitution. The powder is mixed with bacteriostatic water before injection. Lyophilized peptides are more stable than liquid form.' },
      { term: 'MCG / µg', full: 'Micrograms', def: 'One millionth of a gram. 1,000 mcg equals 1 mg. Many peptides are dosed in micrograms because they are active at very small amounts.' },
      { term: 'Melanocortin', full: '', def: 'A family of brain receptors (MC1R through MC5R) involved in skin pigmentation, appetite regulation, and sexual function. PT-141 (bremelanotide) and melanotan target melanocortin receptors.' },
      { term: 'MG', full: 'Milligrams', def: 'One thousandth of a gram. Most peptide vials are measured in milligrams (e.g., a 5 mg vial), while individual doses are often in micrograms.' },
      { term: 'Mitochondria', full: '', def: 'The energy-producing structures inside every cell, often called the “powerhouses” of cells. They convert nutrients into ATP, the molecule your cells use for energy. Some peptides like SS-31 target mitochondrial function.' },
      { term: 'NAD+', full: 'Nicotinamide Adenine Dinucleotide', def: 'A coenzyme found in every living cell, essential for converting food into energy and repairing DNA. NAD+ levels decline with age, which has made it a target for longevity research. Plenty of things decline with age — that, by itself, is not a reason to inject one of them.' },
      { term: 'Neuropeptide', full: '', def: 'A peptide that acts as a signaling molecule in the nervous system. Examples include oxytocin, vasopressin, and various opioid peptides. They influence mood, pain, and behavior.' },
      { term: 'Off-label', full: '', def: 'Using an FDA-approved drug for a purpose, population, or dose it was not officially approved for. This is legal and common in medicine — doctors do it all the time — but the evidence base may be thinner.' },
      { term: 'Peptide', full: '', def: 'A short chain of amino acids (the building blocks of proteins), typically 2–50 amino acids long. Shorter than a full protein. Your body produces thousands of natural peptides as hormones and signaling molecules.' },
      { term: 'Phase 1 trial', full: '', def: 'The first stage of testing a drug in humans. Primarily checks safety and dosing in a small group of healthy volunteers (typically 20–80 people). Not designed to prove the drug works.' },
      { term: 'Phase 2 trial', full: '', def: 'Testing effectiveness in a small group of patients (typically 100–300) who actually have the target condition. Also continues to monitor safety. Many drugs fail at this stage.' },
      { term: 'Phase 3 trial', full: '', def: 'Large-scale testing (typically 1,000–3,000+ participants) that can lead to drug approval. These are the big, expensive trials that regulatory agencies require before approving a new drug.' },
      { term: 'Pituitary gland', full: '', def: 'A pea-sized gland at the base of the brain that produces many important hormones, including growth hormone, ACTH, and thyroid-stimulating hormone. Often called the “master gland” of the endocrine system.' },
      { term: 'Placebo', full: '', def: 'An inactive treatment (sugar pill or saline injection) used as a comparison in studies. The “placebo effect” is the real, measurable improvement some people experience from believing they received treatment. It is also why a glowing forum testimonial, on its own, proves almost nothing.' },
      { term: 'Preclinical', full: '', def: 'Research done in animals or lab dishes before any human testing begins. Promising preclinical results are necessary but not sufficient — many compounds that work in mice fail in humans. Roughly 90% fail the jump from mouse to human. The mouse is not a small person.' },
      { term: 'Proteolysis', full: '', def: 'The breakdown of proteins or peptides by enzymes. One reason oral peptides have low bioavailability — stomach enzymes destroy them before they can be absorbed.' },
      { term: 'RCT', full: 'Randomized Controlled Trial', def: 'The gold standard of medical research. Participants are randomly assigned to receive either the treatment or a placebo, reducing bias. Double-blind RCTs are the most reliable study design.' },
      { term: 'Receptor agonist', full: '', def: 'A substance that binds to a cell receptor and activates it, mimicking the natural signal. Semaglutide is a GLP-1 receptor agonist — it activates the same receptor as natural GLP-1.' },
      { term: 'Receptor antagonist', full: '', def: 'A substance that binds to a cell receptor and blocks it, preventing the natural signal. The opposite of an agonist.' },
      { term: 'Reconstitution', full: '', def: 'The process of mixing a lyophilized (freeze-dried) peptide with sterile water to create an injectable solution. Proper reconstitution technique affects peptide stability and dosing accuracy.' },
      { term: 'Secretagogue', full: '', def: 'A substance that triggers the body to release a specific hormone rather than replacing the hormone directly. Growth hormone secretagogues stimulate your own pituitary to produce more GH. Popular because “makes your body do it” sounds gentler than “inject the hormone” — sounds is carrying that sentence.' },
      { term: 'Senescent cells', full: '', def: 'Old, damaged cells that stop dividing but refuse to die. They accumulate with aging and secrete inflammatory signals that damage neighboring cells. Senolytics are drugs designed to clear them. Senolytics look promising in mice; the mice remain mice.' },
      { term: 'Subcutaneous', full: '', def: 'Injected under the skin into the fat layer, not into muscle or veins. This is the most common injection route for peptides. Abbreviated as “subQ” or “SC.”' },
      { term: 'Tachyphylaxis', full: '', def: 'A rapid decrease in response to a drug after repeated doses. Some peptides lose effectiveness if used continuously without breaks, which is why cycling protocols exist.' },
      { term: 'Telomere', full: '', def: 'Protective caps on the ends of chromosomes that shorten each time a cell divides. Shorter telomeres are associated with aging and age-related disease.' },
      { term: 'Telomerase', full: '', def: 'An enzyme that can rebuild telomeres, counteracting their natural shortening. Associated with longevity research, though the relationship between telomerase activity and lifespan is complex. “Lengthens telomeres” and “reverses aging” are not the same sentence, however much marketing would like them to be — and runaway telomerase is also a hallmark of cancer.' },
      { term: 'Thymus', full: '', def: 'A gland behind the breastbone that is critical for immune system development, especially T-cell maturation. It shrinks significantly after puberty. Thymosin peptides are derived from thymus extracts.' },
      { term: 'Vasoconstriction', full: '', def: 'The narrowing of blood vessels, which increases blood pressure. Some peptides can cause vasoconstriction as a side effect.' },
      { term: 'Vasodilation', full: '', def: 'The widening of blood vessels, which decreases blood pressure and increases blood flow. BPC-157 is studied for potential vasodilatory effects.' },
      { term: 'WADA', full: 'World Anti-Doping Agency', def: 'The international organization that decides which substances are banned in sport. Most research peptides, including GH secretagogues and SARMs, are on the WADA prohibited list. A spot on the banned list is a backhanded compliment: enough people think it works to cheat with it, and not enough is known to clear it.' }
    ];

    var container = document.getElementById('glossary-container');
    var letterNav = document.getElementById('letter-nav');
    var searchInput = document.getElementById('glossary-search');
    var searchCount = document.getElementById('search-count');
    var noResults = document.getElementById('no-results');

    // group by first letter
    var grouped = {};
    terms.forEach(function (t) {
      var letter = t.term.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(letter)) letter = '#';
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(t);
    });

    // letter nav (A-Z)
    var allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var activeLetters = Object.keys(grouped);
    allLetters.forEach(function (l) {
      var a = document.createElement('a');
      a.textContent = l;
      a.href = '#letter-' + l;
      if (activeLetters.indexOf(l) === -1) {
        // No glossary terms for this letter — flag as inert. Without
        // aria-disabled and tabindex=-1, screen readers announce these
        // as focusable links that go nowhere.
        a.classList.add('disabled');
        a.removeAttribute('href');
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('tabindex', '-1');
        a.setAttribute('aria-label', l + ' (no terms)');
      }
      letterNav.appendChild(a);
    });

    // term sections
    var sortedLetters = Object.keys(grouped).sort();
    sortedLetters.forEach(function (letter) {
      var section = document.createElement('section');
      section.classList.add('glossary-section');
      section.setAttribute('data-letter', letter);

      var heading = document.createElement('h2');
      heading.classList.add('letter-heading');
      heading.id = 'letter-' + letter;
      heading.textContent = letter;
      section.appendChild(heading);

      // Definition list — proper <dl><dt>term</dt><dd>definition</dd>
      // semantics so screen readers announce term/definition pairs
      // correctly. Keeps the .term-card class on the wrapper so
      // existing styles + search filtering still work.
      var dl = document.createElement('dl');
      dl.classList.add('glossary-dl');
      grouped[letter].forEach(function (t) {
        var card = document.createElement('div');
        card.classList.add('term-card');
        card.setAttribute('data-search', (t.term + ' ' + t.full + ' ' + t.def).toLowerCase());

        var nameEl = document.createElement('dt');
        nameEl.classList.add('term-name');
        if (t.full) {
          nameEl.innerHTML = '<span class="term-abbr">' + escapeHtml(t.term) + '</span><br>' + escapeHtml(t.full);
        } else {
          nameEl.textContent = t.term;
        }

        var defEl = document.createElement('dd');
        defEl.classList.add('term-def');
        defEl.textContent = t.def;

        card.appendChild(nameEl);
        card.appendChild(defEl);
        dl.appendChild(card);
      });
      section.appendChild(dl);

      container.appendChild(section);
    });

    updateCount(terms.length);

    // search
    searchInput.addEventListener('input', function () {
      var query = this.value.trim().toLowerCase();
      var cards = container.querySelectorAll('.term-card');
      var sections = container.querySelectorAll('.glossary-section');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search');
        var match = !query || text.indexOf(query) !== -1;
        card.classList.toggle('hidden', !match);
        if (match) visibleCount++;
      });

      sections.forEach(function (sec) {
        var visibleCards = sec.querySelectorAll('.term-card:not(.hidden)');
        sec.style.display = visibleCards.length === 0 ? 'none' : '';
      });

      var navLinks = letterNav.querySelectorAll('a');
      navLinks.forEach(function (a) {
        var letter = a.textContent;
        var sec = container.querySelector('[data-letter="' + letter + '"]');
        if (sec) {
          var hasVisible = sec.querySelectorAll('.term-card:not(.hidden)').length > 0;
          a.classList.toggle('disabled', !hasVisible);
          if (hasVisible) {
            a.href = '#letter-' + letter;
            a.removeAttribute('aria-disabled');
            a.removeAttribute('tabindex');
          } else {
            a.removeAttribute('href');
            a.setAttribute('aria-disabled', 'true');
            a.setAttribute('tabindex', '-1');
          }
        }
      });

      updateCount(visibleCount);
      noResults.classList.toggle('visible', visibleCount === 0);
    });

    function updateCount(n) {
      if (searchInput.value.trim()) {
        searchCount.textContent = n + ' match' + (n !== 1 ? 'es' : '');
      } else {
        searchCount.textContent = terms.length + ' terms in the glossary';
      }
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }
  })();
