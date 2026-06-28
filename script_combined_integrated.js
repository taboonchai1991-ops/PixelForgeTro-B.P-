// ================================================================
// script_combined_integrated.js — ตัวเริ่มต้นหลัก (Entry Point)
// รวมทุกอย่าง: AI Chat Widget + ฉากหลัง + Video Generator + ควบคุม PixelForge
// พร้อม Keyboard Shortcuts (ปุ่ม 0-9)
// แก้ไขให้เข้ากับ script_commands.js เวอร์ชันใหม่ (ใช้ SYNONYMS และ Extra โดยตรง)
// ================================================================

(function() {
    'use strict';

    // ============================================================
    // 0. ตรวจสอบ Dependencies
    // ============================================================
    if (typeof window.SYNONYMS === 'undefined') {
        console.error('❌ ต้องโหลด script_synonyms.js ก่อน');
        return;
    }
    if (typeof window.Extra === 'undefined') {
        console.error('❌ ต้องโหลด script_extra.js ก่อน');
        return;
    }
    if (typeof window.Commands === 'undefined') {
        console.error('❌ ต้องโหลด script_commands.js ก่อน');
        return;
    }

    // ============================================================
    // 1. HTML และ CSS ของวิดเจ็ตแชท (Glassmorphism)
    // ============================================================

    const CHAT_WIDGET_HTML = `
        <div id="ai-chat-widget">
            <!-- แถบหัวข้อสีม่วง (จุดลาก) พร้อมปุ่มเสียงและปิด -->
            <div id="ai-chat-header">
                <span>💬 นายชด</span>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button id="ai-chat-sound" title="เปิด/ปิดเสียง" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:0.8;transition:0.2s;">🔊</button>
                    <button id="ai-chat-close" title="ปิด" style="background:transparent;border:none;color:#fff;font-size:22px;cursor:pointer;opacity:0.8;transition:0.2s;">✕</button>
                </div>
            </div>
            <!-- พื้นที่แสดงข้อความ -->
            <div id="ai-chat-messages"></div>
            <!-- พื้นที่ป้อนข้อความ -->
            <div id="ai-chat-input-area">
                <input type="text" id="ai-chat-input" placeholder="พิมพ์หรือพูดข้อความ...">
                <button id="ai-chat-mic" title="พิมพ์ด้วยเสียง" style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);border-radius:40px;color:#fff;font-size:20px;cursor:pointer;padding:0 16px;transition:all 0.25s ease;display:flex;align-items:center;justify-content:center;min-width:50px;height:48px;">🎤</button>
                <button id="ai-chat-send">ส่ง</button>
            </div>
        </div>
    `;

    const CHAT_WIDGET_CSS = `
        /* ---------- การ์ดหลักแบบ Glassmorphism ---------- */
        #ai-chat-widget {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 380px;
            height: 520px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            z-index: 99999;
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            overflow: hidden;
            user-select: none;
            transition: background 0.5s ease, box-shadow 0.3s ease, transform 0.2s ease;
        }
        #ai-chat-widget:hover {
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }

        /* ---------- แถบหัวข้อแบบโปร่งแสง ---------- */
        #ai-chat-header {
            background: rgba(123, 47, 252, 0.4);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
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
        #ai-chat-header:active {
            cursor: grabbing;
        }
        #ai-chat-header span {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        /* ปุ่มใน header */
        #ai-chat-sound:hover,
        #ai-chat-close:hover {
            opacity: 1 !important;
            transform: scale(1.1);
        }

        /* ---------- พื้นที่ข้อความโปร่ง ---------- */
        #ai-chat-messages {
            flex: 1;
            padding: 18px 18px 10px 18px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
        }

        /* ---------- ข้อความ (Glassmorphism) ---------- */
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
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .ai-msg.user {
            align-self: flex-end;
            background: rgba(123, 47, 252, 0.5);
            color: #ffffff;
            border-bottom-right-radius: 6px;
            border-color: rgba(123, 47, 252, 0.3);
        }
        .ai-msg.bot {
            align-self: flex-start;
            background: rgba(255, 255, 255, 0.25);
            color: #1e1e2a;
            border-bottom-left-radius: 6px;
            border-color: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }

        /* ข้อความ "กำลังคิด..." */
        .ai-msg.thinking {
            align-self: flex-start;
            background: rgba(255, 255, 255, 0.15);
            color: #555;
            border-bottom-left-radius: 6px;
            font-style: italic;
            border-color: rgba(255, 255, 255, 0.1);
            animation: ai-pulse 1.2s infinite alternate;
        }
        @keyframes ai-pulse {
            0% { opacity: 0.6; }
            100% { opacity: 1; }
        }

        @keyframes ai-fade-in {
            from { opacity: 0; transform: translateY(12px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ---------- พื้นที่ป้อนข้อความแบบโปร่ง ---------- */
        #ai-chat-input-area {
            display: flex;
            gap: 10px;
            padding: 14px 18px 20px 18px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            flex-shrink: 0;
            align-items: center;
        }

        #ai-chat-input {
            flex: 1;
            padding: 12px 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 40px;
            font-size: 15px;
            outline: none;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            color: #1e1e2a;
            transition: all 0.3s ease;
        }
        #ai-chat-input::placeholder {
            color: rgba(30, 30, 42, 0.5);
        }
        #ai-chat-input:focus {
            border-color: rgba(123, 47, 252, 0.6);
            background: rgba(255, 255, 255, 0.25);
            box-shadow: 0 0 20px rgba(123, 47, 252, 0.1);
        }

        #ai-chat-send {
            background: rgba(123, 47, 252, 0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 40px;
            padding: 0 24px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s ease;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 12px rgba(123, 47, 252, 0.2);
            height: 48px;
            white-space: nowrap;
        }
        #ai-chat-send:hover {
            background: rgba(123, 47, 252, 0.8);
            transform: scale(1.02);
            box-shadow: 0 6px 20px rgba(123, 47, 252, 0.3);
        }
        #ai-chat-send:active {
            transform: scale(0.95);
        }

        /* ---------- ปุ่มไมโครโฟน ---------- */
        #ai-chat-mic {
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 40px;
            color: #ffffff;
            font-size: 20px;
            cursor: pointer;
            padding: 0 14px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 48px;
            height: 48px;
        }
        #ai-chat-mic:hover {
            background: rgba(123, 47, 252, 0.3);
            transform: scale(1.05);
        }
        #ai-chat-mic:active {
            transform: scale(0.9);
        }
        #ai-chat-mic.listening {
            background: rgba(255, 50, 50, 0.5);
            animation: mic-pulse 1s infinite;
            border-color: rgba(255, 50, 50, 0.6);
        }
        @keyframes mic-pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 50, 50, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(255, 50, 50, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 50, 50, 0); }
        }

        /* ---------- แถบเลื่อน ---------- */
        #ai-chat-messages::-webkit-scrollbar {
            width: 5px;
        }
        #ai-chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }
        #ai-chat-messages::-webkit-scrollbar-thumb {
            background: rgba(123, 47, 252, 0.3);
            border-radius: 10px;
            backdrop-filter: blur(4px);
        }
        #ai-chat-messages::-webkit-scrollbar-thumb:hover {
            background: rgba(123, 47, 252, 0.6);
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 480px) {
            #ai-chat-widget {
                width: calc(100vw - 20px);
                height: 60vh;
                bottom: 10px;
                right: 10px;
                border-radius: 20px;
            }
            #ai-chat-header {
                border-radius: 20px 20px 0 0;
                padding: 14px 16px;
                font-size: 16px;
            }
            #ai-chat-input-area {
                padding: 10px 14px 16px 14px;
                gap: 6px;
            }
            #ai-chat-input {
                padding: 10px 16px;
                font-size: 14px;
            }
            #ai-chat-send {
                padding: 0 16px;
                font-size: 14px;
                height: 44px;
            }
            #ai-chat-mic {
                min-width: 44px;
                height: 44px;
                font-size: 18px;
                padding: 0 10px;
            }
        }
    `;

    // ============================================================
    // 2. HTML ของ Video Generator (ดัดแปลงจาก script11.js)
    // ============================================================

    const VIDEO_GEN_HTML = `
        <div id="videoGeneratorCard" style="position:fixed; top:80px; left:20px; z-index:9998; width:420px; max-width:90vw; background:rgba(15,23,42,0.12); backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px); border:1px solid rgba(255,255,255,0.06); border-radius:24px; box-shadow:0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(167,139,250,0.08) inset; overflow:hidden; transition:box-shadow 0.3s ease; font-family:'Inter','Segoe UI',sans-serif;">
            <div class="card-title" style="cursor:grab; user-select:none; padding:14px 20px; background:rgba(30,27,75,0.25); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-bottom:1px solid rgba(255,255,255,0.04); display:flex; align-items:center; gap:10px; font-weight:700; font-size:0.95rem; color:#E2E8F0; letter-spacing:0.3px;">
                <span style="filter:drop-shadow(0 0 8px rgba(167,139,250,0.3));">🎬</span>
                <span style="background:linear-gradient(135deg, #C4B5FD, #A78BFA); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">สร้างวิดีโอ (Ken Burns)</span>
                <span style="margin-left:auto; font-size:0.55rem; color:rgba(255,255,255,0.35); font-weight:400; background:rgba(255,255,255,0.05); padding:2px 12px; border-radius:20px; border:1px solid rgba(255,255,255,0.04); backdrop-filter:blur(2px);">ลากได้</span>
            </div>
            <div class="video-grid" style="padding:16px 18px 18px 18px; background:rgba(15,23,42,0.15); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);">
                <div class="drop-zone-row" style="display:flex; gap:12px; flex-wrap:wrap;">
                    <!-- Image Zone -->
                    <div class="drop-zone" id="imageZone" style="flex:1; min-width:120px; background:rgba(11,17,32,0.3); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:12px 10px; text-align:center; cursor:pointer; transition:all 0.3s ease; position:relative; min-height:70px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; box-shadow:0 4px 16px rgba(0,0,0,0.15) inset;">
                        <span class="zone-icon" style="font-size:1.4rem; opacity:0.7;">🖼️</span>
                        <span class="zone-label" style="font-size:0.65rem; color:rgba(148,163,184,0.7); font-weight:500;">วางรูป หรือคลิก</span>
                        <div id="imagePreview">
                            <div id="imagePlaceholder" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                <span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">JPG, PNG, WEBP</span>
                            </div>
                        </div>
                        <span class="zone-meta" id="imageMeta" style="font-size:0.55rem; color:rgba(100,116,139,0.7);"></span>
                        <input type="file" id="imageFileInput" accept="image/*" style="display:none;" />
                        <button class="btn-clear-file" id="triggerImageSelect" style="display:none; position:absolute; top:4px; right:4px; background:rgba(220,38,38,0.5); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.06); border-radius:20px; padding:2px 10px; font-size:0.5rem; color:#fff; cursor:pointer;">เลือกไฟล์</button>
                    </div>
                    <!-- Audio Zone -->
                    <div class="drop-zone" id="audioZone" style="flex:1; min-width:120px; background:rgba(11,17,32,0.3); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:12px 10px; text-align:center; cursor:pointer; transition:all 0.3s ease; position:relative; min-height:70px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; box-shadow:0 4px 16px rgba(0,0,0,0.15) inset;">
                        <span class="zone-icon" style="font-size:1.4rem; opacity:0.7;">🎵</span>
                        <span class="zone-label" style="font-size:0.65rem; color:rgba(148,163,184,0.7); font-weight:500;">วางเสียง หรือคลิก</span>
                        <div id="audioPreview">
                            <div id="audioPlaceholder" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                <span style="font-size:0.55rem; color:rgba(100,116,139,0.6);">MP3, M4A, WAV</span>
                            </div>
                        </div>
                        <span class="zone-meta" id="audioMeta" style="font-size:0.55rem; color:rgba(100,116,139,0.7);"></span>
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
                <div class="vg-progress-wrap" id="progressWrap" style="margin-top:8px; height:3px; background:rgba(30,41,59,0.3); border-radius:4px; overflow:hidden; opacity:0; transition:opacity 0.3s ease;">
                    <div class="vg-progress-bar" id="progressBar" style="height:100%; width:0%; background:linear-gradient(90deg,#60A5FA,#A78BFA); border-radius:4px; transition:width 0.3s ease;"></div>
                </div>
                <div class="vg-progress-label" id="progressLabel" style="font-size:0.6rem; color:rgba(148,163,184,0.5); margin-top:2px; text-align:center; min-height:18px;">⏳ รอเริ่ม...</div>

                <!-- Result Section -->
                <div class="vg-result" id="resultSection" style="margin-top:10px; border-radius:14px; overflow:hidden; background:rgba(11,17,32,0.25); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.05); display:none;">
                    <video id="outputVideo" controls playsinline preload="metadata" style="width:100%; display:block; border-radius:12px 12px 0 0; background:#000; max-height:160px;"></video>
                    <div class="vg-result-actions" style="display:flex; gap:6px; padding:10px 12px; background:rgba(17,29,46,0.2); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); flex-wrap:wrap; align-items:center; border-top:1px solid rgba(255,255,255,0.04);">
                        <span class="vg-status" id="videoStatus" style="font-size:0.7rem; color:rgba(148,163,184,0.7); flex:1;">⏳ กำลังประมวลผล...</span>
                        <a id="downloadLink" download="video.mp4" class="primary" style="display:inline-flex; align-items:center; gap:4px; padding:6px 14px; border-radius:8px; text-decoration:none; font-size:0.7rem; font-weight:600; background:rgba(59,130,246,0.5); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.08); color:#fff; transition:all 0.2s;">⬇️ ดาวน์โหลด</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    const VIDEO_GEN_STYLES = `
        @keyframes spin { to { transform: rotate(360deg); } }
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
        #videoGeneratorCard.dragging {
            opacity: 0.8;
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(167, 139, 250, 0.2) inset !important;
            transition: none;
        }
        .vg-create-btn.loading {
            opacity: 0.6;
        }
        .vg-create-btn.loading .spinner {
            display: inline-block;
        }
        .vg-status.success { color: #22D3EE; }
        .vg-status.error { color: #EF4444; }
        @keyframes wave {
            0% { transform: scaleY(0.4); }
            100% { transform: scaleY(1); }
        }
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

    // ============================================================
    // 3. ฟังก์ชันช่วยสร้าง/แทรก Elements
    // ============================================================

    function injectStyles(css) {
        const id = 'ai-chat-widget-styles';
        let styleEl = document.getElementById(id);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = id;
            document.head.appendChild(styleEl);
        }
        styleEl.textContent += css;
    }

    function injectWidget(html) {
        if (document.getElementById('ai-chat-widget')) return;
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container.firstElementChild);
    }

    function ensureElements() {
        // 1. พื้นหลังหลัก (สำหรับฉากหลัง)
        if (!document.getElementById('gameBackground')) {
            const bgDiv = document.createElement('div');
            bgDiv.id = 'gameBackground';
            bgDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;transition:background-image 0.25s ease;';
            document.body.insertBefore(bgDiv, document.body.firstChild);
        }

        // 2. เมนูฉากหลัง
        if (!document.getElementById('bgMenu')) {
            const menuDiv = document.createElement('div');
            menuDiv.id = 'bgMenu';
            document.body.appendChild(menuDiv);
        }

        // 3. Video Generator Card
        if (!document.getElementById('videoGeneratorCard')) {
            const container = document.createElement('div');
            container.innerHTML = VIDEO_GEN_HTML;
            document.body.appendChild(container.firstElementChild);
            // Inject styles for video gen
            let vgStyle = document.getElementById('vg-styles');
            if (!vgStyle) {
                vgStyle = document.createElement('style');
                vgStyle.id = 'vg-styles';
                vgStyle.textContent = VIDEO_GEN_STYLES;
                document.head.appendChild(vgStyle);
            }
        }
    }

    // ============================================================
    // 4. ฟังก์ชันเริ่มต้น Video Generator UI (ผูก Events)
    // ============================================================

    function initVideoGeneratorUI(extra) {
        const imageInput = document.getElementById('imageFileInput');
        const audioInput = document.getElementById('audioFileInput');
        const triggerImage = document.getElementById('triggerImageSelect');
        const triggerAudio = document.getElementById('triggerAudioSelect');
        const imageZone = document.getElementById('imageZone');
        const audioZone = document.getElementById('audioZone');
        const createBtn = document.getElementById('createBtn');

        // ตั้งค่า Drop Zone
        if (imageZone) extra.setupDropZone(imageZone, true);
        if (audioZone) extra.setupDropZone(audioZone, false);

        // File inputs
        if (triggerImage) {
            triggerImage.addEventListener('click', (e) => {
                e.stopPropagation();
                if (imageInput) imageInput.click();
            });
        }
        if (triggerAudio) {
            triggerAudio.addEventListener('click', (e) => {
                e.stopPropagation();
                if (audioInput) audioInput.click();
            });
        }

        if (imageInput) {
            imageInput.addEventListener('change', () => {
                if (imageInput.files.length) {
                    extra.renderImagePreview(imageInput.files[0]);
                }
            });
        }
        if (audioInput) {
            audioInput.addEventListener('change', () => {
                if (audioInput.files.length) {
                    extra.renderAudioPreview(audioInput.files[0]);
                }
            });
        }

        // Click on zone
        if (imageZone) {
            imageZone.addEventListener('click', (e) => {
                if (e.target.closest('.btn-clear-file') || e.target.closest('img')) return;
                if (!extra.videoGenState.imageFile && imageInput) imageInput.click();
            });
        }
        if (audioZone) {
            audioZone.addEventListener('click', (e) => {
                if (e.target.closest('.btn-clear-file') || e.target.closest('.audio-label')) return;
                if (!extra.videoGenState.audioFile && audioInput) audioInput.click();
            });
        }

        // Create button
        if (createBtn) {
            createBtn.addEventListener('click', async () => {
                const result = await extra.triggerVideoGeneration();
                const statusEl = document.getElementById('videoStatus');
                if (statusEl && typeof result === 'string') {
                    if (result.includes('สำเร็จ')) {
                        statusEl.textContent = result;
                        statusEl.className = 'vg-status success';
                    } else if (result.includes('ไม่สำเร็จ') || result.includes('ผิดพลาด')) {
                        statusEl.textContent = result;
                        statusEl.className = 'vg-status error';
                    }
                }
            });
        }

        // Global drop (ทุกที่บนหน้า)
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

            if (droppedImage) extra.renderImagePreview(droppedImage);
            if (droppedAudio) extra.renderAudioPreview(droppedAudio);
            if (!droppedImage && !droppedAudio) {
                alert('❌ กรุณาลากไฟล์รูปภาพหรือเสียงเท่านั้น');
            }
        });

        // Make Video Generator Draggable
        const card = document.getElementById('videoGeneratorCard');
        if (card) {
            const titleBar = card.querySelector('.card-title');
            if (titleBar) {
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
                    e.preventDefault();
                }

                function endDrag() {
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
        }

        console.log('🎬 Video Generator UI initialized.');
    }

    // ============================================================
    // 5. ฟังก์ชันหลัก: initWidget()
    // ============================================================

    function initWidget() {
        const synonyms = window.SYNONYMS;
        const extra = window.Extra;
        const commands = window.Commands;

        if (!synonyms || !extra || !commands) {
            console.error('❌ Missing dependencies! Check load order.');
            return;
        }

        // ---- 5a. สร้าง Elements ที่จำเป็น ----
        ensureElements();

        // ---- 5b. เริ่มต้นเมนูฉากหลัง ----
        extra.renderBackgroundMenu('bgMenu');
        extra.loadLastBackground();

        // ---- 5c. เริ่มต้น Video Generator ----
        initVideoGeneratorUI(extra);

        // ---- 5d. สร้าง AI Chat Widget ----
        injectStyles(CHAT_WIDGET_CSS);
        injectWidget(CHAT_WIDGET_HTML);

        // ---- 5e. DOM References ----
        const widget = document.getElementById('ai-chat-widget');
        const header = document.getElementById('ai-chat-header');
        const closeBtn = document.getElementById('ai-chat-close');
        const soundBtn = document.getElementById('ai-chat-sound');
        const micBtn = document.getElementById('ai-chat-mic');
        const messagesContainer = document.getElementById('ai-chat-messages');
        const inputField = document.getElementById('ai-chat-input');
        const sendBtn = document.getElementById('ai-chat-send');

        if (!widget || !header || !messagesContainer || !inputField || !sendBtn) {
            console.error('❌ Chat widget elements not found!');
            return;
        }

        // ---- 5f. State ----
        let isProcessing = false;
        let soundEnabled = true;
        const speechSynth = window.speechSynthesis;
        let recognition = null;
        let isListening = false;

        // ---- 5g. ฟังก์ชัน AI ส่งข้อความ (แก้ไขให้ใช้ getAIResponse แบบใหม่) ----
        async function sendMessage() {
            if (isProcessing) return;
            const text = inputField.value.trim();
            if (!text) return;

            extra.addMessage(messagesContainer, text, 'user');
            inputField.value = '';
            inputField.focus();

            isProcessing = true;
            extra.showThinking(messagesContainer);

            try {
                const deps = { widget, header, sendBtn };
                // เรียก getAIResponse ด้วยพารามิเตอร์ (text, deps) เท่านั้น
                const reply = await commands.getAIResponse(text, deps);
                extra.removeThinking();
                extra.addMessage(messagesContainer, reply, 'bot');
                extra.speakText(reply, soundEnabled, speechSynth);
            } catch (err) {
                extra.removeThinking();
                extra.addMessage(messagesContainer, 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล', 'bot');
                console.error('AI Error:', err);
            } finally {
                isProcessing = false;
            }
        }

        // ---- 5h. Event Listeners (แชท) ----
        sendBtn.addEventListener('click', sendMessage);
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });

        // ---- 5i. ไมโครโฟน ----
        function initMic() {
            if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
                micBtn.style.opacity = '0.3';
                micBtn.title = 'เบราว์เซอร์ไม่รองรับ';
                micBtn.style.cursor = 'not-allowed';
                return;
            }
            recognition = extra.initSpeechRecognition();
            if (!recognition) return;
            extra.setupRecognitionEvents(recognition, micBtn, inputField, sendMessage);
        }

        function toggleMic() {
            if (isListening) {
                extra.stopListening(micBtn, inputField, recognition);
                isListening = false;
            } else {
                extra.startListening(micBtn, inputField, recognition);
                isListening = true;
            }
        }

        micBtn.addEventListener('click', toggleMic);
        initMic();

        // ---- 5j. ปุ่มเปิด/ปิดเสียง ----
        function updateSoundIcon() {
            soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
        }

        soundBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            soundEnabled = !soundEnabled;
            updateSoundIcon();
            if (!soundEnabled) extra.stopSpeech(speechSynth);
        });

        // ---- 5k. ปุ่มปิด ----
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            widget.style.display = 'none';
            if (isListening) extra.stopListening(micBtn, inputField, recognition);
            extra.stopSpeech(speechSynth);
            extra.removeThinking();
            isProcessing = false;
        });

        // ---- 5l. ลากการ์ดแชท ----
        let isDraggingChat = false;
        let offsetX = 0, offsetY = 0;

        function onChatDragStart(e) {
            const target = e.target;
            if (target.closest('#ai-chat-close') || target.closest('#ai-chat-sound') || target.closest('#ai-chat-mic')) return;
            isDraggingChat = true;
            const rect = widget.getBoundingClientRect();
            const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
            const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
            widget.style.cursor = 'grabbing';
            document.addEventListener('mousemove', onChatDragMove);
            document.addEventListener('mouseup', onChatDragEnd);
            document.addEventListener('touchmove', onChatDragMove, { passive: false });
            document.addEventListener('touchend', onChatDragEnd);
            e.preventDefault();
        }

        function onChatDragMove(e) {
            if (!isDraggingChat) return;
            const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
            const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
            let left = clientX - offsetX;
            let top = clientY - offsetY;
            const maxX = window.innerWidth - widget.offsetWidth;
            const maxY = window.innerHeight - widget.offsetHeight;
            left = Math.max(0, Math.min(left, maxX));
            top = Math.max(0, Math.min(top, maxY));
            widget.style.left = left + 'px';
            widget.style.top = top + 'px';
            widget.style.right = 'auto';
            widget.style.bottom = 'auto';
            e.preventDefault();
        }

        function onChatDragEnd() {
            if (!isDraggingChat) return;
            isDraggingChat = false;
            widget.style.cursor = '';
            document.removeEventListener('mousemove', onChatDragMove);
            document.removeEventListener('mouseup', onChatDragEnd);
            document.removeEventListener('touchmove', onChatDragMove);
            document.removeEventListener('touchend', onChatDragEnd);
        }

        header.addEventListener('mousedown', onChatDragStart);
        header.addEventListener('touchstart', onChatDragStart, { passive: false });
        widget.addEventListener('selectstart', (e) => { if (isDraggingChat) e.preventDefault(); });

        // ---- 5m. ทักทายอัตโนมัติ ----
        inputField.focus();
        setTimeout(() => {
            extra.addMessage(messagesContainer, 'สวัสดีครับเจ้านาย! พร้อมทำงานแล้วครับ 🫡', 'bot');
            extra.speakText('สวัสดีครับเจ้านาย พร้อมทำงานแล้วครับ', soundEnabled, speechSynth);
        }, 500);

        // ---- 5n. Resize การ์ดแชท ----
        window.addEventListener('resize', function() {
            const rect = widget.getBoundingClientRect();
            const maxX = window.innerWidth - widget.offsetWidth;
            const maxY = window.innerHeight - widget.offsetHeight;
            let left = Math.min(rect.left, maxX);
            let top = Math.min(rect.top, maxY);
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (rect.left !== left || rect.top !== top) {
                widget.style.left = left + 'px';
                widget.style.top = top + 'px';
            }
        });

        // ---- 5o. Keyboard Shortcuts (ปุ่มลัด 0-9) ----
        function handleKeyboardShortcuts(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (isProcessing) return;

            const key = e.key;
            let statusMsg = '';

            function showStatus(text) {
                const statusEl = document.getElementById('imageStatus');
                if (statusEl) {
                    const original = statusEl.innerHTML;
                    statusEl.innerHTML = `⌨️ ${text}`;
                    setTimeout(() => { statusEl.innerHTML = original; }, 1200);
                }
            }

            switch (key) {
                case '1':
                    document.getElementById('removeBgBtn')?.click();
                    statusMsg = 'ลบพื้นหลัง';
                    break;
                case '2':
                    if (messagesContainer) {
                        messagesContainer.innerHTML = '';
                        extra.addMessage(messagesContainer, '🧹 ล้างข้อความทั้งหมดแล้ว', 'bot');
                    }
                    statusMsg = 'ล้างข้อความทั้งหมด';
                    break;
                case '3':
                    document.getElementById('uploadBtn')?.click();
                    statusMsg = 'อัปโหลดรูป';
                    break;
                case '4':
                    document.getElementById('exportBtn')?.click();
                    statusMsg = 'ดาวน์โหลดรูป';
                    break;
                case '5':
                    document.getElementById('createBtn')?.click();
                    statusMsg = 'สร้างวิดีโอ';
                    break;
                case '6':
                    document.getElementById('rotateBtn')?.click();
                    statusMsg = 'หมุนภาพ';
                    break;
                case '7':
                    document.getElementById('flipHorizBtn')?.click();
                    statusMsg = 'กลับซ้ายขวา';
                    break;
                case '8':
                    document.getElementById('flipVertBtn')?.click();
                    statusMsg = 'กลับบนล่าง';
                    break;
                case '9':
                    const filterSelect = document.getElementById('filterSelect');
                    if (filterSelect) {
                        filterSelect.value = 'grayscale';
                        document.getElementById('applyFilterBtn')?.click();
                        statusMsg = 'ฟิลเตอร์ขาวดำ';
                    }
                    break;
                case '0':
                    document.getElementById('resetAdjustBtn')?.click();
                    statusMsg = 'รีเซ็ตการปรับแต่ง';
                    break;
                default:
                    return;
            }

            if (statusMsg) {
                const statusEl = document.getElementById('imageStatus');
                if (statusEl) {
                    const original = statusEl.innerHTML;
                    statusEl.innerHTML = `⌨️ ${statusMsg}`;
                    setTimeout(() => { statusEl.innerHTML = original; }, 1200);
                }
                console.log(`⌨️ กดปุ่ม ${key}: ${statusMsg}`);
            }
        }

        document.addEventListener('keydown', handleKeyboardShortcuts);

        // ---- 5p. Cleanup เมื่อปิดหน้า ----
        window.addEventListener('beforeunload', function() {
            extra.cleanupGarbage();
        });

        // ---- สรุปการโหลด ----
        console.log('✅ PixelForge Integrated System Ready!');
        console.log('   - AI Chat Widget');
        console.log('   - Background Menu');
        console.log('   - Video Generator');
        console.log('   - Voice Control (Mic + TTS)');
        console.log('   - Keyboard Shortcuts: 0-9');
    }

    // ============================================================
    // 6. รันเมื่อ DOM พร้อม
    // ============================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        // หน่วงเวลาเล็กน้อยเพื่อให้ script.js (PixelForge) โหลดเสร็จ
        setTimeout(initWidget, 100);
    }

})();