import re
import html

def clean_for_matching(text):
    """Normalize text into pure alphabetic lowercase characters for safe alignment matching."""
    cleaned = re.sub(r'[\d\W_]+', '', text.lower())
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

def get_anchor_words(sections_dict, n=4, position="start"):
    words = []
    
    # Gather all clean words in sequence
    for sec in sorted(sections_dict.keys()):
        for item in sections_dict[sec]:
            phrase_words = item["visual"].split()
            for w in phrase_words:
                if re.search(r'\{note(?:-marker)?|commentary', w):
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

def parse_source_text_with_sentences(raw_text, keep_notes=False):
    raw_text = raw_text.replace('\u00AD', '')
    lines = raw_text.split('\n')
    sections_dict = {}
    current_section = None

    for line in lines:
        line = line.strip()
        if not line or "Event Date:" in line:
            continue

        # ----- Section detection -----
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

        # ----- Create structural and visual lines -----
        # Structural: remove note blocks entirely
        structural_line = re.sub(r'\{((?:note(?:-marker)?|commentary)\s*[:=][^}]*)\}', '', line)
        # Visual: keep note blocks
        if keep_notes:
            visual_line = line
        else:
            visual_line = re.sub(r'\{((?:note(?:-marker)?|commentary)\s*[:=][^}]*)\}', '', line)

        if keep_notes:
            # Protect spaces inside note blocks to prevent splitting on them later
            def protect_spaces(match):
                return match.group(0).replace(' ', '\x01')
            visual_line = re.sub(r'\{((?:note(?:-marker)?|commentary)\s*[:=][^}]*)\}', protect_spaces, visual_line)
        
        # ----- Alignment markup processing -----
        def structural_replacer(match):
            brace_content = match.group(2)
            return brace_content
        
        # Skip note blocks when stripping alignment markup
        structural_line = re.sub(r'(.)\{(?!(?:note(?:-marker)?|commentary)\s*[:=])(.*?)\}', structural_replacer, structural_line)
        visual_line = re.sub(r'(.)\{(?!(?:note(?:-marker)?|commentary)\s*[:=])(.*?)\}', r'\1', visual_line)

        # ----- Sentence splitting -----
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
    punct = set('.,·;:’\'()[]{}"“”—–')   # add any other punctuation you need
    i = 0
    while i < len(word) and word[i] in punct:
        i += 1
    j = len(word)
    while j > i and word[j-1] in punct:
        j -= 1
    return word[:i], word[i:j], word[j:]

def parse_note_from_token(token):
    # Find a note block: {note:...}, {commentary:...}, {note-marker:...}
    match = re.search(r'\{((?:note(?:-marker)?|commentary)\s*[:=][^}]*)\}', token)
    if not match:
        return token, None, None
    note_block = match.group(1)
    word_part = token[:match.start()] + token[match.end():]
    # Parse marker and note from note_block (same logic as before)
    full_content = note_block.strip()
    marker = "*"
    note = ""
    marker_match = re.search(r'marker\s*[:=]\s*["\']?([^"\';]+)["\']?', full_content)
    if marker_match:
        marker = marker_match.group(1).strip()
        remaining = re.sub(r'marker\s*[:=]\s*["\']?[^"\';]+["\']?\s*;?\s*', '', full_content)
    else:
        remaining = full_content
    note_match = re.search(r'note\s*[:=]\s*["\']?([^"\';]+)["\']?', remaining)
    if note_match:
        note = note_match.group(1).strip()
    else:
        note = remaining.strip()
    if not note:
        note = "No note provided."
    note = note.replace('\x01', ' ')
    return word_part, marker, note

