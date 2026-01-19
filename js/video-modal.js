// Video Modal Functionality
const videoThumbnail = document.getElementById("videoThumbnail");
const videoModal = document.getElementById("videoModal");
const videoFrame = document.getElementById("videoFrame");
const closeModal = document.getElementById("closeModal");
const videoUrl = "https://www.youtube.com/embed/eN5y_5Yjnl4?autoplay=1";

// Open modal
videoThumbnail.addEventListener("click", function () {
    videoModal.classList.add("active");
    videoFrame.src = videoUrl;

    // Блокуємо скрол без зміни ширини
    document.documentElement.style.overflowY = "hidden";
});

// Close modal
function closeVideoModal() {
    videoModal.classList.remove("active");
    videoFrame.src = "";

    // Відновлюємо скрол
    document.documentElement.style.overflowY = "";
}

closeModal.addEventListener("click", closeVideoModal);

// Close on background click
videoModal.addEventListener("click", function (e) {
    if (e.target === videoModal) {
        closeVideoModal();
    }
});

// Close on ESC key
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && videoModal.classList.contains("active")) {
        closeVideoModal();
    }
});
