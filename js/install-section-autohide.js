// Install Section Auto-Hide on Scroll
const installSection = document.getElementById("installSection");
let isScrolled = false;
let hoverTimeout;
const HOVER_AREA_PADDING = 50; // pixels of padding around the install section

function updateInstallSectionVisibility() {
    const scrollY = window.pageYOffset;

    // Show when at top (within 100px of top)
    if (scrollY < 100) {
        installSection.classList.remove("hidden");
        isScrolled = false;
    } else {
        if (!isScrolled) {
            installSection.classList.add("hidden");
            isScrolled = true;
        }
    }
}

function isMouseInHoverArea(mouseX, mouseY) {
    const rect = installSection.getBoundingClientRect();

    // Expanded area with padding
    return (
        mouseX >= rect.left - HOVER_AREA_PADDING &&
        mouseX <= rect.right + HOVER_AREA_PADDING &&
        mouseY >= rect.top - HOVER_AREA_PADDING &&
        mouseY <= rect.bottom + HOVER_AREA_PADDING
    );
}

function handleMouseMove(e) {
    if (!isScrolled) return; // Only handle when scrolled down

    const inHoverArea = isMouseInHoverArea(e.clientX, e.clientY);

    if (inHoverArea) {
        // Show the section
        installSection.classList.remove("hidden");

        // Clear any existing timeout
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
    } else {
        // Only hide if we're not already hidden and cursor left the area
        if (!installSection.classList.contains("hidden")) {
            // Add small delay before hiding
            if (hoverTimeout) clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                installSection.classList.add("hidden");
            }, 300);
        }
    }
}

window.addEventListener("scroll", updateInstallSectionVisibility, { passive: true });
document.addEventListener("mousemove", handleMouseMove, { passive: true });

// Initial check
updateInstallSectionVisibility();
