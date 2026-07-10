document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const qrTypeSelect = document.getElementById('qr-type');
    const dynamicInputs = document.getElementById('dynamic-inputs');
    const btnGenerate = document.getElementById('btn-generate');
    const btnReset = document.getElementById('btn-reset');
    const qrImage = document.getElementById('qr-image');
    const placeholderText = document.getElementById('placeholder-text');
    const loadingState = document.getElementById('loading-state');
    const qrPreviewContainer = document.getElementById('qr-preview-container');
    const downloadActions = document.getElementById('download-actions');
    const btnDownloadPng = document.getElementById('btn-download-png');
    const btnDownloadSvg = document.getElementById('btn-download-svg');

    // Store generated codes
    let currentQRDataURL_PNG = '';
    let currentQRData_SVG = '';

    // --- Input Configurations based on QR Type ---
    const inputConfig = {
        url: [
            { id: 'inp-url', label: 'Website URL', type: 'url', placeholder: 'https://example.com' }
        ],
        text: [
            { id: 'inp-text', label: 'Text Content', type: 'textarea', placeholder: 'Enter your text here...' }
        ],
        whatsapp: [
            { id: 'inp-wa-num', label: 'WhatsApp Number (with country code)', type: 'number', placeholder: '6281234567890' }
        ],
        phone: [
            { id: 'inp-phone', label: 'Phone Number', type: 'tel', placeholder: '+6281234567890' }
        ],
        email: [
            { id: 'inp-email-to', label: 'Email Address', type: 'email', placeholder: 'contact@example.com' },
            { id: 'inp-email-sub', label: 'Subject', type: 'text', placeholder: 'Hello' },
            { id: 'inp-email-msg', label: 'Message', type: 'textarea', placeholder: 'Your message here...' }
        ],
        sms: [
            { id: 'inp-sms-num', label: 'Phone Number', type: 'tel', placeholder: '+6281234567890' },
            { id: 'inp-sms-msg', label: 'Message', type: 'textarea', placeholder: 'Your message here...' }
        ],
        wifi: [
            { id: 'inp-wifi-ssid', label: 'Network Name (SSID)', type: 'text', placeholder: 'MyWiFiNetwork' },
            { id: 'inp-wifi-pass', label: 'Password', type: 'password', placeholder: '••••••••' },
            { id: 'inp-wifi-type', label: 'Encryption', type: 'select', options: ['WPA', 'WEP', 'nopass'] }
        ],
        location: [
            { id: 'inp-loc-lat', label: 'Latitude', type: 'text', placeholder: '-6.2088' },
            { id: 'inp-loc-lng', label: 'Longitude', type: 'text', placeholder: '106.8456' }
        ]
    };

    // --- Functions ---
    function renderInputs(type) {
        dynamicInputs.innerHTML = '';
        const fields = inputConfig[type];

        fields.forEach(field => {
            const group = document.createElement('div');
            group.className = 'form-group';
            
            const label = document.createElement('label');
            label.htmlFor = field.id;
            label.textContent = field.label;
            group.appendChild(label);

            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
            } else if (field.type === 'select') {
                input = document.createElement('select');
                field.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    input.appendChild(option);
                });
            } else {
                input = document.createElement('input');
                input.type = field.type;
            }

            input.id = field.id;
            input.className = 'glass-input';
            if (field.placeholder) input.placeholder = field.placeholder;
            
            group.appendChild(input);
            dynamicInputs.appendChild(group);
        });
    }

    function getFormValues(type) {
        let textToEncode = '';
        try {
            switch(type) {
                case 'url': textToEncode = document.getElementById('inp-url').value; break;
                case 'text': textToEncode = document.getElementById('inp-text').value; break;
                case 'whatsapp': 
                    const waNum = document.getElementById('inp-wa-num').value.replace(/\D/g, '');
                    textToEncode = `https://wa.me/${waNum}`; 
                    break;
                case 'phone': textToEncode = `tel:${document.getElementById('inp-phone').value}`; break;
                case 'email':
                    const to = document.getElementById('inp-email-to').value;
                    const sub = encodeURIComponent(document.getElementById('inp-email-sub').value);
                    const msg = encodeURIComponent(document.getElementById('inp-email-msg').value);
                    textToEncode = `mailto:${to}?subject=${sub}&body=${msg}`;
                    break;
                case 'sms':
                    const smsNum = document.getElementById('inp-sms-num').value;
                    const smsMsg = encodeURIComponent(document.getElementById('inp-sms-msg').value);
                    textToEncode = `smsto:${smsNum}:${smsMsg}`;
                    break;
                case 'wifi':
                    const ssid = document.getElementById('inp-wifi-ssid').value;
                    const pass = document.getElementById('inp-wifi-pass').value;
                    const enc = document.getElementById('inp-wifi-type').value;
                    textToEncode = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
                    break;
                case 'location':
                    const lat = document.getElementById('inp-loc-lat').value;
                    const lng = document.getElementById('inp-loc-lng').value;
                    textToEncode = `geo:${lat},${lng}`;
                    break;
            }
        } catch (e) {
            console.error("Error reading fields", e);
        }
        return textToEncode.trim();
    }

    function showToast(message, isError = false) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        if(isError) toast.style.borderLeftColor = 'red';
        toast.innerHTML = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => { toast.remove(); }, 3000);
    }

    function downloadFile(content, fileName, isBase64 = false) {
        const link = document.createElement('a');
        link.download = fileName;
        if (isBase64) {
            link.href = content;
        } else {
            const blob = new Blob([content], { type: 'image/svg+xml' });
            link.href = URL.createObjectURL(blob);
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('📥 Download berhasil');
    }

    // --- Event Listeners ---
    qrTypeSelect.addEventListener('change', (e) => {
        renderInputs(e.target.value);
    });

    btnReset.addEventListener('click', () => {
        renderInputs(qrTypeSelect.value);
        qrImage.classList.add('hidden');
        qrImage.classList.remove('fade-scale');
        placeholderText.classList.remove('hidden');
        downloadActions.classList.add('hidden');
        qrPreviewContainer.style.background = '#fff';
    });

    btnGenerate.addEventListener('click', () => {
        const textData = getFormValues(qrTypeSelect.value);
        
        if (!textData) {
            showToast('⚠️ Mohon isi data dengan benar', true);
            return;
        }

        // Setup Loading UI
        qrImage.classList.add('hidden');
        qrImage.classList.remove('fade-scale');
        placeholderText.classList.add('hidden');
        downloadActions.classList.add('hidden');
        
        qrPreviewContainer.style.background = 'rgba(255,255,255,0.1)';
        loadingState.classList.remove('hidden');

        setTimeout(() => {
            loadingState.classList.add('hidden');
            qrPreviewContainer.style.background = '#fff';

            // Pengecekan krusial: Apakah Library QR berhasil diload dari Internet?
            if (typeof QRCode === 'undefined') {
                showToast('❌ Gagal memuat library QR. Coba matikan AdBlock atau ganti koneksi.', true);
                placeholderText.classList.remove('hidden');
                placeholderText.textContent = "Gagal memuat engine QR";
                return;
            }

            const qrOptions = {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 220 // Set ukuran pasti agar tidak blank
            };

            try {
                // Generate PNG menggunakan callback yang aman
                QRCode.toDataURL(textData, qrOptions, (err, url) => {
                    if (err) {
                        console.error(err);
                        showToast('❌ Gagal render PNG', true);
                        return;
                    }
                    currentQRDataURL_PNG = url;
                    
                    // Paksa ukuran gambar di HTML
                    qrImage.style.width = '220px';
                    qrImage.style.height = '220px';
                    qrImage.src = url;
                    qrImage.classList.remove('hidden');
                    
                    void qrImage.offsetWidth; // Trigger reflow untuk animasi
                    qrImage.classList.add('fade-scale');
                    
                    downloadActions.classList.remove('hidden');
                    showToast('✅ QR berhasil dibuat');
                });

                // Generate SVG (Dibungkus terpisah agar kalau gagal, PNG tetap muncul)
                QRCode.toString(textData, { ...qrOptions, type: 'svg' }, (err, string) => {
                    if (!err) {
                        currentQRData_SVG = string;
                        btnDownloadSvg.style.display = 'block';
                    } else {
                        btnDownloadSvg.style.display = 'none'; // Sembunyikan tombol SVG jika browser tidak support
                    }
                });

            } catch (error) {
                console.error("Fatal Error:", error);
                showToast('❌ Terjadi kesalahan pada sistem', true);
                placeholderText.classList.remove('hidden');
            }

        }, 800);
    });

    btnDownloadPng.addEventListener('click', () => {
        if(currentQRDataURL_PNG) downloadFile(currentQRDataURL_PNG, 'Xaerisoft-QR.png', true);
    });

    btnDownloadSvg.addEventListener('click', () => {
        if(currentQRData_SVG) downloadFile(currentQRData_SVG, 'Xaerisoft-QR.svg', false);
    });

    // Initialize first load
    renderInputs(qrTypeSelect.value);
});
