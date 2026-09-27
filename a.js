document.addEventListener("DOMContentLoaded", () => {

  const overlay = document.getElementById("introOverlay");
  const video = document.getElementById("introVideo");
  const mainContent = document.getElementById("mainContent");
  const hint = document.querySelector(".intro-hint");
  const replayBtn = document.getElementById("replayBtn");

  const weddingMusic = document.getElementById("weddingMusic");
  const musicPromptModal = document.getElementById("musicPromptModal");
  const musicYesBtn = document.getElementById("musicYesBtn");
  const musicNoBtn = document.getElementById("musicNoBtn");
  const musicToggleBtn = document.getElementById("musicToggleBtn");

  let isVideoStarted = false;
  let scratchInited = false;

 
  if (!video || !overlay || !mainContent) {
    console.warn("intro elements missing");
    return;
  }


  function freezeFirstFrame() {
    try {
      video.pause();
      video.currentTime = 0;
    } catch (e) {}
  }

  video.addEventListener("loadedmetadata", freezeFirstFrame);
  video.addEventListener("canplay", () => {
    if (!isVideoStarted) freezeFirstFrame();
  });


  async function startVideo() {
    if (isVideoStarted) return;
    isVideoStarted = true;
    hint?.classList.add("hide");

    try {

      video.volume = 1.0;
      await video.play();
      video.muted = false;
    } catch (err) {
      console.warn("پخش ناموفق بود:", err);
      isVideoStarted = false;
      hint?.classList.remove("hide");
    }
  }

  overlay.addEventListener("click", startVideo, { passive: true });
  overlay.addEventListener("touchstart", startVideo, { passive: true });


  video.addEventListener("ended", () => {
    overlay.classList.add("fade-out");
    mainContent.classList.remove("d-none");
    mainContent.classList.add("fade-in");
    mainContent.setAttribute("aria-hidden", "false");

    setTimeout(() => {
      overlay.style.display = "none";

  
      initScratchCard();
      musicPromptModal?.classList.remove("d-none");
    }, 800);
  });


  function closeModal() {
    if (!musicPromptModal || !musicToggleBtn) return;
    musicPromptModal.classList.add("fade-out");
    setTimeout(() => {
      musicPromptModal.classList.add("d-none");
      musicPromptModal.classList.remove("fade-out");
    }, 400);
    musicToggleBtn.classList.remove("d-none");
  }

  musicYesBtn?.addEventListener("click", () => {
    if (!weddingMusic) return;
    weddingMusic.volume = 0.6;
    weddingMusic.play()
      .then(() => musicToggleBtn?.classList.add("playing"))
      .catch(console.warn);
    closeModal();
  });

  musicNoBtn?.addEventListener("click", () => {
    weddingMusic?.pause();
    musicToggleBtn?.classList.remove("playing");
    closeModal();
  });

  musicToggleBtn?.addEventListener("click", () => {
    if (!weddingMusic) return;
    if (weddingMusic.paused) {
      weddingMusic.play().catch(console.warn);
      musicToggleBtn.classList.add("playing");
    } else {
      weddingMusic.pause();
      musicToggleBtn.classList.remove("playing");
    }
  });


  replayBtn?.addEventListener("click", () => {
    overlay.style.display = "block";
    overlay.classList.remove("fade-out");
    overlay.style.opacity = "1";
    overlay.style.visibility = "visible";
    isVideoStarted = false;
    freezeFirstFrame();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });


  function initScratchCard() {
    if (scratchInited) return; // جلوگیری از دوباره init شدن
    const canvas = document.getElementById("scratchCanvas");
    const container = document.getElementById("scratchContainer");
    if (!canvas || !container) return;

    scratchInited = true;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvasToContainer() {
      const rect = container.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));

      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // مختصات را CSS-px نگه می‌دارد
    }

    resizeCanvasToContainer();

  
    function drawOverlay() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
    
     
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#8b1528");
      grad.addColorStop(1, "#b91c32");
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    
     
      const icon = new Image();
      icon.src = "./file_000000009bb0820a890965fb7b2d20d7.jpg";
    
      icon.onload = () => {

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = icon.width;
        tempCanvas.height = icon.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(icon, 0, 0);
    
      
        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
            data[i + 3] = 0; // شفاف کردن
          }
        }
        tempCtx.putImageData(imgData, 0, 0);
    
    
        const text = "اینجا را پاک کنید";
        const gap = 12;
        const iconSize = 24; 
    
        ctx.font = "bold 16px Vazirmatn, Tahoma, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
    
        const textWidth = ctx.measureText(text).width;
        const totalW = iconSize + gap + textWidth;
        const startX = (w - totalW) / 2;
        const centerY = h / 2;
    
   
        ctx.drawImage(tempCanvas, startX, centerY - iconSize / 2, iconSize, iconSize);
       
        ctx.fillText(text, startX + iconSize + gap, centerY);
      };
   
      icon.onerror = () => {
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px Vazirmatn, sans-serif";
       
      };
    }
    
    drawOverlay();


    let isDrawing = false;

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function scratch(e) {
      if (!isDrawing) return;
      e.preventDefault();

      const { x, y } = getPos(e);
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    canvas.addEventListener("mousedown", (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", () => { isDrawing = false; });

    canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); }, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    window.addEventListener("touchend", () => { isDrawing = false; });

    // اگر کانتینر ریسپانسیو است، با resize دوباره رندر کن
    window.addEventListener("resize", () => {
      resizeCanvasToContainer();
      drawOverlay();
    }, { passive: true });
  }


  const attendanceInputs = document.querySelectorAll('input[name="attendance"]');
  const companionsBox = document.getElementById("companionsBox");
  attendanceInputs.forEach(input => {
    input.addEventListener("change", (e) => {
      if (!companionsBox) return;
      companionsBox.classList.toggle("d-none", e.target.value === "no");
    });
  });


  const rsvpForm = document.getElementById("rsvpForm");
  const rsvpAlert = document.getElementById("rsvpAlert");
  rsvpForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    rsvpAlert?.classList.remove("d-none");
    const btn = rsvpForm.querySelector(".btn-submit-rsvp");
    if (btn) {
      btn.disabled = true;
      btn.innerText = "با تشکر از پاسخ شما";
    }
  });
});
