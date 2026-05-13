// Cache name MUST be bumped on every code change so the activate
// handler nukes the old cache and forces a fresh download. Without
// this bump, browsers that already registered an older SW version
// keep serving the OLD app.css / detail.js / index.html from disk
// even after a successful Netlify deploy. (Bug observed 2026-04-29:
// users still saw the broken Prev/Next + old modal layout 6+ hours
// after the fix shipped.)
const CACHE_NAME = "badgerskope-v10-network-first";

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
  "/web/src/features/bookmarks-toggle.js",
  "/web/src/features/chips.js",
  "/web/src/features/share.js",
  "/web/src/features/search-enhance.js",
  "/web/src/features/scroll.js",
  "/web/src/features/notes.js",
  "/web/src/features/doping.js",
  "/web/src/features/interactions.js",
  "/web/src/features/sport-filter.js",
  "/web/src/features/experimental-toggle.js",
  "/web/src/features/glossary-tooltips.js",
  "/web/src/features/mobile-filter-sheet.js",
  "/web/badger-180.png",
  "/web/badger-256.png",
];

// JSON data — always try network first
const DATA_URL = "/peptide-info-database.json";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

// Network-first race: resolve to whichever finishes first between a
// real fetch and a 5s "give up" timer. On slow/lossy mobile networks
// (5G hand-off, captive portal, transit tunnel) the unbounded fetch
// could hang the full TCP timeout (~30s on iOS) before the cached
// response surfaced. Racing keeps first-paint snappy.
const NETWORK_TIMEOUT_MS = 5000;

function networkFirstWithTimeout(request) {
  const cachePromise = caches.match(request);
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => cachePromise.then((c) => resolve(c || Response.error())), NETWORK_TIMEOUT_MS);
  });
  const fetchPromise = fetch(request)
    .then((res) => {
      if (res && res.status === 200 && res.type !== "opaque") {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return res;
    })
    .catch(() => cachePromise);
  return Promise.race([fetchPromise, timeoutPromise]).then((r) => r || cachePromise);
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // For the JSON database, try network first; fall back to cache when offline.
  if (
    url.pathname === DATA_URL ||
    url.pathname.endsWith("peptide-info-database.json")
  ) {
    e.respondWith(networkFirstWithTimeout(e.request));
    return;
  }

  // Static app assets: NETWORK-FIRST (with timeout) and cache fallback.
  // Previous cache-first strategy made deploys invisible to returning
  // users; pure network-first hung on slow networks. Race wins both.
  e.respondWith(networkFirstWithTimeout(e.request));
});
