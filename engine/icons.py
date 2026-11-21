# -*- coding: utf-8 -*-
"""
ICON LIBRARY — flat vector icons drawn with Pillow for the info card.

Every icon is drawn around the point (cx, cy) and fits in roughly a 110x110
box when s == 1 (s is the pixel scale, i.e. SS_SCALE in the renderer).
The names here must match engine/vocab.py :: ICONS (a test enforces this).
"""

import math

from PIL import ImageFont

INK = (30, 28, 26, 255)
WHITE = (251, 250, 248, 255)
RED = (215, 55, 44, 255)
GOLD = (244, 180, 0, 255)
BLUE = (66, 133, 244, 255)
TEAL = (42, 157, 143, 255)
MUTED = (138, 133, 126, 255)
PINK = (255, 230, 235, 255)
SCREEN = (248, 250, 252, 255)


def _w(s, v):
    return max(1, int(round(v * s)))


def _text_font(font):
    return font if font is not None else ImageFont.load_default()


def lightbulb(d, cx, cy, s, t=0.0, font=None):
    r = 32 * s
    by = cy - 10 * s
    d.ellipse([cx - r, by - r, cx + r, by + r], fill=GOLD, outline=INK, width=_w(s, 4))
    d.rectangle([cx - 13 * s, cy + 20 * s, cx + 13 * s, cy + 40 * s], fill=MUTED, outline=INK, width=_w(s, 3))
    for ang in (-150, -120, -90, -60, -30):
        a = math.radians(ang)
        d.line([(cx + math.cos(a) * (r + 8 * s), by + math.sin(a) * (r + 8 * s)),
                (cx + math.cos(a) * (r + 22 * s), by + math.sin(a) * (r + 22 * s))],
               fill=GOLD, width=_w(s, 5))


def brain(d, cx, cy, s, t=0.0, font=None):
    lw = _w(s, 4)
    d.ellipse([cx - 52 * s, cy - 34 * s, cx + 2 * s, cy + 34 * s], fill=PINK, outline=RED, width=lw)
    d.ellipse([cx - 2 * s, cy - 34 * s, cx + 52 * s, cy + 34 * s], fill=PINK, outline=RED, width=lw)
    d.line([(cx, cy - 30 * s), (cx, cy + 30 * s)], fill=RED, width=_w(s, 3))
    for box, a0, a1 in (
        ([cx - 40 * s, cy - 22 * s, cx - 12 * s, cy + 2 * s], 200, 340),
        ([cx + 12 * s, cy - 22 * s, cx + 40 * s, cy + 2 * s], 200, 340),
        ([cx - 38 * s, cy + 4 * s, cx - 10 * s, cy + 26 * s], 20, 160),
        ([cx + 10 * s, cy + 4 * s, cx + 38 * s, cy + 26 * s], 20, 160),
    ):
        d.arc(box, start=a0, end=a1, fill=RED, width=_w(s, 3))
    d.line([(cx + 4 * s, cy + 34 * s), (cx + 10 * s, cy + 50 * s)], fill=RED, width=_w(s, 6))


def clock(d, cx, cy, s, t=0.0, font=None):
    r = 46 * s
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE, outline=INK, width=_w(s, 6))
    for h in range(12):
        a = math.radians(h * 30)
        d.line([(cx + math.cos(a) * (r - 10 * s), cy + math.sin(a) * (r - 10 * s)),
                (cx + math.cos(a) * (r - 3 * s), cy + math.sin(a) * (r - 3 * s))],
               fill=INK, width=_w(s, 3))
    hour = math.radians(-60)
    d.line([(cx, cy), (cx + math.cos(hour) * 22 * s, cy + math.sin(hour) * 22 * s)], fill=INK, width=_w(s, 6))
    minute = math.radians((t * 120.0) % 360 - 90)
    d.line([(cx, cy), (cx + math.cos(minute) * 34 * s, cy + math.sin(minute) * 34 * s)], fill=RED, width=_w(s, 5))
    d.ellipse([cx - 5 * s, cy - 5 * s, cx + 5 * s, cy + 5 * s], fill=INK)


