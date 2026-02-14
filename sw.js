
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// O Workbox injetará o manifesto aqui durante o build (self.__WB_MANIFEST)
precacheAndRoute(self.__WB_MANIFEST || []);

cleanupOutdatedCaches();

const CACHE_NAME = 'iblind-pro-v2';

self.addEventListener('install', (e) => {
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
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Ignora requisições para extensões do Chrome ou esquemas não-http
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).then(networkResponse => {
        // Só faz cache de requisições GET bem sucedidas
        if (e.request.method === 'GET' && networkResponse.status === 200) {
           const cacheCopy = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(e.request, cacheCopy));
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback offline se necessário
    })
  );
});

// Listener para forçar atualização do SW quando solicitado pelo app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
