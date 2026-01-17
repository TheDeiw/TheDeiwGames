// Parallax Effect for Video Section (slower scroll, no delay)
const videoSection = document.querySelector(".video-section");

function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.25; // Moves 4x slower than scroll

    if (videoSection) {
        videoSection.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
}

window.addEventListener("scroll", updateParallax, { passive: true });
