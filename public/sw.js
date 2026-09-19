const STATIC_CACHE = 'pokedexter-static-v2';
const DATA_CACHE = 'pokedexter-data-v2';

const STATIC_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.webmanifest',
    '/icon.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable-192.png',
    '/icons/icon-maskable-512.png',
];

// Install: Pre-cache core app shell assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate: Clean up previous cache versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DATA_CACHE)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only process GET requests and HTTP/HTTPS schemes
    if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
        return;
    }

    // 1. Navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(DATA_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }

                    return networkResponse;
                })
                .catch(async () => {
                    const cachedResponse = await caches.match(request);

                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return caches.match('/offline.html');
                })
        );

        return;
    }

    // 2. PokéAPI requests & Pokémon sprite images (Option B: cache-as-you-browse)
    const isPokeApi = url.hostname === 'pokeapi.co' || url.hostname.endsWith('.pokeapi.co');
    const isPokemonImage =
        url.hostname === 'raw.githubusercontent.com' ||
        (url.pathname.match(/\.(png|jpg|jpeg|svg|webp)$/i) && !url.pathname.startsWith('/_next'));

    if (isPokeApi || isPokemonImage) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(DATA_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }

                    return networkResponse;
                })
                .catch(async () => {
                    const cachedResponse = await caches.match(request);

                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    if (isPokeApi) {
                        return new Response(
                            JSON.stringify({
                                error: 'offline',
                                message: 'You are currently offline and this data has not been cached yet.',
                            }),
                            {
                                status: 503,
                                headers: { 'Content-Type': 'application/json' },
                            }
                        );
                    }

                    return new Response('', { status: 408, statusText: 'Offline' });
                })
        );

        return;
    }

    // 3. Static assets: Cache-first with network fallback
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((networkResponse) => {
                if (
                    networkResponse &&
                    networkResponse.status === 200 &&
                    (url.origin === self.location.origin || url.hostname === 'fonts.gstatic.com')
                ) {
                    const responseToCache = networkResponse.clone();
                    caches.open(STATIC_CACHE).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }

                return networkResponse;
            });
        })
    );
});
