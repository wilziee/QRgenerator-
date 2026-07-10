/* ==========================================================================
   DOM ELEMENTS INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Navigation & Layout
    const menuItems = document.querySelectorAll('.menu-item');
    const appSections = document.querySelectorAll('.app-section');
    
    // Input & Generator Elements
    const typeBtns = document.querySelectorAll('.type-btn');
    const inputFields = document.querySelectorAll('.content-input-field');
    const generateBtn = document.querySelector('.primary-action-btn');
    const qrCanvasHolder = document.querySelector('.qr-canvas-holder');
    
    // Preview States
    const emptyState = document.querySelector('.empty-state');
    const loadingState = document.querySelector('.loading-state');
    
    // Customization Elements
    const colorBg = document.getElementById('color-bg');
    const colorFg = document.getElementById('color-fg');
    const sizeSlider = document.getElementById('qr-size');
    
    // Global variable to store QR instance
    let currentQR = null;

    /* ==========================================================================
       SIDEBAR NAVIGATION LOGIC
       ========================================================================== */
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all menu items
            menuItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // Get target section from data attribute (e.g., data-target="generator-section")
            const targetId = this.getAttribute('data-target');
            
            // Hide all sections, show target section
            appSections.forEach(section => {
                section.classList.remove('active');
                if(section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
    /* ==========================================================================
       INPUT TYPE SWITCHER LOGIC
       ========================================================================== */
    typeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update button visual state
            typeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Get target input field ID
            const targetInput = this.getAttribute('data-type');

            // Hide all input fields and show the relevant one
            inputFields.forEach(field => {
                field.classList.remove('active');
                if(field.id === `input-${targetInput}`) {
                    field.classList.add('active');
                }
            });
        });
    });

    /* ==========================================================================
       TOAST NOTIFICATION PIPELINE
       ========================================================================== */
    window.showToast = function(message, type = 'info') {
        const pipeline = document.querySelector('.toast-notification-pipeline');
        if (!pipeline) return;

        const toast = document.createElement('div');
        toast.className = `toast-unit ${type}`;
        
        // Set icon based on type
        const iconClass = type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${message}</span>
        `;

        pipeline.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
            }, 300); // Wait for fade-out animation
        }, 3000);
    };
    /* ==========================================================================
       QR CODE GENERATOR ENGINE
       ========================================================================== */
    function getInputValue() {
        // Find which input section is currently active
        const activeSection = document.querySelector('.content-input-field.active');
        const activeInput = activeSection.querySelector('input, textarea');
        return activeInput ? activeInput.value.trim() : '';
    }

    if(generateBtn) {
        generateBtn.addEventListener('click', () => {
            const qrData = getInputValue();

            if (!qrData) {
                showToast('Harap masukkan data terlebih dahulu!', 'info');
                return;
            }

            // UI Transitions: Show Loading
            emptyState.classList.add('hidden');
            qrCanvasHolder.classList.add('hidden');
            loadingState.classList.remove('hidden');

            // Simulate slight processing delay for smooth UI experience
            setTimeout(() => {
                // Clear previous QR
                qrCanvasHolder.innerHTML = '';
                
                const size = sizeSlider ? sizeSlider.value : 200;
                const fgColor = colorFg ? colorFg.value : '#000000';
                const bgColor = colorBg ? colorBg.value : '#ffffff';

                // Generate New QR (Assuming qrcode.js is loaded)
                try {
                    currentQR = new QRCode(qrCanvasHolder, {
                        text: qrData,
                        width: parseInt(size),
                        height: parseInt(size),
                        colorDark : fgColor,
                        colorLight : bgColor,
                        correctLevel : QRCode.CorrectLevel.H
                    });

                    // UI Transitions: Show Canvas
                    loadingState.classList.add('hidden');
                    qrCanvasHolder.classList.remove('hidden');
                    
                    // Enable Download Buttons
                    document.querySelector('.download-cluster').classList.remove('disabled');
                    
                    showToast('QR Code berhasil dibuat!', 'success');
                    saveToHistory(qrData); // Save to local storage
                } catch (error) {
                    loadingState.classList.add('hidden');
                    emptyState.classList.remove('hidden');
                    showToast('Terjadi kesalahan saat membuat QR Code', 'error');
                }
            }, 600);
        });
    }
    /* ==========================================================================
       DOWNLOAD FUNCTIONALITY
       ========================================================================== */
    const downloadBtns = document.querySelectorAll('.dl-format-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            const canvas = qrCanvasHolder.querySelector('canvas');
            
            if (!canvas) {
                showToast('Buat QR Code terlebih dahulu!', 'info');
                return;
            }

            const image = canvas.toDataURL(`image/${format}`);
            const link = document.createElement('a');
            link.href = image;
            link.download = `QR_Code_${new Date().getTime()}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast(`Berhasil mengunduh format ${format.toUpperCase()}`, 'success');
        });
    });

    /* ==========================================================================
       HISTORY MANAGEMENT (LOCAL STORAGE)
       ========================================================================== */
    function saveToHistory(data) {
        let history = JSON.parse(localStorage.getItem('qr_history')) || [];
        const newItem = {
            id: Date.now(),
            data: data,
            date: new Date().toLocaleDateString()
        };
        
        // Add to beginning of array and keep only last 10 items
        history.unshift(newItem);
        if (history.length > 10) history.pop();
        
        localStorage.setItem('qr_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const historyContainer = document.querySelector('.history-grid-container');
        if (!historyContainer) return;
        
        let history = JSON.parse(localStorage.getItem('qr_history')) || [];
        historyContainer.innerHTML = '';
        
        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="text-muted">Belum ada riwayat pembuatan.</p>';
            return;
        }

        history.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card history-card-item';
            card.innerHTML = `
                <div class="item-meta-header">
                    <span class="badge-data-type">DATA</span>
                    <span class="item-timestamp">${item.date}</span>
                </div>
                <p>${item.data}</p>
                <div class="card-item-action-row">
                    <button class="card-mini-btn card-mini-btn-delete" onclick="deleteHistory(${item.id})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            `;
            historyContainer.appendChild(card);
        });
    }

    // Global function for delete button
    window.deleteHistory = function(id) {
        let history = JSON.parse(localStorage.getItem('qr_history')) || [];
        history = history.filter(item => item.id !== id);
        localStorage.setItem('qr_history', JSON.stringify(history));
        renderHistory();
        showToast('Riwayat dihapus', 'success');
    };

    // Initial render
    renderHistory();

    /* ==========================================================================
       THEME SWITCHER
       ========================================================================== */
    const themeNodes = document.querySelectorAll('.theme-node');
    themeNodes.forEach(node => {
        node.addEventListener('click', function() {
            themeNodes.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            
            const theme = this.getAttribute('data-theme-value');
            if (theme === 'default') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
            }
        });
    });

}); // End of DOMContentLoaded
