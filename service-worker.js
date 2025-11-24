// service-worker.js — Fatigue RCF (GitHub Pages + offline)
const CACHE_NAME = "fatigue-rcf-v3"; // change ce numéro à chaque maj

const ASSETS = [
  "./",                    // racine du site
  "./index.html",          // page d’accueil (à créer comme je t’ai dit)
  "./Test_fatigue_RPE.html",
  "./manifest.webmanifest",
  "./logo_rcf.png",
  "./icon-192.png",
  "./icon-512.png"
];

// 1) INSTALL : on met en cache les fichiers vitaux
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 2) ACTIVATE : on nettoie les anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// 3) FETCH : stratégie "cache d’abord, réseau ensuite"
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // On ignore les requêtes non GET (POST vers Google Sheets)
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // On cache au passage pour la prochaine fois offline
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          // Si offline et pas en cache : on renvoie l'accueil
          if (req.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
