# -*- coding: utf-8 -*-
"""
TTS ENGINE MODULE
Generates scene narration audio using Edge-TTS and measures exact audio durations.
"""

import asyncio
import json
import os
import re
import subprocess
import sys
import imageio_ffmpeg
import edge_tts

DEFAULT_VOICE = "en-GB-RyanNeural"
FALLBACK_VOICES = ["en-GB-RyanNeural", "en-US-ChristopherNeural", "en-US-GuyNeural", "en-US-EricNeural", "en-US-BrianNeural"]


def get_audio_duration_sec(audio_path: str) -> float:
    """Extract exact audio duration in seconds using bundled FFmpeg."""
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ffmpeg_exe, "-i", audio_path]
    result = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True, errors="ignore")
    match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", result.stderr)
    if match:
        hours = float(match.group(1))
        minutes = float(match.group(2))
        seconds = float(match.group(3))
        return round(hours * 3600.0 + minutes * 60.0 + seconds, 2)
    raise RuntimeError(f"Could not determine audio duration for: {audio_path}")


async def synthesize_scene_audio(narration_text: str, output_path: str, voice: str = DEFAULT_VOICE, max_retries: int = 3) -> float:
    """Synthesize single scene narration to MP3 with retry & voice fallback, returning duration in seconds."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    voices_to_try = [voice] + [v for v in FALLBACK_VOICES if v != voice]
    last_err = None

    for v in voices_to_try:
        for attempt in range(1, max_retries + 1):
            try:
                communicator = edge_tts.Communicate(narration_text, v)
                await communicator.save(output_path)
                if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
                    duration = get_audio_duration_sec(output_path)
                    return duration
            except Exception as e:
                last_err = e
                await asyncio.sleep(0.5 * attempt)
            
    raise RuntimeError(f"Failed to synthesize audio after testing voices: {last_err}")


async def process_storyboard(storyboard_path: str, audio_dir: str, voice: str = DEFAULT_VOICE):
    """Iterate all scenes in storyboard, synthesize audio, and update actual_duration_sec."""
    with open(storyboard_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    os.makedirs(audio_dir, exist_ok=True)
    scenes = data.get("scenes", [])
    print(f"[TTS Engine] Processing {len(scenes)} scenes using voice: {voice}")

    for idx, scene in enumerate(scenes, 1):
        scene_id = scene["scene_id"]
        narration = scene["narration_text"]
        out_mp3 = os.path.join(audio_dir, f"{scene_id}.mp3")

        print(f"  [{idx}/{len(scenes)}] Synthesizing {scene_id} ({len(narration.split())} words)...")
        dur = await synthesize_scene_audio(narration, out_mp3, voice=voice)
        scene["actual_duration_sec"] = dur
        print(f"       -> Generated {out_mp3} (duration: {dur:.2f}s)")

    # Save updated storyboard with actual durations
    with open(storyboard_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[TTS Engine] Successfully updated {storyboard_path} with actual durations.")
    return data


def run_tts(storyboard_path: str, audio_dir: str, voice: str = DEFAULT_VOICE):
    return asyncio.run(process_storyboard(storyboard_path, audio_dir, voice))


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sb_path = os.path.join(base_dir, "projects", "video-001", "03_storyboard.json")
    a_dir = os.path.join(base_dir, "projects", "video-001", "audio_scenes")
    run_tts(sb_path, a_dir)
