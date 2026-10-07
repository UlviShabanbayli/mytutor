import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { lessonScriptSchema } from '@mytutor/schemas';
import opentype from 'opentype.js';
import { describe, expect, it } from 'vitest';
import { estimateSeconds, FPS, prepareLesson } from './prepareLesson';
import { tokenize } from './handwriting';

const require = createRequire(import.meta.url);
const fontPath = join(
  dirname(require.resolve('@expo-google-fonts/caveat/package.json')),
  '600SemiBold/Caveat_600SemiBold.ttf',
);
const buf = readFileSync(fontPath);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const script = lessonScriptSchema.parse(
  JSON.parse(readFileSync(new URL('../../lessons/cemin-kvadrati.json', import.meta.url), 'utf8')),
);

describe('prepareLesson', () => {
  const lesson = prepareLesson(script, font);

  it('produces only finite frame numbers and path lengths', () => {
    for (const a of lesson.actions) {
      expect(Number.isFinite(a.from) && Number.isFinite(a.to)).toBe(true);
      expect(a.to).toBeGreaterThan(a.from);
      if (a.kind === 'stroke')
        for (const p of a.paths) expect(Number.isFinite(p.length)).toBe(true);
    }
  });

  it('keeps every action inside its step, in order', () => {
    for (const step of lesson.steps) {
      const ids = script.steps.find((s) => s.id === step.id)?.actions.map((a) => a.id) ?? [];
      for (const a of lesson.actions.filter((x) => ids.includes(x.id))) {
        expect(a.from).toBeGreaterThanOrEqual(step.from);
        expect(a.to).toBeLessThanOrEqual(step.to);
      }
    }
  });

  it('uses TTS durations when given', () => {
    const timed = prepareLesson(script, font, { question: 2 });
    expect(timed.steps[0]?.to).toBe(2 * FPS);
    expect(estimateSeconds('x'.repeat(30))).toBe(2);
  });

  it('stays within the 15–20 second demo length', () => {
    const seconds = lesson.durationInFrames / lesson.fps;
    expect(seconds).toBeGreaterThanOrEqual(15);
    expect(seconds).toBeLessThanOrEqual(20);
  });
});

describe('tokenize', () => {
  it('marks superscripts', () => {
    expect(tokenize('b^2').map((t) => `${t.char}${t.sup ? '↑' : ''}`)).toEqual(['b', '2↑']);
  });
});
