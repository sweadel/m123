/* ═══════════════════════════════════════════
   sw.js — Tallo Ahbabna Service Worker
   Caches all menu assets for offline use
   ═══════════════════════════════════════════ */

const CACHE = 'tallo-v4';

const ASSETS = [
  'menu.html',
  'menu-en.html',
  'css/menu.css',
  'images/tallo-logo.png',
  'images/sadu-pattern.jpg',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap'
];

/* Install — cache everything */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* Activate — clean old caches */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* Fetch — serve from cache, fall back to network */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        /* Avoid caching Admin panel or JS folder to prevent stale versions */
        const url = new URL(e.request.url);
        if (e.request.method === 'GET' && 
            response.status === 200 && 
            !url.pathname.includes('admin.html') && 
            !url.pathname.includes('js/admin.js')) {
          var clone = response.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return response;
      });
    }).catch(function() {
      /* Offline fallback */
      if (e.request.destination === 'document') {
        return caches.match('/menu.html');
      }
    })
  );
});
