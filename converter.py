import re
import html

def contains_greek(text):
    if not text:
        return False
    return bool(re.search(r'[\u0370-\u03FF\u1F00-\u1FFF]', text))

def convert_notes(html_string):
    pattern = re.compile(r'GGGG([0-9A-Fa-f]+?)HHHH([0-9A-Fa-f]+?)IIII')
    def repl(match):
        display_hex = match.group(1)
        note_hex = match.group(2)
        # Decode hex pairs into Unicode characters (each code point is 4 hex digits)
        display_text = ''.join(chr(int(display_hex[i:i+4], 16)) for i in range(0, len(display_hex), 4))
        note_text = ''.join(chr(int(note_hex[i:i+4], 16)) for i in range(0, len(note_hex), 4))
        # Escape the note content for safe HTML insertion
        safe_note = html.escape(note_text)
        safe_display = html.escape(display_text)
        # Return the note-marker span. It will be inserted inside the word span.
        return f'</span><span class="note-marker" data-note="{safe_note}">{safe_display}'
    return pattern.sub(repl, html_string)

def clean_for_matching(text):
    if text and text[0] in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz":
        cleaned = re.sub(r'[\d\W_]+', '', text.lower())
        return cleaned
    elif text and text[0] in "0123456789":
        cleaned = re.sub(r'[\W_]+', '', text.lower())
        return cleaned
    else:
        cleaned = re.sub(r'[ABCDEFGHIJKLMNOPQRSTUVWXYZ\d\W_]+', '', text.lower())
        return cleaned

def parse_textgrid_intervals(textgrid_content):
    parts = re.split(r'item\s*\[\s*2\s*\]\s*:', textgrid_content)
    if len(parts) < 2:
        # Fallback: if not found, try to find "item [2]" (no colon)
        parts = re.split(r'item\s*\[\s*2\s*\]', textgrid_content)
    if len(parts) < 2:
        # If still not found, parse everything (original behavior) – but ideally we shouldn't.
        word_tier_content = textgrid_content
    else:
        word_tier_content = parts[1]  # The second part is everything after "item [2]:"
    
    intervals = []
    # Now parse only intervals within this Word tier block
    block_pattern = re.compile(r'intervals\s*\[\d+\]\s*:\s*xmin\s*=\s*([\d.]+)\s*xmax\s*=\s*([\d.]+)\s*text\s*=\s*"([^"]*)"')
    
    for match in block_pattern.finditer(word_tier_content):
        xmin = float(match.group(1))
        xmax = float(match.group(2))
        word_text = match.group(3).strip()
        
        if word_text:  # skip empty (there are a few)
            intervals.append({
                "start": xmin,
                "end": xmax,
                "text": word_text,
                "clean": clean_for_matching(word_text)
            })
    return intervals

def get_anchor_words(sections_dict, n=5, position="start"):
    """Extract the first or last n clean words from the parsed Greek sections."""
    words = []
    
    # Gather all clean words in sequence
    for sec in sorted(sections_dict.keys()):
        for item in sections_dict[sec]:
            phrase_words = item["visual"].split()
            for w in phrase_words:
                if len(w) > 0 and 's' in w and w[0] not in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789": #make sure that this function doesnt affect english words 
                    continue
                clean_w = clean_for_matching(w)
                if clean_w:
                    words.append(clean_w)
                    
    if position == "start":
        return words[:n]
    elif position == "end":
        return words[-n:]
    return []

def anchor_textgrid(tg_intervals, start_anchor, end_anchor):
    """Scan the TextGrid for both start and end boundaries and slice the intervals."""
    if not start_anchor or not end_anchor:
        return tg_intervals
    
    n_start = len(start_anchor)
    n_end = len(end_anchor)
    
    start_idx = 0
    end_idx = len(tg_intervals) # Default to the end if not found
    
    # 1. Find the start anchor (scan forward)
    for i in range(len(tg_intervals) - n_start + 1):
        match = True
        for j in range(n_start):
            tg_clean = tg_intervals[i+j]["clean"]
            anchor_w = start_anchor[j]
            
            if tg_clean != anchor_w and anchor_w not in tg_clean and tg_clean not in anchor_w:
                match = False
                break
                
        if match:
            start_idx = i
            break
            
    # 2. Find the end anchor (scan backward to avoid inner false matches)
    for i in range(len(tg_intervals) - n_end, start_idx - 1, -1):
        match = True
        for j in range(n_end):
            tg_clean = tg_intervals[i+j]["clean"]
            anchor_w = end_anchor[j]
            
            if tg_clean != anchor_w and anchor_w not in tg_clean and tg_clean not in anchor_w:
                match = False
                break
                
        if match:
            # We want to include the end anchor words in our slice, so we add n_end
            end_idx = i + n_end
            break
            
    # 3. Slice the intervals to only include what is inside the bounding box
    return tg_intervals[start_idx:end_idx]

