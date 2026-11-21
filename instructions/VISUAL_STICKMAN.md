# VISUAL STICKMAN — ART DIRECTION AND PRODUCTION STANDARDS (REF-DIRECTOR ENGINE)

## 1. PURPOSE AND CORE VISUAL IDENTITY

This specification establishes the aesthetic standards and technical rules for the 2D Stickman visual identity across the entire channel. Every visual asset rendered by `AGENT-06-RENDER` (`engine/stickman_renderer.py`) must conform strictly to these guidelines.

The visual architecture is directly powered by the **`_ref_director` B-Mode Painted Puppet Engine** (`directing-stickman-videos`):
- **Rich Painted Aesthetic**: Replaces primitive wireframe line drawings with authentic, hand-painted character layers, expressive facial features, textured environments, and soft ambient lighting.
- **Expressive and Punchy**: High emotional clarity through planar kinematics, kinematic arm reaching with inverse kinematics (`IK`), snappy timing, and communicative character postures.
- **Unified Visual Universe**: Characters, props, environments, and diagram cards belong to a cohesive 2D graphical language powered by bundled high-resolution sprite assets and authentic typography (`ArchivoBlack.ttf`).

### CRITICAL PRODUCTION BOUNDARY: NOT A WHITEBOARD CHANNEL
This channel is **strictly NOT a whiteboard animation channel**. The following techniques are strictly forbidden:
- **No Hand-Drawing Animations**: Never display a visible human or cartoon hand drawing characters, writing words, or placing objects onto the screen.
- **No Simulated Sketching**: Do not simulate pen-stroke reveal or speed-drawing outlines as if a marker is drawing on a whiteboard.
- **No Whiteboard Erasers**: Never wipe scenes with an animated sponge, cloth, or eraser hand.
- **No Mixed-Media Collages**: Never paste realistic stock photos, 3D CGI models, or inconsistent cartoon clip art next to stickman figures.
- **No Style Drifts**: Never change art style or character proportions randomly between scenes.

All visual transformations occur through clean 2D motions: instant cuts, smooth virtual camera translation/zoom, elastic scale pop-in transitions, and kinetic props.

---

## 2. CHARACTER DESIGN SPECIFICATIONS

### 2.1 Character Packages and Proportions
The Stickman character is implemented via high-resolution character packages from `_ref_director/skills/directing-stickman-videos/assets/b6/characters/` (e.g., `kiosk_keeper`, `parcel_runner`) and layered painted sprites:
- **Head**: Character head sprites with painted ink outlines, expressive comic eyes, and distinct hair silhouettes (`hero-head.png`, `head.png`). Head diameter is approximately 130–160px at native resolution.
- **Torso / Garment**: Distinctive painted upper body (`body.png`) with clean shoulder cuffs for arm sockets.
- **Limbs**:
  - **Arms**: Two-segmented planar bones connected at the elbow joint, driven by `b6_puppet.py` forward kinematics (FK) and planar inverse kinematics (IK) for precise prop contact.
  - **Legs**: Grounded painted legs with distinct shoe sprites (`shoes.png`, `shoe-left.png`, `shoe-right.png`) anchored firmly to the ground plane.
- **Multi-Angle Support**: The puppet engine supports 3 native character views:
  - `front`: Direct engagement with the camera for punchlines and confessions.
  - `three_quarter`: The primary storytelling view, angled toward props and action cards.
  - `side`: Dynamic lateral actions, walks, and profile inspections.

```
       [ Head: Expressive painted face ]
                   |
              O  (Painted Head Sprite)
             /|\  (Garment Body & IK Limbs)
             / \  (Planted Legs & Shoes)
           [ Grounded on room horizon plane ]
```

### 2.2 Approved Puppet Actions & Emotional Expressions
The character puppet responds to canonical kinetic actions and nuanced acting beats:
- `rest`: Relaxed stance, subtle idle breathing, hands resting naturally at side or waist.
- `reach`: Deliberate forward reaching arm movement toward a prop or card using planar IK.
- `offer`: Presenting an item or gesturing outwards toward a keyword card.
- `receive`: Grasping or interacting with a received object.
- `retract`: Withdrawing hand back to neutral after interaction.
- `chin_on_hand_thoughtful`: Khuỷu tay tì lên mặt bàn, bàn tay chống cằm, đầu hơi nghiêng, mắt nhắm nhẹ hoặc nheo lại suy tư trầm ngâm (thể hiện sự chán chường, triết lý hoặc khoảng lặng nội tâm trước khi tiếp tục hành động).
- `hold_phone_anticipation`: Hai tay cầm điện thoại trước ngực, mắt mở to kỳ vọng ánh sáng thông báo.
- `deadpan_sigh`: Nhìn chằm chằm vào khoảng không, thở dài buông xuôi sau khi nhận ra không có gì mới.

