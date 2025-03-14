const CACHE_NAME = "site-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/src/pages/tools.html",
  "/src/assets/css/style.css",
  "/src/assets/js/main.js",
  "/src/assets/js/addCategory.js",
  "/src/assets/js/cota.js",
  "/src/assets/js/dataMoney.js",
  "/src/assets/js/transation.js",
  "/src/assets/img/android-chrome-192x192.png",
  "/src/assets/img/android-chrome-512x512.png",
  "/manifest.json",
  "/src/assets/img/mobile.png",
  "/src/assets/img/pc.png",
  "/offline.html"
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