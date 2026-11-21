# STORYBOARD RULES — PRODUCTION SPECIFICATION

## 1. PURPOSE AND WORKFLOW ROLE

The Storyboard specification bridges an approved spoken script (`02_script.md`) and the visual rendering and audio synthesis engines. It provides the technical and visual blueprint executed by `AGENT-04-DIRECTOR` at Stage 04 of the production pipeline.

The primary deliverable is `projects/<project_id>/03_storyboard.json`. Every instruction in this document ensures that:
1. Spoken narration is segmented into visually coherent scenes without dropping, duplicating, or altering script words.
2. The visual staging directly reinforces the spoken content using 2D Stickman animation principles.
3. Downstream production engines (`tts_engine.py`, `stickman_renderer.py`, and `audio_mixer.py`) receive valid, machine-readable instructions with zero timing ambiguity.

```
+---------------------------+     Gate 3 Sign-off     +-------------------------------+
|  projects/<id>/           | ----------------------> |  AGENT-04-DIRECTOR            |
|  02_script.md             |                         |  (Applies STORYBOARD_RULES)   |
+---------------------------+                         +-------------------------------+
                                                                     |
                                                                     v
                                                      +-------------------------------+
                                                      |  projects/<id>/               |
                                                      |  03_storyboard.json           |
                                                      +-------------------------------+
                                                              /              \
                                                             /                \
                                                            v                  v
                                             +--------------------+   +-----------------------+
                                             |  AGENT-05-VOICE    |   |  AGENT-06-RENDER      |
                                             |  (tts_engine.py)   |   |  (stickman_renderer)  |
                                             +--------------------+   +-----------------------+
```

---

## 2. STORYBOARD PRINCIPLES

### 2.1 Serve the Narration
Every visual element, character pose, camera movement, and prop must serve the narration. The visuals exist to make the spoken concept immediate, intuitive, and entertaining. If an element does not explain, demonstrate, or emphasize the narration, remove it.

### 2.2 Explain, Demonstrate, and Reinforce
Visuals should not merely decorate the screen; they must add cognitive clarity:

### 2.3 Strict Physical Coherence & Environmental Context (Quy Tắc Bối Cảnh & Tính Nhất Quán Vật Lý Tuyệt Đối)
Mọi phân cảnh phải tuân thủ nghiêm ngặt tính logic thực tế và ăn khớp 100% với kịch bản:
1. **Bối cảnh môi trường xác thực (Environmental Staging)**:
   - Nếu kịch bản nói về ở nhà / làm việc: Phải có đường nét căn phòng (tường, khung cửa sổ có ánh sáng, mặt bàn làm việc, ghế ngồi). CẤM vẽ nhân vật lơ lửng trong không gian trống.
   - Nếu kịch bản nói về leo núi, đi bộ, chạy xe: Phải có cảnh vật tương ứng (dãy núi, con đường, hàng cây, bầu trời).
2. **Vị trí vật lý của đồ vật (Physical Object Placement)**:
   - Các đồ vật như cốc nước, máy tính, điện thoại, sách vở phải nằm ĐÀNG HOÀNG TRÊN MẶT BÀN (Tabletop).
   - **CẤM TUYỆT ĐỐI**: Để cốc nước hay điện thoại nằm dưới sàn nhà/dưới chân nhân vật một cách phi lý.
3. **Tính liên tục của đạo cụ (Object Continuity & No Duplication)**:
   - **Không nhân đôi đạo cụ**: Nếu nhân vật đang cầm điện thoại trên tay thì trên mặt bàn KHÔNG ĐƯỢC có chiếc điện thoại thứ 2.
   - **Không biến mất đột ngột**: Nếu cảnh trước nhân vật đang cầm điện thoại, cảnh sau vẫn phải tiếp tục cầm hoặc có động tác hạ tay đặt xuống bàn. Cấm để đạo cụ bốc hơi vô cớ giữa các giây.
   - **Căn chỉnh UI/Icon chuẩn xác**: Mọi biểu tượng trong Information Card phải căn chính xác 100% vào tâm hình tròn chứa nó, không được lệch góc hay đè chữ.
