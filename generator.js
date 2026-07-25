/**
 * generator.js – Client-side text loader with Pyodide.
 * Loads Python alignment code, fetches source texts, extracts chapters,
 * calls Python's align_and_generate_html, and injects the generated HTML.
 */

(async function initHTMLGenerator() {
  console.log("generator.js: starting...");

  // =============================================
  // 1. Get configuration
  // =============================================
  
  const config = window.APP_CONFIG;
  if (!config) {
    console.error("window.APP_CONFIG is not defined.");
    document.dispatchEvent(new CustomEvent('generator-ready'));
    return;
  }

  const greekPath = config.sourceGreekPath;
  const englishPath = config.sourceEnglishPath;
  if (!greekPath || !englishPath) {
    console.error("sourceGreekPath or sourceEnglishPath missing.");
    document.dispatchEvent(new CustomEvent('generator-ready'));
    return;
  }

  // =============================================
  // 2. Wait for Pyodide to be ready (improved)
  // =============================================
  
  function waitForPyodide() {
    return new Promise((resolve) => {
      if (window.pyodide && window.pyodide.runPython) {
        resolve(window.pyodide);
        return;
      }
      
      // If loadPyodide is available, call it directly
      if (window.loadPyodide) {
        console.log("Loading Pyodide... (this may take 5-15 seconds)");
        window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.0/full/"
        }).then((pyodide) => {
          window.pyodide = pyodide;
          console.log("✅ Pyodide loaded");
          resolve(pyodide);
        }).catch((err) => {
          console.error("Pyodide load error:", err);
          resolve(null);
        });
        return;
      }
      
      // Fallback: wait for it to appear
      let attempts = 0;
      const maxAttempts = 150; // 15 seconds
      const check = () => {
        attempts++;
        if (window.pyodide && window.pyodide.runPython) {
          resolve(window.pyodide);
        } else if (attempts < maxAttempts) {
          setTimeout(check, 100);
        } else {
          console.error("Pyodide failed to load after 15 seconds");
          resolve(null);
        }
      };
      check();
    });
  }

  let pyodide;
  try {
    pyodide = await waitForPyodide();
    if (!pyodide) {
      console.error("Pyodide failed to load.");
      document.dispatchEvent(new CustomEvent('generator-ready'));
      return;
    }
  } catch (err) {
    console.error("Pyodide not available:", err);
    document.dispatchEvent(new CustomEvent('generator-ready'));
    return;
  }

  // =============================================
  // 3. Fetch and load converter.py
  // =============================================
  
  // =============================================
  // 3. Fetch and load converter.py
  // =============================================

  let pythonCode;
  try {
    const resp = await fetch('converter.py');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    pythonCode = await resp.text();
    console.log("✅ converter.py loaded");
  } catch (err) {
    console.error("Failed to load converter.py:", err);
    document.dispatchEvent(new CustomEvent('generator-ready'));
    return;
  }
  
  // ✅ Ensure imports are present
  const fixedCode = "import re\nimport html\n" + pythonCode;
  
  // Run the Python code
  try {
    pyodide.runPython(fixedCode);
    console.log("✅ converter.py executed in Pyodide");
  } catch (err) {
    console.error("Failed to run converter.py:", err);
    document.dispatchEvent(new CustomEvent('generator-ready'));
    return;
  }

  // =============================================
  // 4. Fetch source texts
  // =============================================
  
  let greekText, englishText;
  try {
    const [greekResp, englishResp] = await Promise.all([
      fetch(greekPath),
      fetch(englishPath)
    ]);
    if (!greekResp.ok) throw new Error(`Greek HTTP ${greekResp.status}`);
    if (!englishResp.ok) throw new Error(`English HTTP ${englishResp.status}`);
    greekText = await greekResp.text();
    englishText = await englishResp.text();
  } catch (err) {
    console.error("Failed to load source texts:", err);
    document.dispatchEvent(new CustomEvent('generator-ready'));
    return;
  }

  // =============================================
  // 5. Chapter extraction
  // =============================================
  
  function getChapterContent(rawText, chapterKey) {
    const [book, chapter] = chapterKey.split('.');
    
    const startPatterns = [
      new RegExp(`Book\\s+${book},\\s*Chapter\\s+${chapter}\\.`, 'i'),
      new RegExp(`§\\s+${book}\\.${chapter}\\.\\d+`, 'i')
    ];

    const nextChapter = parseInt(chapter) + 1;
    const nextBook = parseInt(book) + 1;
    const endPatterns = [];

    // 1.
    endPatterns.push(new RegExp(`Book\\s+${book},\\s*Chapter\\s+${nextChapter}\\.`, 'i')); // "Book 1, Chapter 2."
    endPatterns.push(new RegExp(`§\\s+${book}\\.${nextChapter}\\.\\d+`, 'i')); // "§ 1.2.x"
    // 2.
    endPatterns.push(new RegExp(`Book\\s+${nextBook}\\.`, 'i')); // "Book 2."
    endPatterns.push(new RegExp(`§\\s+${nextBook}\\.\\d+\\.\\d+`, 'i')); // "§ 2.x.x"
    
    let startIndex = -1;
    let endIndex = rawText.length;
    
    for (const pattern of startPatterns) {
      const match = rawText.match(pattern);
      if (match) {
        startIndex = match.index;
        break;
      }
    }
    
    if (startIndex === -1) {
      console.warn(`Could not find start of chapter "${chapterKey}"`);
      return '';
    }
    
    for (const pattern of endPatterns) {
      const match = rawText.match(pattern);
      if (match && match.index > startIndex) {
        endIndex = match.index;
        break;
      }
    }
    
    return rawText.substring(startIndex, endIndex).trim();
  }

  // =============================================
  // 6. Process each chapter
  // =============================================
  
  const chapters = document.querySelectorAll('div.chapter-body');
  if (chapters.length === 0) {
    console.warn("No .chapter-body elements found.");
    document.dispatchEvent(new CustomEvent('generator-ready'));
    return;
  }
  
  const totalChapters = chapters.length;
  const loadingTextEl = document.getElementById('loadingText');
  console.log('loadingTextEl:', loadingTextEl);
  
  // Set initial progress text
  if (loadingTextEl) {
    loadingTextEl.textContent = `Chapters generated: 0/${totalChapters}`;
  }
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const sectionId = chapter.getAttribute('data-section');
    const textgridSrc = chapter.getAttribute('data-textgrid-src');
    
    if (!sectionId || !textgridSrc) {
      console.warn(`Chapter missing data-section or data-textgrid-src, skipping.`);
      continue;
    }
  
    const greekContent = getChapterContent(greekText, sectionId);
    const englishContent = getChapterContent(englishText, sectionId) || '';
  
    if (!greekContent) {
      console.warn(`Missing Greek content for chapter ${sectionId}, skipping.`);
      continue;
    }
  
    let textgridContent;
    try {
      const tgResp = await fetch(textgridSrc);
      if (!tgResp.ok) throw new Error(`TextGrid HTTP ${tgResp.status}`);
      textgridContent = await tgResp.text();
    } catch (err) {
      console.error(`Failed to load TextGrid for ${sectionId}:`, err);
      continue;
    }
  
    // =============================================
    // 7. Call Python alignment
    // =============================================
  
    const alignAndGenerateHTML = pyodide.globals.get('align_and_generate_html');
    if (!alignAndGenerateHTML) {
      console.error("align_and_generate_html not found in Python globals");
      document.dispatchEvent(new CustomEvent('generator-ready'));
      return;
    }
    
    try {
      const useTabs = config.sectionDisplayType === "tabs";
      const result = alignAndGenerateHTML(greekContent, englishContent, textgridContent, useTabs);
      
      const greekHtml = result[0];
      const englishHtml = result[2];
  
      const greekSpan = chapter.querySelector('span.greek-output');
      const englishSpan = chapter.querySelector('span.english-output');
  
      if (greekSpan) {
        greekSpan.innerHTML = greekHtml;
      }
      if (englishSpan) {
        englishSpan.innerHTML = englishHtml;
      }
  
      console.log(`✅ Generated HTML for chapter ${sectionId}`);
  
    } catch (err) {
      console.error(`Alignment failed for chapter ${sectionId}:`, err);
    }
  
    // Update loading progress after each chapter (success or failure)
    const done = i + 1;
    if (loadingTextEl) {
      loadingTextEl.textContent = `Chapters generated: ${done}/${totalChapters}`;
    }
  }
  
  console.log("generator.js: finished.");
  document.dispatchEvent(new CustomEvent('generator-ready'));
  return false;
})();
