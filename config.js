// ==========================================
// GLOBAL WEBSITE SETTINGS (Change these anytime!)
// ==========================================
const SITE_SETTINGS = {
  fontSize:    { min: "20",  max: "100", default: "70"  },
  playerSpeed: { min: "0.5", max: "2",   default: "1"   },
  volume:      { min: "0",   max: "1",   default: "1"   }
};

// ==========================================
// APPLY SETTINGS TO SLIDERS AUTOMATICALLY
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Setup Font Slider
  const fontInput = document.getElementById("fontControl");
  const fontValue = document.getElementById("fontValue");
  if (fontInput && fontValue) {
    fontInput.min = SITE_SETTINGS.fontSize.min;
    fontInput.max = SITE_SETTINGS.fontSize.max;
    fontInput.value = SITE_SETTINGS.fontSize.default;
    fontValue.textContent = SITE_SETTINGS.fontSize.default + "px";
  }

  // 2. Setup Speed Slider
  const speedInput = document.getElementById("speedControl");
  const speedValue = document.getElementById("speedValue");
  if (speedInput && speedValue) {
    speedInput.min = SITE_SETTINGS.playerSpeed.min;
    speedInput.max = SITE_SETTINGS.playerSpeed.max;
    speedInput.value = SITE_SETTINGS.playerSpeed.default;
    speedValue.textContent = Number(SITE_SETTINGS.playerSpeed.default).toFixed(1) + "x";
  }

  // 3. Setup Volume Slider
  const volumeInput = document.getElementById("volumeControl");
  const volumeValue = document.getElementById("volumeValue");
  if (volumeInput && volumeValue) {
    volumeInput.min = SITE_SETTINGS.volume.min;
    volumeInput.max = SITE_SETTINGS.volume.max;
    volumeInput.value = SITE_SETTINGS.volume.default;
    volumeValue.textContent = (SITE_SETTINGS.volume.default * 100) + "%";
  }
});
