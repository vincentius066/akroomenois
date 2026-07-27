// ==========================================
// 1. GLOBAL WEBSITE CONFIGURATION
// ==========================================
const SITE_SETTINGS = {
  fontSize:    { min: "20",  max: "100", default: "70"  },
  playerSpeed: { min: "0.5", max: "2",   default: "1"   },
  volume:      { min: "0",   max: "1",   default: "1"   }
};

const SEEK_TOLERANCE = 0.15;
const SEEK_EPSILON = 0.05;

// ==========================================
// 2. INITIALIZE LOGIC ON PAGE LOAD
// ==========================================

document.addEventListener('generator-ready', function() {
  
  // ==========================================
  // 3. GENERATE THE INTERFACE AUTOMATICALLY
  // ==========================================
  const interfaceHTML = `
    <div id="topBar">
      <button id="homeBtn"><img class="btn-icon" src="icon/arrow-left.svg" alt="Play"></button>
      <span class="title">
      <div id="topBarPrevChapBtn" class="prev-chapter-btn">◀ &nbsp; &nbsp;</div>
      <div id="title"></div>
      <div id="topBarNextChapBtn" class="next-chapter-btn">&nbsp; &nbsp; ▶</div>
      </span>
      <div id="moreMenuWrapper" style="display: flex; align-items: center; flex-direction: row;">
        <div id="extraActionsGroup" style="display: none; align-items: center; gap: 10px; margin-right: 10px;">
          <button id="freqBtn" title="Word Frequency"><img class="btn-icon" src="icon/insights.svg" alt="Settings"></button>
          <button id="contentsBtn" title="Contents"><img class="btn-icon" src="icon/layout-list.svg" alt="Settings"></button>
          <button id="settingsBtn" title="Settings"><img class="btn-icon" src="icon/options.svg" alt="Settings"></button>
        </div>
        
        <button id="moreBtn" style="cursor: pointer; z-index: 10;"><img class="btn-icon" src="icon/more-vertical-alt.svg" alt="More Options"></button>
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
      <i>Only Anaktoria supports all glyph variations.</i>
      <br><br>
      <label>Beta: 
         <select id="betaStyleControl">
           <option value="standard">Β β (Standard)</option>
           <option value="cursive">Β β/ϐ (Cursive)</option>
         </select>
      </label>
      <br><br>
      <label>Epsilon: 
         <select id="epsilonStyleControl">
           <option value="standard">Ε ε (Standard)</option>
           <option value="lunate"> Ε ϵ (Lunate)</option>
         </select>
      </label>
      <br><br>
      <label>Theta: 
         <select id="thetaStyleControl">
           <option value="standard">Θ θ (Standard)</option>
           <option value="cursive">Θ ϑ (Cursive)</option>
         </select>
      </label>
      <br><br>
      <label>Kappa: 
         <select id="kappaStyleControl">
           <option value="standard">Κ κ (Standard)</option>
           <option value="cursive">Κ ϰ (Cursive)</option>
         </select>
      </label>
      <br><br>
      <label>Kai: 
         <select id="kaiStyleControl">
           <option value="standard">Κα\u03af κα\u03af (Standard)</option>
           <option value="ligature">Ϗ\u0301 ϗ\u0301 (Ligature)</option>
           <option value="minuscule">Κα\u03af ϗ\u0301 (Minuscule Ligature Only)</option>
         </select>
      </label>
      <br><br>
      <label>Ou: 
         <select id="ouStyleControl">
           <option value="standard">Ού ού (Standard)</option>
           <option value="ligature">Ȣ\u0301 ȣ\u0301 (Ligature)</option>
         </select>
      </label>
      <br><br>
      <label>Pi: 
         <select id="piStyleControl">
           <option value="standard">Π π (Standard)</option>
           <option value="cursive">Π ϖ (Cursive)</option>
         </select>
      </label>
      <br><br>
      <label>Rho: 
         <select id="rhoStyleControl">
           <option value="standard">Ρ ρ (Standard)</option>
           <option value="variant">Ρ ϱ (Variant)</option>
         </select>
      </label>
      <br><br>
      <label>Sigma: 
        <select id="sigmaStyleControl">
          <option value="standard">Σ σ/ς (Standard)</option>
          <option value="lunate">Ϲ ϲ (Lunate)</option>
        </select>
      </label>
      <br><br>
      <label>Stigma: 
         <select id="stigmaStyleControl">
           <option value="standard"> Στ στ (Standard)</option>
           <option value="ligature">Ϛ ϛ (Ligature)</option>
           <option value="minuscule">Στ ϛ (Minuscule Ligature Only)</option>
         </select>
      </label>
      <br><br>
      <label>Phi: 
        <select id="phiStyleControl">
          <option value="standard">Φ φ (Standard)</option>
          <option value="variant">Φ ϕ (Variant)</option>
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
      <br><br>
      <label>Layout Mode: 
        <select id="layoutModeControl">
          <option value="small">Small (Mobile)</option>
          <option value="medium">Medium (Tablet)</option>
          <option value="large">Large (Desktop)</option>
        </select>
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
      <h5 style="text-align: center;">Debug</h5>
      <label>HTML: 
        <button id="copyHtml" class="settings-btn" style="cursor: pointer;">Copy</button>
      </label>
      <label>Full Page HTML: 
        <button id="copyFullHtml" class="settings-btn" style="cursor: pointer;">Copy</button>
      </label>
    </div>
        
    <div id="playerBar">
      <button id="prevBtn"><img class="btn-icon" src="icon/play-backwards.svg" alt="Backward"></button>
      <button id="playBtn"><img class="btn-icon" src="icon/play-button.svg" alt="Play"></button>
      <button id="nextBtn"><img class="btn-icon" src="icon/play-forwards.svg" alt="Forward"></button>
      <input type="range" id="progressBar" value="0" min="0" step="0.1">
      <span id="timeDisplay">00:00 / 00:00</span>
      <button id="langBtn">EN</button>
    </div>
  `;

  const buttonHTML = `
  <br><br>
  <button id="bottomBarPrevChapBtn" class="next-chapter-btn">Next Chapter</button>
  `;

  // Inject the interfaces into the body of the page
  document.body.insertAdjacentHTML('beforeend', interfaceHTML);
  document.querySelectorAll('.chapter-body').forEach(chapter => {
    chapter.insertAdjacentHTML('beforeend', buttonHTML);
  });
  
  // Grab all DOM elements

  const audio = document.getElementById("audio");
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
  const toggleBtn = document.getElementById('toggle-greek-time');
  const statusText = document.getElementById('greek-time-status');
  const moreBtn = document.getElementById("moreBtn");
  const extraActionsGroup = document.getElementById("extraActionsGroup");
  const contentsBtn = document.getElementById("contentsBtn");
  const freqBtn = document.getElementById("freqBtn");
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const layoutModeControl = document.getElementById("layoutModeControl");
  const htmlBtn = document.getElementById('copyHtml');
  const prevChapterBtns = document.querySelectorAll(".prev-chapter-btn");
  const nextChapterBtns = document.querySelectorAll(".next-chapter-btn");

  let text = null;
  let textEn = null;
  let phrases = [];
  let words = [];
  let phrasesEn = [];
  let notes = [];

  let wasPlaying = false;
  let currentActive = null;
  let dictAudioInstance = null;
  let useGreekNumerals = localStorage.getItem("reader_useGreekNumerals") === "true";
  let chapterMinTime = 0;
  let chapterMaxTime = Infinity;
  let isChapterTransitioning = false;
  let isReadingModeGreek = true;

  // ==========================================
  // ==========================================
  // IMPORTANT STUFF
  // ==========================================
  // ==========================================
  
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
    behavior: "auto"
  });
}

  function checkAndCorrectWordVisibility() {
    const activeWord = document.querySelector(".text span.word.active");
    if (!activeWord) return;
    if (isOutOfView(activeWord)) {
    scrollToTop(activeWord);
    }
  }
  
  function getCurrentPhraseIndex() {
    const time = audio.currentTime;
    
    for (let i = 0; i < phrases.length; i++) {
      const start = parseFloat(phrases[i].dataset.start);
      if (isNaN(start)) continue; // Skip silent phrases during audio playback tracking
  
      // Find the next phrase that actually has a valid number for its start time
      let nextStart = Infinity;
      for (let j = i + 1; j < phrases.length; j++) {
        const checkNext = parseFloat(phrases[j].dataset.start);
        if (!isNaN(checkNext)) {
          nextStart = checkNext;
          break;
        }
      }
  
      if (time >= start && time < nextStart) return i;
    }
    return -1;
  }

  function findFirstValidPhraseIndex() {
    for (let i = 0; i < phrases.length; i++) {
      const startAttr = phrases[i].dataset.start;
      if (startAttr && startAttr.toLowerCase().trim() !== "n/a") {
        const n = parseFloat(startAttr);
        if (!isNaN(n)) return i;
      }
    }
    return -1;
  }
  
  function getCurrentWordIndex() {
    const time = audio.currentTime;
    
    for (let i = 0; i < words.length; i++) {
      const start = parseFloat(words[i].dataset.wordStart);
      const end = parseFloat(words[i].dataset.wordEnd);
      
      // Skip checking this word if it doesn't have valid audio timestamps
      if (isNaN(start) || isNaN(end)) continue; 
      
      if (time >= start && time <= end) return i;
    }
    return -1;
  }
  
  // phrase activator (highlighter)
  function syncVisibleText(useInstantJump = false) {
    if (!text || !textEn) return;
    const time = audio.currentTime;
    const isGreekVisible = (text.style.display !== "none");
    const activePhrasesList = isGreekVisible ? phrases : phrasesEn;
  
    activePhrasesList.forEach((phrase, index) => {
      const start = parseFloat(phrase.dataset.start);
      if (isNaN(start)) {
        phrase.classList.remove("active");
        return; // Skip calculating or activating items with non-numeric timestamps
      }
  
      // DYNAMIC LOOK-AHEAD: Find the next phrase that actually contains a valid start time
      let nextStart = Infinity;
      for (let j = index + 1; j < activePhrasesList.length; j++) {
        const checkNext = parseFloat(activePhrasesList[j].dataset.start);
        if (!isNaN(checkNext)) {
          nextStart = checkNext;
          break;
        }
      }
  
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
            // Rule 3: Normal English reading?
            // Only auto-scroll when the phrase is out of view and we're NOT in a chapter transition.
            if (!isChapterTransitioning) {
              scrollToTop(phrase);
            }
          }
        }
      } else {
        phrase.classList.remove("active");
      }
    });
    isChapterTransitioning = false
  }
  
  // ==========================================
  // GREEK NUMERAL TIME DISPLAY
  // ==========================================
  
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

  function greekNumeralForTitle(n) {
    if (n < 1 || n > 99) return n.toString();
    // reuse convertToGreekNumerals but strip the leading '&nbsp;' for zero
    let numStr = convertToGreekNumerals(n).replace(/&nbsp;/g, '');
    return numStr + '\u0374'; // add Greek numeral sign (ʹ)
  }
  
  // Example format helper for your time string (e.g., "08:53" -> "Η : ΝΓ")
  function formatAudioTime(currentTime, totalDuration, useGreek) {
    const formatPart = (timeVal) => {
      const minutes = Math.floor(timeVal / 60);
      const seconds = Math.floor(timeVal % 60);
    
      if (useGreek) {
        return `${convertToGreekNumerals(minutes)}:${convertToGreekNumerals(seconds)}`;
      } else {
        // Standard padStart format: "08 : 53"
        const displayMin = String(minutes).padStart(2, '0');
        const displaySec = String(seconds).padStart(2, '0');
        return `${displayMin}:${displaySec}`;
      }
    };
    return `${formatPart(currentTime)} / ${formatPart(totalDuration)}`;
  }

  toggleBtn.addEventListener('click', () => {
    useGreekNumerals = !useGreekNumerals;

    localStorage.setItem("reader_useGreekNumerals", useGreekNumerals);
    
    // Update button text indicator
    statusText.textContent = useGreekNumerals ? 'Standard' : 'Greek';
    
    // Force an immediate UI redraw if audio is paused/playing
    if (audio) {
      const relativeCurrent = Math.max(0, audio.currentTime - chapterMinTime);
      const relativeDuration = Math.max(0, chapterMaxTime - chapterMinTime);
      timeDisplay.innerHTML = formatAudioTime(relativeCurrent, relativeDuration, useGreekNumerals);
    }
  });
  
  //End of Greek numeral Timeline Track
  
  // Universal Highlight & Timeline Track
  audio.addEventListener("timeupdate", () => {

    // 0.5 (optimizing)
    if (audio.seeking) {
      const relativeCurrent = Math.max(0, audio.currentTime - chapterMinTime);
      progressBar.value = relativeCurrent;
      return; // <-- CRITICAL: stops here, doesn't run syncVisibleText
    }
    
    // 1. Enforce active chapter playback bounds
    if (audio.currentTime < chapterMinTime - SEEK_TOLERANCE) {
      audio.currentTime = chapterMinTime;
    }
    if (audio.currentTime > chapterMaxTime + SEEK_TOLERANCE) {
      audio.pause();
      audio.currentTime = chapterMaxTime;
      playBtn.innerHTML = '<img class="btn-icon" src="icon/play-button.svg" alt="Play">';
    }
    
    // 2. Set the relative position of the progress bar
    const relativeCurrent = Math.max(0, audio.currentTime - chapterMinTime);
    progressBar.value = relativeCurrent;
    
    // Track if the phrase changes during this tick
    const oldActivePhrase = currentActive;

    syncVisibleText(false); // Run default phrase alignment mechanics
    
    const isGreekVisible = (text.style.display !== "none");
    
    // Word Highlight Handling (Only applies when reading the Greek text layout)
    if (isGreekVisible) {
      const currentWordIndex = getCurrentWordIndex();
      
      // Clear out the previous word highlight
      const previousActiveWord = document.querySelector(".text span.word.active");
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
      const relativeDuration = Math.max(0, chapterMaxTime - chapterMinTime);
      timeDisplay.innerHTML = formatAudioTime(relativeCurrent, relativeDuration, useGreekNumerals);
    }
  });

  function handleNoteClick(e) {
    e.stopPropagation(); 
    if (isPopupActive()) return;

    const note = e.currentTarget;
    wasPlaying = !audio.paused; 
    audio.pause();

    let noteContent = note.dataset.note || "No note data available.";
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    
    noteContent = noteContent.replace(urlRegex, (matchedUrl) => {
      const punctuationMatch = matchedUrl.match(/[.,;:!)]+$/);
      let trailingPunctuation = "";
      let cleanUrl = matchedUrl;

      if (punctuationMatch) {
        trailingPunctuation = punctuationMatch[0];
        cleanUrl = matchedUrl.slice(0, -trailingPunctuation.length);
      }

      const hyperLink = cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`;
      const breakableUrlText = cleanUrl.replace(/\//g, "/&shy;");

      return `<a href="${hyperLink}" target="_blank" style="color: #007bff; text-decoration: underline; word-break: break-word;">${breakableUrlText}</a>${trailingPunctuation}`;
    });

    popupContent.innerHTML = `
      <div style="font-family: inherit; text-align: justify; font-size: 0.9em; padding: 10px; line-height: 1.5;">
        <h3 style="margin-top: 0; color: #a52a2a;">Note</h3>
        <p>${noteContent}</p>
      </div>
    `;

    popup.style.display = "block";
    document.body.style.overflow = 'hidden';
    popupOverlay.style.display = "block";
  }

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

  // ==========================================
  // TITLE HELPERS
  // ==========================================
  
  function stripHTML(str) {
    return str.replace(/<[^>]*>/g, '');
  }
  
  // Helper function to get the current language mode (Greek = true, English = false)
  function isGreekDisplayed() {
    return text && text.style.display !== "none";
  }
  
  function getActiveChapter() {
    return document.querySelector(".chapter-body.active");
  }
  
  function updateTitle() {
    const activeChapter = getActiveChapter();
    const playerBar = document.getElementById("playerBar");
    if (!activeChapter) return;
  
    const section = activeChapter.dataset.section;
    if (!section) {
      const ch = activeChapter.dataset.chapter;
      const titleEl = document.getElementById('title');
      if (titleEl) titleEl.textContent = `Chapter ${ch}`;
      document.title = `Chapter ${ch}`;
      if (playerBar) playerBar.style.display = '';
      return;
    }
    if (section === "0" || section === 0) {
      const titleEl = document.getElementById('title');
      if (titleEl) {
        titleEl.textContent = 'Preface';
      }
      document.title = 'Preface';
      if (playerBar) playerBar.style.display = 'none';
      return;
    }
    if (playerBar) playerBar.style.display = '';
  
    const parts = section.split('.');
    const book = parseInt(parts[0], 10);
    const chapter = parseInt(parts[1], 10);
    const isGreek = isGreekDisplayed();
    const language = isGreek ? 'greek' : 'english';
  
    // 1. Try to fetch the configuration for the active language.
    let templates = window.BOOK_TITLE?.[language];
    let activeTemplateLang = templates ? language : null;
  
    // 2. Fallbacks if the target language is missing
    if (!templates) {
      if (window.BOOK_TITLE?.english) {
        templates = window.BOOK_TITLE.english;
        activeTemplateLang = 'english';
      } else if (window.BOOK_TITLE?.greek) {
        templates = window.BOOK_TITLE.greek;
        activeTemplateLang = 'greek';
      } else if (window.BOOK_TITLE && window.BOOK_TITLE.medium) {
        templates = window.BOOK_TITLE; // Fallback for flat structure without language keys
        activeTemplateLang = 'english'; // Default to Arabic numerals
      }
    }
  
    if (!templates) return;
  
    // 3. Only use Greek numerals if we actually loaded a Greek template.
    const useGreekNumerals = (activeTemplateLang === 'greek');
  
    const bookStr = useGreekNumerals ? greekNumeralForTitle(book) : book.toString();
    const chapStr = useGreekNumerals ? greekNumeralForTitle(chapter) : chapter.toString();
  
    // Build all three title variants
    const smallTitle = templates.small.replace(/\{book\}/g, bookStr).replace(/\{chapter\}/g, chapStr);
    const mediumTitle = templates.medium.replace(/\{book\}/g, bookStr).replace(/\{chapter\}/g, chapStr);
    const largeTitle = templates.large.replace(/\{book\}/g, bookStr).replace(/\{chapter\}/g, chapStr);
  
    const titleEl = document.getElementById('title');
    if (titleEl) {
      titleEl.innerHTML = `
        <span class="title-small">${smallTitle}</span>
        <span class="title-medium">${mediumTitle}</span>
        <span class="title-large">${largeTitle}</span>
      `;
    }
  
    // Set browser tab title (use medium version, stripped of HTML)
    document.title = stripHTML(mediumTitle);
  }
  
  //==========================================
  // RESILIENT PROGRESS AND METADATA RESTORATION
  // ==========================================

  // 1. Force the progress bar to update its maximum capacity as soon as the real duration is resolved
  audio.addEventListener("timeupdate", () => {
    const relDuration = chapterMaxTime - chapterMinTime;
    if (isFinite(relDuration) && progressBar.max !== relDuration.toString()) {
      progressBar.max = relDuration;
    }
  });

  // 2. Safely capture data availability to restore historical relative playback offsets
  audio.addEventListener('canplay', function onCanPlay() {
      console.log('[canplay] fired, currentTime before set:', audio.currentTime);
      let targetTime = chapterMinTime;
      if (window._savedStartTime !== undefined) {
          targetTime = window._savedStartTime;
          window._savedStartTime = undefined;
      }
      console.log('[canplay] setting currentTime to:', targetTime);
      audio.currentTime = targetTime;
      progressBar.value = targetTime - chapterMinTime;
      audio.removeEventListener('canplay', onCanPlay);
  }, { once: true });

  async function handleWordClick(e) {
    e.stopPropagation();
    if (typeof isPopupActive === "function" && isPopupActive()) return;

    const word = e.currentTarget;
    const phrase = word.closest("span.phrase");
    const isSilentPhrase = phrase && phrase.dataset.start && phrase.dataset.start.toLowerCase().trim() === "n/a";
    
    if (phrase && (phrase.classList.contains("active") || isSilentPhrase)) {
      if (typeof audio !== 'undefined') {
        wasPlaying = !audio.paused; 
        audio.pause();
      }

      let dictionaryLookupTerm = word.textContent.trim();
      
      // ... KEEP ALL YOUR SANITIZATION REPLACEMENTS (.replace(/.../) etc.) ...
      
      dictionaryLookupTerm = dictionaryLookupTerm
        .replace(/\u00AD/g, "")
        .replace(/ι\u0300/g, "ὶ")
        .replace(/ι\u0301/g, "ί")
          
        .replace(/ϲ/g, "σ")
        .replace(/Ϲ/g, "Σ")
        .replace(/ϖ/g, "π")
        .replace(/ϰ/g, "κ")
        .replace(/ϛ/g, "στ")
        .replace(/Ϛ/g, "Στ")
        .replace(/ϐ/g, "β")
        .replace(/ϗ/g, "και")
        .replace(/ϗ\u0301/g, "κα\u03af")
        .replace(/ϗ\u0300/g, "κα\u1f76")
        .replace(/Ϗ/g, "Και")
        .replace(/Ϗ\u0301/g, "Κα\u03af")
        .replace(/Ϗ\u0300/g, "Κα\u1f76")
        .replace(/ȣ\u0314\u0342/g, "οὗ")
        .replace(/ȣ\u0313\u0342/g, "οὖ")
        .replace(/ȣ\u0314\u0300/g, "οὓ")
        .replace(/ȣ\u0313\u0300/g, "οὒ")
        .replace(/ȣ\u0314\u0301/g, "οὕ")
        .replace(/ȣ\u0313\u0301/g, "οὔ")
        .replace(/ȣ\u0342/g, "οῦ")
        .replace(/ȣ\u0300/g, "οὺ")
        .replace(/ȣ\u0301/g, "ού")
        .replace(/ȣ\u0314/g, "οὑ")
        .replace(/ȣ\u0313/g, "οὐ")
        .replace(/Ȣ\u0314\u0342/g, "Οὗ")
        .replace(/Ȣ\u0313\u0342/g, "Οὖ")
        .replace(/Ȣ\u0314\u0300/g, "Οὓ")
        .replace(/Ȣ\u0313\u0300/g, "Οὒ")
        .replace(/Ȣ\u0314\u0301/g, "Οὕ")
        .replace(/Ȣ\u0313\u0301/g, "Οὔ")
        .replace(/Ȣ\u0342/g, "Οῦ")
        .replace(/Ȣ\u0300/g, "Οὺ")
        .replace(/Ȣ\u0301/g, "Ού")
        .replace(/Ȣ\u0314/g, "Οὑ")
        .replace(/Ȣ\u0313/g, "Οὐ")
        .replace(/ȣ/g, "ου")
        .replace(/Ȣ/g, "Ου")
        .replace(/ϵ\u0314\u0300/g, "ἓ")
        .replace(/ϵ\u0313\u0300/g, "ἒ")
        .replace(/ϵ\u0314\u0301/g, "ἕ")
        .replace(/ϵ\u0313\u0301/g, "ἔ")
        .replace(/ϵ\u0300/g, "ὲ")
        .replace(/ϵ\u0301/g, "έ")
        .replace(/ϵ\u0314/g, "ἑ")
        .replace(/ϵ\u0313/g, "ἐ")
        .replace(/ϵ/g, "ε")
        .replace(/ϑ/g, "θ")
        .replace(/ϕ/g, "φ")
        .replace(/ϱ\u0314/g, "ῥ")
        .replace(/ϱ\u0313/g, "ῤ")
        .replace(/ϱ/g, "ρ");

      if (dictionaryLookupTerm.endsWith("σ")) {
        dictionaryLookupTerm = dictionaryLookupTerm.slice(0, -1) + "ς";
      }

      const cleanLookupKey = dictionaryLookupTerm.replace(/[.,·;:’'’\"\(\)]/g, "").normalize("NFC");

      popupContent.innerHTML = `<div style="padding:10px;">Loading data definitions...</div>`;
      popup.style.display = "block";
      document.body.style.overflow = 'hidden';
      popupOverlay.style.display = "block";

      const jsonPath = window.APP_CONFIG?.dictionaryJsonPath || "data/default_greek_lexicon.json";

      if (window.DictionaryEngine) {
        await window.DictionaryEngine.renderEntry(cleanLookupKey, word, jsonPath);
      }

    } else if (phrase && typeof audio !== 'undefined') {
      let targetStart = parseFloat(phrase.dataset.start);
      if (!isNaN(targetStart)) {
        // Enforce boundaries
        audio.currentTime = Math.max(chapterMinTime, Math.min(chapterMaxTime, targetStart + SEEK_EPSILON));
      }
    }
  }
  
  // Dictionary Popup Close Actions
  const closePopup = () => {
    if (dictAudioInstance) {
      dictAudioInstance.pause();
      dictAudioInstance = null;
    }
    popup.style.display = "none";
    document.body.style.overflow = '';
    popupOverlay.style.display = "none";
    if (wasPlaying) { audio.play(); wasPlaying = false; }
  };
  if (document.getElementById("closePopup")) document.getElementById("closePopup").addEventListener("click", closePopup);

  // Controls UI Action
  playBtn.addEventListener("click", () => {
    if (isPopupActive()) return; 
    if (audio.paused) {
      if (audio.currentTime >= chapterMaxTime || audio.currentTime < chapterMinTime) {
        audio.currentTime = chapterMinTime;
      }
      audio.play();
      playBtn.innerHTML = '<img class="btn-icon" src="icon/play-pause.svg" alt="Pause">';
    } else {
      audio.pause();
      playBtn.innerHTML = '<img class="btn-icon" src="icon/play-button.svg" alt="Play">';
    }
  });

  progressBar.addEventListener("input", () => {
    if (isPopupActive()) { 
      progressBar.value = audio.currentTime - chapterMinTime; 
      return; 
    }
    // Update audio absolute currentTime from the progress bar's relative position
    audio.currentTime = parseFloat(progressBar.value) + chapterMinTime;
  });

  // Forward Button Click Handler
  nextBtn.addEventListener("click", () => {
    if (isPopupActive()) return;

    let index = getCurrentPhraseIndex();

    // If the playhead is before the first phrase, jump to the first valid phrase
    if (index === -1) {
      const firstIdx = findFirstValidPhraseIndex();
      if (firstIdx !== -1) {
        audio.currentTime = parseFloat(phrases[firstIdx].dataset.start) + SEEK_EPSILON;
      }
      return;
    }

    if (index !== -1) {
      let nextIndex = index + 1;
      while (nextIndex < phrases.length) {
        const startAttr = phrases[nextIndex].dataset.start;
        if (startAttr && startAttr.toLowerCase().trim() !== "n/a") {
          audio.currentTime = parseFloat(startAttr) + SEEK_EPSILON;
          break;
        }
        nextIndex++;
      }
    }
  });
  
  // Backward Button Click Handler
  prevBtn.addEventListener("click", () => {
    if (isPopupActive()) return; 
    let index = getCurrentPhraseIndex();
    
    if (index > 0) {
      let prevIndex = index - 1;
      while (prevIndex >= 0) {
        const startAttr = phrases[prevIndex].dataset.start;
        if (startAttr && startAttr.toLowerCase().trim() !== "n/a") {
          audio.currentTime = parseFloat(startAttr) + SEEK_EPSILON;
          break;
        }
        prevIndex--;
      }
    }
  });

  // Helper function to sync the lang button text with actual display state
  function syncLangButtonWithDisplay() {
    if (isGreekDisplayed()) {
      langBtn.textContent = "EN"; // Currently showing Greek, button says switch to English
    } else {
      langBtn.textContent = "GR"; // Currently showing English, button says switch to Greek
    }
  }
  
  langBtn.addEventListener("click", () => {
    // 1. Completely clear out old highlights across both languages
    if (currentActive) currentActive.classList.remove("active");
    phrases.forEach(p => p.classList.remove("active"));
    phrasesEn.forEach(p => p.classList.remove("active"));
    currentActive = null; 

    // 2. Toggle the visibility layouts
    if (isGreekDisplayed()) {
      langBtn.textContent = "GR";
      text.style.display = "none";
      textEn.style.display = "block";
      localStorage.setItem("reader_languageMode", "english");
      updateTitle();
    } else {
      langBtn.textContent = "EN";
      text.style.display = "block";
      textEn.style.display = "none";
      localStorage.setItem("reader_languageMode", "greek");
      updateTitle();
    }

    // 3. Force an instantaneous view alignment and re-highlight, even if paused!
    syncVisibleText(true); 
    
    // 4. EXCEPTION: When RETURNING to Greek, find the first phrase of the current section
    if (langBtn.textContent === "EN" && currentActive) {
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
        if (audio.currentTime >= chapterMaxTime || audio.currentTime < chapterMinTime) {
          audio.currentTime = chapterMinTime;
        }
        audio.play();
        playBtn.innerHTML = '<img class="btn-icon" src="icon/play-pause.svg" alt="Pause">';
      } else {
        audio.pause();
        playBtn.innerHTML = '<img class="btn-icon" src="icon/play-button.svg" alt="Play">';
      }
    }
    if (e.code === "ArrowRight") {
      let index = getCurrentPhraseIndex();

      if (index === -1) {
        const firstIdx = findFirstValidPhraseIndex();
        if (firstIdx !== -1) {
          audio.currentTime = parseFloat(phrases[firstIdx].dataset.start) + SEEK_EPSILON;
        }
        return;
      }

      if (index !== -1) {
        let nextIndex = index + 1;
        while (nextIndex < phrases.length) {
          const startAttr = phrases[nextIndex].dataset.start;
          if (startAttr && startAttr.toLowerCase().trim() !== "n/a") {
            audio.currentTime = parseFloat(startAttr) + SEEK_EPSILON;
            break;
          }
          nextIndex++;
        }
      }
    }
    
    if (e.code === "ArrowLeft") {
      let index = getCurrentPhraseIndex();
      
      if (index > 0) {
        let prevIndex = index - 1;
        while (prevIndex >= 0) {
          const startAttr = phrases[prevIndex].dataset.start;
          if (startAttr && startAttr.toLowerCase().trim() !== "n/a") {
            audio.currentTime = parseFloat(startAttr) + SEEK_EPSILON;
            break;
          }
          prevIndex--;
        }
      }
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

  //helper function to detect if the current chapter has an english translation or not
  function hasEnglishContent() {
      const activeChapter = getActiveChapter();
      if (!activeChapter) return false;
      const enContainer = activeChapter.querySelector('.text_en');
      if (!enContainer) return false;
      const spans = enContainer.querySelectorAll('.phrase_en');
      for (const span of spans) {
          if (span.textContent.trim().length > 0) {
              return true;
          }
      }
      return false;
  }

  //helper function change the visibility of the language btn
  function updateLanguageToggleVisibility() {
    const btn = document.getElementById('langBtn');
    if (!btn) return;
    if (!hasEnglishContent()) {
      btn.style.display = 'none';
      localStorage.setItem("reader_languageMode", "greek");
    } else {
      btn.style.display = '';
    }
  }
  
  // ==========================================
  // AUTOMATIC & MANUAL LAYOUT SYNC ENGINE
  // ==========================================
  
  // Helper function to detect the active CSS breakpoint layout
  function detectCurrentSystemLayout() {
    const width = window.innerWidth;
    if (width <= 768) {
      return "small"; // Mobile
    } else if (width > 768 && width <= 1023) {
      return "medium"; // Tablet
    } else {
      return "large"; // Desktop
    }
  }

  // Synchronize the dropdown to match the real display state
  function syncLayoutUI() {
    if (!layoutModeControl) return;

    const savedLayout = localStorage.getItem("reader_layoutMode");
    
    if (savedLayout && savedLayout !== "auto") {
      // 1. Restore historical manual override if one exists
      layoutModeControl.value = savedLayout;
      document.body.classList.remove("layout-small", "layout-medium", "layout-large");
      document.body.classList.add(`layout-${savedLayout}`);
    } else {
      // 2. Otherwise, match exactly what the responsive CSS engine is outputting
      layoutModeControl.value = detectCurrentSystemLayout();
    }
  }

  // Handle manual selection changes by the user
  if (layoutModeControl) {
    layoutModeControl.addEventListener("change", () => {
      const selectedLayout = layoutModeControl.value;
      
      // Clear out previous active manual layouts
      document.body.classList.remove("layout-small", "layout-medium", "layout-large");
      
      // Force the manual debug configuration overrides
      document.body.classList.add(`layout-${selectedLayout}`);
      
      // Save choice permanently to local storage
      localStorage.setItem("reader_layoutMode", selectedLayout);

      updateTitle();
    });
  }

  // Run synchronization right away when the page opens
  syncLayoutUI();

  // Keep dropdown accurate if user resizes window (only updates if no manual block is hard-forced)
  window.addEventListener("resize", () => {
    const savedLayout = localStorage.getItem("reader_layoutMode");
    if (!savedLayout) {
      if (layoutModeControl) {
        layoutModeControl.value = detectCurrentSystemLayout();
      }
    }
  });
  
  // ==========================================
  // COPY ACTIVE CHAPTER HTML TO CLIPBOARD
  // ==========================================
  if (htmlBtn) {
    htmlBtn.addEventListener("click", () => {
      // Find the currently active chapter body
      const activeChapter = document.querySelector(".chapter-body.active");
      
      if (activeChapter) {
        // Get its full outer HTML structure
        const activeHtml = activeChapter.outerHTML;
        
        // Write it to the system clipboard
        navigator.clipboard.writeText(activeHtml)
          .then(() => {
            // Provide a quick visual feedback on the button
            const originalText = htmlBtn.textContent;
            htmlBtn.textContent = "Copied!";
            htmlBtn.style.backgroundColor = "#4caf50"; // Optional green flash
            
            setTimeout(() => {
              htmlBtn.textContent = originalText;
              htmlBtn.style.backgroundColor = "";
            }, 1500);
          })
          .catch(err => {
            console.error("Failed to copy HTML: ", err);
            alert("Could not copy HTML. Please verify clipboard permissions.");
          });
      } else {
        alert("No active chapter found to copy.");
      }
    });
  }

  if (document.getElementById('copyFullHtml')) {
    document.getElementById('copyFullHtml').addEventListener('click', () => {
      const fullHtml = document.documentElement.outerHTML;
      navigator.clipboard.writeText(fullHtml)
        .then(() => {
          const btn = document.getElementById('copyFullHtml');
          const original = btn.textContent;
          btn.textContent = "Copied!";
          btn.style.backgroundColor = "#4caf50";
          setTimeout(() => {
            btn.textContent = original;
            btn.style.backgroundColor = "";
          }, 1500);
        })
        .catch(err => {
          console.error("Failed to copy full HTML:", err);
          alert("Could not copy full HTML.");
        });
    });
  }
  
  // ==========================================
  // EVERY GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  
  initAdvancedFontSettings();
  
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
    const savedFontFamily = localStorage.getItem("reader_fontFamily") || "SBL";
    fontFamilyControl.value = savedFontFamily;
    
    fontFamilyControl.addEventListener("change", () => {
      if (text) {
        text.style.fontFamily = fontFamilyControl.value;
        localStorage.setItem("reader_fontFamily", fontFamilyControl.value); // Save preference
      }
      if (textEn) {
        textEn.style.fontFamily = fontFamilyControl.value;
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
      const titleContainer = document.querySelector('.title');
      
      if (isHidden) {
        extraActionsGroup.style.display = "flex";
        titleContainer.classList.add('hiddenIfOnMobile');
      } else {
        extraActionsGroup.style.display = "none";
        titleContainer.classList.remove('hiddenIfOnMobile');
      }
    });
  }

  if (contentsBtn) {
    contentsBtn.addEventListener("click", () => {
      // 1. Pause audio and remember state
      wasPlaying = !audio.paused;
      audio.pause();

      // Build the list of chapters
      const chapters = getAllChapters();
      if (chapters.length === 0) return;
  
      let html = `<h3 style="margin-top:0;">Table of Contents</h3><ul style="list-style:none; padding:0; margin:0;">`;
      chapters.forEach((chapter, index) => {
        const section = chapter.dataset.section;
        let label = "";
        
        // Check for Preface
        if (section === "0" || section === 0) {
          label = "Preface";
        } 
        // Check for standard sections (e.g., "1.1")
        else if (section) {
          const parts = section.split('.');
          const bookName = window.APP_CONFIG?.customBookName || "Book";
          const chapName = window.APP_CONFIG?.customChapterName || "Chapter";
          label = `${bookName} ${parts[0]}, ${chapName} ${parts[1]}`;
        } 
        // Fallback if dataset.section is missing entirely
        else {
          const chapName = window.APP_CONFIG?.customChapterName || "Chapter";
          label = `${chapName} ${chapter.dataset.chapter}`;
        }
        
        html += `<li style="padding:6px 0; border-bottom:1px solid #eee; cursor:pointer;" data-index="${index}">${label}</li>`;
      });
      html += `</ul>`;
  
      popupContent.innerHTML = html;
      popup.style.display = "block";
      document.body.style.overflow = 'hidden';
      popupOverlay.style.display = "block";
  
      // Add click listeners to each list item
      const items = popupContent.querySelectorAll('li');
      items.forEach((item) => {
        item.addEventListener('click', () => {
          const index = parseInt(item.dataset.index, 10);
          const targetChapter = chapters[index];
          if (targetChapter) {
            // Close the popup
            popup.style.display = "none";
            document.body.style.overflow = '';
            popupOverlay.style.display = "none";

            // 2. Briefly resume audio if it was playing, so goToChapter captures the correct state
            if (wasPlaying) { 
              audio.play(); 
              wasPlaying = false; 
            }
            
            // Jump to the chapter
            goToChapter(targetChapter);
          }
        });
      });
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
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // Opening Main Settings
  settingsBtn.addEventListener("click", () => {
    wasPlaying = !audio.paused;
    audio.pause();
    settingsPopup.style.display = "block";
    document.body.style.overflow = 'hidden';
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
    document.body.style.overflow = '';
    popupOverlay.style.display = "none";
    if (wasPlaying) { audio.play(); wasPlaying = false; }
  });

  // Overlay Click: Emergency Backup Close-All
  popupOverlay.addEventListener("click", () => {
    popup.style.display = "none";
    settingsPopup.style.display = "none";
    advancedFontPopup.style.display = "none"; // Make sure this shuts off too
    popupOverlay.style.display = "none";
    document.body.style.overflow = '';
    if (wasPlaying) { audio.play(); wasPlaying = false; }
  });

  // ==========================================
  // MASTER CLASSICAL GREEK HYPHENATOR
  // ==========================================
  const ALL_GREEK_VOWELS = ["α", "ε", "ι", "ο", "υ", "ᾱ", "η", "ῑ", "ω", "ῡ", "αι", "αυ", "ει", "ευ", "οι", "ου", "υι", "ᾳ", "ᾱυ", "ῃ", "ηυ", "ῳ", "ωυ", "ῡι", "ϊ", "ϋ", "ἀ", "ἐ", "ἰ", "ὀ", "ὐ", "ᾱ̓", "ἠ", "ῑ̓", "ὠ", "ῡ̓", "αἰ", "αὐ", "εἰ", "εὐ", "οἰ", "οὐ", "υἰ", "ᾀ", "ᾱὐ", "ᾐ", "ηὐ", "ᾠ", "ωὐ", "ῡἰ", "ἁ", "ἑ", "ἱ", "ὁ", "ὑ", "ᾱ̔", "ἡ", "ῑ̔", "ὡ", "ῡ̔", "αἱ", "αὑ", "εἱ", "εὑ", "οἱ", "οὑ", "υἱ", "ᾁ", "ᾱὑ", "ᾑ", "ηὑ", "ᾡ", "ωὑ", "ῡἱ", "ά", "έ", "\u03af", "ό", "ύ", "ᾱ́", "ή", "ῑ́", "ώ", "ῡ́", "α\u03af", "αύ", "ε\u03af", "εύ", "ο\u03af", "ού", "υ\u03af", "ᾴ", "ᾱύ", "ῄ", "ηύ", "ῴ", "ωύ", "ῡ\u03af", "ΐ", "ΰ", "ἄ", "ἔ", "ἴ", "ὄ", "ὔ", "ᾱ̓́", "ἤ", "ῑ̓́", "ὤ", "ῡ̓́", "αἴ", "αὔ", "εἴ", "εὔ", "οἴ", "οὔ", "υἴ", "ᾄ", "ᾱὔ", "ᾔ", "ηὔ", "ᾤ", "ωὔ", "ῡἴ", "ἅ", "ἕ", "ἵ", "ὅ", "ὕ", "ᾱ̔́", "ἥ", "ῑ̔́", "ὥ", "ῡ̔́", "αἵ", "αὕ", "εἵ", "εὕ", "οἵ", "οὕ", "υἵ", "ᾅ", "ᾱὕ", "ᾕ", "ηὕ", "ᾥ", "ωὕ", "ῡἵ", "ὰ", "ὲ", "\u1f76", "ὸ", "ὺ", "ᾱ̀", "ὴ", "ῑ̀", "ὼ", "ῡ̀", "α\u1f76", "αὺ", "ε\u1f76", "εὺ", "ο\u1f76", "οὺ", "υ\u1f76", "ᾲ", "ᾱὺ", "ῂ", "ηὺ", "ῲ", "ωὺ", "ῡ\u1f76", "ῒ", "ῢ", "ἂ", "ἒ", "ἲ", "ὂ", "ὒ", "ᾱ̓̀", "ἢ", "ῑ̓̀", "ὢ", "ῡ̓̀", "αἲ", "αὒ", "εἲ", "εὒ", "οἲ", "οὒ", "υἲ", "ᾂ", "ᾱὒ", "ᾒ", "ηὒ", "ᾢ", "ωὒ", "ῡἲ", "ἃ", "ἓ", "ἳ", "ὃ", "ὓ", "ᾱ̔̀", "ἣ", "ῑ̔̀", "ὣ", "ῡ̔̀", "αἳ", "αὓ", "εἳ", "εὓ", "οἳ", "οὓ", "υἳ", "ᾃ", "ᾱὓ", "ᾓ", "ηὓ", "ᾣ", "ωὓ", "ῡἳ", "ᾶ", "ῆ", "ῗ", "ῶ", "ῧ", "αῖ", "αῦ", "εῖ", "εῦ", "οῖ", "οῦ", "υῖ", "ᾷ", "ᾱῦ", "ῇ", "ηῦ", "ῷ", "ωῦ", "ῡῖ", "ἆ", "ἦ", "ἶ", "ὦ", "ὖ", "αἶ", "αὖ", "εἶ", "εὖ", "οἶ", "οὖ", "υἶ", "ᾆ", "ᾱὖ", "ᾖ", "ηὖ", "ᾦ", "ωὖ", "ῡἶ", "ἇ", "ἧ", "ἷ", "ὧ", "ὗ", "αἷ", "αὗ", "εἷ", "εὗ", "οἷ", "οὗ", "υἷ", "ᾇ", "ᾱὗ", "ᾗ", "ηὗ", "ᾧ", "ωὗ", "ῡἷ"];

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
  
  // ==========================================
  // LOAD SAVED PREFERENCES & UPDATE CHAPTER ELEMENTS
  // ==========================================
  
  function applyUserSettings() {
    if (fontControl && fontValue) {
      fontControl.min = SITE_SETTINGS.fontSize.min;
      fontControl.max = SITE_SETTINGS.fontSize.max;
      
      const savedFontSize = localStorage.getItem("reader_fontSize") || SITE_SETTINGS.fontSize.default;
      fontControl.value = savedFontSize;
      fontValue.textContent = savedFontSize + "px";
      
      if (localStorage.getItem("reader_fontSize")) {
        if (text) text.style.fontSize = savedFontSize + "px";
        if (textEn) textEn.style.fontSize = savedFontSize + "px";
      }
    }
    
    if (fontFamilyControl) {
      const savedFontFamily = localStorage.getItem("reader_fontFamily") || "SBL";
      fontFamilyControl.value = savedFontFamily;
      
      if (localStorage.getItem("reader_fontFamily") && text) {
        text.style.fontFamily = savedFontFamily;
        textEn.style.fontFamily = savedFontFamily;
      }
    }
  
    if (speedControl && speedValue) {
      speedControl.min = SITE_SETTINGS.playerSpeed.min;
      speedControl.max = SITE_SETTINGS.playerSpeed.max;
      
      const savedSpeed = localStorage.getItem("reader_playerSpeed") || SITE_SETTINGS.playerSpeed.default;
      speedControl.value = savedSpeed;
      speedValue.textContent = Number(savedSpeed).toFixed(1) + "x";
      
      audio.addEventListener("loadedmetadata", () => {
        audio.playbackRate = parseFloat(savedSpeed);
      });
    }
  
    if (volumeControl && volumeValue) {
      volumeControl.min = SITE_SETTINGS.volume.min;
      volumeControl.max = SITE_SETTINGS.volume.max;
      
      const savedVolume = localStorage.getItem("reader_volume") || SITE_SETTINGS.volume.default;
      volumeControl.value = savedVolume;
      volumeValue.textContent = Math.round(savedVolume * 100) + "%";
      audio.volume = parseFloat(savedVolume);
    }
  
    if (statusText) {
      statusText.textContent = useGreekNumerals ? 'Standard' : 'Greek';
    }
  }

  function updateActiveChapterElements(activeContainer) {
    // Dynamically assign the text container DOM elements
    text = activeContainer.querySelector(".text");
    textEn = activeContainer.querySelector(".text_en");

    applyUserSettings();
    
    // Redefine your global selector references
    phrases = activeContainer.querySelectorAll("span.phrase");
    phrasesEn = activeContainer.querySelectorAll("span.phrase_en");
    notes = activeContainer.querySelectorAll(".note-marker");

    // Clear previous active highlight state (avoid stale references to removed nodes)
    if (currentActive) {
      try { currentActive.classList.remove("active"); } catch (e) {}
      currentActive = null;
    }
    phrases.forEach(p => p.classList && p.classList.remove("active"));
    phrasesEn.forEach(p => p.classList && p.classList.remove("active"));
    
    // Run hyphenation dynamically on the newly loaded chapter words
    const temporaryWords = activeContainer.querySelectorAll("span.word");
    temporaryWords.forEach(wordElement => {
      const originalText = wordElement.textContent.trim();
      if (originalText.length > 0 && !wordElement.innerHTML.includes("&shy;")) {
        wordElement.innerHTML = hyphenateGreekWord(originalText);
      }
    });

    // Assign global "words" reference for timeline tracking calculations
    words = activeContainer.querySelectorAll("span.word");
    recalculateAudioBoundaries();
  }

  const activeChapter = getActiveChapter();
  updateActiveChapterElements(activeChapter);
  
  // ==========================================
  // CHAPTER NAVIGATION ENGINE
  // ==========================================

  // Helper to get all available chapters in the document
  function getAllChapters() {
    return document.querySelectorAll(".chapter-body");
  }

  // Master function to navigate between chapters
  function navigateChapter(direction) {
    const chapters = Array.from(getAllChapters());
    const activeChapter = getActiveChapter();
    if (!activeChapter || chapters.length <= 1) return;

    const currentIndex = chapters.indexOf(activeChapter);
    let targetIndex = currentIndex + direction;

    // Boundary check: Ensure the target chapter exists
    if (targetIndex < 0 || targetIndex >= chapters.length) {
      return;
    }

    isChapterTransitioning = true;
    
    // 1. Pause current playback safely
    wasPlaying = !audio.paused;
    audio.pause();
    
    // Reset the play button UI visually to the "Play" state
    if (playBtn) {
      playBtn.innerHTML = '<img class="btn-icon" src="icon/play-button.svg" alt="Play">';
    }

    // 2. Hide current chapter and show the target chapter
    activeChapter.classList.remove("active");
    activeChapter.style.display = "none"; // Ensure it is visually hidden if CSS relies on display

    const targetChapter = chapters[targetIndex];
    targetChapter.classList.add("active");
    targetChapter.style.display = "block";

    // 3. Re-bind and update active DOM elements to reference the new active chapter
    updateActiveChapterElements(targetChapter);

    updateLanguageToggleVisibility(); //Makes sure it changes the language mode before fetching it
    const currentLang = localStorage.getItem("reader_languageMode") || "greek";
      if (currentLang === "english") {
        langBtn.textContent = "GR";
        text.style.display = "none";
        textEn.style.display = "block";
      } else {
        langBtn.textContent = "EN";
        text.style.display = "block";
        textEn.style.display = "none";
      }
    updateTitle();
    
    // 5. Reset progress playheads and load the new chapter's audio track
    localStorage.removeItem("reader_currentTime"); // Clear previous saved time offset
    audio.currentTime = chapterMinTime;
    progressBar.value = 0;

    // Dynamically update the audio source if your chapters use different audio files
    const chapterAudioSrc = targetChapter.dataset.audioSrc; 
    if (chapterAudioSrc) {
      const mainAudioSource = audio.querySelector("source");
      if (mainAudioSource) {
        mainAudioSource.src = chapterAudioSrc;
      } else {
        audio.src = chapterAudioSrc;
      }
      audio.load(); // Force reload the media element with the new track
    }
    
    // 8. Auto-play if the user was actively listening before switching
    if (wasPlaying) {
      audio.play().catch(err => console.log("Auto-play prevented: ", err));
    }
  }
  
  function recalculateAudioBoundaries() {
    const validWords = Array.from(words).filter(w => {
      const s = parseFloat(w.dataset.wordStart);
      const e = parseFloat(w.dataset.wordEnd);
      return !isNaN(s) && !isNaN(e);
    });

    if (validWords.length > 0) {
      chapterMinTime = parseFloat(validWords[0].dataset.wordStart);
      chapterMaxTime = parseFloat(validWords[validWords.length - 1].dataset.wordEnd);
    } else {
      chapterMinTime = 0;
      chapterMaxTime = audio.duration || Infinity;
    }

    const relDuration = chapterMaxTime - chapterMinTime;
    progressBar.max = isFinite(relDuration) ? relDuration : 100;
  }

  // ==========================================
  // JUMP TO A SPECIFIC CHAPTER
  // ==========================================
  function goToChapter(targetChapter) {
    const chapters = Array.from(getAllChapters());
    const activeChapter = getActiveChapter();
    if (!activeChapter || !targetChapter) return;
  
    const currentIndex = chapters.indexOf(activeChapter);
    const targetIndex = chapters.indexOf(targetChapter);
  
    if (targetIndex === -1 || targetIndex === currentIndex) return;
  
    // --- Same logic as navigateChapter, but without direction ---
    isChapterTransitioning = true;
  
    // Pause
    wasPlaying = !audio.paused;
    audio.pause();
    if (playBtn) {
      playBtn.innerHTML = '<img class="btn-icon" src="icon/play-button.svg" alt="Play">';
    }
  
    // Hide current, show target
    activeChapter.classList.remove("active");
    activeChapter.style.display = "none";
  
    targetChapter.classList.add("active");
    targetChapter.style.display = "block";
  
    // Update active elements
    updateActiveChapterElements(targetChapter);
  
    // Reset progress
    localStorage.removeItem("reader_currentTime");
    audio.currentTime = chapterMinTime;
    progressBar.value = 0;
  
    // Update audio source
    const chapterAudioSrc = targetChapter.dataset.audioSrc;
    if (chapterAudioSrc) {
      const mainAudioSource = audio.querySelector("source");
      if (mainAudioSource) {
        mainAudioSource.src = chapterAudioSrc;
      } else {
        audio.src = chapterAudioSrc;
      }
      audio.load();
    }
  
    // Apply saved language preference
    updateLanguageToggleVisibility(); //Makes sure it changes the language mode before fetching it
    const currentLang = localStorage.getItem("reader_languageMode") || "greek";
    if (currentLang === "english") {
      langBtn.textContent = "GR";
      text.style.display = "none";
      textEn.style.display = "block";
    } else {
      langBtn.textContent = "EN";
      text.style.display = "block";
      textEn.style.display = "none";
    }
    updateTitle();
  
    // Auto-play if was playing
    if (wasPlaying) {
      audio.play().catch(err => console.log("Auto-play prevented: ", err));
    }
  
    // Save chapter
    const chapterNum = targetChapter.getAttribute("data-chapter");
    if (chapterNum) {
      localStorage.setItem("savedChapter", chapterNum);
    }
  }
  
  // ==========================================
  // GLOBAL EVENT DELEGATOR (REPLACES ALL BINDING LOGIC)
  // ==========================================
  document.addEventListener("click", (e) => {
    // 1. Check if clicked element is a word (or inside a word)
    const wordElement = e.target.closest(".chapter-body.active span.word");
    if (wordElement) {
      handleWordClick({
        stopPropagation: () => e.stopPropagation(),
        currentTarget: wordElement
      });
      return;
    }

    // 2. Check if clicked element is a note marker
    const noteElement = e.target.closest(".chapter-body.active .note-marker");
    if (noteElement) {
      handleNoteClick({
        stopPropagation: () => e.stopPropagation(),
        currentTarget: noteElement
      });
      return;
    }
  });

  // ==========================================
  // CHAPTER LOGIC
  // ==========================================
  
  prevChapterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navigateChapter(-1);
      handleChapterTransition();
    });
  });
  
  nextChapterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navigateChapter(1);
      handleChapterTransition();
    });
  });
  
  // Orchestrates everything that needs to happen AFTER a chapter switch
  function handleChapterTransition() {
    const activeChapter = document.querySelector(".chapter-body.active");
    if (!activeChapter) return;
    
    // 1. Save the current chapter to localStorage
    const chapterNum = activeChapter.getAttribute("data-chapter");
    if (chapterNum) {
      localStorage.setItem("savedChapter", chapterNum);
    }
  
    // 2. Jump to the top of the page smoothly
    window.scrollTo({ top: 0, behavior: "auto" }); 
    // Note: Change "smooth" to "auto" if you want an instant, non-animated jump.
  }

  // ==========================================
  // INITIAL ACTIVE CHAPTER BOOTSTRAPPER & SETUP CONFIG BOUNDARIES & LIMIT AUDIO SCOPE TO WORDS TIMESTAMP BOUNDARIES
  // ==========================================
  const savedChapterNum = localStorage.getItem("savedChapter");
  let startingChapter = document.querySelector(".chapter-body.active"); 
  
  if (savedChapterNum) {
    const savedChapter = document.querySelector(`.chapter-body[data-chapter="${savedChapterNum}"]`);
    if (savedChapter) {
      if (startingChapter) {
        startingChapter.classList.remove("active");
        startingChapter.style.display = "none";
      }
      savedChapter.classList.add("active");
      savedChapter.style.display = "block";
      startingChapter = savedChapter;
    }
  }

  // BOOT STEP 1: Process and populate elements inside our active container.
  // This defines the active 'text', 'textEn', and 'words' arrays.
  if (startingChapter) {
    updateActiveChapterElements(startingChapter); // This also internally runs recalculateAudioBoundaries()
    
    if (audio) {
      const initialSrc = startingChapter.getAttribute("data-audio-src");
      if (initialSrc) {
        audio.src = initialSrc;
        audio.load();
        
        // FALLBACK: If canplay doesn't fire within 3 seconds, force the time
        setTimeout(() => {
          if (audio.currentTime < chapterMinTime - 1) {
            console.warn('[fallback] canplay did not fire or seek failed, forcing time to', chapterMinTime);
            audio.currentTime = chapterMinTime;
            progressBar.value = 0;
          }
        }, 3000);
      }
    }
  }

  //one time language mode change based off the last recorded language mode switch from the last session
  updateLanguageToggleVisibility(); //Makes sure it changes the language mode before fetching it
  const initialLang = localStorage.getItem("reader_languageMode") || "greek";
  if (initialLang === "english") {
    langBtn.textContent = "GR";
    text.style.display = "none";
    textEn.style.display = "block";
  } else {
    langBtn.textContent = "EN";
    text.style.display = "block";
    textEn.style.display = "none";
  }
  updateTitle();
  
  // BOOT STEP 2: Configure timeline constraints & playback ranges
  const savedTime = localStorage.getItem("reader_currentTime");
  if (savedTime) {
    const t = parseFloat(savedTime);
    if (t >= chapterMinTime && t <= chapterMaxTime) {
      // Store it so the 'canplay' listener can use it
      window._savedStartTime = t;
    }
  }

  // ==========================================
  // REMOVE LOADING SCREEN
  // ==========================================
  
  const loading = document.getElementById('loadingScreen');
  if (loading) loading.classList.add('hidden');
});
