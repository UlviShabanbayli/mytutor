import { describe, expect, it } from 'vitest';
import type { ExtractedItem, SourceBlock, SourceFigure, TopicSource } from '@mytutor/types';
import { buildDocument } from './document';
import { linkFigures } from './figureLinks';
import { pictureNeed, pictureReferences } from './pictureRefs';
import { checkItem, statusOf } from './validate';

const box = (x: number, y: number, width: number, height: number, page = 24) => ({
  page,
  printedPage: page - 2,
  bbox: { x, y, width, height },
});
const block = (id: string, extra: Partial<SourceBlock> = {}): SourceBlock => ({
  id,
  kind: 'inquiry',
  label: null,
  title: null,
  number: null,
  parentId: null,
  regions: [box(49, 100, 540, 300)],
  crops: [`crops/${id}-1.png`],
  lineIds: [],
  figureIds: [],
  flags: { hasMath: false, hasFigure: true, lowTextQuality: false },
  ...extra,
});
const figure = (
  id: string,
  region: SourceFigure['region'],
  kind: SourceFigure['kind'] = 'vector',
): SourceFigure => ({ id, kind, region, labels: [], image: `figures/${id}.png` });
const line = (id: string, text: string, region = box(71, 142, 300, 15)) => ({
  id,
  text,
  region,
  math: false,
  quality: 'ok' as const,
});
const sourceOf = (parts: Partial<TopicSource>): TopicSource => ({
  schemaVersion: 1,
  parserVersion: '0.2.0',
  book: { file: 'b.pdf', sha256: 'abc', pageCount: 144, printedPageOffset: 2 },
  topic: {
    number: '1.4',
    title: 'Rasional ədədlərin toplanması',
    unit: { index: 1, title: 'Rasional ədədlər' },
    start: { page: 24, y: 68 },
    end: { page: 27, y: 800 },
  },
  pages: [],
  blocks: [],
  lines: [],
  figures: [],
  warnings: [],
  ...parts,
});
const question = (text: string, lineIds = ['l1'], blockId = 'b02'): ExtractedItem => ({
  type: 'question',
  ref: 'k1',
  origin: 'textbook',
  readFrom: 'image',
  sources: [{ blockId, lineIds, figureId: null }],
  text,
  latex: null,
});
const figureIdsOf = (item: ExtractedItem, source: TopicSource) =>
  linkFigures(item, source).map((s) => s.figureId);

describe('pictureReferences', () => {
  it('finds the phrases that point at a printed picture, graph, table or diagram', () => {
    const cases: [string, string[]][] = [
      ['Nöqtələrin koordinatları şəkildə verilib.', ['şəkildə']],
      ['Şəkildəki ABC üçbucağında AG = 2/3 AN.', ['şəkildəki']],
      ['Şəklə əsasən kubun həcmini tapın.', ['şəklə əsasən']],
      ['Şəkilə baxın və cavab verin.', ['şəkilə baxın']],
      ['Qrafikdən istifadə edərək tapın.', ['qrafikdən']],
      ['Qrafikə görə sürəti müəyyən edin.', ['qrafikə görə']],
      ['Cədvəldə temperatur verilib.', ['cədvəldə']],
      ['Cədvəli tamamlayın.', ['cədvəli tamamlayın']],
      ['Diaqramda çoxluqlar təsvir edilib.', ['diaqramda', 'təsvir edilib']],
      ['Rəsmdə neçə üçbucaq var?', ['rəsmdə']],
      ['Təsvirə əsasən izah edin.', ['təsvirə əsasən']],
      ['Lövhədəki misalı həll edin.', ['lövhədəki']],
      ['Planda məktəb və aptek göstərilib.', ['planda']],
      ['Rəngli hissənin sahəsini tapın.', ['rəngli hissənin']],
    ];
    for (const [text, refs] of cases) expect(pictureReferences(text), text).toEqual(refs);
  });

  it('skips "şəkil" as a form or a way, and tasks that ask the student to draw', () => {
    for (const text of [
      'Kəsri onluq kəsr şəklində yazın.',
      'Birhədliləri standart şəkildə yazın.',
      'Çoxhədlini standart şəklə gətirin.',
      'Dövri kəsri qısa şəkildə yazın.',
      'Bu şəkildə davam edin.',
      'Belə şəkildə yazmaq olar.',
      'Həmin şəkildə hesablayın.',
      'Eyni şəkildə həll edin.',
      'Ədədi ixtisar olunmuş şəkildə yazın.',
      'y = 2x funksiyasının qrafikini qurun.',
      'Cədvəl qurmaqla tapın.',
      'Verilənləri ədəd oxunda təsvir edin.',
      'Rəngli kağızda paraleloqram çəkin.',
    ])
      expect(pictureReferences(text), text).toEqual([]);
  });

  it('reads every text field of the item, and a figure item always needs its drawing', () => {
    const exercise: ExtractedItem = {
      type: 'exercise',
      ref: 'k1',
      origin: 'textbook',
      readFrom: 'image',
      sources: [{ blockId: 'b05', lineIds: [], figureId: null }],
      number: '3',
      instruction: 'Tələb olunanı tapın.',
      items: [{ label: 'a', text: 'Şəkildə: AM = 6, MN = 7', latex: 'AM = 6' }],
    };
    expect(pictureNeed(exercise)).toEqual(['şəkildə']);
    const example: ExtractedItem = {
      type: 'worked_example',
      ref: 'k2',
      origin: 'textbook',
      readFrom: 'image',
      sources: [{ blockId: 'b07', lineIds: [], figureId: null }],
      label: 'NÜMUNƏ',
      problem: { text: 'Kəsri onluq kəsr şəklində yazın.', latex: null },
      steps: [{ text: 'Cədvəldən istifadə olunur.', latex: null }],
      explanation: null,
    };
    expect(pictureNeed(example)).toEqual(['cədvəldən']);
    const drawing: ExtractedItem = {
      type: 'figure',
      ref: 'k3',
      origin: 'derived',
      readFrom: 'image',
      sources: [{ blockId: 'b02', lineIds: [], figureId: null }],
      description: 'Düz xətt üzərində A və B nöqtələri.',
      labels: ['A', 'B'],
    };
    expect(pictureNeed(drawing)).toEqual(['figure']);
  });
});

