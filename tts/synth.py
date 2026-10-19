"""Generate expressive dialogue audio with Kokoro (free, CPU) and word timings.

Usage:
  python tts/synth.py videos/001-olbers-paradox   # full dialogue -> audio/, timings.json
  python tts/synth.py --demo                      # short demo of the voices

Expressiveness comes from per-mood speed and pitch, ellipsis pauses inside lines, a rising
pitch at the end of questions, small pause variation, and soft breaths before excited lines.
"""
import json
import re
import subprocess
import sys
import tempfile
import zlib
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

SR = 24000
VOICES = {
    "zib": {"voice": "af_nicole", "speed": 0.92},
    "bolt": {"voice": "am_eric,af_nicole", "speed": 0.83},  # calm, mentor-like
}
# Mood -> (speed multiplier, pitch shift in semitones)
MOODS = {
    "zib": {
        "excited": (1.12, 2.5), "wowed": (0.95, 2.0), "confused": (0.95, 1.5), "doubtful": (0.90, 1.0),
        "thinking": (0.88, 0.5), "sincere": (0.95, 1.0), "deadpan": (1.0, 0.0), "neutral": (1.0, 1.0),
    },
    "bolt": {
        "neutral": (1.0, 0.0), "thinking": (0.90, -0.3), "sincere": (0.88, 0.3), "deadpan": (0.95, -0.5),
        "doubtful": (0.92, 0.2), "excited": (1.05, 0.8), "wowed": (0.95, 0.5), "confused": (0.95, 0.3),
    },
}
QUESTION_RISE = {"doubtful": 3.0, "confused": 2.5, "wowed": 2.0, "excited": 1.8, "thinking": 1.5}  # semitones
ELLIPSIS_PAUSE = {"thinking": 0.55, "wowed": 0.45, "doubtful": 0.42, "deadpan": 0.5}  # seconds; default 0.36
BREATH_BEFORE = {"excited", "wowed", "thinking"}

pipeline = KPipeline(lang_code="a")  # American English
FFMPEG = str(next(Path(__file__).resolve().parent.parent.glob("node_modules/ffmpeg-static/ffmpeg*")))


def pitch_shift(audio, semitones):
    """Change pitch with ffmpeg while keeping duration (so word timings stay valid)."""
    if abs(semitones) < 0.05 or len(audio) < 200:
        return audio
    f = 2 ** (semitones / 12)
    with tempfile.TemporaryDirectory() as d:
        a, b = Path(d) / "in.wav", Path(d) / "out.wav"
        sf.write(a, audio, SR)
        flt = f"asetrate={int(SR * f)},aresample={SR},atempo={1 / f:.5f}"
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", str(a), "-af", flt, str(b)], check=True)
        out, _ = sf.read(b, dtype="float32")
    return out


def synth_chunk(text, voice, speed):
    """Return (audio float32, [(word, start_s, end_s), ...]) for one text chunk."""
    chunks, words, offset = [], [], 0.0
    for result in pipeline(text, voice=voice, speed=speed):
        audio = getattr(result, "audio", None)
        if audio is None:
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
    toks = text.split()
    total = sum(len(t) for t in toks) or 1
    out, t0 = [], 0.0
    for t in toks:
        d = duration * len(t) / total
        out.append((t, t0, t0 + d))
        t0 += d
    return out


def trim(audio, thresh=0.01, keep=0.04):
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio, 0.0
    a = max(idx[0] - int(keep * SR), 0)
    b = min(idx[-1] + int(keep * SR), len(audio))
    return audio[a:b], a / SR


def rise_tail(audio, semis, rise):
    """Pitch the whole segment, then lift the last part further (question intonation)."""
    if rise <= 0 or len(audio) < int(0.3 * SR):
        return pitch_shift(audio, semis)
    tail = min(int(0.45 * SR), int(len(audio) * 0.4))
    head, end = audio[:-tail], audio[-tail:]
    xf = int(0.012 * SR)
    h, t = pitch_shift(head, semis), pitch_shift(end, semis + rise)
    fade = np.linspace(0, 1, xf, dtype=np.float32)
    if len(h) > xf and len(t) > xf:
        h[-xf:] = h[-xf:] * (1 - fade) + t[:xf] * fade
        t = t[xf:]
    return np.concatenate([h, t])


