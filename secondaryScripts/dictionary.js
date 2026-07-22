// secondaryScripts/dictionary.js

window.DictionaryEngine = {
  // --- Constants moved to standard object properties ---
  grammaticalFeatures: {
    // Person
    '1st': '1st person', '2nd': '2nd person', '3rd': '3rd person',
  
    // Number
    'sg': 'singular', 'pl': 'plural', 'dual': 'dual',
  
    // Gender (for Nouns/Adjectives/Participles)
    'masc': 'masculine', 'fem': 'feminine', 'neut': 'neuter', 'masc/fem': 'masculine/feminine', 'masc/neut': 'masculine/neuter',
    
    // Dialects
    '*theocr.': '(Theocritus)', 'attic': 'Attic', 'doric': 'Doric', 'epic': 'Epic', 'ionic': 'Ionic', 'homeric': 'Homeric', 'aeolic': 'Aeolic',
  
    // Other
    'contr': 'contracted', 'indeclform': 'indeclinable', 'proclitic': 'proclitic', 'enclitic': 'enclitic', 'unaugmented': 'unaugmented'
  },

  verbMarkers: {
    // Tense
    'pres': 'present', 'imperf': 'imperfect', 'aor': 'aorist', 'aor1': '1st aorist', 'aor2': '2nd aorist',
    'perf': 'perfect', 'plup': 'pluperfect', 'fut': 'future', 'futperf': 'future perfect', 'pres_redupl': 'present (reduplicated)',
  
    // Voice
    'act': 'active', 'mid': 'middle', 'pass': 'passive', 'mp': 'middle-passive',
    
    // Mood
    'ind': 'indicative', 'subj': 'subjunctive', 'opt': 'optative', 'imp': 'imperative', 'imperat': 'imperative', 'inf': 'infinitive'
  },

  cases: {
    'nom': 'nominative', 'gen': 'genitive', 'dat': 'dative', 'acc': 'accusative', 'voc': 'vocative', 'nom/voc': 'nominative/vocative', 'nom/voc/acc': 'nominative/vocative/accusative'
  },

  partsOfSpeech: {
    'conj': 'conjunction', 'part': 'participle', 'particle': 'particle', 'art_adj': 'adjective (pronominal)', 'adj': 'adjective', 'article': 'article', 'prep': 'preposition', 'numeral': 'numeral', 'adverb': 'adverb', 'exclam': 'exclamation', 'pron1': 'pronoun', 'pron2': 'pronoun', 'pron3': 'pronoun', 'relative': 'relative pronoun'
  },

  partsOfSpeechFeatures: {
    'comp': 'comparative',' irreg_superl': 'superlative', 'irreg_super2': 'superlative', 'super': 'superlative', 'indef': 'indefinite'
  },

  getElisionCandidates(word) {
    // Strip common Greek apostrophe / coronis variants: 
    // \u02BC (ʼ), \u1FBF (᾽), \u012F, and basic '
    const cleanWord = word.replace(/[\u02BC\u012F\u1FBF']/g, '');
    
    // Devoice aspirated consonants (χ -> κ, θ -> τ, φ -> π) at the end of the base word
    let base = cleanWord;
    if (base.endsWith('χ')) {
      base = base.slice(0, -1) + 'κ';
    } else if (base.endsWith('θ')) {
      base = base.slice(0, -1) + 'τ';
    } else if (base.endsWith('φ')) {
      base = base.slice(0, -1) + 'π';
    }

    // Attempt standard vowels and grave variants
    const vowels = ['α', 'ε', 'ι', 'ο', 'υ', 'ὰ', 'ὲ', 'ὶ', 'ὸ', 'ὺ'];
    
    return vowels.map(vowel => base + vowel);
  },
  
  // --- Display Formatting Engine Helper ---
  getDisplayGrammar(rawDetails) {
    let tagsArray = [];
    if (Array.isArray(rawDetails)) {
      tagsArray = rawDetails;
    } else if (typeof rawDetails === 'string') {
      tagsArray = rawDetails.split(/\s+/);
    }

    const uniqueTags = [...new Set(tagsArray)];

    let partOfSpeechFeature = null;
    let partOfSpeech = null;
    const features = [];

    let hasVerbMarker = false;
    let hasCase = false;
    let hasIndeclinable = false;

    const allFeaturesLookup = { ...this.grammaticalFeatures, ...this.verbMarkers, ...this.cases };

    const defaultPreferredOrder = [
      // Tense
      'pres', 'imperf', 'aor', 'aor1', 'aor2', 'perf', 'plup', 'fut', 'futperf', 'pres_redupl',
      // Voice
      'act', 'mid', 'pass', 'mp',
      // Gender / Case
      'masc', 'fem', 'neut', 'masc/fem', 'masc/neut',
      'nom', 'gen', 'dat', 'acc', 'voc', 'nom/voc', 'nom/voc/acc',
      // Number
      'sg', 'pl', 'dual',
      // Dialects & Extras
      'attic', 'doric', 'epic', 'ionic', 'homeric', 'aeolic', '*theocr.',
      'contr', 'proclitic', 'enclitic', 'unaugmented', 'indeclform'
    ];

    const verbPreferredOrder = [
      // Tense
      'pres', 'imperf', 'aor', 'aor1', 'aor2', 'perf', 'plup', 'fut', 'futperf', 'pres_redupl',
      // Voice
      'act', 'mid', 'pass', 'mp',
      // Mood
      'ind', 'subj', 'opt', 'imp', 'imperat', 'inf',
      // Person / Number
      '1st', '2nd', '3rd', 'sg', 'pl', 'dual',
      // Dialects & Extras
      'attic', 'doric', 'epic', 'ionic', 'homeric', 'aeolic', '*theocr.',
      'contr', 'proclitic', 'enclitic', 'unaugmented', 'indeclform'
    ];
    
    uniqueTags.forEach(tag => {
      if (this.partsOfSpeech[tag]) {
        const fullText = this.partsOfSpeech[tag];
        const spaceIndex = fullText.indexOf(' ');
        if (spaceIndex !== -1) {
          partOfSpeechFeature = fullText.substring(0, spaceIndex);
          partOfSpeech = fullText.substring(spaceIndex + 1);
        } else {
          partOfSpeech = fullText;
        }
      }
      else if (this.partsOfSpeechFeatures[tag]) {
        partOfSpeechFeature = this.partsOfSpeechFeatures[tag];
      }
      
      if (this.verbMarkers[tag]) {
        hasVerbMarker = true;
      }
    });

    let resolvedPOS = partOfSpeech;
    if (!resolvedPOS) {
      resolvedPOS = hasVerbMarker ? 'verb' : '(pro)noun';
    }

    const activeOrder = (resolvedPOS === 'verb') ? verbPreferredOrder : defaultPreferredOrder;

    activeOrder.forEach(tag => {
      if (uniqueTags.includes(tag)) {
        if (allFeaturesLookup[tag]) {
          features.push(allFeaturesLookup[tag]);

          if (this.cases[tag]) hasCase = true;
          if (tag === 'indeclform') hasIndeclinable = true;
        }
      }
    });

    partOfSpeech = resolvedPOS;

    // Rule 1: IF AND ONLY IF beforehand it doesn't have any part of speech
    if (!partOfSpeech) {
      // Rule 2: If it has a verb marker, it's given 'verb'
      if (hasVerbMarker) {
        partOfSpeech = 'verb';
      } 
      // Rule 3: AND THENNNN if it ALSO doesn't have a verb marker, it's a noun
      else {
        partOfSpeech = '(pro)noun';
      }
    }

    const finalFeatures = (hasCase && hasIndeclinable)
      ? features.filter(f => f !== 'indeclinable')
      : features;

    return { partOfSpeechFeature, partOfSpeech, features: finalFeatures };
  },
  
  async renderEntry(cleanLookupKey, wordElement, jsonPath) {
    const popupContent = document.getElementById("popupContent");
    if (!popupContent) return;
    const littleNoteHTML = `
        <div>
          <br><br>
          <ital-small>Lookups are generated automatically using the 
            <a href="https://github.com/alpheios-project/morpheus" target="_blank" class="link">Alpheios</a> 
            version of the Morpheus parser and entries from the 
            <a href="https://github.com/TylerKirby/auto-commentary/blob/master/autocom/languages/greek/data/middle_liddell.xml" target="_blank" class="link">Middle Liddell</a>. 
            They may contain errors. If you like, you can compare the output of 
            <a href="https://logeion.uchicago.edu/morpho/${encodeURIComponent(cleanLookupKey)}" target="_blank" class="link">Μορφώ</a> 
            and 
            <a href="https://anastrophe.uchicago.edu/morpheus?word=${encodeURIComponent(cleanLookupKey)}" target="_blank" class="link">Morpheus</a>.
          </ital-small>
        </div>
      `;

    try {
      const response = await fetch(jsonPath);
      if (!response.ok) throw new Error("Could not parse source JSON db file.");
      
      const database = await response.json();
      let wordData = database[cleanLookupKey];

      // If there's no direct hit and the word has an elision character, run the fallback generator
      if (!wordData && (cleanLookupKey.endsWith('\u02BC') || cleanLookupKey.endsWith("'") || cleanLookupKey.endsWith('\u1FBF'))) {
        const candidates = this.getElisionCandidates(cleanLookupKey);
        for (const candidate of candidates) {
          if (database[candidate]) {
            wordData = database[candidate];
            break; // Match found, break out of loop
          }
        }
      }
      // ----------------------------------------
      
      if (!wordData || !wordData.options || wordData.options.length === 0) {
        popupContent.innerHTML = `<div>No parsed grammatical entries found for "${cleanLookupKey}".</div>` + littleNoteHTML;
        return;
      }

      const start = wordElement.dataset.wordStart || "";
      const end = wordElement.dataset.wordEnd || "";
      const hasValidTiming = (start !== "" && end !== "" && start !== "n/a" && end !== "n/a");

      const formatGlossWithToggle = (glossText) => {
        if (!glossText) return '—';
        const semicolonIndex = glossText.indexOf(';');
        if (semicolonIndex === -1) return glossText;

        const visiblePart = glossText.substring(0, semicolonIndex + 1);
        const hiddenPart = glossText.substring(semicolonIndex + 1);

        return `
          <span>${visiblePart}</span><!--
       --><span class="extra-gloss" style="display: none;">${hiddenPart}</span>
          <button class="gloss-toggle-btn" onclick="DictionaryEngine.toggleGloss(this);" style="cursor: pointer; z-index: 10;">
            More
          </button>
        `;
      };

      // --- Group options by Lemma ---
      const groupedByLemma = {};
      wordData.options.forEach(option => {
        const lemmaKey = option.lemma || '—';
        if (!groupedByLemma[lemmaKey]) {
          groupedByLemma[lemmaKey] = [];
        }
        groupedByLemma[lemmaKey].push(option);
      });

      // --- Single Surface Form Header (at the top, rendered once) ---
      const audioButtonHTML = hasValidTiming 
        ? ` <button class="dict-speak-btn" data-start="${start}" data-end="${end}" style="cursor:pointer; background:none; border:none; font-size:1.1em;">🔊</button>` 
        : '';
      
      let finalHTML = `
        <div class="dict-surface-header" style="font-size: 1.15em; font-weight: bold; border-bottom: 2px solid #eee; padding-bottom: 6px; margin-bottom: 10px;">
          Word: <span style="color: #2b2b2b;">${cleanLookupKey}</span>${audioButtonHTML}
        </div>
      `;

      // --- Generate Cards Grouped by Lemma ---
      const cardsHTML = Object.keys(groupedByLemma).map(lemma => {
        const optionsList = groupedByLemma[lemma];
        const sharedGlossHTML = formatGlossWithToggle(optionsList[0].gloss);

        // If there is only 1 analysis for this lemma
        if (optionsList.length === 1) {
          const option = optionsList[0];
          const display = this.getDisplayGrammar(option.details);
          const featureTagsHTML = display.features.length > 0
            ? display.features.map(f => `<span class="grammar-tag" style="background:#f1f3f5; padding:2px 6px; margin-right:4px; border-radius:4px; font-size:0.85em; display:inline-block;">${f}</span>`).join(' ')
            : '—';

          return `
            <div class="dict-entry-card" style="line-height: 1.4;">
              <div><strong>Lemma:</strong> <span style="color:#007bff; font-weight:bold; font-size:1.05em;">${lemma}</span></div>
              <div style="margin-top: 3px;"><strong>Gloss:</strong> <span>${sharedGlossHTML}</span></div>
              
              <div class="lemma-sub-option" style="margin-top: 6px; padding-left: 10px; border-left: 2px solid #dee2e6;">
                <div>
                  <strong>Part of Speech:</strong> 
                  <span style="color:#2b8a3e; font-weight:bold; text-transform: capitalize;">
                    ${display.partOfSpeechFeature ? `<span>${display.partOfSpeechFeature}</span> ` : ''}
                    <span style="text-transform: ${display.partOfSpeech.startsWith('(') ? 'none' : 'capitalize'};">${display.partOfSpeech}</span>
                  </span>
                </div>
                <div style="margin-top: 3px;">
                  <strong>Features:</strong> <span>${featureTagsHTML}</span>
                </div>
              </div>
            </div>
          `;
        } 
        
        // If there are MULTIPLE analyses for this lemma (Features (1), Features (2)...)
        else {
          const analysesHTML = optionsList.map((option, idx) => {
            const display = this.getDisplayGrammar(option.details);
            const featureTagsHTML = display.features.length > 0
              ? display.features.map(f => `<span class="grammar-tag" style="background:#f1f3f5; padding:2px 6px; margin-right:4px; border-radius:4px; font-size:0.85em; display:inline-block;">${f}</span>`).join(' ')
              : '—';

            return `
              <div class="lemma-sub-option" style="margin-top: 8px; padding-left: 10px; border-left: 2px solid #dee2e6;">
                <div style="font-size: 0.9em; color: #6c757d; font-weight: bold; margin-bottom: 3px;">Analysis (${idx + 1}):</div>
                <div>
                  <strong>Part of Speech:</strong> 
                  <span style="color:#2b8a3e; font-weight:bold; text-transform: capitalize;">
                    ${display.partOfSpeechFeature ? `<span>${display.partOfSpeechFeature}</span> ` : ''}
                    <span style="text-transform: ${display.partOfSpeech.startsWith('(') ? 'none' : 'capitalize'};">${display.partOfSpeech}</span>
                  </span>
                </div>
                <div style="margin-top: 3px;">
                  <strong>Features:</strong> <span>${featureTagsHTML}</span>
                </div>
              </div>
            `;
          }).join('');

          return `
            <div class="dict-entry-card" style="line-height: 1.4;">
              <div><strong>Lemma:</strong> <span style="color:#007bff; font-weight:bold; font-size:1.05em;">${lemma}</span></div>
              <div style="margin-top: 3px;"><strong>Gloss:</strong> <span>${sharedGlossHTML}</span></div>
              ${analysesHTML}
            </div>
          `;
        }
      }).join('<hr style="border:0; border-top:1px dashed #ccc; margin:12px 0;">');
      
      popupContent.innerHTML = finalHTML + cardsHTML + littleNoteHTML;

      if (typeof setupDictionaryAudioButton === "function") {
        setupDictionaryAudioButton();
      }

    } catch (error) {
      console.error("Dictionary Engine Processing Fault:", error);
      popupContent.innerHTML = `<span style="color:red;">Error syncing lookups dynamically.</span>`;
    }
  },

  toggleGloss(buttonElement) {
    const glossContainer = buttonElement.parentNode;
    const hiddenSpan = glossContainer.querySelector('.extra-gloss');
    
    if (hiddenSpan.style.display === "none") {
      hiddenSpan.style.display = "inline";
      buttonElement.textContent = "Less";
    } else {
      hiddenSpan.style.display = "none";
      buttonElement.textContent = "More";
    }
  }
};
