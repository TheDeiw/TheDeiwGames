/**
 * Canvas Background Animations
 * Модуль для створення анімованих геометричних фігур на фоні секцій
 */

class CanvasBackground {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.shapes = [];
        this.animationId = null;
        this.isVisible = true;
        this.isPaused = false;

        // Налаштування
        this.options = {
            shapeCount: options.shapeCount || 20,
            shapeType: options.shapeType || "triangles",
            colors: options.colors || ["#1a1a28", "#2a2a5d", "#3f3f77"],
            speed: options.speed || 0.5,
            rotationSpeed: options.rotationSpeed || 0.002,
            minSize: options.minSize || 30,
            maxSize: options.maxSize || 80,
            opacity: options.opacity || 0.6,
            performanceTier: options.performanceTier || "high", // 'low', 'medium', 'high'
        };

        // Перевірка можливостей пристрою
        this.isMobile = window.matchMedia("(max-width: 767.98px)").matches;
        this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Оптимізація на основі рівня продуктивності
        this.applyPerformanceOptimizations();

        this.init();
    }

    applyPerformanceOptimizations() {
        // Застосовуємо оптимізації на основі рівня продуктивності
        const tier = this.options.performanceTier;

        // Check for landscape orientation with limited height
        const isLandscapeLimited = window.matchMedia("(orientation: landscape) and (max-height: 700px)").matches;

        if (tier === "low") {
            // Низька продуктивність: мінімальні ефекти
            this.options.shapeCount = Math.floor(this.options.shapeCount * 0.2); // 80% зменшення
            this.options.speed *= 0.5;
            this.options.rotationSpeed *= 0.5;
            this.options.opacity *= 0.5;
            // Використовуємо тільки прості фігури
            if (this.options.shapeType === "mixed") {
                this.options.shapeType = "triangles";
            }
        } else if (tier === "medium") {
            // Середня продуктивність: помірні ефекти
            this.options.shapeCount = Math.floor(this.options.shapeCount * 0.5); // 50% зменшення
            this.options.speed *= 0.75;
            this.options.rotationSpeed *= 0.75;
            // Обмежуємо типи фігур
            if (this.options.shapeType === "mixed") {
                this.options.shapeType = "cubes"; // Простіші 3D фігури
            }
        }

        // Мобільні пристрої: додаткове зменшення
        if (this.isMobile) {
            this.options.shapeCount = Math.floor(this.options.shapeCount * 0.5);
        }

        // Landscape mode with limited height: reduce particles further
        if (isLandscapeLimited) {
            this.options.shapeCount = Math.floor(this.options.shapeCount * 0.7);
            this.options.opacity *= 0.8; // Make slightly more transparent
        }

        // Мінімум фігур - хоча б 2
        this.options.shapeCount = Math.max(2, this.options.shapeCount);
    }

    init() {
        this.resize();
        window.addEventListener("resize", () => this.resize());

        // Якщо користувач вимкнув анімації - показуємо статичний фон
        if (this.prefersReducedMotion) {
            this.createStaticBackground();
            return;
        }

        this.createShapes();
        this.animate();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        // Пересоздаємо фігури при зміні розміру
        if (!this.prefersReducedMotion && this.shapes.length > 0) {
            this.createShapes();
        }
    }

    createStaticBackground() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Малюємо кілька статичних фігур
        const staticCount = 5;
        for (let i = 0; i < staticCount; i++) {
            const x = (this.canvas.width / (staticCount + 1)) * (i + 1);
            const y = this.canvas.height / 2;
            const size = this.options.maxSize;
            const color = this.options.colors[i % this.options.colors.length];

            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = this.options.opacity * 0.3;

            this.drawShape(x, y, size, 0, color);
        }

        this.ctx.globalAlpha = 1;
    }

    createShapes() {
        this.shapes = [];
        const shapeTypes = ["triangles", "hexagons", "cubes", "circles", "pyramids"];

        // Sort of depth layers
        for (let i = 0; i < this.options.shapeCount; i++) {
            // Depth factor: 0.1 (far) to 1.0 (close)
            const depth = Math.random() * 0.9 + 0.1;

            // Size scaled by depth (closer = bigger)
            // Increased max range as requested
            const baseSize = this.options.minSize + Math.random() * (this.options.maxSize - this.options.minSize);
            const size = baseSize * (0.5 + 1.5 * depth);

            // Speed scaled by depth (parallax effect)
            const speedMultiplier = depth;

            // Blur scales with distance (far = blurry, close = sharp)
            // We'll limit max blur to avoid performance hit
            // REMOVED BLUR FOR OPTIMIZATION
            // const blur = (1 - depth) * 4;

            const shape = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: depth, // store depth for sorting/logic
                size: size,
                speedX: (Math.random() - 0.5) * this.options.speed * speedMultiplier,
                speedY: (Math.random() - 0.5) * this.options.speed * speedMultiplier,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * this.options.rotationSpeed,
                color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
                opacity: (0.1 + Math.random() * 0.4) * depth, // Far objects are more transparent
                // blur: blur // Optimization: Removed
            };

            if (this.options.shapeType === "mixed") {
                shape.type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            }

            this.shapes.push(shape);
        }

        // Sort by depth so we draw far items first (painter's algorithm)
        this.shapes.sort((a, b) => a.z - b.z);
    }

    drawShape(x, y, size, rotation, color, type) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);

        const currentType = type || this.options.shapeType;

        switch (currentType) {
            case "triangles":
            case "pyramids":
                this.draw3DPyramid(size, color);
                break;
            case "hexagons":
                this.draw3DHexagon(size, color);
                break;
            case "cubes":
                this.drawCube(size, color); // Passed color to reuse brightness logic
                break;
            case "rectangles":
                this.draw3DRectangle(size, color);
                break;
            case "circles":
                this.draw3DSphere(size, color);
                break;
            default:
                this.draw3DPyramid(size, color);
        }

        this.ctx.restore();
    }

    // --- 3D Drawing Methods ---

    draw3DPyramid(size, color) {
        // Pyramid (Tetrahedron-ish)
        const h = size * 0.866; // height of equilateral triangle

        // Base color
        this.ctx.fillStyle = color;

        // Front Face
        this.ctx.beginPath();
        this.ctx.moveTo(0, -h / 2);
        this.ctx.lineTo(size / 2, h / 2);
        this.ctx.lineTo(-size / 2, h / 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Side Face (Simulated 3D with darker shade)
        this.ctx.fillStyle = this.adjustBrightness(color, 0.7);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -h / 2);
        this.ctx.lineTo(size / 2, h / 2);
        this.ctx.lineTo(0, h / 2); // Draw half-triangle overlay
        this.ctx.closePath();
        this.ctx.fill();
    }

    draw3DHexagon(size, color) {
        const sides = 6;

        // Main Face
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI / 3) * i;
            const x = (size / 2) * Math.cos(angle);
            const y = (size / 2) * Math.sin(angle);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // 3D Rim (darker)
        this.ctx.strokeStyle = this.adjustBrightness(color, 0.6);
        this.ctx.lineWidth = size * 0.05;
        this.ctx.stroke();

        // Inner highlight
        this.ctx.fillStyle = this.adjustBrightness(color, 1.2);
        this.ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI / 3) * i;
            const x = size * 0.3 * Math.cos(angle);
            const y = size * 0.3 * Math.sin(angle);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    // drawCube is kept from original but needs 'color' param support if not passing via this.ctx.fillStyle
    // The new drawShape calls drawCube(size, color)
    drawCube(size, color) {
        // Use color passed or fallback to shape logic if handled outside (but here we passed it)
        const baseColor = color || this.ctx.fillStyle;

        // Isometric Cube
        const h = size * 0.6;

        // Top Face (Brightest)
        this.ctx.fillStyle = this.adjustBrightness(baseColor, 1.3);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -h / 2);
        this.ctx.lineTo(size / 2, -h / 4);
        this.ctx.lineTo(0, 0);
        this.ctx.lineTo(-size / 2, -h / 4);
        this.ctx.closePath();
        this.ctx.fill();

        // Left Face (Darkest)
        this.ctx.fillStyle = this.adjustBrightness(baseColor, 0.7);
        this.ctx.beginPath();
        this.ctx.moveTo(-size / 2, -h / 4);
        this.ctx.lineTo(0, 0);
        this.ctx.lineTo(0, h / 2);
        this.ctx.lineTo(-size / 2, h / 4);
        this.ctx.closePath();
        this.ctx.fill();

        // Right Face (Medium)
        this.ctx.fillStyle = this.adjustBrightness(baseColor, 0.9);
        this.ctx.beginPath();
        this.ctx.moveTo(size / 2, -h / 4);
        this.ctx.lineTo(0, 0);
        this.ctx.lineTo(0, h / 2);
        this.ctx.lineTo(size / 2, h / 4);
        this.ctx.closePath();
        this.ctx.fill();
    }

    draw3DRectangle(size, color) {
        // 3D Box look
        const w = size;
        const h = size;
        const depth = size * 0.2;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(-w / 2, -h / 2, w, h);

        // Right side
        this.ctx.fillStyle = this.adjustBrightness(color, 0.7);
        this.ctx.beginPath();
        this.ctx.moveTo(w / 2, -h / 2);
        this.ctx.lineTo(w / 2 + depth, -h / 2 + depth);
        this.ctx.lineTo(w / 2 + depth, h / 2 + depth);
        this.ctx.lineTo(w / 2, h / 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Bottom side
        this.ctx.fillStyle = this.adjustBrightness(color, 0.5);
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2, h / 2);
        this.ctx.lineTo(w / 2, h / 2);
        this.ctx.lineTo(w / 2 + depth, h / 2 + depth);
        this.ctx.lineTo(-w / 2 + depth, h / 2 + depth);
        this.ctx.closePath();
        this.ctx.fill();
    }

    draw3DSphere(size, color) {
        // Radial Gradient for sphere look
        const gradient = this.ctx.createRadialGradient(
            -size * 0.2,
            -size * 0.2,
            size * 0.1, // Offset highlight
            0,
            0,
            size / 2,
        );

        gradient.addColorStop(0, this.adjustBrightness(color, 1.5)); // Highight
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(1, this.adjustBrightness(color, 0.4)); // Shadow

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    adjustBrightness(color, factor) {
        // Допоміжна функція для зміни яскравості кольору
        if (color.startsWith("#")) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);

            const newR = Math.min(255, Math.floor(r * factor));
            const newG = Math.min(255, Math.floor(g * factor));
            const newB = Math.min(255, Math.floor(b * factor));

            return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB
                .toString(16)
                .padStart(2, "0")}`;
        }
        return color;
    }

    update() {
        if (this.isPaused || this.prefersReducedMotion) return;

        this.shapes.forEach((shape) => {
            // Оновлення позиції
            shape.x += shape.speedX;
            shape.y += shape.speedY;
            shape.rotation += shape.rotationSpeed;

            // Відбивання від країв (wrap around)
            if (shape.x < -shape.size) shape.x = this.canvas.width + shape.size;
            if (shape.x > this.canvas.width + shape.size) shape.x = -shape.size;
            if (shape.y < -shape.size) shape.y = this.canvas.height + shape.size;
            if (shape.y > this.canvas.height + shape.size) shape.y = -shape.size;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.shapes.forEach((shape) => {
            // Optimization: Remove blur filter completely

            // Note: We are setting fillStyle inside drawShape now for specific 3D gradients,
            // but we need globalAlpha for transparency
            this.ctx.globalAlpha = shape.opacity * this.options.opacity;

            this.drawShape(shape.x, shape.y, shape.size, shape.rotation, shape.color, shape.type);
        });

        this.ctx.globalAlpha = 1;
    }

    animate() {
        if (this.prefersReducedMotion) return;

        this.update();
        this.draw();

        if (this.isVisible) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    hide() {
        this.isVisible = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    show() {
        this.isVisible = true;
        if (!this.prefersReducedMotion && !this.animationId) {
            this.animate();
        }
    }

    destroy() {
        this.hide();
        window.removeEventListener("resize", () => this.resize());
        this.shapes = [];
    }
}

// Фабричні функції для різних типів фонів
const CanvasBackgrounds = {
    // Для секції About - трикутники та гексагони
    createAboutBackground(canvas, colors, performanceTier = "high") {
        return new CanvasBackground(canvas, {
            shapeType: "hexagons",
            shapeCount: 15,
            colors: colors || ["#1a1a28", "#2a2a5d", "#3f3f77"],
            speed: 0.3,
            rotationSpeed: 0.001,
            minSize: 40,
            maxSize: 90,
            opacity: 0.5,
            performanceTier: performanceTier,
        });
    },

    // Для секції Blocky - куби
    createBlockyBackground(canvas, colors, performanceTier = "high") {
        return new CanvasBackground(canvas, {
            shapeType: "cubes",
            shapeCount: 12,
            colors: colors || ["#8b7200", "#6c5600", "#443600"],
            speed: 0.4,
            rotationSpeed: 0.0015,
            minSize: 50,
            maxSize: 100,
            opacity: 0.6,
            performanceTier: performanceTier,
        });
    },

    // Для секції FallBalls - кола
    createFallBallsBackground(canvas, colors, performanceTier = "high") {
        return new CanvasBackground(canvas, {
            shapeType: "circles",
            shapeCount: 20,
            colors: colors || ["#ff3333", "#cc00cc", "#3333ff"],
            speed: 0.6,
            rotationSpeed: 0,
            minSize: 30,
            maxSize: 70,
            opacity: 0.5,
            performanceTier: performanceTier,
        });
    },
};

// Експорт для використання в script.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = { CanvasBackground, CanvasBackgrounds };
}
