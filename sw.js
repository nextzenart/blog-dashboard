const CACHE = 'blog-dash-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

// Periodic badge update via message from client
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SET_BADGE') {
    const count = e.data.count || 0;
    if (navigator.setAppBadge) {
      if (count > 0) navigator.setAppBadge(count);
      else navigator.clearAppBadge();
    }
  }
});
