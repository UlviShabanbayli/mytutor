// Usage: pnpm --filter @mytutor/lesson-engine render [<lesson or scenario>.json] [--theme blackboard|whiteboard]
//          [--preview] [--quick] [--gl swangle|angle] [--voice]
// Validates the lesson script, prepares frames, and renders an MP4 into out/.
// A scenario (topics/<n>/scenarios/<id>.json, beside the topic's knowledge) is laid out first,
// and only when every knowledge item it cites is approved; --preview renders it anyway, as a
// draft marked "QARALAMA", for the editor reviewing it. --quick renders at half size to check a
// lesson fast; --gl angle draws with the GPU (the default, swangle, draws in software).
// --voice narrates each step with ElevenLabs (ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in the
// repo-root .env; ELEVENLABS_MODEL defaults to eleven_v3) and times the step by its audio;
// speech is cached in .voice-cache, so a render pays only for narration it has not heard.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import {
  knowledgeDocumentSchema,
  lessonScenarioSchema,
  lessonScriptSchema,
  topicReviewSchema,
} from '@mytutor/schemas';
import type { LessonScript } from '@mytutor/types';
import opentype from 'opentype.js';
import { unapprovedSources } from '../src/compile/approval';
import { compileScenario } from '../src/compile/compileScenario';
import { missingGlyphs, textWidth } from '../src/prepare/handwriting';
import { prepareLesson } from '../src/prepare/prepareLesson';
import { cachedSpeech, elevenLabs } from '../src/voice/elevenlabs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const fontFile = (pkg: string, file: string) =>
  join(dirname(require.resolve(`${pkg}/package.json`)), file);

async function main() {
  const args = process.argv.slice(2);
  const lessonPath = resolve(
    root,
    args.find((a) => a.endsWith('.json')) ?? 'lessons/cemin-kvadrati.json',
  );
  const themeArg = args[args.indexOf('--theme') + 1];
  const handwriting = await readFile(
    fontFile('@expo-google-fonts/caveat', '600SemiBold/Caveat_600SemiBold.ttf'),
  );
  const font = opentype.parse(
    handwriting.buffer.slice(
      handwriting.byteOffset,
      handwriting.byteOffset + handwriting.byteLength,
    ),
  );
  const raw: unknown = JSON.parse(await readFile(lessonPath, 'utf8'));
  const script =
    raw && typeof raw === 'object' && 'scenes' in raw
      ? await fromScenario(raw, lessonPath, font, args.includes('--preview'))
      : lessonScriptSchema.parse(raw);
  if (args.includes('--theme') && (themeArg === 'blackboard' || themeArg === 'whiteboard'))
    script.theme = themeArg;
  const texts = script.steps.flatMap((s) =>
    s.actions.flatMap((a) => (a.type === 'write' ? [a.text] : [])),
  );
  const missing = missingGlyphs(font, texts);
  if (missing.length)
    throw new Error(
      `Lövhə şrifti bu simvolları çəkə bilmir: ${missing.join(' ')}. Onları sözlə yazın.`,
    );
  const quick = args.includes('--quick');
  const name = `${basename(lessonPath, extname(lessonPath))}-${script.theme}${quick ? '-quick' : ''}`;
  const publicDir = join(root, 'public');
  const voice = args.includes('--voice') ? await narrate(script, name, publicDir) : null;
  const lesson = prepareLesson(script, font, voice?.durations, voice?.audio);

  const outDir = join(root, 'out');
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, `${name}.lesson.json`), `${JSON.stringify(script, null, 2)}\n`);
  await writeFile(join(outDir, `${name}.prepared.json`), JSON.stringify(lesson));

  await mkdir(join(publicDir, 'fonts'), { recursive: true });
  await copyFile(
    fontFile('@expo-google-fonts/nunito', '600SemiBold/Nunito_600SemiBold.ttf'),
    join(publicDir, 'fonts', 'Nunito_600SemiBold.ttf'),
  );

  console.log(
    `${script.steps.length} addım, ${(lesson.durationInFrames / lesson.fps).toFixed(1)} s. Render edilir…`,
  );
  const serveUrl = await bundle({ entryPoint: join(root, 'src/video/index.ts'), publicDir });
  const inputProps = { lesson };
  const glArg = args[args.indexOf('--gl') + 1];
  const gl =
    args.includes('--gl') && (glArg === 'angle' || glArg === 'swangle') ? glArg : 'swangle';
  const chromiumOptions = { gl } as const;
  // Optional: render with an installed Chrome when the bundled headless shell misbehaves.
  const browserExecutable = process.env.REMOTION_BROWSER ?? null;
  const composition = await selectComposition({
    serveUrl,
    id: 'Lesson',
    inputProps,
    chromiumOptions,
    browserExecutable,
    logLevel: process.env.RENDER_LOG === 'verbose' ? 'verbose' : 'info',
  });
  const outputLocation = join(outDir, `${name}.mp4`);
  let reported = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    scale: quick ? 0.5 : 1,
    onProgress: ({ progress, renderedFrames, renderEstimatedTime }) => {
      const percent = Math.floor(progress * 100);
      if (percent < reported + 5 && percent < 100) return;
      reported = percent;
      const left = Math.ceil(renderEstimatedTime / 60000);
      console.log(
        `Render: ${percent}% · ${renderedFrames}/${composition.durationInFrames} kadr` +
          (percent < 100 ? ` · qalan ~${left} dəq` : ''),
      );
    },
    inputProps,
    chromiumOptions,
    browserExecutable,
    logLevel: process.env.RENDER_LOG === 'verbose' ? 'verbose' : 'info',
  });
  console.log(`Hazırdır: ${outputLocation}`);
}

