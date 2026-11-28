# -*- coding: utf-8 -*-
"""
STORYBOARD VALIDATOR — Gate 4 ("Technical Validation") as a runnable tool.

    python -m engine.storyboard_validator projects/video-002/03_storyboard.json

Checks, in order:
  1. JSON Schema   (templates/storyboard-schema.json)
  2. Engine vocabulary (engine/vocab.py): things the renderer / mixer cannot draw or play
  3. Pacing & layout rules from instructions/STORYBOARD_RULES.md (3.5 s rule, safe zones, 1-3 word cards)
  4. Files on disk (audio_file exists) when the storyboard lives in a project folder

Messages are written so a weak model can fix them without guessing: they name the scene, the field,
the bad value and the allowed values. Exit code is 1 when there is at least one ERROR.
Warnings never fail the run unless --strict is given.
"""

import argparse
import json
import os
import sys

try:
    from engine import vocab
except ImportError:  # executed as `python engine/storyboard_validator.py`
    import vocab

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA_PATH = os.path.join(BASE_DIR, "templates", "storyboard-schema.json")


def _path_str(path) -> str:
    return ".".join(str(p) for p in path) or "(root)"


def _scene_label(data: dict, path) -> str:
    """Turn a schema error path like scenes.3.visual.mood into 'SCENE_004 visual.mood'."""
    path = list(path)
    if len(path) >= 2 and path[0] == "scenes" and isinstance(path[1], int):
        idx = path[1]
        scenes = data.get("scenes", [])
        sid = scenes[idx].get("scene_id", f"scenes[{idx}]") if idx < len(scenes) and isinstance(scenes[idx], dict) else f"scenes[{idx}]"
        rest = _path_str(path[2:])
        return f"{sid} {rest}".strip()
    return _path_str(path)


def validate_schema(data: dict):
    errors = []
    try:
        import jsonschema
    except ImportError:
        return ["jsonschema is not installed: run `pip install jsonschema` to enable schema checks"], True
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        schema = json.load(f)
    validator = jsonschema.Draft7Validator(schema)
    for err in sorted(validator.iter_errors(data), key=lambda e: list(e.path)):
        # pose / mood / icon enum problems get a friendlier message from validate_vocab_and_rules()
        if err.validator == "enum" and list(err.path) and list(err.path)[-1] in ("stickman_pose", "mood", "icon"):
            continue
        errors.append(f"{_scene_label(data, err.path)}: {err.message}")
    return errors, False


