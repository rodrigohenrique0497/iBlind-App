
const CACHE_NAME = 'iblind-pro-v2';
const ASSETS = [
  './',
  './index.html',
  './index.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;800&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(ASSETS.map(asset => cache.add(asset)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).then(networkResponse => {
        if (e.request.url.startsWith('http')) {
           const cacheCopy = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(e.request, cacheCopy));
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback can be added here
    })
  );
});
