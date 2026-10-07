/* Service worker dell'app installabile.
 * - File dell'app con nome "hash" (_expo/static/...) e lettore dei documenti (/ocr/): dalla cache, non cambiano mai.
 * - Pagine: sempre dalla rete (dati freschi); senza rete si mostra l'ultima versione salvata.
 * - Tutto il resto (Supabase, YouTube…) non passa di qui.
 */
const CACHE = 'eazygo-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((chiavi) => Promise.all(chiavi.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.includes('/_expo/static/') || url.pathname.includes('/icone/') || (url.pathname.includes('/ocr/') && !url.pathname.endsWith('versione.json'))) {
    e.respondWith(
      caches.match(req).then(
        (salvata) =>
          salvata ||
          fetch(req).then((r) => {
            if (r.ok) {
              const copia = r.clone();
              caches.open(CACHE).then((c) => c.put(req, copia));
            }
            return r;
          }),
      ),
    );
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone();
          caches.open(CACHE).then((c) => c.put('pagina', copia));
          return r;
        })
        .catch(() => caches.match('pagina').then((r) => r || Response.error())),
    );
  }
});
