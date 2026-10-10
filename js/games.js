// Рендер ігор із games-data.js: featured-карусель та каталог "All games" з фільтрами.
// Виконується синхронно (скрипт стоїть в кінці body), щоб script.js побачив усі секції
// у своєму DOMContentLoaded.
(() => {
    const catalog = document.getElementById("all-games");
    if (typeof GAMES === "undefined" || !catalog) return;

    const PLATFORM_PATH = "assets/img/GamePlatforms/";
    const COVER_PATH = "assets/img/covers/"; // генерується: python tools/build-covers.py
    const globalBg = document.getElementById("global-background-color");

    const esc = (value) =>
        String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

    const platformIcon = (key, className) => {
        const platform = PLATFORMS[key];
        if (!platform) return "";
        return `<img src="${PLATFORM_PATH}${platform.icon}" alt="${esc(platform.label)}" title="${esc(platform.label)}" class="${className}">`;
    };

    const coverAttrs = (game, sizes) =>
        `src="${COVER_PATH}${game.id}-640.webp" ` +
        `srcset="${COVER_PATH}${game.id}-640.webp 640w, ${COVER_PATH}${game.id}-1280.webp 1280w" sizes="${sizes}"`;

    // Лічильник на About
    const gamesNumber = document.querySelector(".card__games_number");
    if (gamesNumber) gamesNumber.textContent = GAMES.length;

    // =========================================================
    // Featured: нескінченна карусель
    // =========================================================
    // Нативний скрол не використовується: позиція — це число `pos` (у слайдах),
    // а кожен слайд зсувається через transform на відстань до центру по колу.
    // Тому петля безшовна, а миша, дотик і трекпад ведуть себе однаково.
    const featured = GAMES.filter((game) => game.featured);

    const slideHtml = (game, index) => `
        <article class="featured__slide" role="group" aria-roledescription="slide" aria-label="${index + 1} / ${featured.length}" data-bg="${game.bg}" style="--section-accent-color: ${game.accent};">
            <div class="game__container">
                <div class="game__image-wrapper">
                    <img ${coverAttrs(game, "(max-width: 767px) 90vw, (max-width: 990px) 60vw, (max-width: 1199px) 50vw, 40vw")} alt="${esc(game.name)}" class="game__logo" draggable="false" decoding="async">
                </div>
                <div class="game__content">
                    <div class="game__content_text">
                        <h2 class="game__header">${esc(game.name)}</h2>
                        <p class="game__sub_header">${esc(game.subtitle || game.genre)}</p>
                        <p class="game__description">${esc(game.description).replace(/\n/g, "<br>")}</p>
                    </div>
                    <div class="game__button_platforms">
                        <a href="${game.page}" class="game__button" draggable="false">View game</a>
                        <div class="game__platforms">
                            ${game.platforms.map((key) => platformIcon(key, "platforms__platform")).join("")}
                        </div>
                    </div>
                </div>
            </div>
        </article>`;

    const arrowSvg = (direction) =>
        `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="${
            direction === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"
        }" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    catalog.insertAdjacentHTML(
        "beforebegin",
        `<section id="featured" class="section" data-bg-color="${featured[0].bg}">
            <div class="featured" role="region" aria-roledescription="carousel" aria-label="Featured games">
                <button type="button" class="featured__arrow featured__arrow--prev" aria-label="Previous game">${arrowSvg("prev")}</button>
                <div class="featured__track" tabindex="0">${featured.map(slideHtml).join("")}</div>
                <button type="button" class="featured__arrow featured__arrow--next" aria-label="Next game">${arrowSvg("next")}</button>
            </div>
            <div class="featured__dots">
                ${featured.map((game, i) => `<button type="button" class="featured__dot" aria-label="${esc(game.name)}" data-index="${i}"></button>`).join("")}
            </div>
        </section>`,
    );

    initCarousel(document.getElementById("featured"));

    function initCarousel(section) {
        const track = section.querySelector(".featured__track");
        const slides = [...track.children];
        const dots = [...section.querySelectorAll(".featured__dot")];
        const count = slides.length;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        let pos = 0; // поточна позиція в слайдах (дробова під час руху)
        let target = 0; // куди їде анімація
        let step = 1; // ширина слайда в px = крок між картками
        let active = -1;
        let sectionVisible = false;
        let tween = 0;
        let renderQueued = false;

        // Відстань від слайда до центру по колу: (-count/2, count/2]
        const wrap = (value) => value - count * Math.round(value / count);
        const rounded = () => (tween ? target : Math.round(pos));

        function setActive(index) {
            if (index === active) return;
            active = index;
            slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
            dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));

            // Фон сторінки слідує за активною грою; атрибут оновлюємо,
            // щоб при поверненні до секції script.js підхопив актуальний колір
            const color = slides[index].dataset.bg;
            section.setAttribute("data-bg-color", color);
            if (sectionVisible && globalBg) globalBg.style.backgroundColor = color;
        }

        function render() {
            slides.forEach((slide, i) => {
                const offset = wrap(i - pos);
                const distance = Math.abs(offset);
                const near = Math.min(distance, 1); // 0 у центрі, 1 і далі — «сусід»
                slide.style.transform = `translate3d(${offset * step}px, 0, 0) scale(${1 - 0.08 * near})`;
                // Слайд, що перестрибує з одного краю на інший, не з'являється різко, а проявляється
                slide.style.opacity = count > 2 ? Math.max(0, Math.min(1, (count / 2 - distance) / 0.4)) : 1;
                slide.style.zIndex = Math.round(10 - distance * 2);
                slide.style.setProperty("--dim", near.toFixed(3));
            });
            setActive(((Math.round(pos) % count) + count) % count);
        }

        function requestRender() {
            if (renderQueued) return;
            renderQueued = true;
            requestAnimationFrame(() => {
                renderQueued = false;
                render();
            });
        }

        function cancelTween() {
            cancelAnimationFrame(tween);
            tween = 0;
        }

        // pos тримаємо в [0, count), щоб число не росло безкінечно
        function normalize() {
            const shift = count * Math.floor(pos / count);
            pos -= shift;
            target -= shift;
        }

        function animateTo(next) {
            cancelTween();
            target = next;
            if (reduceMotion.matches || Math.abs(next - pos) < 0.001) {
                pos = next;
                normalize();
                render();
                return;
            }
            const from = pos;
            const delta = next - from;
            const duration = Math.min(750, 340 + Math.abs(delta) * 160);
            const start = performance.now();
            const frame = (now) => {
                const t = Math.min(1, (now - start) / duration);
                pos = from + delta * (1 - Math.pow(1 - t, 3)); // easeOutCubic
                if (t === 1) {
                    tween = 0;
                    normalize();
                } else {
                    tween = requestAnimationFrame(frame);
                }
                render();
            };
            tween = requestAnimationFrame(frame);
        }

        // Найкоротший шлях до слайда з індексом i (вперед або назад по колу)
        const goToIndex = (i) => animateTo(rounded() + wrap(i - rounded()));

        // --- Кнопки, крапки, клавіатура ---
        section.querySelector(".featured__arrow--prev").addEventListener("click", () => animateTo(rounded() - 1));
        section.querySelector(".featured__arrow--next").addEventListener("click", () => animateTo(rounded() + 1));
        dots.forEach((dot) => dot.addEventListener("click", () => goToIndex(Number(dot.dataset.index))));

        track.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") animateTo(rounded() - 1);
            else if (event.key === "ArrowRight") animateTo(rounded() + 1);
            else if (event.key === "Home") goToIndex(0);
            else if (event.key === "End") goToIndex(count - 1);
            else return;
            event.preventDefault();
        });

        // Фокус (Tab) на посиланні неактивної картки виводить її в центр
        track.addEventListener("focusin", (event) => {
            const slide = event.target.closest(".featured__slide");
            if (slide) goToIndex(slides.indexOf(slide));
        });

        // --- Перетягування: миша та дотик. Вертикальний скрол лишається за браузером (touch-action: pan-y) ---
        let drag = null;
        let justDragged = false;

        track.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            cancelTween();
            justDragged = false;
            drag = { id: event.pointerId, x: event.clientX, y: event.clientY, from: pos, moved: false, samples: [] };
        });

        track.addEventListener("pointermove", (event) => {
            if (!drag || event.pointerId !== drag.id) return;
            const dx = event.clientX - drag.x;
            if (!drag.moved) {
                if (Math.abs(dx) < 6) return;
                // Переважно вертикальний рух — це скрол сторінки, не чіпаємо
                if (Math.abs(event.clientY - drag.y) > Math.abs(dx)) {
                    drag = null;
                    return;
                }
                drag.moved = true;
                // Відлік від порогу (а не від 0), щоб картка не смикнулась на перших 6 px,
                // але й жодна частина руху не губилась, навіть якщо подія була одна й велика
                drag.x += Math.sign(dx) * 6;
                drag.from = pos;
                track.setPointerCapture(event.pointerId);
                track.classList.add("is-dragging");
            }
            pos = drag.from - (event.clientX - drag.x) / step;
            drag.samples.push({ t: event.timeStamp, pos });
            while (drag.samples.length > 1 && event.timeStamp - drag.samples[0].t > 100) drag.samples.shift();
            requestRender();
        });

        const endDrag = (event) => {
            if (!drag || event.pointerId !== drag.id) return;
            const { moved, samples } = drag;
            drag = null;
            if (!moved) return;
            justDragged = true;
            track.classList.remove("is-dragging");
            // Інерція: швидкість руху за останні ~100 мс => на скільки карток «докотиться»
            const first = samples[0];
            const last = samples[samples.length - 1];
            const dt = first && last ? last.t - first.t : 0;
            const velocity = dt > 10 ? (last.pos - first.pos) / dt : 0; // слайдів за мс
            const carry = Math.max(-0.6, Math.min(0.6, velocity * 220)); // один жест — не більше однієї «зайвої» картки
            animateTo(Math.round(pos + carry));
        };
        track.addEventListener("pointerup", endDrag);
        track.addEventListener("pointercancel", endDrag);

        track.addEventListener("dragstart", (event) => event.preventDefault());

        // Горизонтальний жест трекпада або Shift + коліщатко
        let wheelTimer = 0;
        track.addEventListener(
            "wheel",
            (event) => {
                if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return; // вертикальний скрол — сторінці
                event.preventDefault();
                cancelTween();
                pos += event.deltaX / step;
                requestRender();
                clearTimeout(wheelTimer);
                wheelTimer = setTimeout(() => animateTo(Math.round(pos)), 140);
            },
            { passive: false },
        );

        // Клік по неактивній картці виводить її в центр замість переходу за посиланням;
        // після перетягування клік ігноруємо
        track.addEventListener(
            "click",
            (event) => {
                const slide = event.target.closest(".featured__slide");
                if (justDragged || (slide && !slide.classList.contains("is-active"))) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!justDragged) goToIndex(slides.indexOf(slide));
                    justDragged = false;
                }
            },
            true,
        );

        // Той самий поріг, що й у навігації в script.js
        new IntersectionObserver(
            ([entry]) => {
                sectionVisible = entry.isIntersecting;
            },
            { rootMargin: "-20% 0px -20% 0px", threshold: 0.2 },
        ).observe(section);

        const measure = () => {
            step = slides[0].offsetWidth || 1;
            render();
        };
        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(track);
        resizeObserver.observe(slides[0]);
        measure();
    }

    // =========================================================
    // Каталог
    // =========================================================
    const grid = document.getElementById("catalogGrid");
    const genreBox = document.getElementById("genreFilters");
    const platformBox = document.getElementById("platformFilters");
    const catalogBg = catalog.getAttribute("data-bg-color");

    grid.innerHTML = GAMES.map(
        (game) => `
        <li class="catalog__item">
            <a href="${game.page}" class="catalog-card" style="--section-accent-color: ${game.accent};" data-bg="${game.bg}">
                <span class="catalog-card__cover">
                    <img ${coverAttrs(game, "(max-width: 767px) 45vw, (max-width: 990px) 28vw, 20vw")} alt="" loading="lazy" decoding="async">
                </span>
                <span class="catalog-card__body">
                    <span class="catalog-card__title">${esc(game.name)}</span>
                    <span class="catalog-card__meta">
                        <span class="catalog-card__genre">${esc(game.genre)}</span>
                        <span class="catalog-card__platforms">
                            ${game.platforms.map((key) => platformIcon(key, "catalog-card__platform")).join("")}
                        </span>
                    </span>
                </span>
            </a>
        </li>`,
    ).join("");

    const items = [...grid.children];

    // Значення фільтрів збираємо з даних, тож нова гра/платформа з'явиться сама
    const genres = [...new Set(GAMES.map((game) => game.genre))].sort((a, b) => {
        const byCount = GAMES.filter((g) => g.genre === b).length - GAMES.filter((g) => g.genre === a).length;
        return byCount || a.localeCompare(b);
    });
    const platformKeys = Object.keys(PLATFORMS).filter(
        (key) => PLATFORMS[key].filter !== false && GAMES.some((game) => game.platforms.includes(key)),
    );

    const state = { genre: null, platform: null };

    const matches = (game, genre, platform) =>
        (!genre || game.genre === genre) && (!platform || game.platforms.includes(platform));

    const chipHtml = (group, value, label, icon) => `
        <button type="button" class="chip" data-group="${group}" data-value="${esc(value)}" aria-pressed="false">
            ${icon ? `<img src="${PLATFORM_PATH}${icon}" alt="" class="chip__icon">` : ""}
            <span class="chip__label">${esc(label)}</span>
            <span class="chip__count"></span>
        </button>`;

    genreBox.innerHTML = chipHtml("genre", "", "All") + genres.map((g) => chipHtml("genre", g, g)).join("");
    platformBox.innerHTML =
        chipHtml("platform", "", "All") +
        platformKeys.map((key) => chipHtml("platform", key, PLATFORMS[key].label, PLATFORMS[key].icon)).join("");

    const chips = [...catalog.querySelectorAll(".chip")];

    function render() {
        let shown = 0;
        items.forEach((item, index) => {
            const visible = matches(GAMES[index], state.genre, state.platform);
            const wasHidden = item.hidden;
            item.hidden = !visible;
            if (visible) {
                if (wasHidden) {
                    item.style.setProperty("--enter-delay", `${shown * 40}ms`);
                    item.classList.remove("is-entering");
                    void item.offsetWidth; // перезапуск анімації появи
                    item.classList.add("is-entering");
                }
                shown++;
            }
        });

        // Фасетні лічильники: скільки ігор дасть клік з урахуванням іншої групи
        chips.forEach((chip) => {
            const group = chip.dataset.group;
            const value = chip.dataset.value || null;
            const other = group === "genre" ? state.platform : state.genre;
            const count = GAMES.filter((game) =>
                group === "genre" ? matches(game, value, other) : matches(game, other, value),
            ).length;

            chip.setAttribute("aria-pressed", String(state[group] === value));
            chip.querySelector(".chip__count").textContent = count;
            chip.disabled = count === 0;
        });
    }

    catalog.querySelector(".catalog__filters").addEventListener("click", (event) => {
        const chip = event.target.closest(".chip");
        if (!chip || chip.disabled) return;
        const group = chip.dataset.group;
        const value = chip.dataset.value || null;
        // Повторний клік по активному чіпу скидає групу
        state[group] = state[group] === value ? null : value;
        render();
    });

    // --- Наведення на картку підсвічує фон кольором гри (лише з мишею) ---
    if (globalBg && window.matchMedia("(hover: hover)").matches) {
        const tint = (color) => (globalBg.style.backgroundColor = color);
        grid.addEventListener("mouseover", (event) => {
            const card = event.target.closest(".catalog-card");
            if (card) tint(card.dataset.bg);
        });
        grid.addEventListener("mouseout", (event) => {
            const to = event.relatedTarget;
            if (event.target.closest(".catalog-card") && !(to && to.closest && to.closest(".catalog-card"))) {
                tint(catalogBg);
            }
        });
        grid.addEventListener("focusin", (event) => {
            const card = event.target.closest(".catalog-card");
            if (card) tint(card.dataset.bg);
        });
        grid.addEventListener("focusout", () => tint(catalogBg));
    }

    render();
})();
