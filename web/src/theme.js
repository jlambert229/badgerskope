/**
 * Theme — dark only. The brand identity does not have a light variant.
 * Kept as a no-op so any saved "peptide-theme=light" doesn't try to flip.
 */

export function loadTheme() {
  document.documentElement.removeAttribute("data-theme");
  try { localStorage.removeItem("peptide-theme"); } catch (_) {}
}

export function toggleTheme() { /* no-op */ }
