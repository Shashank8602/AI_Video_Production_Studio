# Why Though — AI Video Production Studio

A free, local pipeline that turns a single idea into a ~60-second vertical video (Instagram Reels) in which two animated hosts, **Zib** and **Bolt**, explain it as a conversation.

**Status: planning.** No code has been written. These documents are for review. Production of the first video starts only after approval.

## Documents

| File | Purpose |
|---|---|
| [PLAN.md](PLAN.md) | Goals, scope, architecture, build order, risks, approval checklist |
| [PIPELINE.md](PIPELINE.md) | The rules the agent follows for every video (script, voice, camera, render, QA). Grows with feedback |
| [CHARACTERS.md](CHARACTERS.md) | Zib, Bolt, the room, voices, and visual style |
| [TOOLS.md](TOOLS.md) | Free tool stack, why each was chosen, hardware notes, setup checklist |
| [TOPICS.md](TOPICS.md) | Content niches, first topic, and an idea backlog |

## One-line summary

Idea -> research -> two-voice script -> **you review** -> free TTS voices -> word timing -> 3D scene render with camera cuts -> final MP4 + caption + sources.

## Constraints

- Every service and tool must be free.
- Hardware: NVIDIA MX450 (about 2 GB VRAM), so the scene stays lightweight and TTS runs on CPU.
- Original characters only (not Morphy's or Anthropic's mascots).
- The user approves every script before production, and posts manually.
