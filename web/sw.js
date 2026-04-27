const CACHE_NAME = "badgerskope-v6";
const STATIC_ASSETS = [
  "/web/",
  "/web/index.html",
  "/web/app.css",
  "/web/features.css",
  "/web/src/main.js",
  "/web/src/constants.js",
  "/web/src/utils.js",
  "/web/src/state.js",
  "/web/src/dom.js",
  "/web/src/bookmarks.js",
  "/web/src/theme.js",
  "/web/src/filters.js",
  "/web/src/groups.js",
  "/web/src/selection.js",
  "/web/src/cards.js",
  "/web/src/detail.js",
  "/web/src/compare.js",
  "/web/src/stats.js",
  "/web/src/tabs.js",
  "/web/src/router.js",
  "/web/src/keyboard.js",
  "/web/src/features/recent.js",
  "/web/src/features/bookmarks-toggle.js",
  "/web/src/features/chips.js",
  "/web/src/features/share.js",
  "/web/src/features/search-enhance.js",
  "/web/src/features/goals.js",
  "/web/src/features/scroll.js",
  "/web/src/features/notes.js",
  "/web/src/features/doping.js",
  "/web/src/features/interactions.js",
  "/web/src/features/orientation.js",
  "/web/src/features/start-here.js",
  "/web/src/features/sport-filter.js",
  "/web/src/features/experimental-toggle.js",
  "/web/logo.png",
  "/web/logo-hero.png",
  "/web/favicon.png",
];

// JSON data — always try network first
const DATA_URL = "/peptide-info-database.json";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // For the JSON database, always try network first (stale-while-revalidate)
  if (url.pathname === DATA_URL || url.pathname.endsWith("peptide-info-database.json")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // For static assets, try cache first then network
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      });
      return cached || fetched;
    })
  );
});
