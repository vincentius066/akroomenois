// ==========================================
// 1. GLOBAL WEBSITE CONFIGURATION
// ==========================================
const SITE_SETTINGS = {
  fontSize:    { min: "20",  max: "100", default: "70"  },
  playerSpeed: { min: "0.5", max: "2",   default: "1"   },
  volume:      { min: "0",   max: "1",   default: "1"   }
};

// ==========================================
// 2. INITIALIZE LOGIC ON PAGE LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 3. GENERATE THE INTERFACE AUTOMATICALLY
  // ==========================================
  const interfaceHTML = `
    <div id="topBar">
      <button id="homeBtn">🏠</button>
      <div id="title">${document.title}</div> <button id="settingsBtn">⚙️</button>
    </div>

    <div id="popup">
      <button id="closePopup">✕</button>
      <div id="popupContent"></div>
    </div>
    <div id="popupOverlay"></div>

    <div id="settingsPopup">
      <button id="closeSettings">✕</button>
      <h3>Settings</h3>
      <label>Greek Font: 
        <select id="fontFamilyControl">
          <option value="SBL">SBL</option>
          <option value="'EB Garamond'">EB Garamond</option>
        </select>
      </label>
      <br><br>
      <label>Text size: <input type="range" id="fontControl" step="1"><span id="fontValue"></span></label>
      <br><br>
      <label>Speed: <input type="range" id="speedControl" step="0.1"><span id="speedValue"></span></label>
      <br><br>
      <label for="volumeControl">Volume:</label><input type="range" id="volumeControl" step="0.01"><span id="volumeValue"></span>
    </div>
        
    <div id="playerBar">
      <button id="prevBtn"><img src="icon/play-backwards.svg" alt="Backward" width="32" height="32"></button>
      <button id="playBtn"><img src="icon/play-button.svg" alt="Play" width="32" height="32"></button>
      <button id="nextBtn"><img src="icon/play-forwards.svg" alt="Forward" width="32" height="32"></button>
      <input type="range" id="progressBar" value="0" min="0" step="0.1">
      <button id="langBtn">GR</button>
    </div>
  `;

  // Inject the interface into the body of the page
  document.body.insertAdjacentHTML('beforeend', interfaceHTML);

  // ... ALL THE REST OF YOUR EXISTING SCRIPT.JS CODE STAYS EXACTLY THE SAME BELOW THIS ...
  
  // Grab all DOM elements
  const audio = document.getElementById("audio");
  const phrases = document.querySelectorAll("#text > span.phrase");
  const phrasesEn = document.querySelectorAll("#text_en > span.phrase_en");
  const settingsPopup = document.getElementById("settingsPopup");
  const closeSettings = document.getElementById("closeSettings");
  const popup = document.getElementById("popup");
  const popupOverlay = document.getElementById("popupOverlay");
  const popupContent = document.getElementById("popupContent");
  const playBtn = document.getElementById("playBtn");
  const progressBar = document.getElementById("progressBar");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const langBtn = document.getElementById("langBtn");
  const homeBtn = document.getElementById("homeBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const speedControl = document.getElementById("speedControl");
  const speedValue = document.getElementById("speedValue");
  const fontControl = document.getElementById("fontControl");
  const fontValue = document.getElementById("fontValue");
  const text = document.getElementById("text");
  const textEn = document.getElementById("text_en");
  const volumeControl = document.getElementById("volumeControl");
  const volumeValue = document.getElementById("volumeValue");
  const fontFamilyControl = document.getElementById("fontFamilyControl");

  let wasPlaying = false;
  let currentActive = null;
  let currentSection = null;

  // ==========================================
  // SETUP CONFIG BOUNDARIES & LOAD SAVED PREFERENCES
  // ==========================================
  
  // 1. Text Size
  if (fontControl && fontValue) {
    fontControl.min = SITE_SETTINGS.fontSize.min;
    fontControl.max = SITE_SETTINGS.fontSize.max;
    
    // Load saved font size or use default
    const savedFontSize = localStorage.getItem("reader_fontSize") || SITE_SETTINGS.fontSize.default;
    fontControl.value = savedFontSize;
    fontValue.textContent = savedFontSize + "px";
    
    // Apply to text containers immediately
    if (text) text.style.fontSize = savedFontSize + "px";
    if (textEn) textEn.style.fontSize = savedFontSize + "px";
  }

  // 2. Greek Font Family
  if (fontFamilyControl && text) {
    // Load saved font family or default to SBL
    const savedFontFamily = localStorage.getItem("reader_fontFamily") || "SBL";
    fontFamilyControl.value = savedFontFamily;
    text.style.fontFamily = savedFontFamily;
  }

  // 3. Playback Speed
  if (speedControl && speedValue) {
    speedControl.min = SITE_SETTINGS.playerSpeed.min;
    speedControl.max = SITE_SETTINGS.playerSpeed.max;
    
    // Load saved speed or use default
    const savedSpeed = localStorage.getItem("reader_playerSpeed") || SITE_SETTINGS.playerSpeed.default;
    speedControl.value = savedSpeed;
    speedValue.textContent = Number(savedSpeed).toFixed(1) + "x";
    
    // Apply speed to audio once metadata loads to ensure it sticks
    audio.addEventListener("loadedmetadata", () => {
      audio.playbackRate = parseFloat(savedSpeed);
    });
  }

  // 4. Volume
  if (volumeControl && volumeValue) {
    volumeControl.min = SITE_SETTINGS.volume.min;
    volumeControl.max = SITE_SETTINGS.volume.max;
    
    // Load saved volume or use default
    const savedVolume = localStorage.getItem("reader_volume") || SITE_SETTINGS.volume.default;
    volumeControl.value = savedVolume;
    volumeValue.textContent = Math.round(savedVolume * 100) + "%";
    audio.volume = parseFloat(savedVolume);
  }

  // Helper check for active popups
  function isPopupActive() {
    return (popup && popup.style.display === "block") || (settingsPopup && settingsPopup.style.display === "block");
  }

  // Viewport checking functions for autoscroll
  function isOutOfView(el) {
    const rect = el.getBoundingClientRect();
    const topOffset = 120;   
    const bottomOffset = window.innerHeight - 100; 
    return rect.top < topOffset + 40 || rect.bottom > bottomOffset - 40;
  }

  function scrollToTop(el) {
    window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top - 120, 
      behavior: "smooth" 
    });
  }

  function getCurrentPhraseIndex() {
    const time = audio.currentTime;
    for (let i = 0; i < phrases.length; i++) {
      const start = parseFloat(phrases[i].dataset.start);
      const nextStart = i < phrases.length - 1 ? parseFloat(phrases[i + 1].dataset.start) : Infinity;
      if (time >= start && time < nextStart) return i;
    }
    return -1;
  }

  // Universal Highlight & Timeline Track
  audio.addEventListener("timeupdate", () => {
    const time = audio.currentTime;
    progressBar.value = time;

    // Determine which language loop to run based on what's visible
    const isGreekVisible = (text.style.display !== "none");
    const activePhrasesList = isGreekVisible ? phrases : phrasesEn;

    activePhrasesList.forEach((phrase, index) => {
      const start = parseFloat(phrase.dataset.start);
      const nextStart = index < activePhrasesList.length - 1 ? parseFloat(activePhrasesList[index + 1].dataset.start) : Infinity;

      if (time >= start && time < nextStart) {
        if (currentActive !== phrase) {
          // Remove old highlight
          if (currentActive) currentActive.classList.remove("active");
          
          currentActive = phrase;
          phrase.classList.add("active");
          
          // Instantly jump the active text line directly to the top!
          scrollToTop(phrase);
        }
      } else {
        phrase.classList.remove("active");
      }
    });
  });
  
  // ==========================================
  // RESILIENT PROGRESS AND METADATA RESTORATION
  // ==========================================

  // 1. Force the progress bar to update its maximum capacity as soon as the real duration is resolved
  audio.addEventListener("timeupdate", () => {
    if (audio.duration && isFinite(audio.duration) && progressBar.max !== audio.duration.toString()) {
      progressBar.max = audio.duration;
    }
  });

  // 2. Safely capture data availability to restore historical playback offsets
  audio.addEventListener("loadeddata", () => {
    // If the browser is still struggling to read the WebM header timeline,
    // we jump the playhead forward 0.1s and back instantly. This forces Chromium to parse the full file layout.
    if (!audio.duration || !isFinite(audio.duration) || audio.duration === Infinity) {
      audio.currentTime = 0.1;
      audio.currentTime = 0;
    }

    // Wrap in a tiny delay to give the browser a split second to calculate the real file boundary
    setTimeout(() => {
      progressBar.max = audio.duration || 100; // Fallback placeholder if still loading

      const savedTime = localStorage.getItem("reader_currentTime");
      if (savedTime) {
        const targetTime = parseFloat(savedTime);
        if (isFinite(audio.duration) && targetTime < audio.duration) {
          audio.currentTime = targetTime;
          progressBar.value = targetTime;
        }
      }
    }, 150);
  });

  // Handle Clicking Words
  const words = document.querySelectorAll("#text span.word");
  words.forEach((word) => {
    word.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isPopupActive()) return;
      const phrase = word.closest("span.phrase");
      if (phrase && phrase.classList.contains("active")) {
        wasPlaying = !audio.paused; 
        audio.pause();
        
        const wordText = word.textContent;
        fetch(`https://scaife.perseus.org/morpheus/?word=${encodeURIComponent(wordText)}&lang=grc`);
        
        popupContent.innerHTML = `<p><strong>Word:</strong> ${word.textContent}<br><br><strong>Lemma:</strong><br><br><strong>Word Type:</strong><br><br><strong>Grammar:</strong></p>`;
        popup.style.display = "block";
        popupOverlay.style.display = "block";
      } else if (phrase) {
        audio.currentTime = parseFloat(phrase.dataset.start);
      }
    });
  });

  // Dictionary Popup Close Actions
  const closePopup = () => {
    popup.style.display = "none";
    popupOverlay.style.display = "none";
    if (wasPlaying) { audio.play(); wasPlaying = false; }
  };
  if (document.getElementById("closePopup")) document.getElementById("closePopup").addEventListener("click", closePopup);

  // General Overlay Click Closure
  popupOverlay.addEventListener("click", () => {
    popup.style.display = "none";
    settingsPopup.style.display = "none";
    popupOverlay.style.display = "none";
    if (wasPlaying) { audio.play(); wasPlaying = false; }
  });

  // Controls UI Action
  playBtn.addEventListener("click", () => {
    if (isPopupActive()) return; 
    if (audio.paused) {
      audio.play();
      playBtn.innerHTML = '<img src="icon/play-pause.svg" alt="Pause" width="32" height="32">';
    } else {
      audio.pause();
      playBtn.innerHTML = '<img src="icon/play-button.svg" alt="Play" width="32" height="32">';
    }
  });

  progressBar.addEventListener("input", () => {
    if (isPopupActive()) { progressBar.value = audio.currentTime; return; }
    audio.currentTime = progressBar.value;
  });

  nextBtn.addEventListener("click", () => {
    if (isPopupActive()) return; 
    let index = getCurrentPhraseIndex();
    if (index < phrases.length - 1) audio.currentTime = parseFloat(phrases[index + 1].dataset.start);
  });

  prevBtn.addEventListener("click", () => {
    if (isPopupActive()) return; 
    let index = getCurrentPhraseIndex();
    if (index > 0) audio.currentTime = parseFloat(phrases[index - 1].dataset.start);
  });

  langBtn.addEventListener("click", () => {
    if (currentActive) currentActive.classList.remove("active");
    currentActive = null; // Clear tracking cache
  
    if (langBtn.textContent === "GR") {
      langBtn.textContent = "EN";
      text.style.display = "none";
      textEn.style.display = "block";
    } else {
      langBtn.textContent = "GR";
      text.style.display = "block";
      textEn.style.display = "none";
    }
  });

  // Keyboard Navigation Bindings
  document.addEventListener("keydown", (e) => {
    if (isPopupActive()) return;
    if (["Space", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    if (e.code === "Space") {
      if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<img src="icon/play-pause.svg" alt="Pause" width="32" height="32">';
      } else {
        audio.pause();
        playBtn.innerHTML = '<img src="icon/play-button.svg" alt="Play" width="32" height="32">';
      }
    }
    if (e.code === "ArrowRight") {
      let index = getCurrentPhraseIndex();
      if (index < phrases.length - 1) audio.currentTime = parseFloat(phrases[index + 1].dataset.start);
    }
    if (e.code === "ArrowLeft") {
      let index = getCurrentPhraseIndex();
      if (index > 0) audio.currentTime = parseFloat(phrases[index - 1].dataset.start);
    }
  });

  // Save current listening position on pause or track scrubbing
  audio.addEventListener("pause", () => {
    localStorage.setItem("reader_currentTime", audio.currentTime);
  });

  progressBar.addEventListener("change", () => {
    localStorage.setItem("reader_currentTime", audio.currentTime);
  });

  // Backup: Save time if they close the tab or navigate away while playing
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("reader_currentTime", audio.currentTime);
  });
  
  // ==========================================
  // SLIDERS & CONTROLS OPERATIONAL EVENT LISTENERS
  // ==========================================

  speedControl.addEventListener("input", () => {
    const speed = parseFloat(speedControl.value);
    audio.playbackRate = speed;
    speedValue.textContent = speed.toFixed(1) + "x";
    localStorage.setItem("reader_playerSpeed", speed); // Save preference
  });

  fontControl.addEventListener("input", () => {
    const size = fontControl.value + "px";
    
    // Update the Greek text size
    if (text) text.style.fontSize = size;
    
    // Update the English text size simultaneously!
    if (textEn) textEn.style.fontSize = size;
    
    fontValue.textContent = size;
    localStorage.setItem("reader_fontSize", fontControl.value); // Save preference
  });

  // Font Family Operational Event Listener
  if (fontFamilyControl) {
    fontFamilyControl.addEventListener("change", () => {
      if (text) {
        text.style.fontFamily = fontFamilyControl.value;
        localStorage.setItem("reader_fontFamily", fontFamilyControl.value); // Save preference
      }
    });
  }
  
  volumeControl.addEventListener("input", () => {
    audio.volume = volumeControl.value;
    volumeValue.textContent = Math.round(volumeControl.value * 100) + "%";
    localStorage.setItem("reader_volume", volumeControl.value); // Save preference
  });

  // Settings Actions
  if (homeBtn) homeBtn.addEventListener("click", () => console.log("Home clicked"));

  settingsBtn.addEventListener("click", () => {
    wasPlaying = !audio.paused;
    audio.pause();
    settingsPopup.style.display = "block";
    popupOverlay.style.display = "block";
  });

  closeSettings.addEventListener("click", () => {
    settingsPopup.style.display = "none";
    popupOverlay.style.display = "none";
    if (wasPlaying) { audio.play(); wasPlaying = false; }
  });
});
