/**
 * Private notes — per-entry notes stored in localStorage.
 */

import { escapeHtml } from "../utils.js";

const NOTES_KEY = "peptide-notes";
let userNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");

function saveNotes() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(userNotes));
}

function addNotesFeature() {
  const observer = new MutationObserver(() => {
    const detailBody = document.getElementById("detail-body");
    if (!detailBody || detailBody.querySelector(".user-notes")) return;
    const bookmarkBtn = detailBody.querySelector(".detail__bookmark-btn");
    const entryId = bookmarkBtn?.dataset.entryId;
    if (!entryId) return;

    const section = document.createElement("details");
    section.className = "detail__section user-notes";
    const existing = userNotes[entryId] || "";
    section.innerHTML = `
      <summary><h3>Your private notes</h3></summary>
      <p class="detail__help">Only stored on this device. Never sent anywhere.</p>
      <textarea class="user-notes__input" placeholder="Add your own notes about this compound..." rows="3">${escapeHtml(existing)}</textarea>
      <div class="user-notes__actions">
        <button type="button" class="user-notes__save">Save note</button>
        ${existing ? '<button type="button" class="user-notes__clear">Clear</button>' : ''}
      </div>
    `;

    const disclaimer = detailBody.querySelector(".detail__disclaimer");
    if (disclaimer) detailBody.insertBefore(section, disclaimer);
    else detailBody.appendChild(section);

    const textarea = section.querySelector("textarea");
    const saveBtn = section.querySelector(".user-notes__save");
    const clearBtn = section.querySelector(".user-notes__clear");

    saveBtn.addEventListener("click", () => {
      const val = textarea.value.trim();
      if (val) {
        userNotes[entryId] = val;
      } else {
        delete userNotes[entryId];
      }
      saveNotes();
      updateExportVisibility();
      saveBtn.textContent = "Saved!";
      saveBtn.classList.add("user-notes__save--done");
      setTimeout(() => {
        saveBtn.textContent = "Save note";
        saveBtn.classList.remove("user-notes__save--done");
      }, 1500);
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        textarea.value = "";
        delete userNotes[entryId];
        saveNotes();
        updateExportVisibility();
        clearBtn.remove();
      });
    }
  });

  const dialog = document.getElementById("detail-dialog");
  if (dialog) observer.observe(dialog, { childList: true, subtree: true });
}

let exportBtn = null;

function updateExportVisibility() {
  if (!exportBtn) return;
  const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
  exportBtn.hidden = Object.keys(notes).length === 0;
}

function addExportNotes() {
  const navEnd = document.querySelector(".nav-end");
  if (!navEnd) return;

  exportBtn = document.createElement("button");
  exportBtn.type = "button";
  exportBtn.className = "nav-link";
  exportBtn.textContent = "Export notes";
  exportBtn.title = "Download all your personal notes";
  exportBtn.id = "export-notes";

  const helpBtn = document.getElementById("open-help");
  if (helpBtn) helpBtn.before(exportBtn);
  else navEnd.appendChild(exportBtn);

  updateExportVisibility();

  exportBtn.addEventListener("click", () => {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
    if (Object.keys(notes).length === 0) return;
    let text = "BadgerSkope \u2014 Personal Notes Export\n";
    text += "Exported: " + new Date().toLocaleString() + "\n";
    text += "=".repeat(50) + "\n\n";
    for (const [id, note] of Object.entries(notes)) {
      const card = document.querySelector(`.card[data-entry-id="${CSS.escape(id)}"]`);
      const title = card?.querySelector(".card__title")?.textContent || id;
      text += "## " + title + "\n";
      text += note + "\n\n";
      text += "-".repeat(40) + "\n\n";
    }
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "badgerskope-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  });
}

export function initNotes() {
  addNotesFeature();
  addExportNotes();
}