def bell_off(d, cx, cy, s, t=0.0, font=None):
    lw = _w(s, 6)
    d.arc([cx - 40 * s, cy - 52 * s, cx + 40 * s, cy + 28 * s], start=180, end=360, fill=INK, width=lw)
    d.line([(cx - 40 * s, cy - 12 * s), (cx - 48 * s, cy + 30 * s)], fill=INK, width=lw)
    d.line([(cx + 40 * s, cy - 12 * s), (cx + 48 * s, cy + 30 * s)], fill=INK, width=lw)
    d.line([(cx - 52 * s, cy + 30 * s), (cx + 52 * s, cy + 30 * s)], fill=INK, width=lw)
    d.ellipse([cx - 10 * s, cy + 30 * s, cx + 10 * s, cy + 46 * s], fill=INK)
    d.line([(cx - 56 * s, cy - 50 * s), (cx + 56 * s, cy + 50 * s)], fill=RED, width=_w(s, 8))


def lock(d, cx, cy, s, t=0.0, font=None):
    lw = _w(s, 8)
    d.arc([cx - 24 * s, cy - 62 * s, cx + 24 * s, cy - 6 * s], start=180, end=360, fill=INK, width=lw)
    d.line([(cx - 24 * s, cy - 34 * s), (cx - 24 * s, cy - 8 * s)], fill=INK, width=lw)
    d.line([(cx + 24 * s, cy - 34 * s), (cx + 24 * s, cy - 8 * s)], fill=INK, width=lw)
    d.rounded_rectangle([cx - 40 * s, cy - 12 * s, cx + 40 * s, cy + 44 * s], radius=_w(s, 10), fill=INK)
    d.ellipse([cx - 7 * s, cy + 6 * s, cx + 7 * s, cy + 20 * s], fill=WHITE)
    d.polygon([(cx - 5 * s, cy + 16 * s), (cx + 5 * s, cy + 16 * s),
               (cx + 8 * s, cy + 34 * s), (cx - 8 * s, cy + 34 * s)], fill=WHITE)


def phone(d, cx, cy, s, t=0.0, font=None):
    d.rounded_rectangle([cx - 30 * s, cy - 52 * s, cx + 30 * s, cy + 52 * s], radius=_w(s, 12), fill=INK)
    d.rounded_rectangle([cx - 25 * s, cy - 44 * s, cx + 25 * s, cy + 36 * s], radius=_w(s, 8), fill=SCREEN)
    d.ellipse([cx - 13 * s, cy - 24 * s, cx + 13 * s, cy + 2 * s], fill=BLUE)
    d.ellipse([cx - 4 * s, cy + 41 * s, cx + 4 * s, cy + 49 * s], fill=WHITE)


def mail_empty(d, cx, cy, s, t=0.0, font=None):
    lw = _w(s, 6)
    d.rectangle([cx - 52 * s, cy - 34 * s, cx + 52 * s, cy + 34 * s], fill=WHITE, outline=MUTED, width=lw)
    d.line([(cx - 52 * s, cy - 34 * s), (cx, cy + 6 * s), (cx + 52 * s, cy - 34 * s)], fill=MUTED, width=lw, joint="curve")


def check(d, cx, cy, s, t=0.0, font=None):
    r = 46 * s
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=TEAL)
    d.line([(cx - 20 * s, cy + 2 * s), (cx - 6 * s, cy + 18 * s), (cx + 24 * s, cy - 16 * s)],
           fill=WHITE, width=_w(s, 10), joint="curve")


def cross(d, cx, cy, s, t=0.0, font=None):
    r = 46 * s
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=RED)
    d.line([(cx - 18 * s, cy - 18 * s), (cx + 18 * s, cy + 18 * s)], fill=WHITE, width=_w(s, 10))
    d.line([(cx + 18 * s, cy - 18 * s), (cx - 18 * s, cy + 18 * s)], fill=WHITE, width=_w(s, 10))


def question(d, cx, cy, s, t=0.0, font=None):
    r = 46 * s
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BLUE)
    d.text((cx, cy), "?", fill=WHITE, font=_text_font(font), anchor="mm")


