/**
 * IWS Learn — Service Worker
 * Stratégie de cache intelligente :
 *   - App shell (HTML/JS/CSS) → Cache First (mise à jour en arrière-plan)
 *   - Images → Cache First (30 jours)
 *   - API calls → Network First (fallback cache 5 min)
 *   - Fonts → Cache Forever
 */

const CACHE_VERSION = 'iws-learn-v1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;
const IMAGE_CACHE   = `${CACHE_VERSION}-images`;

// Ressources à précacher au premier chargement (app shell)
const APP_SHELL = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
];

// ── Installation ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[SW] Precache partiel:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activation (nettoyage des anciens caches) ─────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('iws-learn-') && k !== STATIC_CACHE && k !== API_CACHE && k !== IMAGE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch — Stratégies de cache ───────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les extensions de devtools
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.pathname.startsWith('/__')) return; // Vite HMR

  // ── API calls (Express backend) → Network First ───────────────
  if (url.port === '3001' || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, 5 * 60));
    return;
  }

  // ── Images → Cache First (30 jours) ──────────────────────────
  if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30 * 24 * 60 * 60));
    return;
  }

  // ── Fonts → Cache Forever ─────────────────────────────────────
  if (request.destination === 'font' || url.hostname.includes('fonts.')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 365 * 24 * 60 * 60));
    return;
  }

  // ── Navigation (HTML pages) → Network First + fallback offline ─
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline') || caches.match('/'))
        )
    );
    return;
  }

  // ── Assets (JS/CSS) → Stale While Revalidate ─────────────────
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// ── Helpers ───────────────────────────────────────────────────────

async function cacheFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    const dateHeader = cached.headers.get('sw-cache-date');
    if (dateHeader) {
      const age = (Date.now() - new Date(dateHeader).getTime()) / 1000;
      if (age > maxAgeSeconds) {
        fetchAndCache(request, cache);
      }
    }
    return cached;
  }
  return fetchAndCache(request, cache);
}

async function networkFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.append('sw-cache-date', new Date().toUTCString());
      const body = await response.clone().arrayBuffer();
      const cachedResponse = new Response(body, { status: response.status, statusText: response.statusText, headers });
      cache.put(request, cachedResponse);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ error: 'Hors ligne', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetchAndCache(request, cache).catch(() => null);
  return cached || fetchPromise;
}

async function fetchAndCache(request, cache) {
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    cache.put(request, response.clone());
  }
  return response;
}

// ── Push Notifications (Phase 3) ─────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'IWS Learn', {
      body: data.body || 'Vous avez des cartes à réviser aujourd\'hui !',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: data.tag || 'iws-notification',
      data: { url: data.url || '/dashboard' },
      actions: [
        { action: 'open', title: 'Réviser maintenant' },
        { action: 'dismiss', title: 'Plus tard' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