- **Explain**: Clarify unfamiliar relationships or abstract systems (e.g., displaying cause-and-effect flowcharts or side-by-side scale comparisons).
- **Demonstrate**: Show the Stickman character performing an action or testing a scenario described by the narrator.
- **Reinforce**: Punctuate emotional beats, surprising facts, or punchlines with synchronized character reactions and sound effects.

### 2.3 Prevent Visual Stagnation (Strict 3.5s Pacing)
A static screen causes instant viewer drop-off. Storyboards must eliminate slideshow-style presentation:
- **Strict 3.5s Pacing Rule**: No scene or character pose may remain static for more than **3.5 seconds**.
- Any narration segment longer than 3.5 seconds must be split into dynamic sub-scenes (e.g., `SCENE_005_A`, `SCENE_005_B`) with alternating camera zoom, changing facial expressions, or animated hand gestures.

### 2.4 Avoid Mechanical Literalism
Do not illustrate every noun or verb literally. 
- *Bad Practice*: When the narrator says, "Time is running out, and people are stressed," showing a literal giant clock falling on a crowd, followed immediately by an anatomical drawing of human sweat glands.
- *Good Practice*: Showing the Stickman character frantically running against a ticking wall clock, suddenly dropping onto a desk with spiral stress lines overhead (`stressed_headache`).
Focus on the **core message** of each sentence group rather than converting individual words into disconnected clip art.

### 2.5 Visual Metaphors and Comparisons
Use visual metaphors to make intangible concepts concrete:
- Mental fatigue or burnout represented by an overflowing backpack or an empty battery icon above the head.
- Compound interest or exponential growth represented by a tiny snowball rolling down a hill and turning into an overwhelming boulder.
- Trade-offs represented by a balancing scale tipping sharply under weight.

### 2.6 Clarity Over Complexity
Prioritize clean silhouettes, readable props, and clear spatial staging over busy backgrounds or intricate decorative art. If a viewer cannot understand what is happening on screen within 0.5 seconds of a scene cut, the composition is too complex.

### 2.7 Four Mandatory Anti-Slideshow Rules
All storyboards must strictly enforce four core production rules to guarantee high visual momentum:
1. **Strict 3.5s Pacing Rule**: No scene or pose may remain static for more than 3.5 seconds. Any narration segment longer than 3.5s must be split into dynamic sub-scenes (changing camera zoom, facial expression, or hand gesture).
2. **Spatial Safe Zones**: Whenever UI cards, charts, or props appear, the stickman must shift to `x = 25%` (`x = 0.25`, left) or `x = 75%` (`x = 0.75`, right), reserving the remaining 55% of the frame for visual elements. Never overlap any prop or card over the character's head.
3. **Meaningful Keywords Over Placeholder Lines**: All UI cards, charts, and labels must display concise, readable keywords (1–3 words) instead of meaningless horizontal placeholder bars.
4. **Minimalist Environmental Depth**: Every scene must include at least one subtle background prop (desk edge, window frame, phone screen glow, floor horizon line) rendered on a warm off-white textured background (`#F7F5F0`) rather than pure `#FFFFFF`.

### 2.8 Meticulous Character Acting Beats & Micro-Expressions (Diễn xuất & Sắc thái biểu cảm)
Nhân vật người que phải được thiết kế như một diễn viên thực thụ, truyền tải được trọn vẹn cảm xúc và tâm lý của người xem:
1. **Hành động vi mô liên kết tự nhiên (Chained Micro-Actions)**:
   - Khi gặp một tình huống tâm lý (ví dụ: cảm giác trống rỗng khi check điện thoại):
     - **Beat 1 (Mong chờ)**: Nhìn chăm chú vào màn hình sáng.
     - **Beat 2 (Thất vọng)**: Màn hình tắt ngúm / thông báo trống rỗng -> mắt cụp xuống hoặc chớp mắt thất thần.
     - **Beat 3 (Đặt đạo cụ)**: Đặt điện thoại ngay ngắn xuống mặt bàn (không vứt bừa bãi hay để biến mất).
     - **Beat 4 (Suy tư/Trầm ngâm)**: Chống tay vào cằm, nghiêng đầu hoặc nhắm mắt thở dài suy ngẫm về cuộc đời / công việc.
     - **Beat 5 (Tái nghiện/Vòng lặp)**: Sau một thoáng ngẫm nghĩ, lại không kìm được mà vươn tay chộp lấy điện thoại kiểm tra lần nữa.
