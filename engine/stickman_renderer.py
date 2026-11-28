# -*- coding: utf-8 -*-
"""
STICKMAN RENDERER — CRAZYMEI SOLO CHARACTER ENGINE (TIER A+)
- Data-driven: reads pose / mood / position / camera / card / header from the storyboard
  (allowed values: engine/vocab.py). The hand-written choreography for SCENE_001-006 only
  runs in legacy mode (default for project video-001), so new projects are not polluted by it.
- Balanced 16:9 Solo Composition:
  * Top Header: Centered headline with hand-drawn red wavy underline
  * Center-Left (x~0.28): Solo Hero stickman with full dynamic kinematics
  * Center-Right (x~0.68): Rich contextual visual cards, icons & kinetic typography
  * Grounded Desk Horizon: Flat resting phone, coffee mug with steam, contact shadows
- Expressive Animation & Micro-Motion:
  * Full support for all 42 storyboard scenes & poses
  * Biological blinking, respiration, gaze tracking, talk lip-sync
  * Sweat drops, impact lines, shock lines
- Fixed Glitches:
  * Clamped eye pupils strictly within eye sockets
  * Fully locked/closed padlock icon
  * Flat horizontal perspective phone on desk (never vertical trash bin)
"""

import argparse
import json
import math
import os
import re
import sys
import time
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_ASSETS = os.path.join(BASE_DIR, "assets")
REF_ASSETS = os.path.join(BASE_DIR, "_ref_director", "skills", "directing-stickman-videos", "assets")

try:
    import imageio
except ImportError:
    imageio = None

try:
    from engine.vocab import POSES, MOODS, EXPRESSION_KEYWORDS
    from engine.icons import draw_icon
except ImportError:  # executed as `python engine/stickman_renderer.py`
    from vocab import POSES, MOODS, EXPRESSION_KEYWORDS
    from icons import draw_icon

# Canvas constants
CANVAS_WIDTH = 1920
CANVAS_HEIGHT = 1080
DEFAULT_FPS = 30
SS_SCALE = 2  # 2x supersampling for clean antialiasing
SW = CANVAS_WIDTH * SS_SCALE
SH = CANVAS_HEIGHT * SS_SCALE

# Colors
COLOR_INK = (30, 28, 26, 255)
COLOR_WHITE = (251, 250, 248, 255)
COLOR_RED = (215, 55, 44, 255)
COLOR_PAPER_BASE = (244, 240, 234, 255)
COLOR_DESK = (234, 230, 222, 255)
COLOR_MUTED = (138, 133, 126, 255)
COLOR_CARD_BG = (255, 255, 255, 248)
COLOR_CARD_BORDER = (210, 205, 198, 255)
COLOR_GLOW_BLUE = (66, 133, 244, 255)
COLOR_GOLD = (244, 180, 0, 255)
COLOR_SHADOW = (195, 190, 182, 255)


def draw_contact_shadow(draw_ctx, cx, cy, rx, ry):
    """Draws soft elliptical contact shadow under props and feet."""
    draw_ctx.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=COLOR_SHADOW)


def draw_wavy_underline(draw_ctx, cx, y, width, amp=10, wave_len=28, color=COLOR_RED, line_w=7):
    """Draws an expressive hand-drawn red wavy underline."""
    pts = []
    x0 = cx - width // 2
    steps = int(width / 4)
    for i in range(steps + 1):
        px = x0 + i * 4
        py = y + math.sin((px - x0) / wave_len) * amp
        pts.append((px, py))
    draw_ctx.line(pts, fill=color, width=line_w, joint="curve")


