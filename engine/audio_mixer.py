# -*- coding: utf-8 -*-
"""
AUDIO MIXER & VIDEO ASSEMBLY MODULE — REF-DIRECTOR SFX & BGM INTEGRATION
Muxes per-scene video, narration audio, auto-triggered SFX, and mixes subtle
background music (-23dB) from _ref_director's audio library.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import imageio_ffmpeg

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_AUDIO = os.path.join(BASE_DIR, "assets", "audio")
REF_AUDIO = os.path.join(BASE_DIR, "_ref_director", "skills", "directing-stickman-videos", "assets", "b-audio-library", "audio")

def find_audio(local_rel: str, ref_rel: str) -> str:
    p1 = os.path.join(LOCAL_AUDIO, local_rel)
    if os.path.exists(p1):
        return p1
    return os.path.join(REF_AUDIO, ref_rel)

# Sound asset map
SFX_UNLOCK_CLICK = find_audio(os.path.join("sfx", "click_001.ogg"), os.path.join("kenney-interface", "click_001.ogg"))
SFX_LOCK_CLICK = find_audio(os.path.join("sfx", "click_002.ogg"), os.path.join("kenney-interface", "click_002.ogg"))
SFX_SWIPE_TAP = find_audio(os.path.join("sfx", "click_003.ogg"), os.path.join("kenney-interface", "click_003.ogg"))
SFX_DULL_FAIL = find_audio(os.path.join("sfx", "click_004.ogg"), os.path.join("kenney-interface", "click_004.ogg"))
SFX_SWISH1 = find_audio(os.path.join("sfx", "swish-1.wav"), os.path.join("artisticdude-swishes", "swish-1.wav"))
SFX_SWISH2 = find_audio(os.path.join("sfx", "swish-2.wav"), os.path.join("artisticdude-swishes", "swish-2.wav"))
SFX_SCRATCH = find_audio(os.path.join("sfx", "160909__raccoonanimator__scratch-speed.wav"), os.path.join("record-scratch", "160909__raccoonanimator__scratch-speed.wav"))
BGM_SNEAKY = find_audio(os.path.join("bgm", "bgm-sneaky-snitch.mp3"), os.path.join("music", "bgm-sneaky-snitch.mp3"))


def get_scene_sfx_recipe(scene_id: str):
    """Return list of (sfx_path, delay_ms, volume) for each scene."""
    if scene_id == "SCENE_001":
        return [
            (SFX_SWISH1, 50, 0.5),
            (SFX_UNLOCK_CLICK, 250, 0.7),
        ]
    elif scene_id == "SCENE_002":
        return [
            (SFX_SWIPE_TAP, 300, 0.6),
        ]
    elif scene_id == "SCENE_003":
        return [
            (SFX_SWISH2, 50, 0.4),
            (SFX_DULL_FAIL, 350, 0.6),
        ]
    elif scene_id == "SCENE_004":
        return [
            (SFX_SCRATCH, 150, 0.8),
        ]
    elif scene_id == "SCENE_005":
        return [
            (SFX_LOCK_CLICK, 250, 0.7),
        ]
    elif scene_id == "SCENE_006":
        # Ticking clock pulses
        return [
            (SFX_UNLOCK_CLICK, 200, 0.4),
            (SFX_UNLOCK_CLICK, 700, 0.4),
            (SFX_UNLOCK_CLICK, 1200, 0.4),
            (SFX_UNLOCK_CLICK, 1700, 0.4),
        ]
    return []


def mix_scene_audio(voice_file: str, scene_id: str, output_wav: str):
    """Mix narration voice with scene-specific SFX using FFmpeg."""
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    recipe = get_scene_sfx_recipe(scene_id)
    
    # Filter only existing files
    valid_sfx = [(p, d, v) for p, d, v in recipe if os.path.exists(p)]
    
    if not valid_sfx:
        # Just copy / transcode voice
        cmd = [ffmpeg_exe, "-y", "-i", voice_file, "-c:a", "pcm_s16le", output_wav]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return output_wav

    inputs = ["-i", voice_file]
    filter_parts = ["[0:a]volume=1.0[voice]"]
    mix_inputs = ["[voice]"]

    for idx, (sfx_path, delay_ms, vol) in enumerate(valid_sfx, 1):
        inputs.extend(["-i", sfx_path])
        filter_parts.append(f"[{idx}:a]volume={vol},adelay={delay_ms}|{delay_ms}[sfx{idx}]")
        mix_inputs.append(f"[sfx{idx}]")

    all_inputs_str = "".join(mix_inputs)
    filter_parts.append(f"{all_inputs_str}amix=inputs={len(mix_inputs)}:duration=first:dropout_transition=0[aout]")
    filter_complex = ";".join(filter_parts)

    cmd = [
        ffmpeg_exe,
        "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[aout]",
        "-c:a", "pcm_s16le",
        output_wav,
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        # Fallback to pure voice on any filter issue
        fallback_cmd = [ffmpeg_exe, "-y", "-i", voice_file, "-c:a", "pcm_s16le", output_wav]
        subprocess.run(fallback_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    return output_wav


def mux_and_assemble_project(
    storyboard_path: str,
    video_scenes_dir: str,
    audio_scenes_dir: str,
    output_path: str,
    limit: int = None,
    bgm_file: str = BGM_SNEAKY,
):
    """Mux scene video + mixed SFX audio, and concatenate with background music into final video."""
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    with open(storyboard_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    scenes = data.get("scenes", [])
    if limit is not None:
        scenes = scenes[:limit]

    print(f"[AudioMixer] Assembling {len(scenes)} scenes into {output_path} (SFX + BGM enabled)...")
    start_time = time.time()

    muxed_clips = []
    temp_dir = os.path.join(video_scenes_dir, "temp_muxed")
    os.makedirs(temp_dir, exist_ok=True)

    # 1. Mix SFX into each scene audio, then mux with video
    for idx, scene in enumerate(scenes, 1):
        scene_id = scene["scene_id"]
        v_file = os.path.join(video_scenes_dir, f"{scene_id}.mp4")
        a_file = os.path.join(audio_scenes_dir, f"{scene_id}.mp3")
        m_file = os.path.join(temp_dir, f"{scene_id}_muxed.mp4")
        sfx_audio = os.path.join(temp_dir, f"{scene_id}_sfx.wav")

        if not os.path.exists(v_file):
            raise FileNotFoundError(f"Missing video scene: {v_file}")
        if not os.path.exists(a_file):
            raise FileNotFoundError(f"Missing audio scene: {a_file}")

        print(f"  [{idx}/{len(scenes)}] Mixing SFX & Muxing {scene_id}...")
        mix_scene_audio(a_file, scene_id, sfx_audio)

        # Mux video with mixed scene audio
        cmd = [
            ffmpeg_exe,
            "-y",
            "-i", v_file,
            "-i", sfx_audio,
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            m_file,
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            raise RuntimeError(f"FFmpeg mux failed for {scene_id}: {res.stderr}")

        muxed_clips.append(m_file)

    # 2. Write concat list
    concat_txt_path = os.path.join(temp_dir, "concat_list.txt")
    with open(concat_txt_path, "w", encoding="utf-8") as f:
        for clip in muxed_clips:
            formatted_path = clip.replace("\\", "/")
            f.write(f"file '{formatted_path}'\n")

    # 3. Concatenate and mix subtle background music (-23dB)
    temp_concat = os.path.join(temp_dir, "temp_concat.mp4")
    print(f"[AudioMixer] Concatenating scene clips...")
    concat_cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt_path,
        "-c", "copy",
        temp_concat,
    ]
    res_concat = subprocess.run(concat_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res_concat.returncode != 0:
        raise RuntimeError(f"FFmpeg concat failed: {res_concat.stderr}")

    # 4. Mix Background Music if available
    if bgm_file and os.path.exists(bgm_file):
        print(f"[AudioMixer] Mixing subtle background music ({os.path.basename(bgm_file)} at -23dB)...")
        bgm_cmd = [
            ffmpeg_exe,
            "-y",
            "-i", temp_concat,
            "-i", bgm_file,
            "-filter_complex",
            "[1:a]volume=0.07,aloop=loop=-1:size=2e+09[bgm];[0:a][bgm]amix=inputs=2:duration=first[amixed];[amixed]loudnorm=I=-14:TP=-1.5:LRA=11[aout]",
            "-map", "0:v:0",
            "-map", "[aout]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-movflags", "+faststart",
            output_path,
        ]
        res_bgm = subprocess.run(bgm_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res_bgm.returncode != 0:
            print("  [Warning] BGM loudnorm filter failed, falling back to simple mix...")
            simple_bgm_cmd = [
                ffmpeg_exe,
                "-y",
                "-i", temp_concat,
                "-i", bgm_file,
                "-filter_complex",
                "[1:a]volume=0.07,aloop=loop=-1:size=2e+09[bgm];[0:a][bgm]amix=inputs=2:duration=first[aout]",
                "-map", "0:v:0",
                "-map", "[aout]",
                "-c:v", "copy",
                "-c:a", "aac",
                "-b:a", "192k",
                "-movflags", "+faststart",
                output_path,
            ]
            res_simple = subprocess.run(simple_bgm_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if res_simple.returncode != 0:
                print("  [Warning] Simple BGM mix failed, copying direct concat...")
                shutil.copyfile(temp_concat, output_path)
    else:
        shutil.copyfile(temp_concat, output_path)

    # 5. Clean up temporary files
    for clip in muxed_clips:
        try:
            os.remove(clip)
        except OSError:
            pass
    for scene in scenes:
        sfx_path = os.path.join(temp_dir, f"{scene['scene_id']}_sfx.wav")
        try:
            os.remove(sfx_path)
        except OSError:
            pass
    try:
        os.remove(temp_concat)
        os.remove(concat_txt_path)
        os.rmdir(temp_dir)
    except OSError:
        pass

    elapsed = time.time() - start_time
    file_size_mb = os.path.getsize(output_path) / (1024.0 * 1024.0)
    print(f"[AudioMixer] Master video rendered in {elapsed:.2f}s ({file_size_mb:.2f} MB) -> {output_path}")
    return output_path


def mix_project_audio(scenes_audio_list=None, sfx_list=None, bgm_path=None, output_path=None, limit=None):
    """Compatibility interface matching engine signature."""
    sb_path = os.path.join(BASE_DIR, "projects", "video-001", "03_storyboard.json")
    v_dir = os.path.join(BASE_DIR, "projects", "video-001", "video_scenes")
    a_dir = os.path.join(BASE_DIR, "projects", "video-001", "audio_scenes")
    out_file = output_path or os.path.join(BASE_DIR, "projects", "video-001", "output", "video_001_pilot.mp4")
    return mux_and_assemble_project(sb_path, v_dir, a_dir, out_file, limit=limit, bgm_file=bgm_path or BGM_SNEAKY)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Audio Mixer & Video Assembler")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of scenes to assemble")
    parser.add_argument("--output", type=str, default=None, help="Output MP4 path")
    parser.add_argument("--bgm", type=str, default=None, help="Custom BGM path")
    args = parser.parse_args()
    mix_project_audio(output_path=args.output, limit=args.limit, bgm_path=args.bgm)
