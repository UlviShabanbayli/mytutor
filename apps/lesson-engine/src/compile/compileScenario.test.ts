import { lessonScenarioSchema, lessonScriptSchema } from '@mytutor/schemas';
import type { LessonAction } from '@mytutor/types';
import { describe, expect, it } from 'vitest';
import { AREA, compileScenario } from './compileScenario';

/** About half an em per character, like the handwriting font. */
const measure = (text: string, size: number) => text.length * size * 0.45;

const scenario = (scenes: unknown[]) =>
  lessonScenarioSchema.parse({
    schemaVersion: 1,
    id: 'scv_abcdefghij',
    version: 1,
    status: 'draft',
    topic: { bookId: 'book', number: '1.1', title: 'Rasional ədədlər' },
    source: { title: 'Riyaziyyat 7, 1-ci hissə', printedPages: [9] },
    author: 'test',
    createdAt: '2026-10-12T00:00:00.000Z',
    scenes,
  });

const numberLine = {
  kind: 'numberLine',
  from: -2,
  to: 2,
  parts: 4,
  labels: [{ at: -0.75, text: '-3/4' }],
  points: [
    { at: -0.75, label: 'A', color: 'pink' },
    { at: 0.75, label: 'B', color: 'blue' },
  ],
  sources: ['k013'],
};

const find = (actions: LessonAction[], id: string) => actions.find((a) => a.id === id);

describe('compileScenario', () => {
  it('places number line points by their value and labels the integers', () => {
    const script = compileScenario(
      scenario([
        { id: 'opposites', narration: 'Əks ədədlər.', board: [numberLine], sources: ['k011'] },
      ]),
      measure,
    );
    expect(() => lessonScriptSchema.parse(script)).not.toThrow();
    const actions = script.steps[0]?.actions ?? [];
    const a = find(actions, 'opposites-0-point-0');
    const b = find(actions, 'opposites-0-point-1');
    const zero = find(actions, 'opposites-0-tick-0');
    if (a?.type !== 'dot' || b?.type !== 'dot' || zero?.type !== 'line') throw new Error('missing');
    // -3/4 and 3/4 lie the same distance either side of 0.
    expect(zero.from.x - a.at.x).toBeCloseTo(b.at.x - zero.from.x);
    // Quarter ticks from -2 to 2, and integer labels except where a label was given.
    expect(actions.filter((x) => x.id.includes('-tick-'))).toHaveLength(17);
    expect(
      actions.filter((x) => x.id.includes('-n-')).map((x) => x.type === 'write' && x.text),
    ).toEqual(['-2', '-1', '0', '1', '2']);
  });

  it('wraps prose to the board width and keeps mathematics on one line', () => {
    const long =
      'Müsbət kəsr ədədin əksi mənfi kəsrdir və tam ədədlərdə olduğu kimi qarşılıqlı əks olan kəsr ədədlər də yalnız işarəsi ilə fərqlənir.';
    const script = compileScenario(
      scenario([
        {
          id: 'def',
          narration: 'Tərif.',
          board: [
            { kind: 'text', text: long, sources: ['k008'] },
            { kind: 'math', text: '-a/b = (-a)/b = a/(-b)', sources: ['k027'] },
          ],
          sources: ['k008'],
        },
      ]),
      measure,
    );
    const writes = (script.steps[0]?.actions ?? []).filter((a) => a.type === 'write');
    expect(writes.length).toBeGreaterThan(2);
    for (const w of writes)
      if (w.type === 'write')
        expect(w.at.x + measure(w.text, w.size)).toBeLessThanOrEqual(AREA.right);
  });

  it('starts a clean board when asked, or when the next scene does not fit', () => {
    const scene = (id: string, clear = false) => ({
      id,
      narration: 'Səhnə.',
      clear,
      board: [{ kind: 'heading', text: 'Başlıq', sources: ['k001'] }, numberLine, numberLine],
      sources: ['k001'],
    });
    const script = compileScenario(
      scenario([scene('one'), scene('two'), scene('three', true)]),
      measure,
    );
    expect(script.steps.map((s) => s.clear)).toEqual([false, true, true]);
  });

  it('refuses a scene that cannot fit on one board', () => {
    const board = Array.from({ length: 5 }, () => numberLine);
    expect(() =>
      compileScenario(
        scenario([{ id: 'big', narration: 'Çox.', board, sources: ['k001'] }]),
        measure,
      ),
    ).toThrow(/does not fit on one board/);
  });

  it('rejects a number line point outside its range', () => {
    expect(() =>
      scenario([
        {
          id: 'bad',
          narration: 'Səhv.',
          board: [{ ...numberLine, points: [{ at: 3, label: 'X', color: 'pink' }] }],
          sources: ['k001'],
        },
      ]),
    ).toThrow(/outside/);
  });
});
