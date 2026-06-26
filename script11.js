// ================================================================
// script11.js — Video Generator (Ken Burns) + Glassmorphism สุดโปร่ง
// ใช้ได้โดยไม่ต้องแก้ไข HTML หลัก
// ลากการ์ด → จับที่แถบสีม่วงตรงหัวข้อ แล้วลากไปวางตรงไหนก็ได้
// ================================================================

(function() {
    'use strict';

    /* ---- สร้าง UI ถ้ายังไม่มี ---- */
    function ensureUI() {
        if (document.getElementById('videoGeneratorCard')) {
            return;
        }

        let container = document.querySelector('.controls-panel');
        if (!container) {
            container = document.querySelector('.app-container');
        }
        if (!container) {
            container = document.body;
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.id = 'videoGeneratorCard';
        card.style.borderColor = 'rgba(167, 139, 250, 0.25)';

        // 🪟 === การ์ดหลักโปร่งแสงสูงสุด ===
        card.style.position = 'fixed';
        card.style.top = '80px';
        card.style.left = '20px';
        card.style.zIndex = '9999';
        card.style.width = '420px';
        card.style.maxWidth = '90vw';
        card.style.cursor = 'default';
        card.style.background = 'rgba(15, 23, 42, 0.12)';     // โปร่งใสมาก
        card.style.backdropFilter = 'blur(32px)';             // เบลอสูง
        card.style.webkitBackdropFilter = 'blur(32px)';
        card.style.border = '1px solid rgba(255, 255, 255, 0.06)';
        card.style.borderRadius = '24px';
        card.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(167, 139, 250, 0.08) inset';
        card.style.transition = 'box-shadow 0.3s ease, background 0.3s ease';
        card.style.overflow = 'hidden';

        // เนื้อหาภายใน (ยังคง Glassmorphism แต่ทึบกว่าเล็กน้อยเพื่อให้อ่านง่าย)
        card.innerHTML = `
            <div class="card-title" style="cursor:grab; user-select:none; padding:14px 20px; background:rgba(30, 27, 75, 0.25); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-bottom:1px solid rgba(255,255,255,0.04); display:flex; align-items:center; gap:10px; font-weight:700; font-size:0.95rem; color:#E2E8F0; letter-spacing:0.3px;">
                <span style="filter:drop-shadow(0 0 8px rgba(167,139,250,0.3));">🎬</span>
                <span style="background:linear-gradient(135deg, #C4B5FD, #A78BFA); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">สร้างวิดีโอ (Ken Burns)</span>
                <span style="margin-left:auto; font-size:0.55rem; color:rgba(255,255,255,0.35); font-weight:400; background:rgba(255,255,255,0.05); padding:2px 12px; border-radius:20px; border:1px solid rgba(255,255,255,0.04); backdrop-filter:blur(2px); -webkit-backdrop-filter:blur(2px);">ลากได้</span>
            </div>
            <div class="video-grid" style="padding:16px 18px 18px 18px; background:rgba(15, 23, 42, 0.15); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);">
                <div class="drop-zone-row" style="display:flex; gap:12px; flex-wrap:wrap;">
                    <!-- Image Zone -->
                    <div class="drop-zone" id="imageZone" style="flex:1; min-width:120px; background:rgba(11, 17, 32, 0.3); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:12px 10px; text-align:center; cursor:pointer; transition:all 0.3s ease; position:relative; min-height:70px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; box-shadow:0 4px 16px rgba(0,0,0,0.15) inset;">
                        <span class="zone-icon" style="font-size:1.4rem; opacity:0.7;">🖼️</span>
                        <span class="zone-label" style="font-size:0.65rem; color:rgba(148, 163, 184, 0.7); font-weight:500;">วางรูป หรือคลิก</span>
                        <div id="imagePreview">
                            <div id="imagePlaceholder" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                <span style="font-size:0.55rem; color:rgba(100, 116, 139, 0.6);">JPG, PNG, WEBP</span>
                            </div>
                        </div>
                        <span class="zone-meta" id="imageMeta" style="font-size:0.55rem; color:rgba(100, 116, 139, 0.7);"></span>
                        <input type="file" id="imageFileInput" accept="image/*" style="display:none;" />
                        <button class="btn-clear-file" id="triggerImageSelect" style="display:none; position:absolute; top:4px; right:4px; background:rgba(220,38,38,0.5); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.06); border-radius:20px; padding:2px 10px; font-size:0.5rem; color:#fff; cursor:pointer;">เลือกไฟล์</button>
                    </div>
                    <!-- Audio Zone -->
                    <div class="drop-zone" id="audioZone" style="flex:1; min-width:120px; background:rgba(11, 17, 32, 0.3); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:12px 10px; text-align:center; cursor:pointer; transition:all 0.3s ease; position:relative; min-height:70px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; box-shadow:0 4px 16px rgba(0,0,0,0.15) inset;">
                        <span class="zone-icon" style="font-size:1.4rem; opacity:0.7;">🎵</span>
                        <span class="zone-label" style="font-size:0.65rem; color:rgba(148, 163, 184, 0.7); font-weight:500;">วางเสียง หรือคลิก</span>
                        <div id="audioPreview">
                            <div id="audioPlaceholder" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                <span style="font-size:0.55rem; color:rgba(100, 116, 139, 0.6);">MP3, M4A, WAV</span>
                            </div>
                        </div>
                        <span class="zone-meta" id="audioMeta" style="font-size:0.55rem; color:rgba(100, 116, 139, 0.7);"></span>
                        <input type="file" id="audioFileInput" accept="audio/*" style="display:none;" />
                        <button class="btn-clear-file" id="triggerAudioSelect" style="display:none; position:absolute; top:4px; right:4px; background:rgba(220,38,38,0.5); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.06); border-radius:20px; padding:2px 10px; font-size:0.5rem; color:#fff; cursor:pointer;">เลือกไฟล์</button>
                    </div>
                </div>

                <!-- Create Button -->
                <button class="vg-create-btn" id="createBtn" style="width:100%; padding:12px; margin-top:6px; font-size:0.85rem; font-weight:700; background:linear-gradient(135deg, rgba(139,92,246,0.6), rgba(236,72,153,0.6)); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:12px; cursor:pointer; transition:all 0.25s ease; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 24px rgba(139,92,246,0.2);">
                    <span class="spinner" style="display:none; width:18px; height:18px; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite;"></span>
                    <span class="btn-text" style="text-shadow:0 2px 8px rgba(0,0,0,0.2);">🚀 สร้างวิดีโอ</span>
                </button>

                <!-- Progress -->
                <div class="vg-progress-wrap" id="progressWrap" style="margin-top:8px; height:3px; background:rgba(30, 41, 59, 0.3); border-radius:4px; overflow:hidden; opacity:0; transition:opacity 0.3s ease;">
                    <div class="vg-progress-bar" id="progressBar" style="height:100%; width:0%; background:linear-gradient(90deg,#60A5FA,#A78BFA); border-radius:4px; transition:width 0.3s ease;"></div>
                </div>
                <div class="vg-progress-label" id="progressLabel" style="font-size:0.6rem; color:rgba(148, 163, 184, 0.5); margin-top:2px; text-align:center; min-height:18px;">⏳ รอเริ่ม...</div>

                <!-- Result Section -->
                <div class="vg-result" id="resultSection" style="margin-top:10px; border-radius:14px; overflow:hidden; background:rgba(11, 17, 32, 0.25); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.05); display:none;">
                    <video id="outputVideo" controls playsinline preload="metadata" style="width:100%; display:block; border-radius:12px 12px 0 0; background:#000; max-height:160px;"></video>
                    <div class="vg-result-actions" style="display:flex; gap:6px; padding:10px 12px; background:rgba(17, 29, 46, 0.2); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); flex-wrap:wrap; align-items:center; border-top:1px solid rgba(255,255,255,0.04);">
                        <span class="vg-status" id="videoStatus" style="font-size:0.7rem; color:rgba(148, 163, 184, 0.7); flex:1;">⏳ กำลังประมวลผล...</span>
                        <a id="downloadLink" download="video.mp4" class="primary" style="display:inline-flex; align-items:center; gap:4px; padding:6px 14px; border-radius:8px; text-decoration:none; font-size:0.7rem; font-weight:600; background:rgba(59, 130, 246, 0.5); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.08); color:#fff; transition:all 0.2s;">⬇️ ดาวน์โหลด</button>
                    </div>
                </div>
            </div>
        `;

        // Global Styles for Glassmorphism (ไม่เปลี่ยนแปลง)
        if (!document.querySelector('#vg-glass-style')) {
            const style = document.createElement('style');
            style.id = 'vg-glass-style';
            style.textContent = `
                @keyframes wave {
                    0% { transform: scaleY(0.4); }
                    100% { transform: scaleY(1); }
                }
                .vg-create-btn.loading {
                    opacity: 0.6;
                }
                .vg-create-btn.loading .spinner {
                    display: inline-block;
                }
                .drop-zone.drag-over {
                    border-color: #A78BFA !important;
                    background: rgba(167, 139, 250, 0.15) !important;
                    box-shadow: 0 0 30px rgba(167, 139, 250, 0.2), 0 0 0 1px #A78BFA inset !important;
                }
                .drop-zone.has-file {
                    border-color: #22D3EE !important;
                    border-style: solid !important;
                    background: rgba(34, 211, 238, 0.08) !important;
                    box-shadow: 0 0 20px rgba(34, 211, 238, 0.05) inset;
                }
                .vg-status.success { color: #22D3EE; }
                .vg-status.error { color: #EF4444; }
                .preview-thumb {
                    max-width: 50px;
                    max-height: 40px;
                    border-radius: 8px;
                    object-fit: cover;
                    border: 1px solid rgba(255,255,255,0.08);
                    margin-top: 2px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .btn-clear-file {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: rgba(220, 38, 38, 0.5) !important;
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                    border: 1px solid rgba(255,255,255,0.06) !important;
                    border-radius: 20px !important;
                    padding: 2px 10px !important;
                    font-size: 0.5rem !important;
                    color: #fff !important;
                    cursor: pointer;
                    font-weight: 600;
                    transition: 0.2s;
                }
                .btn-clear-file:hover {
                    background: #DC2626 !important;
                    transform: scale(1.05);
                }
                .card.dragging {
                    opacity: 0.8;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(167, 139, 250, 0.2) inset !important;
                    transition: none;
                }
                .card-title:active {
                    cursor: grabbing !important;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                #videoGeneratorCard::-webkit-scrollbar {
                    width: 4px;
                }
                #videoGeneratorCard::-webkit-scrollbar-track {
                    background: transparent;
                }
                #videoGeneratorCard::-webkit-scrollbar-thumb {
                    background: rgba(167, 139, 250, 0.3);
                    border-radius: 10px;
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(card);
        console.log('🎬 Glassmorphism Ultra-Transparent Video Generator UI injected.');

        // ---- Make Draggable ----
        makeDraggable(card);
    }

    /* ---- ✨ ฟังก์ชันลากการ์ด ---- */
    function makeDraggable(card) {
        const titleBar = card.querySelector('.card-title');
        if (!titleBar) return;

        let isDragging = false;
        let startX = 0, startY = 0;
        let offsetX = 0, offsetY = 0;

        function startDrag(e) {
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            if (clientX === undefined) return;

            isDragging = true;
            const rect = card.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;

            card.classList.add('dragging');
            titleBar.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        }

        function moveDrag(e) {
            if (!isDragging) return;
            e.preventDefault();

            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            if (clientX === undefined) return;

            let newLeft = clientX - offsetX;
            let newTop = clientY - offsetY;

            const maxX = window.innerWidth - card.offsetWidth;
            const maxY = window.innerHeight - card.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxX));
            newTop = Math.max(0, Math.min(newTop, maxY));

            card.style.left = newLeft + 'px';
            card.style.top = newTop + 'px';
        }

        function endDrag(e) {
            if (!isDragging) return;
            isDragging = false;
            card.classList.remove('dragging');
            titleBar.style.cursor = 'grab';
            document.body.style.userSelect = '';
        }

        titleBar.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);

        titleBar.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('touchend', endDrag);
        document.addEventListener('touchcancel', endDrag);

        titleBar.addEventListener('dragstart', (e) => e.preventDefault());
    }

    /* ---- เรียกสร้าง UI ---- */
    ensureUI();

    /* ---- state ---- */
    let imageFile = null;
    let audioFile = null;
    let imageDataUrl = null;
    let audioBlobUrl = null;
    let isGenerating = false;

    /* ---- DOM refs ---- */
    const imageZone = document.getElementById('imageZone');
    const audioZone = document.getElementById('audioZone');
    const imagePreview = document.getElementById('imagePreview');
    const audioPreview = document.getElementById('audioPreview');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const audioPlaceholder = document.getElementById('audioPlaceholder');
    const imageMeta = document.getElementById('imageMeta');
    const audioMeta = document.getElementById('audioMeta');
    const imageInput = document.getElementById('imageFileInput');
    const audioInput = document.getElementById('audioFileInput');
    const triggerImage = document.getElementById('triggerImageSelect');
    const triggerAudio = document.getElementById('triggerAudioSelect');
    const createBtn = document.getElementById('createBtn');
    const progressWrap = document.getElementById('progressWrap');
    const progressBar = document.getElementById('progressBar');
    const progressLabel = document.getElementById('progressLabel');
    const resultSection = document.getElementById('resultSection');
    const outputVideo = document.getElementById('outputVideo');
    const downloadLink = document.getElementById('downloadLink');
    const videoStatus = document.getElementById('videoStatus');

    /* ---- helpers ---- */
    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function showProgress(percent, label) {
        progressWrap.style.opacity = '1';
        progressBar.style.width = Math.min(100, percent) + '%';
        if (label) progressLabel.textContent = label;
    }

    function hideProgress() {
        progressWrap.style.opacity = '0';
        progressBar.style.width = '0%';
        progressLabel.textContent = '⏳ รอเริ่ม...';
    }

    /* ---- render previews ---- */
    function renderImagePreview(file) {
        if (!file) {
            imagePlaceholder.style.display = 'flex';
            imagePlaceholder.style.flexDirection = 'column';
            imagePlaceholder.style.alignItems = 'center';
            imagePlaceholder.style.justifyContent = 'center';
            imagePlaceholder.innerHTML = `<span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">JPG, PNG, WEBP</span>`;
            imagePreview.querySelectorAll('img, .btn-clear-file').forEach(el => el.remove());
            imageMeta.textContent = '';
            imageZone.classList.remove('has-file');
            imageFile = null;
            imageDataUrl = null;
            triggerImage.style.display = 'none';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            imageDataUrl = e.target.result;
            imagePlaceholder.style.display = 'none';
            imagePreview.querySelectorAll('img, .btn-clear-file').forEach(el => el.remove());

            const img = document.createElement('img');
            img.src = imageDataUrl;
            img.alt = 'preview';
            img.className = 'preview-thumb';
            imagePreview.appendChild(img);

            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn-clear-file';
            clearBtn.textContent = '🗑️';
            clearBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                clearImage();
            });
            imagePreview.appendChild(clearBtn);

            imageMeta.textContent = '✅ ' + escapeHtml(file.name) + ' (' + formatSize(file.size) + ')';
            imageZone.classList.add('has-file');
            imageFile = file;
            triggerImage.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function clearImage() {
        imageInput.value = '';
        renderImagePreview(null);
        imagePlaceholder.style.display = 'flex';
        imagePlaceholder.style.flexDirection = 'column';
        imagePlaceholder.style.alignItems = 'center';
        imagePlaceholder.style.justifyContent = 'center';
        imagePlaceholder.innerHTML = `<span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">JPG, PNG, WEBP</span>`;
        triggerImage.style.display = 'none';
    }

    function renderAudioPreview(file) {
        if (!file) {
            audioPlaceholder.style.display = 'flex';
            audioPlaceholder.style.flexDirection = 'column';
            audioPlaceholder.style.alignItems = 'center';
            audioPlaceholder.style.justifyContent = 'center';
            audioPlaceholder.innerHTML = `<span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">MP3, M4A, WAV</span>`;
            audioPreview.querySelectorAll('.audio-label, .btn-clear-file').forEach(el => el.remove());
            audioMeta.textContent = '';
            audioZone.classList.remove('has-file');
            if (audioBlobUrl) { URL.revokeObjectURL(audioBlobUrl);
                audioBlobUrl = null; }
            audioFile = null;
            triggerAudio.style.display = 'none';
            return;
        }
        audioPlaceholder.style.display = 'none';
        audioPreview.querySelectorAll('.audio-label, .btn-clear-file').forEach(el => el.remove());

        const wrap = document.createElement('div');
        wrap.className = 'audio-label';
        wrap.style.cssText = 'display:flex;align-items:center;gap:6px;width:100%;font-size:0.6rem;color:#22D3EE;';
        wrap.innerHTML = `
            <span>🎶</span>
            <span style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(255,255,255,0.6);">${escapeHtml(file.name)}</span>
            <div class="wave" style="display:flex;gap:2px;align-items:center;height:16px;">
                <span style="display:block;width:2px;height:6px;background:#22D3EE;border-radius:2px;animation:wave 0.8s infinite alternate;"></span>
                <span style="display:block;width:2px;height:10px;background:#A78BFA;border-radius:2px;animation:wave 0.9s infinite alternate 0.1s;"></span>
                <span style="display:block;width:2px;height:8px;background:#22D3EE;border-radius:2px;animation:wave 0.7s infinite alternate 0.2s;"></span>
                <span style="display:block;width:2px;height:12px;background:#A78BFA;border-radius:2px;animation:wave 1s infinite alternate 0.3s;"></span>
                <span style="display:block;width:2px;height:9px;background:#22D3EE;border-radius:2px;animation:wave 0.6s infinite alternate 0.4s;"></span>
            </div>
        `;
        audioPreview.appendChild(wrap);

        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-clear-file';
        clearBtn.textContent = '🗑️';
        clearBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            clearAudio();
        });
        audioPreview.appendChild(clearBtn);

        audioMeta.textContent = '🎧 ' + escapeHtml(file.name) + ' (' + formatSize(file.size) + ')';
        audioZone.classList.add('has-file');

        if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
        audioBlobUrl = URL.createObjectURL(file);
        audioFile = file;
        triggerAudio.style.display = 'none';
    }

    function clearAudio() {
        audioInput.value = '';
        if (audioBlobUrl) { URL.revokeObjectURL(audioBlobUrl);
            audioBlobUrl = null; }
        renderAudioPreview(null);
        audioPlaceholder.style.display = 'flex';
        audioPlaceholder.style.flexDirection = 'column';
        audioPlaceholder.style.alignItems = 'center';
        audioPlaceholder.style.justifyContent = 'center';
        audioPlaceholder.innerHTML = `<span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">MP3, M4A, WAV</span>`;
        triggerAudio.style.display = 'none';
    }

    /* ---- drag & drop for zones ---- */
    function setupDropZone(zone, isImage) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (!files.length) return;
            const file = files[0];
            if (isImage) {
                if (file.type.startsWith('image/')) {
                    renderImagePreview(file);
                } else {
                    alert('❌ กรุณาลากไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF, WEBP)');
                }
            } else {
                if (file.type.startsWith('audio/')) {
                    renderAudioPreview(file);
                } else {
                    alert('❌ กรุณาลากไฟล์เสียงเท่านั้น (MP3, M4A, WAV, OGG)');
                }
            }
        });
    }

    setupDropZone(imageZone, true);
    setupDropZone(audioZone, false);

    /* ---- file inputs ---- */
    triggerImage.addEventListener('click', () => imageInput.click());
    triggerAudio.addEventListener('click', () => audioInput.click());

    imageInput.addEventListener('change', () => {
        if (imageInput.files.length) renderImagePreview(imageInput.files[0]);
    });
    audioInput.addEventListener('change', () => {
        if (audioInput.files.length) renderAudioPreview(audioInput.files[0]);
    });

    /* ---- click on zone to trigger file select ---- */
    imageZone.addEventListener('click', (e) => {
        if (e.target.closest('.btn-clear-file') || e.target.closest('img')) return;
        if (!imageFile) imageInput.click();
    });
    audioZone.addEventListener('click', (e) => {
        if (e.target.closest('.btn-clear-file') || e.target.closest('.audio-label')) return;
        if (!audioFile) audioInput.click();
    });

    /* ---- main: generate video with Ken Burns ---- */
    async function generateVideo(imageFile, audioFile) {
        return new Promise(async (resolve, reject) => {
            if (!imageFile || !audioFile) {
                reject(new Error('กรุณาเลือกรูปและเสียงก่อน'));
                return;
            }

            const img = new Image();
            const imgUrl = URL.createObjectURL(imageFile);
            img.src = imgUrl;
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = () => rej(new Error('โหลดรูปไม่สำเร็จ'));
            });

            const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
            let audioBuffer;
            try {
                const ab = await audioFile.arrayBuffer();
                audioBuffer = await audioCtx.decodeAudioData(ab);
            } catch (err) {
                URL.revokeObjectURL(imgUrl);
                reject(new Error('ไม่สามารถอ่านไฟล์เสียง กรุณาใช้ MP3 หรือ M4A'));
                return;
            }

            const duration = audioBuffer.duration;
            if (!duration || duration <= 0) {
                URL.revokeObjectURL(imgUrl);
                reject(new Error('ไฟล์เสียงมีความยาวไม่ถูกต้อง'));
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const w = img.width,
                h = img.height;
            canvas.width = w;
            canvas.height = h;

            const ZOOM_START = 1.04;
            const ZOOM_END = 1.22;

            function drawFrame(progress) {
                const zoom = ZOOM_START + (ZOOM_END - ZOOM_START) * progress;
                const cx = w / 2,
                    cy = h / 2;
                const sw = w / zoom,
                    sh = h / zoom;
                const sx = cx - sw / 2,
                    sy = cy - sh / 2;
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
            }
            drawFrame(0);

            const canvasStream = canvas.captureStream(30);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            const dest = audioCtx.createMediaStreamDestination();
            source.connect(dest);
            source.start();

            const combined = new MediaStream([...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);

            const mimeType = MediaRecorder.isTypeSupported('video/mp4') ?
                'video/mp4' :
                MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ?
                'video/webm;codecs=vp9' :
                'video/webm';
            const recorder = new MediaRecorder(combined, {
                mimeType: mimeType,
                videoBitsPerSecond: 3000000
            });

            let chunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            let animationId = null;
            let recordingStart = performance.now();

            function animate() {
                const elapsed = (performance.now() - recordingStart) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                drawFrame(progress);
                if (progress < 1) {
                    animationId = requestAnimationFrame(animate);
                } else {
                    drawFrame(1);
                }
            }

            const finishPromise = new Promise((resFinish) => {
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: mimeType });
                    resFinish(blob);
                };
            });

            recorder.start(50);
            recordingStart = performance.now();
            animate();

            const stopTimeout = setTimeout(() => {
                if (recorder.state === 'recording') {
                    recorder.stop();
                    source.stop();
                    audioCtx.close();
                }
                if (animationId) cancelAnimationFrame(animationId);
            }, duration * 1000 + 300);

            source.onended = () => {
                clearTimeout(stopTimeout);
                if (recorder.state === 'recording') {
                    recorder.stop();
                    audioCtx.close();
                }
                if (animationId) cancelAnimationFrame(animationId);
            };

            const finalBlob = await finishPromise;
            URL.revokeObjectURL(imgUrl);
            combined.getTracks().forEach(t => t.stop());
            resolve(finalBlob);
        });
    }

    /* ---- create button ---- */
    createBtn.addEventListener('click', async () => {
        if (isGenerating) return;
        if (!imageFile || !audioFile) {
            alert('❗ กรุณาเลือกรูปภาพและไฟล์เสียงก่อนกด "สร้างวิดีโอ"');
            return;
        }

        isGenerating = true;
        createBtn.disabled = true;
        createBtn.classList.add('loading');
        resultSection.style.display = 'none';
        outputVideo.src = '';
        downloadLink.href = '#';
        videoStatus.textContent = '⏳ กำลังสร้างวิดีโอ …';
        videoStatus.className = 'vg-status';

        showProgress(5, '⏳ กำลังเตรียมไฟล์ …');

        try {
            showProgress(15, '🎬 กำลังประมวลผลวิดีโอ …');
            const blob = await generateVideo(imageFile, audioFile);
            showProgress(95, '✅ เสร็จสิ้น!');
            const url = URL.createObjectURL(blob);
            outputVideo.src = url;
            outputVideo.load();
            downloadLink.href = url;
            downloadLink.download = 'video_' + Date.now() + '.mp4';

            resultSection.style.display = 'block';
            videoStatus.textContent = '✅ พร้อมใช้งาน คลิกเล่นหรือดาวน์โหลด';
            videoStatus.className = 'vg-status success';
            showProgress(100, '✅ เสร็จเรียบร้อย!');
            setTimeout(() => {
                outputVideo.play().catch(() => {});
            }, 400);
        } catch (err) {
            console.error(err);
            videoStatus.textContent = '❌ เกิดข้อผิดพลาด: ' + err.message;
            videoStatus.className = 'vg-status error';
            resultSection.style.display = 'block';
            alert('สร้างวิดีโอไม่สำเร็จ:\n' + err.message);
        } finally {
            isGenerating = false;
            createBtn.disabled = false;
            createBtn.classList.remove('loading');
            setTimeout(hideProgress, 2000);
        }
    });

    /* ---- ✨ วางไฟล์ได้ทุกที่บนหน้าจอ ---- */
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (!files.length) return;

        let droppedImage = null;
        let droppedAudio = null;
        for (let file of files) {
            if (!droppedImage && file.type.startsWith('image/')) {
                droppedImage = file;
            } else if (!droppedAudio && file.type.startsWith('audio/')) {
                droppedAudio = file;
            }
            if (droppedImage && droppedAudio) break;
        }

        if (droppedImage) renderImagePreview(droppedImage);
        if (droppedAudio) renderAudioPreview(droppedAudio);
        if (!droppedImage && !droppedAudio) {
            alert('❌ กรุณาลากไฟล์รูปภาพหรือเสียงเท่านั้น');
        }
    });

    console.log('🎬 Glassmorphism Video Generator (โปร่งแสงสุด) พร้อมใช้งานแล้ว (ลากการ์ดได้ + วางไฟล์ได้ทุกที่)');
})();