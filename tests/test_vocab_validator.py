# -*- coding: utf-8 -*-
import copy
import json
import os
import sys

import pytest

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE)

from engine import vocab  # noqa: E402
from engine.icons import ICON_DRAWERS  # noqa: E402
from engine.storyboard_validator import validate_storyboard  # noqa: E402
from engine import stickman_renderer as sr  # noqa: E402

EXAMPLE = os.path.join(BASE, "templates", "storyboard-example.json")


@pytest.fixture
def example():
    with open(EXAMPLE, encoding="utf-8") as f:
        return json.load(f)


def test_icons_match_vocab():
    assert set(ICON_DRAWERS) == set(vocab.ICONS)


def test_poses_match_vocab():
    assert set(sr.POSE_RIGS) == set(vocab.POSES)


def test_schema_enums_match_vocab():
    with open(os.path.join(BASE, "templates", "storyboard-schema.json"), encoding="utf-8") as f:
        schema = json.load(f)
    vis = schema["properties"]["scenes"]["items"]["properties"]["visual"]["properties"]
    assert set(vis["mood"]["enum"]) == set(vocab.MOODS)
    assert set(vis["card"]["properties"]["icon"]["enum"]) == set(vocab.ICONS)


def test_example_storyboard_has_no_errors(example):
    errors, _ = validate_storyboard(example)
    assert errors == []


def test_validator_reports_bad_values(example):
    bad = copy.deepcopy(example)
    bad["scenes"][1]["visual"]["stickman_pose"] = "run"
    bad["scenes"][2]["visual"]["card"]["icon"] = "light-bulb"
    errors, _ = validate_storyboard(bad)
    joined = "\n".join(errors)
    assert "SCENE_002" in joined and "run" in joined
    assert "SCENE_003" in joined and "light-bulb" in joined


def test_validator_warns_on_long_scene_and_overlap(example):
    bad = copy.deepcopy(example)
    bad["scenes"][0]["actual_duration_sec"] = 6.0
    bad["scenes"][3]["visual"]["position"]["x"] = 0.5
    _, warnings = validate_storyboard(bad)
    joined = "\n".join(warnings)
    assert "SCENE_001" in joined and "Split" in joined
    assert "SCENE_004" in joined and "overlaps" in joined


def test_mood_resolution():
    assert sr.resolve_mood({"mood": "sad"}, "happy", "idle_neutral") == "sad"
    assert sr.resolve_mood({"expression": "worried_tired"}, "neutral", "thinking") == "sad"
    assert sr.resolve_mood({"expression": "sarcastic_smirk"}, "neutral", "thinking") == "deadpan"
    assert sr.resolve_mood({}, "eager", "idle_neutral") == "eager"


def test_camera_defaults_to_no_zoom():
    box = sr.camera_box(None, 0, 10, (100, 100))
    assert box == (0.0, 0.0, float(sr.SW), float(sr.SH))


def test_camera_close_up_with_card_keeps_card_visible():
    focus = (sr.SW * 0.25, sr.SH * 0.5)
    card_cx = sr.SW * 0.70
    left, top, right, bottom = sr.camera_box({"framing": "close_up", "movement": "static"}, 0, 10, focus, card_cx)
    assert left < focus[0] < right
    assert card_cx + 280 * sr.SS_SCALE < right  # card half-width inside the crop


def test_select_scenes_preview_seconds(example):
    picked = sr.select_scenes(example["scenes"], preview_seconds=6.0)
    assert 2 <= len(picked) <= 3
    assert sum(sr.scene_duration(s) for s in picked[:-1]) < 6.0


def test_contact_sheet_renders(tmp_path, example):
    out = tmp_path / "sheet.png"
    sr.render_contact_sheet(EXAMPLE, str(out), limit=3, legacy=False)
    assert out.exists() and out.stat().st_size > 10_000


def test_scene_renders_to_mp4(tmp_path, example):
    engine = sr.B5CrazyMeiEngine()
    scene = copy.deepcopy(example["scenes"][0])
    scene["actual_duration_sec"] = 0.5
    out = tmp_path / "s.mp4"
    engine.render_scene(scene, str(out), legacy=False)
    assert out.exists() and out.stat().st_size > 1000
