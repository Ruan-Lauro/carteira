const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  '/src/pages/tools.html',
  '/src/pages/indexteste.html',
  "/src/assets/css/style.css",
  "/app.js",
  '/src/assets/js/addCategory.js',
  '/src/assets/js/cota.js',
  '/src/assets/js/dataMoney.js',
  '/src/assets/js/main.js',
  '/src/assets/js/transation.js'
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
