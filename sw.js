const CACHE = 'mahjong-v6';
const ASSETS = ['./index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

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
  const isNav = e.request.mode === 'navigate';
  if (isNav) {
    /* index.html: ネットワーク優先 → オフライン時はキャッシュで代替 */
    e.respondWith(
      fetch(e.request)
        .then(r => {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        /* start_url "./" 等キー不一致でも必ずプリキャッシュ済み index.html に落とす（オフライン白画面防止） */
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
  } else {
    /* アイコン等: キャッシュ優先 */
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