def _bang(d, cx, cy, s, color):
    d.line([(cx, cy - 18 * s), (cx, cy + 6 * s)], fill=color, width=_w(s, 9))
    d.ellipse([cx - 5 * s, cy + 14 * s, cx + 5 * s, cy + 24 * s], fill=color)


def warning(d, cx, cy, s, t=0.0, font=None):
    d.polygon([(cx, cy - 50 * s), (cx - 54 * s, cy + 42 * s), (cx + 54 * s, cy + 42 * s)],
              fill=GOLD, outline=INK)
    d.line([(cx, cy - 50 * s), (cx - 54 * s, cy + 42 * s), (cx + 54 * s, cy + 42 * s), (cx, cy - 50 * s)],
           fill=INK, width=_w(s, 6), joint="curve")
    _bang(d, cx, cy + 4 * s, s, INK)


def _bars(d, cx, cy, s, heights, color):
    d.line([(cx - 52 * s, cy + 44 * s), (cx + 54 * s, cy + 44 * s)], fill=MUTED, width=_w(s, 5))
    for i, h in enumerate(heights):
        x = cx + (i - 1) * 36 * s
        d.rectangle([x - 11 * s, cy + 44 * s - h * s, x + 11 * s, cy + 44 * s], fill=color)


def chart_up(d, cx, cy, s, t=0.0, font=None):
    _bars(d, cx, cy, s, (20, 36, 54), TEAL)
    pts = [(cx - 44 * s, cy - 22 * s), (cx - 6 * s, cy - 34 * s), (cx + 12 * s, cy - 30 * s), (cx + 46 * s, cy - 58 * s)]
    d.line(pts, fill=INK, width=_w(s, 6), joint="curve")
    ex, ey = pts[-1]
    d.polygon([(ex, ey), (ex - 20 * s, ey + 2 * s), (ex - 2 * s, ey + 20 * s)], fill=INK)


def chart_down(d, cx, cy, s, t=0.0, font=None):
    _bars(d, cx, cy, s, (54, 36, 20), RED)
    pts = [(cx - 44 * s, cy - 58 * s), (cx - 6 * s, cy - 32 * s), (cx + 12 * s, cy - 44 * s), (cx + 46 * s, cy - 18 * s)]
    d.line(pts, fill=INK, width=_w(s, 6), joint="curve")
    ex, ey = pts[-1]
    d.polygon([(ex, ey), (ex - 20 * s, ey - 2 * s), (ex - 4 * s, ey - 20 * s)], fill=INK)


def coin(d, cx, cy, s, t=0.0, font=None):
    r = 44 * s
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GOLD, outline=INK, width=_w(s, 5))
    r2 = 32 * s
    d.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], outline=(200, 140, 0, 255), width=_w(s, 3))
    d.text((cx, cy), "$", fill=INK, font=_text_font(font), anchor="mm")


def heart(d, cx, cy, s, t=0.0, font=None):
    d.ellipse([cx - 48 * s, cy - 40 * s, cx + 2 * s, cy + 10 * s], fill=RED)
    d.ellipse([cx - 2 * s, cy - 40 * s, cx + 48 * s, cy + 10 * s], fill=RED)
    d.polygon([(cx - 46 * s, cy - 4 * s), (cx + 46 * s, cy - 4 * s), (cx, cy + 50 * s)], fill=RED)


def generic(d, cx, cy, s, t=0.0, font=None):
    r = 40 * s
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(235, 242, 255, 255), outline=BLUE, width=_w(s, 4))
    _bang(d, cx, cy - 2 * s, s, BLUE)


ICON_DRAWERS = {
    "lightbulb": lightbulb, "brain": brain, "clock": clock, "bell_off": bell_off,
    "lock": lock, "phone": phone, "mail_empty": mail_empty, "check": check,
    "cross": cross, "question": question, "warning": warning,
    "chart_up": chart_up, "chart_down": chart_down, "coin": coin, "heart": heart,
}


def draw_icon(name, d, cx, cy, s, t=0.0, font=None):
    """Draw icon `name` (falls back to a generic '!' badge for unknown names)."""
    ICON_DRAWERS.get(name, generic)(d, cx, cy, s, t=t, font=font)
