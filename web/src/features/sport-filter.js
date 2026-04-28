/**
 * Sport ban filter toggle.
 * Adds a checkbox to the browse toolbar that hides WADA-banned compounds.
 */

const WADA_KEYWORDS = [
  "BPC-157", "TB-500", "Ipamorelin", "Sermorelin", "CJC-1295",
  "GHRP", "SomatoPulse", "Tesa", "MT-II", "SLU-PP-332", "FOXO4-DRI",
];

const STORAGE_KEY = "bs_hide_banned";

export function initSportFilter() {
  const slot = document.getElementById("filter-strip-sport")
    || document.querySelector(".filter-strip__meta");
  if (!slot) return;

  const wrap = document.createElement("label");
  wrap.className = "sport-filter";
  wrap.innerHTML = `
    <input type="checkbox" class="sport-filter__cb" />
    <span class="sport-filter__label">HIDE SPORT-BANNED</span>
  `;

  slot.appendChild(wrap);

  const cb = wrap.querySelector(".sport-filter__cb");
  const grid = document.getElementById("grid");

  if (localStorage.getItem(STORAGE_KEY) === "1") {
    cb.checked = true;
    if (grid) grid.classList.add("grid--hide-banned");
  }

  cb.addEventListener("change", () => {
    if (!grid) return;
    grid.classList.toggle("grid--hide-banned", cb.checked);
    localStorage.setItem(STORAGE_KEY, cb.checked ? "1" : "0");
  });

  // Mark banned cards when grid updates
  const markBanned = () => {
    document.querySelectorAll(".card").forEach(card => {
      const title = card.querySelector(".card__title")?.textContent || "";
      const isBanned = WADA_KEYWORDS.some(k => title.includes(k));
      card.classList.toggle("card--sport-banned", isBanned);
    });
  };

  if (grid) {
    const obs = new MutationObserver(markBanned);
    obs.observe(grid, { childList: true });
    markBanned();
  }
}
