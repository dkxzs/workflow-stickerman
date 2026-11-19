# -*- coding: utf-8 -*-
"""
STICKMAN RENDERER — B5 CRAZYMEI VECTOR ENGINE + STAGE KINEMATICS
Authentic vector puppet animation with full body kinematics & physical prop interaction:
- Dynamic Spine & Body Lean (torso leans forward, straightens, or slouches with weight)
- Physical Prop Interaction (picks up phone from desk -> holds to inspect -> locks & puts down -> reaches back)
- Modular StickmanActor class (multi-actor ready, independent anchors, facing, and joint poses)
- Living Facial Rig (blinking, eye gaze tracking, dynamic eyebrows & mouth expressions)
- Rich Visual Props & Kinetic Typography in strict spatial safe zones (no overlapping, no clipping)
- Warm textured paper background & desk horizon
"""

import argparse
import json
import math
import os
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

# Canvas constants
CANVAS_WIDTH = 1920
CANVAS_HEIGHT = 1080
DEFAULT_FPS = 30
SS_SCALE = 2  # 2x supersampling for razor-sharp antialiasing
SW = CANVAS_WIDTH * SS_SCALE
SH = CANVAS_HEIGHT * SS_SCALE

# Palette
COLOR_INK = (30, 28, 26, 255)
COLOR_WHITE = (251, 250, 248, 255)
COLOR_RED = (215, 55, 44, 255)
COLOR_PAPER_BASE = (244, 240, 234, 255)
COLOR_DESK = (234, 230, 222, 255)
COLOR_MUTED = (138, 133, 126, 255)
COLOR_CARD_BG = (255, 255, 255, 245)
COLOR_CARD_BORDER = (210, 205, 198, 255)
COLOR_GLOW_BLUE = (66, 133, 244, 255)
COLOR_GOLD = (244, 180, 0, 255)


