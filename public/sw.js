const CACHE_NAME = "site-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./offline.html",
  "./src/pages/tools.html",
  "./src/assets/style.css",
  "./src/assets/main.js",
  "./src/assets/addCategory.js",
  "./src/assets/cota.js",
  "./src/assets/dataMoney.js",
  "./src/assets/transation.js",
  "./src/assets/img/android-chrome-192x192.webp",
  "./src/assets/img/android-chrome-512x512.webp",
  "./manifest.json",
  "./src/assets/img/mobile.webp",
  "./src/assets/img/pc.webp",
  "./src/assets/all.min.css",
  "./src/assets/tools.js",
  "./src/assets/toolsCota.js"
];

const OFFLINE_PAGE = './offline.html';

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto");
      
      return cache.addAll([...urlsToCache, OFFLINE_PAGE]);
    }).catch((error) => {
      console.error("Erro ao adicionar ao cache:", error);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {

  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Se não for uma requisição GET, não faz nada
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {

          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {

          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_PAGE);
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