def parse_source_text_with_sentences(raw_text):
    #"""
    #Parses raw text into sections, applying the universal custom alignment markup X{Y}.
    #Returns a dictionary of section numbers mapped to bundles of parallel string tracks:
    #- "struct": Modified text used for punctuation and layout boundary matching.
    #- "visual": Cleaned presentation text displayed on the webpage.
    #"""
    lines = raw_text.split('\n')
    sections_dict = {}
    current_section = None
    
    for line in lines:
        line = line.strip()
        if not line or "Event Date:" in line:
            continue
            
        diogenes_match = re.search(r'Section\s+(\d+)\.', line, re.IGNORECASE)
        topos_match = re.search(r'(?:§\s*\d+\.\d+\.(\d+)|\[(\d+)\])', line)
        
        if diogenes_match:
            current_section = int(diogenes_match.group(1))
            continue 
        elif topos_match:
            sec_num = topos_match.group(1) or topos_match.group(2)
            current_section = int(sec_num)
            line = re.sub(r'(?:§\s*\d+\.\d+\.\d+|\[\d+\])\s*(?:Book_\d+)?', '', line).strip()
            
        if current_section is None:
            continue
            
        if current_section not in sections_dict:
            sections_dict[current_section] = []
            
        # --- UNIVERSAL ALIGNMENT MARKUP PARSER ---
        def structural_replacer(match):
            brace_content = match.group(2)
            return brace_content  # If empty, deletes preceding character

        # Track A: Structural logic (X turns to Y or drops)
        structural_line = re.sub(r'(.)\{(.*?)\}', structural_replacer, line)
        # Track B: Visual display logic (keeps X, completely deletes brace block)
        visual_line = re.sub(r'(.)\{(.*?)\}', r'\1', line)
            
        # Map sentence split boundaries based exclusively on the structural track rules
        sentence_ends = [m.end() for m in re.finditer(r'(?<=[.·;:•!?])\s+', structural_line)]
        
        start_pos = 0
        for end_pos in sentence_ends:
            s_struct = structural_line[start_pos:end_pos].strip()
            s_visual = visual_line[start_pos:end_pos].strip()
            if s_struct or s_visual:
                sections_dict[current_section].append({"struct": s_struct, "visual": s_visual})
            start_pos = end_pos
            
        s_struct_tail = structural_line[start_pos:].strip()
        s_visual_tail = visual_line[start_pos:].strip()
        if s_struct_tail or s_visual_tail:
            sections_dict[current_section].append({"struct": s_struct_tail, "visual": s_visual_tail})
                
    return sections_dict

def split_punctuation(word):
    punct = set('.,·;:’\'()[]{}"“”—–?!«»')   # add any other punctuation you need
    i = 0
    while i < len(word) and word[i] in punct:
        i += 1
    j = len(word)
    while j > i and word[j-1] in punct:
        j -= 1
    return word[:i], word[i:j], word[j:]
    
def format_timestamp(val):
    """Safely format timestamps as two decimal places or string ('n/a')."""
    if val is None or val == "n/a":
        return "n/a"
    return f"{val:.2f}" if isinstance(val, (int, float)) else str(val)
    
