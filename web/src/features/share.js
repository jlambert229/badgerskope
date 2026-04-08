/**
 * Share and print buttons in the detail modal.
 */

import { escapeHtml } from "../utils.js";

export function initShare() {
  addShareButton();
  addPrintButton();
}

function addShareButton() {
  const observer = new MutationObserver(() => {
    const detailBody = document.getElementById("detail-body");
    if (!detailBody) return;
    const title = detailBody.querySelector(".detail__title");
    if (!title || detailBody.querySelector(".share-btn")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "share-btn";
    btn.textContent = "Copy link";
    btn.title = "Copy shareable link to this entry";
    btn.addEventListener("click", () => {
      const url = window.location.origin + window.location.pathname + "#entry=" + encodeURIComponent(title.textContent);
      function done() {
        btn.textContent = "Copied!";
        btn.classList.add("share-btn--done");
        setTimeout(() => { btn.textContent = "Copy link"; btn.classList.remove("share-btn--done"); }, 2000);
      }
      function fallback(u) {
        prompt("Copy this link:", u);
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(done).catch(() => fallback(url));
      } else {
        fallback(url);
      }
    });

    const actions = detailBody.querySelector(".detail__answer-actions");
    if (actions) actions.appendChild(btn);
    else title.after(btn);
  });

  const dialog = document.getElementById("detail-dialog");
  if (dialog) observer.observe(dialog, { childList: true, subtree: true });
}

function addPrintButton() {
  const observer = new MutationObserver(() => {
    const detailBody = document.getElementById("detail-body");
    if (!detailBody || detailBody.querySelector(".print-btn")) return;
    const header = detailBody.querySelector(".detail__answer-actions") || detailBody.querySelector(".detail__header");
    if (!header) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "print-btn";
    btn.textContent = "Print";
    btn.title = "Print this entry";
    btn.addEventListener("click", () => {
      window.print();
    });
    header.appendChild(btn);
  });

  const dialog = document.getElementById("detail-dialog");
  if (dialog) observer.observe(dialog, { childList: true, subtree: true });
}
