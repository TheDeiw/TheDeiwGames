document.addEventListener("DOMContentLoaded", () => {
    // --- Система динамічних градієнтів ---
    //
    // Використання:
    // 1. Додайте клас 'gradient-section' до секції
    // 2. Встановіть атрибути data-gradient-start="#hex" та data-gradient-end="#hex"
    // 3. Система автоматично створить градієнт з прозорістю 0.55
    //
    // Приклад HTML:
    // <section class="gradient-section" data-gradient-start="#ff0000" data-gradient-end="#0000ff">
    //
    // Динамічне оновлення через JavaScript:
    // updateGradientSection('section-id', '#ff0000', '#0000ff');

    // Функція для конвертації HEX в RGB
    function hexToRgb(hex) {
        // Видаляємо # якщо є
        hex = hex.replace("#", "");

        // Парсимо HEX код
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        return [r, g, b];
    }

    function initializeGradientSections() {
        const gradientSections = document.querySelectorAll(".gradient-section");

        gradientSections.forEach((section) => {
            const startColor = section.getAttribute("data-gradient-start");
            const endColor = section.getAttribute("data-gradient-end");

            if (startColor && endColor) {
                // Конвертуємо HEX коди в RGB
                const startRGB = hexToRgb(startColor);
                const endRGB = hexToRgb(endColor);

                // Створюємо градієнт з прозорістю
                const gradient = `linear-gradient(117deg, 
                    rgba(${startRGB[0]}, ${startRGB[1]}, ${startRGB[2]}, 0.55) 0%, 
                    rgba(${endRGB[0]}, ${endRGB[1]}, ${endRGB[2]}, 0.55) 100%)`;

                // Встановлюємо CSS змінну для градієнта
                section.style.setProperty("--gradient-overlay", gradient);
            }
        });
    }

    // Ініціалізуємо градієнти при завантаженні сторінки
    initializeGradientSections();

    // Експортуємо функцію для глобального використання
    window.updateGradientSection = function (sectionId, startColor, endColor) {
        const section = document.getElementById(sectionId);
        if (section && section.classList.contains("gradient-section")) {
            section.setAttribute("data-gradient-start", startColor);
            section.setAttribute("data-gradient-end", endColor);

            const startRGB = hexToRgb(startColor);
            const endRGB = hexToRgb(endColor);

            const gradient = `linear-gradient(117deg, 
                rgba(${startRGB[0]}, ${startRGB[1]}, ${startRGB[2]}, 0.55) 0%, 
                rgba(${endRGB[0]}, ${endRGB[1]}, ${endRGB[2]}, 0.55) 100%)`;

            section.style.setProperty("--gradient-overlay", gradient);
        }
    };

    // --- Частина для Dropdown меню ---
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const mainContent = document.querySelector("main.fullpage") || document.querySelector("main");
    const gamesButtonContainer = document.querySelector(".header__menu_games");

    function openMenu() {
        dropdownMenu.classList.add("is-open");
        mainContent.classList.add("main-blurred");
    }

    function closeMenu() {
        dropdownMenu.classList.remove("is-open");
        mainContent.classList.remove("main-blurred");
    }

    dropdownBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (dropdownMenu.classList.contains("is-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    window.addEventListener("click", (event) => {
        if (dropdownMenu.classList.contains("is-open") && !gamesButtonContainer.contains(event.target)) {
            closeMenu();
        }
    });

    // --- Global Background Manager ---
    const globalCanvas = document.getElementById("global-canvas");
    const globalBgColor = document.getElementById("global-background-color");

    if (globalCanvas) {
        // Initialize single global background with mixed shapes
        // Using neutral colors for shapes to be visible on different backgrounds
        new CanvasBackground(globalCanvas, {
            shapeType: "mixed",
            shapeCount: 12, // Reduced for performance
            colors: ["#ffffff", "#e0e0e0", "#c0c0c0", "#a0a0a0"],
            speed: 0.3,
            rotationSpeed: 0.003,
            minSize: 20,
            maxSize: 100,
            opacity: 0.2,
        });
    }

    // --- Active Section Tracking (Nav & Background) ---
    const sections = document.querySelectorAll(".section");
    const navLinks = document.querySelectorAll(".menu__link[data-scroll-to]");

    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -20% 0px", // Trigger when section takes up significant part of screen
        threshold: 0.2,
    };

    const observerCallback = (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const sectionId = section.id;

                // 1. Update Navigation
                navLinks.forEach((link) => link.classList.remove("active"));
                const correspondingLink = document.querySelector(`.menu__link[data-scroll-to="${sectionId}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add("active");
                }

                // 2. Update Background Color
                const bgColor = section.getAttribute("data-bg-color");
                if (bgColor && globalBgColor) {
                    globalBgColor.style.backgroundColor = bgColor;
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
        observer.observe(section);
    });

    // --- Плавна прокрутка до секцій ---
    const menuLinks = document.querySelectorAll(".menu__link[data-scroll-to]");

    menuLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // Запобігаємо стандартній поведінці браузера

            const targetId = link.getAttribute("data-scroll-to");
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Плавна прокрутка до секції
                targetSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    // --- Canvas Background Animations ---
    // (Legacy code removed, using global background now)

    /* 
    const canvasBackgrounds = {};
    const canvasElements = document.querySelectorAll(".background_canvas");
    ...
    */

    // Функція для генерації палітри кольорів на основі градієнта
    function generateColorPalette(startHex, endHex) {
        const start = hexToRgb(startHex);
        const end = hexToRgb(endHex);
        const colors = [];

        // Генеруємо 3-4 кольори між початковим та кінцевим
        for (let i = 0; i <= 3; i++) {
            const ratio = i / 3;
            const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
            const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
            const b = Math.round(start[2] + (end[2] - start[2]) * ratio);
            colors.push(
                `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
                    .toString(16)
                    .padStart(2, "0")}`
            );
        }

        return colors;
    }

    /*
    // Розширюємо IntersectionObserver для управління анімаціями canvas
    const canvasObserverCallback = (entries, observer) => {
        entries.forEach((entry) => {
            const sectionId = entry.target.id;
            const canvasBackground = canvasBackgrounds[sectionId];

            if (canvasBackground) {
                if (entry.isIntersecting) {
                    canvasBackground.show();
                } else {
                    canvasBackground.hide();
                }
            }

            // Викликаємо оригінальний callback для навігації
            if (entry.isIntersecting) {
                navLinks.forEach((link) => link.classList.remove("active"));
                const correspondingLink = document.querySelector(`.menu__link[data-scroll-to="${sectionId}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add("active");
                }
            }
        });
    };

    // Пересоздаємо observer з новим callback
    const canvasObserver = new IntersectionObserver(canvasObserverCallback, observerOptions);
    sections.forEach((section) => {
        canvasObserver.observe(section);
    });
    */
});