2. **Chi tiết hóa từng ly từng tí trong Storyboard**:
   - Khi mô tả `pose` và `visual_description`, không bao giờ ghi chung chung như "stickman stands" hay "stickman sits".
   - Phải mô tả chính xác: vị trí hai tay, trạng thái đôi mắt (mở to, nhắm, squint, liếc), miệng (mỉm cười, há hốc, bĩu môi, đường thẳng deadpan), và tương tác vật lý với đạo cụ trên bàn.

---

## 3. SCENE PLANNING AND SEGMENTATION

### 3.1 Segmentation Criteria
Divide the approved narration from `02_script.md` into scenes based on:
1. **Complete Spoken Thought**: A scene corresponds to one clear sentence or a cohesive clause (typically 8 to 22 spoken words).
2. **Visual Topic Shift**: Whenever the subject, location, or visual comparison changes, start a new scene.
3. **Pacing and Emotional Reversal**: When the narration delivers a punchline, a surprising statistic, or a counter-argument, cut to a new scene with an appropriate reaction pose.

### 3.2 Target Scene Duration
- **Standard Scene Duration**: Typically **1.5 to 3.5 seconds**.
- **Minimum Scene Duration**: **1.5 seconds** (shots shorter than 1.5 seconds feel chaotic and do not allow TTS audio to breathe).
- **Maximum Static Hold**: **3.5 seconds**. Any spoken segment exceeding 3.5s must be sub-divided into sequential cuts (`SCENE_001_A`, `SCENE_001_B`) with active camera or character changes.
- Never split a sentence in an unnatural location that causes TTS to clip or pause awkwardly.

### 3.3 Mandatory Scene Specifications
Every scene in the storyboard must specify:
1. **Scene Identifier (`scene_id`)**: Strict sequential naming (`SCENE_001`, `SCENE_002`, ... or sub-shots `SCENE_005_A`, `SCENE_005_B`).
2. **Narration Segment (`narration_text`)**: Exact spoken text copied verbatim from `02_script.md`.
3. **Dual Duration Fields**:
   - `estimated_duration_sec`: Planned duration in seconds based on ~130–150 words per minute.
   - `actual_duration_sec`: Initialized to `null`. Automatically updated with exact float duration by `tts_engine.py` after synthesis.
4. **Audio File Path (`audio_file`)**: Dedicated relative audio path (e.g., `audio_scenes/SCENE_001.wav` or `audio_scenes/SCENE_001.mp3`).
5. **Visual Description (`description`)**: Detailed staging instructions explaining what appears, where characters stand, and how objects move.
6. **Stickman Character State**:
   - `pose`: Approved pose identifier from `instructions/VISUAL_STICKMAN.md` (e.g., `idle_neutral`, `thinking`, `idea_lightbulb`, `stressed_headache`, `running_hurry`, `pointing_target`, `shocked_fall`, `celebrate_win`).
   - `action`: Specific vector animation action (e.g., `point_right`, `drop_head`, `walk_left`, `wave`).
   - `expression`: Facial state (e.g., `neutral`, `worried`, `confident`, `confused`, `shocked`).
   - `position`: Normalized positioning coordinates `{ "x": float, "y": float, "anchor": string }` (0.0 to 1.0). Coordinate origin: `(0.0, 0.0)` is top-left, `(1.0, 1.0)` is bottom-right. Standard ground placement: `y: 0.82, anchor: "bottom_center"`. Eliminates natural-language parsing for spatial staging.
