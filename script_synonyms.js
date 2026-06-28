// ================================================================
// script_synonyms.js — คำพ้องความหมายสำหรับคำสั่งเสียง/ข้อความ
// ใช้ร่วมกับ script_extra.js, script_commands.js, script_combined_integrated.js
// ================================================================

(function() {
    'use strict';
    window.SYNONYMS = {
        // ===== คำสั่งทั่วไป (เดิม) =====
        work: ['ทำงาน', 'เปิดลิงก์', 'open', 'start'],
        bg: ['เปลี่ยนพื้นหลัง', 'เปลี่ยนสี', 'change background', 'change color'],
        greeting: ['สวัสดี', 'hello', 'หวัดดี'],
        name: ['ชื่อ', 'name'],
        age: ['อายุ', 'age', 'เกิด'],
        time: ['เวลา', 'time', 'วันนี้'],
        sorry: ['ขอโทษ', 'sorry', 'ขออภัย'],
        thank: ['ขอบคุณ', 'thank'],
        help: ['ช่วย', 'help'],
        bye: ['ลาก่อน', 'bye', 'ไปล่ะ'],

        // ===== คำสั่งควบคุมภาพ (ปรับแต่ง) =====
        brightness_inc: ['เพิ่มความสว่าง', 'สว่างขึ้น', 'brightness up', 'เพิ่มความสว่างขึ้น'],
        brightness_dec: ['ลดความสว่าง', 'สว่างน้อยลง', 'brightness down', 'ลดความสว่างลง'],
        contrast_inc: ['เพิ่มความคมชัด', 'คมชัดขึ้น', 'contrast up', 'เพิ่มความคมชัดขึ้น'],
        contrast_dec: ['ลดความคมชัด', 'คมชัดน้อยลง', 'contrast down', 'ลดความคมชัดลง'],
        saturation_inc: ['เพิ่มความอิ่มสี', 'สีสดขึ้น', 'saturation up', 'เพิ่มความอิ่มตัว'],
        saturation_dec: ['ลดความอิ่มสี', 'สีจางลง', 'saturation down', 'ลดความอิ่มตัว'],
        blur_inc: ['เพิ่มเบลอ', 'เบลอขึ้น', 'blur up', 'เพิ่มความเบลอ'],
        blur_dec: ['ลดเบลอ', 'เบลอน้อยลง', 'blur down', 'ลดความเบลอ'],
        reset_adjust: ['รีเซ็ตปรับแต่ง', 'reset adjustment', 'reset all', 'รีเซ็ตการปรับแต่ง'],

        // ===== คำสั่งฟิลเตอร์ =====
        filter_grayscale: ['ขาวดำ', 'grayscale', 'เปลี่ยนเป็นขาวดำ'],
        filter_sepia: ['ซีเปีย', 'sepia', 'เปลี่ยนเป็นซีเปีย'],
        filter_invert: ['กลับสี', 'invert', 'สีกลับ'],
        filter_vintage: ['วินเทจ', 'vintage', 'โทนเก่า'],
        filter_cool: ['โทนเย็น', 'cool', 'เย็น'],
        filter_warm: ['โทนอุ่น', 'warm', 'อุ่น'],
        apply_filter: ['ใช้ฟิลเตอร์', 'apply filter', 'ใส่ฟิลเตอร์'],
        remove_filter: ['ลบฟิลเตอร์', 'remove filter', 'เอาฟิลเตอร์ออก'],

        // ===== คำสั่งหมุน/พลิก =====
        flip_h: ['กลับซ้ายขวา', 'กลับด้าน', 'flip horizontal', 'พลิกซ้ายขวา'],
        flip_v: ['กลับบนล่าง', 'flip vertical', 'พลิกบนล่าง'],
        rotate: ['หมุน', 'rotate', 'หมุน 90 องศา'],

        // ===== คำสั่งอื่นๆ =====
        remove_bg: ['ลบพื้นหลัง', 'remove background', 'ตัดพื้นหลัง'],

        // ===== คำสั่งเปลี่ยนฉากหลัง (Background) =====
        bg_forest: ['เรือนไทยโบราณ', 'ป่า', 'forest'],
        bg_ocean: ['ห้องสมุดพระเครื่อง', 'สมุด', 'ocean'],
        bg_mountain: ['อยุธยา', 'ภูเขา', 'mountain'],
        bg_city: ['เมืองกลางคืน', 'city', 'night'],
        bg_default: ['ลายตาราง', 'เริ่มต้น', 'default', 'ตาราง'],
        bg_app: ['เปลี่ยนพื้นหลังแอป', 'เปลี่ยนพื้นหลังหน้าเว็บ', 'change app background'],

        // ===== คำสั่ง Video Generator =====
        video_gen: ['สร้างวิดีโอ', 'ทำวิดีโอ', 'generate video', 'start video'],
        add_image: ['เพิ่มภาพ', 'เลือกรูป', 'เพิ่มรูป', 'add image', 'select image'],
        add_audio: ['เพิ่มเสียง', 'เลือกเสียง', 'add audio', 'select audio'],
        clear_image: ['ลบภาพ', 'clear image', 'remove image'],
        clear_audio: ['ลบเสียง', 'clear audio', 'remove audio'],

        // ===== เพิ่มเติม (เผื่ออนาคต) =====
        reset_all: ['รีเซ็ตทั้งหมด', 'reset everything', 'reset all'],
        show_menu: ['แสดงเมนู', 'show menu', 'เปิดเมนู'],
        hide_menu: ['ซ่อนเมนู', 'hide menu', 'ปิดเมนู']
    };

    console.log('✅ SYNONYMS loaded.');
})();