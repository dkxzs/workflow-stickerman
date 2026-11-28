# STORYBOARD RULES — STICKMAN PRODUCTION SPECIFICATION

## 1. PURPOSE & PIPELINE ROLE

Converts an approved spoken script (`projects/<project_id>/02_script.md`) into a machine-readable visual blueprint (`projects/<project_id>/03_storyboard.json`) executed by `AGENT-04-DIRECTOR` (Stage 04).

- **TTS Engine:** `engine/tts_engine.py` reads `narration_text` and writes `actual_duration_sec`.
- **Validator (Gate 4):** `python -m engine.storyboard_validator projects/<project_id>/03_storyboard.json` must report `0 error(s)`.
- **Main Renderer:** `node engine/auto_director.mjs` renders SVG → PNG → MP4 using closed vocabulary values from `engine/vocab.py` (`python -m engine.vocab`).

---

## 2. CORE STORYBOARD PRINCIPLES

### 2.1 Serve the Narration
Every pose, prop, icon, and camera move must explain, demonstrate, or reinforce the spoken line. Avoid mechanical literalism (illustrating every noun as disconnected clip art); focus on the core message using clear visual metaphors (e.g., burnout = empty battery; compound growth = snowball).

### 2.2 Four Mandatory Anti-Slideshow Rules
1. **Strict 3.5s Pacing:** No scene or static pose may exceed **3.5 seconds**. Split longer spoken thoughts into sequential sub-scenes (`SCENE_005_A`, `SCENE_005_B`) with changing pose, mood, or camera framing.
2. **Spatial Safe Zones:** When UI cards, charts, or props appear, place the stickman at `x: 0.25` (left) or `x: 0.75` (right), reserving 55% of the frame for visuals. Never overlap props or cards over the character's head/torso.
3. **Meaningful Keywords Only:** Every card/chart label must use concise, readable keywords (**1–3 words** in `card.title`, supporting details in `card.subtitle`). Never use dummy placeholder bars.
4. **Environmental Depth:** Use warm off-white textured backgrounds (`#F7F5F0`) with coherent environmental presets (`visual.background`) instead of floating characters in empty pure white.

### 2.3 Physical Coherence & Object Continuity
- **Contextual Staging:** Indoor/work scenes require room/desk context; outdoor scenes require matching outdoor backgrounds.
- **Logical Placement:** Everyday objects (phone, coffee mug, laptop, books) belong on tables/desks or in hands—never randomly on the floor.
- **Continuity & No Duplication:** If a character holds a phone, do not place a second duplicate phone on the desk. Do not make held props vanish without a transition beat.

### 2.4 Character Acting Beats & Micro-Expressions
Treat the stickman as an expressive actor rather than a static diagram:
- Chain micro-actions across beats (e.g., eager anticipation → disappointed glance → placing prop down → thoughtful chin-rest → impulsive re-check).
- Always pick specific `pose`, `mood`, `hand_prop`, and `camera` values from `engine/vocab.py` rather than generic descriptions.

---

## 3. SCENE SEGMENTATION & TIMING

- **Target Duration:** `1.5s – 3.5s` per scene (`minimum 1.5s`, `max static hold 3.5s`). Never split mid-phrase where TTS would clip awkwardly.
- **Scene ID Uniformity:** Sequential IDs (`SCENE_001`, `SCENE_002`, or `SCENE_005_A`, `SCENE_005_B`) must match identically across `03_storyboard.json`, `audio_scenes/SCENE_XXX.*`, and `video_scenes_vector/SCENE_XXX.mp4`.
- **Script Freeze:** After Gate 3 approval, copy `narration_text` verbatim from `02_script.md` with zero omissions, duplications, or reordering.
- **Dual Duration Architecture (Drift Prevention):**
  1. Stage 04 sets `estimated_duration_sec` (~130–150 WPM) and `actual_duration_sec: null`.
  2. Stage 05 (`tts_engine.py`) measures generated audio and writes exact float `actual_duration_sec`.
  3. Stage 06 (`auto_director.mjs`) renders exact frames (`round(actual_duration_sec * 30)`).

---

## 4. VISUAL STORYTELLING & CAMERA

- **Comparisons:** Split 16:9 canvas Left (flawed/problem, red accent `#E63946`) vs. Right (optimal/solution, teal `#2A9D8F` or navy `#1D3557`).
- **Camera Moves:**
  - `zoom_in`: emphasize realization, reaction, or key stat (avoid `close_up` when a card is visible so it doesn't clip).
  - `zoom_out`: reveal scale or chaotic environment.
  - `pan_left` / `pan_right`: follow motion or scan timelines.
  - `shake`: brief impact (0.2–0.4s).
- **Visual Callbacks:** Reuse 1–2 recurring motifs/props across the video for narrative payoff.

---

## 5. JSON SPECIFICATION (`03_storyboard.json`)

- Strictly valid UTF-8 JSON (no comments, no trailing commas, no markdown fences inside the file).
- **Canonical Schema:** Must conform to [`templates/storyboard-schema.json`](../templates/storyboard-schema.json).
- **Working Reference:** Follow [`templates/storyboard-example.json`](../templates/storyboard-example.json) for exact field names and structure.
- **Closed Vocabulary:** All values for `pose`, `mood`, `icon`, `background`, `camera`, and `sfx` must exist in `engine/vocab.py` (run `python -m engine.vocab` to inspect).
- **Canonical Duration Fields:** Use `estimated_duration_sec` and `actual_duration_sec` only (legacy aliases are disallowed).