7. **Environment and Props**:
   - `background`: Canvas background style or preset (e.g., `clean_canvas`, `office_interior`, `outdoor_hill`, `grid_diagram`).
   - `props`: Array of reusable vector props required in the scene (e.g., `["alarm_clock", "coffee_mug"]`).
8. **Camera Framing and Motion**:
   - `camera`: Object containing:
     - `framing`: Shot framing (`wide`, `medium`, `close_up`).
     - `movement`: Camera movement (`static`, `zoom_in`, `zoom_out`, `pan_left`, `pan_right`, `shake`).
9. **Transition**: Screen transition into the scene (`cut`, `fade`, `wipe_left`, `slide_up`).
10. **Audio Cues**:
    - `sfx`: Sound effect name triggered at the start or on a specific action (e.g., `whoosh`, `pop`, `ding`, `record_scratch`, `thud`, `paper_rustle`, or `null`).
    - `bgm_mood`: Musical state for the background track (`tense`, `curious`, `upbeat`, `calm`, `dramatic`, `triumphant`).

---

## 4. NARRATION SYNCHRONIZATION AND INTEGRITY

### 4.1 Script Freeze & Word Preservation
Once `02_script.md` passes Gate 3 user sign-off, the spoken narration is **frozen**:
- **Zero Omissions**: Every spoken word from the `Narration` section of `02_script.md` must be assigned to exactly one scene in `03_storyboard.json`.
- **Zero Duplications**: Do not repeat narration sentences across scenes.
- **Zero Reordering**: The sequence of scenes must match the sequential flow of the script exactly.
- **No Unapproved Rewriting**: Storyboard artists cannot rephrase narration. If a line is difficult to visualize or rhythmically flawed, request an explicit script amendment through the Script Freeze Exception Rule.

### 4.2 Scene ID Uniformity Across the Entire Pipeline
The scene identifier established in `03_storyboard.json` is the universal key across all assets and logs:
- Storyboard data entry: `"scene_id": "SCENE_001"`
- Synthesized voice-over file: `projects/<project_id>/audio_scenes/SCENE_001.wav`
- Rendered visual clip: `projects/<project_id>/video_scenes/SCENE_001.mp4`
- Final edit timeline track marker: `SCENE_001`
- QA defect report reference: `SCENE_001`

### 4.3 Dual Duration Architecture (Drift Prevention)
To eliminate synchronization drift between synthesized voice-over and rendered 2D animation, the production engine uses a two-phase duration pipeline:

```
Phase 1: Storyboard Planning
  - Agent assigns "estimated_duration_sec": 4.5
  - Agent sets "actual_duration_sec": null

Phase 2: Audio Synthesis (AGENT-05-VOICE via tts_engine.py)
  - Edge-TTS generates audio_scenes/SCENE_001.wav
  - Script measures exact audio file length: e.g., 4.78 seconds
  - Engine automatically writes: "actual_duration_sec": 4.78 into 03_storyboard.json

Phase 3: Visual Rendering (AGENT-06-RENDER via stickman_renderer.py)
  - Engine reads "actual_duration_sec" (4.78)
  - Exact frames rendered = round(4.78 * 30 fps) = 143 frames
  - Result: Perfect frame-accurate match between audio and video clip.
```

---

## 5. VISUAL STORYTELLING TECHNIQUES

### 5.1 Character Poses and Body Language
Stickman characters communicate emotion through exaggerated silhouettes:
- **Thinking / Skepticism**: Hand on chin, head tilted back slightly, body leaning back.
- **Panic / Overwhelm**: Both hands clutching the head, back hunched forward, knees slightly bent (`stressed_headache`).
- **Enlightenment / Breakthrough**: One arm pointed straight up, spine upright, eye pupils wide (`idea_lightbulb`).
- **Failure / Disbelief**: Body tilted back or flat on the floor, legs sprawling (`shocked_fall`).

