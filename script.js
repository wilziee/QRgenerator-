// ================= BACKGROUND ANIMATIONS =================
function createShootingStars() {
    const container = document.querySelector('.shooting-stars-container');
    setInterval(() => {
        const star = document.createElement('div');
        star.classList.add('shooting-star');
        star.style.top = Math.random() * window.innerHeight * 0.5 + 'px';
        star.style.left = Math.random() * window.innerWidth + 'px';
        star.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        
        container.appendChild(star);
        setTimeout(() => star.remove(), 3000);
    }, 2000);
}
createShootingStars();

// ================= DOM ELEMENTS =================
const qrTypeSelect = document.getElementById('qr-type');
const inputGroups = document.querySelectorAll('.input-group');
const btnGenerate = document.getElementById('btn-generate');
const btnReset = document.getElementById('btn-reset');
const btnDlPng = document.getElementById('btn-dl-png');
const btnDlSvg = document.getElementById('btn-dl-svg');

const qrPlaceholder = document.getElementById('qr-placeholder');
const qrLoading = document.getElementById('loading');
const qrPreviewContainer = document.getElementById('qr-preview-container');
const qrCanvas = document.getElementById('qr-canvas');
const dlActions = document.getElementById('download-actions');
const toastContainer = document.getElementById('toast-container');

let currentQRDataString = "";
let currentQRSvgString = "";

// ================= DYNAMIC FORM =================
qrTypeSelect.addEventListener('change', (e) => {
    inputGroups.forEach(group => group.classList.remove('active'));
    const selectedGroup = document.getElementById(`group-${e.target.value}`);
    if (selectedGroup) {
        selectedGroup.classList.add('active');
    }
});

// ================= DATA FORMATTER =================
function getQRData() {
    const type = qrTypeSelect.value;
    let data = "";

    try {
        switch (type) {
            case 'url':
                data = document.getElementById('inp-url').value.trim();
                break;
            case 'text':
                data = document.getElementById('inp-text').value.trim();
                break;
            case 'whatsapp':
                const waPhone = document.getElementById('inp-wa-phone').value.trim().replace(/[^0-9]/g, '');
                const waMsg = encodeURIComponent(document.getElementById('inp-wa-msg').value.trim());
                if(waPhone) data = `https://wa.me/${waPhone}?text=${waMsg}`;
                break;
            case 'phone':
                const phone = document.getElementById('inp-phone').value.trim();
                if(phone) data = `tel:${phone}`;
                break;
            case 'email':
                const email = document.getElementById('inp-email').value.trim();
                const sub = encodeURIComponent(document.getElementById('inp-email-sub').value.trim());
                const body = encodeURIComponent(document.getElementById('inp-email-msg').value.trim());
                if(email) data = `mailto:${email}?subject=${sub}&body=${body}`;
                break;
            case 'sms':
                const smsPhone = document.getElementById('inp-sms-phone').value.trim();
                const smsMsg = document.getElementById('inp-sms-msg').value.trim();
                if(smsPhone) data = `smsto:${smsPhone}:${smsMsg}`;
                break;
            case 'wifi':
                const ssid = document.getElementById('inp-wifi-ssid').value.trim();
                const pass = document.getElementById('inp-wifi-pass').value.trim();
                const sec = document.getElementById('inp-wifi-type').value;
                if(ssid) data = `WIFI:T:${sec};S:${ssid};P:${pass};;`;
                break;
            case 'location':
                const lat = document.getElementById('inp-loc-lat').value.trim();
                const lng = document.getElementById('inp-loc-lng').value.trim();
                if(lat && lng) data = `geo:${lat},${lng}`;
                break;
        }
    } catch (e) {
        console.error("Format Error", e);
    }
    return data;
}

// ================= GENERATE QR =================
btnGenerate.addEventListener('click', () => {
    // Cek apakah library qrcode sudah siap
    if (typeof QRCode === 'undefined') {
        showToast("❌ Library sedang dimuat. Pastikan koneksi internet lancar, lalu coba lagi.");
        return;
    }

    const data = getQRData();
    if (!data) {
        showToast("⚠️ Mohon isi form terlebih dahulu.");
        return;
    }

    currentQRDataString = data;

    // Tampilan Loading
    qrPlaceholder.classList.add('hidden');
    qrPreviewContainer.classList.add('hidden');
    dlActions.classList.add('hidden');
    qrLoading.classList.remove('hidden');

    setTimeout(() => {
        // Render ke Canvas (Untuk Preview & PNG)
        QRCode.toCanvas(qrCanvas, data, {
            width: 250,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" }
        }, function (error) {
            if (error) {
                console.error(error);
                qrLoading.classList.add('hidden');
                qrPlaceholder.classList.remove('hidden');
                showToast("❌ Gagal membuat QR Code");
                return;
            }

            // Render ke SVG String (Untuk Download Kualitas Tinggi)
            QRCode.toString(data, {
                type: 'svg',
                width: 1000,
                margin: 2
            }, function (err, string) {
                if (err) {
                    console.error(err);
                    return;
                }
                
                currentQRSvgString = string;
                
                // Update UI berhasil
                qrLoading.classList.add('hidden');
                qrPreviewContainer.classList.remove('hidden');
                dlActions.classList.remove('hidden');
                showToast("✅ QR berhasil dibuat");
            });
        });
    }, 500);
});

// ================= DOWNLOAD =================
btnDlPng.addEventListener('click', () => {
    const url = qrCanvas.toDataURL("image/png");
    downloadFile(url, 'Xaerisoft-QR.png');
    showToast("📥 PNG berhasil diunduh");
});

btnDlSvg.addEventListener('click', () => {
    const blob = new Blob([currentQRSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'Xaerisoft-QR.svg');
    showToast("📥 SVG berhasil diunduh");
});

function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ================= RESET =================
btnReset.addEventListener('click', () => {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => input.value = '');
    
    qrPreviewContainer.classList.add('hidden');
    dlActions.classList.add('hidden');
    qrLoading.classList.add('hidden');
    qrPlaceholder.classList.remove('hidden');
    
    qrTypeSelect.value = 'url';
    qrTypeSelect.dispatchEvent(new Event('change'));

    showToast("🔄 Form berhasil direset");
});

// ================= TOAST SYSTEM =================
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