def align_and_generate_html(greek_text, english_text, textgrid_text, use_tabs=False):
    """Run cross-source text matching with recursive strict symmetry checks (Section -> Sentence -> Sub-phrase)."""
    greek_sections = parse_source_text_with_sentences(greek_text, keep_notes=True)
    english_sections = parse_source_text_with_sentences(english_text, keep_notes=False)
    tg_intervals = parse_textgrid_intervals(textgrid_text)

    start_anchor = get_anchor_words(greek_sections, n=4, position="start")
    end_anchor = get_anchor_words(greek_sections, n=4, position="end")
    tg_intervals = anchor_textgrid(tg_intervals, start_anchor, end_anchor)
    
    tg_idx = 0
    num_intervals = len(tg_intervals)
    
    output_1_lines = []
    output_2_lines = []
    output_3_lines = []
    
    #all_sections = sorted(list(set(greek_sections.keys()).intersection(set(english_sections.keys()))))
    #if not all_sections:
        #all_sections = sorted(list(greek_sections.keys()))
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
                    # --- Parse note from token ---
                    word_part, marker, note_text = parse_note_from_token(word)
                    if marker is not None:
                        # This token contains a note block.
                        # 1. Process the word part (if any) as a normal word.
                        if word_part:
                            clean_w = clean_for_matching(word_part)
                            if clean_w:
                                # Match against TextGrid (same code as before)
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
                                # Add the word item
                                matched_words_data.append({
                                    "text": word_part,
                                    "start": word_start,
                                    "end": word_end,
                                    "is_punc": False
                                })
                            else:
                                # word_part is only punctuation
                                matched_words_data.append({"text": word_part, "start": None, "end": None, "is_punc": True})
                        # 2. Add the note marker item right after the word (or immediately if no word part)
                        matched_words_data.append({
                            "text": word,
                            "start": None,
                            "end": None,
                            "is_punc": False,
                            "is_note": True,
                            "note_marker": marker,
                            "note_text": note_text
                        })
                        continue
                
                    # --- No note: normal processing ---
                    clean_w = clean_for_matching(word)
                    if not clean_w:
                        matched_words_data.append({"text": word, "start": None, "end": None, "is_punc": True})
                        continue
                
                    # (existing matching code for normal words)
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
                        "text": word,
                        "start": word_start,
                        "end": word_end,
                        "is_punc": False
                    })
                
                if phrase_start_time is None:
                    phrase_start_time = 0.0
                if section_start_timestamp is None:
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

                    if w_item.get("is_note"):
                        marker = html.escape(w_item["note_marker"])
                        note_text = html.escape(w_item["note_text"], quote=False)
                        o1_words_str += f'<span class="note-marker" data-note="{note_text}">{marker}</span> '
                        continue
                    if w_item["is_punc"]:
                        o1_words_str += f'<span class="punctuation">{html.escape(w_item["text"])}</span> '
                        continue
                
                    lead, core, trail = split_punctuation(w_item["text"])
                    # Build the core word span
                    word_span = f'<span class="word" data-word-start="{w_item["start"]:.2f}" data-word-end="{w_item["end"]:.2f}">{html.escape(core)}</span>'
                    # Prepend leading punctuation
                    if lead:
                        word_span = f'<span class="punctuation">{html.escape(lead)}</span>' + word_span
                    # Append trailing punctuation
                    if trail:
                        word_span += f'<span class="punctuation">{html.escape(trail)}</span>'
                    o1_words_str += word_span + " "
                
                o2_words_str = ""
                for w_item in matched_words_data:

                    if w_item.get("is_note"):
                        marker = html.escape(w_item["note_marker"])
                        note_text = html.escape(w_item["note_text"], quote=False)
                        o2_words_str += f'<span class="note-marker" data-note="{note_text}">{marker}</span> '
                        continue
                    if w_item["is_punc"]:
                        o2_words_str += f'<span class="punctuation">{html.escape(w_item["text"])}</span> '
                        continue
                
                    lead, core, trail = split_punctuation(w_item["text"])
                    word_span = f'<span class="word" data-word-start="{w_item["start"]:.2f}" data-word-end="{w_item["end"]:.2f}">{html.escape(core)}</span>'
                    if lead:
                        word_span = f'<span class="punctuation">{html.escape(lead)}</span>' + word_span
                    if trail:
                        word_span += f'<span class="punctuation">{html.escape(trail)}</span>'
                    o2_words_str += word_span + " "
                
                if use_tabs:
                    prefix = "&emsp;" if is_first_phrase else "  "
                else:
                    prefix = f"  [{sec}] " if is_first_phrase else "  "
                is_first_phrase = False
                
                output_1_lines.append(f'{prefix}<span data-start="{phrase_start_time:.2f}" data-section="{data_sec_label}" class="phrase">{o1_words_str.strip()}</span>\n')
                output_2_lines.append(f'{prefix}<span data-start="{phrase_start_time:.2f}" data-section="{data_sec_label}" class="phrase">{o2_words_str.strip()}</span>\n')
                
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
                        ts_val = f"{coordinate_timestamps.get(('sub', s_num, ss_num), section_start_timestamp):.2f}"
                    else:
                        ts_val = f"{coordinate_timestamps.get(('sentence', s_num), section_start_timestamp):.2f}"
                    
                    if use_tabs:
                        prefix = "&emsp;" if is_first_english_phrase else "  "
                    else:
                        prefix = f"  [{sec}] " if (s_idx == 0 and ss_idx == 0) else "  "
                    is_first_english_phrase = False
                    
                    output_3_lines.append(f'{prefix}<span data-start="{ts_val}" class="phrase_en">{escaped_eng}</span>\n')
        else:
            if sec_sentences_eng:
                full_english_block = " ".join([item["visual"] for item in sec_sentences_eng])
                escaped_eng = html.escape(full_english_block, quote=False)
                ts_val = f"{section_start_timestamp:.2f}"
                output_3_lines.append(f'  [{sec}] <span data-start="{ts_val}" class="phrase_en">{escaped_eng}</span>\n')
            else:
                pass
            
        if idx < len(all_sections) - 1:
            output_1_lines.append("  <br><br>\n")
            output_2_lines.append("  <br><br>\n")
            output_3_lines.append("  <br><br>\n")
        
    return "".join(output_1_lines), "".join(output_2_lines), "".join(output_3_lines)

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
