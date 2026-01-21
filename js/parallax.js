// Parallax Effect for Video Section (slower scroll, no delay)
const videoSection = document.querySelector(".video-section");

function updateParallax() {
    // Disable parallax on mobile devices (width <= 768px)
    // Also disable on landscape phones with limited height
    const isLandscapePhone = window.matchMedia("(max-height: 600px) and (orientation: landscape)").matches;

    if (window.innerWidth <= 768 || isLandscapePhone) {
        return;
    }

    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.25; // Moves 4x slower than scroll

    if (videoSection) {
        videoSection.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
}

window.addEventListener("scroll", updateParallax, { passive: true });

// Reset parallax on window resize
window.addEventListener(
    "resize",
    () => {
        const isLandscapePhone = window.matchMedia("(max-height: 600px) and (orientation: landscape)").matches;
        if ((window.innerWidth <= 768 || isLandscapePhone) && videoSection) {
            videoSection.style.transform = "none";
        }
    },
    { passive: true },
);
