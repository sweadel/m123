const CACHE = 'tallo-v101-force-refresh'; // قوة تحديث شاملة لجميع الأجهزة

const ASSETS = [
  'index.html',
  'menu.html',
  'menu-en.html',
  'css/menu-final-v1.css',
  'js/design-sync.js',
  'images/tallo-logo.png',
  'images/header-sadu-final.png',
  'images/header-arch-final.png',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

/* Install */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* Activate */
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

/* Fetch Strategy: Network First for HTML/JS, Native for Media */
self.addEventListener('fetch', function(e) {
  const url = new URL(e.request.url);
  
  // تجاوز نظام الكاش تماماً لملفات الصوت والفيديو لضمان عملها 100%
  if (url.pathname.endsWith('.m4a') || url.pathname.endsWith('.mp4')) {
    return; // اترك المتصفح يتعامل معها بشكل طبيعي
  }

  const isDynamic = url.pathname.endsWith('.html') || url.pathname.includes('js/');

  if (isDynamic) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(res => {
          if (res.status === 200) {
            let clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
  }
});
