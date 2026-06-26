// ================================================================
// script_combined.js — Voice AI + Glassmorphism Chat Widget
// ฟีเจอร์ครบ: พิมพ์, พูด, ควบคุมภาพ, เปิดลิงก์, คำนวณ, อากาศ,
// เตือนความจำ, วันที่/ปฏิทิน, Custom API
// ลากการ์ดได้, เปิด/ปิดเสียงและไมค์
// ================================================================

(function() {
    'use strict';

    // ------------------------------------------------------------
    // 1. HTML ของวิดเจ็ต
    // ------------------------------------------------------------
    const widgetHTML = `
        <div id="ai-chat-widget">
            <div id="ai-chat-header">
                <span>💬 นายชด</span>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button id="ai-chat-mic" title="เปิด/ปิดฟังเสียง" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:0.8;transition:0.2s;">🎤</button>
                    <button id="ai-chat-sound" title="เปิด/ปิดเสียงพูด" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:0.8;transition:0.2s;">🔊</button>
                    <button id="ai-chat-close" title="ปิด" style="background:transparent;border:none;color:#fff;font-size:22px;cursor:pointer;opacity:0.8;transition:0.2s;">✕</button>
                </div>
            </div>
            <div id="ai-chat-messages"></div>
            <div id="ai-chat-input-area">
                <input type="text" id="ai-chat-input" placeholder="พิมพ์หรือพูดคำสั่ง...">
                <button id="ai-chat-send">ส่ง</button>
            </div>
        </div>
    `;

    // ------------------------------------------------------------
    // 2. CSS Glassmorphism
    // ------------------------------------------------------------
    const widgetCSS = `
        #ai-chat-widget {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 380px;
            height: 520px;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.25);
            box-shadow: 0 20px 50px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.1);
            display: flex;
            flex-direction: column;
            z-index: 99999;
            font-family: 'Segoe UI', system-ui, sans-serif;
            overflow: hidden;
            user-select: none;
            transition: box-shadow 0.3s ease, transform 0.2s ease;
        }
        #ai-chat-widget:hover {
            box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }
        #ai-chat-header {
            background: rgba(123,47,252,0.4);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.2);
            color: #fff;
            padding: 16px 20px;
            cursor: grab;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
            font-weight: 600;
            border-radius: 24px 24px 0 0;
            flex-shrink: 0;
            user-select: none;
            letter-spacing: 0.3px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        #ai-chat-header:active { cursor: grabbing; }
        #ai-chat-header span { display: flex; align-items: center; gap: 10px; }
        #ai-chat-mic:hover, #ai-chat-sound:hover, #ai-chat-close:hover {
            opacity: 1 !important;
            transform: scale(1.1);
        }
        #ai-chat-mic { transition: 0.2s; }
        #ai-chat-sound { transition: 0.2s; }
        #ai-chat-messages {
            flex: 1;
            padding: 18px 18px 10px 18px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
        }
        .ai-msg {
            max-width: 82%;
            padding: 12px 18px;
            border-radius: 20px;
            word-wrap: break-word;
            line-height: 1.6;
            font-size: 15px;
            animation: ai-fade-in 0.3s ease;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .ai-msg.user {
            align-self: flex-end;
            background: rgba(123,47,252,0.5);
            color: #fff;
            border-bottom-right-radius: 6px;
            border-color: rgba(123,47,252,0.3);
        }
        .ai-msg.bot {
            align-self: flex-start;
            background: rgba(255,255,255,0.25);
            color: #1e1e2a;
            border-bottom-left-radius: 6px;
            border-color: rgba(255,255,255,0.3);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        .ai-msg.typing {
            align-self: flex-start;
            background: rgba(255,255,255,0.2);
            border-bottom-left-radius: 6px;
            padding: 14px 20px;
            display: flex;
            align-items: center;
            gap: 6px;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .ai-msg.typing span {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #7b2ffc;
            border-radius: 50%;
            animation: ai-dot-bounce 1.2s infinite;
            box-shadow: 0 0 6px rgba(123,47,252,0.5);
        }
        .ai-msg.typing span:nth-child(2) { animation-delay: 0.2s; }
        .ai-msg.typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ai-dot-bounce {
            0%,60%,100% { transform: translateY(0); opacity:0.4; }
            30% { transform: translateY(-8px); opacity:1; }
        }
        @keyframes ai-fade-in {
            from { opacity:0; transform: translateY(12px) scale(0.96); }
            to { opacity:1; transform: translateY(0) scale(1); }
        }
        #ai-chat-input-area {
            display: flex;
            gap: 12px;
            padding: 14px 18px 20px 18px;
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            border-top: 1px solid rgba(255,255,255,0.1);
            flex-shrink: 0;
        }
        #ai-chat-input {
            flex: 1;
            padding: 12px 20px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 40px;
            font-size: 15px;
            outline: none;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            color: #1e1e2a;
            transition: all 0.3s ease;
        }
        #ai-chat-input::placeholder { color: rgba(30,30,42,0.5); }
        #ai-chat-input:focus {
            border-color: rgba(123,47,252,0.6);
            background: rgba(255,255,255,0.25);
            box-shadow: 0 0 20px rgba(123,47,252,0.1);
        }
        #ai-chat-send {
            background: rgba(123,47,252,0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 40px;
            padding: 0 28px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s ease;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 12px rgba(123,47,252,0.2);
        }
        #ai-chat-send:hover {
            background: rgba(123,47,252,0.8);
            transform: scale(1.02);
            box-shadow: 0 6px 20px rgba(123,47,252,0.3);
        }
        #ai-chat-send:active { transform: scale(0.95); }
        #ai-chat-messages::-webkit-scrollbar { width: 5px; }
        #ai-chat-messages::-webkit-scrollbar-track { background: transparent; }
        #ai-chat-messages::-webkit-scrollbar-thumb {
            background: rgba(123,47,252,0.3);
            border-radius: 10px;
            backdrop-filter: blur(4px);
        }
        #ai-chat-messages::-webkit-scrollbar-thumb:hover { background: rgba(123,47,252,0.6); }
        @media (max-width:480px) {
            #ai-chat-widget {
                width: calc(100vw - 20px);
                height: 60vh;
                bottom: 10px;
                right: 10px;
                border-radius: 20px;
            }
            #ai-chat-header { border-radius: 20px 20px 0 0; padding: 14px 16px; font-size:16px; }
            #ai-chat-input-area { padding: 10px 14px 16px; gap:8px; }
            #ai-chat-input { padding: 10px 16px; font-size:14px; }
            #ai-chat-send { padding: 0 20px; font-size:14px; }
        }
    `;

    // ------------------------------------------------------------
    // 3. แทรก CSS และ HTML
    // ------------------------------------------------------------
    function injectStyles(css) {
        if (!document.getElementById('ai-chat-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'ai-chat-widget-styles';
            style.textContent = css;
            document.head.appendChild(style);
        }
    }
    function injectWidget(html) {
        if (document.getElementById('ai-chat-widget')) return;
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container.firstElementChild);
    }

    // ------------------------------------------------------------
    // 4. ตัวแปรและฟังก์ชันหลัก (Voice AI + Chat)
    // ------------------------------------------------------------
    const responseSuffixes = [
        "ครับเจ้านาย", "รับทราบครับเจ้านาย", "พร้อมแล้วครับเจ้านาย",
        "ได้เลยครับเจ้านาย", "ครับท่าน", "ครับคุณชาย", "ครับผม", "ครับ", "รับใช้เสมอครับเจ้านาย"
    ];
    function addPoliteSuffix(text) {
        if (/(ครับ|คะ|จ้า|ฮะ|เจ้านาย|ท่าน|คุณชาย|รับใช้)/.test(text)) return text;
        const suffix = responseSuffixes[Math.floor(Math.random() * responseSuffixes.length)];
        return text.replace(/[.!?]+$/, '') + ' ' + suffix;
    }

    const aiResponses = {
        greeting: ["สวัสดีครับเจ้านาย พร้อมช่วยเหลือ", "หวัดดีครับ มีอะไรให้รับใช้เจ้านาย", "ยินดีรับใช้ครับเจ้านาย พูดมาได้เลย", "ว่าไงครับเจ้านาย"],
        farewell: ["ลาก่อนครับเจ้านาย", "ไว้พบกันใหม่ครับเจ้านาย", "ขอลาผู้ดีครับเจ้านาย", "บาย ๆ นะเจ้านาย"],
        confirm: ["เรียบร้อยครับเจ้านาย", "ดำเนินการให้แล้วครับเจ้านาย", "เสร็จสิ้นครับเจ้านาย", "ตามนั้นเลยครับเจ้านาย", "ปรับให้แล้วครับเจ้านาย", "รับทราบครับเจ้านาย"],
        askRepeat: ["ขอโทษครับเจ้านาย พูดอีกครั้งได้ไหมครับ", "ไม่ค่อยชัดครับ กรุณาพูดอีกทีเจ้านาย", "ได้ยินไม่ถนัดครับเจ้านาย ขอโทษนะครับ"],
        unknown: ["ยังไม่เข้าใจคำสั่งครับเจ้านาย พูด 'ช่วยเหลือ' ดูนะครับ", "ไม่ทราบคำสั่งครับเจ้านาย ลอง 'ช่วยเหลือ' ครับ", "ขออภัย ยังไม่รู้จักคำสั่งนี้ครับเจ้านาย"],
        help: [
            "คำสั่งที่ใช้ได้ครับเจ้านาย:\n" +
            "• ปรับภาพ: ความคมชัด, ความสว่าง, คอนทราสต์, ความอิ่มตัว, รัศมี, เกณฑ์\n" +
            "• จัดการ: ย้อนกลับ, ทำซ้ำ, รีเซ็ต, ลบพื้นหลัง, บันทึก, ซูม, อัปโหลด\n" +
            "• ทั่วไป: สวัสดี, ขอบคุณ, ลาก่อน, ชื่อ, เวลา\n" +
            "• เปิดลิงก์: เปิด youtube, เปิด https://...\n" +
            "• คำนวณ: 5+3, คูณ 10 กับ 20\n" +
            "• อากาศ: อากาศที่ กรุงเทพ\n" +
            "• เตือนความจำ: เตือนฉัน ซื้อนม ใน 10 นาที, เวลา 14:30\n" +
            "• แสดงการเตือน, วันที่, ปฏิทิน\n" +
            "• API: ตั้งค่า API myapi https://api.example.com/data, เรียก API myapi key=123"
        ],
        thank: ["ยินดีครับเจ้านาย", "ด้วยความยินดีครับเจ้านาย", "ไม่เป็นไรครับเจ้านาย", "ขอบคุณที่ใช้บริการครับเจ้านาย"],
        needConfirmation: ["เจ้านายต้องการให้ปรับ {value} หรือไม่ครับ? ตอบว่า 'ใช่' หรือ 'ไม่'", "ยืนยันการปรับ {action} ไหมครับ? พูด 'ใช่' หรือ 'ไม่' นะเจ้านาย"],
        cantAdjustRelative: ["ไม่รู้ค่าปัจจุบันครับเจ้านาย กรุณาระบุตัวเลขเต็ม เช่น 'เพิ่มความคมชัดเป็น 70'", "บอกมาเป็นตัวเลขจะดีกว่าครับเจ้านาย"],
        learnSynonym: ["บันทึกคำ '{word}' เป็นความหมายเดียวกับ '{action}' แล้วครับเจ้านาย", "เข้าใจแล้วครับว่า '{word}' หมายถึง {action} เจ้านาย"],
        askWhichAction: ["เจ้านายต้องการปรับอะไรครับ? (ความคมชัด, ความสว่าง, คอนทราสต์, ความอิ่มตัว)", "ปรับค่าไหนดีครับเจ้านาย? พูด 'ความคมชัด' หรือ 'ความสว่าง'"],
        roundingNotify: ["ปัดค่าตามขั้นตอนละ {step} นะครับเจ้านาย", "ปรับเป็นครั้งละ {step} หน่วยครับเจ้านาย"],
        askValue: ["กรุณาบอกตัวเลขที่ต้องการปรับ {param} ครับเจ้านาย", "ต้องการปรับ {param} เป็นเท่าไหร่ครับ?"]
    };
    function randomResponse(category, placeholders = {}) {
        let arr = aiResponses[category] || aiResponses.unknown;
        let text = arr[Math.floor(Math.random() * arr.length)];
        for (let [key, val] of Object.entries(placeholders)) text = text.replace(`{${key}}`, val);
        return addPoliteSuffix(text);
    }

    // ---------- ความรู้ AI (สำหรับปรับภาพ) ----------
    const aiKnowledge = {
        greetings: ["สวัสดี","หวัดดี","hello","ฮัลโหล","hey","ไง"],
        farewells: ["ลาก่อน","บาย","bye","แล้วเจอกัน","ไปละ"],
        thanks: ["ขอบคุณ","thank","thanks","ขอบใจ","แค่นี้ก่อน"],
        synonyms: {
            sharpen: ["เพิ่มความคมชัด","ชาร์ป","ทำให้คม","ชัดขึ้น","ชาร์ปขึ้น","เพิ่มชาร์ป","ปรับความคม"],
            blur: ["เบลอ","ทำให้เบลอ","ละลาย","ฟุ้ง","ลดความคม"],
            brightness: ["ความสว่าง","สว่าง","เพิ่มความสว่าง","ลดความสว่าง","brightness","สว่างขึ้น","มืดลง"],
            contrast: ["คอนทราสต์","ความต่าง","contrast","เพิ่มคอนทราสต์","ลดคอนทราสต์"],
            saturation: ["ความอิ่มตัว","สีจัด","saturation","อิ่มตัว","เพิ่มความอิ่ม","สีสด"],
            undo: ["ย้อนกลับ","เลิกทำ","undo","กลับคืน","ย้อน","เลิก"],
            redo: ["ทำซ้ำ","redo","ทำอีก","ซ้ำ"],
            reset: ["รีเซ็ต","คืนค่า","reset","เริ่มใหม่","ล้าง"],
            removeBg: ["ลบพื้นหลัง","ตัดพื้นหลัง","remove background","เปลี่ยนพื้นหลัง","ถอดพื้น"],
            save: ["บันทึก","เซฟ","save","เก็บภาพ","เซฟไฟล์"],
            autoEnhance: ["ปรับอัตโนมัติ","ออโต้","auto","ปรับภาพอัตโนมัติ","enhance"],
            zoom: ["ซูม","ขยาย","zoom in","zoom out","缩小","放大"],
            upload: ["อัปโหลด","เพิ่มภาพ","เลือกภาพ","upload image","อัปภาพ"],
            help: ["ช่วยเหลือ","help","แนะนำ","คำสั่ง","ทำอะไรได้บ้าง"],
            radius: ["รัศมี","รัศมีชาร์ป","radius","รัศมีการชาร์ป"],
            threshold: ["เกณฑ์","threshold","ค่าเกณฑ์"]
        },
        adjustables: {
            amount: { min:0, max:200, step:5, default:50, sliderId:"amountSlider" },
            radius: { min:0.5, max:5, step:0.1, default:1, sliderId:"radiusSlider" },
            threshold: { min:0, max:50, step:1, default:10, sliderId:"thresholdSlider" },
            saturation: { min:0, max:200, step:5, default:100, sliderId:"saturationSlider" },
            brightness: { min:-100, max:100, step:5, default:0, sliderId:"brightnessSlider" },
            contrast: { min:-50, max:50, step:2, default:0, sliderId:"contrastSlider" }
        }
    };

    // ---------- Synonyms (localStorage) ----------
    const SYNONYMS_VERSION = 1;
    let userSynonyms = {};
    try {
        const stored = localStorage.getItem('voice_synonyms');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.version === SYNONYMS_VERSION && parsed.data) userSynonyms = parsed.data;
            else localStorage.removeItem('voice_synonyms');
        }
    } catch(e) {}
    function saveSynonyms() {
        localStorage.setItem('voice_synonyms', JSON.stringify({ version: SYNONYMS_VERSION, data: userSynonyms }));
    }
    function deduplicate(arr) { return [...new Set(arr)]; }
    function getAllSynonyms() {
        const merged = { ...aiKnowledge.synonyms };
        for (let [key, values] of Object.entries(userSynonyms)) {
            if (!merged[key]) merged[key] = [];
            merged[key].push(...values);
            merged[key] = deduplicate(merged[key]);
        }
        return merged;
    }

    // ---------- ฟังก์ชันสำหรับ Editor (ถ้ามี) ----------
    let isApplying = false;
    function updateSliderValue(sliderId, value, skipWorker = false) {
        const editor = window.editor;
        if (!editor) return false;
        const slider = document.getElementById(sliderId);
        if (!slider || isApplying) return false;
        isApplying = true;
        try {
            slider.value = value;
            if (slider.oninput && !skipWorker) slider.oninput();
            if (editor.updateSliderDisplays) editor.updateSliderDisplays();
            return true;
        } finally { isApplying = false; }
    }
    function getCurrentSliderValue(sliderId) {
        const slider = document.getElementById(sliderId);
        return slider ? parseFloat(slider.value) : null;
    }
    function parseRelativeAdjust(text, paramName) {
        const lower = text.toLowerCase();
        const cfg = aiKnowledge.adjustables[paramName];
        if (!cfg) return null;
        let amount = null, isIncrease = null;
        if (/(เพิ่ม|มากขึ้น|มากขึ้นอีก|เพิ่มขึ้น|ขึ้น|\+)/.test(lower)) isIncrease = true;
        else if (/(ลด|ลดลง|น้อยลง|ลบ|\-)/.test(lower)) isIncrease = false;
        else return null;
        const match = lower.match(/(\d+(?:\.\d+)?)/);
        if (match) {
            amount = parseFloat(match[1]);
            let rounded = Math.round(amount / cfg.step) * cfg.step;
            if (Math.abs(rounded - amount) > 0.001) speakText(randomResponse('roundingNotify', { step: cfg.step }));
            amount = rounded;
        } else amount = cfg.step;
        if (isIncrease === false) amount = -amount;
        return amount;
    }
    async function applyRelativeAdjust(paramName, delta) {
        const cfg = aiKnowledge.adjustables[paramName];
        if (!cfg) return false;
        const current = getCurrentSliderValue(cfg.sliderId);
        if (current === null) { speakText(randomResponse('cantAdjustRelative')); return false; }
        let newVal = Math.min(cfg.max, Math.max(cfg.min, current + delta));
        newVal = Math.round(newVal / cfg.step) * cfg.step;
        updateSliderValue(cfg.sliderId, newVal);
        triggerEffectForParam(paramName);
        speakText(randomResponse('confirm') + ` ปรับ${paramName} เป็น ${newVal}`);
        return true;
    }
    function triggerEffectForParam(paramName) {
        const editor = window.editor;
        if (!editor) return;
        if (['amount','radius','threshold'].includes(paramName) && editor.applySharpenWorker) editor.applySharpenWorker();
        else if (['saturation','brightness','contrast'].includes(paramName) && editor.applyColorBoost) editor.applyColorBoost();
    }

    // ---------- Pending Confirmation ----------
    let confirmationQueue = [], isConfirming = false;
    function setPendingConfirmation(intent, entities) {
        confirmationQueue.push({ intent, entities, timestamp: Date.now() });
        if (!isConfirming) processConfirmationQueue();
    }
    function processConfirmationQueue() {
        if (confirmationQueue.length === 0) { isConfirming = false; return; }
        isConfirming = true;
        const pending = confirmationQueue[0];
        if (pending.entities && pending.entities.absolute !== undefined) {
            speakText(randomResponse('needConfirmation', { value: pending.entities.absolute, action: pending.intent }));
        } else {
            const paramName = (pending.intent === 'sharpen') ? 'amount' : pending.intent;
            speakText(randomResponse('askValue', { param: paramName }));
        }
    }
    function getCurrentPending() { return confirmationQueue.length ? confirmationQueue[0] : null; }
    function resolvePending(confirmed) {
        if (!confirmationQueue.length) return null;
        const pending = confirmationQueue.shift();
        if (confirmed) {
            processConfirmationQueue();
            return pending;
        } else {
            speakText("ยกเลิกคำสั่งแล้วครับเจ้านาย");
            processConfirmationQueue();
            return null;
        }
    }

    // ---------- Parser & Executor (ปรับภาพ) ----------
    function parseIntent(command) {
        const text = command.trim();
        const lower = text.toLowerCase();
        let intent = null, entities = {};
        const synonyms = getAllSynonyms();
        const pending = getCurrentPending();

        // ตรวจสอบการยืนยัน
        if (pending) {
            if (/(ใช่|ok|yes|รับ|ตกลง|ยืนยัน|แน่นอน)/.test(lower)) return { intent: 'confirm_yes', entities };
            if (/(ไม่|no|cancel|ยกเลิก|ไม่เอา|ไม่ใช่)/.test(lower)) return { intent: 'confirm_no', entities };
            const numMatch = lower.match(/(\d+(?:\.\d+)?)/);
            if (numMatch) { entities.value = parseFloat(numMatch[1]); return { intent: 'provide_value', entities }; }
        }

        // ทั่วไป
        if (aiKnowledge.greetings.some(w => lower.includes(w))) return { intent: 'greeting', entities };
        if (aiKnowledge.farewells.some(w => lower.includes(w))) return { intent: 'farewell', entities };
        if (aiKnowledge.thanks.some(w => lower.includes(w))) return { intent: 'thank', entities };

        // เรียนรู้คำศัพท์
        const learnMatch = lower.match(/จำไว้ว่า\s+([^\s]+)\s+แปลว่า\s+(.+)/);
        if (learnMatch) {
            let newWord = learnMatch[1].trim(), targetAction = learnMatch[2].trim(), foundKey = null;
            for (let [key, vals] of Object.entries(synonyms)) if (vals.some(v => targetAction.includes(v) || targetAction === key)) { foundKey = key; break; }
            if (foundKey) {
                if (!userSynonyms[foundKey]) userSynonyms[foundKey] = [];
                if (!userSynonyms[foundKey].includes(newWord)) {
                    userSynonyms[foundKey].push(newWord);
                    userSynonyms[foundKey] = deduplicate(userSynonyms[foundKey]);
                    saveSynonyms();
                    speakText(randomResponse('learnSynonym', { word: newWord, action: foundKey }));
                }
            }
            return { intent: 'noop', entities };
        }

        // ----- ฟังก์ชันใหม่: เปิดลิงก์ -----
        const openMatch = text.match(/(?:เปิด|ไปที่|ไป)\s+(.+)/);
        if (openMatch) {
            const target = openMatch[1].trim();
            const url = extractUrl(target);
            if (url) return { intent: 'open_url', entities: { url } };
        }

        // ----- คำนวณเลข -----
        const calcResult = calculateExpression(text);
        if (calcResult !== null) {
            return { intent: 'calculate', entities: { result: calcResult, expression: text } };
        }

        // ----- อากาศ -----
        if (/(?:อากาศ|weather|สภาพอากาศ)\s+(.+)/i.test(text)) {
            const cityMatch = text.match(/(?:อากาศ|weather|สภาพอากาศ)\s+(.+)/i);
            if (cityMatch) return { intent: 'weather', entities: { city: cityMatch[1].trim() } };
        }

        // ----- เตือนความจำ -----
        const remindMatch = text.match(/เตือน(?:ฉัน|ผม)?\s+(.+?)\s+(?:ใน|หลังจาก|เมื่อ)\s+(.+)/);
        if (remindMatch) {
            const msg = remindMatch[1].trim();
            const timeText = remindMatch[2].trim();
            const ms = parseReminderTime(timeText);
            if (ms !== null && ms > 0) {
                return { intent: 'set_reminder', entities: { message: msg, delayMs: ms } };
            }
        }
        if (/(?:แสดง|ดู|รายการ)\s*(?:การเตือน|เตือนความจำ|reminder)/i.test(text)) {
            return { intent: 'show_reminders', entities: {} };
        }

        // ----- วันที่ / ปฏิทิน -----
        if (/(?:วันที่|วันนี้|วันนี้วันที่|วันที่เท่าไหร่)/i.test(text)) {
            return { intent: 'show_date', entities: {} };
        }
        if (/(?:ปฏิทิน|calendar)/i.test(text)) {
            return { intent: 'show_calendar', entities: {} };
        }

        // ----- Custom API -----
        const addApiMatch = text.match(/ตั้งค่า\s*API\s+(\S+)\s+(\S+)\s*(?:method\s+(\S+))?/i);
        if (addApiMatch) {
            const name = addApiMatch[1];
            const url = addApiMatch[2];
            const method = addApiMatch[3] || 'GET';
            return { intent: 'add_api', entities: { name, url, method } };
        }
        const callApiMatch = text.match(/เรียก\s*API\s+(\S+)\s*(.*)/i);
        if (callApiMatch) {
            const name = callApiMatch[1];
            const params = callApiMatch[2] || '';
            return { intent: 'call_api', entities: { name, params } };
        }
        if (/(?:แสดง|ดู)\s*(?:รายการ)?\s*API/i.test(text)) {
            return { intent: 'list_apis', entities: {} };
        }

        // ----- คำสั่งปรับภาพ (จาก script1) -----
        for (let [action, keywords] of Object.entries(synonyms)) if (keywords.some(kw => lower.includes(kw))) { intent = action; break; }
        if (!intent) {
            if (/(รีเซ็ต|คืนค่า|reset)/.test(lower)) intent = 'reset';
            else if (/(undo|เลิกทำ|ย้อนกลับ)/.test(lower)) intent = 'undo';
            else if (/(redo|ทำซ้ำ)/.test(lower)) intent = 'redo';
            else if (/(help|ช่วยเหลือ)/.test(lower)) intent = 'help';
            else intent = 'unknown';
        }
        const numberMatch = lower.match(/(\d+(?:\.\d+)?)/);
        if (numberMatch) entities.value = parseFloat(numberMatch[1]);
        const adjustableParams = Object.keys(aiKnowledge.adjustables);
        if (adjustableParams.includes(intent)) {
            let paramName = (intent === 'sharpen') ? 'amount' : intent;
            if (/(เพิ่ม|มากขึ้น|ลด|ลดลง)/.test(lower)) {
                let delta = parseRelativeAdjust(command, paramName);
                if (delta !== null) { entities.relativeDelta = delta; entities.paramName = paramName; }
            }
            if (entities.value !== undefined && !entities.relativeDelta) entities.absolute = entities.value;
        }
        if (intent === 'reset') {
            if (lower.includes('สี') || lower.includes('แสง')) intent = 'resetColor';
            else if (lower.includes('คม') || lower.includes('ชาร์ป')) intent = 'resetSharpen';
            else intent = 'resetImage';
        }
        return { intent, entities };
    }

    async function executeIntent(intent, entities) {
        const editor = window.editor;

        // การยืนยัน
        if (intent === 'confirm_yes') {
            const pending = resolvePending(true);
            if (pending) return await executeIntent(pending.intent, pending.entities);
            return true;
        }
        if (intent === 'confirm_no') { resolvePending(false); return true; }
        if (intent === 'provide_value') {
            const pending = getCurrentPending();
            if (pending) {
                pending.entities.absolute = entities.value;
                return await executeIntent(pending.intent, pending.entities);
            }
            return true;
        }

        switch(intent) {
            // ทั่วไป
            case 'greeting': speakText(randomResponse('greeting')); return true;
            case 'farewell': speakText(randomResponse('farewell')); return true;
            case 'thank': speakText(randomResponse('thank')); return true;
            case 'help': speakText(randomResponse('help')); return true;

            // เปิดลิงก์
            case 'open_url':
                if (entities.url) {
                    window.open(entities.url, '_blank');
                    speakText(`กำลังเปิด ${entities.url} ครับเจ้านาย`);
                    addMessage(`🔗 เปิดลิงก์: ${entities.url}`, 'bot');
                    return true;
                }
                speakText('ไม่พบลิงก์ที่ต้องการเปิดครับเจ้านาย');
                return true;

            // คำนวณ
            case 'calculate':
                const val = entities.result;
                if (typeof val === 'number') {
                    speakText(`ผลลัพธ์ของ ${entities.expression} คือ ${val} ครับเจ้านาย`);
                    addMessage(`🧮 ผลลัพธ์: ${val}`, 'bot');
                } else {
                    speakText(val);
                }
                return true;

            // อากาศ
            case 'weather':
                const city = entities.city;
                speakText(`กำลังตรวจสอบอากาศที่ ${city} ครับเจ้านาย`);
                const weatherInfo = await fetchWeather(city);
                if (weatherInfo) {
                    speakText(`อากาศที่ ${city} คือ ${weatherInfo} ครับเจ้านาย`);
                    addMessage(`🌤️ อากาศที่ ${city}: ${weatherInfo}`, 'bot');
                } else {
                    speakText(`ขออภัย ไม่สามารถดึงข้อมูลอากาศที่ ${city} ได้ครับเจ้านาย`);
                }
                return true;

            // เตือนความจำ
            case 'set_reminder':
                const msg = entities.message;
                const delay = entities.delayMs;
                if (msg && delay > 0) {
                    const due = addReminder(msg, delay);
                    const date = new Date(due);
                    const timeStr = date.toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' });
                    speakText(`ตั้งเตือน "${msg}" เวลา ${timeStr} ครับเจ้านาย`);
                    addMessage(`⏰ ตั้งเตือน "${msg}" แล้ว (${timeStr})`, 'bot');
                } else {
                    speakText('ไม่เข้าใจเวลา กรุณาพูดเช่น "เตือนฉัน ซื้อนม ใน 10 นาที" ครับ');
                }
                return true;

            case 'show_reminders':
                const reminders = loadReminders();
                const pendingList = reminders.filter(r => !r.done);
                if (pendingList.length === 0) {
                    speakText('ไม่มีการเตือนค้างอยู่ครับเจ้านาย');
                    addMessage('✅ ไม่มีการเตือนค้างอยู่', 'bot');
                } else {
                    const list = pendingList.map(r => `- ${r.text} (${new Date(r.due).toLocaleString('th-TH')})`).join('\n');
                    speakText(`มี ${pendingList.length} รายการเตือนครับเจ้านาย`);
                    addMessage(`📋 รายการเตือน:\n${list}`, 'bot');
                }
                return true;

            // วันที่ / ปฏิทิน
            case 'show_date':
                const dateStr = getThaiDateString();
                speakText(`วันนี้คือ ${dateStr} ครับเจ้านาย`);
                addMessage(`📅 ${dateStr}`, 'bot');
                return true;

            case 'show_calendar':
                const cal = getCalendarText();
                speakText('นี่คือปฏิทินเดือนนี้ครับเจ้านาย');
                addMessage(cal, 'bot');
                return true;

            // Custom API
            case 'add_api':
                const apiName = entities.name;
                const apiUrl = entities.url;
                const apiMethod = entities.method || 'GET';
                if (apiName && apiUrl) {
                    addCustomAPI(apiName, apiUrl, apiMethod);
                    speakText(`เพิ่ม API "${apiName}" เรียบร้อยแล้วครับเจ้านาย`);
                    addMessage(`✅ เพิ่ม API "${apiName}" (${apiMethod})`, 'bot');
                } else {
                    speakText('กรุณาระบุชื่อและ URL ของ API ครับ เช่น "ตั้งค่า API myapi https://api.example.com/data"');
                }
                return true;

            case 'call_api':
                const name = entities.name;
                const params = entities.params || '';
                if (!name) { speakText('กรุณาระบุชื่อ API ด้วยครับ'); return true; }
                speakText(`กำลังเรียก API ${name} ครับ`);
                const result = await callCustomAPI(name, params);
                if (result !== null) {
                    let display = result;
                    try { display = JSON.stringify(JSON.parse(result), null, 2); } catch(e) {}
                    speakText(`ผลลัพธ์จาก API ${name} ครับเจ้านาย`);
                    addMessage(`📡 ผลลัพธ์จาก API "${name}":\n${display}`, 'bot');
                } else {
                    speakText(`ไม่สามารถเรียก API ${name} ได้ หรือไม่พบ API นี้ครับเจ้านาย`);
                }
                return true;

            case 'list_apis':
                const apis = loadAPIs();
                const apiKeys = Object.keys(apis);
                if (apiKeys.length === 0) {
                    speakText('ยังไม่มี API ที่ตั้งค่าไว้ครับเจ้านาย');
                    addMessage('📭 ยังไม่มี API ที่ตั้งค่าไว้', 'bot');
                } else {
                    const list = apiKeys.map(n => `- ${n} (${apis[n].method}) -> ${apis[n].url}`).join('\n');
                    speakText(`มี API ${apiKeys.length} ตัวครับเจ้านาย`);
                    addMessage(`📋 รายการ API:\n${list}`, 'bot');
                }
                return true;

            // คำสั่งปรับภาพ
            case 'undo':
                if (editor && editor.undo) editor.undo();
                else speakText("ไม่สามารถเลิกทำได้ครับเจ้านาย");
                speakText(randomResponse('confirm') + " เลิกทำเรียบร้อย");
                return true;
            case 'redo':
                if (editor && editor.redo) editor.redo();
                else speakText("ไม่สามารถทำซ้ำได้ครับเจ้านาย");
                speakText(randomResponse('confirm') + " ทำซ้ำเรียบร้อย");
                return true;
            case 'resetImage':
                if (editor && editor.resetImage) editor.resetImage();
                else speakText("ไม่สามารถรีเซ็ตภาพได้ครับเจ้านาย");
                speakText(randomResponse('confirm') + " รีเซ็ตเป็นภาพต้นฉบับ");
                return true;
            case 'resetSharpen':
                if (editor && editor.resetSharpenEngine) editor.resetSharpenEngine();
                else speakText("ไม่พบฟังก์ชันรีเซ็ตความคมชัดครับเจ้านาย");
                return true;
            case 'resetColor':
                if (editor && editor.resetColor) editor.resetColor();
                else speakText("รีเซ็ตสีเรียบร้อยครับเจ้านาย");
                return true;
            case 'removeBg':
                if (editor && editor.performAIRemove) await editor.performAIRemove();
                else speakText("ไม่สามารถลบพื้นหลังได้ครับเจ้านาย");
                return true;
            case 'save':
                if (editor && editor.saveImage) editor.saveImage();
                else speakText("ไม่สามารถบันทึกภาพได้ครับเจ้านาย");
                return true;
            case 'autoEnhance':
                if (typeof window.autoEnhanceFn === 'function') window.autoEnhanceFn();
                else speakText("โปรดเพิ่มปุ่ม Auto Enhance ก่อนใช้งานครับเจ้านาย");
                return true;
            case 'sharpen': case 'brightness': case 'contrast': case 'saturation': case 'radius': case 'threshold': {
                let paramName = (intent === 'sharpen') ? 'amount' : intent;
                if (entities.relativeDelta !== undefined && entities.paramName) return await applyRelativeAdjust(entities.paramName, entities.relativeDelta);
                if (entities.absolute !== undefined) {
                    const cfg = aiKnowledge.adjustables[paramName];
                    if (cfg) {
                        let val = Math.min(cfg.max, Math.max(cfg.min, entities.absolute));
                        val = Math.round(val / cfg.step) * cfg.step;
                        updateSliderValue(cfg.sliderId, val);
                        triggerEffectForParam(paramName);
                        speakText(randomResponse('confirm') + ` ตั้ง${paramName} = ${val}`);
                        return true;
                    }
                }
                setPendingConfirmation(intent, entities);
                return true;
            }
            case 'toggleZoom':
                if (editor && editor.toggleZoom) editor.toggleZoom();
                else speakText("ไม่สามารถซูมได้ครับเจ้านาย");
                return true;
            case 'upload':
                if (editor && editor.uploadBtn) editor.uploadBtn.click();
                else speakText("ไม่สามารถอัปโหลดได้ครับเจ้านาย");
                return true;
            case 'noop':
                return true;
            default:
                return false;
        }
    }

    // ---------- ฟังก์ชันเสริมสำหรับฟีเจอร์ใหม่ ----------
    // เปิดลิงก์
    function extractUrl(text) {
        const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) return urlMatch[1];
        const knownSites = {
            'google': 'https://www.google.com',
            'youtube': 'https://www.youtube.com',
            'facebook': 'https://www.facebook.com',
            'github': 'https://github.com',
            'twitter': 'https://twitter.com',
            'instagram': 'https://instagram.com',
            'reddit': 'https://reddit.com'
        };
        for (let [name, url] of Object.entries(knownSites)) {
            if (text.includes(name)) return url;
        }
        return null;
    }

    // คำนวณ
    function calculateExpression(text) {
        let expr = text.replace(/บวก/g, '+').replace(/ลบ/g, '-')
                       .replace(/คูณ/g, '*').replace(/หาร/g, '/')
                       .replace(/เท่ากับ/g, '=').replace(/เท่าไหร่/g, '');
        const match = expr.match(/([\d.]+)\s*([+\-*/])\s*([\d.]+)/);
        if (!match) return null;
        const a = parseFloat(match[1]);
        const op = match[2];
        const b = parseFloat(match[3]);
        if (isNaN(a) || isNaN(b)) return null;
        let result;
        switch(op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': result = b !== 0 ? a / b : 'ไม่สามารถหารด้วยศูนย์ได้'; break;
            default: return null;
        }
        return result;
    }

    // อากาศ
    async function fetchWeather(city) {
        try {
            const url = `https://wttr.in/${encodeURIComponent(city)}?format=%C+%t&lang=th`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const data = await response.text();
            return data.trim();
        } catch(e) {
            return null;
        }
    }

    // ---------- Reminder ----------
    const REMINDERS_KEY = 'ai_reminders';
    let reminderInterval = null;

    function loadReminders() {
        try {
            const data = localStorage.getItem(REMINDERS_KEY);
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    }
    function saveReminders(reminders) {
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    }
    function addReminder(text, timeMs) {
        const reminders = loadReminders();
        const due = Date.now() + timeMs;
        reminders.push({ id: Date.now(), text, due, done: false });
        saveReminders(reminders);
        startReminderChecker();
        return due;
    }
    function startReminderChecker() {
        if (reminderInterval) clearInterval(reminderInterval);
        reminderInterval = setInterval(() => {
            const now = Date.now();
            const reminders = loadReminders();
            let changed = false;
            reminders.forEach(r => {
                if (!r.done && r.due <= now) {
                    r.done = true;
                    changed = true;
                    const msg = `⏰ เตือนความจำ: ${r.text}`;
                    addMessage(msg, 'bot');
                    speakText(msg);
                }
            });
            if (changed) saveReminders(reminders);
        }, 10000);
    }
    function parseReminderTime(text) {
        const lower = text.toLowerCase();
        const inMatch = lower.match(/ใน\s+(\d+)\s*(นาที|ชั่วโมง|วินาที|min|hour|sec)/);
        if (inMatch) {
            const num = parseInt(inMatch[1]);
            const unit = inMatch[2];
            let ms = 0;
            if (unit.startsWith('นาที') || unit.startsWith('min')) ms = num * 60 * 1000;
            else if (unit.startsWith('ชั่วโมง') || unit.startsWith('hour')) ms = num * 60 * 60 * 1000;
            else if (unit.startsWith('วินาที') || unit.startsWith('sec')) ms = num * 1000;
            return ms;
        }
        const timeMatch = lower.match(/เวลา\s*(\d{1,2})[:.](\d{2})/);
        if (timeMatch) {
            const h = parseInt(timeMatch[1]);
            const m = parseInt(timeMatch[2]);
            const now = new Date();
            const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
            if (target <= now) target.setDate(target.getDate() + 1);
            return target.getTime() - now.getTime();
        }
        return null;
    }

    // ---------- Date / Calendar ----------
    function getThaiDateString() {
        const now = new Date();
        const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const d = now.getDate();
        const m = months[now.getMonth()];
        const y = now.getFullYear() + 543;
        const day = days[now.getDay()];
        return `วัน${day}ที่ ${d} ${m} พ.ศ. ${y}`;
    }
    function getCalendarText() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthName = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][month];
        let lines = [`📅 ปฏิทิน ${monthName} ${year+543}`];
        lines.push('อา จ อ พ พฤ ศ ส');
        let row = '';
        for (let i = 0; i < firstDay; i++) row += '   ';
        for (let d = 1; d <= daysInMonth; d++) {
            row += (d < 10 ? ' ' : '') + d + (d === now.getDate() ? '*' : '') + ' ';
            if ((firstDay + d) % 7 === 0) { lines.push(row); row = ''; }
        }
        if (row) lines.push(row);
        return lines.join('\n');
    }

    // ---------- Custom API ----------
    const API_CONFIG_KEY = 'ai_custom_apis';
    function loadAPIs() {
        try {
            const data = localStorage.getItem(API_CONFIG_KEY);
            return data ? JSON.parse(data) : {};
        } catch { return {}; }
    }
    function saveAPIs(apis) {
        localStorage.setItem(API_CONFIG_KEY, JSON.stringify(apis));
    }
    function addCustomAPI(name, url, method = 'GET', headers = {}) {
        const apis = loadAPIs();
        apis[name] = { url, method, headers };
        saveAPIs(apis);
    }
    async function callCustomAPI(name, params = '') {
        const apis = loadAPIs();
        const config = apis[name];
        if (!config) return null;
        let url = config.url;
        if (params && config.method.toUpperCase() === 'GET') {
            url += (url.includes('?') ? '&' : '?') + params;
        }
        const options = { method: config.method, headers: config.headers };
        if (config.method.toUpperCase() !== 'GET' && params) {
            options.body = params;
        }
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.text();
            return data;
        } catch (e) {
            return null;
        }
    }

    // ---------- Fallback สำหรับการสนทนาทั่วไป ----------
    function getGeneralResponse(text) {
        const msg = text.trim().toLowerCase();
        if (msg.includes('สวัสดี') || msg.includes('hello') || msg.includes('หวัดดี')) {
            const replies = ['สวัสดีครับ! ยินดีที่ได้รู้จัก คุณต้องการสอบถามอะไรไหม?','หวัดดีจ้า! พร้อมช่วยเหลือคุณเสมอครับ','Hello! มีอะไรให้ฉันช่วยไหม?'];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        if (msg.includes('ชื่อ')) {
            const replies = ['ฉันชื่อ "AI Assistant" ค่ะ','ชื่อของฉันคือ "Glass AI"','ผมชื่อนายชดครับเจ้านาย"'];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        if (msg.includes('อายุ') || msg.includes('age')) {
            const replies = ['ฉันเกิดเมื่อปี 2024 ตอนนี้ 2 ขวบแล้ว','อายุของฉันคือ "เวอร์ชัน 1.0"','ในฐานะ AI ฉันไม่มีอายุ'];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        if (msg.includes('เวลา') || msg.includes('time') || msg.includes('วันนี้')) {
            const now = new Date();
            return `⏰ ขณะนี้ ${now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })} ครับ`;
        }
        if (msg.includes('ขอบคุณ') || msg.includes('thank')) {
            const replies = ['ด้วยความยินดีครับ!','ยินดีเสมอค่ะ 😊','ขอบคุณที่ใช้บริการครับ'];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        if (msg.includes('ช่วย') || msg.includes('help')) {
            return 'ฉันสามารถตอบคำถามทั่วไป, บอกเวลา, หรือช่วยแนะนำสิ่งต่าง ๆ ได้นะ ลองถามอะไรก็ได้';
        }
        if (msg.includes('ลาก่อน') || msg.includes('bye')) {
            const replies = ['ลาก่อน! กลับมาใหม่ได้ตลอดครับ','บายบาย! ขอให้มีความสุขครับ','แล้วพบกันใหม่จ้า 👋'];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        const generals = [
            `ฉันเข้าใจว่า "${text}" น่าสนใจมาก! คุณช่วยอธิบายเพิ่มเติมได้ไหม?`,
            `ขอบคุณที่แชร์ "${text}" ฉันจะจดจำไว้`,
            `โอ้! "${text}" เป็นสิ่งที่ฉันไม่เคยรู้มาก่อน`,
            `น่าสนใจ! คุณคิดว่าอะไรเกี่ยวกับ "${text}" ที่สำคัญที่สุด?`,
            `ฉันเห็นด้วยกับคุณเกี่ยวกับ "${text}"`,
            `ขอบคุณที่ถาม ฉันจะหาคำตอบเกี่ยวกับ "${text}" ให้คุณ`
        ];
        return generals[Math.floor(Math.random() * generals.length)];
    }

    // ------------------------------------------------------------
    // 5. ตัวแปรและฟังก์ชันสำหรับ Widget + Speech
    // ------------------------------------------------------------
    let soundEnabled = true;
    let micEnabled = true;
    let speechSynth = window.speechSynthesis;
    let utterance = null;
    let recognition = null;

    function speakText(text) {
        if (!soundEnabled) return;
        if (!window.speechSynthesis) return;
        if (speechSynth.speaking) speechSynth.cancel();
        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        const voices = speechSynth.getVoices();
        const thVoice = voices.find(v => v.lang.startsWith('th'));
        if (thVoice) utterance.voice = thVoice;
        speechSynth.speak(utterance);
    }

    function stopSpeech() {
        if (speechSynth.speaking) speechSynth.cancel();
    }

    function addMessage(text, sender) {
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${sender}`;
        msgDiv.textContent = text;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;
        const typing = document.createElement('div');
        typing.className = 'ai-msg typing';
        typing.id = 'ai-typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById('ai-typing-indicator');
        if (el) el.remove();
    }

    // ---------- ประมวลผลข้อความ ----------
    async function processUserInput(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        showTyping();

        const { intent, entities } = parseIntent(text);
        const executed = await executeIntent(intent, entities);

        removeTyping();

        if (!executed) {
            const reply = getGeneralResponse(text);
            addMessage(reply, 'bot');
            speakText(reply);
        }
        // ถ้า executed แล้ว speakText ถูกเรียกภายในฟังก์ชันแล้ว
    }

    // ---------- Speech Recognition ----------
    function initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'th-TH';
        recognition.continuous = true;
        recognition.interimResults = true;

        let lastFinal = '';
        let finalTimeout = null;

        recognition.onresult = function(event) {
            let interim = '', final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += transcript;
                else interim += transcript;
            }
            if (final && final !== lastFinal) {
                lastFinal = final;
                clearTimeout(finalTimeout);
                finalTimeout = setTimeout(() => {
                    processUserInput(final.trim());
                }, 200);
            }
        };

        recognition.onend = function() {
            if (micEnabled) {
                setTimeout(() => {
                    try { recognition.start(); } catch(e) {}
                }, 300);
            }
        };

        recognition.onerror = function(event) {
            console.warn('Recognition error:', event.error);
            if (event.error === 'not-allowed') {
                speakText("กรุณาอนุญาตไมโครโฟนครับเจ้านาย");
            }
        };

        if (micEnabled) {
            try { recognition.start(); } catch(e) {}
        }
    }

    // ---------- เปิด/ปิดไมค์และเสียง ----------
    function toggleMic() {
        micEnabled = !micEnabled;
        const micBtn = document.getElementById('ai-chat-mic');
        if (micEnabled) {
            micBtn.textContent = '🎤';
            micBtn.style.opacity = '0.8';
            if (recognition) {
                try { recognition.start(); } catch(e) {}
            }
            speakText('เปิดฟังเสียงแล้วครับเจ้านาย');
        } else {
            micBtn.textContent = '🎤❌';
            micBtn.style.opacity = '0.4';
            if (recognition) {
                try { recognition.stop(); } catch(e) {}
            }
            speakText('ปิดฟังเสียงแล้วครับเจ้านาย');
        }
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        const soundBtn = document.getElementById('ai-chat-sound');
        if (soundEnabled) {
            soundBtn.textContent = '🔊';
            soundBtn.style.opacity = '0.8';
        } else {
            soundBtn.textContent = '🔇';
            soundBtn.style.opacity = '0.4';
            stopSpeech();
        }
    }

    // ------------------------------------------------------------
    // 6. เริ่มต้น Widget และ Event Listeners
    // ------------------------------------------------------------
    function initWidget() {
        const widget = document.getElementById('ai-chat-widget');
        const header = document.getElementById('ai-chat-header');
        const closeBtn = document.getElementById('ai-chat-close');
        const micBtn = document.getElementById('ai-chat-mic');
        const soundBtn = document.getElementById('ai-chat-sound');
        const inputField = document.getElementById('ai-chat-input');
        const sendBtn = document.getElementById('ai-chat-send');

        // ---------- ลาก ----------
        let isDragging = false, offsetX = 0, offsetY = 0;
        function onMouseDown(e) {
            if (e.target.closest('#ai-chat-close') || e.target.closest('#ai-chat-mic') || e.target.closest('#ai-chat-sound')) return;
            isDragging = true;
            const rect = widget.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        }
        function onMouseMove(e) {
            if (!isDragging) return;
            let left = e.clientX - offsetX, top = e.clientY - offsetY;
            const w = widget.offsetWidth, h = widget.offsetHeight;
            left = Math.max(0, Math.min(left, window.innerWidth - w));
            top = Math.max(0, Math.min(top, window.innerHeight - h));
            widget.style.left = left + 'px';
            widget.style.top = top + 'px';
            widget.style.right = 'auto';
            widget.style.bottom = 'auto';
            e.preventDefault();
        }
        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        header.addEventListener('mousedown', onMouseDown);

        // ---------- ปุ่ม ----------
        closeBtn.addEventListener('click', () => {
            widget.style.display = 'none';
            stopSpeech();
            if (recognition) try { recognition.stop(); } catch(e) {}
        });
        micBtn.addEventListener('click', toggleMic);
        soundBtn.addEventListener('click', toggleSound);

        // ---------- ส่งข้อความ (พิมพ์) ----------
        async function sendMessage() {
            const text = inputField.value.trim();
            if (!text) return;
            inputField.value = '';
            await processUserInput(text);
        }
        sendBtn.addEventListener('click', sendMessage);
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });

        // ---------- โหลดเสียง ----------
        if (window.speechSynthesis) {
            speechSynth.getVoices();
            speechSynth.onvoiceschanged = () => speechSynth.getVoices();
        }

        // ---------- เริ่ม Speech Recognition ----------
        initRecognition();

        // ---------- ข้อความต้อนรับ ----------
        setTimeout(() => {
            addMessage('สวัสดีครับเจ้านาย! พิมพ์หรือพูดคำสั่งได้เลย 🎤', 'bot');
            speakText('สวัสดีครับเจ้านาย พร้อมช่วยเหลือ');
        }, 500);

        console.log('✅ Combined Voice AI + Chat Widget (full features) is ready');
    }

    // ------------------------------------------------------------
    // 7. รันเมื่อ DOM พร้อม
    // ------------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            injectStyles(widgetCSS);
            injectWidget(widgetHTML);
            initWidget();
        });
    } else {
        injectStyles(widgetCSS);
        injectWidget(widgetHTML);
        initWidget();
    }

})();