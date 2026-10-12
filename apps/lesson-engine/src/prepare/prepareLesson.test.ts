import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { lessonScriptSchema } from '@mytutor/schemas';
import opentype from 'opentype.js';
import { describe, expect, it } from 'vitest';
import { estimateSeconds, FPS, prepareLesson } from './prepareLesson';
import { layoutText, missingGlyphs, textWidth, tokenize } from './handwriting';

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

describe('dots and clean boards', () => {
  const twoBoards = lessonScriptSchema.parse({
    version: 1,
    topic: { number: '1.1', title: 'Rasional ədədlər' },
    source: { title: 'Riyaziyyat 7', printedPages: [9] },
    theme: 'blackboard',
    steps: [
      {
        id: 'first',
        narration: 'Birinci lövhə.',
        actions: [
          {
            type: 'write',
            id: 'word',
            text: 'a',
            at: { x: 200, y: 200 },
            size: 60,
            color: 'chalk',
          },
          { type: 'dot', id: 'point', at: { x: 400, y: 300 }, color: 'pink' },
        ],
      },
      {
        id: 'second',
        narration: 'Təmiz lövhə.',
        clear: true,
        actions: [
          {
            type: 'line',
            id: 'axis',
            from: { x: 100, y: 500 },
            to: { x: 900, y: 500 },
            color: 'chalk',
          },
        ],
      },
    ],
  });
  const prepared = prepareLesson(twoBoards, font);
  const second = prepared.steps[1];

  it('times a step by its narration audio and names the file', () => {
    const voiced = prepareLesson(
      twoBoards,
      font,
      { first: 3, second: 4.5 },
      { first: 'voice/x/first.mp3' },
    );
    const [first, second2] = voiced.steps;
    expect(first?.audio).toBe('voice/x/first.mp3');
    expect(second2?.audio).toBeUndefined();
    expect((first?.to ?? 0) - (first?.from ?? 0)).toBe(3 * FPS);
    expect((second2?.to ?? 0) - (second2?.from ?? 0)).toBe(4.5 * FPS);
  });

  it('draws a dot as a small filled circle', () => {
    const dot = prepared.actions.find((a) => a.id === 'point');
    expect(dot?.kind === 'stroke' && dot.filled).toBe(true);
    expect(dot?.box).toEqual({ x: 391, y: 291, width: 18, height: 18 });
  });

  it('wipes what was drawn before a clearing step, and draws after the wipe', () => {
    expect(second?.clear).toBe(true);
    for (const id of ['word', 'point'])
      expect(prepared.actions.find((a) => a.id === id)?.until).toBe(second?.from);
    const axis = prepared.actions.find((a) => a.id === 'axis');
    expect(axis?.until).toBeUndefined();
    expect(axis?.from).toBeGreaterThan((second?.from ?? 0) + 0.4 * FPS);
  });
});

describe('missingGlyphs', () => {
  it('names symbols the handwriting font cannot draw', () => {
    expect(missingGlyphs(font, ['N ⊂ Z ⊂ Q', 'a^2 ≠ b, |-3/4| = ¾'])).toEqual(['⊂']);
  });
});

describe('glyph path data', () => {
  it('writes every coordinate as a number, wherever the glyph is drawn', () => {
    // opentype.js' toPathData wrote "NaN" at some board positions (about one in eight).
    for (let x = 0; x < 1900; x += 7.3) {
      const { paths } = layoutText(font, 'Rasional ədədlər', { x, y: 190 }, 80, 'left');
      for (const p of paths) {
        expect(p.d).not.toContain('NaN');
        expect(Number.isFinite(p.length)).toBe(true);
      }
    }
  });
});

describe('handwriting near the origin', () => {
  it('lays out and measures text drawn at (0, 0)', () => {
    const text = 'Sıfırdan böyük ədədlər, müsbət kəsrlər';
    const { paths, box } = layoutText(font, text, { x: 0, y: 0 }, 44, 'left');
    for (const p of paths) expect(Number.isFinite(p.length)).toBe(true);
    expect(textWidth(font, text, 44)).toBeCloseTo(box.width);
  });
});
