// ================================================================
// script_commands.js — ตรรกะ AI ขั้นสูง (ซับซ้อน)
// รองรับ: จำชื่อ, คำนวณ, สภาพอากาศจำลอง, บริบท, คำสั่งครบ
// ใช้ window.SYNONYMS และ window.Extra โดยตรง
// ================================================================

(function() {
    'use strict';

    // ===== Context Memory (จำบริบทการสนทนา) =====
    let conversationContext = {
        userName: null,          // ชื่อผู้ใช้ (ถ้าบอก)
        lastTopic: null,         // หัวข้อล่าสุด
        history: [],             // ประวัติข้อความ (สูงสุด 10)
        userPrefs: {}            // สำรองสำหรับอนาคต
    };

    // ===== ฟังก์ชันอัปเดต Context =====
    function updateContext(key, value) {
        conversationContext[key] = value;
        if (conversationContext.history.length > 10) {
            conversationContext.history.shift();
        }
    }

    window.Commands = {
        /**
         * ฟังก์ชันหลัก AI (ปรับปรุงให้ซับซ้อนขึ้น)
         * @param {string} userMessage - ข้อความที่ผู้ใช้พิมพ์/พูด
         * @param {object} deps - { widget, header, sendBtn } สำหรับ UI
         */
        getAIResponse: function(userMessage, deps) {
            return new Promise(async (resolve) => {
                const delay = 600 + Math.random() * 1000;
                setTimeout(async () => {
                    const msg = userMessage.trim().toLowerCase();
                    let reply = '';

                    // ฟังก์ชันตรวจสอบคำในหมวดหมู่ (ใช้ window.SYNONYMS)
                    const check = (category) => {
                        if (!window.SYNONYMS || !window.SYNONYMS[category]) return false;
                        return window.SYNONYMS[category].some(word => msg.includes(word));
                    };

                    // ==========================================================
                    // 1. ตรวจจับชื่อผู้ใช้ (เช่น "ฉันชื่อสมชาย")
                    // ==========================================================
                    const nameMatch = userMessage.match(/ชื่อ\s*(.+)/i) || 
                                      userMessage.match(/我叫\s*(.+)/i);
                    if (nameMatch) {
                        const name = nameMatch[1].trim();
                        conversationContext.userName = name;
                        updateContext('userName', name);
                        reply = `ยินดีที่ได้รู้จักคุณ ${name} ครับ! 😊`;
                    }

                    // ==========================================================
                    // 2. คำสั่งเปิดลิงก์ / ทำงาน
                    // ==========================================================
                    else if (check('work')) {
                        window.open('https://taboonchai1991-ops.github.io/Link-Dark-Aura/', '_blank');
                        reply = 'ครับเจ้านาย! ผมเปิดโปรแกรมแต่งรูปให้แล้วครับ 🫡';
                    }

                    // ==========================================================
                    // 3. คำถามเกี่ยวกับชื่อ (ถามชื่อเรา)
                    // ==========================================================
                    else if (check('name')) {
                        const myName = 'นายชด (AI Assistant)';
                        reply = `ฉันชื่อ ${myName} ค่ะ`;
                        if (conversationContext.userName) {
                            reply += ` แล้วคุณ ${conversationContext.userName} เรียกฉันว่าอะไรก็ได้นะครับ`;
                        }
                    }

                    // ==========================================================
                    // 4. คำถามเกี่ยวกับอายุ
                    // ==========================================================
                    else if (check('age')) {
                        reply = 'ฉันเป็น AI เกิดเมื่อปี 2024 ค่ะ (เวอร์ชัน 1.0)';
                    }

                    // ==========================================================
                    // 5. เวลาปัจจุบัน
                    // ==========================================================
                    else if (check('time')) {
                        const now = new Date();
                        const dateStr = now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
                        reply = `⏰ ขณะนี้เวลา ${dateStr} ครับ`;
                    }

                    // ==========================================================
                    // 6. สภาพอากาศ (จำลอง)
                    // ==========================================================
                    else if (msg.includes('อากาศ') || msg.includes('weather') || msg.includes('ฝน')) {
                        const weathers = ['แดดออก', 'มีเมฆบางส่วน', 'ฝนตกเล็กน้อย', 'อากาศร้อน', 'เย็นสบาย', 'ลมแรง'];
                        const temps = ['25', '26', '27', '28', '29', '30'];
                        const randW = Math.floor(Math.random() * weathers.length);
                        const randT = Math.floor(Math.random() * temps.length);
                        reply = `🌤️ วันนี้อากาศ: ${weathers[randW]} อุณหภูมิประมาณ ${temps[randT]}°C ครับ`;
                    }

                    // ==========================================================
                    // 7. การคำนวณทางคณิตศาสตร์
                    // ==========================================================
                    else if (msg.match(/[\d\+\-\*\/\(\)]+/)) {
                        try {
                            if (msg.match(/[+\-*/]/)) {
                                const expr = msg.replace(/[^0-9+\-*/()\s.]/g, '').trim();
                                if (expr) {
                                    const result = Function('"use strict"; return (' + expr + ')')();
                                    if (!isNaN(result) && isFinite(result)) {
                                        reply = `🧮 ผลลัพธ์ของ ${expr} = ${result} ครับ`;
                                    } else {
                                        reply = 'ขอโทษครับ ผมคำนวณไม่ได้';
                                    }
                                } else {
                                    reply = 'ไม่เจอตัวเลขที่จะคำนวณครับ';
                                }
                            } else {
                                reply = 'คุณต้องการให้คำนวณอะไรครับ?';
                            }
                        } catch (e) {
                            reply = 'ขอโทษครับ ผมไม่เข้าใจสมการนี้';
                        }
                    }

                    // ==========================================================
                    // 8. คำสั่งเปลี่ยนพื้นหลังการ์ดแชท
                    // ==========================================================
                    else if (check('bg')) {
                        const { widget, header, sendBtn } = deps || {};
                        reply = window.Extra.changeBackground(widget, header, sendBtn);
                    }

                    // ==========================================================
                    // 9. คำสั่งเปลี่ยนพื้นหลังแอป (ทั้งหน้า)
                    // ==========================================================
                    else if (msg.includes('เปลี่ยนพื้นหลังแอป') || msg.includes('เปลี่ยนพื้นหลังหน้าเว็บ')) {
                        reply = window.Extra.changeAppBackground();
                    }

                    // ==========================================================
                    // 10. คำสั่งเปลี่ยนฉากหลัง (Background Library)
                    // ==========================================================
                    else if (check('bg_forest')) {
                        const success = window.Extra.setBackgroundById('bg_forest');
                        reply = success ? '✅ เปลี่ยนเป็นฉากหลัง "เรือนไทยโบราณ" แล้วครับ' : '❌ เปลี่ยนฉากหลังไม่สำเร็จ';
                    }
                    else if (check('bg_ocean')) {
                        const success = window.Extra.setBackgroundById('bg_ocean');
                        reply = success ? '✅ เปลี่ยนเป็นฉากหลัง "ห้องสมุดพระเครื่อง" แล้วครับ' : '❌ เปลี่ยนฉากหลังไม่สำเร็จ';
                    }
                    else if (check('bg_mountain')) {
                        const success = window.Extra.setBackgroundById('bg_mountain');
                        reply = success ? '✅ เปลี่ยนเป็นฉากหลัง "อยุธยา" แล้วครับ' : '❌ เปลี่ยนฉากหลังไม่สำเร็จ';
                    }
                    else if (check('bg_city')) {
                        const success = window.Extra.setBackgroundById('bg_city');
                        reply = success ? '✅ เปลี่ยนเป็นฉากหลัง "เมืองกลางคืน" แล้วครับ' : '❌ เปลี่ยนฉากหลังไม่สำเร็จ';
                    }
                    else if (check('bg_default')) {
                        const success = window.Extra.setBackgroundById('bg_default');
                        reply = success ? '✅ เปลี่ยนเป็นลายตาราง (เริ่มต้น) แล้วครับ' : '❌ เปลี่ยนฉากหลังไม่สำเร็จ';
                    }

                    // ==========================================================
                    // 11. คำสั่งปรับแต่งภาพ (Brightness, Contrast, Saturation, Blur)
                    // ==========================================================
                    else if (check('brightness_inc')) {
                        const val = window.Extra.controlSlider('brightness', 10);
                        reply = `✅ เพิ่มความสว่างเป็น ${val} แล้วครับ`;
                    }
                    else if (check('brightness_dec')) {
                        const val = window.Extra.controlSlider('brightness', -10);
                        reply = `✅ ลดความสว่างเป็น ${val} แล้วครับ`;
                    }
                    else if (check('contrast_inc')) {
                        const val = window.Extra.controlSlider('contrast', 10);
                        reply = `✅ เพิ่มความคมชัดเป็น ${val} แล้วครับ`;
                    }
                    else if (check('contrast_dec')) {
                        const val = window.Extra.controlSlider('contrast', -10);
                        reply = `✅ ลดความคมชัดเป็น ${val} แล้วครับ`;
                    }
                    else if (check('saturation_inc')) {
                        const val = window.Extra.controlSlider('saturation', 10);
                        reply = `✅ เพิ่มความอิ่มสีเป็น ${val} แล้วครับ`;
                    }
                    else if (check('saturation_dec')) {
                        const val = window.Extra.controlSlider('saturation', -10);
                        reply = `✅ ลดความอิ่มสีเป็น ${val} แล้วครับ`;
                    }
                    else if (check('blur_inc')) {
                        const val = window.Extra.controlSlider('blur', 1);
                        reply = `✅ เพิ่มเบลอเป็น ${val} แล้วครับ`;
                    }
                    else if (check('blur_dec')) {
                        const val = window.Extra.controlSlider('blur', -1);
                        reply = `✅ ลดเบลอเป็น ${val} แล้วครับ`;
                    }
                    else if (check('reset_adjust')) {
                        reply = window.Extra.resetAllAdjustments();
                    }

                    // ==========================================================
                    // 12. คำสั่งฟิลเตอร์
                    // ==========================================================
                    else if (check('filter_grayscale')) {
                        const select = document.getElementById('filterSelect');
                        if (select) { select.value = 'grayscale'; window.Extra.triggerButton('applyFilterBtn'); reply = '✅ เปลี่ยนเป็นฟิลเตอร์ขาวดำแล้วครับ'; } else reply = '❌ ไม่พบตัวเลือกฟิลเตอร์';
                    }
                    else if (check('filter_sepia')) {
                        const select = document.getElementById('filterSelect');
                        if (select) { select.value = 'sepia'; window.Extra.triggerButton('applyFilterBtn'); reply = '✅ เปลี่ยนเป็นฟิลเตอร์ซีเปียแล้วครับ'; } else reply = '❌ ไม่พบตัวเลือกฟิลเตอร์';
                    }
                    else if (check('filter_invert')) {
                        const select = document.getElementById('filterSelect');
                        if (select) { select.value = 'invert'; window.Extra.triggerButton('applyFilterBtn'); reply = '✅ เปลี่ยนเป็นฟิลเตอร์กลับสีแล้วครับ'; } else reply = '❌ ไม่พบตัวเลือกฟิลเตอร์';
                    }
                    else if (check('filter_vintage')) {
                        const select = document.getElementById('filterSelect');
                        if (select) { select.value = 'vintage'; window.Extra.triggerButton('applyFilterBtn'); reply = '✅ เปลี่ยนเป็นฟิลเตอร์วินเทจแล้วครับ'; } else reply = '❌ ไม่พบตัวเลือกฟิลเตอร์';
                    }
                    else if (check('filter_cool')) {
                        const select = document.getElementById('filterSelect');
                        if (select) { select.value = 'cool'; window.Extra.triggerButton('applyFilterBtn'); reply = '✅ เปลี่ยนเป็นฟิลเตอร์โทนเย็นแล้วครับ'; } else reply = '❌ ไม่พบตัวเลือกฟิลเตอร์';
                    }
                    else if (check('filter_warm')) {
                        const select = document.getElementById('filterSelect');
                        if (select) { select.value = 'warm'; window.Extra.triggerButton('applyFilterBtn'); reply = '✅ เปลี่ยนเป็นฟิลเตอร์โทนอุ่นแล้วครับ'; } else reply = '❌ ไม่พบตัวเลือกฟิลเตอร์';
                    }
                    else if (check('apply_filter')) {
                        const success = window.Extra.triggerButton('applyFilterBtn');
                        reply = success ? '✅ ใช้ฟิลเตอร์แล้วครับ' : '❌ ไม่พบปุ่มใช้ฟิลเตอร์';
                    }
                    else if (check('remove_filter')) {
                        const success = window.Extra.triggerButton('removeFilterBtn');
                        reply = success ? '✅ ลบฟิลเตอร์แล้วครับ' : '❌ ไม่พบปุ่มลบฟิลเตอร์';
                    }

                    // ==========================================================
                    // 13. คำสั่งหมุน/พลิก
                    // ==========================================================
                    else if (check('flip_h')) {
                        const success = window.Extra.triggerButton('flipHorizBtn');
                        reply = success ? '✅ กลับซ้ายขวาแล้วครับ' : '❌ ไม่พบปุ่มกลับซ้ายขวา';
                    }
                    else if (check('flip_v')) {
                        const success = window.Extra.triggerButton('flipVertBtn');
                        reply = success ? '✅ กลับบนล่างแล้วครับ' : '❌ ไม่พบปุ่มกลับบนล่าง';
                    }
                    else if (check('rotate')) {
                        const success = window.Extra.triggerButton('rotateBtn');
                        reply = success ? '✅ หมุนภาพแล้วครับ' : '❌ ไม่พบปุ่มหมุน';
                    }

                    // ==========================================================
                    // 14. ลบพื้นหลัง
                    // ==========================================================
                    else if (check('remove_bg')) {
                        const success = window.Extra.triggerButton('removeBgBtn');
                        reply = success ? '✨ กำลังลบพื้นหลังให้นะครับ (อาจใช้เวลาสักครู่)' : '❌ ไม่พบปุ่มลบพื้นหลัง';
                    }

                    // ==========================================================
                    // 15. Video Generator
                    // ==========================================================
                    else if (check('video_gen')) {
                        reply = await window.Extra.triggerVideoGeneration();
                    }
                    else if (check('add_image')) {
                        const imageInput = document.getElementById('imageFileInput');
                        if (imageInput) { imageInput.click(); reply = '✅ เปิดให้เลือกรูปภาพแล้วครับ กรุณาเลือกไฟล์รูป'; } else reply = '❌ ไม่พบปุ่มเลือกรูปภาพ';
                    }
                    else if (check('add_audio')) {
                        const audioInput = document.getElementById('audioFileInput');
                        if (audioInput) { audioInput.click(); reply = '✅ เปิดให้เลือกไฟล์เสียงแล้วครับ กรุณาเลือกไฟล์เสียง'; } else reply = '❌ ไม่พบปุ่มเลือกไฟล์เสียง';
                    }
                    else if (check('clear_image')) {
                        window.Extra.clearImage();
                        reply = '✅ ลบภาพเรียบร้อยแล้วครับ';
                    }
                    else if (check('clear_audio')) {
                        window.Extra.clearAudio();
                        reply = '✅ ลบเสียงเรียบร้อยแล้วครับ';
                    }

                    // ==========================================================
                    // 16. รีเซ็ตทั้งหมด
                    // ==========================================================
                    else if (check('reset_all')) {
                        window.Extra.resetAllAdjustments();
                        const filterSelect = document.getElementById('filterSelect');
                        if (filterSelect) filterSelect.value = 'none';
                        const removeFilterBtn = document.getElementById('removeFilterBtn');
                        if (removeFilterBtn) removeFilterBtn.click();
                        reply = '✅ รีเซ็ตทุกอย่างเรียบร้อยแล้วครับ!';
                    }

                    // ==========================================================
                    // 17. แสดง/ซ่อนเมนู
                    // ==========================================================
                    else if (check('show_menu')) {
                        const menu = document.getElementById('bgMenu');
                        if (menu) { menu.style.display = 'flex'; reply = '✅ แสดงเมนูฉากหลังแล้วครับ'; } else reply = '❌ ไม่พบเมนูฉากหลัง';
                    }
                    else if (check('hide_menu')) {
                        const menu = document.getElementById('bgMenu');
                        if (menu) { menu.style.display = 'none'; reply = '✅ ซ่อนเมนูฉากหลังแล้วครับ'; } else reply = '❌ ไม่พบเมนูฉากหลัง';
                    }

                    // ==========================================================
                    // 18. คำสั่งทั่วไป (ทักทาย, ขอบคุณ, ขอโทษ, ช่วยเหลือ, ลาก่อน)
                    // ==========================================================
                    else if (check('greeting')) {
                        const g = [
                            `สวัสดีครับ${conversationContext.userName ? ' คุณ' + conversationContext.userName : ''}! ยินดีที่ได้รู้จักครับ`,
                            `หวัดดีจ้า${conversationContext.userName ? ' ' + conversationContext.userName : ''}! พร้อมช่วยเหลือครับ`,
                            `Hello! มีอะไรให้ฉันช่วย?`
                        ];
                        reply = g[Math.floor(Math.random() * g.length)];
                    }
                    else if (check('thank')) {
                        const t = ['ด้วยความยินดีครับ!', 'ยินดีเสมอค่ะ 😊', 'ขอบคุณที่ใช้บริการครับ'];
                        reply = t[Math.floor(Math.random() * t.length)];
                    }
                    else if (check('sorry')) {
                        const s = ['ไม่เป็นไรครับ', 'ไม่ต้องขอโทษเลยค่ะ', 'โอเค รับทราบครับ'];
                        reply = s[Math.floor(Math.random() * s.length)];
                    }
                    else if (check('help')) {
                        reply = `📋 ฉันสามารถช่วยคุณได้ดังนี้:
• ปรับแต่งภาพ: เพิ่ม/ลด ความสว่าง, ความคมชัด, ความอิ่มสี, เบลอ
• ฟิลเตอร์: ขาวดำ, ซีเปีย, กลับสี, วินเทจ, โทนเย็น, โทนอุ่น
• หมุน/พลิก: กลับซ้ายขวา, กลับบนล่าง, หมุน 90°
• ลบพื้นหลัง: พิมพ์ "ลบพื้นหลัง"
• เปลี่ยนฉากหลัง: พิมพ์ "เปลี่ยนเป็น [ชื่อฉาก]"
• สร้างวิดีโอ: พิมพ์ "สร้างวิดีโอ" (ต้องเลือกรูปและเสียงก่อน)
• คำนวณ: พิมพ์สมการ เช่น 2+3*5
• ถามสภาพอากาศ: พิมพ์ "อากาศ"
• รีเซ็ต: พิมพ์ "รีเซ็ตปรับแต่ง" หรือ "รีเซ็ตทั้งหมด"
• บอกชื่อของคุณ: พิมพ์ "ฉันชื่อ [ชื่อ]"
ลองพิมพ์คำสั่งดูได้เลยครับ! 😊`;
                    }
                    else if (check('bye')) {
                        const b = [
                            `ลาก่อน${conversationContext.userName ? ' คุณ' + conversationContext.userName : ''}! กลับมาใหม่นะครับ`,
                            'บายบาย! ขอให้มีความสุข',
                            'แล้วพบกันใหม่ 👋'
                        ];
                        reply = b[Math.floor(Math.random() * b.length)];
                    }

                    // ==========================================================
                    // 19. ตอบแบบสุ่มทั่วไป (ถ้าไม่มีคำสั่งตรง)
                    // ==========================================================
                    else {
                        const general = [
                            `เข้าใจว่า "${userMessage}" น่าสนใจครับ`,
                            `ขอบคุณที่แชร์ "${userMessage}" นะครับ`,
                            `โอ้! "${userMessage}" เป็นอะไรที่น่าสนใจมาก`,
                            `คุณคิดว่าอะไรสำคัญเกี่ยวกับ "${userMessage}"?`,
                            `เห็นด้วยกับคุณเกี่ยวกับ "${userMessage}" ครับ`,
                            `ขอบคุณที่บอก "${userMessage}" ผมจะจดจำไว้`,
                            `เกี่ยวกับ "${userMessage}" คุณอยากให้ผมช่วยอะไรไหม?`
                        ];
                        reply = general[Math.floor(Math.random() * general.length)];
                        if (conversationContext.userName) {
                            reply = `${conversationContext.userName} ${reply}`;
                        }
                    }

                    // ==========================================================
                    // 20. บันทึกประวัติการสนทนา (สำหรับใช้ในอนาคต)
                    // ==========================================================
                    conversationContext.history.push({ role: 'user', content: userMessage });
                    conversationContext.history.push({ role: 'assistant', content: reply });
                    if (conversationContext.history.length > 20) {
                        conversationContext.history.splice(0, 2);
                    }

                    resolve(reply);
                }, delay);
            });
        }
    };

    console.log('✅ Commands (Advanced AI) loaded.');
})();