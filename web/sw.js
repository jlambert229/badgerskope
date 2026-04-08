const CACHE_NAME = "badgerskope-v1";
const ASSETS = [
  "/web/",
  "/web/index.html",
  "/web/app.css",
  "/web/app.js",
  "/web/features.css",
  "/web/features.js",
  "/web/logo.png",
  "/web/logo-hero.png",
  "/web/favicon.png",
  "/peptide-info-database.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
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
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
