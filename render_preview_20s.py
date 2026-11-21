"""Render and assemble the first six scenes without touching the full render."""

from pathlib import Path
from time import perf_counter

from engine.audio_mixer import mux_and_assemble_project
from engine.stickman_renderer import render_storyboard


PROJECT_DIR = Path(__file__).resolve().parent / "projects" / "video-001"
SCENE_LIMIT = 6


def main():
    storyboard = str(PROJECT_DIR / "03_storyboard.json")
    video_dir = str(PROJECT_DIR / "video_scenes_preview_20s")
    audio_dir = str(PROJECT_DIR / "audio_scenes")
    output_mp4 = str(PROJECT_DIR / "output" / "video_001_preview_20s.mp4")

    start = perf_counter()
    print(f"[Preview] Step 1/2: Rendering the first {SCENE_LIMIT} scenes...", flush=True)
    render_storyboard(storyboard, video_dir, limit=SCENE_LIMIT)

    print("[Preview] Step 2/2: Assembling video and audio...", flush=True)
    mux_and_assemble_project(storyboard, video_dir, audio_dir, output_mp4, limit=SCENE_LIMIT)
    print(f"[Preview] Done in {perf_counter() - start:.1f}s: {output_mp4}")


if __name__ == "__main__":
    main()
