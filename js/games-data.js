// Єдине джерело правди про ігри. Щоб додати гру — додайте об'єкт у GAMES.
//
//   id        — ім'я для якоря (#<id>-game) та ключ картки
//   name      — назва
//   genre     — жанр (за ним працює фільтр і підпис у каталозі)
//   subtitle  — необов'язково: підпис у featured-секції, якщо відрізняється від genre
//   description — опис для featured-секції ("\n" => перенос рядка)
//   image     — обкладинка
//   page      — сторінка гри
//   platforms — ключі з PLATFORMS
//   bg        — колір фону сторінки, коли гра в фокусі
//   accent    — акцентний колір гри
//   featured  — true => гра потрапляє в нескінченну карусель Featured (краще 3–6 ігор)
//
// Порядок у масиві = порядок у каталозі та у featured-каруселі.
//
// Після додавання гри або заміни image згенеруйте WebP-обкладинки (потрібен Pillow):
//   python tools/build-covers.py

const PLATFORMS = {
    windows: { label: "Windows", icon: "windows.svg" },
    linux: { label: "Linux", icon: "linux.svg" },
    web: { label: "Web browser", icon: "web.svg" },
    android: { label: "Android", icon: "android.svg" },
    "meta-quest": { label: "Meta Quest", icon: "meta-quest.svg" },
    // filter: false — іконка показується на картках, але окремого фільтра немає
    vr: { label: "VR", icon: "vr.svg", filter: false },
};

const GAMES = [
    {
        id: "deminingacademy",
        name: "Demining Academy",
        genre: "Simulator",
        subtitle: "VR Simulator",
        description: "Virtual Reality simulation for mine awareness and the demining process.",
        image: "assets/img/GamesPhotos/DeminigAcademy/DeminingAcademy.png",
        page: "pages/DeminingAcademy.html",
        platforms: ["vr", "meta-quest"],
        bg: "#1a3d20",
        accent: "#83CC8F",
        featured: true,
    },
    {
        id: "turretrush",
        name: "Turret Rush",
        genre: "Action",
        description:
            "Your car never stops, and neither do the stickmen chasing it. Aim the turret, mow down the crowd and reach the finish line in one piece.",
        image: "assets/img/GamesPhotos/TurretRush/TurretRush.jpg",
        page: "pages/TurretRush.html",
        platforms: ["android"],
        bg: "#0d2552",
        accent: "#3f8cff",
        featured: true,
    },
    {
        id: "spacedodger",
        name: "Space Dodger",
        genre: "Action",
        description: "Trained agent with Reinforcement Learning using ml-agents toolkit.",
        image: "assets/img/GamesPhotos/SpaceDodger/SpaceDodger.png",
        page: "pages/SpaceDodger.html",
        platforms: ["web"],
        bg: "#040e33",
        accent: "#7692f4",
        featured: true,
    },
    {
        id: "cuberunner",
        name: "Cube Runner",
        genre: "Platformer",
        description:
            "Fast-paced 3D platformer, where you will test your reaction, speed and ability to cope with unexpected traps.",
        image: "assets/img/GamesPhotos/CubeRunner/CubeRunner.png",
        page: "pages/CubeRunner.html",
        platforms: ["windows", "web"],
        bg: "#143a12",
        accent: "#2bcb22",
        featured: true,
    },
    {
        id: "tankdestroyer",
        name: "Tank Destroyer",
        genre: "Action",
        description:
            "An exciting tank battle game where you take control of a tank to destroy enemy forces and survive the battlefield.",
        image: "assets/img/GamesPhotos/TankDestroyer/Tank_destroyer.png",
        page: "pages/TankDestroyer.html",
        platforms: ["windows", "web"],
        bg: "#0F4011",
        accent: "#30c042",
    },
    {
        id: "fallballs",
        name: "Fall Balls",
        genre: "Arcade",
        description:
            "A small game in which you need to catch multi-colored balls so that they do not go out in eternal darkness.",
        image: "assets/img/GamesPhotos/FallBalls/FallBalls.png",
        page: "pages/FallBalls.html",
        platforms: ["windows"],
        bg: "#111111",
        accent: "#d7d7d7",
    },
    {
        id: "blocky",
        name: "Blocky",
        genre: "Puzzle",
        description:
            "Simple 3D puzzle with orthographic camera. Made a video tutorial.\nYou're playing for a red rectangle that needs to be freed from this trap.",
        image: "assets/img/GamesPhotos/Blocky/Blocky.png",
        page: "pages/Blocky.html",
        platforms: ["windows"],
        bg: "#483a00",
        accent: "#FBBC05",
    },
];
