if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
        console.log('Service Worker registered:', registration);

        // Lắng nghe thông điệp từ Service Worker
        navigator.serviceWorker.addEventListener('message', event => {
            const log = document.getElementById('sw-log');
            const message = event.data;

            if (message.type === 'CACHE_HIT') {
                const li = document.createElement('li');
                li.textContent = `Cache hit: ${message.url}`;
                log.appendChild(li);
            } else if (message.type === 'NETWORK_FETCH') {
                const li = document.createElement('li');
                li.textContent = `Network fetch: ${message.url}`;
                log.appendChild(li);
            }
        });
    }).catch(error => {
        console.error('Service Worker registration failed:', error);
    });
}

document.getElementById('update-sw').addEventListener('click', () => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATE' });
    }
});