### 5.2 Spatial Safe Zones & Visual Comparisons
When UI cards, charts, or props appear on screen:
- **Spatial Safe Zones**: The stickman must shift to `x = 25%` (`x: 0.25`, left side) or `x = 75%` (`x: 0.75`, right side), reserving the remaining 55% of the frame for visual cards, charts, and diagrams.
- **Strict No-Overlap Rule**: Never overlap any prop, card, or label over the character's head or torso. Clear spatial division prevents cognitive clutter.
- When contrasting two ideas: split the 16:9 canvas into two equal zones (Left vs. Right) or a "Before vs. After" sequence. Place the flawed approach on the left (highlighted with red accent `#E63946`) and the optimal approach on the right (highlighted with teal `#2A9D8F` or navy `#1D3557`).

### 5.3 Meaningful Keywords Over Placeholder Lines
When presenting diagrams, cards, or data workflows:
- **Concise Readable Keywords**: All UI cards, graphic containers, and labels must display concise, legible text (**1 to 3 words maximum per label**) using a modern sans-serif font.
- **Strict Prohibition**: Never use meaningless horizontal placeholder bars, wireframe dummy lines, or gray filler rectangles. Every card must convey real semantic information.
- Use minimalist geometric charts: simple clean bar graphs, rising/falling trend lines, or clean circular progress rings, animating sequentially.

### 5.4 Camera Movement for Emphasis
- **Zoom In**: Use to intensify a serious realization, pull focus into a character's shocked reaction, or highlight a critical number on a chart.
- **Zoom Out**: Use to reveal a broader chaotic environment or show that the character is dwarfed by a massive problem.
- **Pan**: Use to follow a running character or scan across a historical timeline.
- **Shake**: Apply for 0.2–0.4 seconds immediately upon impact (e.g., dropping heavy weight, crashing into an obstacle).

### 5.5 Visual Callbacks
Establish 1 or 2 recurring visual motifs throughout a video (such as a specific ominous red question mark or a recurring piggy bank prop). Reintroducing this prop at the climax or resolution creates satisfying narrative cohesion for the viewer.

---

## 6. STORYBOARD JSON SPECIFICATION (`03_storyboard.json`)

