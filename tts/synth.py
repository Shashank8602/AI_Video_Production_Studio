"""Generate dialogue audio with Kokoro (free, CPU) and word timings.

Usage:
  python tts/synth.py videos/001-olbers-paradox            # full dialogue
  python tts/synth.py --test                               # voice candidates
Output (full): <video>/audio/line_XX.wav, <video>/audio/dialogue.wav, <video>/timings.json
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

SR = 24000
# Zib: higher and brighter. Bolt: lower and calmer. Change after the voice test.
VOICES = {
    "zib": {"voice": "af_nicole", "speed": 1.08},
    "bolt": {"voice": "am_michael", "speed": 0.95},
}
TEST_CANDIDATES = {
    "zib": ["af_nicole", "af_bella", "af_sky", "af_heart"],
    "bolt": ["am_michael", "am_adam", "bm_george", "bm_lewis"],
}

pipeline = KPipeline(lang_code="a")  # American English


def synth_line(text, voice, speed):
    """Return (audio float32 array, [(word, start_s, end_s), ...]) for one line."""
    chunks, words, offset = [], [], 0.0
    for result in pipeline(text, voice=voice, speed=speed):
        audio = getattr(result, "audio", None)
        if audio is None:  # older API: (graphemes, phonemes, audio)
            audio = result[2]
        audio = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
        for tok in getattr(result, "tokens", None) or []:
            s, e = getattr(tok, "start_ts", None), getattr(tok, "end_ts", None)
            if s is not None and e is not None and tok.text.strip():
                words.append((tok.text, offset + s, offset + e))
        chunks.append(audio)
        offset += len(audio) / SR
    return np.concatenate(chunks).astype(np.float32), words


def spread_words(text, duration):
    """Fallback: distribute words across the clip by character count."""
    toks = text.split()
    total = sum(len(t) for t in toks) or 1
    out, t0 = [], 0.0
    for t in toks:
        d = duration * len(t) / total
        out.append((t, t0, t0 + d))
        t0 += d
    return out


def trim(audio, thresh=0.01, keep=0.04):
    """Trim leading/trailing silence, keeping a short margin."""
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio, 0.0
    a = max(idx[0] - int(keep * SR), 0)
    b = min(idx[-1] + int(keep * SR), len(audio))
    return audio[a:b], a / SR


def run_test():
    out = Path("videos/_preview/voices")
    out.mkdir(parents=True, exist_ok=True)
    lines = {
        "zib": "Bolt! Why is the night sky dark, if there are billions of stars?",
        "bolt": "Great question. If the universe were endless, every line of sight would end on a star.",
    }
    for who, voices in TEST_CANDIDATES.items():
        for v in voices:
            speed = VOICES[who]["speed"]
            audio, _ = synth_line(lines[who], v, speed)
            sf.write(out / f"{who}_{v}.wav", audio, SR)
            print("wrote", out / f"{who}_{v}.wav", f"{len(audio)/SR:.1f}s")


def run_full(video_dir):
    video = Path(video_dir)
    script = json.loads((video / "script.json").read_text(encoding="utf-8"))
    audio_dir = video / "audio"
    audio_dir.mkdir(exist_ok=True)

    timeline, cursor, lines_out = [], 0.0, []
    for line in script["lines"]:
        cfg = VOICES[line["speaker"]]
        audio, words = synth_line(line["text"], cfg["voice"], cfg["speed"])
        audio, lead = trim(audio)
        dur = len(audio) / SR
        words = [(w, max(s - lead, 0.0), max(e - lead, 0.0)) for w, s, e in words] or spread_words(line["text"], dur)
        sf.write(audio_dir / f"line_{line['id']:02d}.wav", audio, SR)

        start = cursor
        timeline.append(audio)
        cursor += dur
        pause = float(line.get("pause_after", 0.3))
        timeline.append(np.zeros(int(pause * SR), dtype=np.float32))
        cursor += pause
        lines_out.append({
            "id": line["id"], "speaker": line["speaker"], "emotion": line["emotion"],
            "camera": line["camera"], "text": line["text"],
            "start": round(start, 3), "end": round(start + dur, 3),
            "words": [{"w": w, "start": round(start + s, 3), "end": round(start + e, 3)} for w, s, e in words],
        })
        print(f"line {line['id']:>2} {line['speaker']:<4} {dur:5.2f}s")

    mix = np.concatenate(timeline)
    peak = float(np.max(np.abs(mix))) or 1.0
    mix = mix * (0.89 / peak)  # peak about -1 dBFS
    sf.write(audio_dir / "dialogue.wav", mix, SR)
    (video / "timings.json").write_text(
        json.dumps({"duration": round(len(mix) / SR, 3), "screen": script.get("screen", ""), "lines": lines_out}, indent=2),
        encoding="utf-8",
    )
    print(f"total {len(mix)/SR:.1f}s")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        run_test()
    elif len(sys.argv) > 1:
        run_full(sys.argv[1])
    else:
        print(__doc__)
