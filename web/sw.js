// Cache name MUST be bumped on every code change so the activate
// handler nukes the old cache and forces a fresh download. Without
// this bump, browsers that already registered an older SW version
// keep serving the OLD app.css / detail.js / index.html from disk
// even after a successful Netlify deploy. (Bug observed 2026-04-29:
// users still saw the broken Prev/Next + old modal layout 6+ hours
// after the fix shipped.)
const CACHE_NAME = "badgerskope-v13-swr";

const STATIC_ASSETS = [
  "/web/",
  "/web/index.html",
  "/web/boot.js",
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
  "/web/src/stats.js",
  "/web/src/tabs.js",
  "/web/src/router.js",
  "/web/src/keyboard.js",
  "/web/src/features/bookmarks-toggle.js",
  "/web/src/features/chips.js",
  "/web/src/features/share.js",
  "/web/src/features/search-enhance.js",
  "/web/src/features/scroll.js",
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

// Stale-while-revalidate: serve cached immediately (zero-latency
// first paint on repeat visits), kick off a network revalidation in
// the background, update the cache for next time. Same UX on slow
// networks as on fast — first byte is always instant.
//
// Why not pure cache-first? Returning users would be stuck on the
// old code until a manual clear. Why not the old network-first race?
// Even with a 5 s race, the user sat on first-paint for up to 5 s on
// a slow connection. SWR is the iOS-PWA-native pattern for static
// reference content like this. The trade-off is one stale render on
// each deploy; cache version bumps shorten that window.
function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then((cache) => {
    return cache.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type !== "opaque") {
            cache.put(request, res.clone());
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    });
  });
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Only handle same-origin GETs. Cross-origin (Google Fonts) and
  // non-GET requests fall through to the network without interception.
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(staleWhileRevalidate(e.request));
});
