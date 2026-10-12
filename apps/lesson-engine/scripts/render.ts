// Usage: pnpm --filter @mytutor/lesson-engine render [<lesson or scenario>.json] [--theme blackboard|whiteboard]
//          [--preview] [--quick] [--gl swangle|angle]
// Validates the lesson script, prepares frames, and renders an MP4 into out/.
// A scenario (topics/<n>/scenarios/<id>.json, beside the topic's knowledge) is laid out first,
// and only when every knowledge item it cites is approved; --preview renders it anyway, as a
// draft marked "QARALAMA", for the editor reviewing it. --quick renders at half size to check a
// lesson fast; --gl angle draws with the GPU (the default, swangle, draws in software).
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
  const lesson = prepareLesson(script, font);

  const outDir = join(root, 'out');
  const quick = args.includes('--quick');
  const name = `${basename(lessonPath, extname(lessonPath))}-${script.theme}${quick ? '-quick' : ''}`;
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, `${name}.lesson.json`), `${JSON.stringify(script, null, 2)}\n`);
  await writeFile(join(outDir, `${name}.prepared.json`), JSON.stringify(lesson));

  const publicDir = join(root, 'public');
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
