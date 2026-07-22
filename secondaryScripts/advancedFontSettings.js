function initAdvancedFontSettings() {
  // test
  const sigmaStyleControl = document.getElementById("sigmaStyleControl");
  const piStyleControl = document.getElementById("piStyleControl");
  const kappaStyleControl = document.getElementById("kappaStyleControl");
  const stigmaStyleControl = document.getElementById("stigmaStyleControl");
  const kaiStyleControl = document.getElementById("kaiStyleControl");
  const ouStyleControl = document.getElementById("ouStyleControl");
  const epsilonStyleControl = document.getElementById("epsilonStyleControl");
  const thetaStyleControl = document.getElementById("thetaStyleControl");
  const rhoStyleControl = document.getElementById("rhoStyleControl");
  const phiStyleControl = document.getElementById("phiStyleControl");

  const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");
  
  // ==========================================
  // SIGMA GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (sigmaStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentSigmaStyle = (style) => {
      activeGreekWords.forEach(wordElement => {
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
  // ==========================================
  // PI GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (piStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentPiStyle = (style) => {
      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent; // Don't strip trailing spaces/punctuation with trim()

        if (style === "cursive") {
          wordElement.textContent = currentText.replace(/π/g, "ϖ");
        } else {
          // ONLY target the pi characters when turning it off,
          // leaving whatever the sigma controller did completely untouched!
          wordElement.textContent = currentText.replace(/ϖ/g, "π");
        }
      });
    };

    const savedPiStyle = localStorage.getItem("reader_piStyle") || "standard";
    piStyleControl.value = savedPiStyle;
    
    if (savedPiStyle === "cursive") {
      updateDocumentPiStyle("cursive"); // Fixed the function name typo here
    }

    piStyleControl.addEventListener("change", () => {
      const selectedStyle = piStyleControl.value;
      localStorage.setItem("reader_piStyle", selectedStyle);
      updateDocumentPiStyle(selectedStyle);
    });
  }
  //==========================================
  // KAPPA GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (kappaStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentKappaStyle = (style) => {
      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent; // Don't strip trailing spaces/punctuation with trim()

        if (style === "cursive") {
          wordElement.textContent = currentText.replace(/κ/g, "ϰ");
        } else {
          // ONLY target the kappa characters when turning it off,
          // leaving whatever the sigma controller did completely untouched!
          wordElement.textContent = currentText.replace(/ϰ/g, "κ");
        }
      });
    };

    const savedKappaStyle = localStorage.getItem("reader_kappaStyle") || "standard";
    kappaStyleControl.value = savedKappaStyle;
    
    if (savedKappaStyle === "cursive") {
      updateDocumentKappaStyle("cursive"); // Fixed the function name typo here
    }

    kappaStyleControl.addEventListener("change", () => {
      const selectedStyle = kappaStyleControl.value;
      localStorage.setItem("reader_kappaStyle", selectedStyle);
      updateDocumentKappaStyle(selectedStyle);
    });
  }
  // ==========================================
  // STIGMA GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (stigmaStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentStigmaStyle = (style) => {
      // DYNAMIC CHECK: Look up exactly what the sigma select is currently set to right now
      const currentLiveSigmaStyle = sigmaStyleControl ? sigmaStyleControl.value : "standard";

      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent;

        if (style === "ligature") {
          // Turn both standard and lunate combinations into the ligature ligatures
          wordElement.textContent = currentText.replace(/στ/g, "ϛ")
                                               .replace(/ϲτ/g, "ϛ")
                                               .replace(/Στ/g, "Ϛ")
                                               .replace(/Ϲτ/g, "Ϛ");
        }
        else if (style === "minuscule") {
          // Turn both standard and lunate combinations into the ligature ligatures
          if (currentLiveSigmaStyle === "lunate") {
            wordElement.textContent = currentText.replace(/στ/g, "ϛ").replace(/ϲτ/g, "ϛ").replace(/Ϛ/g, "Ϲτ");
          } else {
            wordElement.textContent = currentText.replace(/στ/g, "ϛ").replace(/ϲτ/g, "ϛ").replace(/Ϛ/g, "Στ");
          }
          
        } else {
          // Turning ligature OFF: check what style of sigma we need to return to
          if (currentLiveSigmaStyle === "lunate") {
            wordElement.textContent = currentText.replace(/ϛ/g, "ϲτ").replace(/Ϛ/g, "Ϲτ");
          } else {
            wordElement.textContent = currentText.replace(/ϛ/g, "στ").replace(/Ϛ/g, "Στ");
          }
        }
      });
    };

    const savedStigmaStyle = localStorage.getItem("reader_stigmaStyle") || "standard";
    stigmaStyleControl.value = savedStigmaStyle;
    
    if (savedStigmaStyle === "ligature") {
      updateDocumentStigmaStyle("ligature");
    }
    else if (savedStigmaStyle === "minuscule") {
      updateDocumentStigmaStyle("minuscule");
    }

    stigmaStyleControl.addEventListener("change", () => {
      const selectedStyle = stigmaStyleControl.value;
      localStorage.setItem("reader_stigmaStyle", selectedStyle);
      updateDocumentStigmaStyle(selectedStyle);
    });
  }
  //==========================================
  // BETA GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (betaStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentBetaStyle = (style) => {
      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent;

        if (style === "cursive") {
          if (currentText.length > 1) {
            wordElement.textContent = currentText[0] + currentText.slice(1).replace(/β/g, "ϐ");
          } else {
            wordElement.textContent = currentText;
          }
        } else {
          // FIX 1: Cleansed syntax braces and added protection when turning cursive OFF
          if (currentText.length > 1) {
            wordElement.textContent = currentText[0] + currentText.slice(1).replace(/ϐ/g, "β");
          } else {
            wordElement.textContent = currentText;
          }
        }
      });
    };

    const savedBetaStyle = localStorage.getItem("reader_betaStyle") || "standard";
    betaStyleControl.value = savedBetaStyle;
    
    if (savedBetaStyle === "cursive") {
      updateDocumentBetaStyle("cursive");
    }

    betaStyleControl.addEventListener("change", () => {
      const selectedStyle = betaStyleControl.value;
      localStorage.setItem("reader_betaStyle", selectedStyle);
      updateDocumentBetaStyle(selectedStyle);
    });
  }
  // ==========================================
  // ΚΑΙ GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (kaiStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentKaiStyle = (style) => {
      const currentLiveKappaStyle = kappaStyleControl ? kappaStyleControl.value : "standard";

      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent;

        // Strip combining diacritics to get visual character count
        const trueLength = [...currentText.replace(/[\u0300-\u0301]/g, "")].length;

        if (style === "ligature" && (trueLength === 3 || trueLength === 1)) {
          wordElement.textContent = currentText
            // 1. Accented Majuscules First
            .replace(/Κα\u03af|Κα\u03b9\u0301/g, "Ϗ\u0301")
            .replace(/Κα\u1f76|Κα\u03b9\u0300/g, "Ϗ\u0300")
            // 2. Accented Minuscules Second (Both standard & cursive kappas)
            .replace(/κα\u03af|κα\u03b9\u0301|ϰα\u03af|ϰα\u03b9\u0301/g, "ϗ\u0301")
            .replace(/κα\u1f76|κα\u03b9\u0300|ϰα\u1f76|ϰα\u03b9\u0300/g, "ϗ\u0300")
            // 3. Bare characters last
            .replace(/Και/g, "Ϗ")
            .replace(/και/g, "ϗ")
            .replace(/ϰαι/g, "ϗ");
        }
        else if (style === "minuscule" && (trueLength === 3 || trueLength === 1)) {
          wordElement.textContent = currentText
            // 1. Turn accented uppercase ligatures into standard uppercase text first
            .replace(/Ϗ\u0301/g, "Κα\u03af")
            .replace(/Ϗ\u0300/g, "Κα\u1f76")
            .replace(/Ϗ/g, "Και")
            // 2. Ensure lowercase kais (even decomposed ones) settle securely into standard ϗ ligatures
            .replace(/κα\u03af|κα\u03b9\u0301|ϰα\u03af|ϰα\u03b9\u0301/g, "ϗ\u0301")
            .replace(/κα\u1f76|κα\u03b9\u0300|ϰα\u1f76|ϰα\u03b9\u0300/g, "ϗ\u0300")
            .replace(/και/g, "ϗ")
            .replace(/ϰαι/g, "ϗ");
        } 
        else if (style === "standard" && (trueLength === 3 || trueLength === 1)) {
          // Turning ligature completely OFF: return everything to full text 
          if (currentLiveKappaStyle === "cursive") {
            wordElement.textContent = currentText
              .replace(/ϗ\u0301/g, "ϰα\u03af")
              .replace(/ϗ\u0300/g, "ϰα\u1f76")
              .replace(/ϗ/g, "ϰαι")
              .replace(/Ϗ\u0301/g, "Κα\u03af")
              .replace(/Ϗ\u0300/g, "Κα\u1f76")
              .replace(/Ϗ/g, "Και");
          } else {
            wordElement.textContent = currentText
              .replace(/ϗ\u0301/g, "κα\u03af")
              .replace(/ϗ\u0300/g, "κα\u1f76")
              .replace(/ϗ/g, "και")
              .replace(/Ϗ\u0301/g, "Κα\u03af")
              .replace(/Ϗ\u0300/g, "Κα\u1f76")
              .replace(/Ϗ/g, "Και");
          }
        } else {
          return;
        }
      });
    };

    const savedKaiStyle = localStorage.getItem("reader_kaiStyle") || "standard";
    kaiStyleControl.value = savedKaiStyle;
    
    if (savedKaiStyle === "ligature") {
      updateDocumentKaiStyle("ligature");
    }
    else if (savedKaiStyle === "minuscule") {
      updateDocumentKaiStyle("minuscule");
    }

    kaiStyleControl.addEventListener("change", () => {
      const selectedStyle = kaiStyleControl.value;
      localStorage.setItem("reader_kaiStyle", selectedStyle);
      updateDocumentKaiStyle(selectedStyle);
    });
  }

  // ==========================================
  // OU GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (ouStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentOuStyle = (style) => {
      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent.trim();
        
        if (style === "ligature") {
          wordElement.textContent = currentText
            .replace(/ου/g, "ȣ")
            .replace(/οὗ/g, "ȣ\u0314\u0342")
            .replace(/οὖ/g, "ȣ\u0313\u0342")
            .replace(/οῦ/g, "ȣ\u0342")
            .replace(/οὓ/g, "ȣ\u0314\u0300")
            .replace(/οὒ/g, "ȣ\u0313\u0300")
            .replace(/οὺ/g, "ȣ\u0300")
            .replace(/οὕ/g, "ȣ\u0314\u0301")
            .replace(/οὔ/g, "ȣ\u0313\u0301")
            .replace(/ού/g, "ȣ\u0301")
            .replace(/οὑ/g, "ȣ\u0314")
            .replace(/οὐ/g, "ȣ\u0313")
            .replace(/Ου/g, "Ȣ")
            .replace(/Οὗ/g, "Ȣ\u0314\u0342")
            .replace(/Οὖ/g, "Ȣ\u0313\u0342")
            .replace(/Οῦ/g, "Ȣ\u0342")
            .replace(/Οὓ/g, "Ȣ\u0314\u0300")
            .replace(/Οὒ/g, "Ȣ\u0313\u0300")
            .replace(/Οὺ/g, "Ȣ\u0300")
            .replace(/Οὕ/g, "Ȣ\u0314\u0301")
            .replace(/Οὔ/g, "Ȣ\u0313\u0301")
            .replace(/Ού/g, "Ȣ\u0301")
            .replace(/Οὑ/g, "Ȣ\u0314")
            .replace(/Οὐ/g, "Ȣ\u0313");
            

          //1
          
          //2.
          
          //3.


          
        } else {
          wordElement.textContent = currentText
          // 1. Accented Lowercase Ligatures First
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
            
            // 2. Accented Uppercase Ligatures Second
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

            // 3. Bare Base Ligatures Last
            .replace(/ȣ/g, "ου")
            .replace(/Ȣ/g, "Ου");
        }
      });
    };

    const savedOuStyle = localStorage.getItem("reader_ouStyle") || "standard";
    ouStyleControl.value = savedOuStyle;
    if (savedOuStyle === "ligature") {
      updateDocumentOuStyle("ligature");
    }

    ouStyleControl.addEventListener("change", () => {
      const selectedStyle = ouStyleControl.value;
      localStorage.setItem("reader_ouStyle", selectedStyle);
      updateDocumentOuStyle(selectedStyle);
    });
  }
  // ==========================================
  // EPSILON GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (epsilonStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentEpsilonStyle = (style) => {
      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent.trim();
        
        if (style === "lunate") {
          wordElement.textContent = currentText
            .replace(/ε/g, "ϵ")
            .replace(/ἓ/g, "ϵ\u0314\u0300")
            .replace(/ἒ/g, "ϵ\u0313\u0300")
            .replace(/ὲ/g, "ϵ\u0300")
            .replace(/ἕ/g, "ϵ\u0314\u0301")
            .replace(/ἔ/g, "ϵ\u0313\u0301")
            .replace(/έ/g, "ϵ\u0301")
            .replace(/ἑ/g, "ϵ\u0314")
            .replace(/ἐ/g, "ϵ\u0313");
        } else {
          wordElement.textContent = currentText
            // 1. Double-Diacritic Lunate Forms First (Breathing + Accent)
            .replace(/ϵ\u0314\u0300/g, "ἓ")
            .replace(/ϵ\u0313\u0300/g, "ἒ")
            .replace(/ϵ\u0314\u0301/g, "ἕ")
            .replace(/ϵ\u0313\u0301/g, "ἔ")

            // 2. Single-Diacritic Lunate Forms Second (Accent or Breathing Only)
            .replace(/ϵ\u0300/g, "ὲ")
            .replace(/ϵ\u0301/g, "έ")
            .replace(/ϵ\u0314/g, "ἑ")
            .replace(/ϵ\u0313/g, "ἐ")

            // 3. Bare Base Letter Last
            .replace(/ϵ/g, "ε");
        }
      });
    };

    const savedEpsilonStyle = localStorage.getItem("reader_epsilonStyle") || "standard";
    epsilonStyleControl.value = savedEpsilonStyle;
    if (savedEpsilonStyle === "lunate") {
      updateDocumentEpsilonStyle("lunate");
    }

    epsilonStyleControl.addEventListener("change", () => {
      const selectedStyle = epsilonStyleControl.value;
      localStorage.setItem("reader_epsilonStyle", selectedStyle);
      updateDocumentEpsilonStyle(selectedStyle);
    });
  }
  //==========================================
  // THETA GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (thetaStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentThetaStyle = (style) => {
      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent; // Don't strip trailing spaces/punctuation with trim()

        if (style === "cursive") {
          wordElement.textContent = currentText.replace(/θ/g, "ϑ");
        } else {
          wordElement.textContent = currentText.replace(/ϑ/g, "θ");
        }
      });
    };

    const savedThetaStyle = localStorage.getItem("reader_thetaStyle") || "standard";
    thetaStyleControl.value = savedThetaStyle;
    
    if (savedThetaStyle === "cursive") {
      updateDocumentThetaStyle("cursive"); // Fixed the function name typo here
    }

    thetaStyleControl.addEventListener("change", () => {
      const selectedStyle = thetaStyleControl.value;
      localStorage.setItem("reader_thetaStyle", selectedStyle);
      updateDocumentThetaStyle(selectedStyle);
    });
  }
  //==========================================
  // PHI GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (phiStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentPhiStyle = (style) => {
      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent; // Don't strip trailing spaces/punctuation with trim()

        if (style === "variant") {
          wordElement.textContent = currentText.replace(/φ/g, "ϕ");
        } else {
          wordElement.textContent = currentText.replace(/ϕ/g, "φ");
        }
      });
    };

    const savedPhiStyle = localStorage.getItem("reader_phiStyle") || "standard";
    phiStyleControl.value = savedPhiStyle;
    
    if (savedPhiStyle === "variant") {
      updateDocumentPhiStyle("variant"); // Fixed the function name typo here
    }

    phiStyleControl.addEventListener("change", () => {
      const selectedStyle = phiStyleControl.value;
      localStorage.setItem("reader_phiStyle", selectedStyle);
      updateDocumentPhiStyle(selectedStyle);
    });
  }
  
  // ==========================================
  // RHO GLYPH VARIANT SELECTION CONTROL
  // ==========================================
  if (rhoStyleControl) {
    const activeGreekWords = document.querySelectorAll(".chapter-body.active .text span.word");

    const updateDocumentRhoStyle = (style) => {
      activeGreekWords.forEach(wordElement => {
        let currentText = wordElement.textContent.trim();
        
        if (style === "variant") {
          wordElement.textContent = currentText
            .replace(/ρ/g, "ϱ")
            .replace(/ῥ/g, "ϱ\u0314")
            .replace(/ῤ/g, "ϱ\u0313");
        } else {
          wordElement.textContent = currentText
            .replace(/ϱ\u0314/g, "ῥ")
            .replace(/ϱ\u0313/g, "ῤ")
            .replace(/ϱ/g, "ρ");
        }
      });
    };

    const savedRhoStyle = localStorage.getItem("reader_rhoStyle") || "standard";
    rhoStyleControl.value = savedRhoStyle;
    if (savedRhoStyle === "variant") {
      updateDocumentRhoStyle("variant");
    }

    rhoStyleControl.addEventListener("change", () => {
      const selectedStyle = rhoStyleControl.value;
      localStorage.setItem("reader_rhoStyle", selectedStyle);
      updateDocumentRhoStyle(selectedStyle);
    });
  }
}
