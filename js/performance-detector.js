/**
 * Performance Detector
 * Визначає можливості пристрою для оптимізації візуальних ефектів
 * Виконує швидкі перевірки тільки при завантаженні
 */

class PerformanceDetector {
    constructor() {
        this.capabilities = {
            isMobile: false,
            isLowEndDevice: false,
            prefersReducedMotion: false,
            hasGPU: true,
            performanceTier: "high", // 'low', 'medium', 'high'
            canUseBlur: true,
            canUseComplexAnimations: true,
        };

        this.metrics = {
            deviceMemory: navigator.deviceMemory || 4,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
        };

        this.init();
    }

    init() {
        this.detectMobile();
        this.detectReducedMotion();
        this.detectGPU();
        this.detectDeviceMemory();
        this.calculatePerformanceTier();
    }

    detectMobile() {
        // Перевірка на мобільний пристрій
        const mobileMediaQuery = window.matchMedia("(max-width: 767.98px)");
        const touchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        this.capabilities.isMobile = mobileMediaQuery.matches || (touchDevice && userAgent);
    }

    detectReducedMotion() {
        // Перевірка налаштувань доступності
        const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        this.capabilities.prefersReducedMotion = reducedMotionQuery.matches;
    }

    detectGPU() {
        // Розширена перевірка апаратного прискорення
        try {
            const canvas = document.createElement("canvas");
            const gl =
                canvas.getContext("webgl") || canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");

            if (!gl) {
                this.capabilities.hasGPU = false;
                console.warn("WebGL not supported - GPU acceleration disabled");
                return;
            }

            // Отримання інформації про renderer
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL).toLowerCase();
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

                // Перевірка на software renderers (вказують на відключене апаратне прискорення)
                const softwareRenderers = [
                    "swiftshader",
                    "llvmpipe",
                    "softpipe",
                    "microsoft basic render driver",
                    "gdi generic",
                    "google swiftshader",
                    "software",
                ];

                const isSoftwareRenderer = softwareRenderers.some((sr) => renderer.includes(sr) || vendor.includes(sr));

                if (isSoftwareRenderer) {
                    this.capabilities.hasGPU = false;
                    console.warn(
                        "Software renderer detected - GPU acceleration disabled:",
                        `Vendor: ${vendor}, Renderer: ${renderer}`,
                    );
                    return;
                }

                console.log("GPU detected:", `Vendor: ${vendor}, Renderer: ${renderer}`);
            }

            // Додаткова перевірка через параметри WebGL
            const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            if (maxTextureSize < 2048) {
                // Занадто малий розмір текстури може вказувати на software rendering
                this.capabilities.hasGPU = false;
                console.warn("Low MAX_TEXTURE_SIZE - possible software rendering");
                return;
            }

            // Все ОК - апаратне прискорення працює
            this.capabilities.hasGPU = true;
        } catch (e) {
            this.capabilities.hasGPU = false;
            console.warn("GPU detection failed:", e);
        }
    }

    detectDeviceMemory() {
        // Device Memory API (Chrome/Edge)
        if ("deviceMemory" in navigator) {
            this.metrics.deviceMemory = navigator.deviceMemory;

            // Менше 4GB RAM - слабкий пристрій
            if (this.metrics.deviceMemory < 4) {
                this.capabilities.isLowEndDevice = true;
            }
        }

        // Hardware Concurrency (кількість ядер)
        if ("hardwareConcurrency" in navigator) {
            this.metrics.hardwareConcurrency = navigator.hardwareConcurrency;

            // Менше 4 ядер - потенційно слабкий пристрій
            if (this.metrics.hardwareConcurrency < 4) {
                this.capabilities.isLowEndDevice = true;
            }
        }
    }

    calculatePerformanceTier() {
        // Проста логіка визначення продуктивності на основі зібраних даних

        // Користувач вимкнув анімації = завжди низька продуктивність
        if (this.capabilities.prefersReducedMotion) {
            this.capabilities.performanceTier = "low";
            this.capabilities.canUseBlur = false;
            this.capabilities.canUseComplexAnimations = false;
            return;
        }

        // Відсутність GPU = завжди низька продуктивність
        if (!this.capabilities.hasGPU) {
            this.capabilities.performanceTier = "low";
            this.capabilities.canUseBlur = false;
            this.capabilities.canUseComplexAnimations = false;
            return;
        }

        // Слабкий пристрій = низька продуктивність
        if (this.capabilities.isLowEndDevice) {
            this.capabilities.performanceTier = "low";
            this.capabilities.canUseBlur = false;
            this.capabilities.canUseComplexAnimations = false;
            return;
        }

        // Мобільний пристрій з GPU = середня продуктивність
        if (this.capabilities.isMobile) {
            this.capabilities.performanceTier = "medium";
            this.capabilities.canUseBlur = true;
            this.capabilities.canUseComplexAnimations = false;
            return;
        }

        // Все інше (десктоп з GPU і достатніми ресурсами) = висока продуктивність
        this.capabilities.performanceTier = "high";
        this.capabilities.canUseBlur = true;
        this.capabilities.canUseComplexAnimations = true;

        console.log("Performance Tier:", this.capabilities.performanceTier, this.metrics);
    }
}

// Створюємо глобальний екземпляр
const DeviceCapability = new PerformanceDetector();

// Експорт для модульних систем
if (typeof module !== "undefined" && module.exports) {
    module.exports = { PerformanceDetector, DeviceCapability };
}
