document.getElementById('start-button').addEventListener('click', () => {
    let countdown = 10;
    const countdownElement = document.getElementById('countdown');

    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(interval);
            countdownElement.textContent = 'Time is up!';
        }
    }, 1000);
});


// Kiểm tra version của manifest và reload nếu có thay đổi
async function checkManifestVersion() {
    try {
        const response = await fetch('/manifest.json', { cache: 'no-store' });
        const manifest = await response.json();
        const newVer = manifest.ver;
        const oldVer = localStorage.getItem('manifestVer');
        if (newVer !== oldVer) {
            localStorage.setItem('manifestVer', newVer);
            location.reload();
        }
    } catch (e) {
        console.error('Manifest version check failed:', e);
    }
}

checkManifestVersion();
