/**
 * First-run orientation banner.
 * Shows a brief welcome note for new visitors, dismissible via localStorage.
 */

const STORAGE_KEY = "bs_orientation_dismissed";

export function initOrientation() {
  if (localStorage.getItem(STORAGE_KEY)) return;

  const searchZone = document.querySelector(".lib-search");
  if (!searchZone) return;

  const banner = document.createElement("div");
  banner.className = "orientation-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Welcome guide");
  banner.innerHTML = `
    <div class="orientation-banner__body">
      <strong class="orientation-banner__title">New here? Here's the idea.</strong>
      <p class="orientation-banner__text">
        BadgerSkope is a free research library that summarizes what science actually says about peptides.
        Every entry shows how strong the evidence is, so you can tell hype from hard data.
        Tap a goal below to start browsing, or search for something specific.
      </p>
    </div>
    <button type="button" class="orientation-banner__dismiss" aria-label="Dismiss welcome guide">Got it</button>
  `;

  searchZone.after(banner);

  banner.querySelector(".orientation-banner__dismiss").addEventListener("click", () => {
    banner.remove();
    localStorage.setItem(STORAGE_KEY, "1");
  });
}
