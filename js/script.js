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

    // --- НОВА ЧАСТИНА: Відстеження активної секції при скролі ---
    const sections = document.querySelectorAll(".section");
    const navLinks = document.querySelectorAll(".menu__link[data-scroll-to]");

    const observerOptions = {
        root: null, // спостерігаємо за перетином у viewport
        rootMargin: "0px",
        threshold: 0.7, // секція має бути видима на 70%, щоб вважатись активною
    };

    const observerCallback = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Видаляємо клас 'active' з усіх посилань
                navLinks.forEach((link) => link.classList.remove("active"));

                // Знаходимо посилання, що відповідає видимій секції
                const sectionId = entry.target.id;
                const correspondingLink = document.querySelector(`.menu__link[data-scroll-to="${sectionId}"]`);

                if (correspondingLink) {
                    correspondingLink.classList.add("active");
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
});
