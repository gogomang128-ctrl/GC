

const CACHE_NAME = "gamestore-cache-v4";

const PRECACHE = [
  "/index.html",
  "/style.css",
  "/images.js",
  "/data.js",
  "/firebase-config.js",
  "/auth.js",
  "/state.js",
  "/shell.js",
  "/home.js",
  "/product.js",
  "/cart.js",
  "/main.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-512-maskable.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
  "/logo.jpg",
  "/og-image.jpg",
  "/intro.css",
  "/intro.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match("/index.html")))
  );
});