def draw_coffee_mug(draw_ctx, x, y, s, steam_phase=0.0):
    """Draws a minimalist cute desk coffee mug with contact shadow & steam."""
    draw_contact_shadow(draw_ctx, x, y, int(26 * s), int(7 * s))
    mw, mh = int(38 * s), int(44 * s)
    draw_ctx.rounded_rectangle(
        [x - mw // 2, y - mh, x + mw // 2, y],
        radius=int(6 * s),
        fill=COLOR_WHITE,
        outline=COLOR_INK,
        width=int(4 * s)
    )
    draw_ctx.arc(
        [x - mw // 2 - int(14 * s), y - int(36 * s), x - mw // 2 + int(4 * s), y - int(10 * s)],
        start=90, end=270, fill=COLOR_INK, width=int(4 * s)
    )
    for ox, ph in ((-int(6 * s), 0.0), (int(6 * s), 1.8)):
        w_y = y - mh - int((12 + math.sin(steam_phase + ph) * 4) * s)
        draw_ctx.arc(
            [x + ox - int(7 * s), w_y - int(12 * s), x + ox + int(7 * s), w_y],
            start=180, end=360, fill=COLOR_MUTED, width=int(3 * s)
        )


def draw_sweat_drop(draw_ctx, x, y, s):
    """Draws animated cartoon blue sweat drop near the temple."""
    dw, dh = int(14 * s), int(20 * s)
    draw_ctx.ellipse([x - dw // 2, y, x + dw // 2, y + dh], fill=(110, 185, 255, 255), outline=COLOR_INK, width=int(3 * s))
    draw_ctx.polygon([(x - dw // 2, y + dh // 2), (x, y - int(6 * s)), (x + dw // 2, y + dh // 2)], fill=(110, 185, 255, 255))
    draw_ctx.line([(x - dw // 2, y + dh // 2), (x, y - int(6 * s)), (x + dw // 2, y + dh // 2)], fill=COLOR_INK, width=int(3 * s))


def draw_impact_lines(draw_ctx, cx, cy, s, prog=1.0):
    """Draws small cartoon impact tick lines when phone strikes desk."""
    if prog <= 0:
        return
    line_len = int(22 * s * prog)
    lw = int(4 * s)
    for angle in (-48, -24, 0, 24, 48):
        rad = math.radians(angle - 90)
        r0 = int(20 * s)
        r1 = r0 + line_len
        x0 = cx + math.cos(rad) * r0
        y0 = cy + math.sin(rad) * r0
        x1 = cx + math.cos(rad) * r1
        y1 = cy + math.sin(rad) * r1
        draw_ctx.line([(x0, y0), (x1, y1)], fill=COLOR_INK, width=lw)


def draw_shock_lines(draw_ctx, cx, cy, r, s):
    """Draws comic shock spike lines around head."""
    for ang in (-60, -35, -15, 15, 35, 60):
        rad = math.radians(ang - 90)
        x0 = cx + math.cos(rad) * r
        y0 = cy + math.sin(rad) * r
        x1 = cx + math.cos(rad) * (r + int(24 * s))
        y1 = cy + math.sin(rad) * (r + int(24 * s))
        draw_ctx.line([(x0, y0), (x1, y1)], fill=COLOR_RED, width=int(4 * s))


def draw_lightbulb(draw_ctx, cx, cy, s):
    """Draws an idea lightbulb glowing above stickman head."""
    lr = int(24 * s)
    draw_ctx.ellipse([cx - lr, cy - lr, cx + lr, cy + lr], fill=COLOR_GOLD, outline=COLOR_INK, width=int(4 * s))
    draw_ctx.rectangle([cx - int(10 * s), cy + lr - int(6 * s), cx + int(10 * s), cy + lr + int(14 * s)], fill=COLOR_MUTED, outline=COLOR_INK, width=int(3 * s))
    # Glowing rays
    for ang in (-60, -30, 0, 30, 60):
        rad = math.radians(ang - 90)
        x0 = cx + math.cos(rad) * (lr + int(6 * s))
        y0 = cy + math.sin(rad) * (lr + int(6 * s))
        x1 = cx + math.cos(rad) * (lr + int(18 * s))
        y1 = cy + math.sin(rad) * (lr + int(18 * s))
        draw_ctx.line([(x0, y0), (x1, y1)], fill=COLOR_GOLD, width=int(4 * s))


# --------------------------------------------------------------------------
# Data-driven rig tables & helpers (allowed names live in engine/vocab.py)
# --------------------------------------------------------------------------
# Angles are screen-space degrees: 0 = right, 90 = down, 180 = left, -90 = up.
POSE_RIGS = {
    "idle_neutral":      dict(la=135, lb=95,  ra=28, rb=-35, look=(0.70, 0.25),  mood="neutral", lean=2.0),
    "pointing_target":   dict(la=135, lb=95,  ra=15, rb=8,   look=(0.85, 0.20),  mood="eager",   lean=4.0),
    "thinking":          dict(la=135, lb=95,  ra=8,  rb=-153, look=(0.60, -0.40), mood="neutral", lean=2.0),   # hand on chin
    "celebrate_win":     dict(la=-140, lb=-105, ra=-40, rb=-75, look=(0.50, -0.30), mood="happy",  lean=-3.0),  # arms up in a V
    "idea_lightbulb":    dict(la=135, lb=95,  ra=-25, rb=-95, look=(0.70, -0.35), mood="eager",   lean=2.0),   # finger up
    "stressed_headache": dict(la=180, lb=-71, ra=0,  rb=-109, look=(0.0, 0.40),   mood="sad",     lean=8.0,   sweat=True),  # hands at temples
    "shocked_fall":      dict(la=-160, lb=-130, ra=-20, rb=-50, look=(0.30, 0.0),  mood="deadpan", lean=-15.0, shock=True),  # hands flung up
    "running_hurry":     dict(la=25,  lb=-45, ra=150, rb=105, look=(0.90, 0.10), mood="eager",   lean=16.0,  sweat=True, stride=True),
    # Stickman 2.0 poses
    "kneeling_offer":    dict(la=45,  lb=20,  ra=25, rb=10,  look=(0.80, -0.10), mood="happy",   lean=4.0),
    "singing_mic":       dict(la=-120, lb=-80, ra=-35, rb=-60, look=(0.40, -0.40), mood="happy",  lean=-6.0),
    "balancing":         dict(la=170, lb=175, ra=10, rb=5,   look=(0.60, 0.10),  mood="eager",   lean=2.0),
    "lifting_weight":    dict(la=130, lb=60,  ra=20, rb=-85, look=(0.60, 0.0),   mood="sad",     lean=-2.0,  sweat=True),
    "painting":          dict(la=60,  lb=40,  ra=20, rb=-15, look=(0.80, 0.0),   mood="eager",   lean=4.0),
    "slipping_fall":     dict(la=-150, lb=-120, ra=-25, rb=-55, look=(0.20, 0.10), mood="deadpan", lean=-20.0, shock=True),
    "dancing":           dict(la=150, lb=120, ra=-45, rb=-80, look=(0.50, -0.20), mood="happy",  lean=6.0),
    "sitting":           dict(la=120, lb=85,  ra=40, rb=10,  look=(0.70, 0.15),  mood="neutral", lean=2.0),
    "walking":           dict(la=125, lb=90,  ra=45, rb=25,  look=(0.80, 0.15),  mood="neutral", lean=6.0,   stride=True),
    "presenting":        dict(la=135, lb=95,  ra=20, rb=-15, look=(0.80, 0.0),   mood="happy",   lean=3.0),
}

FRAMING_ZOOM = {"wide": 1.0, "medium": 1.08, "close_up": 1.35}


def resolve_mood(visual: dict, rig_mood: str, pose: str, legacy: bool = False) -> str:
    """Explicit `visual.mood` wins; otherwise map keywords of `visual.expression`; else the pose default."""
    explicit = visual.get("mood")
    if explicit in MOODS:
        return explicit
    expr = str(visual.get("expression") or "").lower()
    if legacy:  # exact behaviour of the original renderer
        return "eager" if (pose == "idle_neutral" and "curious" in expr) else rig_mood
    for keys, mood in EXPRESSION_KEYWORDS:
        if any(k in expr for k in keys):
            return mood
    return rig_mood


def hex_to_rgba(value, default=None):
    """'#E63946' -> (230, 57, 70, 255). Returns `default` for anything invalid."""
    if isinstance(value, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", value.strip()):
        v = value.strip().lstrip("#")
        return (int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16), 255)
    return default


def camera_box(camera: dict, f: int, total_frames: int, focus_xy, card_cx=None):
    """
    Crop box (in supersampled canvas pixels) for the virtual camera.
    framing: wide 1.0x, medium 1.08x, close_up 1.35x (centred on the hero's head).
    movement: static / zoom_in / zoom_out / pan_left / pan_right / shake.
    When a card is on screen (card_cx given) close_up becomes a softer 1.18x two-shot centred between
    hero and card, so the card is never cropped out of frame.
    """
    camera = camera or {}
    framing = camera.get("framing", "wide")  # no camera info -> no zoom
    move = camera.get("movement", "static")
    zoom = FRAMING_ZOOM.get(framing, 1.0)
    p = f / float(max(1, total_frames - 1))
    ease = p * p * (3.0 - 2.0 * p)

    cx, cy = SW / 2.0, SH / 2.0
    if framing == "close_up" and card_cx is not None:
        zoom = 1.18
        cx = (focus_xy[0] + card_cx) / 2.0
        cy = 0.6 * focus_xy[1] + 0.4 * cy
    elif framing == "close_up":
        cx = 0.85 * focus_xy[0] + 0.15 * cx
        cy = 0.85 * focus_xy[1] + 0.15 * cy

    if move == "zoom_in":
        zoom += 0.15 * ease
    elif move == "zoom_out":
        zoom = max(1.0, zoom + 0.15 - 0.15 * ease)
    elif move in ("pan_left", "pan_right"):
        zoom = max(zoom, 1.10)
        span = 0.03 * SW
        cx += (span - 2 * span * ease) if move == "pan_left" else (-span + 2 * span * ease)
    elif move == "shake":
        zoom = max(zoom, 1.04)
        amp = 12.0 * math.exp(-f / 6.0)  # ~6px at 1080p, decays over ~10 frames
        cx += amp * math.sin(f * 2.3)
        cy += amp * 0.6 * math.cos(f * 2.9)

    w, h = SW / zoom, SH / zoom
    left = min(max(cx - w / 2.0, 0.0), SW - w)
    top = min(max(cy - h / 2.0, 0.0), SH - h)
    return (left, top, left + w, top + h)


def apply_camera(canvas, camera: dict, f: int, total_frames: int, focus_xy, card_cx=None):
    """Crop the supersampled canvas with the camera box and downscale to 1080p."""
    box = camera_box(camera, f, total_frames, focus_xy, card_cx)
    return canvas.resize((CANVAS_WIDTH, CANVAS_HEIGHT), Image.Resampling.LANCZOS, box=box)


class StickmanActor:
    """
    Modular Stickman Actor supporting:
    - Forward Kinematics (FK) for spine, legs, and arms
    - Clamped pupils strictly inside eye sockets
    - Biological blinking, breathing, and lip-sync
    - Contact shadows beneath both feet
    """
    def __init__(self, actor_id: str = "hero", scale: float = 1.35 * SS_SCALE, facing: int = 1):
        self.actor_id = actor_id
        self.s = scale
        self.facing = facing  # 1: facing right, -1: facing left
        self.head_r = int(58 * self.s)
        self.head_stroke = int(10 * self.s)
        self.body_stroke = int(17 * self.s)
        self.eye_r = int(7 * self.s)
        self.mouth_stroke = int(7 * self.s)

    def draw_limb(self, draw_ctx, start_xy, a_deg, b_deg, l1, l2, width):
        """Draws two-joint limb with curved joint."""
        x0, y0 = start_xy
        a_rad = math.radians(a_deg)
        b_rad = math.radians(b_deg)
        x1 = x0 + math.cos(a_rad) * (l1 * self.s)
        y1 = y0 + math.sin(a_rad) * (l1 * self.s)
        x2 = x1 + math.cos(b_rad) * (l2 * self.s)
        y2 = y1 + math.sin(b_rad) * (l2 * self.s)
        draw_ctx.line([(x0, y0), (x1, y1), (x2, y2)], fill=COLOR_INK, width=width, joint="curve")
        return (x1, y1), (x2, y2)

    def draw_glove_hand(self, draw_ctx, x, y, r_deg=0):
        """Draws expressive cartoon mitten glove hand."""
        hs = self.s * 0.70
        r_rad = math.radians(r_deg)
        pts = [
            (-12, 10), (-16, -5), (-14, -20), (-8, -24), (-2, -18), (-2, -5),
            (6, -22), (14, -20), (14, -5),
            (20, -18), (26, -14), (24, 0),
            (20, 16), (0, 22), (-12, 10)
        ]
        cos_r, sin_r = math.cos(r_rad), math.sin(r_rad)
        trans_pts = [(x + (px * cos_r - py * sin_r) * hs, y + (px * sin_r + py * cos_r) * hs) for px, py in pts]
        draw_ctx.polygon(trans_pts, fill=COLOR_WHITE, outline=COLOR_INK)
        draw_ctx.line(trans_pts + [trans_pts[0]], fill=COLOR_INK, width=int(5 * self.s))

    def render(self, draw_ctx, hip_x, hip_y, lean_deg=0.0, head_tilt=0.0,
               la=135, lb=95, ra=28, rb=-35, mood="eager", look=(0.7, 0.3),
               blink=0.0, mouth_open=0.0, slouch=0.0, desk_y=None,
               has_sweat=False, has_shock=False, stride=0.0):
        """
        Renders stickman with dynamic spine lean, slouch, and articulated limbs.
        `stride` (-1..1) scissors the legs for running. When facing left (-1) the arm
        angles are mirrored so poses written for a right-facing hero still read correctly.
        Returns: (hand_l, hand_r, (head_x, head_y), (foot_l, foot_r))
        """
        if self.facing < 0:
            la, lb, ra, rb = 180 - la, 180 - lb, 180 - ra, 180 - rb
        # Spine kinematics with lean and slouch
        lean_rad = math.radians(lean_deg * self.facing)
        spine_len = (128 - slouch * 24) * self.s

        neck_x = hip_x + math.sin(lean_rad) * spine_len
        neck_y = hip_y - math.cos(lean_rad) * spine_len

        shoulder_x = hip_x + math.sin(lean_rad) * (spine_len * 0.88)
        shoulder_y = hip_y - math.cos(lean_rad) * (spine_len * 0.88)

        total_head_angle = lean_deg * self.facing + head_tilt * self.facing
        head_rad = math.radians(total_head_angle)
        head_dist = (62 - slouch * 10) * self.s
        hx = neck_x + math.sin(head_rad) * head_dist
        hy = neck_y - math.cos(head_rad) * head_dist

        # 1. Legs with dynamic forward brace & feet contact shadows
        lean_eff = lean_deg * self.facing
        leg_l_angle = 115 - lean_eff * 0.4 - stride * 35
        leg_r_angle = 65 + lean_eff * 0.4 + stride * 35
        knee_l, foot_l = self.draw_limb(draw_ctx, (hip_x, hip_y), leg_l_angle, 95, 78, 78, self.body_stroke)
        knee_r, foot_r = self.draw_limb(draw_ctx, (hip_x, hip_y), leg_r_angle, 85, 78, 78, self.body_stroke)

        shadow_y = desk_y if desk_y is not None else int(hip_y + 150 * self.s)
        draw_contact_shadow(draw_ctx, foot_l[0], shadow_y, int(22 * self.s), int(7 * self.s))
        draw_contact_shadow(draw_ctx, foot_r[0], shadow_y, int(22 * self.s), int(7 * self.s))

        # 2. Torso Spine
        draw_ctx.line([(hip_x, hip_y), (neck_x, neck_y)], fill=COLOR_INK, width=self.body_stroke)

        # 3. Arms
        elbow_l, hand_l = self.draw_limb(draw_ctx, (shoulder_x, shoulder_y), la, lb, 84, 82, self.body_stroke)
        elbow_r, hand_r = self.draw_limb(draw_ctx, (shoulder_x, shoulder_y), ra, rb, 84, 82, self.body_stroke)

        # 4. Hands
        self.draw_glove_hand(draw_ctx, hand_l[0], hand_l[1], r_deg=lb - 90)
        self.draw_glove_hand(draw_ctx, hand_r[0], hand_r[1], r_deg=rb - 45)

        # 5. Head
        draw_ctx.ellipse(
            [hx - self.head_r, hy - self.head_r, hx + self.head_r, hy + self.head_r],
            fill=COLOR_WHITE, outline=COLOR_INK, width=self.head_stroke
        )

        # 6. Eyes & Clamped Pupils (Guaranteed never straying outside socket)
        ey_scale = max(0.12, 1.0 - 0.88 * blink)
        eye_y = hy - int(5 * self.s)
        max_look_x = int(self.head_r * 0.28)
        max_look_y = int(self.head_r * 0.22)
        look_dx = max(-max_look_x, min(max_look_x, look[0] * (14 * self.s) * self.facing))
        look_dy = max(-max_look_y, min(max_look_y, look[1] * (7 * self.s)))

        for side in (-1, 1):
            ex = hx + side * int(22 * self.s) + look_dx
            ey = eye_y + look_dy
            draw_ctx.ellipse(
                [ex - self.eye_r, ey - self.eye_r * ey_scale,
                 ex + self.eye_r, ey + self.eye_r * ey_scale],
                fill=COLOR_INK
            )

        # 7. Eyebrows
        if mood in ("eager", "happy"):
            draw_ctx.arc([hx - int(32 * self.s), hy - int(28 * self.s), hx - int(8 * self.s), hy - int(12 * self.s)],
                         start=200, end=340, fill=COLOR_INK, width=int(5 * self.s))
            draw_ctx.arc([hx + int(8 * self.s), hy - int(28 * self.s), hx + int(32 * self.s), hy - int(12 * self.s)],
                         start=200, end=340, fill=COLOR_INK, width=int(5 * self.s))
        elif mood in ("flat", "deadpan"):
            draw_ctx.line([(hx - int(30 * self.s), hy - int(20 * self.s)), (hx - int(10 * self.s), hy - int(20 * self.s))],
                           fill=COLOR_INK, width=int(5 * self.s))
            draw_ctx.line([(hx + int(10 * self.s), hy - int(20 * self.s)), (hx + int(30 * self.s), hy - int(20 * self.s))],
                           fill=COLOR_INK, width=int(5 * self.s))
        elif mood == "sad":
            draw_ctx.arc([hx - int(32 * self.s), hy - int(24 * self.s), hx - int(8 * self.s), hy - int(8 * self.s)],
                         start=20, end=160, fill=COLOR_INK, width=int(5 * self.s))
            draw_ctx.arc([hx + int(8 * self.s), hy - int(24 * self.s), hx + int(32 * self.s), hy - int(8 * self.s)],
                         start=20, end=160, fill=COLOR_INK, width=int(5 * self.s))
        elif mood == "neutral":
            draw_ctx.line([(hx - int(28 * self.s), hy - int(22 * self.s)), (hx - int(10 * self.s), hy - int(22 * self.s))],
                           fill=COLOR_INK, width=int(4 * self.s))
            draw_ctx.line([(hx + int(10 * self.s), hy - int(22 * self.s)), (hx + int(28 * self.s), hy - int(22 * self.s))],
                           fill=COLOR_INK, width=int(4 * self.s))

        # 8. Mouth
        if mouth_open > 0.15:
            mo_h = int(mouth_open * 16 * self.s)
            draw_ctx.ellipse([hx - int(15 * self.s), hy + int(26 * self.s) - mo_h // 2,
                               hx + int(15 * self.s), hy + int(26 * self.s) + mo_h // 2],
                              fill=(49, 29, 34, 255), outline=COLOR_INK, width=int(5 * self.s))
        elif mood in ("eager", "happy"):
            draw_ctx.arc([hx - int(23 * self.s), hy + int(14 * self.s), hx + int(23 * self.s), hy + int(42 * self.s)],
                         start=20, end=160, fill=COLOR_INK, width=self.mouth_stroke)
        elif mood in ("flat", "deadpan"):
            draw_ctx.line([(hx - int(22 * self.s), hy + int(30 * self.s)), (hx + int(22 * self.s), hy + int(30 * self.s))],
                           fill=COLOR_INK, width=self.mouth_stroke)
        elif mood == "sad":
            draw_ctx.arc([hx - int(23 * self.s), hy + int(24 * self.s), hx + int(23 * self.s), hy + int(50 * self.s)],
                         start=200, end=340, fill=COLOR_INK, width=self.mouth_stroke)
        elif mood == "neutral":
            draw_ctx.line([(hx - int(18 * self.s), hy + int(28 * self.s)), (hx + int(18 * self.s), hy + int(28 * self.s))],
                           fill=COLOR_INK, width=self.mouth_stroke)

        # 9. Comic FX
        if has_sweat:
            draw_sweat_drop(draw_ctx, hx + int(46 * self.s * self.facing), hy - int(10 * self.s), self.s)
        if has_shock:
            draw_shock_lines(draw_ctx, hx, hy, self.head_r + int(6 * self.s), self.s)

        return hand_l, hand_r, (hx, hy), (foot_l, foot_r)


class B5CrazyMeiEngine:
    def __init__(self):
        print("[B5 CrazyMei Engine] Initializing CrazyMei Solo Character Rig (Tier A+)...")
        font_black = os.path.join(LOCAL_ASSETS, "fonts", "ArchivoBlack.ttf")
        if not os.path.exists(font_black):
            font_black = os.path.join(REF_ASSETS, "fonts", "ArchivoBlack.ttf")

        font_anton = os.path.join(LOCAL_ASSETS, "fonts", "Anton-0.ttf")
        if not os.path.exists(font_anton):
            font_anton = os.path.join(REF_ASSETS, "b5", "example", "assets", "fonts", "Anton-0.ttf")

        font_sans = os.path.join(LOCAL_ASSETS, "fonts", "NotoSans.ttf")
        if not os.path.exists(font_sans):
            font_sans = os.path.join(REF_ASSETS, "fonts", "NotoSans.ttf")

        head_font_path = font_black if os.path.exists(font_black) else font_anton if os.path.exists(font_anton) else None
        self.head_font_path = head_font_path
        self.sans_font_path = font_sans if os.path.exists(font_sans) else head_font_path
        self._font_cache = {}

        if head_font_path and os.path.exists(head_font_path):
            self.font_hero = ImageFont.truetype(head_font_path, int(64 * SS_SCALE))
            self.font_giant = ImageFont.truetype(head_font_path, int(96 * SS_SCALE))
            self.font_title = ImageFont.truetype(head_font_path, int(46 * SS_SCALE))
            self.font_badge = ImageFont.truetype(head_font_path, int(30 * SS_SCALE))
        else:
            self.font_hero = ImageFont.load_default()
            self.font_giant = ImageFont.load_default()
            self.font_title = ImageFont.load_default()
            self.font_badge = ImageFont.load_default()

        if os.path.exists(font_sans):
            self.font_sub = ImageFont.truetype(font_sans, int(26 * SS_SCALE))
            self.font_small = ImageFont.truetype(font_sans, int(20 * SS_SCALE))
        else:
            self.font_sub = self.font_badge
            self.font_small = self.font_badge

        paper_path = os.path.join(LOCAL_ASSETS, "textures", "paper.png")
        if not os.path.exists(paper_path):
            paper_path = os.path.join(REF_ASSETS, "b5", "example", "assets", "paper.png")

        if os.path.exists(paper_path):
            self.paper_texture = Image.open(paper_path).convert("RGBA").resize((SW, SH), Image.Resampling.LANCZOS)
        else:
            self.paper_texture = None

    def create_base_canvas(self, f: int = 0):
        """Creates warm textured paper stage with desk horizon & coffee mug."""
        base = Image.new("RGBA", (SW, SH), COLOR_PAPER_BASE)
        if self.paper_texture:
            base = Image.blend(base, self.paper_texture, 0.30)

        draw = ImageDraw.Draw(base)
        desk_y = int(SH * 0.77)

        # Desk base surface
        draw.rectangle([0, desk_y, SW, SH], fill=COLOR_DESK)
        draw.line([0, desk_y, SW, desk_y], fill=COLOR_MUTED, width=int(5 * SS_SCALE))

        # Minimal Desk Props: Cute coffee mug with steam on far left
        mug_x = int(SW * 0.10)
        draw_coffee_mug(draw, mug_x, desk_y, SS_SCALE, steam_phase=f * 0.12)

        return base, desk_y

    def draw_top_header(self, draw_ctx, headline: str, subline: str = None):
        """Renders bold headline keyword with hand-drawn red wavy underline, centered (auto-shrinks long text)."""
        cx = SW // 2
        hy = int(SH * 0.09)
        font = self.fit_font(draw_ctx, headline, int(SW * 0.80), 64 * SS_SCALE)
        draw_ctx.text((cx, hy), headline, fill=COLOR_INK, font=font, anchor="mm")
        under_w = int(draw_ctx.textlength(headline, font=font)) + int(60 * SS_SCALE)
        draw_wavy_underline(draw_ctx, cx, hy + int(50 * SS_SCALE), under_w, amp=int(7 * SS_SCALE), wave_len=int(24 * SS_SCALE), line_w=int(6 * SS_SCALE))

        if subline:
            sub_font = self.fit_font(draw_ctx, subline, int(SW * 0.70), 28 * SS_SCALE, path=self.sans_font_path)
            draw_ctx.text((cx, hy + int(86 * SS_SCALE)), subline, fill=COLOR_MUTED, font=sub_font, anchor="mm")

    def draw_phone(self, draw_ctx, x, y, state: str, s: float, flat_ratio: float = 0.0, desk_y: int = None):
        """
        Draws smartphone prop.
        flat_ratio = 1.0: resting flat horizontally on the desk with shadow.
        flat_ratio = 0.0: held vertically upright in actor's hand.
        """
        pw = int((90 * (1.0 - flat_ratio) + 140 * flat_ratio) * SS_SCALE)
        ph = int((160 * (1.0 - flat_ratio) + 34 * flat_ratio) * SS_SCALE)

        if flat_ratio > 0.05 and desk_y is not None:
            sh_rx = int(pw * 0.54)
            sh_ry = int(9 * SS_SCALE)
            draw_contact_shadow(draw_ctx, x, desk_y, sh_rx, sh_ry)

        draw_ctx.rounded_rectangle(
            [x - pw // 2, y - ph // 2, x + pw // 2, y + ph // 2],
            radius=int(12 * SS_SCALE),
            fill=COLOR_INK
        )

        screen_fill = (248, 250, 252, 255) if state in ("unlocked", "empty") else (38, 36, 34, 255) if state == "locked" else (225, 228, 232, 255)
        sx1 = x - pw // 2 + int(6 * SS_SCALE)
        sy1 = y - ph // 2 + int(6 * SS_SCALE)
        sx2 = x + pw // 2 - int(6 * SS_SCALE)
        sy2 = y + ph // 2 - int(6 * SS_SCALE)
        draw_ctx.rounded_rectangle(
            [sx1, sy1, sx2, sy2],
            radius=int(8 * SS_SCALE),
            fill=screen_fill
        )

        if flat_ratio < 0.4:
            if state == "unlocked":
                draw_ctx.rounded_rectangle(
                    [x - int(30 * SS_SCALE), y - int(28 * SS_SCALE), x + int(30 * SS_SCALE), y - int(8 * SS_SCALE)],
                    radius=int(8 * SS_SCALE),
                    fill=(235, 242, 255, 255),
                    outline=COLOR_GLOW_BLUE,
                    width=int(2 * SS_SCALE)
                )
                draw_ctx.ellipse(
                    [x + int(14 * SS_SCALE), y - int(48 * SS_SCALE), x + int(28 * SS_SCALE), y - int(34 * SS_SCALE)],
                    fill=COLOR_RED
                )
            elif state == "empty":
                for line_offset in (-16, 0, 16):
                    draw_ctx.line(
                        [(x - int(24 * SS_SCALE), y + int(line_offset * SS_SCALE)),
                         (x + int(24 * SS_SCALE), y + int(line_offset * SS_SCALE))],
                        fill=(205, 210, 218, 255),
                        width=int(4 * SS_SCALE)
                    )

    def fit_font(self, draw_ctx, text: str, max_w: int, start_px: int, path: str = None):
        """Largest font (<= start_px) whose rendered `text` fits in max_w pixels."""
        path = path or self.head_font_path
        if not path:
            return self.font_badge
        px = int(start_px)
        floor_px = int(14 * SS_SCALE)
        while True:
            key = (path, px)
            font = self._font_cache.get(key)
            if font is None:
                font = ImageFont.truetype(path, px)
                self._font_cache[key] = font
            if px <= floor_px or draw_ctx.textlength(text, font=font) <= max_w:
                return font
            px = int(px * 0.92)

    def draw_custom_card(self, canvas, card: dict, card_cx: int, card_cy: int, f: int,
                         fps: int = DEFAULT_FPS, accent=None):
        """
        Storyboard-driven info card: {"icon": <vocab.ICONS>, "title": "1-3 WORDS", "subtitle": "optional"}.
        Pops in with an elastic bounce (0 -> 1.12 -> 1.0) like the art-direction spec.
        """
        t = f / float(fps)
        pt = t - 0.12
        if pt <= 0:
            return
        if pt < 0.18:
            scale = 1.12 * (pt / 0.18)
        elif pt < 0.25:
            scale = 1.12 - 0.12 * ((pt - 0.18) / 0.07)
        else:
            scale = 1.0
        scale = max(0.03, scale)

        cw, ch = int(560 * SS_SCALE), int(340 * SS_SCALE)
        margin = int(30 * SS_SCALE)
        layer = Image.new("RGBA", (cw + 2 * margin, ch + 2 * margin), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        lcx, lcy = layer.width // 2, layer.height // 2
        d.rounded_rectangle(
            [lcx - cw // 2, lcy - ch // 2, lcx + cw // 2, lcy + ch // 2],
            radius=int(26 * SS_SCALE), fill=COLOR_CARD_BG, outline=COLOR_CARD_BORDER, width=int(5 * SS_SCALE),
        )

        title = str(card.get("title", "")).upper().strip()
        subtitle = str(card.get("subtitle", "")).upper().strip()
        icon = card.get("icon")
        max_w = cw - int(70 * SS_SCALE)
        title_color = accent or COLOR_INK

        if icon:
            draw_icon(icon, d, lcx, lcy - int(66 * SS_SCALE), SS_SCALE, t=t, font=self.font_hero)
            title_y = lcy + int(50 * SS_SCALE)
            sub_y = lcy + int(110 * SS_SCALE)
        else:
            title_y = lcy - int(10 * SS_SCALE)
            sub_y = lcy + int(60 * SS_SCALE)

        if title:
            tf = self.fit_font(d, title, max_w, 64 * SS_SCALE)
            d.text((lcx, title_y), title, fill=title_color, font=tf, anchor="mm")
        if subtitle:
            sf = self.fit_font(d, subtitle, max_w, 28 * SS_SCALE, path=self.sans_font_path)
            d.text((lcx, sub_y), subtitle, fill=COLOR_MUTED, font=sf, anchor="mm")

        if abs(scale - 1.0) > 1e-3:
            layer = layer.resize((max(1, int(layer.width * scale)), max(1, int(layer.height * scale))),
                                 Image.Resampling.LANCZOS)
        canvas.alpha_composite(layer, dest=(int(card_cx - layer.width // 2), int(card_cy - layer.height // 2)))

    def draw_scene_info_card(self, draw_ctx, scene: dict, f: int, total_frames: int):
        """
        Renders rich visual props & kinetic card in the right half of the 16:9 frame (x ~ 0.70 * SW).
        Fills the right space beautifully with generous margins.
        """
        card_cx = int(SW * 0.70)
        card_cy = int(SH * 0.44)
        cw, ch = int(560 * SS_SCALE), int(340 * SS_SCALE)

        scene_id = scene.get("scene_id", "SCENE_001")
        narration = scene.get("narration_text", "")
        visual = scene.get("visual", {})
        action = visual.get("action", "")

        # Base Card
        draw_ctx.rounded_rectangle(
            [card_cx - cw // 2, card_cy - ch // 2, card_cx + cw // 2, card_cy + ch // 2],
            radius=int(26 * SS_SCALE),
            fill=COLOR_CARD_BG,
            outline=COLOR_CARD_BORDER,
            width=int(5 * SS_SCALE)
        )

        if scene_id == "SCENE_001":
            pop = min(1.0, max(0.0, (f - 20) / 14.0))
            draw_ctx.text((card_cx, card_cy - int(45 * SS_SCALE)), "YOU UNLOCK", fill=COLOR_INK, font=self.font_title, anchor="mm")
            draw_ctx.text((card_cx, card_cy + int(18 * SS_SCALE)), "YOUR PHONE", fill=COLOR_RED, font=self.font_title, anchor="mm")
            draw_ctx.rounded_rectangle(
                [card_cx - int(150 * SS_SCALE), card_cy + int(75 * SS_SCALE), card_cx + int(150 * SS_SCALE), card_cy + int(115 * SS_SCALE)],
                radius=int(14 * SS_SCALE),
                fill=(235, 242, 255, 255)
            )
            draw_ctx.text((card_cx, card_cy + int(95 * SS_SCALE)), "PHONE UNLOCKED", fill=COLOR_GLOW_BLUE, font=self.font_badge, anchor="mm")

        elif scene_id == "SCENE_002":
            icon_y = card_cy - int(65 * SS_SCALE)
            iw, ih = int(110 * SS_SCALE), int(65 * SS_SCALE)
            draw_ctx.rectangle(
                [card_cx - iw // 2, icon_y - ih // 2, card_cx + iw // 2, icon_y + ih // 2],
                outline=COLOR_MUTED, width=int(5 * SS_SCALE)
            )
            draw_ctx.polygon([
                (card_cx - iw // 2, icon_y - ih // 2),
                (card_cx, icon_y + int(16 * SS_SCALE)),
                (card_cx + iw // 2, icon_y - ih // 2)
            ], outline=COLOR_MUTED)

            bx, by = card_cx + iw // 2, icon_y - ih // 2
            br = int(26 * SS_SCALE)
            draw_ctx.ellipse([bx - br, by - br, bx + br, by + br], fill=COLOR_RED)
            draw_ctx.text((bx, by), "0", fill=COLOR_WHITE, font=self.font_badge, anchor="mm")

            draw_ctx.text((card_cx, card_cy + int(42 * SS_SCALE)), "0 MESSAGES", fill=COLOR_RED, font=self.font_hero, anchor="mm")
            draw_ctx.text((card_cx, card_cy + int(102 * SS_SCALE)), "INBOX EMPTY", fill=COLOR_MUTED, font=self.font_sub, anchor="mm")

        elif scene_id == "SCENE_003":
            bell_y = card_cy - int(65 * SS_SCALE)
            bw = int(68 * SS_SCALE)
            draw_ctx.arc([card_cx - bw, bell_y - int(52 * SS_SCALE), card_cx + bw, bell_y + int(30 * SS_SCALE)],
                         start=180, end=360, fill=COLOR_INK, width=int(6 * SS_SCALE))
            draw_ctx.line([(card_cx - bw, bell_y + int(30 * SS_SCALE)), (card_cx + bw, bell_y + int(30 * SS_SCALE))],
                          fill=COLOR_INK, width=int(6 * SS_SCALE))
            draw_ctx.ellipse([card_cx - int(12 * SS_SCALE), bell_y + int(30 * SS_SCALE),
                              card_cx + int(12 * SS_SCALE), bell_y + int(48 * SS_SCALE)], fill=COLOR_INK)
            draw_ctx.line([
                (card_cx - int(68 * SS_SCALE), bell_y - int(60 * SS_SCALE)),
                (card_cx + int(68 * SS_SCALE), bell_y + int(50 * SS_SCALE))
            ], fill=COLOR_RED, width=int(8 * SS_SCALE))

            draw_ctx.text((card_cx, card_cy + int(42 * SS_SCALE)), "NO NOTIFS", fill=COLOR_RED, font=self.font_hero, anchor="mm")
            draw_ctx.text((card_cx, card_cy + int(102 * SS_SCALE)), "ALL QUIET", fill=COLOR_MUTED, font=self.font_sub, anchor="mm")

        elif scene_id == "SCENE_004":
            draw_ctx.text((card_cx, card_cy - int(30 * SS_SCALE)), "NOTHING.", fill=COLOR_INK, font=self.font_giant, anchor="mm")
            draw_ctx.text((card_cx, card_cy + int(55 * SS_SCALE)), "ABSOLUTELY NOTHING", fill=COLOR_RED, font=self.font_title, anchor="mm")

        elif scene_id == "SCENE_005":
            lock_y = card_cy - int(55 * SS_SCALE)
            lw, lh = int(84 * SS_SCALE), int(70 * SS_SCALE)
            shackle_w = int(28 * SS_SCALE)
            draw_ctx.arc(
                [card_cx - shackle_w, lock_y - int(72 * SS_SCALE), card_cx + shackle_w, lock_y - int(16 * SS_SCALE)],
                start=180, end=360, fill=COLOR_INK, width=int(9 * SS_SCALE)
            )
            draw_ctx.line([(card_cx - shackle_w, lock_y - int(45 * SS_SCALE)), (card_cx - shackle_w, lock_y - int(10 * SS_SCALE))],
                          fill=COLOR_INK, width=int(9 * SS_SCALE))
            draw_ctx.line([(card_cx + shackle_w, lock_y - int(45 * SS_SCALE)), (card_cx + shackle_w, lock_y - int(10 * SS_SCALE))],
                          fill=COLOR_INK, width=int(9 * SS_SCALE))
            draw_ctx.rounded_rectangle(
                [card_cx - lw // 2, lock_y - int(16 * SS_SCALE), card_cx + lw // 2, lock_y + lh],
                radius=int(14 * SS_SCALE),
                fill=COLOR_INK
            )
            draw_ctx.ellipse([card_cx - int(8 * SS_SCALE), lock_y + int(8 * SS_SCALE),
                              card_cx + int(8 * SS_SCALE), lock_y + int(24 * SS_SCALE)], fill=COLOR_WHITE)
            draw_ctx.polygon([
                (card_cx - int(6 * SS_SCALE), lock_y + int(20 * SS_SCALE)),
                (card_cx + int(6 * SS_SCALE), lock_y + int(20 * SS_SCALE)),
                (card_cx + int(9 * SS_SCALE), lock_y + int(42 * SS_SCALE)),
                (card_cx - int(9 * SS_SCALE), lock_y + int(42 * SS_SCALE))
            ], fill=COLOR_WHITE)

            draw_ctx.text((card_cx, card_cy + int(50 * SS_SCALE)), "SCREEN LOCKED", fill=COLOR_INK, font=self.font_hero, anchor="mm")
            draw_ctx.text((card_cx, card_cy + int(105 * SS_SCALE)), "CLICK!", fill=COLOR_RED, font=self.font_title, anchor="mm")

        elif scene_id == "SCENE_006":
            clock_y = card_cy - int(60 * SS_SCALE)
            cr = int(62 * SS_SCALE)
            draw_ctx.ellipse([card_cx - cr, clock_y - cr, card_cx + cr, clock_y + cr], outline=COLOR_INK, width=int(7 * SS_SCALE))
            for hr in range(12):
                a_rad = math.radians(hr * 30)
                tx1 = card_cx + math.cos(a_rad) * (cr - int(11 * SS_SCALE))
                ty1 = clock_y + math.sin(a_rad) * (cr - int(11 * SS_SCALE))
                tx2 = card_cx + math.cos(a_rad) * (cr - int(2 * SS_SCALE))
                ty2 = clock_y + math.sin(a_rad) * (cr - int(2 * SS_SCALE))
                draw_ctx.line([(tx1, ty1), (tx2, ty2)], fill=COLOR_INK, width=int(3 * SS_SCALE))

            hand_deg = (f * 15.0) % 360 - 90
            hand_rad = math.radians(hand_deg)
            hx = card_cx + math.cos(hand_rad) * (cr - int(16 * SS_SCALE))
            hy = clock_y + math.sin(hand_rad) * (cr - int(16 * SS_SCALE))
            draw_ctx.line([(card_cx, clock_y), (hx, hy)], fill=COLOR_RED, width=int(5 * SS_SCALE))
            draw_ctx.ellipse([card_cx - int(6 * SS_SCALE), clock_y - int(6 * SS_SCALE),
                              card_cx + int(6 * SS_SCALE), clock_y + int(6 * SS_SCALE)], fill=COLOR_INK)

            draw_ctx.text((card_cx, card_cy + int(36 * SS_SCALE)), "5 SECONDS", fill=COLOR_RED, font=self.font_hero, anchor="mm")
            draw_ctx.text((card_cx, card_cy + int(82 * SS_SCALE)), "LATER...", fill=COLOR_RED, font=self.font_title, anchor="mm")
            draw_ctx.text((card_cx, card_cy + int(124 * SS_SCALE)), "TICK... TICK...", fill=COLOR_MUTED, font=self.font_small, anchor="mm")

        else:
            # Universal Card Generator for Scenes 7-42
            lines = [w.strip() for w in narration.split(".") if w.strip()]
            main_line = lines[0].upper() if lines else "REWARD CYCLE"
            if len(main_line) > 24:
                main_line = main_line[:24] + "..."

            sub_line = visual.get("description", "").split(".")[0].upper()
            if len(sub_line) > 30:
                sub_line = sub_line[:30] + "..."

            # Visual Badge Icon in Card
            icon_y = card_cy - int(55 * SS_SCALE)
            if "brain" in action or "diagram" in action:
                # Brain icon
                draw_ctx.ellipse([card_cx - int(50 * SS_SCALE), icon_y - int(35 * SS_SCALE), card_cx + int(50 * SS_SCALE), icon_y + int(35 * SS_SCALE)], fill=(255, 230, 235, 255), outline=COLOR_RED, width=int(4 * SS_SCALE))
                draw_ctx.arc([card_cx - int(25 * SS_SCALE), icon_y - int(25 * SS_SCALE), card_cx + int(25 * SS_SCALE), icon_y + int(25 * SS_SCALE)], start=0, end=180, fill=COLOR_RED, width=int(3 * SS_SCALE))
            elif "lightbulb" in action or "glow" in action:
                draw_lightbulb(draw_ctx, card_cx, icon_y, SS_SCALE)
            elif "clap" in action or "celebrate" in action:
                draw_ctx.text((card_cx, icon_y), "CLAP! CLAP!", fill=COLOR_RED, font=self.font_title, anchor="mm")
            else:
                draw_ctx.ellipse([card_cx - int(38 * SS_SCALE), icon_y - int(38 * SS_SCALE), card_cx + int(38 * SS_SCALE), icon_y + int(38 * SS_SCALE)], fill=(235, 242, 255, 255), outline=COLOR_GLOW_BLUE, width=int(4 * SS_SCALE))
                draw_ctx.text((card_cx, icon_y), "!", fill=COLOR_GLOW_BLUE, font=self.font_hero, anchor="mm")

            draw_ctx.text((card_cx, card_cy + int(40 * SS_SCALE)), main_line, fill=COLOR_INK, font=self.font_title, anchor="mm")
            draw_ctx.text((card_cx, card_cy + int(96 * SS_SCALE)), sub_line, fill=COLOR_MUTED, font=self.font_sub, anchor="mm")

    def render_scene(self, scene: dict, output_path: str, fps: int = DEFAULT_FPS,
                     legacy: bool = False, only_frames=None, frame_callback=None):
        """
        Renders one scene to an MP4 (or, with `only_frames`, hands individual frames to
        `frame_callback(frame_index, PIL.Image)` without writing a video — used for contact sheets).

        legacy=True  : original look of video-001 (hero at x=0.28, hand-written choreography and
                       cards for SCENE_001-006, headline/subline derived from narration).
        legacy=False : fully storyboard-driven — hero at visual.position.x (mirrored when on the right),
                       header from visual.header, card from visual.card, mood from visual.mood.
        The virtual camera (visual.camera) is applied only in non-legacy mode, so video-001 renders exactly as before.
        """
        if output_path:
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        duration_sec = scene.get("actual_duration_sec") or scene.get("estimated_duration_sec") or 2.5
        total_frames = max(1, int(round(duration_sec * fps)))
        scene_id = scene.get("scene_id", "SCENE_001")
        choreo = scene_id if legacy else ""  # hand-written SCENE_001-006 choreography: legacy only
        visual = scene.get("visual", {})
        pose_name = visual.get("stickman_pose", "idle_neutral")
        action = visual.get("action", "")
        props = [str(p) for p in (visual.get("props") or [])]

        hero_x_frac = 0.28
        facing = 1
        if not legacy:
            pos = visual.get("position") or {}
            try:
                hero_x_frac = min(0.85, max(0.15, float(pos.get("x", 0.25))))
            except (TypeError, ValueError):
                hero_x_frac = 0.25
            facing = 1 if hero_x_frac <= 0.5 else -1
        hero = StickmanActor("hero", scale=1.35 * SS_SCALE, facing=facing)

        desk_y = int(SH * 0.77)
        hero_hip_x = int(SW * hero_x_frac)
        hero_base_hip_y = desk_y - int(150 * hero.s)
        focus_xy = (hero_hip_x, hero_base_hip_y - int(190 * hero.s))  # head, for close_up framing

        table_phone_x = hero_hip_x + int(190 * hero.s) * facing
        table_phone_y = desk_y - int(17 * SS_SCALE)

        card_cx = int(SW * (0.70 if facing == 1 else 0.30))
        card_cy = int(SH * 0.44)
        accent = hex_to_rgba(visual.get("accent_color_focus"))

        # Header titles
        header_map = {
            "SCENE_001": ("THE REFLEX", "AUTOMATIC CHECK"),
            "SCENE_002": ("THE EXPECTATION", "CHECKING INBOX"),
            "SCENE_003": ("THE SILENCE", "NO NOTIFICATIONS"),
            "SCENE_004": ("THE REALITY", "ABSOLUTELY NOTHING"),
            "SCENE_005": ("THE RESET", "LOCK AND PUT DOWN"),
            "SCENE_006": ("THE RELAPSE", "FIVE SECONDS LATER"),
        }
        header = visual.get("header") or {}
        if header.get("title"):
            headline, subline = str(header["title"]).upper(), (str(header.get("subtitle", "")).upper() or None)
        elif choreo in header_map:
            headline, subline = header_map[choreo]
        elif legacy:
            words = scene.get("narration_text", "").split()
            headline = " ".join(words[:3]).upper() if words else "WHY WE DO IT"
            subline = "DOPAMINE HABIT LOOP"
        else:
            headline, subline = None, None  # no header unless the storyboard asks for one

        writer = None
        if only_frames is None:
            writer = imageio.get_writer(
                output_path,
                fps=fps,
                codec="libx264",
                pixelformat="yuv420p",
                macro_block_size=None,
            )
        frame_indices = [min(max(0, int(i)), total_frames - 1) for i in only_frames] if only_frames is not None \
            else range(total_frames)

        try:
            for f in frame_indices:
                canvas, d_y = self.create_base_canvas(f=f)
                draw = ImageDraw.Draw(canvas)

                # 1. Top Header with red wavy underline
                if headline:
                    self.draw_top_header(draw, headline, subline)

                # 2. Respiration & Blink Cycles
                breath = math.sin(f * 0.16) * (2.8 * SS_SCALE)
                hero_hip_y = hero_base_hip_y + breath

                blink = math.sin(((f % 92 - 84) / 5.0) * math.pi) if 84 <= (f % 92) <= 89 else 0.0
                talk_amp = max(0.0, math.sin(f * 0.45)) if f < total_frames * 0.75 else 0.0

                # 3. Dynamic Choreography & Physical Interaction per Scene
                impact_prog = 0.0
                has_sweat = False
                has_shock = False

                if choreo == "SCENE_001":
                    lift_prog = min(1.0, max(0.0, (f - 14) / 22.0))
                    lift_eased = 1.0 - math.pow(1.0 - lift_prog, 3)

                    lean_deg = 14.0 * (1.0 - lift_eased) + 3.0 * lift_eased
                    head_tilt = 8.0 * (1.0 - lift_eased) + 3.0 * lift_eased
                    look = (0.75 * (1.0 - lift_eased) + 0.65 * lift_eased,
                            0.55 * (1.0 - lift_eased) + 0.30 * lift_eased)

                    tap_phase = math.sin(min(1.0, max(0.0, (f - 32) / 16.0)) * math.pi)
                    la = 135 - tap_phase * 35
                    lb = 95 - tap_phase * 55
                    ra = 50.0 * (1.0 - lift_eased) + 26.0 * lift_eased
                    rb = 10.0 * (1.0 - lift_eased) + (-36.0) * lift_eased

                    hand_l, hand_r, head_h, feet_h = hero.render(
                        draw, hero_hip_x, hero_hip_y, lean_deg=lean_deg, head_tilt=head_tilt,
                        la=la, lb=lb, ra=ra, rb=rb, mood="eager", look=look,
                        blink=blink, mouth_open=talk_amp, desk_y=d_y
                    )

                    flat_ratio = 1.0 - lift_eased
                    px = table_phone_x * (1.0 - lift_eased) + (hand_r[0] + int(24 * SS_SCALE)) * lift_eased
                    py = table_phone_y * (1.0 - lift_eased) + (hand_r[1] - int(34 * SS_SCALE)) * lift_eased
                    phone_state = "unlocked" if f >= 36 else "off"
                    self.draw_phone(draw, px, py, phone_state, hero.s, flat_ratio=flat_ratio, desk_y=d_y)

                elif choreo == "SCENE_002":
                    hand_l, hand_r, head_h, feet_h = hero.render(
                        draw, hero_hip_x, hero_hip_y, lean_deg=7.0, head_tilt=8.0,
                        la=135, lb=90, ra=28, rb=-35, mood="flat", look=(0.75, 0.50),
                        blink=blink, mouth_open=talk_amp, desk_y=d_y
                    )
                    px = hand_r[0] + int(24 * SS_SCALE)
                    py = hand_r[1] - int(34 * SS_SCALE)
                    self.draw_phone(draw, px, py, "empty", hero.s, flat_ratio=0.0, desk_y=d_y)

                elif choreo == "SCENE_003":
                    has_sweat = True
                    has_shock = (18 <= f <= 34)
                    hand_l, hand_r, head_h, feet_h = hero.render(
                        draw, hero_hip_x, hero_hip_y, lean_deg=2.0, head_tilt=-6.0,
                        la=155, lb=130, ra=38, rb=-20, mood="sad", look=(0.60, -0.20),
                        blink=blink, mouth_open=talk_amp, desk_y=d_y,
                        has_sweat=has_sweat, has_shock=has_shock
                    )
                    px = hand_r[0] + int(24 * SS_SCALE)
                    py = hand_r[1] - int(34 * SS_SCALE)
                    self.draw_phone(draw, px, py, "dim", hero.s, flat_ratio=0.0, desk_y=d_y)

                elif choreo == "SCENE_004":
                    has_sweat = (f % 40 < 25)
                    hand_l, hand_r, head_h, feet_h = hero.render(
                        draw, hero_hip_x, hero_hip_y, lean_deg=0.0, head_tilt=0.0,
                        la=102, lb=92, ra=78, rb=88, mood="deadpan", look=(0.0, 0.0),
                        blink=0.0, mouth_open=0.0, slouch=0.85, desk_y=d_y,
                        has_sweat=has_sweat
                    )
                    px = hand_r[0] + int(14 * SS_SCALE)
                    py = hand_r[1] + int(20 * SS_SCALE)
                    self.draw_phone(draw, px, py, "dim", hero.s, flat_ratio=0.0, desk_y=d_y)

                elif choreo == "SCENE_005":
                    put_prog = min(1.0, max(0.0, (f - 14) / 24.0))
                    put_eased = 1.0 - math.pow(1.0 - put_prog, 3)

                    lean_deg = 3.0 * (1.0 - put_eased) + 14.0 * put_eased
                    head_tilt = 3.0 * (1.0 - put_eased) + 8.0 * put_eased
                    look = (0.70, 0.30) if f < 14 else (0.80, 0.60)

                    ra = 26.0 * (1.0 - put_eased) + 50.0 * put_eased
                    rb = (-36.0) * (1.0 - put_eased) + 10.0 * put_eased
                    la, lb = 130, 90

                    hand_l, hand_r, head_h, feet_h = hero.render(
                        draw, hero_hip_x, hero_hip_y, lean_deg=lean_deg, head_tilt=head_tilt,
                        la=la, lb=lb, ra=ra, rb=rb, mood="neutral", look=look,
                        blink=blink, mouth_open=talk_amp, desk_y=d_y
                    )

                    flat_ratio = put_eased
                    px = (hand_r[0] + int(24 * SS_SCALE)) * (1.0 - put_eased) + table_phone_x * put_eased
                    py = (hand_r[1] - int(34 * SS_SCALE)) * (1.0 - put_eased) + table_phone_y * put_eased
                    self.draw_phone(draw, px, py, "locked", hero.s, flat_ratio=flat_ratio, desk_y=d_y)

                    if 34 <= f <= 46:
                        impact_prog = 1.0 - (f - 34) / 12.0
                        draw_impact_lines(draw, table_phone_x, table_phone_y - int(10 * SS_SCALE), SS_SCALE, impact_prog)

                elif choreo == "SCENE_006":
                    reach_prog = min(1.0, max(0.0, (f - 24) / 36.0))
                    reach_eased = reach_prog * reach_prog

                    lean_deg = 2.0 * (1.0 - reach_eased) + 13.0 * reach_eased
                    head_tilt = (-5.0) * (1.0 - reach_eased) + 7.0 * reach_eased
                    look = (0.65, -0.35) if f < 24 else (0.80, 0.55)

                    ra = 70.0 * (1.0 - reach_eased) + 48.0 * reach_eased
                    rb = 85.0 * (1.0 - reach_eased) + 8.0 * reach_eased
                    la, lb = 135, 95

                    hero.render(
                        draw, hero_hip_x, hero_hip_y, lean_deg=lean_deg, head_tilt=head_tilt,
                        la=la, lb=lb, ra=ra, rb=rb, mood="eager" if reach_eased > 0.5 else "neutral", look=look,
                        blink=blink, mouth_open=talk_amp, desk_y=d_y
                    )
                    self.draw_phone(draw, table_phone_x, table_phone_y, "locked", hero.s, flat_ratio=1.0, desk_y=d_y)

                else:
                    # Generic rig dispatcher: any scene not covered by the legacy choreography
                    rig = POSE_RIGS.get(pose_name, POSE_RIGS["idle_neutral"])
                    la, lb, ra, rb = rig["la"], rig["lb"], rig["ra"], rig["rb"]
                    look = rig["look"]
                    lean_deg = rig["lean"]
                    mood = resolve_mood(visual, rig["mood"], pose_name, legacy)
                    has_sweat = bool(rig.get("sweat"))
                    has_shock = bool(rig.get("shock"))
                    stride = math.sin(f * 0.55) if rig.get("stride") else 0.0

                    hand_l, hand_r, head_h, feet_h = hero.render(
                        draw, hero_hip_x, hero_hip_y, lean_deg=lean_deg, head_tilt=math.sin(f * 0.1) * 2.0,
                        la=la, lb=lb, ra=ra, rb=rb, mood=mood, look=look,
                        blink=blink, mouth_open=talk_amp, desk_y=d_y,
                        has_sweat=has_sweat, has_shock=has_shock, stride=stride
                    )
                    # Phone on the desk: always in legacy mode, otherwise only when a prop asks for it
                    if legacy or any("phone" in p for p in props):
                        self.draw_phone(draw, table_phone_x, table_phone_y, "locked", hero.s, flat_ratio=1.0, desk_y=d_y)

                # 4. Info card: storyboard `visual.card` wins; legacy mode falls back to the old cards
                if visual.get("card"):
                    self.draw_custom_card(canvas, visual["card"], card_cx, card_cy, f, fps, accent=accent)
                elif legacy:
                    self.draw_scene_info_card(draw, scene, f, total_frames)

                # 5. Virtual camera + antialiasing downscale (2x supersampled -> 1080p)
                frame_1080p = apply_camera(canvas, None if legacy else visual.get("camera"), f, total_frames, focus_xy,
                                     card_cx if (visual.get("card") or legacy) else None).convert("RGB")
                if frame_callback is not None:
                    frame_callback(f, frame_1080p)
                if writer is not None:
                    writer.append_data(np.array(frame_1080p))

        finally:
            if writer is not None:
                writer.close()


def scene_duration(scene: dict) -> float:
    return scene.get("actual_duration_sec") or scene.get("estimated_duration_sec") or 2.5


def resolve_legacy(data: dict, legacy=None) -> bool:
    """Legacy mode is automatic for the original demo project (video-001) unless overridden."""
    if legacy is None:
        return data.get("project_id") == "video-001"
    return bool(legacy)


def select_scenes(scenes: list, limit: int = None, preview_seconds: float = None) -> list:
    """First N scenes, or the first scenes that add up to `preview_seconds` (the 'first 20 seconds' gate)."""
    if preview_seconds is not None:
        picked, total = [], 0.0
        for s in scenes:
            picked.append(s)
            total += scene_duration(s)
            if total >= preview_seconds:
                break
        scenes = picked
    if limit is not None:
        scenes = scenes[:limit]
    return scenes


def render_storyboard(storyboard_path: str, video_dir: str, limit: int = None,
                      legacy: bool = None, preview_seconds: float = None):
    """Render storyboard scenes using CrazyMei Solo Character Rig."""
    engine = B5CrazyMeiEngine()
    with open(storyboard_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    legacy = resolve_legacy(data, legacy)
    scenes = select_scenes(data.get("scenes", []), limit, preview_seconds)

    os.makedirs(video_dir, exist_ok=True)
    print(f"[CrazyMei Solo Engine] Rendering {len(scenes)} scenes to {video_dir} (legacy={legacy})...")
    start_all = time.time()

    for idx, scene in enumerate(scenes, 1):
        scene_id = scene["scene_id"]
        out_mp4 = os.path.join(video_dir, f"{scene_id}.mp4")
        t0 = time.time()
        engine.render_scene(scene, out_mp4, legacy=legacy)
        print(f"  [{idx}/{len(scenes)}] Rendered {scene_id}.mp4 ({scene_duration(scene):.2f}s) in {time.time() - t0:.2f}s")

    elapsed_all = time.time() - start_all
    print(f"[CrazyMei Solo Engine] Completed {len(scenes)} scenes in {elapsed_all:.2f} seconds.")
    return scenes


def render_contact_sheet(storyboard_path: str, out_png: str, limit: int = None, legacy: bool = None,
                         preview_seconds: float = None, cols: int = 4, thumb_w: int = 480):
    """
    One PNG with a mid-scene frame of every selected scene (+ scene id / pose / camera label).
    Takes seconds, needs no audio — the fastest way for a human or a vision model to review the look.
    """
    engine = B5CrazyMeiEngine()
    with open(storyboard_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    legacy = resolve_legacy(data, legacy)
    scenes = select_scenes(data.get("scenes", []), limit, preview_seconds)
    if not scenes:
        raise ValueError("No scenes to render a contact sheet for.")

    thumb_h = thumb_w * 9 // 16
    pad, label_h = 8, 22
    rows = (len(scenes) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (thumb_w + pad) + pad, rows * (thumb_h + label_h + pad) + pad), (255, 255, 255))
    d = ImageDraw.Draw(sheet)

    for i, scene in enumerate(scenes):
        total = max(1, int(round(scene_duration(scene) * DEFAULT_FPS)))
        grabbed = {}
        engine.render_scene(scene, None, legacy=legacy, only_frames=[int(total * 0.6)],
                            frame_callback=lambda fi, im, g=grabbed: g.setdefault("im", im))
        thumb = grabbed["im"].resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = pad + (i % cols) * (thumb_w + pad)
        y = pad + (i // cols) * (thumb_h + label_h + pad)
        sheet.paste(thumb, (x, y + label_h))
        vis = scene.get("visual", {})
        cam = vis.get("camera", {})
        label = f"{scene['scene_id']} | {vis.get('stickman_pose', '?')} | {cam.get('framing', '?')}/{cam.get('movement', '?')}"
        d.text((x, y + 5), label, fill=(0, 0, 0))

    os.makedirs(os.path.dirname(os.path.abspath(out_png)), exist_ok=True)
    sheet.save(out_png)
    print(f"[CrazyMei Solo Engine] Contact sheet ({len(scenes)} scenes) -> {out_png}")
    return out_png


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CrazyMei Solo Stickman Renderer")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of scenes to render")
    parser.add_argument("--preview-seconds", type=float, default=None,
                        help="Render only the first scenes adding up to N seconds (e.g. 20 for the approval gate)")
    parser.add_argument("--contact-sheet", type=str, default=None,
                        help="Write a one-image contact sheet to this PNG path instead of rendering videos")
    parser.add_argument("--legacy", action=argparse.BooleanOptionalAction, default=None,
                        help="Force/disable legacy video-001 choreography (default: auto by project_id)")
    parser.add_argument("--storyboard", type=str, default=None, help="Storyboard JSON path")
    parser.add_argument("--output-dir", type=str, default=None, help="Video scenes output directory")
    args = parser.parse_args()

    sb_path = args.storyboard or os.path.join(BASE_DIR, "projects", "video-001", "03_storyboard.json")
    v_dir = args.output_dir or os.path.join(BASE_DIR, "projects", "video-001", "video_scenes")

    if args.contact_sheet:
        render_contact_sheet(sb_path, args.contact_sheet, limit=args.limit, legacy=args.legacy,
                             preview_seconds=args.preview_seconds)
    else:
        render_storyboard(sb_path, v_dir, limit=args.limit, legacy=args.legacy,
                          preview_seconds=args.preview_seconds)
