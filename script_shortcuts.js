// ================================================================
// script_shortcuts.js — จัดการปุ่มลัด (Keyboard Shortcuts)
// ปรับปรุงให้มีเสถียรภาพและขยายได้ง่ายขึ้น
// ใช้ร่วมกับ script_extra.js, script_commands.js, script_combined_integrated.js
// ================================================================

(function() {
    'use strict';

    /**
     * ฟังก์ชันหลักสำหรับเริ่มต้นระบบปุ่มลัด
     * @param {Object} deps - dependencies ที่จำเป็น
     * @param {Function} deps.sendMessage - ฟังก์ชันส่งข้อความ
     * @param {HTMLElement} deps.messagesContainer - container สำหรับแสดงข้อความ
     * @param {Object} deps.extra - วัตถุที่มีเมธอด addMessage และ speakText
     * @param {boolean} deps.soundEnabled - เปิด/ปิดเสียง
     * @param {Object} deps.speechSynth - ตัวสังเคราะห์เสียง
     * @param {HTMLElement} deps.inputField - input field (ถ้ามี)
     * @returns {Object} API สำหรับจัดการปุ่มลัด { addShortcut, removeShortcut, listShortcuts }
     */
    function initShortcuts(deps) {
        // ตรวจสอบ dependencies ที่จำเป็น
        const {
            sendMessage,
            messagesContainer,
            extra,
            soundEnabled,
            speechSynth,
            inputField
        } = deps;

        if (!sendMessage || !messagesContainer || !extra) {
            console.warn('⚠️ script_shortcuts: Missing dependencies, shortcuts disabled.');
            return {
                addShortcut: () => {},
                removeShortcut: () => {},
                listShortcuts: () => []
            };
        }

        // Map เก็บปุ่มลัดทั้งหมด
        // key: string เช่น "1", "Ctrl+1", "Shift+A"
        // value: function ที่จะเรียกเมื่อกดปุ่ม
        const shortcuts = new Map();

        // ฟังก์ชันช่วยเพิ่มข้อความและพูด
        function notify(message, speak = true) {
            extra.addMessage(messagesContainer, message, 'bot');
            if (speak) {
                extra.speakText(message, soundEnabled, speechSynth);
            }
        }

        // ---------- กำหนดปุ่มลัดเริ่มต้น ----------

        // ปุ่มลัดตัวเลขเดี่ยว
        shortcuts.set('1', () => {
            sendMessage('ลบพื้นหลัง');
            console.log('⌨️ Shortcut 1: Remove Background');
        });

        shortcuts.set('2', () => {
            messagesContainer.innerHTML = '';
            notify('🗑️ ล้างข้อความทั้งหมดแล้ว');
            console.log('⌨️ Shortcut 2: Clear Chat');
        });

        // เปลี่ยนปุ่ม 3 ให้เป็นอัปโหลดรูป (แทนที่การปรับความสว่าง)
        shortcuts.set('3', () => {
            if (typeof window.uploadImage === 'function') {
                window.uploadImage();
                notify('📤 กำลังอัปโหลดรูป...');
            } else {
                notify('❌ ไม่พบฟังก์ชันอัปโหลดรูป');
            }
            console.log('⌨️ Shortcut 3: Upload Image');
        });

        // เปลี่ยนปุ่ม 4 ให้เป็นดาวน์โหลดรูป (แทนที่การปรับความคมชัด)
        shortcuts.set('4', () => {
            if (typeof window.downloadImage === 'function') {
                window.downloadImage();
                notify('📥 กำลังดาวน์โหลดรูป...');
            } else {
                notify('❌ ไม่พบฟังก์ชันดาวน์โหลดรูป');
            }
            console.log('⌨️ Shortcut 4: Download Image');
        });

        // เปลี่ยนปุ่ม 5 ให้เป็นสร้างวิดีโอ (แทนที่การปรับความอิ่มสี)
        shortcuts.set('5', () => {
            if (typeof window.createVideo === 'function') {
                window.createVideo();
                notify('🎬 กำลังสร้างวิดีโอ...');
            } else {
                notify('❌ ไม่พบฟังก์ชันสร้างวิดีโอ');
            }
            console.log('⌨️ Shortcut 5: Create Video');
        });

        // ปุ่ม 6-0 ยังคงเดิม (หมุน, กลับซ้ายขวา, กลับบนล่าง, ขาวดำ, รีเซ็ต)
        shortcuts.set('6', () => {
            sendMessage('หมุน');
            console.log('⌨️ Shortcut 6: Rotate');
        });

        shortcuts.set('7', () => {
            sendMessage('กลับซ้ายขวา');
            console.log('⌨️ Shortcut 7: Flip Horizontal');
        });

        shortcuts.set('8', () => {
            sendMessage('กลับบนล่าง');
            console.log('⌨️ Shortcut 8: Flip Vertical');
        });

        shortcuts.set('9', () => {
            sendMessage('ขาวดำ');
            console.log('⌨️ Shortcut 9: Grayscale Filter');
        });

        shortcuts.set('0', () => {
            sendMessage('รีเซ็ตปรับแต่ง');
            console.log('⌨️ Shortcut 0: Reset Adjustment');
        });

        // ปุ่มลัด Ctrl+ตัวเลข (เรียกใช้ฟังก์ชัน global)
        shortcuts.set('Ctrl+1', () => {
            if (typeof window.uploadImage === 'function') {
                window.uploadImage();
                notify('📤 กำลังอัปโหลดรูป...');
            } else {
                notify('❌ ไม่พบฟังก์ชันอัปโหลดรูป');
            }
            console.log('⌨️ Shortcut Ctrl+1: Upload Image');
        });

        shortcuts.set('Ctrl+2', () => {
            if (typeof window.downloadImage === 'function') {
                window.downloadImage();
                notify('📥 กำลังดาวน์โหลดรูป...');
            } else {
                notify('❌ ไม่พบฟังก์ชันดาวน์โหลดรูป');
            }
            console.log('⌨️ Shortcut Ctrl+2: Download Image');
        });

        // Ctrl+4 ยังคงเป็นสร้างวิดีโอ (ตามเดิม)
        shortcuts.set('Ctrl+4', () => {
            if (typeof window.createVideo === 'function') {
                window.createVideo();
                notify('🎬 กำลังสร้างวิดีโอ...');
            } else {
                notify('❌ ไม่พบฟังก์ชันสร้างวิดีโอ');
            }
            console.log('⌨️ Shortcut Ctrl+4: Create Video');
        });

        shortcuts.set('Ctrl+8', () => {
            if (typeof window.executeTask === 'function') {
                window.executeTask();
                notify('⚙️ กำลังทำงาน...');
            } else {
                notify('❌ ไม่พบฟังก์ชันทำงาน');
            }
            console.log('⌨️ Shortcut Ctrl+8: Execute Task');
        });

        // ---------- Event Listener หลัก ----------
        function handleKeyDown(e) {
            // ถ้ากำลัง focus ที่ input field ให้ข้าม (ยกเว้นปุ่มที่ต้องการให้ใช้ใน input ด้วย? แต่ตาม design เดิมข้าม)
            if (inputField && document.activeElement === inputField) {
                return;
            }

            // สร้าง key สำหรับค้นหาใน Map
            let key = e.key;
            // จัดการปุ่ม modifier
            const ctrl = e.ctrlKey || e.metaKey; // รองรับ Command (Mac)
            const shift = e.shiftKey;
            const alt = e.altKey;

            // ประกอบเป็น string เช่น "Ctrl+Shift+A"
            const parts = [];
            if (ctrl) parts.push('Ctrl');
            if (shift) parts.push('Shift');
            if (alt) parts.push('Alt');
            parts.push(key);
            const combo = parts.join('+');

            // ตรวจสอบว่ามีปุ่มลัดนี้หรือไม่
            if (shortcuts.has(combo)) {
                e.preventDefault();
                const action = shortcuts.get(combo);
                try {
                    action();
                } catch (err) {
                    console.error(`❌ Error executing shortcut ${combo}:`, err);
                    notify(`⚠️ เกิดข้อผิดพลาดในการ执行ปุ่มลัด ${combo}`);
                }
                return;
            }
        }

        // เพิ่ม listener ตัวเดียว
        document.addEventListener('keydown', handleKeyDown);

        // ---------- API สำหรับจัดการปุ่มลัดจากภายนอก ----------
        function addShortcut(key, action, description = '') {
            if (typeof key !== 'string' || typeof action !== 'function') {
                console.warn('⚠️ addShortcut: key must be string and action must be function');
                return false;
            }
            if (shortcuts.has(key)) {
                console.warn(`⚠️ Shortcut "${key}" already exists, overwriting.`);
            }
            shortcuts.set(key, action);
            console.log(`✅ Added shortcut: ${key}${description ? ' = ' + description : ''}`);
            return true;
        }

        function removeShortcut(key) {
            if (shortcuts.has(key)) {
                shortcuts.delete(key);
                console.log(`🗑️ Removed shortcut: ${key}`);
                return true;
            } else {
                console.warn(`⚠️ Shortcut "${key}" not found.`);
                return false;
            }
        }

        function listShortcuts() {
            return Array.from(shortcuts.keys());
        }

        // แสดงรายการปุ่มลัดเริ่มต้น (อัปเดตให้ตรงกับพฤติกรรม)
        console.log('⌨️ Keyboard Shortcuts initialized:');
        console.log('   1 = ลบพื้นหลัง');
        console.log('   2 = ล้างหน้าต่างสนทนา');
        console.log('   3 = อัปโหลดรูป');
        console.log('   4 = ดาวน์โหลดรูป');
        console.log('   5 = สร้างวิดีโอ');
        console.log('   6 = หมุนภาพ');
        console.log('   7 = กลับซ้ายขวา');
        console.log('   8 = กลับบนล่าง');
        console.log('   9 = ฟิลเตอร์ขาวดำ');
        console.log('   0 = รีเซ็ตปรับแต่ง');
        console.log('   Ctrl+1 = อัปโหลดรูป');
        console.log('   Ctrl+2 = ดาวน์โหลดรูป');
        console.log('   Ctrl+4 = สร้างวิดีโอ');
        console.log('   Ctrl+8 = ทำงาน');

        // คืนค่า API
        const api = {
            addShortcut,
            removeShortcut,
            listShortcuts,
            handleKeyDown
        };

        // เก็บ API ไว้ที่ window เผื่อเรียกใช้จากที่อื่น
        window.__shortcutManager = api;

        return api;
    }

    // เผยแพร่ตัวเริ่มต้นผ่าน window
    window.Shortcuts = { initShortcuts };

    console.log('✅ script_shortcuts.js (improved) loaded');
})();