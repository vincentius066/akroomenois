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
      <button id="homeBtn"><img src="icon/arrow-left.svg" alt="Play" width="32" height="32"></button>
      <div id="title">${document.title}(test 6)</div>
      <div id="moreMenuWrapper" style="display: flex; align-items: center; flex-direction: row;">
        <div id="extraActionsGroup" style="display: none; align-items: center; gap: 10px; margin-right: 10px;">
          <button id="freqBtn" title="Word Frequency" style="cursor: pointer; z-index: 10;"><img src="icon/insights.svg" alt="Settings" width="32" height="32"></button>
          <button id="contentsBtn" title="Contents" style="cursor: pointer; z-index: 10;"><img src="icon/layout-list.svg" alt="Settings" width="32" height="32"></button>
          <button id="settingsBtn" title="Settings" style="cursor: pointer; z-index: 10;"><img src="icon/options.svg" alt="Settings" width="32" height="32"></button>
        </div>
        
        <button id="moreBtn" style="cursor: pointer; z-index: 10;"><img src="icon/more-vertical-alt.svg" alt="More Options" width="32" height="32"></button>
      </div>
    </div>

    <div id="popup">
      <button id="closePopup">✕</button>
      <div id="popupContent"></div>
    </div>
    <div id="popupOverlay"></div>

    <div id="advancedFontPopup">
      <button id="closeAdvancedFont">✕</button>
      <h3>Advanced Font Settings</h3>
      <label>Kappa: 
         <select id="kappaStyleControl">
           <option value="standard">κ (Standard)</option>
           <option value="cursive">ϰ (Cursive)</option>
         </select>
      </label>
      <br><br>
      <label>Pi: 
         <select id="piStyleControl">
           <option value="standard">π (Standard)</option>
           <option value="cursive">ϖ (Cursive)</option>
         </select>
      </label>
      <br><br>
      <label>Sigma: 
        <select id="sigmaStyleControl">
          <option value="standard">σ/ς (Standard)</option>
          <option value="lunate">ϲ (Lunate)</option>
        </select>
      </label>
      <br><br>
      <label>Stigma: 
         <select id="stigmaStyleControl">
           <option value="standard">στ (Standard)</option>
           <option value="monograph">ϛ (Monograph)</option>
         </select>
      </label>
    </div>

    <div id="settingsPopup">
      <button id="closeSettings">✕</button>
      <h3>Settings</h3>
      <h5 style="text-align: center;">UI</h5>
      <label>Time Display:
        <button id="toggle-greek-time" class="settings-btn">
          <span id="greek-time-status">Greek</span>
        </button>
      </label>
      <br><br>
      <label>Viewing Mode:
        <button id="fullscreenBtn" class="settings-btn" style="cursor: pointer;">Fullscreen</button>
      </label>
      <h5 style="text-align: center;">Text</h5>
      <label>Font: 
        <select id="fontFamilyControl">
          <option value="SBL">SBL</option>
          <option value="EB Garamond">EB Garamond</option>
          <option value="Anaktoria">Anaktoria</option>
        </select>
        <button id="advancedFontBtn" class="settings-btn" style="cursor: pointer;">Advanced</button>
      </label>
      <br><br>
      <label>Size: <input type="range" id="fontControl" step="1"><span id="fontValue"></span></label>
      <h5 style="text-align: center;">Audio</h5>
      <label>Speed: <input type="range" id="speedControl" step="0.1"><span id="speedValue"></span></label>
      <br><br>
      <label for="volumeControl">Volume:</label><input type="range" id="volumeControl" step="0.01"><span id="volumeValue"></span>
    </div>
        
    <div id="playerBar">
      <button id="prevBtn"><img src="icon/play-backwards.svg" alt="Backward" width="32" height="32"></button>
      <button id="playBtn"><img src="icon/play-button.svg" alt="Play" width="32" height="32"></button>
      <button id="nextBtn"><img src="icon/play-forwards.svg" alt="Forward" width="32" height="32"></button>
      <input type="range" id="progressBar" value="0" min="0" step="0.1">
      <span id="timeDisplay">0:00 / 0:00</span>
      <button id="langBtn">GR</button>
    </div>
  `;

  // Inject the interface into the body of the page
  document.body.insertAdjacentHTML('beforeend', interfaceHTML);

  // ... ALL THE REST OF YOUR EXISTING SCRIPT.JS CODE STAYS EXACTLY THE SAME BELOW THIS ...
  
  // Grab all DOM elements

  const text = document.getElementById("text");
  const textEn = document.getElementById("text_en");
  const audio = document.getElementById("audio");
  const phrases = document.querySelectorAll("#text > span.phrase");
  const words = document.querySelectorAll("#text span.word");
  const phrasesEn = document.querySelectorAll("#text_en > span.phrase_en");
  const settingsPopup = document.getElementById("settingsPopup");
  const advancedFontPopup = document.getElementById("advancedFontPopup");
  const closeSettings = document.getElementById("closeSettings");
  const closeAdvancedFont = document.getElementById("closeAdvancedFont");
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
  const advancedFontBtn = document.getElementById("advancedFontBtn");
  const speedControl = document.getElementById("speedControl");
  const speedValue = document.getElementById("speedValue");
  const fontControl = document.getElementById("fontControl");
  const fontValue = document.getElementById("fontValue");
  const volumeControl = document.getElementById("volumeControl");
  const volumeValue = document.getElementById("volumeValue");
  const fontFamilyControl = document.getElementById("fontFamilyControl");
  const timeDisplay = document.getElementById("timeDisplay");
  const notes = document.querySelectorAll(".note-marker");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const toggleBtn = document.getElementById('toggle-greek-time');
  const statusText = document.getElementById('greek-time-status');
  const moreBtn = document.getElementById("moreBtn");
  const extraActionsGroup = document.getElementById("extraActionsGroup");
  const contentsBtn = document.getElementById("contentsBtn");
  const freqBtn = document.getElementById("freqBtn");
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const sigmaStyleControl = document.getElementById("sigmaStyleControl");
  const piStyleControl = document.getElementById("piStyleControl");
  const kappaStyleControl = document.getElementById("kappaStyleControl");
  const stigmaStyleControl = document.getElementById("stigmaStyleControl");

  let wasPlaying = false;
  let currentActive = null;
  let currentSection = null;
  let dictAudioInstance = null;
  let useGreekNumerals = localStorage.getItem("reader_useGreekNumerals") === "true";

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

  // 5. Greek Numeral Time Display Preference
  if (statusText) {
    statusText.textContent = useGreekNumerals ? 'Standard' : 'Greek';
  }
  
  // Helper check for active popups
  function isPopupActive() {
    return (popup && popup.style.display === "block") || (settingsPopup && settingsPopup.style.display === "block");
  }

  // Viewport checking functions for autoscroll
  function isOutOfView(el) {
    const rect = el.getBoundingClientRect();
    const topOffset = 80;   
    const bottomOffset = window.innerHeight - 100; 
    return rect.top < topOffset + 40 || rect.bottom > bottomOffset - 40;
  }

  function scrollToTop(el) {
  window.scrollTo({
    top: window.scrollY + el.getBoundingClientRect().top - 80, 
    behavior: "smooth" 
  });

}

  // instantaneous jumping
  function jumpToTop(el) {
  window.scrollTo({
    top: window.scrollY + el.getBoundingClientRect().top - 80,
    behavior: "auto" // "auto" means immediate snap, no smooth sliding
  });
}

  function checkAndCorrectWordVisibility() {
    const activeWord = document.querySelector("#text span.word.active");
    if (!activeWord) return;
    if (isOutOfView(activeWord)) {
    scrollToTop(activeWord);
    }
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

  function getCurrentWordIndex() {
    const time = audio.currentTime;
    
    for (let i = 0; i < words.length; i++) {
      const start = parseFloat(words[i].dataset.wordStart);
      const end = parseFloat(words[i].dataset.wordEnd);
      
      // Check if the narrator is actively pronouncing this specific word
      if (time >= start && time <= end) {
        return i;
      }
    }
    return -1;
  }

  // makes it so the highlight isnt lost when using the english translation
  function syncVisibleText(useInstantJump = false) {
    const time = audio.currentTime;
    const isGreekVisible = (text.style.display !== "none");
    const activePhrasesList = isGreekVisible ? phrases : phrasesEn;
  
    activePhrasesList.forEach((phrase, index) => {
      const start = parseFloat(phrase.dataset.start);
      const nextStart = index < activePhrasesList.length - 1 ? parseFloat(activePhrasesList[index + 1].dataset.start) : Infinity;
  
      if (time >= start && time < nextStart) {
        if (currentActive !== phrase) {
          if (currentActive) currentActive.classList.remove("active");
          
          currentActive = phrase;
          phrase.classList.add("active");
          
          // --- CONTROL THE SCROLLING BEHAVIOR HERE ---
          if (useInstantJump) {
            // Rule 1: Toggling languages? Snap instantly to the top right now.
            jumpToTop(phrase);
          } else if (isGreekVisible) {
            // Rule 2: Normal Greek reading? Only scroll smoothly if it gets out of sight!
            if (isOutOfView(phrase)) {
              scrollToTop(phrase);
            }
          } else {
            // Rule 3: Normal English reading? Smoothly pin it to the top.
            scrollToTop(phrase);
          }
        }
      } else {
        phrase.classList.remove("active");
      }
    });
  }

  //Greek Numeral Timeline Track
  function convertToGreekNumerals(num) {
    if (num === 0) return '&nbsp;Ο';
    
    const tens = ['&nbsp;', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ϙ'];
    const ones = ['&nbsp;', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ϝ', 'Ζ', 'Η', 'Θ'];
      
    let result = '';
    result += tens[Math.floor(num / 10)];
    result += ones[num % 10];
      
    return result;
  }
  
  // Example format helper for your time string (e.g., "08:53" -> "Η : ΝΓ")
  function formatAudioTime(currentTime, useGreek) {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    
    if (useGreek) {
      return `${convertToGreekNumerals(minutes)} : ${convertToGreekNumerals(seconds)}`;
    } else {
      // Standard padStart format: "08 : 53"
      const displayMin = String(minutes).padStart(2, '0');
      const displaySec = String(seconds).padStart(2, '0');
      return `${displayMin} : ${displaySec}`;
    }
  }

  toggleBtn.addEventListener('click', () => {
    useGreekNumerals = !useGreekNumerals;

    localStorage.setItem("reader_useGreekNumerals", useGreekNumerals);
    
    // Update button text indicator
    statusText.textContent = useGreekNumerals ? 'Standard' : 'Greek';
    
    // Force an immediate UI redraw if audio is paused/playing
    if (audio) {
      timeDisplay.innerHTML = formatAudioTime(audio.currentTime, useGreekNumerals);
      }
  });

  // Inside your existing audio 'timeupdate' event listener, just swap to this:
  audio.addEventListener('timeupdate', () => {
    timeDisplay.innerHTML = formatAudioTime(audio.currentTime, useGreekNumerals);
  });
  
  //End of Greek numeral Timeline Track
  
  // Universal Highlight & Timeline Track
  audio.addEventListener("timeupdate", () => {
    progressBar.value = audio.currentTime;
    
    // Track if the phrase changes during this tick
    const oldActivePhrase = currentActive;
    
    syncVisibleText(false); // Run default phrase alignment mechanics
    
    const isGreekVisible = (text.style.display !== "none");
    
    // Word Highlight Handling (Only applies when reading the Greek text layout)
    if (isGreekVisible) {
      const currentWordIndex = getCurrentWordIndex();
      
      // Clear out the previous word highlight
      const previousActiveWord = document.querySelector("#text span.word.active");
      if (previousActiveWord) {
        previousActiveWord.classList.remove("active");
      }
      
      // Highlight the active playing word
      if (currentWordIndex !== -1) {
        words[currentWordIndex].classList.add("active");
      }
    }
  
    // Check if a brand new phrase has been activated during this update tick
    const isNewPhraseStarted = (currentActive !== oldActivePhrase && currentActive !== null);
  
    if (isGreekVisible) {
      if (isNewPhraseStarted) {
        // A new paragraph/phrase element just started. 
        // Let syncVisibleText handle its scrolling, DO NOT run word correction on this frame.
      } else {
        // Only run word visibility corrections if we are midway through reading an active line
        // and it breaks or wraps onto a new line downward.
        checkAndCorrectWordVisibility();
      }
    }
    
    // Update the clock string dynamically
    if (timeDisplay) {
      timeDisplay.innerHTML = formatAudioTime(audio.currentTime, useGreekNumerals);
    }
  });

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
  
    const formattedSecs = secs < 10 ? "0" + secs : secs;
  
    if (hrs > 0) {
      const formattedMins = mins < 10 ? "0" + mins : mins;
      return `${hrs}:${formattedMins}:${formattedSecs}`;
    }
    
    return `${mins}:${formattedSecs}`;
  }

  // Handle Clicking Note Markers (With Auto-URL Linking & Smart Punctuation Cleansing)
  notes.forEach((note) => {
    note.addEventListener("click", (e) => {
      e.stopPropagation(); 
      if (isPopupActive()) return;

      wasPlaying = !audio.paused; 
      audio.pause();

      let noteContent = note.dataset.note || "No note data available.";

      // Regex to find URLs starting with http://, https://, or www.
      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
      
      // Automatically wrap the raw URL inside a clickable anchor tag
      noteContent = noteContent.replace(urlRegex, (matchedUrl) => {
        // 1. Separate trailing punctuation (like text-ending periods or commas) from the link
        const punctuationMatch = matchedUrl.match(/[.,;:!)]+$/);
        let trailingPunctuation = "";
        let cleanUrl = matchedUrl;

        if (punctuationMatch) {
          trailingPunctuation = punctuationMatch[0];
          cleanUrl = matchedUrl.slice(0, -trailingPunctuation.length);
        }

        // 2. Build the legitimate target destination link safely
        const hyperLink = cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`;
        
        // 3. Insert &shy; right after forward slashes so long web links wrap cleanly on lines
        const breakableUrlText = cleanUrl.replace(/\//g, "/&shy;");

        // 4. Return the anchor element, keeping the trailing dot safely outside the <a> tag
        return `<a href="${hyperLink}" target="_blank" style="color: #007bff; text-decoration: underline; word-break: break-word;">${breakableUrlText}</a>${trailingPunctuation}`;
      });

      // Inject the processed text safely into your popup window
      popupContent.innerHTML = `
        <div style="font-family: inherit; text-align: justify; font-size: 0.9em; padding: 10px; line-height: 1.5;">
          <h3 style="margin-top: 0; color: #a52a2a;">Note</h3>
          <p>${noteContent}</p>
        </div>
      `;

      popup.style.display = "block";
      popupOverlay.style.display = "block";
    });
  });

  function setupDictionaryAudioButton() {
    const speakBtn = document.getElementById("dictSpeakBtn");
    if (!speakBtn) return;

    speakBtn.addEventListener("click", () => {
      if (dictAudioInstance) {
        dictAudioInstance.pause();
        dictAudioInstance = null;
      }

      const start = parseFloat(speakBtn.dataset.start);
      let end = parseFloat(speakBtn.dataset.end);

      if (isNaN(start) || isNaN(end) || start === 0) return;

      const mainAudioSource = audio.querySelector("source");
      const audioUrl = mainAudioSource ? mainAudioSource.src : audio.src;

      if (!audioUrl) return;

      dictAudioInstance = new Audio(audioUrl);
      
      if (speedControl) {
        dictAudioInstance.playbackRate = parseFloat(speedControl.value);
      }

      dictAudioInstance.currentTime = start;
      dictAudioInstance.play();

      // High-Precision Engine Loop (Checks timestamps up to 120 times a second)
      function checkPrecisionTimeline() {
        if (!dictAudioInstance) return; // Stop loop if cleaned up

        if (dictAudioInstance.currentTime >= end) {
          dictAudioInstance.pause();
          dictAudioInstance = null;
        } else {
          // Keep looping dynamically while the audio tracks forward
          requestAnimationFrame(checkPrecisionTimeline);
        }
      }

      // Kick off our precision monitor immediately upon playback initiation
      dictAudioInstance.addEventListener("play", () => {
        requestAnimationFrame(checkPrecisionTimeline);
      });
    });
  }

 // --- AUTOMATIC SYSTEM SYNCED DARK MODE TOGGLE ---
  const savedTheme = localStorage.getItem("theme");
  
  // Use the saved preference if it exists, otherwise check the device's system settings
  //if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    //document.documentElement.setAttribute("data-theme", "dark");
    //if (themeToggleBtn) themeToggleBtn.textContent = "Toggle Light Mode ☀️";
  //} else {
    //document.documentElement.setAttribute("data-theme", "light");
    //if (themeToggleBtn) themeToggleBtn.textContent = "Toggle Dark Mode 🌙";
 // }

  // Handle click events on your manual override toggle button
 // if (themeToggleBtn) {
    //themeToggleBtn.addEventListener("click", () => {
      //const currentTheme = document.documentElement.getAttribute("data-theme");
      //const targetTheme = currentTheme === "dark" ? "light" : "dark";

      //document.documentElement.setAttribute("data-theme", targetTheme);
      //localStorage.setItem("theme", targetTheme);

      //if (targetTheme === "dark") {
        //themeToggleBtn.textContent = "Toggle Light Mode ☀️";
      //} else {
        //themeToggleBtn.textContent = "Toggle Dark Mode 🌙";
      //}
    //});
  //}

  // Listen for device-level system changes in real-time (only updates if user hasn't explicitly overridden it)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      const systemTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", systemTheme);
      if (themeToggleBtn) {
        themeToggleBtn.textContent = systemTheme === "dark" ? "Toggle Light Mode ☀️" : "Toggle Dark Mode 🌙";
      }
    }
  });

