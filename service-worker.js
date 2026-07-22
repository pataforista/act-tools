const CACHE_NAME = 'act-clinical-v3';
const ASSETS = [
    './',
    './index.html',
    './styles/main.css',
    './app.js',
    './manifest.json',
    './vendor/anime.min.js',
    './vendor/lucide.min.js',
    './core/state.js',
    './core/audio.js',
    './core/animations.js',
    './core/security.js',
    './data/config.js',
    './ui/utils.js',
    './ui/dashboard.js',
    './modules/hexaflex.js',
    './modules/abrirse.js',
    './modules/presente.js',
    './modules/importa.js',
    './modules/analisis.js',
    './modules/resumen.js',
    './modules/sos.js',
    './modules/estres.js',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME && key !== 'google-fonts')
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Cache Google Fonts
    if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
        event.respondWith(
            caches.open('google-fonts').then(cache => {
                return cache.match(event.request).then(response => {
                    return response || fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // Check if we received a valid response
                if (networkResponse && networkResponse.ok && event.request.method === 'GET' && !url.protocol.startsWith('chrome-extension')) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Offline fallback logic could go here if needed
            });
            
            // Return cached response immediately if available, while fetching in background
            return cachedResponse || fetchPromise;
        })
    );
});
