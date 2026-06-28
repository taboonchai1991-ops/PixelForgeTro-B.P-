// ============================================================
// script.js - PixelForge เวอร์ชันมือถือ
// ปรับปรุง: UI Mobile, Touch, Web Worker, OffscreenCanvas, Cache
// รวมระบบ Cleanup และเชื่อมต่อกับ Extra (ถ้ามี)
// ============================================================
(function() {
    'use strict';

    // --- DOM References ---
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.getElementById('canvasWrapper');

    const brightnessSlider = document.getElementById('brightness');
    const contrastSlider = document.getElementById('contrast');
    const saturationSlider = document.getElementById('saturation');
    const blurSlider = document.getElementById('blur');

    const brightnessVal = document.getElementById('brightnessVal');
    const contrastVal = document.getElementById('contrastVal');
    const saturationVal = document.getElementById('saturationVal');
    const blurVal = document.getElementById('blurVal');

    const filterSelect = document.getElementById('filterSelect');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const removeFilterBtn = document.getElementById('removeFilterBtn');
    const flipHorizBtn = document.getElementById('flipHorizBtn');
    const flipVertBtn = document.getElementById('flipVertBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const resetAdjustBtn = document.getElementById('resetAdjustBtn');
    const resetAllBtn = document.getElementById('resetAllBtn');

    const uploadBtn = document.getElementById('uploadBtn');
    const exportBtn = document.getElementById('exportBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceIndicator = document.getElementById('voiceIndicator');
    const voiceHint = document.getElementById('voiceHint');

    const progressFill = document.getElementById('progressFill');
    const imageStatus = document.getElementById('imageStatus');
    const dimensionTag = document.getElementById('dimensionTag');

    const floatingZoom = document.getElementById('floatingZoom');
    const zoomValue = document.getElementById('zoomValue');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    const removeBgBtn = document.getElementById('removeBgBtn');

    // --- State ---
    let originalImageData = null;        // ภาพต้นฉบับ (ไม่ผ่านการปรับแต่ง)
    let currentImageData = null;         // ภาพปัจจุบัน (ใช้แสดงผล)
    let originalFile = null;

    let adjust = {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0
    };

    let currentFilter = 'none';
    let rotation = 0;
    let flipH = false;
    let flipV = false;
    let zoom = 1;
    let isProcessing = false;

    // สำหรับ Pan (เมื่อซูมเกิน)
    let panX = 0, panY = 0;
    let isDragging = false;
    let dragStartX, dragStartY, startPanX, startPanY;

    // Throttle
    let renderTimeout = null;
    let pendingRender = false;

    // --- Constants ---
    const MAX_IMAGE_SIZE = 1200;
    const WORKER_URL = createWorkerBlob();

    // ============================================================
    // 1. สร้าง Web Worker (Inline Blob)
    // ============================================================
    function createWorkerBlob() {
        const workerCode = `
            self.onmessage = function(e) {
                const { imageData, adjust, filter } = e.data;
                const data = new Uint8ClampedArray(imageData.data);
                const w = imageData.width, h = imageData.height;

                // --- ปรับ Brightness, Contrast, Saturation ---
                const brightness = adjust.brightness;
                const contrast = adjust.contrast;
                const saturation = adjust.saturation;
                const blur = adjust.blur;

                const contrastFactor = (contrast + 100) / 100;
                const satFactor = (saturation + 100) / 100;

                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i+1];
                    let b = data[i+2];

                    r = r + brightness * 2.55;
                    g = g + brightness * 2.55;
                    b = b + brightness * 2.55;

                    r = (r - 128) * contrastFactor + 128;
                    g = (g - 128) * contrastFactor + 128;
                    b = (b - 128) * contrastFactor + 128;

                    const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                    r = gray + (r - gray) * satFactor;
                    g = gray + (g - gray) * satFactor;
                    b = gray + (b - gray) * satFactor;

                    data[i] = Math.min(255, Math.max(0, r));
                    data[i+1] = Math.min(255, Math.max(0, g));
                    data[i+2] = Math.min(255, Math.max(0, b));
                }

                // --- Blur (ถ้ามี) ---
                if (blur > 0.5) {
                    const radius = Math.min(Math.round(blur), 10);
                    if (radius > 0) {
                        const copy = new Uint8ClampedArray(data);
                        for (let y = 0; y < h; y++) {
                            for (let x = 0; x < w; x++) {
                                let rSum = 0, gSum = 0, bSum = 0;
                                let count = 0;
                                for (let dy = -radius; dy <= radius; dy++) {
                                    for (let dx = -radius; dx <= radius; dx++) {
                                        const px = Math.min(w-1, Math.max(0, x + dx));
                                        const py = Math.min(h-1, Math.max(0, y + dy));
                                        const idx = (py * w + px) * 4;
                                        rSum += copy[idx];
                                        gSum += copy[idx+1];
                                        bSum += copy[idx+2];
                                        count++;
                                    }
                                }
                                const idx = (y * w + x) * 4;
                                data[idx] = rSum / count;
                                data[idx+1] = gSum / count;
                                data[idx+2] = bSum / count;
                            }
                        }
                    }
                }

                // --- ฟิลเตอร์ (ถ้ามี) ---
                if (filter !== 'none') {
                    if (filter === 'grayscale') {
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = 0.2989 * data[i] + 0.5870 * data[i+1] + 0.1140 * data[i+2];
                            data[i] = data[i+1] = data[i+2] = Math.min(255, Math.max(0, gray));
                        }
                    } else if (filter === 'sepia') {
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i], g = data[i+1], b = data[i+2];
                            data[i] = Math.min(255, Math.max(0, r * 0.393 + g * 0.769 + b * 0.189));
                            data[i+1] = Math.min(255, Math.max(0, r * 0.349 + g * 0.686 + b * 0.168));
                            data[i+2] = Math.min(255, Math.max(0, r * 0.272 + g * 0.534 + b * 0.131));
                        }
                    } else if (filter === 'invert') {
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = 255 - data[i];
                            data[i+1] = 255 - data[i+1];
                            data[i+2] = 255 - data[i+2];
                        }
                    } else if (filter === 'vintage') {
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, data[i] * 1.2);
                            data[i+1] = Math.min(255, data[i+1] * 0.9);
                            data[i+2] = Math.min(255, data[i+2] * 0.7);
                        }
                    } else if (filter === 'cool') {
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, data[i] * 0.8);
                            data[i+1] = Math.min(255, data[i+1] * 0.9);
                            data[i+2] = Math.min(255, data[i+2] * 1.3);
                        }
                    } else if (filter === 'warm') {
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, data[i] * 1.3);
                            data[i+1] = Math.min(255, data[i+1] * 1.1);
                            data[i+2] = Math.min(255, data[i+2] * 0.8);
                        }
                    }
                }

                const result = new ImageData(data, w, h);
                self.postMessage({ result: result }, [result.data.buffer]);
            };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return URL.createObjectURL(blob);
    }

    let worker = null;

    function getWorker() {
        if (!worker) {
            worker = new Worker(WORKER_URL);
            worker.onmessage = function(e) {
                const result = e.data.result;
                if (result) {
                    const transformed = applyTransformations(result, rotation, flipH, flipV);
                    if (canvas.width !== transformed.width || canvas.height !== transformed.height) {
                        canvas.width = transformed.width;
                        canvas.height = transformed.height;
                    }
                    ctx.putImageData(transformed, 0, 0);
                    currentImageData = transformed;
                    isProcessing = false;
                    progressFill.style.width = '100%';
                    setTimeout(() => { progressFill.style.width = '0%'; }, 200);
                    updateStatus('✅ แสดงผล', transformed.width, transformed.height);
                    updateCanvasTransform();
                    if (pendingRender) {
                        pendingRender = false;
                        renderFull();
                    }
                }
            };
            worker.onerror = function(err) {
                console.error('Worker error:', err);
                isProcessing = false;
                progressFill.style.width = '0%';
                alert('เกิดข้อผิดพลาดใน Worker');
            };
        }
        return worker;
    }

    // ============================================================
    // 2. ฟังก์ชันหลัก - Render Pipeline
    // ============================================================
    function renderFull() {
        if (!originalImageData) return;
        if (isProcessing) {
            pendingRender = true;
            return;
        }

        if (renderTimeout) {
            cancelAnimationFrame(renderTimeout);
            renderTimeout = null;
        }

        renderTimeout = requestAnimationFrame(() => {
            isProcessing = true;
            progressFill.style.width = '30%';

            const worker = getWorker();
            const baseData = new Uint8ClampedArray(originalImageData.data);
            const srcData = new ImageData(baseData, originalImageData.width, originalImageData.height);

            worker.postMessage({
                imageData: srcData,
                adjust: adjust,
                filter: currentFilter
            }, [srcData.data.buffer]);
        });
    }

    function applyTransformations(imageData, rot, flipHFlag, flipVFlag) {
        const w = imageData.width;
        const h = imageData.height;
        const data = new Uint8ClampedArray(imageData.data);
        const output = new Uint8ClampedArray(data.length);

        let outW = w, outH = h;
        if (rot % 2 === 1) {
            outW = h;
            outH = w;
        }

        const temp = new Uint8ClampedArray(data);

        function getSrcIndex(destX, destY) {
            let srcX = destX, srcY = destY;
            if (rot === 1) {
                srcX = destY;
                srcY = outW - 1 - destX;
            } else if (rot === 2) {
                srcX = outW - 1 - destX;
                srcY = outH - 1 - destY;
            } else if (rot === 3) {
                srcX = outH - 1 - destY;
                srcY = destX;
            }
            if (flipHFlag) {
                srcX = (rot % 2 === 0) ? w - 1 - srcX : h - 1 - srcX;
            }
            if (flipVFlag) {
                srcY = (rot % 2 === 0) ? h - 1 - srcY : w - 1 - srcY;
            }
            srcX = Math.min(w-1, Math.max(0, Math.round(srcX)));
            srcY = Math.min(h-1, Math.max(0, Math.round(srcY)));
            return (srcY * w + srcX) * 4;
        }

        for (let y = 0; y < outH; y++) {
            for (let x = 0; x < outW; x++) {
                const srcIdx = getSrcIndex(x, y);
                const dstIdx = (y * outW + x) * 4;
                output[dstIdx] = temp[srcIdx];
                output[dstIdx+1] = temp[srcIdx+1];
                output[dstIdx+2] = temp[srcIdx+2];
                output[dstIdx+3] = temp[srcIdx+3];
            }
        }
        return new ImageData(output, outW, outH);
    }

    // ============================================================
    // 3. การจัดการ Canvas Transform (Zoom + Pan)
    // ============================================================
    function updateCanvasTransform() {
        const container = wrapper;
        const rect = container.getBoundingClientRect();
        const containerW = rect.width - 4;
        const containerH = rect.height - 4;

        const cw = canvas.width;
        const ch = canvas.height;
        if (cw === 0 || ch === 0) return;

        const scaleX = containerW / cw;
        const scaleY = containerH / ch;
        const fitScale = Math.min(scaleX, scaleY, 1);
        const finalScale = fitScale * zoom;

        canvas.style.width = (cw * finalScale) + 'px';
        canvas.style.height = (ch * finalScale) + 'px';
        canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${finalScale/fitScale})`;
        canvas.style.transformOrigin = 'center center';
        zoomValue.textContent = Math.round(zoom * 100) + '%';
        floatingZoom.classList.remove('hidden');
    }

    // ============================================================
    // 4. เหตุการณ์ Touch (Pinch + Pan)
    // ============================================================
    let lastPinchDist = 0;
    let initialZoom = 1;
    let initialPanX = 0, initialPanY = 0;

    canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            const t1 = e.touches[0], t2 = e.touches[1];
            const dx = t1.clientX - t2.clientX;
            const dy = t1.clientY - t2.clientY;
            lastPinchDist = Math.hypot(dx, dy);
            initialZoom = zoom;
            initialPanX = panX;
            initialPanY = panY;
            e.preventDefault();
        } else if (e.touches.length === 1) {
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            startPanX = panX;
            startPanY = panY;
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            const t1 = e.touches[0], t2 = e.touches[1];
            const dx = t1.clientX - t2.clientX;
            const dy = t1.clientY - t2.clientY;
            const dist = Math.hypot(dx, dy);
            const delta = dist / lastPinchDist;
            zoom = Math.min(3, Math.max(0.2, initialZoom * delta));
            panX = initialPanX;
            panY = initialPanY;
            updateCanvasTransform();
            e.preventDefault();
        } else if (e.touches.length === 1 && isDragging) {
            const dx = e.touches[0].clientX - dragStartX;
            const dy = e.touches[0].clientY - dragStartY;
            panX = startPanX + dx;
            panY = startPanY + dy;
            updateCanvasTransform();
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchend', function(e) {
        isDragging = false;
    });

    // ============================================================
    // 5. ฟังก์ชันอัปโหลดภาพ (ปรับขนาดอัตโนมัติ)
    // ============================================================
    function loadImageFromFile(file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            const img = new Image();
            img.onload = function() {
                let w = img.width, h = img.height;
                if (w > MAX_IMAGE_SIZE || h > MAX_IMAGE_SIZE) {
                    const ratio = Math.min(MAX_IMAGE_SIZE / w, MAX_IMAGE_SIZE / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }
                canvas.width = w;
                canvas.height = h;
                ctx.clearRect(0, 0, w, h);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);

                originalImageData = ctx.getImageData(0, 0, w, h);
                currentImageData = originalImageData;
                originalFile = file;

                resetAllSliders();
                currentFilter = 'none';
                filterSelect.value = 'none';
                flipH = false; flipV = false; rotation = 0;
                panX = 0; panY = 0; zoom = 1;
                updateStatus('📸 ' + file.name, w, h);
                renderFull();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ============================================================
    // 6. ลบพื้นหลัง (ปรับขนาดก่อนส่งเข้าโมเดล)
    // ============================================================
    removeBgBtn.addEventListener('click', async function() {
        if (!originalImageData) {
            alert('กรุณาโหลดภาพก่อน');
            return;
        }
        this.disabled = true;
        this.textContent = '⏳ กำลังโหลดโมเดล...';
        progressFill.style.width = '0%';

        try {
            const tempCanvas = document.createElement('canvas');
            const maxSize = 800;
            let w = originalImageData.width, h = originalImageData.height;
            if (w > maxSize || h > maxSize) {
                const ratio = Math.min(maxSize/w, maxSize/h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }
            tempCanvas.width = w;
            tempCanvas.height = h;
            const tempCtx = tempCanvas.getContext('2d');
            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = originalImageData.width;
            srcCanvas.height = originalImageData.height;
            const srcCtx = srcCanvas.getContext('2d');
            srcCtx.putImageData(originalImageData, 0, 0);
            tempCtx.drawImage(srcCanvas, 0, 0, w, h);
            const resizedData = tempCtx.getImageData(0, 0, w, h);

            const module = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal/+esm');
            const removeFn = module.removeBackground;

            const blob = await new Promise(res => tempCanvas.toBlob(res, 'image/png'));

            const resultBlob = await removeFn(blob, {
                cache: true,
                model: 'large',
                output: { format: 'image/png' },
                progress: (p) => {
                    const percent = Math.min(100, p * 100);
                    progressFill.style.width = percent + '%';
                }
            });

            const img = new Image();
            const url = URL.createObjectURL(resultBlob);
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            });

            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = originalImageData.width;
            finalCanvas.height = originalImageData.height;
            const finalCtx = finalCanvas.getContext('2d');
            finalCtx.drawImage(img, 0, 0, finalCanvas.width, finalCanvas.height);
            let resultData = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);

            resultData = refineEdges(resultData, 2);

            originalImageData = resultData;
            canvas.width = resultData.width;
            canvas.height = resultData.height;
            resetAllSliders();
            currentFilter = 'none';
            filterSelect.value = 'none';
            flipH = false; flipV = false; rotation = 0;
            panX = 0; panY = 0; zoom = 1;
            updateStatus('✨ ลบพื้นหลังแล้ว', resultData.width, resultData.height);
            renderFull();
            progressFill.style.width = '100%';
            setTimeout(() => progressFill.style.width = '0%', 500);
            this.textContent = '✨ ลบพื้นหลัง';
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
            progressFill.style.width = '0%';
            this.textContent = '✨ ลบพื้นหลัง';
        } finally {
            this.disabled = false;
        }
    });

    function refineEdges(imageData, radius = 2) {
        const data = imageData.data;
        const w = imageData.width, h = imageData.height;
        const total = w * h;
        const alpha = new Float32Array(total);
        for (let i = 0; i < total; i++) alpha[i] = data[i*4+3] / 255;

        const size = Math.ceil(radius * 3);
        const kernel = [];
        let sum = 0;
        for (let i = -size; i <= size; i++) {
            const v = Math.exp(-(i*i)/(2*radius*radius));
            kernel.push(v);
            sum += v;
        }
        for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;

        const temp = new Float32Array(total);
        const half = size;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let val = 0;
                const row = y * w;
                for (let k = 0; k < kernel.length; k++) {
                    const kx = Math.min(w-1, Math.max(0, x + (k-half)));
                    val += alpha[row + kx] * kernel[k];
                }
                temp[row + x] = val;
            }
        }
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let val = 0;
                for (let k = 0; k < kernel.length; k++) {
                    const ky = Math.min(h-1, Math.max(0, y + (k-half)));
                    val += temp[ky * w + x] * kernel[k];
                }
                const idx = (y * w + x) * 4;
                const orig = alpha[y * w + x];
                if (orig > 0.05 && orig < 0.95) {
                    data[idx+3] = Math.round(Math.min(1, Math.max(0, val)) * 255);
                }
            }
        }
        return imageData;
    }

    // ============================================================
    // 7. ฟังก์ชันอื่น ๆ (รีเซ็ต, อัปเดตสถานะ, ฯลฯ)
    // ============================================================
    function updateStatus(text, w, h) {
        imageStatus.innerHTML = `<span>●</span> ${text}`;
        if (w && h) {
            dimensionTag.textContent = `📐 ${w} × ${h}`;
        } else {
            dimensionTag.textContent = '📐 0 × 0';
        }
    }

    function resetAllSliders() {
        brightnessSlider.value = 0; contrastSlider.value = 0;
        saturationSlider.value = 0; blurSlider.value = 0;
        brightnessVal.textContent = '0'; contrastVal.textContent = '0';
        saturationVal.textContent = '0'; blurVal.textContent = '0';
        adjust.brightness = 0; adjust.contrast = 0;
        adjust.saturation = 0; adjust.blur = 0;
        currentFilter = 'none'; filterSelect.value = 'none';
        rotation = 0; flipH = false; flipV = false;
        zoom = 1; panX = 0; panY = 0;
        updateCanvasTransform();
    }

    // ============================================================
    // 8. Event Listeners
    // ============================================================
    function onSliderChange() {
        if (renderTimeout) {
            cancelAnimationFrame(renderTimeout);
            renderTimeout = null;
        }
        renderTimeout = requestAnimationFrame(() => {
            renderFull();
        });
    }

    brightnessSlider.addEventListener('input', function() {
        adjust.brightness = parseInt(this.value);
        brightnessVal.textContent = adjust.brightness;
        onSliderChange();
    });
    contrastSlider.addEventListener('input', function() {
        adjust.contrast = parseInt(this.value);
        contrastVal.textContent = adjust.contrast;
        onSliderChange();
    });
    saturationSlider.addEventListener('input', function() {
        adjust.saturation = parseInt(this.value);
        saturationVal.textContent = adjust.saturation;
        onSliderChange();
    });
    blurSlider.addEventListener('input', function() {
        adjust.blur = parseFloat(this.value);
        blurVal.textContent = adjust.blur;
        onSliderChange();
    });

    applyFilterBtn.addEventListener('click', function() {
        currentFilter = filterSelect.value;
        renderFull();
    });
    removeFilterBtn.addEventListener('click', function() {
        currentFilter = 'none';
        filterSelect.value = 'none';
        renderFull();
    });

    flipHorizBtn.addEventListener('click', function() {
        flipH = !flipH;
        renderFull();
    });
    flipVertBtn.addEventListener('click', function() {
        flipV = !flipV;
        renderFull();
    });
    rotateBtn.addEventListener('click', function() {
        rotation = (rotation + 1) % 4;
        renderFull();
    });

    resetAdjustBtn.addEventListener('click', function() {
        brightnessSlider.value = 0; contrastSlider.value = 0;
        saturationSlider.value = 0; blurSlider.value = 0;
        brightnessVal.textContent = '0'; contrastVal.textContent = '0';
        saturationVal.textContent = '0'; blurVal.textContent = '0';
        adjust.brightness = 0; adjust.contrast = 0;
        adjust.saturation = 0; adjust.blur = 0;
        renderFull();
    });

    resetAllBtn.addEventListener('click', function() {
        resetAllSliders();
        if (originalImageData) {
            renderFull();
        } else {
            loadDefaultImage();
        }
    });

    uploadBtn.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            if (e.target.files[0]) {
                loadImageFromFile(e.target.files[0]);
            }
        };
        input.click();
    });

    exportBtn.addEventListener('click', function() {
        if (!originalImageData) return;
        const link = document.createElement('a');
        link.download = 'pixelforge-edit.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    wrapper.addEventListener('dragover', function(e) {
        e.preventDefault();
        wrapper.classList.add('drag-over');
    });
    wrapper.addEventListener('dragleave', function(e) {
        e.preventDefault();
        wrapper.classList.remove('drag-over');
    });
    wrapper.addEventListener('drop', function(e) {
        e.preventDefault();
        wrapper.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            loadImageFromFile(files[0]);
        }
    });

    zoomInBtn.addEventListener('click', function() {
        zoom = Math.min(zoom + 0.1, 3);
        updateCanvasTransform();
    });
    zoomOutBtn.addEventListener('click', function() {
        zoom = Math.max(zoom - 0.1, 0.2);
        updateCanvasTransform();
    });
    zoomResetBtn.addEventListener('click', function() {
        zoom = 1;
        panX = 0; panY = 0;
        updateCanvasTransform();
    });

    // ============================================================
    // 9. โหลดภาพเริ่มต้น
    // ============================================================
    function loadDefaultImage() {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="500"%3E%3Crect width="800" height="500" fill="%23ffffff"/%3E%3Ctext x="400" y="240" font-family="Inter, sans-serif" font-size="36" fill="%23333" text-anchor="middle"%3E📸 วางภาพที่นี่%3C/text%3E%3Ctext x="400" y="290" font-family="Inter, sans-serif" font-size="18" fill="%23666" text-anchor="middle"%3Eหรืออัปโหลดไฟล์%3C/text%3E%3C/svg%3E';
        img.onload = function() {
            canvas.width = 800; canvas.height = 500;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 800, 500);
            ctx.drawImage(img, 0, 0, 800, 500);
            originalImageData = ctx.getImageData(0, 0, 800, 500);
            currentImageData = originalImageData;
            originalFile = null;
            resetAllSliders();
            updateStatus('🖼️ ภาพตัวอย่าง', 800, 500);
            renderFull();
        };
        img.onerror = function() {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 800, 500);
            ctx.fillStyle = '#333';
            ctx.font = '24px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ โหลดตัวอย่างไม่สำเร็จ', 400, 250);
        };
    }

    // ============================================================
    // 10. ฟังก์ชัน Cleanup (เชื่อมต่อกับ Extra ถ้ามี)
    // ============================================================
    function cleanupResources() {
        console.log('[PixelForge] Cleaning up resources...');

        // หยุด Web Worker
        if (worker) {
            try {
                worker.terminate();
                worker = null;
            } catch (e) {}
        }

        // ยกเลิก animation frame
        if (renderTimeout) {
            cancelAnimationFrame(renderTimeout);
            renderTimeout = null;
        }

        // ล้าง blob URL ของ Worker
        if (WORKER_URL) {
            try {
                URL.revokeObjectURL(WORKER_URL);
            } catch (e) {}
        }

        // เรียก Extra.cleanupGarbage() ถ้ามี
        if (window.Extra && typeof window.Extra.cleanupGarbage === 'function') {
            window.Extra.cleanupGarbage();
        }

        // ลบ ImageData ขนาดใหญ่
        originalImageData = null;
        currentImageData = null;
        originalFile = null;

        // ล้างแคชภาพใน DOM (ถ้ามี)
        const imgs = document.querySelectorAll('img');
        imgs.forEach(img => {
            if (img.src && img.src.startsWith('blob:')) {
                URL.revokeObjectURL(img.src);
            }
        });

        console.log('[PixelForge] Cleanup complete.');
    }

    // เรียก cleanup เมื่อปิดหน้า
    window.addEventListener('beforeunload', cleanupResources);

    // ============================================================
    // 11. เริ่มต้น
    // ============================================================
    loadDefaultImage();
    updateCanvasTransform();

    const resizeObserver = new ResizeObserver(() => {
        updateCanvasTransform();
    });
    resizeObserver.observe(wrapper);

    window.addEventListener('resize', function() {
        updateCanvasTransform();
    });

    console.log('🚀 PixelForge Mobile Ready (with cleanup integration)');
})();