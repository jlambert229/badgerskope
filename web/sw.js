const CACHE_NAME = "badgerskope-v2";
const STATIC_ASSETS = [
  "/web/",
  "/web/index.html",
  "/web/app.css",
  "/web/app.js",
  "/web/features.css",
  "/web/features.js",
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
