# Project Plan

## 1. Goal

Produce engaging ~60-second educational videos for an Instagram page called **Why Though**, covering broad topics (science and universe, psychology, technology and AI, history and mysteries, money and human behavior) with minimal manual work and zero service cost.

## 2. Format

- Two recurring hosts in one fixed low-poly room, filmed from several virtual camera angles.
  - **Zib**: curious alien; asks, reacts, says "why though?".
  - **Bolt**: dry robot; explains, corrects, delivers the punchline.
- The hosts talk to each other proactively; it is a conversation, not narration over visuals.
- Vertical 1080x1920, 30 fps, about 60 seconds, burned-in subtitles.

## 3. Workflow per video

| # | Step | Who | Output |
|---|---|---|---|
| 1 | Idea given | User | One-line topic |
| 2 | Research | Claude | `research.md` with sourced facts |
| 3 | Script | Claude | `script.json` (scenes, speaker, line, emotion, camera) and `script.md` (readable) |
| 4 | **Script review** | **User** | Approve or request changes (hard stop) |
| 5 | Voice generation | Pipeline | One WAV per line, two distinct voices |
| 6 | Word timing | Pipeline | `timings.json` for subtitles and mouth animation |
| 7 | Still-frame check | Claude | PNGs of each shot, checked before the full render |
| 8 | Full render | Pipeline | Frames -> MP4 with mixed audio |
| 9 | QA | Claude | Checklist in PIPELINE.md |
| 10 | Delivery | Claude | `final.mp4`, `caption.txt`, `sources.md` |
| 11 | Upload | User | Manual post, with Instagram's AI label on |

Nothing is rendered until step 4 is approved.

## 4. Architecture

```
AI_Video_Production_Studio/
  README.md  PLAN.md  PIPELINE.md  CHARACTERS.md  TOOLS.md  TOPICS.md   <- docs (this stage)
  scene/            three.js room, characters, cameras      (built later)
  tts/              Python: Kokoro voices + word alignment  (built later)
  render/           headless-browser frame capture + ffmpeg (built later)
  videos/
    001-olbers-paradox/
      research.md  script.md  script.json
      audio/  timings.json  frames/  final.mp4  caption.txt  sources.md
```

Data flow: `script.json` -> TTS -> `timings.json` -> scene player (drives camera cuts, mouth and gesture animation, subtitles from timings) -> frame capture -> ffmpeg (video + audio, loudness normalized to about -14 LUFS).

## 5. Build order (after approval)

1. **Environment check**: confirm or install Node.js, Python, ffmpeg.
2. **Room and characters**: build Zib, Bolt, and the room; review still images.
3. **Voice test**: one line per host in two or three candidate voices; pick the best.
4. **Pipeline end to end** on the first video (below), including timing, camera cuts, subtitles.
5. **Review and tune**: your feedback becomes new rules in PIPELINE.md.
6. **Repeat** for further topics; consider batch mode later.

## 6. First video

Topic: **"If there are infinite stars, why is the night sky dark?"** (Olbers' paradox). It has a strong hook, a surprising answer, and clear visuals. See TOPICS.md for alternatives.

## 7. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Free TTS sounds less natural than paid | Test voices first; tune pacing and punctuation; keep lines short |
| Factual errors | Sourced research file; user script review; avoid unverifiable claims |
| MX450 is weak (about 2 GB VRAM) | Low-poly scene, no heavy shaders, TTS on CPU; render offline frame by frame |
| Render slow | Stills check before the full render; 1080p only at final |
| Character/IP issues | Original characters; no Morphy or Claude mascot |
| Instagram AI-label rules | Turn the label on at upload; noted in delivery checklist |
| Format fatigue | Vary hooks, topics, and gags; keep PIPELINE.md rules evolving |
| Free-tool licences change | Record licence per tool in TOOLS.md; recheck before monetizing |

## 8. Out of scope (for now)

- Automatic posting to Instagram.
- Multiple rooms or character sets.
- Paid services (ElevenLabs, cloud GPUs, paid stock media).
- Voice cloning.

## 9. Approval checklist

- [ ] Characters Zib and Bolt are approved
- [ ] The workflow and the script-review hard stop are approved
- [ ] Free tool stack in TOOLS.md is acceptable
- [ ] First topic (Olbers' paradox) is approved, or a different one chosen
- [ ] OK to check the machine for Node, Python, ffmpeg and install what is missing

## 10. Orchestration decision

- **Now:** file-based state. Each video folder holds a `state.json` recording the current stage and the paths of its outputs. Claude does research and scripting directly in conversation; the user reviews scripts.
- **Mechanical stages** (voice, timing, render, encode) are built as standalone, scriptable steps so they can be wrapped later.
- **Later (after judging video quality):** optionally add LangGraph for stage orchestration, checkpointed state, the script-approval interrupt, retries, and batch runs.
- **If LangGraph is added:** the research and scripting nodes could call Claude Code headlessly (`claude -p`). This uses the Claude plan's usage limits (or API billing), so check Anthropic's terms for automated use and watch usage before running batches. A free API-tier model is the alternative, with likely lower script quality.
