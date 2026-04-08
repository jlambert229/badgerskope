/**
 * Light/dark theme toggle (localStorage-backed).
 */

export function loadTheme() {
  const saved = localStorage.getItem("peptide-theme");
  if (saved === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

export function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("peptide-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("peptide-theme", "light");
  }
}