def validate_vocab_and_rules(data: dict, project_dir: str = None):
    """Returns (errors, warnings) for everything the JSON Schema cannot express."""
    errors, warnings = [], []
    scenes = data.get("scenes", [])
    seen = set()

    for scene in scenes:
        if not isinstance(scene, dict):
            continue
        sid = scene.get("scene_id", "?")
        if sid in seen:
            errors.append(f"{sid}: duplicate scene_id")
        seen.add(sid)

        vis = scene.get("visual") or {}
        aud = scene.get("audio") or {}
        cam = vis.get("camera") or {}
        card = vis.get("card")

        # --- vocabulary (schema covers most enums; these give friendlier hints + extras)
        pose = vis.get("stickman_pose")
        if pose and pose not in vocab.POSES:
            errors.append(f"{sid}: visual.stickman_pose '{pose}' is not drawable. Use one of: {', '.join(vocab.POSES)}")
        mood = vis.get("mood")
        if mood and mood not in vocab.MOODS:
            errors.append(f"{sid}: visual.mood '{mood}' is not supported. Use one of: {', '.join(vocab.MOODS)}")
        outfit = vis.get("outfit")
        if outfit and outfit not in vocab.OUTFITS:
            errors.append(f"{sid}: visual.outfit '{outfit}' is not supported. Use one of: {', '.join(vocab.OUTFITS)}")
        hair = vis.get("hair")
        if hair and hair not in vocab.HAIRS:
            errors.append(f"{sid}: visual.hair '{hair}' is not supported. Use one of: {', '.join(vocab.HAIRS)}")
        hand_prop = vis.get("hand_prop")
        if hand_prop and hand_prop not in vocab.HAND_PROPS:
            errors.append(f"{sid}: visual.hand_prop '{hand_prop}' is not supported. Use one of: {', '.join(vocab.HAND_PROPS)}")
        layout = vis.get("layout")
        if layout and layout not in vocab.LAYOUTS:
            errors.append(f"{sid}: visual.layout '{layout}' is not supported. Use one of: {', '.join(vocab.LAYOUTS)}")
        if card:
            icon = card.get("icon")
            if icon and icon not in vocab.ICONS:
                errors.append(f"{sid}: visual.card.icon '{icon}' does not exist. Use one of: {', '.join(vocab.ICONS)}")
            if not icon:
                warnings.append(f"{sid}: visual.card has no icon (text-only card). Add one of: {', '.join(vocab.ICONS)}")
            words = str(card.get("title", "")).split()
            if len(words) > vocab.MAX_CARD_WORDS:
                warnings.append(f"{sid}: visual.card.title has {len(words)} words; rule is 1-{vocab.MAX_CARD_WORDS} words")
        sfx = aud.get("sfx")
        if sfx is not None:
            if sfx not in vocab.SFX_RECIPES:
                warnings.append(f"{sid}: audio.sfx '{sfx}' is unknown and will be silent. Known: {', '.join(k for k, v in vocab.SFX_RECIPES.items() if v)}")
            elif not vocab.SFX_RECIPES[sfx]:
                warnings.append(f"{sid}: audio.sfx '{sfx}' has no sound file yet and will be silent")

        # --- mood fallback hint
        if not mood and not vis.get("expression"):
            warnings.append(f"{sid}: neither visual.mood nor visual.expression set; the pose default face will be used")

        # --- pacing (3.5 s rule)
        dur = scene.get("actual_duration_sec") or scene.get("estimated_duration_sec")
        if scene.get("actual_duration_sec") is None:
            warnings.append(f"{sid}: actual_duration_sec is null — run the TTS step before rendering")
        if dur and dur > vocab.MAX_STATIC_SEC + 0.05:
            warnings.append(f"{sid}: lasts {dur:.2f}s (> {vocab.MAX_STATIC_SEC}s). Split into {sid}_A / {sid}_B with a new camera move or pose")

        # --- layout: hero must leave room for the card
        x = (vis.get("position") or {}).get("x")
        if card and isinstance(x, (int, float)):
            in_left = vocab.SAFE_ZONE_LEFT[0] <= x <= vocab.SAFE_ZONE_LEFT[1]
            in_right = vocab.SAFE_ZONE_RIGHT[0] <= x <= vocab.SAFE_ZONE_RIGHT[1]
            if not (in_left or in_right):
                warnings.append(f"{sid}: hero x={x} overlaps the card area. Use x=0.25 (card right) or x=0.75 (card left)")
        if not card and layout in (None, "explainer_split") and not vis.get("characters") and not vis.get("custom_image"):
            warnings.append(f"{sid}: no visual.card — set visual.layout='story_action' for full-scene acting, or add a card for explainer concepts")

        # --- camera sanity
        if cam.get("framing") == "close_up" and card:
            warnings.append(f"{sid}: close_up crops the card out of frame; use medium/wide when a card carries the idea")

        # --- files
        if project_dir and os.path.isdir(os.path.join(project_dir, "audio_scenes")) and scene.get("audio_file"):
            if not os.path.exists(os.path.join(project_dir, scene["audio_file"])):
                warnings.append(f"{sid}: audio file '{scene['audio_file']}' not found yet")

    # --- repeated-look check (a weak model tends to paste the same scene)
    poses = [(s.get("visual") or {}).get("stickman_pose") for s in scenes if isinstance(s, dict)]
    run = 1
    for i in range(1, len(poses)):
        run = run + 1 if poses[i] == poses[i - 1] else 1
        if run == 4:
            warnings.append(f"{scenes[i].get('scene_id', '?')}: same pose '{poses[i]}' for 4 scenes in a row — vary pose/camera to keep retention")
    return errors, warnings


def validate_storyboard(data: dict, project_dir: str = None):
    """Run every check. Returns (errors, warnings)."""
    schema_errors, schema_skipped = validate_schema(data)
    errors, warnings = validate_vocab_and_rules(data, project_dir)
    if schema_skipped:
        warnings = schema_errors + warnings
    else:
        errors = schema_errors + errors
    return errors, warnings


def load_and_validate(path: str):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    project_dir = os.path.dirname(os.path.abspath(path))
    return validate_storyboard(data, project_dir)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Validate a storyboard against schema + engine vocabulary")
    ap.add_argument("storyboard", help="path to 03_storyboard.json")
    ap.add_argument("--strict", action="store_true", help="treat warnings as errors")
    ap.add_argument("--quiet", action="store_true", help="hide warnings")
    args = ap.parse_args(argv)

    try:
        errors, warnings = load_and_validate(args.storyboard)
    except json.JSONDecodeError as e:
        print(f"ERROR: not valid JSON (line {e.lineno}, col {e.colno}): {e.msg}")
        return 1

    for e in errors:
        print(f"ERROR   {e}")
    if not args.quiet:
        for w in warnings:
            print(f"WARNING {w}")
    print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)")
    if errors or (args.strict and warnings):
        print("\nFix the errors above, then run this command again. Allowed values: python -m engine.vocab")
        return 1
    print("Storyboard OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
