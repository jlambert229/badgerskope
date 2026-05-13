/* ============================================================
   Marketing-nav hamburger.
   Used on /, /glossary.html, /evidence-guide.html.

   At >700px the nav-links + nav-cta-group render inline as
   usual. At ≤700px both are hidden and a hamburger button toggles
   a sheet that re-exposes them as a vertical stack. The sheet
   markup is rendered ONCE per page (#nav-sheet, .nav-sheet__list)
   below the nav.
   ============================================================ */
(function () {
  'use strict';

  var nav = document.getElementById('site-nav');
  if (!nav) return;

  // Scroll-state toggle (carried over from the original inline blocks
  // that lived on every marketing page).
  var onScroll = function () {
    nav.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger + sheet.
  var toggle = document.getElementById('nav-toggle');
  var sheet  = document.getElementById('nav-sheet');
  if (!toggle || !sheet) return;

  var setOpen = function (open) {
    document.body.classList.toggle('is-nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    sheet.setAttribute('aria-hidden', String(!open));
    if (open) {
      var firstLink = sheet.querySelector('a, button');
      if (firstLink) firstLink.focus({ preventScroll: true });
    } else {
      toggle.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', function () {
    setOpen(!document.body.classList.contains('is-nav-open'));
  });

  // Close on link tap, on Escape, on outside click, on resize-above-700.
  sheet.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('is-nav-open')) {
      setOpen(false);
    }
  });
  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('is-nav-open')) return;
    if (e.target.closest('#nav-sheet') || e.target.closest('#nav-toggle')) return;
    setOpen(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 700 && document.body.classList.contains('is-nav-open')) {
      setOpen(false);
    }
  }, { passive: true });
})();