def breath(duration=0.2, seed=1):
    """Soft inhale: band-limited noise with a quick swell."""
    rng = np.random.default_rng(seed)
    n = int(duration * SR)
    spec = np.fft.rfft(rng.standard_normal(n))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    spec[(freqs < 300) | (freqs > 3200)] = 0
    noise = np.fft.irfft(spec, n).astype(np.float32)
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    out = noise * env
    return out / (np.max(np.abs(out)) or 1) * 0.07


def speak(speaker, text, emotion):
    """Synthesize one line with mood, ellipsis pauses and question intonation."""
    cfg = VOICES[speaker]
    mult, semis = MOODS[speaker].get(emotion, MOODS[speaker]["neutral"])
    speed = cfg["speed"] * mult
    segs = [s.strip() for s in re.split(r"\.\.\.|…", text) if s.strip()]
    rng = np.random.default_rng(zlib.crc32(text.encode()))
    gap = ELLIPSIS_PAUSE.get(emotion, 0.36)

    parts, words, cursor = [], [], 0.0
    for i, seg in enumerate(segs):
        audio, w = synth_chunk(seg, cfg["voice"], speed)
        audio, lead = trim(audio)
        w = [(a, max(s - lead, 0.0), max(e - lead, 0.0)) for a, s, e in w] or spread_words(seg, len(audio) / SR)
        last = i == len(segs) - 1
        rise = QUESTION_RISE.get(emotion, 1.5) if (last and seg.endswith("?")) else 0.0
        audio = rise_tail(audio, semis, rise)
        words += [(a, cursor + s, cursor + e) for a, s, e in w]
        parts.append(audio)
        cursor += len(audio) / SR
        if not last:
            pause = gap * float(rng.uniform(0.88, 1.15))
            parts.append(np.zeros(int(pause * SR), dtype=np.float32))
            cursor += pause
    return np.concatenate(parts), words


def render_dialogue(lines):
    """Build the full mix. Returns (mix, per-line timing records)."""
    mix = np.zeros(0, dtype=np.float32)
    records = []
    for line in lines:
        audio, words = speak(line["speaker"], line["text"], line["emotion"])
        # Soft breath tucked into the end of the previous pause
        if line["emotion"] in BREATH_BEFORE and len(mix) > int(0.12 * SR):
            b = breath(min(0.2, 0.9 * len(mix) / SR), seed=line["id"])
            mix[-len(b):] += b
        start = len(mix) / SR
        mix = np.concatenate([mix, audio])
        end = len(mix) / SR
        pause = float(line.get("pause_after", 0.3))
        mix = np.concatenate([mix, np.zeros(int(pause * SR), dtype=np.float32)])
        records.append({
            "id": line["id"], "speaker": line["speaker"], "emotion": line["emotion"],
            "camera": line["camera"], "text": line["text"],
            "start": round(start, 3), "end": round(end, 3), "audio": audio,
            "words": [{"w": w, "start": round(start + s, 3), "end": round(start + e, 3)} for w, s, e in words],
        })
        print(f"line {line['id']:>2} {line['speaker']:<4} {line['emotion']:<8} {end - start:5.2f}s")
    peak = float(np.max(np.abs(mix))) or 1.0
    return mix * (0.89 / peak), records


def run_full(video_dir):
    video = Path(video_dir)
    script = json.loads((video / "script.json").read_text(encoding="utf-8"))
    audio_dir = video / "audio"
    audio_dir.mkdir(exist_ok=True)
    mix, records = render_dialogue(script["lines"])
    for r in records:
        sf.write(audio_dir / f"line_{r['id']:02d}.wav", r.pop("audio"), SR)
    sf.write(audio_dir / "dialogue.wav", mix, SR)
    (video / "timings.json").write_text(
        json.dumps({"duration": round(len(mix) / SR, 3), "screen": script.get("screen", ""), "lines": records}, indent=2),
        encoding="utf-8",
    )
    print(f"total {len(mix) / SR:.1f}s")


def run_demo():
    out = Path("videos/_preview/voices")
    out.mkdir(parents=True, exist_ok=True)
    script = json.loads(Path("videos/001-olbers-paradox/script.json").read_text(encoding="utf-8"))
    picks = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}
    mix, _ = render_dialogue([l for l in script["lines"] if l["id"] in picks])
    sf.write(out / "demo_expressive.wav", mix, SR)
    print(f"wrote demo_expressive.wav {len(mix) / SR:.1f}s")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        run_demo()
    elif len(sys.argv) > 1:
        run_full(sys.argv[1])
    else:
        print(__doc__)
