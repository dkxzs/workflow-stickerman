# -*- coding: utf-8 -*-
"""
FULL PIPELINE RUNNER — 42 SCENES RENDERING & ASSEMBLY
Renders all 42 scenes with CrazyMei Solo Engine (Tier A+) and muxes SFX + Voice + BGM
into projects/video-001/output/video_001_full.mp4.
"""

import os
import sys
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sb_path = os.path.join(BASE_DIR, "projects", "video-001", "03_storyboard.json")
video_dir = os.path.join(BASE_DIR, "projects", "video-001", "video_scenes")
audio_dir = os.path.join(BASE_DIR, "projects", "video-001", "audio_scenes")
output_mp4 = os.path.join(BASE_DIR, "projects", "video-001", "output", "video_001_full.mp4")

if __name__ == "__main__":
    t0 = time.time()
    print("[Full Pipeline] Step 1/2: Rendering all 42 video scenes...")
    from engine.stickman_renderer import render_storyboard
    render_storyboard(sb_path, video_dir)

    print("\n[Full Pipeline] Step 2/2: Muxing SFX, narration, and subtle BGM into master video...")
    from engine.audio_mixer import mux_and_assemble_project
    mux_and_assemble_project(sb_path, video_dir, audio_dir, output_mp4)

    elapsed = time.time() - t0
    print(f"\n[Full Pipeline] SUCCESS in {elapsed:.1f}s!")
    print(f"Master Video ready at: {output_mp4}")
