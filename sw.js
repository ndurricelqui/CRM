const CACHE = 'crm-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (e.request.destination === 'document' || url.endsWith('.html')) { e.respondWith(fetch(e.request)); return; }
  if (url.includes('docs.google.com') || url.includes('googleapis.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r && r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
        return r;
      }).catch(() => cached);
    })
  );
});
