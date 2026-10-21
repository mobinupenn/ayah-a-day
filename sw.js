// Ayah a Day offline support: the app shell is cached so it opens without internet.
const CACHE = "ayah-a-day-v7";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "fonts/amiri-quran-arabic-400-normal.woff2", "fonts/amiri-quran-latin-400-normal.woff2",
  "fonts/spectral-latin-400-normal.woff2", "fonts/spectral-latin-400-italic.woff2", "fonts/spectral-latin-600-normal.woff2",
  "fonts/outfit-latin-400-normal.woff2", "fonts/outfit-latin-500-normal.woff2", "fonts/outfit-latin-600-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Fonts never change: serve from the cache first
  if (url.pathname.includes("/fonts/")) { e.respondWith(caches.match(req).then(m => m || fetch(req))); return; }
  // App files: network first so updates arrive, cache when offline
  e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
    .catch(() => caches.match(req).then(m => m || caches.match("index.html"))));
});
