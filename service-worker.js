const CACHE_NAME = 'pwa-demo-cache-v3';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './images/icon-192x192.png',
    './images/icon-512x512.png',
    './manifest.json'
];

// Sự kiện install:
// - Được kích hoạt khi service worker lần đầu đăng ký hoặc có cập nhật mới.
// - Dùng để cache các tài nguyên cần thiết cho app hoạt động offline.
self.addEventListener('install', event => {
    console.log('[Service Worker] Install event triggered');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Sự kiện fetch:
// - Được kích hoạt mỗi khi trình duyệt yêu cầu tài nguyên (HTML, CSS, JS, ảnh, ...).
// - Kiểm tra cache trước, nếu có thì trả về cache, nếu không thì tải từ mạng.
self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetch event:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'CACHE_HIT', url: event.request.url });
                    });
                });
                return response;
            }
            return fetch(event.request).then(networkResponse => {
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

// Sự kiện activate:
// - Được kích hoạt sau khi service worker mới được cài đặt thành công.
// - Dùng để xóa các cache cũ không còn sử dụng, đảm bảo chỉ giữ lại cache mới nhất.
// - Chuyển quyền kiểm soát cho service worker mới với self.clients.claim().
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate event triggered');
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
    self.clients.claim();
});

// Sự kiện message:
// - Được kích hoạt khi nhận được tin nhắn từ client (trang web).
// - Dùng để kiểm tra và cập nhật phiên bản cache khi có yêu cầu từ client.
self.addEventListener('message', async event => {
    console.log('[Service Worker] Message event:', event.data);
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
