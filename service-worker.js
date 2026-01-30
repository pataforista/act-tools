const CACHE_NAME = 'act-clinical-v1';
const ASSETS = [
    './',
    './index.html',
    './styles/main.css',
    './app.js',
    './manifest.json'
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
