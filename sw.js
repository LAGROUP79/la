const BAN = 'la-v1';
const VO = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(BAN).then(c => c.addAll(VO)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== BAN).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const tinh = u => /^https:\/\/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//.test(u) || /\.(png|webmanifest|woff2?)(\?|$)/.test(u);
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = r.url;
  if (r.mode === 'navigate' || (u.startsWith(self.location.origin) && /\.html(\?|$)|\/(\?|$)/.test(u))) {
    e.respondWith(new Promise(ok => {
      let xong = false;
      const cu = () => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match('./index.html'));
      const hen = setTimeout(() => cu().then(x => { if (x && !xong) { xong = true; ok(x); } }), 4000);
      fetch(r).then(res => {
        if (res.ok) { const b = res.clone(); caches.open(BAN).then(c => c.put(r, b)); }
        if (!xong) { xong = true; clearTimeout(hen); ok(res); }
      }).catch(() => cu().then(x => { if (!xong) { xong = true; clearTimeout(hen); ok(x || new Response('<meta charset="utf-8"><p style="font:16px sans-serif;padding:24px">Mất mạng — kết nối lại rồi mở app LA.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })); } }));
    }));
    return;
  }
  if (tinh(u)) {
    e.respondWith(caches.open(BAN).then(c => c.match(r).then(x => {
      const moi = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => x);
      return x || moi;
    })));
  }
});
