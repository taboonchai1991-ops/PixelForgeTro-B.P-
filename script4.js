// ==================== script4.js ====================
// คลังฉากหลังอัจฉริยะ สำหรับ Smart Sharpen Pro
// ฟังก์ชัน: เปลี่ยนพื้นหลัง, เมนูแนวตั้งแบบลากย้ายได้, บันทึกอัตโนมัติ
// สไตล์: กระจกใส (Glassmorphism)
// ลากการ์ด → จับที่แถบสีม่วงตรงหัวข้อ แล้วลากไปวางตรงไหนก็ได้
//
// 🔧 ปรับปรุงเพื่อให้ภาพพื้นหลังคมชัดขึ้น (เพิ่ม contrast, saturate)
//    และแนะนำให้ใช้ภาพความละเอียดสูงเพื่อผลลัพธ์ที่ดีที่สุด
// =====================================================

(function() {
    'use strict';

    // --------------------------------------------------------------
    // 1. คลังฉากหลัง (Background Library)
    // --------------------------------------------------------------
    const backgroundLibrary = [{
        id: "bg_smartsharpen",
        name: "SmartSharpen HD",
        image: "https://od.lk/s/N18yODU5NjQyMTNf/SmartSharpen_HD%20%282%29.png",
        type: "image",
        credit: "ลิงก์จากผู้ใช้"
    }, {
        id: "bg_forest",
        name: "🌲เรือนไทยโบราณ",
        image: "https://od.lk/s/N18yODU5NjQyMTNf/SmartSharpen_HD%20%282%29.png",
        type: "image"
    }, {
        id: "bg_ocean",
        name: "ห้องสมุดพระเครื่อง",
        image: "https://od.lk/s/N18yODQ0OTcxOTdf/789.jpg",
        type: "image"
    }, {
        id: "bg_mountain",
        name: "⛰️ อยุธยา",
        image: "https://od.lk/s/N18yODU5NjQyMTlf/SMART_SHARPEN_PRO.png",
        type: "image"
    }, {
        id: "bg_city",
        name: "🌃 เมืองกลางคืน",
        image: "https://od.lk/s/N18yODU4NTIyNDdf/Untitled-3.jpg",
        type: "image"
    }, {
        id: "bg_default",
        name: "🎨 ลายตาราง (เริ่มต้น)",
        image: "https://www.transparenttextures.com/patterns/cubes.png",
        type: "pattern"
    }];

    // --------------------------------------------------------------
    // 2. ฟังก์ชันช่วยเหลือ
    // --------------------------------------------------------------
    function getBackgroundById(id) {
        return backgroundLibrary.find(bg => bg.id === id);
    }

    function saveCurrentBackground(id) {
        if (getBackgroundById(id)) {
            localStorage.setItem("smartSharpen_lastBgId", id);
            console.log(`💾 บันทึกฉากหลังล่าสุด: ${id}`);
        }
    }

    function loadLastBackground() {
        const lastId = localStorage.getItem("smartSharpen_lastBgId");
        if (lastId && getBackgroundById(lastId)) {
            setBackgroundById(lastId, false);
            console.log(`↩️ โหลดฉากหลังล่าสุด: ${lastId}`);
        } else {
            setBackgroundById("bg_default", false);
        }
    }

    // --------------------------------------------------------------
    // 3. ฟังก์ชันเปลี่ยนพื้นหลัง (หลัก) — ปรับปรุงให้ภาพคมชัดขึ้น
    // --------------------------------------------------------------
    function setBackgroundById(id, shouldSave = true) {
        const bg = getBackgroundById(id);
        if (!bg) {
            console.error(`❌ ไม่พบฉากหลัง id = ${id}`);
            return false;
        }

        const bgElement = document.getElementById("gameBackground");
        if (!bgElement) {
            console.error("❌ ไม่พบ element #gameBackground ในหน้าเว็บ");
            return false;
        }

        // ตั้งค่าพื้นหลังหลัก
        bgElement.style.backgroundImage = `url('${bg.image}')`;
        bgElement.style.backgroundSize = "cover";          // เต็มจอ (อาจทำให้ภาพแตกถ้าความละเอียดต่ำ)
        bgElement.style.backgroundPosition = "center center";
        bgElement.style.backgroundRepeat = bg.type === "pattern" ? "repeat" : "no-repeat";
        bgElement.style.position = "fixed";
        bgElement.style.top = "0";
        bgElement.style.left = "0";
        bgElement.style.width = "100%";
        bgElement.style.height = "100%";
        bgElement.style.zIndex = "-1";
        bgElement.style.transition = "background-image 0.25s ease";

        // ✅ ปรับแต่งให้ภาพคมชัดขึ้น (เพิ่มความคมชัดและความอิ่มตัวเล็กน้อย)
        bgElement.style.imageRendering = "auto";            // ปล่อยให้เบราว์เซอร์จัดการ (ดีที่สุด)
        bgElement.style.filter = "contrast(1.05) saturate(1.1)";  // ช่วยให้ภาพดูมีมิติและคมขึ้น

        // คำแนะนำเพิ่มเติม (แสดงในคอนโซล)
        console.log(`🎨 เปลี่ยนฉากหลังเป็น: ${bg.name}`);
        console.log('💡 หากภาพยังไม่คมชัด ลองเปลี่ยนลิงก์เป็นภาพความละเอียดสูง (≥1920x1080)');

        if (shouldSave) {
            saveCurrentBackground(id);
        }
        return true;
    }

    // --------------------------------------------------------------
    // 4. ฟังก์ชันบันทึก / โหลดตำแหน่งเมนู
    // --------------------------------------------------------------
    function saveMenuPosition(top, left) {
        try {
            localStorage.setItem("smartSharpen_menuPosition", JSON.stringify({ top, left }));
        } catch (e) { /* ignore */ }
    }

    function loadMenuPosition() {
        try {
            const raw = localStorage.getItem("smartSharpen_menuPosition");
            if (raw) {
                const pos = JSON.parse(raw);
                if (typeof pos.top === 'number' && typeof pos.left === 'number') {
                    return pos;
                }
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    // --------------------------------------------------------------
    // 5. สร้างเมนูแบบแนวตั้ง ลากย้ายได้ (Vertical Draggable Panel)
    //    สไตล์กระจกใส (Glassmorphism)
    // --------------------------------------------------------------
    function renderBackgroundMenu(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ ไม่พบ element id='${containerId}'`);
            return;
        }

        // ---- 5a. ล้างของเก่า ----
        container.innerHTML = '';

        // ---- 5b. ตั้งค่าสไตล์หลักของ container (กระจกใส) ----
        container.style.position = 'fixed';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.background = 'rgba(255, 255, 255, 0.08)';
        container.style.backdropFilter = 'blur(20px) saturate(180%)';
        container.style.webkitBackdropFilter = 'blur(20px) saturate(180%)';
        container.style.borderRadius = '24px';
        container.style.border = '1px solid rgba(255, 255, 255, 0.25)';
        container.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.08) inset';
        container.style.padding = '0';
        container.style.minWidth = '220px';
        container.style.maxWidth = '95vw';
        container.style.maxHeight = '80vh';
        container.style.transition = 'opacity 0.2s ease';
        container.style.userSelect = 'none';
        container.style.webkitUserSelect = 'none';
        container.style.touchAction = 'none';

        // ---- 5c. โหลดตำแหน่งที่บันทึกไว้ หรือใช้ค่าเริ่มต้น ----
        const savedPos = loadMenuPosition();
        let currentTop, currentLeft;

        if (savedPos) {
            const maxTop = window.innerHeight - 120;
            const maxLeft = window.innerWidth - 120;
            currentTop = Math.min(Math.max(savedPos.top, 10), maxTop);
            currentLeft = Math.min(Math.max(savedPos.left, 10), maxLeft);
        } else {
            currentTop = Math.max(20, (window.innerHeight - 400) / 2);
            currentLeft = Math.max(20, (window.innerWidth - 260) / 2);
        }

        container.style.top = currentTop + 'px';
        container.style.left = currentLeft + 'px';

        // ---- 5d. สร้างส่วนหัว (Header = drag handle) แบบกระจก ----
        const header = document.createElement('div');
        header.className = 'bg-menu-header';
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.justifyContent = 'space-between';
        header.style.padding = '14px 18px 12px 18px';
        header.style.cursor = 'grab';
        header.style.borderBottom = '1px solid rgba(255,255,255,0.12)';
        header.style.background = 'rgba(255,255,255,0.05)';
        header.style.borderRadius = '24px 24px 0 0';
        header.style.transition = 'background 0.2s';
        header.style.flexShrink = '0';

        // Title
        const title = document.createElement('span');
        title.textContent = '🎨 ฉากหลัง';
        title.style.color = '#ffffff';
        title.style.fontSize = '16px';
        title.style.fontWeight = '600';
        title.style.letterSpacing = '0.3px';
        title.style.display = 'flex';
        title.style.alignItems = 'center';
        title.style.gap = '8px';
        title.style.textShadow = '0 2px 8px rgba(0,0,0,0.3)';

        const dragIcon = document.createElement('span');
        dragIcon.textContent = '⠿';
        dragIcon.style.color = 'rgba(255,255,255,0.6)';
        dragIcon.style.fontSize = '20px';
        dragIcon.style.marginLeft = '6px';
        dragIcon.style.opacity = '0.7';
        title.appendChild(dragIcon);

        // Controls (ปุ่มซ่อน/แสดง + ปุ่มรีเซ็ตตำแหน่ง)
        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.alignItems = 'center';
        controls.style.gap = '6px';

        // ปุ่มซ่อน/แสดง
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '👁️';
        toggleBtn.style.background = 'rgba(255,255,255,0.1)';
        toggleBtn.style.border = '1px solid rgba(255,255,255,0.15)';
        toggleBtn.style.color = '#ffffff';
        toggleBtn.style.width = '34px';
        toggleBtn.style.height = '34px';
        toggleBtn.style.borderRadius = '50%';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.fontSize = '16px';
        toggleBtn.style.display = 'flex';
        toggleBtn.style.alignItems = 'center';
        toggleBtn.style.justifyContent = 'center';
        toggleBtn.style.transition = 'all 0.2s';
        toggleBtn.style.backdropFilter = 'blur(4px)';
        toggleBtn.title = 'ซ่อน/แสดงเมนู';

        toggleBtn.onmouseenter = () => {
            toggleBtn.style.background = 'rgba(255,255,255,0.25)';
            toggleBtn.style.borderColor = 'rgba(255,255,255,0.4)';
        };
        toggleBtn.onmouseleave = () => {
            toggleBtn.style.background = 'rgba(255,255,255,0.1)';
            toggleBtn.style.borderColor = 'rgba(255,255,255,0.15)';
        };

        let menuVisible = true;
        const bodyEl = document.createElement('div');
        bodyEl.className = 'bg-menu-body';
        bodyEl.style.display = 'flex';
        bodyEl.style.flexDirection = 'column';
        bodyEl.style.alignItems = 'stretch';
        bodyEl.style.gap = '6px';
        bodyEl.style.padding = '12px 16px 16px 16px';
        bodyEl.style.overflowY = 'auto';
        bodyEl.style.flex = '1 1 auto';
        bodyEl.style.maxHeight = '60vh';

        // ---- 5e. ปรับแต่ง Scrollbar ให้กลมกลืนกับกระจก ----
        const styleScroll = document.createElement('style');
        styleScroll.textContent = `
                    .bg-menu-body::-webkit-scrollbar {
                        width: 4px;
                    }
                    .bg-menu-body::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.05);
                        border-radius: 4px;
                    }
                    .bg-menu-body::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.25);
                        border-radius: 4px;
                    }
                    .bg-menu-body::-webkit-scrollbar-thumb:hover {
                        background: rgba(255,255,255,0.4);
                    }
                `;
        bodyEl.appendChild(styleScroll);

        toggleBtn.onclick = () => {
            menuVisible = !menuVisible;
            bodyEl.style.display = menuVisible ? 'flex' : 'none';
            toggleBtn.innerHTML = menuVisible ? '👁️' : '🚫';
            toggleBtn.title = menuVisible ? 'ซ่อนเมนู' : 'แสดงเมนู';
        };

        controls.appendChild(toggleBtn);

        // ✅ เพิ่มปุ่มรีเซ็ตตำแหน่งเมนู (อยู่ข้างปุ่มซ่อน)
        const resetPosBtn = document.createElement('button');
        resetPosBtn.innerHTML = '⤵';
        resetPosBtn.style.background = 'rgba(255,255,255,0.1)';
        resetPosBtn.style.border = '1px solid rgba(255,255,255,0.15)';
        resetPosBtn.style.color = '#ffffff';
        resetPosBtn.style.width = '34px';
        resetPosBtn.style.height = '34px';
        resetPosBtn.style.borderRadius = '50%';
        resetPosBtn.style.cursor = 'pointer';
        resetPosBtn.style.fontSize = '16px';
        resetPosBtn.style.display = 'flex';
        resetPosBtn.style.alignItems = 'center';
        resetPosBtn.style.justifyContent = 'center';
        resetPosBtn.style.transition = 'all 0.2s';
        resetPosBtn.style.backdropFilter = 'blur(4px)';
        resetPosBtn.title = 'รีเซ็ตตำแหน่งเมนู';
        resetPosBtn.onmouseenter = () => {
            resetPosBtn.style.background = 'rgba(255,255,255,0.25)';
            resetPosBtn.style.borderColor = 'rgba(255,255,255,0.4)';
        };
        resetPosBtn.onmouseleave = () => {
            resetPosBtn.style.background = 'rgba(255,255,255,0.1)';
            resetPosBtn.style.borderColor = 'rgba(255,255,255,0.15)';
        };
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

        // ---- 5f. สร้างปุ่มเลือกฉากหลัง (แนวตั้ง) แบบกระจก ----
        backgroundLibrary.forEach(bg => {
            const btn = document.createElement('button');
            btn.textContent = bg.name;
            btn.style.width = '100%';
            btn.style.background = 'rgba(255, 255, 255, 0.06)';
            btn.style.border = '1px solid rgba(255, 255, 255, 0.12)';
            btn.style.color = '#ffffff';
            btn.style.padding = '10px 16px';
            btn.style.borderRadius = '40px';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '14px';
            btn.style.fontWeight = '500';
            btn.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            btn.style.whiteSpace = 'nowrap';
            btn.style.textAlign = 'center';
            btn.style.flexShrink = '0';
            btn.style.backdropFilter = 'blur(4px)';
            btn.style.textShadow = '0 1px 4px rgba(0,0,0,0.2)';

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
                    const originalHtml = statusDiv.innerHTML;
                    statusDiv.innerHTML = `<i class="fas fa-palette"></i> เปลี่ยนฉากหลังเป็น: ${bg.name}`;
                    setTimeout(() => {
                        if (statusDiv) statusDiv.innerHTML = originalHtml;
                    }, 1800);
                }
                btn.style.transform = 'scale(0.94)';
                setTimeout(() => { btn.style.transform = ''; }, 150);
            };

            bodyEl.appendChild(btn);
        });

        // ---- 5g. ปุ่มรีเซ็ต (reset) ฉากหลัง ----
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 เริ่มต้น (ลายตาราง)';
        resetBtn.style.width = '100%';
        resetBtn.style.background = 'rgba(255, 255, 255, 0.05)';
        resetBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        resetBtn.style.color = '#f0f0f0';
        resetBtn.style.padding = '10px 16px';
        resetBtn.style.borderRadius = '40px';
        resetBtn.style.cursor = 'pointer';
        resetBtn.style.fontSize = '14px';
        resetBtn.style.fontWeight = '500';
        resetBtn.style.transition = 'all 0.2s';
        resetBtn.style.whiteSpace = 'nowrap';
        resetBtn.style.textAlign = 'center';
        resetBtn.style.flexShrink = '0';
        resetBtn.style.backdropFilter = 'blur(4px)';
        resetBtn.style.textShadow = '0 1px 4px rgba(0,0,0,0.2)';

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

        // ---- 5h. ระบบลากย้าย (Drag) ----
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        function onDragStart(e) {
            if (e.button !== undefined && e.button !== 0) return;
            const target = e.target;
            if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) {
                return;
            }

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

        // ---- 5i. ผูก Events (Mouse + Touch) ----
        header.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);

        header.addEventListener('touchstart', onDragStart, { passive: false });
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd, { passive: false });

        container.addEventListener('dragstart', (e) => e.preventDefault());

        // ---- 5j. ปรับตำแหน่งเมื่อ resize หน้าจอ ----
        function handleResize() {
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
        }

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });

        console.log('✅ เมนูฉากหลังแนวตั้ง (กระจกใส) พร้อมใช้งาน');
        return container;
    }

    // --------------------------------------------------------------
    // 6. เริ่มต้นระบบเมื่อ DOM พร้อม
    // --------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 script4.js: คลังฉากหลังแนวตั้ง (กระจกใส) พร้อมทำงาน');
        console.log('💡 ปรับปรุงภาพให้คมชัดด้วย filter: contrast(1.05) saturate(1.1)');

        if (!document.getElementById('gameBackground')) {
            const newBgDiv = document.createElement('div');
            newBgDiv.id = 'gameBackground';
            document.body.insertBefore(newBgDiv, document.body.firstChild);
        }
        if (!document.getElementById('bgMenu')) {
            const newMenuDiv = document.createElement('div');
            newMenuDiv.id = 'bgMenu';
            document.body.appendChild(newMenuDiv);
        }

        renderBackgroundMenu('bgMenu');
        loadLastBackground();

        console.group('📦 คลังฉากหลังที่โหลด:');
        backgroundLibrary.forEach(bg => console.log(` - ${bg.name} (${bg.id})`));
        console.groupEnd();

        console.log('💡 ลากส่วนหัว "🎨 ฉากหลัง" เพื่อย้ายเมนูไปวางที่ไหนก็ได้');
        console.log('📌 หากภาพยังไม่คมชัด แนะนำให้ใช้ลิงก์ภาพความละเอียดสูง (≥1920x1080)');
    });
})();