---

## 3. ANIMATION PRINCIPLES

### 3.1 Snappy Keyframe-Driven Movement & 3.5s Pacing
- **Strict 3.5s Pacing Rule**: No scene or character pose may remain static for more than **3.5 seconds**. Every narration segment is broken down into dynamic cuts with active camera moves, gesture shifts, or prop reveals.
- **Continuous Idle Breathing**: A natural sinusoidal vertical translation ($\pm 3\text{px}$) and subtle head tilt ($\pm 1.5^\circ$) keep the character subtly alive even during pauses.
- **Kinetic Prop Pop-in**: Props, counters, and keyword cards enter with an elastic bounce: scale expands from $0.0 \to 1.12$ over 0.18s, then settles smoothly to $1.0$ over 0.07s.

---

## 4. ENVIRONMENTS, PROPS, AND VISUAL ELEMENTS

### 4.1 Layered Background Environments
Backgrounds use high-resolution painted panoramas from `_ref_director/skills/directing-stickman-videos/assets/b6/paint/`:
- **Indoor Settings**: `study-panorama.png` (warm textured room with desk horizon, bookshelf textures, and soft lighting) or `hotel-panorama.png`.
- **Exterior Settings**: `paris-panorama.png` or clean warm off-white canvas `#F7F5F0`.
- **Furniture & Foreground**: Real painted prop sprites like `table.png` (desk) placed naturally in the scene to ground the character in real space.

### 4.2 Meaningful Keywords & Typography
- **Typography Standard**: All UI cards, counters, and badges use **`ArchivoBlack.ttf`** from `_ref_director/skills/directing-stickman-videos/assets/fonts/` (or `Caveat.ttf` for hand-written notes).
- **Concise 1–3 Word Keywords**: Every card must display readable, high-contrast semantic keywords (e.g. `'PHONE UNLOCK'`, `'0 MESSAGES'`, `'NO NOTIFS'`) rather than generic dummy wireframes.
- **Color Accents**:
  - Warning Red (`#E63946` / `#D7372C`): Alerts, no-notifs, zero rewards.
  - Logic Navy (`#1D3557`): Baseline technology, focus, lock states.
  - Idea Amber (`#FFB703`): Lightbulbs, countdown timers, discoveries.
  - Success Teal (`#2A9D8F`): Checkmarks, batches, positive outcomes.

---

## 5. DYNAMIC VIRTUAL CAMERA & FRAMING

All camera movements are rendered programmatically:
- `wide`: Establishes the full room environment, table, and character.
- `medium`: Standard explaining view (waist up, character occupying ~55% of frame).
- `close_up`: Dramatic reaction shot, scaling in 1.35x focusing on head, facial expression, and held smartphone.
- `zoom_in`: Smooth progressive zoom (1.0x to 1.15x) focusing tension onto an unresolved question.
- `shake`: Rapid dynamic displacement ($\pm 6\text{px}$) decaying over 8–10 frames on sudden comic surprises or emphatic punchlines.

---

## 6. SOUND EFFECTS (SFX) INTEGRATION

All visual pop-ins and camera actions are paired with audio cues from the `_ref_director` sound library (`assets/b-audio-library/audio/`):
- `swish` / `whoosh`: Fast card entrances and camera pans (`artisticdude-swishes`).
- `click` / `tap`: Phone unlocking and toggle clicks (`kenney-interface/click_001.ogg`).
- `pop` / `boing`: Playful card reveals and idea bounces (`bf-cartoon-bounce`, `aeva-boing`).

---

## 7. RENDER ENGINE COMPATIBILITY

The rendering pipeline is driven by:
- **`engine/stickman_renderer.py`**: Bridges `03_storyboard.json` and scene audio directly to `_ref_director`'s `b6_puppet.py` planar puppet compositor, rendering full 1080p/720p H.264 video.
- **Zero Legacy Pillow Lines**: Primitive line-drawing functions (`ImageDraw.line`) are completely retired. Every frame is a composite of real painted layers, puppet kinematics, and typography.
