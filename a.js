const overlay = document.getElementById("introOverlay");
const video = document.getElementById("introVideo");
const main = document.getElementById("mainContent");
const replayBtn = document.getElementById("replayBtn");

let started = false;

function freezeOnFirstFrame() {
  try {
    video.pause();
    video.currentTime = 0;
  } catch (e) {
    // بعضی مرورگرها تا metadata لود نشه اجازه currentTime نمی‌دن
  }
}

function showMainContent() {
  // محو شدن ویدیو
  overlay.classList.add("fade-out");
  overlay.setAttribute("aria-hidden", "true");

  // نمایش محتوا
  main.classList.remove("d-none");
  main.classList.add("fade-in");
  main.setAttribute("aria-hidden", "false");

  // بعد از انیمیشن، overlay رو کلاً از جریان حذف کن
  setTimeout(() => {
    overlay.style.display = "none";
  }, 900);
}

async function startVideo() {
  if (started) return;
  started = true;

  // اگر قبلاً muted گذاشتی، برای شروع سریع خوبه.
  // اگر می‌خوای با صدا پخش شه، muted رو بردار
  // ولی در موبایل ممکنه فقط با تعامل کاربر اجازه بده.
  try {
    await video.play();
  } catch (err) {
    // اگر play fail شد، اجازه بده کاربر دوباره لمس کنه
    started = false;
    console.warn("Video play blocked:", err);
  }
}

function resetAndReplay() {
  // main رو پنهان نکنیم (اختیاری). اگر می‌خوای فقط ویدیو بیاد:
  // main.classList.add("d-none");

  overlay.style.display = "block";
  overlay.classList.remove("fade-out");
  overlay.style.opacity = "1";
  overlay.style.visibility = "visible";
  overlay.setAttribute("aria-hidden", "false");

  // برگرد به اول و دوباره منتظر لمس
  started = false;
  freezeOnFirstFrame();
}

video.addEventListener("loadedmetadata", freezeOnFirstFrame);

// اگر مرورگر اولین فریم را بدون play نشان نداد، این هم کمک می‌کند:
video.addEventListener("canplay", () => {
  if (!started) freezeOnFirstFrame();
});

// پایان ویدیو => محو و نمایش محتوا
video.addEventListener("ended", () => {
  showMainContent();
});

// تعامل کاربر: touch/click روی کل overlay
overlay.addEventListener("click", startVideo, { passive: true });
overlay.addEventListener("touchstart", startVideo, { passive: true });

// دکمه replay
replayBtn?.addEventListener("click", () => {
  resetAndReplay();
  // اسکرول به بالا برای تجربه بهتر
  window.scrollTo({ top: 0, behavior: "smooth" });
});
