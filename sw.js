/* Scheda 118 — service worker: rende l'app installabile e utilizzabile senza rete.
   Conserva solo i file dell'app e dei libri (mai dati dei pazienti). L'app prova prima la rete, così gli aggiornamenti su GitHub arrivano subito;
   le pagine dei libri (algoritmi e PEDICards) vengono salvate una volta e poi lette dalla cache. */
const CACHE = 'scheda118-v13', BOOKS = 'scheda118-libri-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/icon-180.png'];
const LIBRI = ["./libri/algoritmi/01.jpg", "./libri/algoritmi/02.jpg", "./libri/algoritmi/03.jpg", "./libri/algoritmi/04.jpg", "./libri/algoritmi/05.jpg", "./libri/algoritmi/06.jpg", "./libri/algoritmi/07.jpg", "./libri/algoritmi/08.jpg", "./libri/pedicards/01.jpg", "./libri/pedicards/02.jpg", "./libri/pedicards/03.jpg", "./libri/pedicards/04.jpg", "./libri/pedicards/05.jpg", "./libri/pedicards/06.jpg", "./libri/pedicards/07.jpg", "./libri/pedicards/08.jpg", "./libri/pedicards/09.jpg", "./libri/pedicards/10.jpg", "./libri/pedicards/11.jpg", "./libri/pedicards/12.jpg", "./libri/pedicards/13.jpg", "./libri/pedicards/14.jpg", "./libri/pedicards/15.jpg", "./libri/pedicards/16.jpg", "./libri/pedicards/17.jpg", "./libri/pedicards/18.jpg", "./libri/pedicards/19.jpg", "./libri/pedicards/20.jpg", "./libri/pedicards/21.jpg", "./libri/pedicards/22.jpg", "./libri/pedicards/23.jpg", "./libri/pedicards/24.jpg", "./libri/pedicards/25.jpg", "./libri/pedicards/26.jpg"];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {})); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== BOOKS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
  // i libri si scaricano in sottofondo, così funzionano anche senza rete
  caches.open(BOOKS).then(async c => { for (const u of LIBRI) { try { if (!(await c.match(u))) await c.add(u); } catch (_) {} } });
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  if (u.pathname.includes('/libri/')) {
    e.respondWith(caches.open(BOOKS).then(c => c.match(r).then(m => m || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }))));
    return;
  }
  e.respondWith(
    fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
  );
});
