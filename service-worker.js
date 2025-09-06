const CACHE_NAME = 'pwa-demo-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './images/icon-192x192.png',
    './images/icon-512x512.png',
    './manifest.json'
];

// Sự kiện install: Cache các tài nguyên cơ bản
self.addEventListener('install', event => {
    self.skipWaiting(); // Kích hoạt ngay Service Worker mới
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Sự kiện fetch: Trả về tài nguyên từ cache hoặc tải từ mạng
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                // Gửi thông tin cache hit đến UI
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'CACHE_HIT', url: event.request.url });
                    });
                });
                return response;
            }
            return fetch(event.request).then(networkResponse => {
                // Gửi thông tin network fetch đến UI
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'NETWORK_FETCH', url: event.request.url });
                    });
                });
                return networkResponse;
            });
        })
    );
});

// Sự kiện activate: Xóa cache cũ nếu cần thiết
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Đảm bảo Service Worker kiểm soát tất cả các tab
});

self.addEventListener('message', async event => {
    if (event.data && event.data.type === 'CHECK_FOR_UPDATE') {
        const response = await fetch('./manifest.json');
        const newManifest = await response.json();

        const cachedManifest = await caches.match('./manifest.json').then(res => res ? res.json() : null);

        if (cachedManifest && cachedManifest.ver !== newManifest.ver) {
            console.log('New version detected:', newManifest.ver);
            await caches.delete(CACHE_NAME);
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(urlsToCache);
            console.log('Cache updated with new version.');
        } else {
            console.log('No new version detected.');
        }
    }
});
