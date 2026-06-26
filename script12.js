// ================================================================
// script12.js — เพิ่มระบบ AI โต้ตอบ + Glassmorphism + เสียง + ไมโครโฟน
// รองรับคำสั่ง "ทำงาน" เปิดลิงก์, "เปลี่ยนพื้นหลัง", ทักทายอัตโนมัติ
// ================================================================

(function() {
    'use strict';

    // ============================================================
    // 1. สร้างโครงสร้าง HTML ของวิดเจ็ต (เพิ่มปุ่มไมโครโฟน)
    // ============================================================
    const widgetHTML = `
        <div id="ai-chat-widget">
            <div id="ai-chat-header">
                <span>💬 นายชด</span>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button id="ai-chat-sound" title="เปิด/ปิดเสียง" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:0.8;transition:0.2s;">🔊</button>
                    <button id="ai-chat-close" title="ปิด" style="background:transparent;border:none;color:#fff;font-size:22px;cursor:pointer;opacity:0.8;transition:0.2s;">✕</button>
                </div>
            </div>
            <div id="ai-chat-messages"></div>
            <div id="ai-chat-input-area">
                <input type="text" id="ai-chat-input" placeholder="พิมพ์หรือพูดข้อความ...">
                <button id="ai-chat-mic" title="พิมพ์ด้วยเสียง" style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);border-radius:40px;color:#fff;font-size:20px;cursor:pointer;padding:0 16px;transition:all 0.25s ease;display:flex;align-items:center;justify-content:center;min-width:50px;height:48px;">🎤</button>
                <button id="ai-chat-send">ส่ง</button>
            </div>
        </div>
    `;

    // ============================================================
    // 2. CSS Glassmorphism (เพิ่มสไตล์ไมโครโฟน)
    // ============================================================
    const widgetCSS = `
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
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            overflow: hidden;
            user-select: none;
            transition: background 0.5s ease, box-shadow 0.3s ease, transform 0.2s ease;
        }
        #ai-chat-widget:hover {
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }
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
        #ai-chat-sound:hover,
        #ai-chat-close:hover {
            opacity: 1 !important;
            transform: scale(1.1);
        }
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

        /* ===== ปุ่มไมโครโฟน ===== */
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
            background: rgba(255, 255, 255, 0.1);
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
        #ai-chat-mic.listening:hover {
            background: rgba(255, 50, 50, 0.6);
        }
        #ai-chat-mic.listening .mic-icon {
            display: inline-block;
        }

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
    // 3. แทรก CSS และ HTML
    // ============================================================
    function injectStyles(css) {
        const styleEl = document.createElement('style');
        styleEl.id = 'ai-chat-widget-styles';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    function injectWidget(html) {
        if (document.getElementById('ai-chat-widget')) return;
        const container = document.createElement('div');
        container.innerHTML = html;
        const widget = container.firstElementChild;
        document.body.appendChild(widget);
    }

    // ============================================================
    // 4. ตรรกะหลัก
    // ============================================================
    function initWidget() {
        const widget = document.getElementById('ai-chat-widget');
        const header = document.getElementById('ai-chat-header');
        const closeBtn = document.getElementById('ai-chat-close');
        const soundBtn = document.getElementById('ai-chat-sound');
        const micBtn = document.getElementById('ai-chat-mic');
        const messagesContainer = document.getElementById('ai-chat-messages');
        const inputField = document.getElementById('ai-chat-input');
        const sendBtn = document.getElementById('ai-chat-send');

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        let isProcessing = false;

        // ---------- เสียง (Text-to-Speech) ----------
        let soundEnabled = true;
        let speechSynth = window.speechSynthesis;
        let utterance = null;
        let voicesLoaded = false;

        function loadVoices() {
            if (!window.speechSynthesis) return;
            const voices = speechSynth.getVoices();
            if (voices.length > 0) voicesLoaded = true;
        }
        if (window.speechSynthesis) {
            speechSynth.getVoices();
            speechSynth.onvoiceschanged = () => {
                speechSynth.getVoices();
                voicesLoaded = true;
            };
            setTimeout(loadVoices, 500);
        }

        function updateSoundIcon() {
            soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
        }

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
            if (speechSynth && speechSynth.speaking) speechSynth.cancel();
        }

        // ---------- ข้อความ ----------
        function addMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ai-msg ${sender}`;
            msgDiv.textContent = text;
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return msgDiv;
        }

        let thinkingElement = null;
        function showThinking() {
            removeThinking();
            thinkingElement = document.createElement('div');
            thinkingElement.className = 'ai-msg thinking';
            thinkingElement.textContent = '🤔 กำลังคิด...';
            messagesContainer.appendChild(thinkingElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        function removeThinking() {
            if (thinkingElement && thinkingElement.parentNode) {
                thinkingElement.remove();
                thinkingElement = null;
            }
        }

        // ============================================================
        // 5. ไมโครโฟน (Speech-to-Text)
        // ============================================================
        let recognition = null;
        let isListening = false;
        let micStream = null;

        function initSpeechRecognition() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.warn('เบราว์เซอร์นี้ไม่รองรับ Speech Recognition');
                micBtn.style.opacity = '0.4';
                micBtn.title = 'เบราว์เซอร์ไม่รองรับการพิมพ์ด้วยเสียง';
                return null;
            }
            const recog = new SpeechRecognition();
            recog.lang = 'th-TH';
            recog.continuous = false;
            recog.interimResults = true;
            recog.maxAlternatives = 1;
            return recog;
        }

        function startListening() {
            if (!recognition) {
                recognition = initSpeechRecognition();
                if (!recognition) return;
                setupRecognitionEvents();
            }
            try {
                recognition.start();
                isListening = true;
                micBtn.classList.add('listening');
                micBtn.textContent = '⏹️';
                micBtn.title = 'หยุดฟัง';
                inputField.placeholder = '🎤 กำลังฟัง... พูดเลยครับ';
                console.log('🎤 เริ่มฟังเสียง...');
            } catch (e) {
                console.warn('Speech recognition start error:', e);
                // ถ้าเกิด error ให้ลองใหม่
                if (e.message && e.message.includes('already started')) {
                    stopListening();
                    setTimeout(() => startListening(), 300);
                }
            }
        }

        function stopListening() {
            if (recognition) {
                try {
                    recognition.stop();
                } catch (e) {
                    console.warn('Stop recognition error:', e);
                }
            }
            isListening = false;
            micBtn.classList.remove('listening');
            micBtn.textContent = '🎤';
            micBtn.title = 'พิมพ์ด้วยเสียง';
            if (inputField.placeholder === '🎤 กำลังฟัง... พูดเลยครับ') {
                inputField.placeholder = 'พิมพ์หรือพูดข้อความ...';
            }
            console.log('⏹️ หยุดฟังเสียง');
        }

        function setupRecognitionEvents() {
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
                // แสดงข้อความที่ได้ขณะพูด (เฉพาะ interim)
                if (interimTranscript) {
                    inputField.value = interimTranscript;
                }
                // เมื่อได้ผลลัพธ์สุดท้าย
                if (finalTranscript) {
                    inputField.value = finalTranscript.trim();
                    // หยุดฟังอัตโนมัติ
                    stopListening();
                    // ส่งข้อความทันที
                    sendMessage();
                }
            };

            recognition.onerror = function(event) {
                console.log('🎤 Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    micBtn.style.opacity = '0.4';
                    micBtn.title = 'ไม่อนุญาตให้ใช้ไมโครโฟน';
                }
                if (event.error === 'no-speech') {
                    // ไม่มีเสียงพูด ให้หยุดฟัง
                    stopListening();
                    inputField.placeholder = 'ไม่ได้ยินเสียงครับ พิมพ์แทนก็ได้นะ';
                    setTimeout(() => {
                        if (inputField.placeholder === 'ไม่ได้ยินเสียงครับ พิมพ์แทนก็ได้นะ') {
                            inputField.placeholder = 'พิมพ์หรือพูดข้อความ...';
                        }
                    }, 2000);
                }
                stopListening();
            };

            recognition.onend = function() {
                // ถ้ายังมีสถานะ listening อยู่ ให้หยุด
                if (isListening) {
                    stopListening();
                }
                // เปลี่ยน placeholder กลับ
                if (inputField.placeholder === '🎤 กำลังฟัง... พูดเลยครับ') {
                    inputField.placeholder = 'พิมพ์หรือพูดข้อความ...';
                }
                console.log('🎤 สิ้นสุดการฟัง');
            };
        }

        // ---------- เปลี่ยนพื้นหลัง ----------
        function changeBackground() {
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
            widget.style.background = randomColor;
            header.style.background = randomColor.replace('0.25', '0.5');
            sendBtn.style.background = randomColor.replace('0.25', '0.7');
            return 'เปลี่ยนพื้นหลังให้แล้วครับเจ้านาย! 🎨';
        }

        // ============================================================
        // 6. AI ตอบสนอง
        // ============================================================
        function getAIResponse(userMessage) {
            return new Promise((resolve) => {
                const delay = 600 + Math.random() * 1000;
                setTimeout(() => {
                    const msg = userMessage.trim().toLowerCase();
                    let reply = '';

                    // เปลี่ยนพื้นหลัง
                    if (msg.includes('เปลี่ยนพื้นหลัง') || msg.includes('เปลี่ยนสี') || msg.includes('change background') || msg.includes('change color')) {
                        reply = changeBackground();
                    }
                    // ทำงาน / เปิดลิงก์
                    else if (msg.includes('ทำงาน') || msg.includes('เปิดลิงก์') || msg.includes('open') || msg.includes('start')) {
                        window.open('https://taboonchai1991-ops.github.io/Link-Dark-Aura/', '_blank');
                        reply = 'ครับเจ้านาย! ผมเปิดโปรแกรมแต่งรูปที่ทันสมัยที่สุดให้แล้วครับ 🫡';
                    }
                    else if (msg.includes('สวัสดี') || msg.includes('hello') || msg.includes('หวัดดี')) {
                        const greetings = [
                            'สวัสดีครับ! ยินดีที่ได้รู้จัก คุณต้องการสอบถามอะไรไหม?',
                            'หวัดดีจ้า! พร้อมช่วยเหลือคุณเสมอครับ',
                            'Hello! มีอะไรให้ฉันช่วยไหม?'
                        ];
                        reply = greetings[Math.floor(Math.random() * greetings.length)];
                    }
                    else if (msg.includes('ชื่อ') || msg.includes('name')) {
                        const names = [
                            'ฉันชื่อ "AI Assistant" ค่ะ คุณสามารถเรียกฉันว่า AI หรือ Assis ก็ได้',
                            'ชื่อของฉันคือ "Glass AI" เพราะฉันโปร่งใสแถมเท่ห์มาก!',
                            'ฉันไม่มีชื่อจริงๆ แต่เพื่อนๆ เรียกฉันว่า "ผู้ช่วยอัจฉริยะ"'
                        ];
                        reply = names[Math.floor(Math.random() * names.length)];
                    }
                    else if (msg.includes('อายุ') || msg.includes('age') || msg.includes('เกิด')) {
                        const ages = [
                            'ฉันเกิดเมื่อปี 2024 ตอนนี้ก็ 2 ขวบแล้ว (แต่อยู่ในโลกดิจิทัล)',
                            'อายุของฉันคือ "เวอร์ชัน 1.0" ฮ่า ๆ',
                            'ในฐานะ AI ฉันไม่มีอายุ แต่ฉันถูกสร้างขึ้นเมื่อไม่นานมานี้'
                        ];
                        reply = ages[Math.floor(Math.random() * ages.length)];
                    }
                    else if (msg.includes('เวลา') || msg.includes('time') || msg.includes('วันนี้')) {
                        const now = new Date();
                        const dateStr = now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
                        reply = `⏰ ขณะนี้เวลา ${dateStr} ครับ`;
                    }
                    else if (msg.includes('ขอโทษ') || msg.includes('sorry') || msg.includes('ขออภัย')) {
                        const sorry = [
                            'ไม่เป็นไรครับ ทุกคนผิดพลาดกันได้',
                            'ไม่ต้องขอโทษเลยค่ะ ฉันยินดีช่วยเสมอ',
                            'โอเค รับทราบครับ มีอะไรให้ช่วยไหม?'
                        ];
                        reply = sorry[Math.floor(Math.random() * sorry.length)];
                    }
                    else if (msg.includes('ขอบคุณ') || msg.includes('thank')) {
                        const thanks = [
                            'ด้วยความยินดีครับ!',
                            'ยินดีเสมอค่ะ 😊',
                            'ขอบคุณที่ใช้บริการครับ'
                        ];
                        reply = thanks[Math.floor(Math.random() * thanks.length)];
                    }
                    else if (msg.includes('ช่วย') || msg.includes('help')) {
                        const helps = [
                            'ฉันสามารถตอบคำถามทั่วไป, บอกเวลา, หรือช่วยแนะนำสิ่งต่างๆ ได้นะ',
                            'คุณสามารถถามเกี่ยวกับชื่อ, อายุ, เวลา หรือแค่ทักทายก็ได้',
                            'ลองถามอะไรก็ได้สิ ฉันจะตอบให้เต็มที่!'
                        ];
                        reply = helps[Math.floor(Math.random() * helps.length)];
                    }
                    else if (msg.includes('ลาก่อน') || msg.includes('bye') || msg.includes('ไปล่ะ')) {
                        const byes = [
                            'ลาก่อน! กลับมาใหม่ได้ตลอดนะครับ',
                            'บายบาย! ขอให้มีความสุขครับ',
                            'แล้วพบกันใหม่จ้า 👋'
                        ];
                        reply = byes[Math.floor(Math.random() * byes.length)];
                    }
                    else {
                        const generals = [
                            `ฉันเข้าใจว่า "${userMessage}" น่าสนใจมาก! คุณช่วยอธิบายเพิ่มเติมได้ไหม?`,
                            `ขอบคุณที่แชร์ "${userMessage}" ฉันจะจดจำไว้`,
                            `โอ้! "${userMessage}" เป็นสิ่งที่ฉันไม่เคยรู้มาก่อน`,
                            `น่าสนใจ! คุณคิดว่าอะไรเกี่ยวกับ "${userMessage}" ที่สำคัญที่สุด?`,
                            `ฉันเห็นด้วยกับคุณเกี่ยวกับ "${userMessage}"`,
                            `คุณพูดถึง "${userMessage}" แล้วฉันก็คิดถึงเรื่องอื่นด้วย`,
                            `ขอบคุณที่ถาม ฉันจะหาคำตอบเกี่ยวกับ "${userMessage}" ให้คุณ`,
                            `เป็นประเด็นที่ดีเลยครับ เกี่ยวกับ "${userMessage}" คุณคิดอย่างไร?`
                        ];
                        reply = generals[Math.floor(Math.random() * generals.length)];
                    }

                    resolve(reply);
                }, delay);
            });
        }

        // ---------- ส่งข้อความ ----------
        async function sendMessage() {
            if (isProcessing) return;
            const text = inputField.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            inputField.value = '';
            inputField.focus();

            isProcessing = true;
            showThinking();

            try {
                const reply = await getAIResponse(text);
                removeThinking();
                addMessage(reply, 'bot');
                speakText(reply);
            } catch (error) {
                removeThinking();
                addMessage('ขออภัย เกิดข้อผิดพลาดในการประมวลผล', 'bot');
                console.error('AI Error:', error);
            } finally {
                isProcessing = false;
            }
        }

        // ---------- Event listeners ----------
        sendBtn.addEventListener('click', sendMessage);
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });

        // ---------- ไมโครโฟน ----------
        micBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        });

        // ตรวจสอบว่าเบราว์เซอร์รองรับหรือไม่
        if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
            micBtn.style.opacity = '0.3';
            micBtn.title = 'เบราว์เซอร์ไม่รองรับการพิมพ์ด้วยเสียง';
            micBtn.style.cursor = 'not-allowed';
        }

        // ---------- เสียง ----------
        soundBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            soundEnabled = !soundEnabled;
            updateSoundIcon();
            if (!soundEnabled) stopSpeech();
        });

        // ---------- ลากการ์ด ----------
        function onMouseDown(e) {
            const target = e.target;
            if (target.closest('#ai-chat-close') || target.closest('#ai-chat-sound') || target.closest('#ai-chat-mic')) return;
            isDragging = true;
            const rect = widget.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            widget.style.cursor = 'grabbing';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        }

        function onMouseMove(e) {
            if (!isDragging) return;
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;
            const w = widget.offsetWidth;
            const h = widget.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, winWidth - w));
            newTop = Math.max(0, Math.min(newTop, winHeight - h));
            widget.style.left = newLeft + 'px';
            widget.style.top = newTop + 'px';
            widget.style.right = 'auto';
            widget.style.bottom = 'auto';
            e.preventDefault();
        }

        function onMouseUp() {
            isDragging = false;
            widget.style.cursor = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        header.addEventListener('mousedown', onMouseDown);

        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            widget.style.display = 'none';
            stopSpeech();
            if (isListening) stopListening();
            removeThinking();
            isProcessing = false;
        });

        // ============================================================
        // ★★★ ทักทายอัตโนมัติ ★★★
        // ============================================================
        inputField.focus();

        setTimeout(() => {
            addMessage('สวัสดีครับเจ้านาย! พร้อมทำงานแล้วครับ 🫡', 'bot');
            speakText('สวัสดีครับเจ้านาย พร้อมทำงานแล้วครับ');
        }, 500);

        // ป้องกันการเลือกข้อความขณะลาก
        widget.addEventListener('selectstart', (e) => {
            if (isDragging) e.preventDefault();
        });

        console.log('✅ Glass AI Chat Widget พร้อมทำงาน (รวมเปลี่ยนพื้นหลัง + ไมโครโฟน)');
    }

    // ============================================================
    // 7. รันเมื่อ DOM พร้อม
    // ============================================================
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