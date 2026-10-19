# Why Though — project rules for Claude

Free, local pipeline that turns one idea into a ~60 s vertical video (1080x1920) where two animated hosts, **Zib** (curious alien) and **Bolt** (calm robot teacher), explain it as a conversation in one fixed cozy room. Details live in README.md, PLAN.md, PIPELINE.md, CHARACTERS.md, TOOLS.md.

## Script rules (most important)

Model the conversation on Morphy's reels: simple, a little slow, and a quick to-and-fro.

- **Simple words.** Write for a 12-year-old. No jargon unless Zib asks what it means. One idea per line.
- **One idea per video.** Pick the single easiest explanation and drop the rest (numbers, extra causes, side facts). Use one everyday comparison (a letter in the mail, a ball, a lamp) that Zib can say out loud. If the user says it is hard to follow, simplify further.
- **Short lines.** Each line is 3-8 words. Hard cap: 10 words. If a line needs more, split it into two turns.
- **Strict back-and-forth.** Zib and Bolt alternate every line. Never let one character speak twice in a row or deliver a mini-lecture.
- **Zib asks, Bolt answers.** Zib voices the audience's doubt ("An age? So?"). Bolt gives one small fact at a time, with a plain comparison when useful.
- **Length.** About 14-18 lines, 75-95 words total, 50-60 s at a slow pace with generous pauses. Never exceed 65 s.
- **Hook.** The first line is a short question from Zib (under 8 words) in the first 2 seconds.
- **Ending.** One sincere beat, then a short deadpan punchline from Bolt, then cut to black. No outro.
- **Keep it true.** Every claim comes from `research.md` with sources. Drop details (like redshift) rather than make the script complicated.
- **Moods and fillers.** Tag each line with a mood (neutral, excited, wowed, confused, doubtful, thinking, sincere, deadpan). Use light fillers ("Hmm.", "Ohh!", "Whoa...") sparingly.
- **Review stop.** Show the script to the user and wait for approval before any voice or render.

### Dialogue pattern (proven in video 001; follow this level of simplicity)

- **Zib thinks in small steps, out loud.** His lines are the viewer's own thoughts: "There are so many stars." "So... shouldn't it be bright?" "Why not?" Two to six words, often a question.
- **Zib offers the comparison himself.** He says the everyday picture ("Like a letter in the mail?") and Bolt confirms it ("Yes!"). The viewer feels they worked it out.
- **Bolt confirms, then adds exactly one small fact.** Open with "Yes." / "Exactly." / "It should. But it isn't.", then one short sentence. He only answers the last question and never jumps ahead.
- **Every line answers the line before it.** No topic jumps, no two new ideas in a row. If a step feels big, add a tiny Zib question ("Why not?") to slow it down.
- **The reveal is a restatement.** Zib repeats the idea in his own words as a question ("Ohh! It hasn't arrived yet?") and Bolt answers "Not yet." plus the result.
- **Close with a recap, an image, then a joke.** Zib recaps in about five words ("So I'm seeing old light."); Bolt gives one sincere picture ("Every star is a message from the past."); Zib makes a joke that echoes the topic ("still loading?"); Bolt shuts it down in one line.
- **Words are everyday words only.** Light, stars, letter, mail, dark, bright. No numbers, ages, or terms like redshift or paradox.

## Voice rules

- Free Kokoro voices on CPU. Zib: `af_nicole`, brighter and livelier when excited. Bolt: blend `am_eric,af_nicole`, calm, mentor-like.
- Pace is slow and clear, like agentmorphy: Zib speed about 0.92, Bolt about 0.83. Leave about 0.8 s between turns (1.0 s before wow moments, 1.1 s before the sincere line) so each reply can sink in.
- Moods set speed and pitch; "..." becomes a short pause; questions rise at the end; soft breath before excited, wowed and thinking lines.

## Visual rules

- One fixed room, same every video. Characters are original (never Morphy's or Anthropic's mascots).
- Zib has arms, brows, blush and glowing spots. Bolt is the original boxy grey robot with brow bars and expressive eyes and mouth. Do not redesign them without being asked.
- Cut cameras on speaker changes but not on every line; use the wide shot every 3-4 lines. Poses (stand, sit, lie) change only at camera cuts.
- Subtitles above the vertical center, inside the 1080x1920 safe zone.

## Working rules

- Everything must stay free of cost.
- Do not commit or push to GitHub unless the user asks.
- Preview with `node stills.mjs [scenario]`; render on the GPU (Chrome via ANGLE/D3D11), about 0.3 s per frame. Voice: `tts/.venv/Scripts/python.exe tts/synth.py videos/<id>`.
- Send previews and finished videos to the user with SendUserFile; they review on a phone.
- Keep PIPELINE.md and this file in sync when rules change.
