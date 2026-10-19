# Tool Stack (all free)

Licences and versions are noted from memory and must be re-verified at setup time, and again before monetizing.

| Need | Tool | Why | Notes |
|---|---|---|---|
| Research and scripting | Claude Code (this agent) + web search | Already available | Sources saved per video |
| 3D room and characters | three.js (Node.js) | Free, runs in the browser, simple low-poly scenes | Light on the GPU |
| Voices | **Kokoro-82M** (Python) | Open licence (Apache 2.0), good quality, runs on CPU, several voices | Primary choice; test 2-3 voices first |
| Voice fallback | Piper | Very fast, offline | Less natural; check licence |
| Word timing | faster-whisper or stable-ts (open source) | Forced alignment of audio to text for subtitles and mouth sync | CPU is fine for 60 s clips |
| Frame capture | Headless Chromium via Puppeteer or Playwright | Renders the three.js scene frame by frame | Deterministic, offline, not real-time |
| Video encode / audio mix | ffmpeg | Standard, free | Loudness to about -14 LUFS |
| Version control | git + GitHub | Already available | Repo: AI_Video_Production_Studio |

## Rejected options

- **ElevenLabs:** commercial use requires a paid plan.
- **Coqui XTTS:** non-commercial licence.
- **Chatterbox / F5-TTS:** heavy for 2 GB VRAM; some weights are non-commercial.
- **Edge TTS:** natural-sounding but an unofficial route with unclear terms; could break or be blocked.

## Hardware notes (NVIDIA MX450, about 2 GB VRAM)

- Fine for a simple low-poly three.js scene.
- Not suitable for heavy AI video or voice models, so TTS runs on CPU.
- Render time is expected to be a few minutes per 60-second video; to be measured.

## Setup checklist (done only after approval)

- [ ] Check Node.js, Python 3, ffmpeg, git are installed (versions)
- [ ] Install missing tools
- [ ] Install Kokoro and its dependencies in a virtual environment
- [ ] Install Puppeteer or Playwright with Chromium
- [ ] Run a smoke test: one TTS line, one three.js frame, one ffmpeg encode
- [ ] Record versions and licences here

## Risks to monitor

- Free TTS quality; model downloads need disk space (a few hundred MB at most).
- Package versions or licence changes.
- Windows path/permission quirks with ffmpeg and Chromium.
