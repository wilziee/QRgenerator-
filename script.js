// --- VIEW LOGIC ---
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });
    const target = document.getElementById(viewId);
    target.classList.remove('hidden');
    target.classList.add('active');
}

// --- QR GENERATOR LOGIC ---
const qrInputsMap = {
    url: `<input type="url" id="qr-val-1" placeholder="Masukkan URL (ex: https://xaerisoft.com)" required>`,
    text: `<textarea id="qr-val-1" rows="3" placeholder="Masukkan teks apapun" required></textarea>`,
    whatsapp: `<input type="number" id="qr-val-1" placeholder="Nomor WA (contoh: 62812345678)" required>`
};

function updateQrInputFields() {
    const type = document.getElementById('qr-type').value;
    document.getElementById('dynamic-inputs').innerHTML = qrInputsMap[type];
}

let currentQRText = "";
function generateQR() {
    const val = document.getElementById('qr-val-1')?.value.trim();
    if (!val) return alert("Mohon isi data terlebih dahulu.");
    
    currentQRText = encodeURIComponent(val);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${currentQRText}`;
    
    document.getElementById('qr-image').src = qrUrl;
    document.getElementById('qr-image').style.display = 'block';
    document.getElementById('qr-placeholder').style.display = 'none';
    document.getElementById('download-group').style.display = 'flex';
}

function resetQR() {
    document.getElementById('qr-image').style.display = 'none';
    document.getElementById('qr-placeholder').style.display = 'block';
    document.getElementById('download-group').style.display = 'none';
}

function downloadQR(format) {
    if(!currentQRText) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${currentQRText}&format=${format}`;
    fetch(url)
        .then(res => res.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Xaerisoft_QR.${format}`;
            link.click();
        });
}

document.addEventListener('DOMContentLoaded', updateQrInputFields);


// --- IQC iPHONE GENERATOR LOGIC ---
function generateIQC() {
    // Ambil Value dari Form
    const provider = document.getElementById('iqc-provider').value || "INDOSAT LTE";
    const time = document.getElementById('iqc-time').value || "05:54";
    const text = document.getElementById('iqc-text').value || "Pesan kosong.";
    let battery = document.getElementById('iqc-battery').value || 66;
    
    if(battery > 100) battery = 100;
    if(battery < 0) battery = 0;

    // Inject ke DOM Mockup iPhone
    document.getElementById('mock-provider').innerText = provider.toUpperCase();
    document.getElementById('mock-time').innerText = time;
    document.getElementById('mock-bubble-time').innerText = time;
    document.getElementById('mock-text').innerText = text;
    document.getElementById('mock-battery-text').innerText = battery + "%";
    document.getElementById('mock-battery-level').style.width = battery + "%";

    // Beri efek transisi pada teks status "Generate Selesai"
    const statusText = document.getElementById('iqc-status-text');
    statusText.classList.remove('show');
    
    // Trigger reflow untuk merestart animasi (trik CSS murni)
    void statusText.offsetWidth; 
    
    statusText.classList.add('show');
}
