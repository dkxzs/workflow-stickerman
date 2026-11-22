# -*- coding: utf-8 -*-
"""
engine/voice_aligner.py
Transcribes an audio file and extracts word-level & sentence-level timestamps
using faster-whisper (runs 100% locally & offline for 0 VNĐ).
"""

import sys
import os
import json
import av

# Compatibility fix: av 19+ removed metadata_errors keyword from av.open
_orig_av_open = av.open
def _safe_av_open(*args, **kwargs):
    kwargs.pop("metadata_errors", None)
    return _orig_av_open(*args, **kwargs)
av.open = _safe_av_open

from faster_whisper import WhisperModel


def transcribe_audio(audio_path, output_json_path=None, model_size="base", language=None):
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    # Fallback-safe device selection: try cpu with int8 first (guaranteed 100% stable on any Windows PC)
    print(f"[Whisper] Loading model '{model_size}' (CPU int8)...")
    try:
        model = WhisperModel(model_size, device="cpu", compute_type="int8")
    except Exception as e:
        print(f"[Whisper] CPU int8 failed, falling back to float32: {e}")
        model = WhisperModel(model_size, device="cpu", compute_type="float32")

    print(f"[Whisper] Transcribing: {audio_path}")
    segments, info = model.transcribe(
        audio_path,
        beam_size=5,
        word_timestamps=True,
        language=language
    )

    detected_lang = info.language
    lang_prob = info.language_probability
    print(f"[Whisper] Detected language: {detected_lang} (confidence: {lang_prob:.2f})")

    result = {
        "audio_file": audio_path,
        "language": detected_lang,
        "duration": info.duration,
        "segments": []
    }

    for seg in segments:
        seg_data = {
            "id": seg.id,
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "text": seg.text.strip(),
            "words": []
        }
        if seg.words:
            for w in seg.words:
                seg_data["words"].append({
                    "word": w.word.strip(),
                    "start": round(w.start, 3),
                    "end": round(w.end, 3),
                    "probability": round(w.probability, 3)
                })
        result["segments"].append(seg_data)

    if output_json_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_json_path)), exist_ok=True)
        with open(output_json_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"[Whisper] Saved word timestamps to: {output_json_path}")

    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python voice_aligner.py <audio_path> [output_json_path]")
        sys.exit(1)

    audio = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else None
    res = transcribe_audio(audio, out)
    print(json.dumps(res, indent=2, ensure_ascii=False))