class StickmanActor:
    """
    Modular Stickman Actor with Dynamic Spine Kinematics & Physical Interaction.
    Ready for single or multi-actor scenes.
    """
    def __init__(self, actor_id: str = "hero", scale: float = 1.35 * SS_SCALE, facing: int = 1):
        self.actor_id = actor_id
        self.s = scale
        self.facing = facing  # 1: facing right, -1: facing left
        self.head_r = int(60 * self.s)
        self.head_stroke = int(11 * self.s)
        self.body_stroke = int(18 * self.s)
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
        hs = self.s * 0.72
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
               blink=0.0, mouth_open=0.0, slouch=0.0):
        """
        Renders stickman with dynamic spine lean, slouch, and articulated limbs.
        Returns: (hand_l, hand_r, (head_x, head_y))
        """
        # Spine kinematics with lean and slouch
        lean_rad = math.radians(lean_deg * self.facing)
        spine_len = (130 - slouch * 25) * self.s

        neck_x = hip_x + math.sin(lean_rad) * spine_len
        neck_y = hip_y - math.cos(lean_rad) * spine_len

        shoulder_x = hip_x + math.sin(lean_rad) * (spine_len * 0.88)
        shoulder_y = hip_y - math.cos(lean_rad) * (spine_len * 0.88)

        total_head_angle = lean_deg * self.facing + head_tilt * self.facing
        head_rad = math.radians(total_head_angle)
        head_dist = (65 - slouch * 10) * self.s
        hx = neck_x + math.sin(head_rad) * head_dist
        hy = neck_y - math.cos(head_rad) * head_dist

        # 1. Torso Spine
        draw_ctx.line([(hip_x, hip_y), (neck_x, neck_y)], fill=COLOR_INK, width=self.body_stroke)

        # 2. Legs with dynamic forward brace
        leg_l_angle = 115 - lean_deg * 0.4
        leg_r_angle = 65 + lean_deg * 0.4
        self.draw_limb(draw_ctx, (hip_x, hip_y), leg_l_angle, 95, 80, 80, self.body_stroke)
        self.draw_limb(draw_ctx, (hip_x, hip_y), leg_r_angle, 85, 80, 80, self.body_stroke)

        # 3. Arms
        elbow_l, hand_l = self.draw_limb(draw_ctx, (shoulder_x, shoulder_y), la, lb, 86, 84, self.body_stroke)
        elbow_r, hand_r = self.draw_limb(draw_ctx, (shoulder_x, shoulder_y), ra, rb, 86, 84, self.body_stroke)

        # 4. Hands
        self.draw_glove_hand(draw_ctx, hand_l[0], hand_l[1], r_deg=lb - 90)
        self.draw_glove_hand(draw_ctx, hand_r[0], hand_r[1], r_deg=rb - 45)

        # 5. Head
        draw_ctx.ellipse(
            [hx - self.head_r, hy - self.head_r, hx + self.head_r, hy + self.head_r],
            fill=COLOR_WHITE, outline=COLOR_INK, width=self.head_stroke
        )

        # 6. Eyes & Blinking
        ey_scale = max(0.12, 1.0 - 0.88 * blink)
        look_dx = look[0] * (16 * self.s) * self.facing
        look_dy = look[1] * (8 * self.s)
        eye_y = hy - int(5 * self.s)

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
            draw_ctx.ellipse([hx - int(15 * self.s), hy + int(26 * self.s) - mo_h//2,
                              hx + int(15 * self.s), hy + int(26 * self.s) + mo_h//2],
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

        return hand_l, hand_r, (hx, hy)


class B5CrazyMeiEngine:
    def __init__(self):
        print("[B5 CrazyMei Engine] Initializing vector puppet & paper renderer...")
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

        if head_font_path and os.path.exists(head_font_path):
            self.font_hero = ImageFont.truetype(head_font_path, int(64 * SS_SCALE))
            self.font_giant = ImageFont.truetype(head_font_path, int(96 * SS_SCALE))
            self.font_title = ImageFont.truetype(head_font_path, int(44 * SS_SCALE))
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

    def create_base_canvas(self):
        """Creates warm textured paper stage with desk horizon."""
        base = Image.new("RGBA", (SW, SH), COLOR_PAPER_BASE)
        if self.paper_texture:
            base = Image.blend(base, self.paper_texture, 0.32)

        draw = ImageDraw.Draw(base)
        desk_y = int(SH * 0.77)
        draw.rectangle([0, desk_y, SW, SH], fill=COLOR_DESK)
        draw.line([0, desk_y, SW, desk_y], fill=COLOR_MUTED, width=int(5 * SS_SCALE))
        return base, desk_y

    def draw_phone(self, draw_ctx, x, y, state: str, s: float):
        """Draws CrazyMei-style smartphone prop with illuminated screen."""
        pw, ph = int(90 * SS_SCALE), int(160 * SS_SCALE)
        draw_ctx.rounded_rectangle(
            [x - pw//2, y - ph//2, x + pw//2, y + ph//2],
            radius=int(18 * SS_SCALE),
            fill=COLOR_INK
        )

        screen_fill = (248, 250, 252, 255) if state in ("unlocked", "empty") else (38, 36, 34, 255) if state == "locked" else (225, 228, 232, 255)
        draw_ctx.rounded_rectangle(
            [x - pw//2 + int(6 * SS_SCALE), y - ph//2 + int(8 * SS_SCALE),
             x + pw//2 - int(6 * SS_SCALE), y + ph//2 - int(8 * SS_SCALE)],
            radius=int(12 * SS_SCALE),
            fill=screen_fill
        )

        if state == "unlocked":
            # Glowing notification pill
            draw_ctx.rounded_rectangle(
                [x - int(32 * SS_SCALE), y - int(30 * SS_SCALE), x + int(32 * SS_SCALE), y - int(8 * SS_SCALE)],
                radius=int(8 * SS_SCALE),
                fill=(235, 242, 255, 255),
                outline=COLOR_GLOW_BLUE,
                width=int(2 * SS_SCALE)
            )
            draw_ctx.ellipse(
                [x + int(16 * SS_SCALE), y - int(52 * SS_SCALE), x + int(30 * SS_SCALE), y - int(38 * SS_SCALE)],
                fill=COLOR_RED
            )
        elif state == "empty":
            for line_offset in (-18, 0, 18):
                draw_ctx.line(
                    [(x - int(26 * SS_SCALE), y + int(line_offset * SS_SCALE)),
                     (x + int(26 * SS_SCALE), y + int(line_offset * SS_SCALE))],
                    fill=(205, 210, 218, 255),
                    width=int(4 * SS_SCALE)
                )

    def draw_kinetic_scene_props(self, draw_ctx, scene_id: str, f: int, total_frames: int):
        """Renders visual props & kinetic typography in right safe zone."""
        rx = int(SW * 0.70)

        if scene_id == "SCENE_001":
            # Pop in after phone is lifted and unlocked (f >= 24)
            pop = min(1.0, max(0.0, (f - 22) / 14.0))
            if pop > 0:
                ty = int(SH * 0.32)
                draw_ctx.text((rx, ty), "YOU UNLOCK", fill=COLOR_INK, font=self.font_hero, anchor="mm")
                draw_ctx.text((rx, ty + int(75 * SS_SCALE)), "YOUR PHONE", fill=COLOR_RED, font=self.font_hero, anchor="mm")

                ul_y = ty + int(125 * SS_SCALE)
                draw_ctx.line([
                    (rx - int(240 * SS_SCALE * pop), ul_y),
                    (rx - int(60 * SS_SCALE), ul_y - int(6 * SS_SCALE)),
                    (rx + int(80 * SS_SCALE), ul_y + int(5 * SS_SCALE)),
                    (rx + int(240 * SS_SCALE * pop), ul_y - int(3 * SS_SCALE))
                ], fill=COLOR_RED, width=int(7 * SS_SCALE), joint="curve")

                by = ty + int(210 * SS_SCALE)
                bw, bh = int(320 * SS_SCALE), int(80 * SS_SCALE)
                draw_ctx.rounded_rectangle(
                    [rx - bw//2, by - bh//2, rx + bw//2, by + bh//2],
                    radius=int(20 * SS_SCALE),
                    fill=COLOR_CARD_BG,
                    outline=COLOR_CARD_BORDER,
                    width=int(3 * SS_SCALE)
                )
                draw_ctx.text((rx, by), "PHONE UNLOCKED", fill=COLOR_GLOW_BLUE, font=self.font_badge, anchor="mm")

        elif scene_id == "SCENE_002":
            card_y = int(SH * 0.42)
            cw, ch = int(440 * SS_SCALE), int(360 * SS_SCALE)
            draw_ctx.rounded_rectangle(
                [rx - cw//2, card_y - ch//2, rx + cw//2, card_y + ch//2],
                radius=int(26 * SS_SCALE),
                fill=COLOR_CARD_BG,
                outline=COLOR_CARD_BORDER,
                width=int(4 * SS_SCALE)
            )

            icon_y = card_y - int(75 * SS_SCALE)
            iw, ih = int(120 * SS_SCALE), int(70 * SS_SCALE)
            draw_ctx.rectangle(
                [rx - iw//2, icon_y - ih//2, rx + iw//2, icon_y + ih//2],
                outline=COLOR_MUTED, width=int(5 * SS_SCALE)
            )
            draw_ctx.polygon([
                (rx - int(28 * SS_SCALE), icon_y - ih//2),
                (rx, icon_y - ih//2 + int(24 * SS_SCALE)),
                (rx + int(28 * SS_SCALE), icon_y - ih//2)
            ], outline=COLOR_MUTED)

            badge_r = int(28 * SS_SCALE)
            bx, by = rx + iw//2, icon_y - ih//2
            draw_ctx.ellipse([bx - badge_r, by - badge_r, bx + badge_r, by + badge_r], fill=COLOR_RED)
            draw_ctx.text((bx, by), "0", fill=COLOR_WHITE, font=self.font_badge, anchor="mm")

            draw_ctx.text((rx, card_y + int(40 * SS_SCALE)), "0 MESSAGES", fill=COLOR_RED, font=self.font_title, anchor="mm")
            draw_ctx.text((rx, card_y + int(95 * SS_SCALE)), "INBOX EMPTY", fill=COLOR_MUTED, font=self.font_sub, anchor="mm")

        elif scene_id == "SCENE_003":
            card_y = int(SH * 0.42)
            cw, ch = int(450 * SS_SCALE), int(360 * SS_SCALE)
            draw_ctx.rounded_rectangle(
                [rx - cw//2, card_y - ch//2, rx + cw//2, card_y + ch//2],
                radius=int(26 * SS_SCALE),
                fill=COLOR_CARD_BG,
                outline=COLOR_CARD_BORDER,
                width=int(4 * SS_SCALE)
            )

            bell_y = card_y - int(75 * SS_SCALE)
            bw = int(70 * SS_SCALE)
            draw_ctx.arc([rx - bw, bell_y - int(55 * SS_SCALE), rx + bw, bell_y + int(35 * SS_SCALE)],
                         start=180, end=360, fill=COLOR_INK, width=int(6 * SS_SCALE))
            draw_ctx.line([(rx - bw, bell_y + int(35 * SS_SCALE)), (rx + bw, bell_y + int(35 * SS_SCALE))],
                          fill=COLOR_INK, width=int(6 * SS_SCALE))
            draw_ctx.ellipse([rx - int(14 * SS_SCALE), bell_y + int(35 * SS_SCALE),
                              rx + int(14 * SS_SCALE), bell_y + int(52 * SS_SCALE)], fill=COLOR_INK)

            draw_ctx.line([
                (rx - int(75 * SS_SCALE), bell_y - int(65 * SS_SCALE)),
                (rx + int(75 * SS_SCALE), bell_y + int(55 * SS_SCALE))
            ], fill=COLOR_RED, width=int(9 * SS_SCALE))

            draw_ctx.text((rx, card_y + int(40 * SS_SCALE)), "NO NOTIFICATIONS", fill=COLOR_RED, font=self.font_title, anchor="mm")
            draw_ctx.text((rx, card_y + int(95 * SS_SCALE)), "ALL QUIET", fill=COLOR_MUTED, font=self.font_sub, anchor="mm")

        elif scene_id == "SCENE_004":
            card_rx = int(SW * 0.64)
            card_y = int(SH * 0.45)
            cw, ch = int(450 * SS_SCALE), int(260 * SS_SCALE)

            draw_ctx.rounded_rectangle(
                [card_rx - cw//2, card_y - ch//2, card_rx + cw//2, card_y + ch//2],
                radius=int(28 * SS_SCALE),
                fill=(248, 246, 242, 255),
                outline=COLOR_INK,
                width=int(6 * SS_SCALE)
            )

            draw_ctx.text((card_rx, card_y - int(25 * SS_SCALE)), "NOTHING.", fill=COLOR_INK, font=self.font_hero, anchor="mm")
            draw_ctx.text((card_rx, card_y + int(55 * SS_SCALE)), "ABSOLUTELY NOTHING", fill=COLOR_RED, font=self.font_sub, anchor="mm")

            draw_ctx.line([(card_rx - cw//2 - int(25*SS_SCALE), card_y - int(50*SS_SCALE)),
                           (card_rx - cw//2 - int(60*SS_SCALE), card_y - int(70*SS_SCALE))],
                          fill=COLOR_RED, width=int(6*SS_SCALE))
            draw_ctx.line([(card_rx + cw//2 + int(25*SS_SCALE), card_y - int(50*SS_SCALE)),
                           (card_rx + cw//2 + int(60*SS_SCALE), card_y - int(70*SS_SCALE))],
                          fill=COLOR_RED, width=int(6*SS_SCALE))

        elif scene_id == "SCENE_005":
            card_y = int(SH * 0.42)
            cw, ch = int(440 * SS_SCALE), int(360 * SS_SCALE)
            draw_ctx.rounded_rectangle(
                [rx - cw//2, card_y - ch//2, rx + cw//2, card_y + ch//2],
                radius=int(26 * SS_SCALE),
                fill=COLOR_CARD_BG,
                outline=COLOR_CARD_BORDER,
                width=int(4 * SS_SCALE)
            )

            lock_y = card_y - int(65 * SS_SCALE)
            lw, lh = int(90 * SS_SCALE), int(75 * SS_SCALE)
            draw_ctx.arc([rx - int(30 * SS_SCALE), lock_y - int(85 * SS_SCALE),
                          rx + int(30 * SS_SCALE), lock_y - int(15 * SS_SCALE)],
                         start=180, end=360, fill=COLOR_INK, width=int(10 * SS_SCALE))
            draw_ctx.rounded_rectangle(
                [rx - lw//2, lock_y - int(20 * SS_SCALE), rx + lw//2, lock_y + lh],
                radius=int(14 * SS_SCALE),
                fill=COLOR_INK
            )
            draw_ctx.ellipse([rx - int(8*SS_SCALE), lock_y + int(10*SS_SCALE),
                              rx + int(8*SS_SCALE), lock_y + int(26*SS_SCALE)], fill=COLOR_WHITE)

            draw_ctx.text((rx, card_y + int(45 * SS_SCALE)), "SCREEN LOCKED", fill=COLOR_INK, font=self.font_title, anchor="mm")
            draw_ctx.text((rx, card_y + int(100 * SS_SCALE)), "CLICK!", fill=COLOR_RED, font=self.font_sub, anchor="mm")

        elif scene_id == "SCENE_006":
            card_y = int(SH * 0.40)
            cw, ch = int(500 * SS_SCALE), int(380 * SS_SCALE)
            draw_ctx.rounded_rectangle(
                [rx - cw//2, card_y - ch//2, rx + cw//2, card_y + ch//2],
                radius=int(26 * SS_SCALE),
                fill=COLOR_CARD_BG,
                outline=COLOR_CARD_BORDER,
                width=int(4 * SS_SCALE)
            )

            clock_y = card_y - int(75 * SS_SCALE)
            cr = int(68 * SS_SCALE)
            draw_ctx.ellipse([rx - cr, clock_y - cr, rx + cr, clock_y + cr], outline=COLOR_INK, width=int(7 * SS_SCALE))
            for hr in range(12):
                a_rad = math.radians(hr * 30)
                tx1 = rx + math.cos(a_rad) * (cr - int(12 * SS_SCALE))
                ty1 = clock_y + math.sin(a_rad) * (cr - int(12 * SS_SCALE))
                tx2 = rx + math.cos(a_rad) * (cr - int(2 * SS_SCALE))
                ty2 = clock_y + math.sin(a_rad) * (cr - int(2 * SS_SCALE))
                draw_ctx.line([(tx1, ty1), (tx2, ty2)], fill=COLOR_INK, width=int(3 * SS_SCALE))

            hand_deg = (f * 14.0) % 360 - 90
            hand_rad = math.radians(hand_deg)
            hx = rx + math.cos(hand_rad) * (cr - int(16 * SS_SCALE))
            hy = clock_y + math.sin(hand_rad) * (cr - int(16 * SS_SCALE))
            draw_ctx.line([(rx, clock_y), (hx, hy)], fill=COLOR_RED, width=int(4 * SS_SCALE))
            draw_ctx.ellipse([rx - int(6*SS_SCALE), clock_y - int(6*SS_SCALE),
                              rx + int(6*SS_SCALE), clock_y + int(6*SS_SCALE)], fill=COLOR_INK)

            draw_ctx.text((rx, card_y + int(32 * SS_SCALE)), "5 SECONDS", fill=COLOR_RED, font=self.font_title, anchor="mm")
            draw_ctx.text((rx, card_y + int(78 * SS_SCALE)), "LATER...", fill=COLOR_RED, font=self.font_title, anchor="mm")
            draw_ctx.text((rx, card_y + int(122 * SS_SCALE)), "TICK... TICK...", fill=COLOR_MUTED, font=self.font_sub, anchor="mm")

    def apply_virtual_camera(self, frame_img: Image.Image, scene_id: str, f: int, total_frames: int):
        """Dynamic camera framing and smooth zooms per scene."""
        w, h = CANVAS_WIDTH, CANVAS_HEIGHT

        if scene_id == "SCENE_001":
            scale = 1.0
            cx, cy = w // 2, h // 2
        elif scene_id == "SCENE_002":
            prog = f / max(1, total_frames - 1)
            scale = 1.0 + prog * 0.08
            cx, cy = int(w * 0.48), int(h * 0.52)
        elif scene_id == "SCENE_003":
            scale = 1.05
            cx, cy = int(w * 0.50), int(h * 0.52)
        elif scene_id == "SCENE_004":
            scale = 1.14
            cx, cy = int(w * 0.44), int(h * 0.50)
        elif scene_id == "SCENE_005":
            scale = 1.10
            cx, cy = int(w * 0.46), int(h * 0.52)
        elif scene_id == "SCENE_006":
            scale = 1.02
            cx, cy = w // 2, h // 2
        else:
            scale = 1.0
            cx, cy = w // 2, h // 2

        if scale != 1.0:
            cw, ch = int(w / scale), int(h / scale)
            x1 = max(0, min(w - cw, cx - cw // 2))
            y1 = max(0, min(h - ch, cy - ch // 2))
            return frame_img.crop((x1, y1, x1 + cw, y1 + ch)).resize((w, h), Image.Resampling.LANCZOS)
        return frame_img

    def render_scene(self, scene: dict, output_path: str, fps: int = DEFAULT_FPS):
        """Renders an entire scene with Stage Kinematics & Physical Prop Interaction."""
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        duration_sec = scene.get("actual_duration_sec") or scene.get("estimated_duration_sec") or 2.5
        total_frames = max(1, int(round(duration_sec * fps)))
        scene_id = scene.get("scene_id", "SCENE_001")

        actor = StickmanActor("hero", scale=1.35 * SS_SCALE, facing=1)

        # Stage Anchors
        hip_x = int(SW * 0.28)
        desk_y = int(SH * 0.77)
        base_hip_y = desk_y - int(150 * actor.s)

        # Phone position on desk surface (rest position)
        table_phone_x = hip_x + int(195 * actor.s)
        table_phone_y = desk_y - int(80 * SS_SCALE)

        writer = imageio.get_writer(
            output_path,
            fps=fps,
            codec="libx264",
            pixelformat="yuv420p",
            macro_block_size=None,
        )

        try:
            for f in range(total_frames):
                # 1. Base paper canvas with desk horizon
                canvas, _ = self.create_base_canvas()
                draw = ImageDraw.Draw(canvas)

                # 2. Respiration & Blink
                breath = math.sin(f * 0.16) * (2.8 * SS_SCALE)
                cur_hip_y = base_hip_y + breath

                blink_cycle = f % 96
                if 88 <= blink_cycle <= 93:
                    blink = math.sin(((blink_cycle - 88) / 5.0) * math.pi)
                else:
                    blink = 0.0

                talk_amp = math.sin(f * 0.45) if f < total_frames * 0.70 else 0.0

                # 3. Dynamic Choreography & Physical Interaction per Scene
                if scene_id == "SCENE_001":
                    # PHYSICAL PICK-UP:
                    # f = 0..16: Leaning forward over desk, hand reaches down to phone
                    # f = 16..36: Grasps phone, lifts it up to chest level as body straightens
                    # f = 36..end: Left hand taps screen, unlock glow radiates!
                    lift_prog = min(1.0, max(0.0, (f - 14) / 22.0))
                    # Ease out lift
                    lift_eased = 1.0 - math.pow(1.0 - lift_prog, 3)

                    lean_deg = 14.0 * (1.0 - lift_eased) + 4.0 * lift_eased
                    head_tilt = 8.0 * (1.0 - lift_eased) + 4.0 * lift_eased
                    look = (0.85 * (1.0 - lift_eased) + 0.75 * lift_eased,
                            0.60 * (1.0 - lift_eased) + 0.35 * lift_eased)
                    mood = "eager"

                    # Left arm: rest then tap screen
                    tap_phase = math.sin(min(1.0, max(0.0, (f - 32) / 16.0)) * math.pi)
                    la = 135 - tap_phase * 40
                    lb = 95 - tap_phase * 60

                    # Right arm: reaching down to table -> lifting up to chest
                    ra = 50.0 * (1.0 - lift_eased) + 28.0 * lift_eased
                    rb = 10.0 * (1.0 - lift_eased) + (-38.0) * lift_eased

                    hand_l, hand_r, head = actor.render(
                        draw, hip_x, cur_hip_y, lean_deg=lean_deg, head_tilt=head_tilt,
                        la=la, lb=lb, ra=ra, rb=rb, mood=mood, look=look,
                        blink=blink, mouth_open=talk_amp, slouch=0.0
                    )

                    # Phone follows hand smoothly
                    phone_lift_x = table_phone_x * (1.0 - lift_eased) + (hand_r[0] + int(26 * SS_SCALE)) * lift_eased
                    phone_lift_y = table_phone_y * (1.0 - lift_eased) + (hand_r[1] - int(36 * SS_SCALE)) * lift_eased
                    phone_state = "unlocked" if f >= 36 else "off"
                    self.draw_phone(draw, phone_lift_x, phone_lift_y, phone_state, actor.s)

                elif scene_id == "SCENE_002":
                    # INSPECTING EMPTY INBOX:
                    # Torso leaned forward slightly, head tilted inspecting screen closely
                    lean_deg = 8.0
                    head_tilt = 9.0 + math.sin(f * 0.08) * 1.0
                    look = (0.80, 0.55)
                    mood = "flat"
                    la, lb = 135, 90
                    ra, rb = 28, -35

                    hand_l, hand_r, head = actor.render(
                        draw, hip_x, cur_hip_y, lean_deg=lean_deg, head_tilt=head_tilt,
                        la=la, lb=lb, ra=ra, rb=rb, mood=mood, look=look,
                        blink=blink, mouth_open=talk_amp, slouch=0.0
                    )
                    px = hand_r[0] + int(26 * SS_SCALE)
                    py = hand_r[1] - int(36 * SS_SCALE)
                    self.draw_phone(draw, px, py, "empty", actor.s)

                elif scene_id == "SCENE_003":
                    # EXASPERATED SHRUG:
                    # Torso shifts back, head tilts sideways, left hand shrugs outward
                    lean_deg = 2.0
                    head_tilt = -7.0 + math.sin(f * 0.12) * 1.2
                    look = (0.60, -0.20)
                    mood = "sad"
                    la, lb = 155, 130  # Shrug outward
                    ra, rb = 38, -20   # Drops phone slightly

                    hand_l, hand_r, head = actor.render(
                        draw, hip_x, cur_hip_y, lean_deg=lean_deg, head_tilt=head_tilt,
                        la=la, lb=lb, ra=ra, rb=rb, mood=mood, look=look,
                        blink=blink, mouth_open=talk_amp, slouch=0.0
                    )
                    px = hand_r[0] + int(26 * SS_SCALE)
                    py = hand_r[1] - int(36 * SS_SCALE)
                    self.draw_phone(draw, px, py, "dim", actor.s)

                elif scene_id == "SCENE_004":
                    # COMEDIC DEADPAN SLOUCH:
                    # Spine compresses, shoulders drop, arms hang limp, deadpan stare into camera
                    slouch = 0.85
                    hand_l, hand_r, head = actor.render(
                        draw, hip_x, cur_hip_y, lean_deg=0.0, head_tilt=0.0,
                        la=102, lb=92, ra=78, rb=88, mood="deadpan", look=(0.0, 0.0),
                        blink=0.0, mouth_open=0.0, slouch=slouch
                    )
                    # Phone rests lowered in hand near knee
                    px = hand_r[0] + int(15 * SS_SCALE)
                    py = hand_r[1] + int(20 * SS_SCALE)
                    self.draw_phone(draw, px, py, "dim", actor.s)

                elif scene_id == "SCENE_005":
                    # LOCK & PUT DOWN ON TABLE:
                    # f = 0..18: Clicks side button (screen snaps black)
                    # f = 18..44: Leans forward and places phone down onto table
                    # f = 44..end: Hand releases and retracts slightly
                    put_prog = min(1.0, max(0.0, (f - 18) / 25.0))
                    put_eased = 1.0 - math.pow(1.0 - put_prog, 3)

                    lean_deg = 4.0 * (1.0 - put_eased) + 14.0 * put_eased
                    head_tilt = 4.0 * (1.0 - put_eased) + 9.0 * put_eased
                    look = (0.75, 0.30) if f < 18 else (0.85, 0.60)
                    mood = "neutral"

                    ra = 28.0 * (1.0 - put_eased) + 50.0 * put_eased
                    rb = (-36.0) * (1.0 - put_eased) + 8.0 * put_eased
                    la, lb = 130, 90

                    hand_l, hand_r, head = actor.render(
                        draw, hip_x, cur_hip_y, lean_deg=lean_deg, head_tilt=head_tilt,
                        la=la, lb=lb, ra=ra, rb=rb, mood=mood, look=look,
                        blink=blink, mouth_open=talk_amp, slouch=0.0
                    )

                    phone_put_x = (hand_r[0] + int(26 * SS_SCALE)) * (1.0 - put_eased) + table_phone_x * put_eased
                    phone_put_y = (hand_r[1] - int(36 * SS_SCALE)) * (1.0 - put_eased) + table_phone_y * put_eased
                    self.draw_phone(draw, phone_put_x, phone_put_y, "locked", actor.s)

                elif scene_id == "SCENE_006":
                    # FIVE SECONDS LATER - HESITANT REACH:
                    # Phone already rests on table
                    # f = 0..26: Looking up at clock, standing upright
                    # f = 26..44: Head turns down to phone
                    # f = 44..end: Torso involuntarily leans forward, arm creeps across table reaching for phone!
                    reach_prog = min(1.0, max(0.0, (f - 26) / 38.0))
                    reach_eased = reach_prog * reach_prog  # Accelerating creep

                    lean_deg = 2.0 * (1.0 - reach_eased) + 14.0 * reach_eased
                    head_tilt = (-5.0) * (1.0 - reach_eased) + 8.0 * reach_eased
                    look = ((0.70, -0.40) if f < 26 else
                            (0.85, 0.55))
                    mood = "eager" if reach_eased > 0.6 else "neutral"

                    # Arm unfolds and creeps across desk toward phone
                    ra = 70.0 * (1.0 - reach_eased) + 48.0 * reach_eased
                    rb = 85.0 * (1.0 - reach_eased) + 8.0 * reach_eased
                    la, lb = 135, 95

                    hand_l, hand_r, head = actor.render(
                        draw, hip_x, cur_hip_y, lean_deg=lean_deg, head_tilt=head_tilt,
                        la=la, lb=lb, ra=ra, rb=rb, mood=mood, look=look,
                        blink=blink, mouth_open=talk_amp, slouch=0.0
                    )
                    # Phone rests firmly on table
                    self.draw_phone(draw, table_phone_x, table_phone_y, "locked", actor.s)

                # 4. Render rich visual props & kinetic typography
                self.draw_kinetic_scene_props(draw, scene_id, f, total_frames)

                # 5. Antialiasing downscale & Virtual Camera
                frame_1080p = canvas.resize((CANVAS_WIDTH, CANVAS_HEIGHT), Image.Resampling.LANCZOS)
                final_frame = self.apply_virtual_camera(frame_1080p, scene_id, f, total_frames)

                writer.append_data(np.array(final_frame.convert("RGB")))

        finally:
            writer.close()


def render_storyboard(storyboard_path: str, video_dir: str, limit: int = None):
    """Render storyboard scenes using the B5 CrazyMei Engine with Stage Kinematics."""
    engine = B5CrazyMeiEngine()
    with open(storyboard_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    scenes = data.get("scenes", [])
    if limit is not None:
        scenes = scenes[:limit]

    os.makedirs(video_dir, exist_ok=True)
    print(f"[B5 CrazyMei Engine] Rendering {len(scenes)} scenes to {video_dir}...")
    start_all = time.time()

    for idx, scene in enumerate(scenes, 1):
        scene_id = scene["scene_id"]
        out_mp4 = os.path.join(video_dir, f"{scene_id}.mp4")
        t0 = time.time()
        engine.render_scene(scene, out_mp4)
        dur = scene.get("actual_duration_sec") or scene.get("estimated_duration_sec") or 0.0
        print(f"  [{idx}/{len(scenes)}] Rendered {scene_id}.mp4 ({dur:.2f}s) in {time.time() - t0:.2f}s")

    elapsed_all = time.time() - start_all
    print(f"[B5 CrazyMei Engine] Completed {len(scenes)} scenes in {elapsed_all:.2f} seconds.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="B5 CrazyMei Stickman Renderer")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of scenes to render")
    parser.add_argument("--storyboard", type=str, default=None, help="Storyboard JSON path")
    parser.add_argument("--output-dir", type=str, default=None, help="Video scenes output directory")
    args = parser.parse_args()

    sb_path = args.storyboard or os.path.join(BASE_DIR, "projects", "video-001", "03_storyboard.json")
    v_dir = args.output_dir or os.path.join(BASE_DIR, "projects", "video-001", "video_scenes")

    render_storyboard(sb_path, v_dir, limit=args.limit)
