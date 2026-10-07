# @mytutor/lesson-engine

Renders whiteboard lessons from JSON scripts (`lessonScriptSchema` in `@mytutor/schemas`)
with Remotion: handwritten text (Caveat), hand-drawn shapes, chalk hatching, a moving
chalk stick, subtitles, and the textbook source in the corner.

```bash
pnpm --filter @mytutor/lesson-engine render [lessons/<name>.json] [--theme blackboard|whiteboard]
```

Output: `out/<name>-<theme>.mp4` (gitignored).

- **Timing** comes from narration, not the script: each step lasts as long as its audio
  (estimated from text length until TTS is wired in), and drawing is spread across it.
- **Voice-over** is not wired yet (needs an Azure Speech or ElevenLabs key); pass real
  durations to `prepareLesson(script, font, durations)` when it is.
- **Chrome:** if the bundled headless shell crashes on macOS ("icudtl.dat not found"), render
  with an installed Chrome: `REMOTION_BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- **License:** Remotion needs a company license once the team is larger than 3 people.
