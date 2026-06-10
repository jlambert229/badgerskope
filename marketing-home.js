  // Nav scroll-state + mobile hamburger sheet live in marketing-nav.js
  // (loaded in <head>). The remainder of this block handles homepage-
  // only behaviors (redaction, ticker, library mini-list, FAQ, sub).

  // ===========================================================
  // Redaction theater — auto-redact hype phrases on scroll-in.
  // Hover still works regardless. IntersectionObserver toggles
  // .is-redacted as each `.redact` element scrolls into view, so
  // visitors who never hover still get the bar reveal once.
  // ===========================================================
  const redactTargets = document.querySelectorAll('.redact');
  if (redactTargets.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger by index so the bars sweep in sequence within
          // the same paragraph rather than all at once.
          const idx = Array.from(redactTargets).indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('is-redacted'),
                     Math.min(idx, 8) * 90);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });
    redactTargets.forEach((el) => io.observe(el));
  }
  // Tap-to-toggle for touch devices (hover doesn't fire on tap; the
  // scroll-in reveal only triggers once per page load). Clicking a
  // bar removes the .is-redacted class to reveal the phrase, or
  // re-adds it to re-redact.
  redactTargets.forEach((el) => {
    el.addEventListener('click', () => el.classList.toggle('is-redacted'));
  });

  // ===========================================================
  // Ticker — 12 items duplicated for seamless loop
  // ===========================================================
  const tickerItems = [
    'BPC-157 · TIER B · 2 HUMAN TRIALS REGISTERED',
    'TB-500 · TIER C · ANIMAL DATA ONLY',
    'RETATRUTIDE · TIER A · PHASE 3 ACTIVE',
    'GHK-CU · TIER B · TOPICAL EVIDENCE STRONG',
    'MOTS-C · TIER D · MOSTLY VENDOR HYPE',
    'EPITHALON · TIER F · SLOP DETECTED',
    'TIRZEPATIDE · TIER A · FDA APPROVED 2022',
    'SEMAGLUTIDE · TIER A · LONG-TERM RCTS',
    'SS-31 · TIER C · EARLY PHASE 2',
    'DSIP · TIER D · INSUFFICIENT DATA',
    'CJC-1295 · TIER C · OFF-LABEL POPULAR',
    'IPAMORELIN · TIER C · LIMITED HUMAN'
  ];
  const track = document.getElementById('ticker-track');
  if (track) {
    const fragment = document.createDocumentFragment();
    [...tickerItems, ...tickerItems].forEach(text => {
      const span = document.createElement('span');
      span.className = 'ticker-item';
      span.innerHTML = `<span class="ticker-mark">▮</span>${text}`;
      fragment.appendChild(span);
    });
    track.appendChild(fragment);
  }

  // ===========================================================
  // Library — filter rows by evidence grade
  // ===========================================================
  // `slug` matches the catalog.title in peptide-info-database.json so each
  // row deep-links into /web/#entry=<slug> for the actual library entry.
  const files = [
    { name: 'RETATRUTIDE',  slug: '3G-RT',     aka: 'Lab name: LY3437943',     e: 'A', s: 'B', a: 'C', n: 2148, claim: 'New weight-loss drug in late-stage human trials.',                       filed: '26 APR 26' },
    { name: 'TIRZEPATIDE',  slug: '2G-TZ',     aka: 'Sold as Mounjaro',        e: 'A', s: 'A', a: 'A', n: 6420, claim: 'FDA-approved weight-loss + diabetes drug. Long-term human data.',         filed: '21 APR 26' },
    { name: 'BPC-157',      slug: 'BPC-157',   aka: 'Lab name: PL 14736',      e: 'B', s: 'B', a: 'B', n: 217,  claim: 'Tendon and gut healer. Strong animal evidence, thin human evidence.',    filed: '18 APR 26' },
    { name: 'GHK-CU',       slug: 'GHK-Cu',    aka: 'Copper tripeptide',       e: 'B', s: 'A', a: 'A', n: 380,  claim: 'Skin and wound healing. Solid as a topical, weaker as an injection.',    filed: '14 APR 26' },
    { name: 'MOTS-C',       slug: 'MOTS-c',    aka: 'Mitochondrial peptide',   e: 'C', s: 'C', a: 'D', n: 24,   claim: 'Marketed for energy and metabolism. Animal-only data, lots of hype.',    filed: '11 APR 26' },
    { name: 'TB-500',       slug: 'TB-500',    aka: 'Thymosin-β4 fragment',    e: 'C', s: 'C', a: 'C', n: 0,    claim: 'Sold for athletic recovery. Popular in horse racing. No human trials.',  filed: '08 APR 26' },
    { name: 'EPITHALON',    slug: 'Epithalon', aka: 'Russian anti-aging peptide', e: 'F', s: 'D', a: 'B', n: 0, claim: 'Sold as an anti-aging compound. Claims far outrun the evidence.',         filed: '03 APR 26' },
    { name: 'DSIP',         slug: 'DSIP',      aka: 'Delta sleep peptide',     e: 'D', s: 'C', a: 'C', n: 33,   claim: 'Sold for sleep. 1970s research, never replicated at scale.',             filed: '29 MAR 26' }
  ];
  const rowsEl = document.getElementById('library-rows');
  const countEl = document.getElementById('library-count');
  // Rows are built with innerHTML from the hardcoded files[] above; escape
  // anyway so a future switch to JSON-driven data can't introduce injection.
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
  // Tier-letter expansion for screen readers — without an aria-label,
  // the badges read as bare letters ("A B C") with no semantic meaning.
  const TIER_NAMES = { A: 'Gold standard', B: 'Promising', C: 'Suggestive', D: 'Weak / dated', F: 'Slop' };
  const tierChip = (g, axis) =>
    `<span class="tier" data-grade="${esc(g)}" aria-label="${esc(axis)}: tier ${esc(g)}, ${esc(TIER_NAMES[g] || '')}"><span class="tier-letter" aria-hidden="true">${esc(g)}</span></span>`;
  const renderLibrary = (filter) => {
    const visible = filter === 'ALL' ? files : files.filter(f => f.e === filter);
    // One tier chip per row instead of three (Evidence + Safety +
    // Access). Three chips × eight rows = a rainbow strip that
    // visually dominates the preview without adding information the
    // user can't already infer from the summary. The full breakdown
    // lives one tap away in the SPA. The evidence tier is the most
    // load-bearing single signal.
    rowsEl.innerHTML = visible.map(f => `
      <a class="library-row" href="/web/#entry=${encodeURIComponent(f.slug)}" aria-label="${esc(f.name)}, evidence tier ${esc(f.e)}">
        <div class="lib-name">
          <div class="lib-name-main">${esc(f.name)}</div>
          <div class="lib-name-aka">${esc(f.aka)}</div>
        </div>
        <div>${tierChip(f.e, 'Evidence')}</div>
        <div class="mono">${f.n.toLocaleString()}</div>
        <div class="lib-claim">${esc(f.claim)}</div>
        <div class="mono lib-filed">${esc(f.filed)}</div>
        <div class="lib-arrow" aria-hidden="true">→</div>
      </a>
    `).join('');
    // Total count must match peptide-info-database.json meta.entryCount.
    countEl.textContent = `Showing ${visible.length} of 63 files`;
  };
  renderLibrary('ALL');
  document.querySelectorAll('.library-filter .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.library-filter .chip').forEach(c => {
        c.classList.toggle('is-on', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      renderLibrary(chip.dataset.filter);
    });
  });

  // ===========================================================
  // FAQ — single-open accordion
  // ===========================================================
  const faqList = document.getElementById('faq-list');
  if (faqList) {
    faqList.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-q');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('is-open');
      faqList.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('is-open');
        const b = i.querySelector('.faq-q');
        const t = i.querySelector('.faq-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
        if (t) t.textContent = '+';
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        const t = item.querySelector('.faq-toggle');
        if (t) t.textContent = '−';
      }
    });
  }

  // ===========================================================
  // Subscribe — replace form with success state, or show error
  // ===========================================================
  const form = document.getElementById('sub-form');
  if (form) {
    const input = document.getElementById('sub-email');
    let errEl = null;
    let flashTimer = null;
    const clearError = () => {
      input.removeAttribute('aria-invalid');
      input.classList.remove('is-invalid');
      if (errEl) { errEl.remove(); errEl = null; }
      if (flashTimer) { clearTimeout(flashTimer); flashTimer = null; }
    };
    input.addEventListener('input', clearError);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !/.+@.+\..+/.test(email)) {
        input.setAttribute('aria-invalid', 'true');
        input.classList.add('is-invalid');
        if (!errEl) {
          errEl = document.createElement('div');
          errEl.className = 'sub-err';
          errEl.setAttribute('role', 'alert');
          errEl.textContent = 'Please enter a valid email.';
          form.insertAdjacentElement('afterend', errEl);
        }
        if (flashTimer) clearTimeout(flashTimer);
        flashTimer = setTimeout(() => {
          input.classList.remove('is-invalid');
          flashTimer = null;
        }, 600);
        return;
      }

      // AJAX submit to Netlify Forms. The deployed site picks up the
      // form-name during the post-deploy form-detection scan. Only show
      // the success state when the POST actually succeeded — a silent
      // failure here means the visitor thinks they subscribed when the
      // submission was lost.
      const body = new URLSearchParams(new FormData(form)).toString();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      const showSubmitError = () => {
        if (submitBtn) submitBtn.disabled = false;
        if (!errEl) {
          errEl = document.createElement('div');
          errEl.className = 'sub-err';
          errEl.setAttribute('role', 'alert');
          form.insertAdjacentElement('afterend', errEl);
        }
        errEl.textContent = "Something went wrong — your email wasn't saved. Please try again.";
      };
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
        .then((res) => {
          if (!res.ok) {
            showSubmitError();
            return;
          }
          const ok = document.createElement('div');
          ok.className = 'sub-ok';
          ok.textContent = "✓ You're on the list. Check your inbox in a few minutes.";
          if (errEl) { errEl.remove(); errEl = null; }
          form.replaceWith(ok);
        })
        .catch(showSubmitError);
    });
  }
