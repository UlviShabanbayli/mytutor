import { describe, expect, it } from 'vitest';
import { classifyHeadings, type HeadingEvent } from './classify';
import { buildStructure, validate } from './structure';
import type { TextItem, TextLine } from './types';

const HEIGHT = 800;
const line = (page: number, y: number, size: number, text: string): TextLine => ({
  page,
  y,
  size,
  minSize: size,
  x: 100,
  width: 200,
  text,
});
const badge = (page: number, y: number): TextItem => ({
  page,
  y,
  size: 22,
  x: 60,
  width: 30,
  text: '\u001f\u001e',
  isLabel: true,
  decoded: false,
});

describe('classifyHeadings', () => {
  const lines = [
    line(9, 600, 32, 'Müxtəsər vurma'),
    line(9, 562, 32, 'düsturları'),
    line(10, 714, 22, 'İlkin yoxlama'),
    line(11, 720, 22, 'Cəmin və fərqin kubu.'),
    line(11, 694, 22, 'Kublar cəmi'),
    line(11, 600, 16, 'Kubların cəmi'),
    line(12, 500, 16, 'MƏSƏLƏ VƏ MİSALLAR'),
    line(13, 700, 30, 'STEAM'),
    line(13, 740, 16, '"AQUADOM"'),
    line(14, 300, 20, 'a'),
  ];

  it('finds units, numbered topics, blocks, sections and STEAM titles', () => {
    const events = classifyHeadings(lines, [badge(11, 713)], 12, {
      from: 9,
      to: 14,
      height: HEIGHT,
    });
    expect(events.map((e) => [e.type, e.title])).toEqual([
      ['unit', 'Müxtəsər vurma düsturları'],
      ['block', 'İlkin yoxlama'],
      ['topic', 'Cəmin və fərqin kubu. Kublar cəmi'],
      ['section', 'Kubların cəmi'],
      ['block', 'MƏSƏLƏ VƏ MİSALLAR'],
      ['block', 'STEAM: AQUADOM'],
    ]);
  });
});

describe('buildStructure', () => {
  const events: HeadingEvent[] = [
    { type: 'unit', page: 9, y: HEIGHT, top: 0, title: 'Rasional ədədlər' },
    { type: 'block', kind: 'pretest', page: 10, y: 714, top: 86, title: 'İlkin yoxlama' },
    { type: 'topic', page: 11, y: 713, top: 87, title: 'Rasional ədədlər' },
    { type: 'section', page: 12, y: 500, top: 300, title: 'Rasional ədədin modulu' },
    { type: 'topic', page: 15, y: 713, top: 87, title: 'Onluq kəsrlər' },
    { type: 'block', kind: 'steam', page: 18, y: 300, top: 500, title: 'STEAM' },
    { type: 'block', kind: 'glossary', page: 20, y: 720, top: 80, title: 'SÖZLÜK' },
  ];

  it('numbers topics per unit and assigns page ranges', () => {
    const { units, backMatter } = buildStructure({ events, pageHeight: HEIGHT, lastPage: 21 });
    const [unit] = units;
    expect(unit?.startPage).toBe(9);
    expect(unit?.endPage).toBe(19);
    expect(
      unit?.items.map((i) => [i.type === 'topic' ? i.number : i.kind, i.startPage, i.endPage]),
    ).toEqual([
      ['pretest', 10, 10],
      ['1.1', 11, 14],
      ['1.2', 15, 18], // the STEAM page starts mid-page, so the topic shares it
      ['steam', 18, 19],
    ]);
    expect(backMatter.map((b) => [b.kind, b.startPage, b.endPage])).toEqual([['glossary', 20, 21]]);
  });

  it('records where a range starts and stops within its first and last page', () => {
    const { units } = buildStructure({ events, pageHeight: HEIGHT, lastPage: 21 });
    const topics = units[0]?.items.filter((i) => i.type === 'topic') ?? [];
    // 1.1 starts at its heading and runs to the bottom of page 14 (1.2 starts at a page top).
    expect([topics[0]?.startY, topics[0]?.endY]).toEqual([87, 800]);
    // 1.2 stops where the STEAM block starts on page 18.
    expect(topics[1]?.endY).toBe(500);
  });

  it('warns when topic counts differ from the table of contents', () => {
    const { units } = buildStructure({ events, pageHeight: HEIGHT, lastPage: 21 });
    expect(validate(units, { '1': 2 }).warnings).toEqual([]);
    expect(validate(units, { '1': 3 }).warnings).toEqual([
      'Bölmə 1: mündəricatda 3 mövzu, tapılan 2',
    ]);
  });

  it('does not let two units with one number hide each other', () => {
    const { units } = buildStructure({ events, pageHeight: HEIGHT, lastPage: 21 });
    const [unit] = units;
    if (!unit) throw new Error('fixture has a unit');
    // A divider heading kept its place number, which the contents gave the next unit.
    const divider = { ...unit, title: 'II YARIMİL', items: [] };
    expect(validate([divider, unit], { '1': 2 }).warnings).toEqual([
      'Bölmə 1 bir neçə dəfə tapıldı ("Rasional ədədlər")',
    ]);
  });
});
