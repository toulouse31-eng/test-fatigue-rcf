// service-worker.js — Fatigue RCF (GitHub Pages + offline)
const CACHE_NAME = "fatigue-rcf-v3"; // change ce numéro à chaque maj

const ASSETS = [
  "./",
  "./index.html",
  "./Test_fatigue_RPE.html",
  "./manifest.webmanifest",
  "./logo_rcf.png",
  "./icon-192.png",
  "./icon-512.png"
];

// 1) INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 2) ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// 3) FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          if (req.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
