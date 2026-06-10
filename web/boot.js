// Non-module bootstrap for the library SPA. Lives in its own file (rather
// than an inline <script> block) so the site CSP can drop 'unsafe-inline'
// from script-src.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
// Mobile HELP mirror inside .nav-tabs forwards to the primary #open-help
// button so the existing handler in src/main.js wires it for free.
(function () {
  var mobileHelp = document.getElementById("open-help-mobile");
  var primaryHelp = document.getElementById("open-help");
  if (mobileHelp && primaryHelp) {
    mobileHelp.addEventListener("click", function () { primaryHelp.click(); });
  }
})();
