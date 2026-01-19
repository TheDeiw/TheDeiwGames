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
        // Швидка перевірка WebGL підтримки
        try {
            const canvas = document.createElement("canvas");
            const gl =
                canvas.getContext("webgl") || canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");

            if (!gl) {
                this.capabilities.hasGPU = false;
                return;
            }

            // Перевірка на software renderer
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
                if (renderer.includes("swiftshader") || renderer.includes("llvmpipe")) {
                    this.capabilities.hasGPU = false;
                }
            }
        } catch (e) {
            this.capabilities.hasGPU = false;
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

        // Мобільний пристрій без GPU або слабкий = низька продуктивність
        if (
            (this.capabilities.isMobile && !this.capabilities.hasGPU) ||
            (this.capabilities.isLowEndDevice && !this.capabilities.hasGPU)
        ) {
            this.capabilities.performanceTier = "low";
            this.capabilities.canUseBlur = false;
            this.capabilities.canUseComplexAnimations = false;
            return;
        }

        // Мобільний пристрій з GPU або слабкий пристрій з GPU = середня продуктивність
        if (this.capabilities.isMobile || this.capabilities.isLowEndDevice) {
            this.capabilities.performanceTier = "medium";
            this.capabilities.canUseBlur = true;
            this.capabilities.canUseComplexAnimations = false;
            return;
        }

        // Все інше = висока продуктивність
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