//==========================================
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
  words.forEach((word) => {
    word.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isPopupActive()) return;
      const phrase = word.closest("span.phrase");
      if (phrase && phrase.classList.contains("active")) {
        wasPlaying = !audio.paused; 
        audio.pause();
        const wordText = word.textContent;

        // 1. Create a totally isolated variable for the dictionary display
        let dictionaryLookupTerm = word.textContent;
        // 2. Normalize lunate sigmas to standard mid-sigmas
        dictionaryLookupTerm = dictionaryLookupTerm.replace(/ϲ/g, "σ").replace(/Ϲ/g, "Σ").replace(/ϖ/g, "π").replace(/ϰ/g, "κ").replace(/ϛ/g, "στ").replace(/Ϛ/g, /Στ/);
        // 3. Flip to a final sigma ONLY if it sits at the end of the clean word string
        if (dictionaryLookupTerm.endsWith("σ")) {
          dictionaryLookupTerm = dictionaryLookupTerm.slice(0, -1) + "ς";
        }

        const start = word.dataset.wordStart || "0";
        const end = word.dataset.wordEnd || "0";
        const hasValidTiming = (
          typeof start === 'string' && 
          typeof end === 'string' && 
          start.trim() !== "" && 
          end.trim() !== "" &&
          start.toLowerCase().trim() !== "n/a" &&
          end.toLowerCase().trim() !== "n/a"
        );
        const audioButtonHTML = hasValidTiming 
          ? `<button id="dictSpeakBtn" data-start="${start}" data-end="${end}" style= cursor: pointer;">🔊</button>` 
          : '';
        popupContent.innerHTML = `<p><strong>Word:</strong> ${dictionaryLookupTerm} ${audioButtonHTML}<br><br><strong>Lemma:</strong><br><br><strong>Word Type:</strong><br><br><strong>Grammar:</strong></p>`;
        popup.style.display = "block";
        popupOverlay.style.display = "block";
        setupDictionaryAudioButton();
      } else if (phrase) {
        audio.currentTime = parseFloat(phrase.dataset.start);
      }
    });
  });

  // Dictionary Popup Close Actions
  const closePopup = () => {
    if (dictAudioInstance) {
      dictAudioInstance.pause();
      dictAudioInstance = null;
    }
    popup.style.display = "none";
    popupOverlay.style.display = "none";
    if (wasPlaying) { audio.play(); wasPlaying = false; }
  };
  if (document.getElementById("closePopup")) document.getElementById("closePopup").addEventListener("click", closePopup);

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
    // 1. Completely clear out old highlights across both languages
    if (currentActive) currentActive.classList.remove("active");
    phrases.forEach(p => p.classList.remove("active"));
    phrasesEn.forEach(p => p.classList.remove("active"));
    currentActive = null; 

    // 2. Toggle the visibility layouts
    if (langBtn.textContent === "GR") {
      langBtn.textContent = "EN";
      text.style.display = "none";
      textEn.style.display = "block";
    } else {
      langBtn.textContent = "GR";
      text.style.display = "block";
      textEn.style.display = "none";
    }

    // 3. Force an instantaneous view alignment and re-highlight, even if paused!
    syncVisibleText(true); 
    
    // 4. EXCEPTION: When RETURNING to Greek, find the first phrase of the current section
    if (langBtn.textContent === "GR" && currentActive) {
      const currentSecNum = currentActive.dataset.section;
      
      if (currentSecNum) {
        // Find the absolute first Greek phrase assigned to this data-section
        const firstPhraseOfSection = Array.from(phrases).find(p => p.dataset.section === currentSecNum);
        
        if (firstPhraseOfSection) {
          jumpToTop(firstPhraseOfSection); // Snap the paragraph beginning to the top line!
        } else {
          jumpToTop(currentActive); // Fallback safety snap
        }
      } else {
        jumpToTop(currentActive); // Fallback if no section data exists (like the title)
      }
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
  // SIGMA GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  =====
  if (sigmaStyleControl) {
    const greekWordsList = document.querySelectorAll("#text span.word");

    const updateDocumentSigmaStyle = (style) => {
      greekWordsList.forEach(wordElement => {
        let currentText = wordElement.textContent.trim();
        
        if (style === "lunate") {
          wordElement.textContent = currentText.replace(/σ/g, "ϲ").replace(/ς/g, "ϲ").replace(/Σ/g, "Ϲ");
        } else {
          let restoredText = currentText.replace(/ϲ/g, "σ").replace(/Ϲ/g, "Σ");
          if (restoredText.endsWith("σ")) {
            restoredText = restoredText.slice(0, -1) + "ς";
          }
          wordElement.textContent = restoredText;
        }
      });
    };

    const savedSigmaStyle = localStorage.getItem("reader_sigmaStyle") || "standard";
    sigmaStyleControl.value = savedSigmaStyle;
    if (savedSigmaStyle === "lunate") {
      updateDocumentSigmaStyle("lunate");
    }

    sigmaStyleControl.addEventListener("change", () => {
      const selectedStyle = sigmaStyleControl.value;
      localStorage.setItem("reader_sigmaStyle", selectedStyle);
      updateDocumentSigmaStyle(selectedStyle);
    });
  }
  =====
  =====
  if (piStyleControl) {
    const greekWordsList = document.querySelectorAll("#text span.word");

    const updateDocumentPiStyle = (style) => {
      greekWordsList.forEach(wordElement => {
        let currentText = wordElement.textContent.trim();
        
        if (style === "cursive") {
          wordElement.textContent = currentText.replace(/π/g, "ϖ");
        } else {
          let restoredText = currentText.replace(/ϖ/g, "π");
          wordElement.textContent = restoredText;
        }
      });
    };

    const savedPiStyle = localStorage.getItem("reader_piStyle") || "standard";
    piStyleControl.value = savedPiStyle;
    if (savedPiStyle === "cursive") {
      updateDocumentPiStyle("cursive");
    }

    piStyleControl.addEventListener("change", () => {
      const selectedStyle = piStyleControl.value;
      localStorage.setItem("reader_piStyle", selectedStyle);
      updateDocumentPiStyle(selectedStyle);
    });
  }
  =====
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
    
    if (text) text.style.fontSize = size;
    if (textEn) textEn.style.fontSize = size;
    
    fontValue.textContent = size;
    localStorage.setItem("reader_fontSize", fontControl.value);
  
    const activePhrase = document.querySelector(".phrase_en.active");
    if (activePhrase) {
      const linesCount = getLineCount(activePhrase);
      console.log(`The active paragraph is taking up exactly ${linesCount} lines right now.`);
    }
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

  // Handle toggling the action menu visibility
  if (moreBtn && extraActionsGroup) {
    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = extraActionsGroup.style.display === "none" || extraActionsGroup.style.display === "";
      
      if (isHidden) {
        extraActionsGroup.style.display = "flex";
      } else {
        extraActionsGroup.style.display = "none";
      }
    });
  }

  // Placeholder listeners for your new feature pathways
  if (contentsBtn) {
    contentsBtn.addEventListener("click", () => {
      console.log("Table of Contents opened!");
      // Your table of contents modal or view logic goes here
    });
  }

  if (freqBtn) {
    freqBtn.addEventListener("click", () => {
      console.log("Word Frequency metrics opened!");
      // Your niche philological vocabulary analyzer logic goes here
    });
  }

  // Fullscreen Mode Toggle Listener
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
          .then(() => {
            fullscreenBtn.textContent = "Windowed";
            // Prevent the elastic pull-down boundary behavior on mobile
            document.documentElement.style.overscrollBehavior = "contain";
            document.body.style.overscrollBehavior = "contain";
          })
          .catch((err) => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
      } else {
        document.exitFullscreen();
        fullscreenBtn.textContent = "Fullscreen";
        // Restore standard scrolling behavior
        document.documentElement.style.overscrollBehavior = "auto";
        document.body.style.overscrollBehavior = "auto";
      }
    });

    // Handle standard fallbacks if the user hits the system 'Esc' key or native gestures
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        fullscreenBtn.textContent = "Fullscreen";
        document.documentElement.style.overscrollBehavior = "auto";
        document.body.style.overscrollBehavior = "auto";
      } else {
        fullscreenBtn.textContent = "Windowed";
        document.documentElement.style.overscrollBehavior = "contain";
        document.body.style.overscrollBehavior = "contain";
      }
    });
  }
  
  // ==========================================
  // INTEGRATED POPUP ACTION ROUTERS
  // ==========================================
  if (homeBtn) homeBtn.addEventListener("click", () => console.log("Home clicked"));

  // Opening Main Settings
  settingsBtn.addEventListener("click", () => {
    wasPlaying = !audio.paused;
    audio.pause();
    settingsPopup.style.display = "block";
    popupOverlay.style.display = "block";
  });

  // Handoff: Settings -> Advanced Font Panel
  advancedFontBtn.addEventListener("click", () => {
    // Hide settings panel temporarily so they don't visually overlap
    settingsPopup.style.display = "none";
    // Open the advanced menu layer
    advancedFontPopup.style.display = "block";
  });

  // Handoff Back: Advanced Font Panel -> Settings
  if (closeAdvancedFont) {
    closeAdvancedFont.addEventListener("click", () => {
      // Hide advanced panel
      advancedFontPopup.style.display = "none";
      // Re-reveal standard settings smoothly without toggling audio playback
      settingsPopup.style.display = "block";
    });
  }

  // Closing Main Settings entirely (Resumes Audio if it was playing)
  closeSettings.addEventListener("click", () => {
    settingsPopup.style.display = "none";
    popupOverlay.style.display = "none";
    if (wasPlaying) { audio.play(); wasPlaying = false; }
  });

  // Overlay Click: Emergency Backup Close-All
  popupOverlay.addEventListener("click", () => {
    popup.style.display = "none";
    settingsPopup.style.display = "none";
    advancedFontPopup.style.display = "none"; // Make sure this shuts off too
    popupOverlay.style.display = "none";
    if (wasPlaying) { audio.play(); wasPlaying = false; }
  });
  
  // ==========================================
  // MASTER CLASSICAL GREEK HYPHENATOR
  // ==========================================
  const ALL_GREEK_VOWELS = ["α", "ε", "ι", "ο", "υ", "ᾱ", "η", "ῑ", "ω", "ῡ", "αι", "αυ", "ει", "ευ", "οι", "ου", "υι", "ᾳ", "ᾱυ", "ῃ", "ηυ", "ῳ", "ωυ", "ῡι", "ϊ", "ϋ", "ἀ", "ἐ", "ἰ", "ὀ", "ὐ", "ᾱ̓", "ἠ", "ῑ̓", "ὠ", "ῡ̓", "αἰ", "αὐ", "εἰ", "εὐ", "οἰ", "οὐ", "υἰ", "ᾀ", "ᾱὐ", "ᾐ", "ηὐ", "ᾠ", "ωὐ", "ῡἰ", "ἁ", "ἑ", "ἱ", "ὁ", "ὑ", "ᾱ̔", "ἡ", "ῑ̔", "ὡ", "ῡ̔", "αἱ", "αὑ", "εἱ", "εὑ", "οἱ", "οὑ", "υἱ", "ᾁ", "ᾱὑ", "ᾑ", "ηὑ", "ᾡ", "ωὑ", "ῡἱ", "ά", "έ", "ί", "ό", "ύ", "ᾱ́", "ή", "ῑ́", "ώ", "ῡ́", "αί", "αύ", "εί", "εύ", "οί", "ού", "υί", "ᾴ", "ᾱύ", "ῄ", "ηύ", "ῴ", "ωύ", "ῡί", "ΐ", "ΰ", "ἄ", "ἔ", "ἴ", "ὄ", "ὔ", "ᾱ̓́", "ἤ", "ῑ̓́", "ὤ", "ῡ̓́", "αἴ", "αὔ", "εἴ", "εὔ", "οἴ", "οὔ", "υἴ", "ᾄ", "ᾱὔ", "ᾔ", "ηὔ", "ᾤ", "ωὔ", "ῡἴ", "ἅ", "ἕ", "ἵ", "ὅ", "ὕ", "ᾱ̔́", "ἥ", "ῑ̔́", "ὥ", "ῡ̔́", "αἵ", "αὕ", "εἵ", "εὕ", "οἵ", "οὕ", "υἵ", "ᾅ", "ᾱὕ", "ᾕ", "ηὕ", "ᾥ", "ωὕ", "ῡἵ", "ὰ", "ὲ", "ὶ", "ὸ", "ὺ", "ᾱ̀", "ὴ", "ῑ̀", "ὼ", "ῡ̀", "αὶ", "αὺ", "εὶ", "εὺ", "οὶ", "οὺ", "υὶ", "ᾲ", "ᾱὺ", "ῂ", "ηὺ", "ῲ", "ωὺ", "ῡὶ", "ῒ", "ῢ", "ἂ", "ἒ", "ἲ", "ὂ", "ὒ", "ᾱ̓̀", "ἢ", "ῑ̓̀", "ὢ", "ῡ̓̀", "αἲ", "αὒ", "εἲ", "εὒ", "οἲ", "οὒ", "υἲ", "ᾂ", "ᾱὒ", "ᾒ", "ηὒ", "ᾢ", "ωὒ", "ῡἲ", "ἃ", "ἓ", "ἳ", "ὃ", "ὓ", "ᾱ̔̀", "ἣ", "ῑ̔̀", "ὣ", "ῡ̔̀", "αἳ", "αὓ", "εἳ", "εὓ", "οἳ", "οὓ", "υἳ", "ᾃ", "ᾱὓ", "ᾓ", "ηὓ", "ᾣ", "ωὓ", "ῡἳ", "ᾶ", "ῆ", "ῗ", "ῶ", "ῧ", "αῖ", "αῦ", "εῖ", "εῦ", "οῖ", "οῦ", "υῖ", "ᾷ", "ᾱῦ", "ῇ", "ηῦ", "ῷ", "ωῦ", "ῡῖ", "ἆ", "ἦ", "ἶ", "ὦ", "ὖ", "αἶ", "αὖ", "εἶ", "εὖ", "οἶ", "οὖ", "υἶ", "ᾆ", "ᾱὖ", "ᾖ", "ηὖ", "ᾦ", "ωὖ", "ῡἶ", "ἇ", "ἧ", "ἷ", "ὧ", "ὗ", "αἷ", "αὗ", "εἷ", "εὗ", "οἷ", "οὗ", "υἷ", "ᾇ", "ᾱὗ", "ᾗ", "ηὗ", "ᾧ", "ωὗ", "ῡἷ"];

  // Sort by length descending to match clusters like "αἷ" completely before breaking them into "α"
  const sortedVowels = [...ALL_GREEK_VOWELS].sort((a, b) => b.length - a.length);

  function tokenizeGreekWord(word) {
    let tokens = [];
    let i = 0;
    
    while (i < word.length) {
      let matched = false;
      
      // Try to find the longest vowel/diphthong match from your list first
      for (const vowel of sortedVowels) {
        if (word.startsWith(vowel, i)) {
          tokens.push({ type: 'V', text: vowel });
          i += vowel.length;
          matched = true;
          break;
        }
      }
      
      // If it's not a vowel cluster, treat it as a consonant/punctuation block
      if (!matched) {
        tokens.push({ type: 'C', text: word[i] });
        i++;
      }
    }
    return tokens;
  }

  function hyphenateGreekWord(word) {
    // Strip trailing punctuation details for linguistic checking, restore later
    const cleanWord = word.replace(/[.,·;:’'’\"\(\)]/g, "");
    const tokens = tokenizeGreekWord(cleanWord);
    let output = "";
    
    for (let i = 0; i < tokens.length; i++) {
      output += tokens[i].text;
      
      // Rule Core: Core Classical Syllabification (V-C-V pattern)
      if (i < tokens.length - 2) {
        const current = tokens[i];
        const next = tokens[i + 1];
        const nextNext = tokens[i + 2];
        
        if (current.type === 'V' && next.type === 'C' && nextNext.type === 'V') {
          // Do not drop a soft hyphen if it is a standalone vowel modifier or punctuation mark
          if (["'", "’", "·"].includes(next.text)) continue;
          output += "&shy;";
        }
        // Split between identical double consonants (e.g., ν-ν, λ-λ, μ-μ)
        else if (current.type === 'C' && next.type === 'C' && current.text.toLowerCase() === next.text.toLowerCase()) {
          output += "&shy;";
        }
      }
    }
    
    // Put back any trailing punctuation stripped from the original outer word string
    const punctuationMatch = word.match(/[.,·;:’'’\"\(\)]+$/);
    if (punctuationMatch) {
      output += punctuationMatch[0];
    }
    const leadingPunctuation = word.match(/^[(\"’']+/);
    if (leadingPunctuation) {
      output = leadingPunctuation[0] + output;
    }
    
    return output;
  }

  // Execute across the layout
  const greekWords = document.querySelectorAll("#text span.word");
  greekWords.forEach(wordElement => {
    // Preserve internal tags/notes if any, but replace clean text nodes safely
    const originalText = wordElement.textContent.trim();
    if (originalText.length > 0) {
      wordElement.innerHTML = hyphenateGreekWord(originalText);
    }
  });
  
});
