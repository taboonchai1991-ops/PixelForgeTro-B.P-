// ================================================================
// script_extra.js — ฟังก์ชันเสริมทั้งหมด (UI, เสียง, ไมค์, พื้นหลัง, Video Generator, Cleanup)
// ใช้ร่วมกับ script_synonyms.js, script_commands.js, script_combined_integrated.js
// ================================================================

(function() {
    'use strict';

    // ============================================================
    // 1. ฟังก์ชันแชท (Chat UI)
    // ============================================================

    let thinkingElement = null;

    function addMessage(container, text, sender) {
        if (!container) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${sender}`;
        msgDiv.textContent = text;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
        return msgDiv;
    }

    function showThinking(container) {
        removeThinking();
        if (!container) return;
        thinkingElement = document.createElement('div');
        thinkingElement.className = 'ai-msg thinking';
        thinkingElement.textContent = '🤔 กำลังคิด...';
        container.appendChild(thinkingElement);
        container.scrollTop = container.scrollHeight;
    }

    function removeThinking() {
        if (thinkingElement && thinkingElement.parentNode) {
            thinkingElement.remove();
            thinkingElement = null;
        }
    }

    // ============================================================
    // 2. ฟังก์ชันเสียงพูด (Text-to-Speech)
    // ============================================================

    function speakText(text, soundEnabled, speechSynth) {
        if (!soundEnabled) return;
        if (!window.speechSynthesis) return;
        if (speechSynth && speechSynth.speaking) {
            speechSynth.cancel();
        }
        const synth = speechSynth || window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        const voices = synth.getVoices();
        const thVoice = voices.find(v => v.lang.startsWith('th'));
        if (thVoice) utterance.voice = thVoice;
        synth.speak(utterance);
    }

    function stopSpeech(speechSynth) {
        const synth = speechSynth || window.speechSynthesis;
        if (synth && synth.speaking) {
            synth.cancel();
        }
    }

    // ============================================================
    // 3. ฟังก์ชันควบคุม UI (PixelForge)
    // ============================================================

    function controlSlider(sliderId, delta) {
        const slider = document.getElementById(sliderId);
        if (!slider) return null;
        let val = parseFloat(slider.value) + delta;
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        val = Math.min(max, Math.max(min, val));
        slider.value = val;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        return val;
    }

    function setSliderValue(sliderId, value) {
        const slider = document.getElementById(sliderId);
        if (!slider) return;
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        slider.value = Math.min(max, Math.max(min, value));
        slider.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function triggerButton(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    }

    function resetAllAdjustments() {
        const ids = ['brightness', 'contrast', 'saturation', 'blur'];
        ids.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.value = 0;
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        const filterSelect = document.getElementById('filterSelect');
        if (filterSelect) filterSelect.value = 'none';
        const removeFilterBtn = document.getElementById('removeFilterBtn');
        if (removeFilterBtn) removeFilterBtn.click();
        return 'รีเซ็ตการปรับแต่งทั้งหมดแล้วครับ 🔄';
    }

    // ============================================================
    // 4. ฟังก์ชันเปลี่ยนสีการ์ดแชท
    // ============================================================

    function changeBackground(widget, header, sendBtn) {
        const colors = [
            'rgba(255, 99, 132, 0.25)',
            'rgba(54, 162, 235, 0.25)',
            'rgba(255, 206, 86, 0.25)',
            'rgba(75, 192, 192, 0.25)',
            'rgba(153, 102, 255, 0.25)',
            'rgba(255, 159, 64, 0.25)',
            'rgba(199, 62, 133, 0.25)',
            'rgba(46, 204, 113, 0.25)',
            'rgba(231, 76, 60, 0.25)',
            'rgba(52, 152, 219, 0.25)',
            'rgba(155, 89, 182, 0.25)',
            'rgba(26, 188, 156, 0.25)',
            'rgba(241, 196, 15, 0.25)',
            'rgba(230, 126, 34, 0.25)',
            'rgba(236, 240, 241, 0.25)'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        if (widget) widget.style.background = randomColor;
        if (header) header.style.background = randomColor.replace('0.25', '0.5');
        if (sendBtn) sendBtn.style.background = randomColor.replace('0.25', '0.7');
        return 'เปลี่ยนสีการ์ดแชทให้แล้วครับเจ้านาย! 🎨';
    }

    // ============================================================
    // 5. ฟังก์ชันเปลี่ยนพื้นหลัง (Background)
    // ============================================================

    const backgroundLibrary = [
        { id: "bg_smartsharpen", name: "SmartSharpen HD", image: "https://od.lk/s/N18yODU5NjQyMTNf/SmartSharpen_HD%20%282%29.png", type: "image" },
        { id: "bg_forest", name: "🌲 เรือนไทยโบราณ", image: "https://od.lk/s/N18yODU5NjQyMTNf/SmartSharpen_HD%20%282%29.png", type: "image" },
        { id: "bg_ocean", name: "📚 ห้องสมุดพระเครื่อง", image: "https://od.lk/s/N18yODQ0OTcxOTdf/789.jpg", type: "image" },
        { id: "bg_mountain", name: "⛰️ อยุธยา", image: "https://od.lk/s/N18yODU5NjQyMTlf/SMART_SHARPEN_PRO.png", type: "image" },
        { id: "bg_city", name: "🌃 เมืองกลางคืน", image: "https://od.lk/s/N18yODU4NTIyNDdf/Untitled-3.jpg", type: "image" },
        { id: "bg_default", name: "🎨 ลายตาราง (เริ่มต้น)", image: "https://www.transparenttextures.com/patterns/cubes.png", type: "pattern" }
    ];

    function getBackgroundById(id) {
        return backgroundLibrary.find(bg => bg.id === id);
    }

    function saveCurrentBackground(id) {
        if (getBackgroundById(id)) {
            localStorage.setItem("smartSharpen_lastBgId", id);
        }
    }

    function loadLastBackground() {
        const lastId = localStorage.getItem("smartSharpen_lastBgId");
        if (lastId && getBackgroundById(lastId)) {
            setBackgroundById(lastId, false);
            return true;
        } else {
            setBackgroundById("bg_default", false);
            return false;
        }
    }

    function setBackgroundById(id, shouldSave = true) {
        const bg = getBackgroundById(id);
        if (!bg) {
            console.error(`❌ ไม่พบฉากหลัง id = ${id}`);
            return false;
        }

        const bgElement = document.getElementById("gameBackground");
        if (!bgElement) {
            console.error("❌ ไม่พบ element #gameBackground");
            return false;
        }

        bgElement.style.backgroundImage = `url('${bg.image}')`;
        bgElement.style.backgroundSize = "cover";
        bgElement.style.backgroundPosition = "center center";
        bgElement.style.backgroundRepeat = bg.type === "pattern" ? "repeat" : "no-repeat";
        bgElement.style.position = "fixed";
        bgElement.style.top = "0";
        bgElement.style.left = "0";
        bgElement.style.width = "100%";
        bgElement.style.height = "100%";
        bgElement.style.zIndex = "-1";
        bgElement.style.transition = "background-image 0.25s ease";
        bgElement.style.imageRendering = "auto";
        bgElement.style.filter = "contrast(1.05) saturate(1.1)";

        console.log(`🎨 เปลี่ยนฉากหลังเป็น: ${bg.name}`);
        if (shouldSave) saveCurrentBackground(id);
        return true;
    }

    function changeAppBackground() {
        const colors = [
            'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
            'linear-gradient(135deg, #2d1b3d, #1b1b2f, #0f0f1f)',
            'linear-gradient(135deg, #1e3c72, #2a5298)',
            'linear-gradient(135deg, #232526, #414345)',
            'linear-gradient(135deg, #141e30, #243b55)',
            'linear-gradient(135deg, #0b0c10, #1f2833)',
            'linear-gradient(135deg, #20002c, #cbb4d4)',
            'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
        ];
        const randomGrad = colors[Math.floor(Math.random() * colors.length)];
        document.body.style.background = randomGrad;
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundSize = 'cover';
        return 'เปลี่ยนพื้นหลังแอปให้แล้วครับเจ้านาย! 🌌';
    }

    // ============================================================
    // 6. ฟังก์ชันเมนูฉากหลัง (Glassmorphism, ลากได้)
    // ============================================================

    function saveMenuPosition(top, left) {
        try {
            localStorage.setItem("smartSharpen_menuPosition", JSON.stringify({ top, left }));
        } catch (e) {}
    }

    function loadMenuPosition() {
        try {
            const raw = localStorage.getItem("smartSharpen_menuPosition");
            if (raw) {
                const pos = JSON.parse(raw);
                if (typeof pos.top === 'number' && typeof pos.left === 'number') return pos;
            }
        } catch (e) {}
        return null;
    }

    function renderBackgroundMenu(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ ไม่พบ element id='${containerId}'`);
            return;
        }
        container.innerHTML = '';

        Object.assign(container.style, {
            position: 'fixed',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.08) inset',
            padding: '0',
            minWidth: '220px',
            maxWidth: '95vw',
            maxHeight: '80vh',
            transition: 'opacity 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none'
        });

        const savedPos = loadMenuPosition();
        let top, left;
        if (savedPos) {
            const maxTop = window.innerHeight - 120;
            const maxLeft = window.innerWidth - 120;
            top = Math.min(Math.max(savedPos.top, 10), maxTop);
            left = Math.min(Math.max(savedPos.left, 10), maxLeft);
        } else {
            top = Math.max(20, (window.innerHeight - 400) / 2);
            left = Math.max(20, (window.innerWidth - 260) / 2);
        }
        container.style.top = top + 'px';
        container.style.left = left + 'px';

        const header = document.createElement('div');
        header.className = 'bg-menu-header';
        Object.assign(header.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px 12px 18px',
            cursor: 'grab',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '24px 24px 0 0',
            transition: 'background 0.2s',
            flexShrink: '0'
        });

        const title = document.createElement('span');
        title.textContent = '🎨 ฉากหลัง';
        Object.assign(title.style, {
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
        });
        const dragIcon = document.createElement('span');
        dragIcon.textContent = '⠿';
        dragIcon.style.cssText = 'color:rgba(255,255,255,0.6);font-size:20px;margin-left:6px;opacity:0.7;';
        title.appendChild(dragIcon);

        const controls = document.createElement('div');
        controls.style.cssText = 'display:flex;align-items:center;gap:6px;';

        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '👁️';
        Object.assign(toggleBtn.style, {
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)'
        });
        let menuVisible = true;
        const bodyEl = document.createElement('div');
        bodyEl.className = 'bg-menu-body';
        Object.assign(bodyEl.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '6px',
            padding: '12px 16px 16px 16px',
            overflowY: 'auto',
            flex: '1 1 auto',
            maxHeight: '60vh'
        });

        const styleScroll = document.createElement('style');
        styleScroll.textContent = `
            .bg-menu-body::-webkit-scrollbar { width: 4px; }
            .bg-menu-body::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
            .bg-menu-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 4px; }
            .bg-menu-body::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
        `;
        bodyEl.appendChild(styleScroll);

        toggleBtn.onclick = () => {
            menuVisible = !menuVisible;
            bodyEl.style.display = menuVisible ? 'flex' : 'none';
            toggleBtn.innerHTML = menuVisible ? '👁️' : '🚫';
            toggleBtn.title = menuVisible ? 'ซ่อนเมนู' : 'แสดงเมนู';
        };
        controls.appendChild(toggleBtn);

        const resetPosBtn = document.createElement('button');
        resetPosBtn.innerHTML = '⤵';
        Object.assign(resetPosBtn.style, {
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)'
        });
        resetPosBtn.title = 'รีเซ็ตตำแหน่งเมนู';
        resetPosBtn.onclick = (e) => {
            e.stopPropagation();
            const newTop = Math.max(20, (window.innerHeight - container.offsetHeight) / 2);
            const newLeft = Math.max(20, (window.innerWidth - container.offsetWidth) / 2);
            container.style.top = newTop + 'px';
            container.style.left = newLeft + 'px';
            saveMenuPosition(newTop, newLeft);
            resetPosBtn.style.transform = 'scale(0.9)';
            setTimeout(() => { resetPosBtn.style.transform = ''; }, 150);
        };
        controls.appendChild(resetPosBtn);

        header.appendChild(title);
        header.appendChild(controls);
        container.appendChild(header);

        backgroundLibrary.forEach(bg => {
            const btn = document.createElement('button');
            btn.textContent = bg.name;
            Object.assign(btn.style, {
                width: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                padding: '10px 16px',
                borderRadius: '40px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                flexShrink: '0',
                backdropFilter: 'blur(4px)',
                textShadow: '0 1px 4px rgba(0,0,0,0.2)'
            });
            btn.onmouseenter = () => {
                btn.style.background = 'rgba(255, 255, 255, 0.18)';
                btn.style.transform = 'translateY(-2px) scale(1.02)';
                btn.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                btn.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.1) inset';
            };
            btn.onmouseleave = () => {
                btn.style.background = 'rgba(255, 255, 255, 0.06)';
                btn.style.transform = 'translateY(0) scale(1)';
                btn.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            };
            btn.onclick = (e) => {
                e.stopPropagation();
                setBackgroundById(bg.id);
                const statusDiv = document.getElementById('imageStatus');
                if (statusDiv) {
                    const original = statusDiv.innerHTML;
                    statusDiv.innerHTML = `🎨 เปลี่ยนฉากหลังเป็น: ${bg.name}`;
                    setTimeout(() => { statusDiv.innerHTML = original; }, 1800);
                }
                btn.style.transform = 'scale(0.94)';
                setTimeout(() => { btn.style.transform = ''; }, 150);
            };
            bodyEl.appendChild(btn);
        });

        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 เริ่มต้น (ลายตาราง)';
        Object.assign(resetBtn.style, {
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f0f0f0',
            padding: '10px 16px',
            borderRadius: '40px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            flexShrink: '0',
            backdropFilter: 'blur(4px)',
            textShadow: '0 1px 4px rgba(0,0,0,0.2)'
        });
        resetBtn.onmouseenter = () => {
            resetBtn.style.background = 'rgba(255, 255, 255, 0.15)';
            resetBtn.style.transform = 'translateY(-2px)';
            resetBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        };
        resetBtn.onmouseleave = () => {
            resetBtn.style.background = 'rgba(255, 255, 255, 0.05)';
            resetBtn.style.transform = 'translateY(0)';
            resetBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        };
        resetBtn.onclick = (e) => {
            e.stopPropagation();
            setBackgroundById('bg_default');
            resetBtn.style.transform = 'scale(0.94)';
            setTimeout(() => { resetBtn.style.transform = ''; }, 150);
        };
        bodyEl.appendChild(resetBtn);

        container.appendChild(bodyEl);

        let isDragging = false;
        let dragOffsetX = 0, dragOffsetY = 0;

        function onDragStart(e) {
            if (e.button !== undefined && e.button !== 0) return;
            const target = e.target;
            if (target.tagName === 'BUTTON' || target.closest('button')) return;
            isDragging = true;
            const rect = container.getBoundingClientRect();
            const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
            const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
            dragOffsetX = clientX - rect.left;
            dragOffsetY = clientY - rect.top;
            container.style.cursor = 'grabbing';
            container.style.transition = 'none';
            header.style.cursor = 'grabbing';
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            e.preventDefault?.();
        }

        function onDragMove(e) {
            if (!isDragging) return;
            const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
            const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
            let newLeft = clientX - dragOffsetX;
            let newTop = clientY - dragOffsetY;
            const margin = 8;
            const maxLeft = window.innerWidth - container.offsetWidth - margin;
            const maxTop = window.innerHeight - container.offsetHeight - margin;
            newLeft = Math.max(margin, Math.min(newLeft, maxLeft));
            newTop = Math.max(margin, Math.min(newTop, maxTop));
            container.style.left = newLeft + 'px';
            container.style.top = newTop + 'px';
            e.preventDefault?.();
        }

        function onDragEnd(e) {
            if (!isDragging) return;
            isDragging = false;
            container.style.cursor = '';
            header.style.cursor = 'grab';
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            container.style.transition = '';
            const rect = container.getBoundingClientRect();
            saveMenuPosition(rect.top, rect.left);
            e.preventDefault?.();
        }

        header.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        header.addEventListener('touchstart', onDragStart, { passive: false });
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd, { passive: false });
        container.addEventListener('dragstart', (e) => e.preventDefault());

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const rect = container.getBoundingClientRect();
                const margin = 8;
                const maxLeft = window.innerWidth - container.offsetWidth - margin;
                const maxTop = window.innerHeight - container.offsetHeight - margin;
                let newLeft = Math.max(margin, Math.min(rect.left, maxLeft));
                let newTop = Math.max(margin, Math.min(rect.top, maxTop));
                if (newLeft !== rect.left || newTop !== rect.top) {
                    container.style.left = newLeft + 'px';
                    container.style.top = newTop + 'px';
                    saveMenuPosition(newTop, newLeft);
                }
            }, 150);
        });

        console.log('✅ เมนูฉากหลังแนวตั้ง (กระจกใส) พร้อมใช้งาน');
        return container;
    }

    // ============================================================
    // 7. ฟังก์ชัน Video Generator
    // ============================================================

    const videoGenState = {
        imageFile: null,
        audioFile: null,
        imageDataUrl: null,
        audioBlobUrl: null,
        isGenerating: false,
        outputBlob: null
    };

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

    function renderImagePreview(file) {
        const imagePlaceholder = document.getElementById('imagePlaceholder');
        const imagePreview = document.getElementById('imagePreview');
        const imageMeta = document.getElementById('imageMeta');
        const imageZone = document.getElementById('imageZone');
        const triggerImage = document.getElementById('triggerImageSelect');
        const imageInput = document.getElementById('imageFileInput');

        if (!file) {
            if (imagePlaceholder) {
                imagePlaceholder.style.display = 'flex';
                imagePlaceholder.innerHTML = `<span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">JPG, PNG, WEBP</span>`;
            }
            if (imagePreview) {
                imagePreview.querySelectorAll('img, .btn-clear-file').forEach(el => el.remove());
            }
            if (imageMeta) imageMeta.textContent = '';
            if (imageZone) imageZone.classList.remove('has-file');
            videoGenState.imageFile = null;
            videoGenState.imageDataUrl = null;
            if (triggerImage) triggerImage.style.display = 'none';
            if (imageInput) imageInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            videoGenState.imageDataUrl = e.target.result;
            if (imagePlaceholder) imagePlaceholder.style.display = 'none';
            if (imagePreview) {
                imagePreview.querySelectorAll('img, .btn-clear-file').forEach(el => el.remove());
                const img = document.createElement('img');
                img.src = videoGenState.imageDataUrl;
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
            }
            if (imageMeta) imageMeta.textContent = '✅ ' + file.name + ' (' + formatSize(file.size) + ')';
            if (imageZone) imageZone.classList.add('has-file');
            videoGenState.imageFile = file;
            if (triggerImage) triggerImage.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function renderAudioPreview(file) {
        const audioPlaceholder = document.getElementById('audioPlaceholder');
        const audioPreview = document.getElementById('audioPreview');
        const audioMeta = document.getElementById('audioMeta');
        const audioZone = document.getElementById('audioZone');
        const triggerAudio = document.getElementById('triggerAudioSelect');
        const audioInput = document.getElementById('audioFileInput');

        if (!file) {
            if (audioPlaceholder) {
                audioPlaceholder.style.display = 'flex';
                audioPlaceholder.innerHTML = `<span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">MP3, M4A, WAV</span>`;
            }
            if (audioPreview) {
                audioPreview.querySelectorAll('.audio-label, .btn-clear-file').forEach(el => el.remove());
            }
            if (audioMeta) audioMeta.textContent = '';
            if (audioZone) audioZone.classList.remove('has-file');
            if (videoGenState.audioBlobUrl) {
                URL.revokeObjectURL(videoGenState.audioBlobUrl);
                videoGenState.audioBlobUrl = null;
            }
            videoGenState.audioFile = null;
            if (triggerAudio) triggerAudio.style.display = 'none';
            if (audioInput) audioInput.value = '';
            return;
        }

        if (audioPlaceholder) audioPlaceholder.style.display = 'none';
        if (audioPreview) {
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
        }
        if (audioMeta) audioMeta.textContent = '🎧 ' + file.name + ' (' + formatSize(file.size) + ')';
        if (audioZone) audioZone.classList.add('has-file');

        if (videoGenState.audioBlobUrl) URL.revokeObjectURL(videoGenState.audioBlobUrl);
        videoGenState.audioBlobUrl = URL.createObjectURL(file);
        videoGenState.audioFile = file;
        if (triggerAudio) triggerAudio.style.display = 'none';
    }

    function clearImage() {
        const imageInput = document.getElementById('imageFileInput');
        if (imageInput) imageInput.value = '';
        renderImagePreview(null);
        const imagePlaceholder = document.getElementById('imagePlaceholder');
        if (imagePlaceholder) {
            imagePlaceholder.style.display = 'flex';
            imagePlaceholder.innerHTML = `<span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">JPG, PNG, WEBP</span>`;
        }
        const triggerImage = document.getElementById('triggerImageSelect');
        if (triggerImage) triggerImage.style.display = 'none';
    }

    function clearAudio() {
        const audioInput = document.getElementById('audioFileInput');
        if (audioInput) audioInput.value = '';
        if (videoGenState.audioBlobUrl) {
            URL.revokeObjectURL(videoGenState.audioBlobUrl);
            videoGenState.audioBlobUrl = null;
        }
        renderAudioPreview(null);
        const audioPlaceholder = document.getElementById('audioPlaceholder');
        if (audioPlaceholder) {
            audioPlaceholder.style.display = 'flex';
            audioPlaceholder.innerHTML = `<span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">MP3, M4A, WAV</span>`;
        }
        const triggerAudio = document.getElementById('triggerAudioSelect');
        if (triggerAudio) triggerAudio.style.display = 'none';
    }

    function setupDropZone(zone, isImage) {
        if (!zone) return;
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

    async function generateVideo(imageFile, audioFile, onProgress) {
        if (!imageFile || !audioFile) {
            throw new Error('กรุณาเลือกรูปและเสียงก่อน');
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
            throw new Error('ไม่สามารถอ่านไฟล์เสียง กรุณาใช้ MP3 หรือ M4A');
        }

        const duration = audioBuffer.duration;
        if (!duration || duration <= 0) {
            URL.revokeObjectURL(imgUrl);
            throw new Error('ไฟล์เสียงมีความยาวไม่ถูกต้อง');
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
            if (onProgress) onProgress(progress * 80 + 15);
            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                drawFrame(1);
                if (onProgress) onProgress(95);
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
        return finalBlob;
    }

    async function triggerVideoGeneration() {
        const imageFile = videoGenState.imageFile;
        const audioFile = videoGenState.audioFile;
        if (!imageFile || !audioFile) {
            return '❗ กรุณาเลือกรูปภาพและไฟล์เสียงก่อน';
        }

        const progressWrap = document.getElementById('progressWrap');
        const progressBar = document.getElementById('progressBar');
        const progressLabel = document.getElementById('progressLabel');
        const resultSection = document.getElementById('resultSection');
        const outputVideo = document.getElementById('outputVideo');
        const downloadLink = document.getElementById('downloadLink');
        const videoStatus = document.getElementById('videoStatus');
        const createBtn = document.getElementById('createBtn');

        if (!progressWrap || !progressBar) return '❌ ไม่พบ element สำหรับแสดงความคืบหน้า';

        try {
            if (createBtn) {
                createBtn.disabled = true;
                createBtn.classList.add('loading');
            }
            if (resultSection) resultSection.style.display = 'none';
            if (videoStatus) {
                videoStatus.textContent = '⏳ กำลังสร้างวิดีโอ …';
                videoStatus.className = 'vg-status';
            }

            progressWrap.style.opacity = '1';
            progressBar.style.width = '5%';
            if (progressLabel) progressLabel.textContent = '⏳ กำลังเตรียมไฟล์ …';

            const blob = await generateVideo(imageFile, audioFile, (percent) => {
                progressBar.style.width = Math.min(100, percent) + '%';
                if (progressLabel) progressLabel.textContent = `🎬 กำลังประมวลผล ${Math.round(percent)}%`;
            });

            progressBar.style.width = '100%';
            if (progressLabel) progressLabel.textContent = '✅ เสร็จสิ้น!';

            const url = URL.createObjectURL(blob);
            if (outputVideo) {
                outputVideo.src = url;
                outputVideo.load();
            }
            if (downloadLink) {
                downloadLink.href = url;
                downloadLink.download = 'video_' + Date.now() + '.mp4';
            }
            if (resultSection) resultSection.style.display = 'block';
            if (videoStatus) {
                videoStatus.textContent = '✅ พร้อมใช้งาน คลิกเล่นหรือดาวน์โหลด';
                videoStatus.className = 'vg-status success';
            }

            setTimeout(() => {
                if (outputVideo) outputVideo.play().catch(() => {});
            }, 400);

            videoGenState.outputBlob = blob;
            return '✅ สร้างวิดีโอสำเร็จแล้วครับ!';
        } catch (err) {
            console.error(err);
            if (videoStatus) {
                videoStatus.textContent = '❌ เกิดข้อผิดพลาด: ' + err.message;
                videoStatus.className = 'vg-status error';
            }
            if (resultSection) resultSection.style.display = 'block';
            return '❌ สร้างวิดีโอไม่สำเร็จ: ' + err.message;
        } finally {
            if (createBtn) {
                createBtn.disabled = false;
                createBtn.classList.remove('loading');
            }
            setTimeout(() => {
                progressWrap.style.opacity = '0';
                progressBar.style.width = '0%';
                if (progressLabel) progressLabel.textContent = '⏳ รอเริ่ม...';
            }, 2000);
        }
    }

    // ============================================================
    // 8. ฟังก์ชันไมโครโฟน (Speech-to-Text)
    // ============================================================

    let micIsListening = false;

    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;
        const recog = new SpeechRecognition();
        recog.lang = 'th-TH';
        recog.continuous = false;
        recog.interimResults = true;
        recog.maxAlternatives = 1;
        return recog;
    }

    function startListening(micBtn, inputField, recognition) {
        if (!recognition) return;
        try {
            recognition.start();
            micIsListening = true;
            micBtn.classList.add('listening');
            micBtn.textContent = '⏹️';
            micBtn.title = 'หยุดฟัง';
            inputField.placeholder = '🎤 กำลังฟัง... พูดเลยครับ';
        } catch (e) {
            console.warn('Speech start error:', e);
        }
    }

    function stopListening(micBtn, inputField, recognition) {
        if (recognition) {
            try { recognition.stop(); } catch (e) {}
        }
        micIsListening = false;
        micBtn.classList.remove('listening');
        micBtn.textContent = '🎤';
        micBtn.title = 'พิมพ์ด้วยเสียง';
        if (inputField.placeholder === '🎤 กำลังฟัง... พูดเลยครับ') {
            inputField.placeholder = 'พิมพ์หรือพูดข้อความ...';
        }
    }

    function setupRecognitionEvents(recognition, micBtn, inputField, sendMessageCallback) {
        if (!recognition) return;
        recognition.onresult = function(event) {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            if (interimTranscript) {
                inputField.value = interimTranscript;
            }
            if (finalTranscript) {
                inputField.value = finalTranscript.trim();
                stopListening(micBtn, inputField, recognition);
                sendMessageCallback();
            }
        };
        recognition.onerror = function(event) {
            if (event.error === 'no-speech') {
                stopListening(micBtn, inputField, recognition);
                inputField.placeholder = 'ไม่ได้ยินเสียงครับ พิมพ์แทนก็ได้นะ';
                setTimeout(() => {
                    if (inputField.placeholder === 'ไม่ได้ยินเสียงครับ พิมพ์แทนก็ได้นะ') {
                        inputField.placeholder = 'พิมพ์หรือพูดข้อความ...';
                    }
                }, 2000);
            }
            stopListening(micBtn, inputField, recognition);
        };
        recognition.onend = function() {
            if (micIsListening) stopListening(micBtn, inputField, recognition);
            if (inputField.placeholder === '🎤 กำลังฟัง... พูดเลยครับ') {
                inputField.placeholder = 'พิมพ์หรือพูดข้อความ...';
            }
        };
    }

    // ============================================================
    // 9. ฟังก์ชันล้างขยะ (Cleanup Garbage)
    // ============================================================

    function cleanupGarbage() {
        console.log('[🧹 Cleanup] กำลังล้างขยะก่อนปิดหน้า...');

        // 1. ยกเลิก Web Worker
        if (window.worker) {
            try {
                window.worker.terminate();
                window.worker = null;
            } catch (e) {}
        }

        // 2. ยกเลิก AbortController
        if (window.abortController) {
            try {
                window.abortController.abort();
                window.abortController = null;
            } catch (e) {}
        }

        // 3. Revoke blob URLs ทั้งหมด
        const allElements = document.querySelectorAll('[src], [href]');
        for (let el of allElements) {
            const url = el.src || el.href;
            if (url && url.startsWith('blob:')) {
                try {
                    URL.revokeObjectURL(url);
                } catch (e) {}
            }
        }

        // 4. ล้าง localStorage keys
        const keys = [
            'autosave_pro',
            'ssp_image_bg_color',
            'editorState',
            'smartSharpenSettings',
            'smartSharpen_lastBgId',
            'smartSharpen_menuPosition'
        ];
        keys.forEach(key => {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
            }
        });

        // 5. ล้าง sessionStorage
        if (sessionStorage.length > 0) {
            try {
                sessionStorage.clear();
            } catch (e) {}
        }

        // 6. ล้าง IndexedDB
        if ('indexedDB' in window) {
            const dbs = [
                'background-removal-cache',
                'imgly-cache',
                'sharp-cache',
                'ModelCache',
                'removeBackground'
            ];
            dbs.forEach(dbName => {
                try {
                    indexedDB.deleteDatabase(dbName);
                } catch (e) {}
            });
        }

        // 7. ล้าง Cache Storage
        if ('caches' in window) {
            caches.keys().then(keys => {
                keys.forEach(key => {
                    if (key.includes('background-removal') ||
                        key.includes('imgly') ||
                        key.includes('sharp') ||
                        key.includes('cache') ||
                        key.includes('model')) {
                        caches.delete(key).catch(() => {});
                    }
                });
            }).catch(() => {});
        }

        // 8. หยุด SpeechRecognition (ถ้ามีใน window._recognition)
        if (window._recognition) {
            try {
                window._recognition.abort();
                window._recognition = null;
            } catch (e) {}
        }

        // 9. เคลียร์ Video Generator State
        if (videoGenState) {
            try {
                if (videoGenState.audioBlobUrl) {
                    URL.revokeObjectURL(videoGenState.audioBlobUrl);
                }
                if (videoGenState.outputBlob) {
                    URL.revokeObjectURL(videoGenState.outputBlob);
                }
                videoGenState.imageFile = null;
                videoGenState.audioFile = null;
                videoGenState.imageDataUrl = null;
                videoGenState.audioBlobUrl = null;
                videoGenState.outputBlob = null;
                videoGenState.isGenerating = false;
            } catch (e) {}
        }

        // 10. ล้างประวัติการสนทนา
        if (window.conversationContext) {
            try {
                window.conversationContext.history = [];
                window.conversationContext.userName = null;
            } catch (e) {}
        }

        console.log('[🧹 Cleanup] ล้างขยะเสร็จ (ก่อนปิดหน้า)');
    }

    // ============================================================
    // 10. Export
    // ============================================================

    window.Extra = {
        // Chat
        addMessage,
        showThinking,
        removeThinking,
        // Speech
        speakText,
        stopSpeech,
        // UI Control
        controlSlider,
        setSliderValue,
        triggerButton,
        resetAllAdjustments,
        // Background
        backgroundLibrary,
        getBackgroundById,
        saveCurrentBackground,
        loadLastBackground,
        setBackgroundById,
        changeAppBackground,
        renderBackgroundMenu,
        saveMenuPosition,
        loadMenuPosition,
        // Video Generator
        videoGenState,
        formatSize,
        escapeHtml,
        renderImagePreview,
        renderAudioPreview,
        clearImage,
        clearAudio,
        setupDropZone,
        generateVideo,
        triggerVideoGeneration,
        // Microphone
        initSpeechRecognition,
        startListening,
        stopListening,
        setupRecognitionEvents,
        // Chat Widget
        changeBackground,
        // Cleanup
        cleanupGarbage
    };

    console.log('✅ Extra functions loaded:', Object.keys(window.Extra).length, 'functions');

})();