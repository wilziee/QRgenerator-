// --- Particle Blackhole Logic ---
const canvas = document.getElementById('particle-bg');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
for (let i = 0; i < 100; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 2 + 1
    });
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    
    particles.forEach(p => {
        // Tarikan ke tengah (Blackhole effect)
        let dx = canvas.width/2 - p.x;
        let dy = canvas.height/2 - p.y;
        p.x += dx * 0.01;
        p.y += dy * 0.01;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (Math.abs(dx) < 1) { p.x = Math.random() * canvas.width; p.y = Math.random() * canvas.height; }
    });
    requestAnimationFrame(animate);
}
animate();

// --- QR Logic ---
function generate() {
    const val = document.getElementById('input').value;
    const canvasQR = document.getElementById('qr-canvas');
    if (!val) return alert("Masukkan URL!");
    
    QRCode.toCanvas(canvasQR, val, { width: 200, margin: 0 }, (err) => {
        if (err) alert("Gagal generate");
    });
}