/** Speaks every step with ElevenLabs into public/voice/<name>/; returns lengths and files. */
async function narrate(script: LessonScript, name: string, publicDir: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId)
    throw new Error(
      '--voice: ELEVENLABS_API_KEY və ELEVENLABS_VOICE_ID repo kökündəki .env-də olmalıdır',
    );
  const model = process.env.ELEVENLABS_MODEL ?? 'eleven_v3';
  const speak = cachedSpeech(
    elevenLabs({ apiKey, voiceId, model, language: process.env.ELEVENLABS_LANGUAGE }),
    join(root, '.voice-cache'),
    `${voiceId}|${model}`,
  );
  const dir = join(publicDir, 'voice', name);
  await mkdir(dir, { recursive: true });
  const durations: Record<string, number> = {};
  const audio: Record<string, string> = {};
  for (const step of script.steps) {
    const speech = await speak(step.narration);
    await writeFile(join(dir, `${step.id}.mp3`), speech.audio);
    durations[step.id] = speech.seconds;
    audio[step.id] = `voice/${name}/${step.id}.mp3`;
  }
  console.log(
    `Səs: ${script.steps.length} addım, ${Object.values(durations)
      .reduce((a, b) => a + b, 0)
      .toFixed(1)} s`,
  );
  return { durations, audio };
}

/** Lays a scenario out, after checking it cites only approved knowledge of its topic. */
async function fromScenario(
  raw: unknown,
  path: string,
  font: opentype.Font,
  preview: boolean,
): Promise<LessonScript> {
  const scenario = lessonScenarioSchema.parse(raw);
  const topicDir = resolve(dirname(path), '..');
  const doc = knowledgeDocumentSchema.parse(
    JSON.parse(await readFile(join(topicDir, 'knowledge', 'knowledge.json'), 'utf8')),
  );
  const review = await readFile(join(topicDir, 'review.json'), 'utf8').then(
    (text) => topicReviewSchema.parse(JSON.parse(text)),
    () => null,
  );
  const { missing, unapproved } = unapprovedSources(scenario, doc, review);
  if (missing.length) throw new Error(`Mövzuda olmayan bilik elementləri: ${missing.join(', ')}`);
  if (unapproved.length && !preview)
    throw new Error(
      `Təsdiqlənməmiş bilik elementləri: ${unapproved.join(', ')}. Review-da təsdiqləyin, ` +
        'və ya --preview ilə qaralama render edin.',
    );
  const script = compileScenario(scenario, (text, size) => textWidth(font, text, size));
  if (unapproved.length) {
    console.log(`QARALAMA: ${unapproved.length} element təsdiqlənməyib (${unapproved.join(', ')})`);
    script.source = { ...script.source, title: `${script.source.title} · QARALAMA` };
  }
  return script;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