describe('linkFigures', () => {
  // Topic 1.4: the text sits left of a picture (f01) that has its axis (f02) drawn inside it.
  const fishing = sourceOf({
    blocks: [block('b02', { lineIds: ['l1', 'l2'], figureIds: ['f01', 'f02'] })],
    lines: [
      line('l1', 'Tilov və qarmaqlara uyğun nöqtələrin koordinatları şəkildə verilib.'),
      line('l2', 'Samirin atası tilovun ipini nə qədər açıb?', box(71, 170, 220, 15)),
    ],
    figures: [
      figure('f01', box(426, 105, 156, 135), 'image'),
      figure('f02', box(429, 108, 119, 111)),
    ],
  });

  it('links the picture beside the text and drops a drawing inside it', () => {
    expect(linkFigures(question('… şəkildə verilib.'), fishing)).toEqual([
      { blockId: 'b02', lineIds: [], figureId: 'f01' },
    ]);
  });

  it('adds nothing when the model cited a figure or the text needs no picture', () => {
    const cited: ExtractedItem = {
      ...question('… şəkildə verilib.'),
      sources: [{ blockId: 'b02', lineIds: ['l1'], figureId: 'f02' }],
    };
    expect(linkFigures(cited, fishing)).toEqual([]);
    expect(linkFigures(question('Kəsri onluq kəsr şəklində yazın.'), fishing)).toEqual([]);
  });

  it('picks the nearest figure on the same page and keeps a row of drawings together', () => {
    const source = sourceOf({
      blocks: [
        block('b09', {
          kind: 'exercise',
          lineIds: ['l1'],
          figureIds: ['fc', 'fa', 'fb', 'far', 'next'],
        }),
      ],
      lines: [line('l1', 'Şəkildə verilənlərə görə tapın.', box(71, 300, 400, 15))],
      figures: [
        // a), b), c) in one row below the text; their tops differ by more than a tie
        figure('fc', box(430, 330, 100, 60)),
        figure('fa', box(80, 326, 100, 60)),
        figure('fb', box(250, 334, 100, 60)),
        // farther down the same page, and closer to the top but on the next page
        figure('far', box(80, 600, 100, 60)),
        figure('next', box(80, 70, 100, 60, 25)),
      ],
    });
    const item = question('Şəkildə verilənlərə görə tapın.', ['l1'], 'b09');
    // In reading order: a), b), c).
    expect(figureIdsOf(item, source)).toEqual(['fa', 'fb', 'fc']);
  });

  it('includes figures of nested blocks under the ref of the block that holds them', () => {
    const source = sourceOf({
      blocks: [
        block('b08', { kind: 'exercise', number: '2', lineIds: ['l1'] }),
        block('b09', { kind: 'example', parentId: 'b08', figureIds: ['f04'] }),
      ],
      lines: [line('l1', 'Şəkildə verilənlərə görə tapın.')],
      figures: [figure('f04', box(108, 170, 85, 50))],
    });
    expect(linkFigures(question('Şəkildə verilənlərə görə tapın.', ['l1'], 'b08'), source)).toEqual(
      [{ blockId: 'b09', lineIds: [], figureId: 'f04' }],
    );
  });

  it('never borrows a sibling exercise drawing through the Çalışma box', () => {
    const source = sourceOf({
      blocks: [
        block('b06', { kind: 'exercises', lineIds: ['l0'] }),
        block('b07', { kind: 'exercise', number: '1', parentId: 'b06', lineIds: ['l1'] }),
        block('b13', { kind: 'exercise', number: '5', parentId: 'b06', figureIds: ['f08'] }),
      ],
      lines: [line('l0', 'Çalışma'), line('l1', 'Şəkildə MN orta xətdir.')],
      figures: [figure('f08', box(459, 150, 95, 55))],
    });
    const item: ExtractedItem = {
      ...question('Şəkildə MN orta xətdir.'),
      sources: [
        { blockId: 'b07', lineIds: ['l1'], figureId: null },
        { blockId: 'b06', lineIds: ['l0'], figureId: null },
      ],
    };
    expect(linkFigures(item, source)).toEqual([]);
  });

  it('skips the key-word box, a photo for a table, and a far drawing for a figure item', () => {
    const source = sourceOf({
      blocks: [
        block('b02', {
          lineIds: ['l1', 'l2', 'l3', 'l4'],
          figureIds: ['words', 'photo', 'strip'],
        }),
      ],
      lines: [
        line('l1', 'Cədvəldə südün həcmi verilib.'),
        line('l2', '\u0087 mənfi kəsrlər', box(458, 150, 76, 15)),
        line('l3', 'A', box(470, 450, 8, 12)),
        line('l4', 'B', box(560, 450, 8, 12)),
      ],
      figures: [
        figure('words', box(443, 114, 124, 76)),
        figure('photo', box(80, 170, 60, 60), 'image'),
        figure('strip', box(460, 520, 120, 30), 'image'),
      ],
    });
    expect(figureIdsOf(question('Cədvəldə südün həcmi verilib.'), source)).toEqual([]);
    expect(figureIdsOf(question('Şəkildə südün həcmi verilib.'), source)).toEqual(['photo']);
    const drawing: ExtractedItem = {
      type: 'figure',
      ref: 'k3',
      origin: 'derived',
      readFrom: 'image',
      sources: [{ blockId: 'b02', lineIds: ['l3', 'l4'], figureId: null }],
      description: 'A və B nöqtələrindən keçən düz xətt.',
      labels: ['A', 'B'],
    };
    expect(figureIdsOf(drawing, source)).toEqual([]);
  });
});

