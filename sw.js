// ── Service Worker – الكتلة الحجمية للسوائل – PhysicLabDZ ──
const CACHE_NAME = 'density-v1';

// الملفات اللي نخزنها للعمل offline
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// ── تثبيت: نخزن الملفات ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ── تفعيل: نحذف الكاش القديم ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── طلبات الشبكة: cache-first ──
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // نخزن فقط الردود الصحيحة
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        // إذا فشل الاتصال نرجع index.html
        return caches.match('./index.html');
      });
    })
  );
});
