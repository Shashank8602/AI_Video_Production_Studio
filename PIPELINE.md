# PIPELINE.md — Rules for every video

The agent reads this file before every video. Each piece of feedback from the user becomes a new rule here, so quality improves over time. Rules marked **[MUST]** are never skipped.

## 1. Research

- **[MUST]** Use at least two independent, reputable sources per factual claim (NASA, universities, peer-reviewed work, major encyclopedias, established science media).
- **[MUST]** Save sources with title and URL in `research.md`; attach a source to each claim.
- Prefer well-established facts. Flag anything contested; do not present speculation as fact.
- Avoid medical, legal, or financial advice. For money and psychology topics, describe research findings, not instructions.
- Note one surprising fact and one common misconception as raw material for the hook and the twist.

## 2. Script

- **[MUST]** Length: about 14-18 lines, 75-95 spoken words total (50-60 s at a slow pace with about 0.8 s between turns). Never exceed 65 s.
- **[MUST]** Hook within the first 2 seconds: the first words are a question or a startling statement. Zib usually opens with the "why" question.
- **[MUST]** It is a quick back-and-forth, modeled on Morphy's reels. Alternate speakers every line; each line is 3-8 words (hard cap 10); simple words, one idea per line.
- Structure: Hook -> short setup -> the surprising answer -> the "so what" -> a punchy closing line from Bolt, then a cut to black. No outro, no "like and subscribe".
- Each line is a question, a reaction, an explanation, or a joke setup/payoff. Cut anything that is none of these.
- One sincere beat per video, where the wonder or the point lands without a joke.
- Zib asks what the audience is thinking, reacts honestly, and sometimes misunderstands. Bolt explains plainly, corrects with dry humor, and uses analogies, not jargon.
- Numbers: round them and say them naturally ("about thirteen point eight billion years").
- Write for the ear: short sentences, contractions, no hard-to-pronounce terms without a respelling in `script.json`.
- **[MUST]** Output `script.md` (readable) and `script.json` (machine-readable: scene, speaker, line, emotion, camera, pause_after). **Stop and wait for user approval.**

## 3. Voice

- **[MUST]** Two distinct voices: Zib higher and more excited; Bolt lower and deadpan.
- Generate one audio file per line; never one file per video.
- Gaps are set by hand in `script.json`: about 0.18 s for a quick reply, about 0.45 s before a considered answer, up to 0.7 s for a dramatic beat.
- Laughs are short, closed-mouth chuckles, not long laughs.
- Normalize final mix to about -14 LUFS; peak under -1 dBTP.
- Re-listen to any line that sounds off; rewrite punctuation or spelling for pronunciation before re-generating.

### Dialogue pattern (proven in video 001; follow this level of simplicity)

- **Zib thinks in small steps, out loud.** His lines are the viewer's own thoughts: "There are so many stars." "So... shouldn't it be bright?" "Why not?" Two to six words, often a question.
- **Zib offers the comparison himself.** He says the everyday picture ("Like a letter in the mail?") and Bolt confirms it ("Yes!"). The viewer feels they worked it out.
- **Bolt confirms, then adds exactly one small fact.** Open with "Yes." / "Exactly." / "It should. But it isn't.", then one short sentence. He only answers the last question and never jumps ahead.
- **Every line answers the line before it.** No topic jumps, no two new ideas in a row. If a step feels big, add a tiny Zib question ("Why not?") to slow it down.
- **The reveal is a restatement.** Zib repeats the idea in his own words as a question ("Ohh! It hasn't arrived yet?") and Bolt answers "Not yet." plus the result.
- **Close with a recap, an image, then a joke.** Zib recaps in about five words ("So I'm seeing old light."); Bolt gives one sincere picture ("Every star is a message from the past."); Zib makes a joke that echoes the topic ("still loading?"); Bolt shuts it down in one line.
- **Words are everyday words only.** Light, stars, letter, mail, dark, bright. No numbers, ages, or terms like redshift or paradox.

### Voice moods (v2)

- Each script line has a mood: neutral, excited, wowed, confused, doubtful, thinking, sincere, deadpan. The mood sets the voice speed and pitch and also the character's face and gestures.
- Fillers and "..." pauses are written into the script ("Hmm," "Ohh!" "Whoa..."); the voice engine turns "..." into a short pause.
- Questions get a rising pitch at the end; pause lengths vary slightly; a soft breath sits before excited, wowed and thinking lines.
- Zib: af_nicole, brighter and faster when excited. Bolt: blend of am_eric and af_nicole, calm and mentor-like (speed 0.83; Zib 0.92).

## 4. Timing and subtitles

- Get word-level timings by forced alignment of each audio file; store in `timings.json`.
- Subtitles: large, high contrast, two lines at most, placed above the vertical center of the frame (clear of Instagram's bottom UI). Highlight the current word.
- Keep text inside a 1080x1920 safe zone: 64 px side margins; nothing in the bottom 380 px or the top 220 px.

## 5. Scene, camera, animation

- **[MUST]** The room and both characters are identical in every video; only the gags and props on the screen change.
- Cameras: a wide two-shot (default), a close-up on Zib, a close-up on Bolt, and an over-the-shoulder reaction shot. Cut on speaker changes or beats; never hold one angle longer than about 5 s.
- Use slow push-ins on important lines; avoid shaky or fast camera moves.
- Mouth movement is driven by the audio timing; eyes blink every 2-5 s; small idle motion at all times.
- Props or a screen in the room may show a simple visual for the topic (stars, a diagram). Keep it readable at phone size.
- End on a cut to black right after the last punchline.

## 6. Render

- Check one still of each camera angle before the full render; fix problems first.
- Full render: 1080x1920, 30 fps, offline frame-by-frame capture (not real-time), then ffmpeg encode with H.264 and AAC, yuv420p, faststart.
- Keep the scene light for the MX450: no heavy post-processing, limited shadows, simple materials.

## 7. QA checklist (before delivery)

- [ ] Length 50-60 s, ends cleanly
- [ ] Hook lands in the first 2 s
- [ ] Every fact matches `research.md`
- [ ] Both voices clear; no clipping; consistent loudness
- [ ] Subtitles match audio, readable, within the safe zone
- [ ] Lip movement and cuts line up with audio
- [ ] No visual glitches (clipping, flicker, stretched text)
- [ ] No copyrighted music or third-party assets

## 8. Delivery

Produce in the video's folder: `final.mp4`, `caption.txt` (a hook line, two or three sentences, 5-8 hashtags), `sources.md`. Remind the user to turn on Instagram's AI label before posting.

## 9. Learned rules (add user feedback here)

*(empty — populated after the first video review)*