def align_and_generate_html(greek_text, english_text, textgrid_text, use_tabs=False, use_nothing=False):
    """Run cross-source text matching with recursive strict symmetry checks (Section -> Sentence -> Sub-phrase)."""
    
    # 1. Very first thing: Convert user-friendly {notes} into hex and remove the {} in the Greek text
    def preprocess_greek_notes(text):
        pattern = re.compile(r'GGGG\{(.*?)\}HHHH\{(.*?)\}IIII')
        def repl(match):
            # Convert characters to hex, effectively dropping the {} brackets
            display_hex = ''.join(f'{ord(c):04X}' for c in match.group(1))
            note_hex = ''.join(f'{ord(c):04X}' for c in match.group(2))
            return f'GGGG{display_hex}HHHH{note_hex}IIII'
        return pattern.sub(repl, text)

    # Apply ONLY to the Greek text before any alignment parsing happens
    greek_text = preprocess_greek_notes(greek_text)
    
    greek_sections = parse_source_text_with_sentences(greek_text)
    english_sections = parse_source_text_with_sentences(english_text)
    tg_intervals = parse_textgrid_intervals(textgrid_text)

    start_anchor = get_anchor_words(greek_sections, n=5, position="start")
    end_anchor = get_anchor_words(greek_sections, n=5, position="end")
    tg_intervals = anchor_textgrid(tg_intervals, start_anchor, end_anchor)
    
    tg_idx = 0
    num_intervals = len(tg_intervals)
    
    output_1_lines = []
    output_2_lines = []
    output_3_lines = []
    
    all_sections = sorted(greek_sections.keys())
        
    for idx, sec in enumerate(all_sections):
        sec_sentences_grc = greek_sections.get(sec, [])
        sec_sentences_eng = english_sections.get(sec, [])
        
        # Guard 1: Do the two languages have the exact same number of main sentences in this section?
        match_sentences = len(sec_sentences_grc) == len(sec_sentences_eng)
        
        section_start_timestamp = None
        coordinate_timestamps = {}
        
        # --- PROCESS GREEK ---
        is_first_phrase = True
        is_first_english_phrase = True
        for s_idx, grc_item in enumerate(sec_sentences_grc):
            s_num = s_idx + 1
            
            # Extract English equivalent dictionary block safely
            eng_item = sec_sentences_eng[s_idx] if (match_sentences and s_idx < len(sec_sentences_eng)) else {"struct": "", "visual": ""}
            
            # Sub-phrase Slicing 1: Layout tracking engine splits using structural lines
            raw_sub_grc_struct = [p.strip() for p in re.split(r'(?<=[,.,·;:•!?\x27’])\s+', grc_item["struct"]) if p.strip()]
            raw_sub_eng_struct = [p.strip() for p in re.split(r'(?<=[,])\s+', eng_item["struct"]) if p.strip()]
            
            # Sub-phrase Slicing 2: Content layout engine splits using pure visual strings
            raw_sub_grc_visual = [p.strip() for p in re.split(r'(?<=[,.,·;:•!?\x27’])\s+', grc_item["visual"]) if p.strip()]
            
            # Guard 2: Symmetry evaluation relies strictly on modified structural tokens
            match_sub_phrases = match_sentences and (len(raw_sub_grc_struct) == len(raw_sub_eng_struct))
            
            for ss_idx, phrase_visual in enumerate(raw_sub_grc_visual):
                ss_num = ss_idx + 1
                
                words = phrase_visual.split()
                matched_words_data = []
                phrase_start_time = None
                
                for word in words:
                    # --- SILENT WORD DETECTION ---
                    if len(word) > 0 and 's' in word and word[0] not in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789":
                        clean_display_word = re.sub(r'[sS]', '', word)
                        if clean_display_word:
                            matched_words_data.append({
                                "text": clean_display_word,
                                "start": "n/a",
                                "end": "n/a",
                                "is_punc": False
                            })
                        # Bypass TextGrid scanning completely
                        continue
                        
                    clean_w = clean_for_matching(word)
                    if not clean_w:
                        matched_words_data.append({"text": word, "start": None, "end": None, "is_punc": True})
                        continue
                    
                    word_start, word_end = 0.0, 0.0
                    found_match = False
                    attempts = 0
                    
                    while tg_idx < num_intervals and attempts < 15:
                        tg_clean = tg_intervals[tg_idx]["clean"]
                        if tg_clean == clean_w or clean_w in tg_clean or tg_clean in clean_w:
                            word_start = tg_intervals[tg_idx]["start"]
                            word_end = tg_intervals[tg_idx]["end"]
                            if phrase_start_time is None:
                                phrase_start_time = word_start
                            tg_idx += 1
                            found_match = True
                            break
                        else:
                            tg_idx += 1
                            attempts += 1
                    
                    if not found_match:
                        word_start = tg_intervals[tg_idx-1]["end"] if tg_idx > 0 else 0.0
                        word_end = word_start + 0.5
                        if phrase_start_time is None:
                            phrase_start_time = word_start
                    
                    matched_words_data.append({
                        "text": word, "start": word_start, "end": word_end, "is_punc": False
                    })
                
                if phrase_start_time is None:
                    phrase_start_time = "n/a"
                
                # Only capture the section start timestamp if it's a valid numeric value
                if section_start_timestamp is None and phrase_start_time != "n/a":
                    section_start_timestamp = phrase_start_time
                
                if match_sub_phrases:
                    data_sec_label = f"{sec}.{s_num}.{ss_num}"
                    coordinate_timestamps[("sub", s_num, ss_num)] = phrase_start_time
                elif match_sentences:
                    data_sec_label = f"{sec}.{s_num}"
                    if ("sentence", s_num) not in coordinate_timestamps:
                        coordinate_timestamps[("sentence", s_num)] = phrase_start_time
                else:
                    data_sec_label = f"{sec}"
                
                # Construct HTML outputs using visual items
                o1_words_str = ""
                for w_item in matched_words_data:
                    if w_item["is_punc"]:
                        o1_words_str += f'<span class="punctuation">{html.escape(w_item["text"])}</span> '
                        continue
                
                    lead, core, trail = split_punctuation(w_item["text"])
                    start_str = format_timestamp(w_item["start"])
                    end_str = format_timestamp(w_item["end"])

                    word_span = f'<span class="word" data-word-start="{start_str}" data-word-end="{end_str}">{html.escape(core)}</span>'
                    if lead:
                        word_span = f'<span class="punctuation">{html.escape(lead)}</span>' + word_span
                    if trail:
                        word_span += f'<span class="punctuation">{html.escape(trail)}</span>'
                    o1_words_str += word_span + " "
                
                o2_words_str = ""
                for w_item in matched_words_data:
                    if w_item["is_punc"]:
                        o2_words_str += f'<span class="punctuation">{html.escape(w_item["text"])}</span> '
                        continue
                
                    lead, core, trail = split_punctuation(w_item["text"])
                    start_str = format_timestamp(w_item["start"])
                    end_str = format_timestamp(w_item["end"])

                    word_span = f'<span class="word" data-word-start="{start_str}" data-word-end="{end_str}">{html.escape(core)}</span>'
                    if lead:
                        word_span = f'<span class="punctuation">{html.escape(lead)}</span>' + word_span
                    if trail:
                        word_span += f'<span class="punctuation">{html.escape(trail)}</span>'
                    o2_words_str += word_span + " "
                
                phrase_ts_str = format_timestamp(phrase_start_time)
                
                if sec == 0:
                    if is_first_phrase:
                        separator = ""
                    elif ss_idx == 0:
                        # This is a new sentence (split by dot)
                        separator = "<br>"
                    else:
                        # This is a sub-phrase (split by comma)
                        separator = " "
                        
                    prefix = ""
                    output_1_lines.append(f'{separator}{prefix}<span class="text_title"><span data-start="{phrase_ts_str}" data-section="{data_sec_label}" class="phrase">{o1_words_str.strip()}</span></span>\n')
                    output_2_lines.append(f'{separator}{prefix}<span class="text_title"><span data-start="{phrase_ts_str}" data-section="{data_sec_label}" class="phrase">{o2_words_str.strip()}</span></span>\n')
                else:
                    if use_tabs:
                        prefix = "&emsp;" if is_first_phrase else "  "
                    elif use_nothing:
                        prefix = "  " if is_first_phrase else "  "
                    else:
                        prefix = f"  [{sec}] " if is_first_phrase else "  "
                        
                    output_1_lines.append(f'{prefix}<span data-start="{phrase_ts_str}" data-section="{data_sec_label}" class="phrase">{o1_words_str.strip()}</span>\n')
                    output_2_lines.append(f'{prefix}<span data-start="{phrase_ts_str}" data-section="{data_sec_label}" class="phrase">{o2_words_str.strip()}</span>\n')
                
                is_first_phrase = False
                
        if section_start_timestamp is None:
            section_start_timestamp = tg_intervals[tg_idx-1]["start"] if tg_idx > 0 else 0.0
            
        # --- PROCESS ENGLISH ---
        if match_sentences:
            for s_idx, eng_item in enumerate(sec_sentences_eng):
                s_num = s_idx + 1
                grc_item = sec_sentences_grc[s_idx]
                
                raw_sub_grc_struct = [p.strip() for p in re.split(r'(?<=[,.,·;:•!?\x27’])\s+', grc_item["struct"]) if p.strip()]
                raw_sub_eng_struct = [p.strip() for p in re.split(r'(?<=[,])\s+', eng_item["struct"]) if p.strip()]
                
                raw_sub_eng_visual = [p.strip() for p in re.split(r'(?<=[,])\s+', eng_item["visual"]) if p.strip()]
                
                match_sub_phrases = len(raw_sub_grc_struct) == len(raw_sub_eng_struct)
                phrases_to_process = raw_sub_eng_visual if match_sub_phrases else [eng_item["visual"]]
                
                for ss_idx, eng_phrase_text in enumerate(phrases_to_process):
                    ss_num = ss_idx + 1
                    escaped_eng = html.escape(eng_phrase_text, quote=False)
                    
                    if match_sub_phrases:
                        raw_ts = coordinate_timestamps.get(('sub', s_num, ss_num), section_start_timestamp)
                    else:
                        raw_ts = coordinate_timestamps.get(('sentence', s_num), section_start_timestamp)
                        
                    ts_val = format_timestamp(raw_ts)
                    
                    if sec == 0:
                        if is_first_english_phrase:
                            separator = ""
                        elif ss_idx == 0:
                            # New sentence
                            separator = "<br>"
                        else:
                            # Phrase split by comma
                            separator = " "
                            
                        prefix = ""
                        output_3_lines.append(f'{separator}{prefix}<span class="text_title"><span data-start="{ts_val}" class="phrase_en">{escaped_eng}</span></span>\n')
                    else:
                        if use_tabs:
                            prefix = "&emsp;" if is_first_english_phrase else "  "
                        elif use_nothing:
                            prefix = "  " if is_first_english_phrase else "  "
                        else:
                            prefix = f"  [{sec}] " if is_first_english_phrase else "  "
                        output_3_lines.append(f'{prefix}<span data-start="{ts_val}" class="phrase_en">{escaped_eng}</span>\n')
                        
                    is_first_english_phrase = False
        else:
            if sec_sentences_eng:
                full_english_block = " ".join([item["visual"] for item in sec_sentences_eng])
                escaped_eng = html.escape(full_english_block, quote=False)
                ts_val = format_timestamp(section_start_timestamp)
                
                if sec == 0:
                    output_3_lines.append(f'<span class="text_title"><span data-start="{ts_val}" class="phrase_en">{escaped_eng}</span></span>\n')
                else:
                    output_3_lines.append(f'  [{sec}] <span data-start="{ts_val}" class="phrase_en">{escaped_eng}</span>\n')
            else:
                pass
            
        if idx < len(all_sections) - 1:
            output_1_lines.append("  <br><br>\n")
            output_2_lines.append("  <br><br>\n")
            output_3_lines.append("  <br><br>\n")

    greek_output1 = "".join(output_1_lines)
    greek_output2 = "".join(output_2_lines)
    english_output = "".join(output_3_lines)

    greek_output1 = convert_notes(greek_output1)
    greek_output2 = convert_notes(greek_output2)

    return greek_output1, greek_output2, english_output

def prepare_readalong_studio_text(raw_text):
    """Extracts pure text content from raw web-scraped outputs, removing structural headers."""
    lines = raw_text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if not line or "Event Date:" in line:
            continue
            
        if re.match(r'^Book\s+\d+,\s*Chapter\s+\d+,\s*Section\s+\d+\.?$', line, re.IGNORECASE):
            continue
        if re.match(r'^Section\s+\d+\.?$', line, re.IGNORECASE):
            continue
            
        line = re.sub(r'^(?:§\s*\d+\.\d+\.\d+|\[\d+\])\s*(?:Book_\d+)?\s*', '', line).strip()
        
        if line:
            cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)
