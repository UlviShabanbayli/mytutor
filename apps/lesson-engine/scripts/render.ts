// Usage: pnpm --filter @mytutor/lesson-engine render [lessons/<name>.json] [--theme blackboard|whiteboard]
// Validates the lesson script, prepares frames, and renders an MP4 into out/.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { lessonScriptSchema } from '@mytutor/schemas';
import opentype from 'opentype.js';
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
  const script = lessonScriptSchema.parse(JSON.parse(await readFile(lessonPath, 'utf8')));
  if (args.includes('--theme') && (themeArg === 'blackboard' || themeArg === 'whiteboard'))
    script.theme = themeArg;

  const handwriting = await readFile(
    fontFile('@expo-google-fonts/caveat', '600SemiBold/Caveat_600SemiBold.ttf'),
  );
  const font = opentype.parse(
    handwriting.buffer.slice(
      handwriting.byteOffset,
      handwriting.byteOffset + handwriting.byteLength,
    ),
  );
  const lesson = prepareLesson(script, font);

  const outDir = join(root, 'out');
  const name = `${basename(lessonPath, extname(lessonPath))}-${script.theme}`;
  await mkdir(outDir, { recursive: true });
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
  const chromiumOptions = { gl: 'swangle' } as const;
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
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps,
    chromiumOptions,
    browserExecutable,
    logLevel: process.env.RENDER_LOG === 'verbose' ? 'verbose' : 'info',
  });
  console.log(`Hazırdır: ${outputLocation}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
