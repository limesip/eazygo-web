/* Su www.eazygo.it prima c'era l'app installabile con il suo service worker.
 * Questo lo sostituisce: svuota la cache, si disinstalla e ricarica le pagine aperte,
 * così chi aveva già visitato www.eazygo.it vede il sito della società e non una vecchia copia dell'app. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) await caches.delete(k);
      await self.registration.unregister();
      for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url);
    })(),
  );
});