describe('figure_link check', () => {
  const source = sourceOf({
    blocks: [
      block('b02', { lineIds: ['l1', 'l2'], figureIds: ['f01'] }),
      block('b03', { kind: 'think', lineIds: ['l3'] }),
    ],
    lines: [
      line('l1', 'Nöqtələrin koordinatları şəkildə verilib.'),
      line('l2', 'Tilov və qarmaq suyun altında görünür.', box(71, 200, 300, 15)),
      line('l3', 'Şəkildəki üçbucağa baxın.'),
    ],
    figures: [figure('f01', box(426, 105, 156, 135), 'image')],
  });
  const check = (item: ExtractedItem) => {
    const links = linkFigures(item, source);
    return checkItem(item, source, undefined, links).find((c) => c.name === 'figure_link');
  };

  it('passes for a figure the model cited or the rule linked, and says which', () => {
    const cited: ExtractedItem = {
      ...question('Nöqtələrin koordinatları şəkildə verilib.'),
      sources: [{ blockId: 'b02', lineIds: ['l1'], figureId: 'f01' }],
    };
    expect(check(cited)).toEqual({
      name: 'figure_link',
      result: 'pass',
      detail: 'model istinad edib: f01',
    });
    expect(check(question('Nöqtələrin koordinatları şəkildə verilib.'))).toEqual({
      name: 'figure_link',
      result: 'pass',
      detail: 'qayda ilə bağlandı ("şəkildə"): f01',
    });
  });

  it('fails when the text needs a picture its blocks do not have, and skips otherwise', () => {
    expect(check(question('Şəkildəki üçbucağa baxın.', ['l3'], 'b03'))).toMatchObject({
      result: 'fail',
    });
    expect(check(question('Kəsri onluq kəsr şəklində yazın.'))).toEqual({
      name: 'figure_link',
      result: 'skip',
      detail: null,
    });
  });

  it('leaves the status alone', () => {
    const item = question('Şəkildəki üçbucağa baxın.', ['l3'], 'b03');
    const checks = checkItem(item, source, { ref: 'k1', verdict: 'match', correction: null });
    expect(checks.find((c) => c.name === 'figure_link')?.result).toBe('fail');
    expect(statusOf(item, checks)).toBe('textbook');
  });

  it('is linked in buildDocument before the checks, without widening the other checks', () => {
    // Read from text: grounding must use l1 only, not every line of the block the link adds.
    const item: ExtractedItem = {
      ...question('Tilov və qarmaq suyun altında görünür şəkildə.'),
      readFrom: 'text',
    };
    const doc = buildDocument(source, '{}', [{ items: [item], verdicts: [], rejected: 0 }], []);
    const stored = doc.items[0];
    expect(stored?.sources).toHaveLength(2);
    expect(stored?.sources[1]).toMatchObject({
      blockId: 'b02',
      lineIds: [],
      figureId: 'f01',
      regions: [source.figures[0]?.region],
      crops: ['crops/b02-1.png', 'figures/f01.png'],
    });
    expect(stored?.checks.find((c) => c.name === 'figure_link')?.result).toBe('pass');
    expect(stored?.checks.find((c) => c.name === 'text_grounding')).toMatchObject({
      result: 'fail',
    });
  });
});
