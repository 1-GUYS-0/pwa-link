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

// Tạo nút Check for Updates dính vào góc trên bên phải
const updateBtn = document.createElement('button');
updateBtn.id = 'update-sw';
updateBtn.type = 'button';
updateBtn.textContent = 'Check for Updates';
updateBtn.style.position = 'fixed';
updateBtn.style.top = '16px';
updateBtn.style.right = '16px';
updateBtn.style.zIndex = '1000';
updateBtn.style.padding = '10px 18px';
updateBtn.style.background = '#1976d2';
updateBtn.style.color = '#fff';
updateBtn.style.border = 'none';
updateBtn.style.borderRadius = '8px';
updateBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
updateBtn.style.cursor = 'pointer';
updateBtn.style.fontSize = '1rem';

document.body.appendChild(updateBtn);

// Gửi tin nhắn đến Service Worker để kiểm tra và cập nhật phiên bản cache 
updateBtn.addEventListener('click', () => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATE' });
    }
});