### 6.1 Top-Level Schema Requirements
The storyboard JSON must be strictly valid JSON (parseable via Python's standard `json.loads` without custom parsing rules):
- UTF-8 encoding.
- No single quotes or unescaped control characters.
- No trailing commas before closing braces or brackets.
- Standard metadata at root: `project_id`, `title`, `resolution`, `video_settings`, and `scenes`.

### 6.2 Formal Structure Definition

```json
{
  "project_id": "video-001",
  "title": "Why Your Brain Procrastinates",
  "resolution": {
    "width": 1920,
    "height": 1080,
    "fps": 30
  },
  "global_settings": {
    "background_color": "#F7F5F0",
    "primary_line_color": "#212529",
    "font_family": "Arial, Helvetica, sans-serif"
  },
  "scenes": [
    {
      "scene_id": "SCENE_001",
      "narration_text": "Every morning, you wake up with a solid plan, a clear to-do list, and absolute confidence.",
      "estimated_duration_sec": 5.0,
      "actual_duration_sec": null,
      "audio_file": "audio_scenes/SCENE_001.wav",
      "visual": {
        "description": "Stickman stands confidently on the left side of the screen, smiling and holding a crisp checklist prop with green checkmarks.",
        "stickman_pose": "idle_neutral",
        "action": "hold_checklist_confidently",
        "expression": "confident_smile",
        "position": {
          "x": 0.25,
          "y": 0.82,
          "anchor": "bottom_center"
        },
        "props": ["checklist_clipboard", "coffee_cup"],
        "background": "clean_canvas",
        "camera": {
          "framing": "medium",
          "movement": "static"
        },
        "transition": "cut",
        "accent_color_focus": "#2A9D8F"
      },
      "audio": {
        "sfx": "pop",
        "bgm_mood": "curious"
      }
    }
  ]
}
```

### 6.3 Realistic Multi-Scene Reference Example
Below is an illustrative, production-grade 3-scene sequence demonstrating how tone, poses, camera moves, and duration fields connect across a continuous thought:

```json
{
  "project_id": "video-001",
  "title": "Why Your Brain Procrastinates",
  "resolution": {
    "width": 1920,
    "height": 1080,
    "fps": 30
  },
  "global_settings": {
    "background_color": "#F7F5F0",
    "primary_line_color": "#212529",
    "font_family": "Arial, Helvetica, sans-serif"
  },
  "scenes": [
    {
      "scene_id": "SCENE_001",
      "narration_text": "Every morning, you wake up with a solid plan, a clear to-do list, and absolute confidence.",
      "estimated_duration_sec": 5.0,
      "actual_duration_sec": null,
      "audio_file": "audio_scenes/SCENE_001.wav",
      "visual": {
        "description": "Stickman stands upright on the left with a coffee cup, presenting an oversized glowing checklist with neat checkmarks.",
        "stickman_pose": "idle_neutral",
        "action": "present_checklist",
        "expression": "confident_smile",
        "position": {
          "x": 0.25,
          "y": 0.82,
          "anchor": "bottom_center"
        },
        "props": ["checklist_card", "steaming_coffee_mug"],
        "background": "clean_canvas",
        "camera": {
          "framing": "medium",
          "movement": "static"
        },
        "transition": "cut",
        "accent_color_focus": "#2A9D8F"
      },
      "audio": {
        "sfx": "ding",
        "bgm_mood": "upbeat"
      }
    },
    {
      "scene_id": "SCENE_002",
      "narration_text": "Yet by two in the afternoon, you are somehow deep into a rabbit hole researching the history of medieval siege weapons.",
      "estimated_duration_sec": 6.5,
      "actual_duration_sec": null,
      "audio_file": "audio_scenes/SCENE_002.wav",
      "visual": {
        "description": "Abrupt scene shift. Stickman is hunched over a laptop in a darkened room, eyes wide with hypnotic spiral lines, surrounded by floating question marks and a miniature catapult prop.",
        "stickman_pose": "stressed_headache",
        "action": "rapid_typing_hunched",
        "expression": "mesmerized_exhaustion",
        "position": {
          "x": 0.5,
          "y": 0.82,
          "anchor": "bottom_center"
        },
        "props": ["laptop_desk", "miniature_catapult_diagram", "spiral_lines"],
        "background": "dimmed_canvas",
        "camera": {
          "framing": "close_up",
          "movement": "zoom_in"
        },
        "transition": "cut",
        "accent_color_focus": "#E63946"
      },
      "audio": {
        "sfx": "record_scratch",
        "bgm_mood": "curious"
      }
    },
    {
      "scene_id": "SCENE_003",
      "narration_text": "This is not laziness. It is a biological tug-of-war happening inside your prefrontal cortex.",
      "estimated_duration_sec": 5.2,
      "actual_duration_sec": null,
      "audio_file": "audio_scenes/SCENE_003.wav",
      "visual": {
        "description": "Split visualization. An anatomical 2D minimalist outline of a brain appears in the center, with two competing stickman figures pulling a rope across the hemispheres.",
        "stickman_pose": "thinking",
        "action": "tug_of_war_pulling",
        "expression": "determined_strain",
        "position": {
          "x": 0.5,
          "y": 0.82,
          "anchor": "bottom_center"
        },
        "props": ["minimalist_brain_vector", "tug_rope", "anatomical_labels"],
        "background": "clean_canvas",
        "camera": {
          "framing": "wide",
          "movement": "static"
        },
        "transition": "wipe_left",
        "accent_color_focus": "#1D3557"
      },
      "audio": {
        "sfx": "whoosh",
        "bgm_mood": "tense"
      }
    }
  ]
}
```

### 6.4 Python Engine Compatibility Notes
In `engine/stickman_renderer.py` and `engine/tts_engine.py`:
- Standard canonical duration fields are `estimated_duration_sec` and `actual_duration_sec`. Legacy aliases (`duration_est`, `duration_actual`) are removed to avoid ambiguity.
- The schema is fully compatible with standard Python libraries: `json`, `pathlib.Path`, and `pydantic` or `jsonschema` validators.
- When generating JSON files via automated agents, never output markdown code blocks or trailing commentary inside the file itself. Store strictly valid JSON text.
