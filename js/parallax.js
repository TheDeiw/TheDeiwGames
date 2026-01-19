// Parallax Effect for Video Section (slower scroll, no delay)
const videoSection = document.querySelector(".video-section");

function updateParallax() {
    // Disable parallax on mobile devices (width <= 768px)
    if (window.innerWidth <= 768) {
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
        if (window.innerWidth <= 768 && videoSection) {
            videoSection.style.transform = "none";
        }
    },
    { passive: true },
);
