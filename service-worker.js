const CACHE_NAME = 'act-clinical-v1';
const ASSETS = [
    './',
    './index.html',
    './styles/main.css',
    './app.js',
    './manifest.json',
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
    './modules/estres.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
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
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
