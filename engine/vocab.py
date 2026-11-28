# -*- coding: utf-8 -*-
"""
VOCAB — SINGLE SOURCE OF TRUTH FOR WHAT THE ENGINE CAN ACTUALLY DRAW AND PLAY.

Why this file exists
--------------------
A weaker model (e.g. Gemini Flash) writes better storyboards when it must PICK
values from a short closed list instead of inventing free text. Everything in
this file is something the renderer / audio mixer really supports. The storyboard
validator (engine/storyboard_validator.py) checks scenes against these lists and
returns precise, fixable error messages.

Print the cheat sheet any time with:   python -m engine.vocab
"""

# Character poses (rigs live in engine/character_renderer.mjs :: POSE_RIGS_V2 & engine/stickman_renderer.py :: POSE_RIGS)
POSES = (
    "idle_neutral",
    "thinking",
    "idea_lightbulb",
    "stressed_headache",
    "running_hurry",
    "pointing_target",
    "shocked_fall",
    "celebrate_win",
    # Stickman 2.0 expressive poses
    "kneeling_offer",
    "singing_mic",
    "balancing",
    "lifting_weight",
    "painting",
    "slipping_fall",
    "dancing",
    "sitting",
    "walking",
    "presenting",
)

# Face moods (eyebrows + mouth). `visual.mood` picks one directly.
MOODS = (
    "neutral", "eager", "happy", "flat", "deadpan", "sad",
    "angry", "shocked", "laughing", "focused", "singing",
)

# Stickman 2.0 character customization & scene layouts
OUTFITS = (
    "casual", "hoodie", "suit", "jacket", "tank_top",
    "artist", "disco", "lab_coat", "classic",
)
HAIRS = (
    "none", "messy", "spiky", "parted", "ponytail",
    "beret", "cap", "beanie", "crown",
)
HAND_PROPS = (
    "none", "mic", "dumbbell", "paintbrush", "ring_box", "phone",
    "coffee_mug", "book", "money", "magnifying_glass", "megaphone", "laptop",
)
LAYOUTS = (
    "explainer_split", "story_action", "dialogue", "closeup", "custom_image",
)

# Icons for the info card shown next to the character (engine/icons.py)
ICONS = (
    "lightbulb", "brain", "clock", "bell_off", "lock", "phone", "mail_empty",
    "check", "cross", "question", "warning", "chart_up", "chart_down",
    "coin", "heart",
)

CAMERA_FRAMING = ("wide", "medium", "close_up")
CAMERA_MOVEMENT = ("static", "zoom_in", "zoom_out", "pan_left", "pan_right", "shake")
BGM_MOODS = ("tense", "curious", "upbeat", "calm", "dramatic", "triumphant")

# Keyword -> mood, used when a scene has no explicit `visual.mood`.
# The first matching keyword (checked in this order) in `visual.expression` wins.
EXPRESSION_KEYWORDS = (
    (("sad", "disappoint", "worried", "stress", "bored", "sigh"), "sad"),
    (("deadpan", "flat", "skeptic", "blank", "sarcastic", "stare"), "deadpan"),
    (("happy", "smile", "laugh", "joy", "proud", "triumph", "celebrat", "excited",
      "enthusias", "pleased", "satisf", "amused", "warm"), "happy"),
    (("curious", "eager", "engaged", "intrigue", "interest", "puzzled", "wide_eyed",
      "fascinat", "focused", "confident", "surprised", "shocked"), "eager"),
)

# SFX names a storyboard may use -> list of (file key, delay_ms, volume).
# File keys are resolved to real files by engine/audio_mixer.py (SFX_FILES).
# A name that maps to [] is allowed but plays silence (no file for it yet).
SFX_RECIPES = {
    "pop": [("pop", 120, 0.6)],
    "pop_pop_pop": [("pop", 100, 0.5), ("pop", 450, 0.5), ("pop", 800, 0.5)],
    "whoosh": [("whoosh", 60, 0.5)],
    "phone_unlock": [("swish", 50, 0.5), ("click_1", 250, 0.7)],
    "phone_lock": [("click_2", 250, 0.7)],
    "subtle_click": [("click_3", 200, 0.5)],
    "toggle_click": [("click_3", 200, 0.6)],
    "clock_tick": [("click_1", 200, 0.4), ("click_1", 700, 0.4),
                   ("click_1", 1200, 0.4), ("click_1", 1700, 0.4)],
    "record_scratch": [("scratch", 150, 0.8)],
    # No sound file in assets/audio/sfx yet — add e.g. ding.wav and map it in
    # engine/audio_mixer.py :: SFX_FILES to enable these.
    "ding": [],
    "subtle_chime": [],
    "calm_chime": [],
    "thud": [],
    "dry_clap": [],
    "slot_lever": [],
    "water_splash": [],
    "paper_rustle": [],
}

# Scene counts and pacing rules shared by validator / QA
MAX_STATIC_SEC = 3.5          # a scene longer than this must be split
MAX_CARD_WORDS = 3            # card title: 1-3 words
SAFE_ZONE_LEFT = (0.15, 0.35)   # hero x when a card is shown on the right
SAFE_ZONE_RIGHT = (0.65, 0.85)  # hero x when a card is shown on the left


def cheat_sheet() -> str:
    lines = [
        "ALLOWED VALUES (the renderer supports exactly these)",
        "  visual.stickman_pose : " + ", ".join(POSES),
        "  visual.mood          : " + ", ".join(MOODS),
        "  visual.card.icon     : " + ", ".join(ICONS),
        "  camera.framing       : " + ", ".join(CAMERA_FRAMING),
        "  camera.movement      : " + ", ".join(CAMERA_MOVEMENT),
        "  audio.bgm_mood       : " + ", ".join(BGM_MOODS),
        "  audio.sfx            : " + ", ".join(k for k, v in SFX_RECIPES.items() if v)
        + "  (or null)",
        "",
        "LAYOUT RULES",
        "  - hero x = 0.25 (card on the right) or 0.75 (card on the left)",
        "  - card.title = 1-3 words; card.subtitle optional, short",
        f"  - one scene <= {MAX_STATIC_SEC}s; split longer narration into SCENE_005_A, SCENE_005_B",
    ]
    return "\n".join(lines)


if __name__ == "__main__":
    print(cheat_sheet())
