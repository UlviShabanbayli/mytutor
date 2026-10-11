import { describe, expect, it } from 'vitest';
import type { ExtractedItem, TopicSource } from '@mytutor/types';
import { buildDocument } from './document';
import { cropsFor, groupBlocks } from './groups';
import { checkItem, identitiesOf, statusOf } from './validate';

const region = (page: number, y: number) => ({
  page,
  printedPage: page - 2,
  bbox: { x: 50, y, width: 500, height: 40 },
});
const block = (
  id: string,
  kind: TopicSource['blocks'][number]['kind'],
  extra: Partial<TopicSource['blocks'][number]> = {},
) => ({
  id,
  kind,
  label: null,
  title: null,
  number: null,
  parentId: null,
  regions: [region(85, 100)],
  crops: [`crops/${id}-1.png`],
  lineIds: [],
  figureIds: [],
  flags: { hasMath: false, hasFigure: false, lowTextQuality: false },
  ...extra,
});
const line = (id: string, text: string, quality: 'ok' | 'low' = 'ok') => ({
  id,
  text,
  region: region(85, 120),
  math: false,
  quality,
});

const source: TopicSource = {
  schemaVersion: 1,
  parserVersion: '0.2.0',
  book: { file: 'b.pdf', sha256: 'abc', pageCount: 144, printedPageOffset: 2 },
  topic: {
    number: '4.1',
    title: 'Cəmin və fərqin kvadratı',
    unit: { index: 4, title: 'Müxtəsər vurma düsturları' },
    start: { page: 85, y: 68 },
    end: { page: 88, y: 800 },
  },
  pages: [],
  blocks: [
    block('b01', 'title'),
    block('b03', 'section', { label: 'Öyrənmə', lineIds: ['l1', 'l2'] }),
    block('b05', 'exercises', { label: 'Çalışma' }),
    block('b06', 'exercise', { number: '1', parentId: 'b05', lineIds: ['l3'] }),
    block('b07', 'example', { label: 'NÜMUNƏ', parentId: 'b06', lineIds: ['l4'] }),
    block('b21', 'remember', { label: 'Yadda saxla!' }),
    block('b22', 'example', { label: 'NÜMUNƏ 1.', number: '1', parentId: 'b21' }),
    block('b25', 'exercise', { number: '13', parentId: 'b05' }),
  ],
  lines: [
    line(
      'l1',
      'İki ədəd cəminin kvadratı bərabərdir: birinci ədədin kvadratı, üstəgəl birinci ədədlə ikinci ədədin hasilinin iki misli, üstəgəl ikinci ədədin kvadratı.',
    ),
    line('l2', '(a b) a ab b', 'low'),
    line('l3', 'Cəmin, yaxud fərqin kvadratını çoxhədli şəklində yazın.'),
    line('l4', 'NÜMUNƏ (x + 3)'),
  ],
  figures: [],
  warnings: [],
};

const base = { ref: 'k1', origin: 'textbook' as const, readFrom: 'image' as const };
const formula = (latex: string): ExtractedItem => ({
  ...base,
  type: 'formula',
  name: 'Cəmin kvadratı düsturu',
  latex,
  spoken: 'a üstəgəl b-nin kvadratı',
  sources: [{ blockId: 'b03', lineIds: ['l2'], figureId: null }],
});

describe('groups', () => {
  it('follows reading order and keeps NÜMUNƏ with its parent crop', () => {
    const groups = groupBlocks(source);
    expect(groups.map((g) => g.blockIds)).toEqual([
      ['b03'],
      ['b05', 'b06', 'b07', 'b25'],
      ['b21', 'b22'],
    ]);
    expect(cropsFor(source, groups[2] ?? { id: '', blockIds: [] }).map((c) => c.blockId)).toEqual([
      'b21',
    ]);
  });
});

describe('checks and status', () => {
  it('a formula confirmed by the image and true as an identity is textbook', () => {
    const item = formula('(a+b)^2 = a^2 + 2ab + b^2');
    const checks = checkItem(item, source, { ref: 'k1', verdict: 'match', correction: null });
    expect(checks.find((c) => c.name === 'identity')?.result).toBe('pass');
    expect(statusOf(item, checks)).toBe('textbook');
  });

  it('a misread formula is unverified even if the verifier agreed', () => {
    const item = formula('(a+b)^2 = a^2 + ab + b^2');
    const checks = checkItem(item, source, { ref: 'k1', verdict: 'match', correction: null });
    expect(statusOf(item, checks)).toBe('unverified');
  });

  it('a claim the image check rejects is unverified', () => {
    const item = formula('(a+b)^2 = a^2 + 2ab + b^2');
    const checks = checkItem(item, source, {
      ref: 'k1',
      verdict: 'mismatch',
      correction: '(a-b)^2 = …',
    });
    expect(statusOf(item, checks)).toBe('unverified');
  });

  it('rejects invented source IDs and renamed blocks', () => {
    const invented: ExtractedItem = {
      ...formula('(a+b)^2 = a^2+2ab+b^2'),
      sources: [{ blockId: 'b99', lineIds: [], figureId: null }],
    };
    expect(checkItem(invented, source).find((c) => c.name === 'source_ids')?.result).toBe('fail');
    const renamed: ExtractedItem = {
      ...base,
      type: 'worked_example',
      label: 'NÜMUNƏ 3.',
      problem: { text: null, latex: '(x+3)^2' },
      steps: [],
      explanation: null,
      sources: [{ blockId: 'b22', lineIds: [], figureId: null }],
    };
    const checks = checkItem(renamed, source, { ref: 'k1', verdict: 'match', correction: null });
    expect(checks.find((c) => c.name === 'block_kind')?.result).toBe('fail');
    expect(statusOf(renamed, checks)).toBe('unverified');
  });

  it('plain prose read from good text lines is textbook without an image check', () => {
    const rule: ExtractedItem = {
      ...base,
      type: 'rule',
      readFrom: 'text',
      statement: source.lines[0]?.text ?? '',
      latex: null,
      sources: [{ blockId: 'b03', lineIds: ['l1'], figureId: null }],
    };
    const checks = checkItem(rule, source);
    expect(checks.find((c) => c.name === 'text_grounding')?.result).toBe('pass');
    expect(statusOf(rule, checks)).toBe('textbook');
  });

  it('derived items stay derived but must still cite real sources', () => {
    const fig: ExtractedItem = {
      ...base,
      origin: 'derived',
      type: 'figure',
      description: 'Kvadrat dörd hissəyə bölünür',
      labels: ['a', 'b'],
      sources: [{ blockId: 'b03', lineIds: [], figureId: null }],
    };
    expect(statusOf(fig, checkItem(fig, source))).toBe('derived');
  });

  it('chains worked-example steps that start with "="', () => {
    const ex: ExtractedItem = {
      ...base,
      type: 'worked_example',
      label: 'NÜMUNƏ',
      problem: { text: null, latex: '(x+3)^2' },
      steps: [
        { text: null, latex: '= x^2 + 2 \\cdot x \\cdot 3 + 3^2' },
        { text: null, latex: '= x^2 + 6x + 9' },
      ],
      explanation: null,
      sources: [{ blockId: 'b07', lineIds: [], figureId: null }],
    };
    expect(identitiesOf(ex)).toEqual([
      '(x+3)^2= x^2 + 2 \\cdot x \\cdot 3 + 3^2',
      ' x^2 + 2 \\cdot x \\cdot 3 + 3^2= x^2 + 6x + 9',
    ]);
    expect(checkItem(ex, source).find((c) => c.name === 'identity')?.result).toBe('pass');
  });

  it('joins a row the book wraps after an operator', () => {
    const ex: ExtractedItem = {
      ...base,
      type: 'worked_example',
      label: 'NÜMUNƏ',
      problem: { text: null, latex: '(a+1)(a-2) = ?' },
      steps: [
        { text: null, latex: '(a+1)(a-2) = a \\cdot a - 2a + a -' },
        { text: null, latex: '- 2 = a^2 - a - 2' },
      ],
      explanation: null,
      sources: [{ blockId: 'b07', lineIds: [], figureId: null }],
    };
    expect(identitiesOf(ex)).toEqual(['(a+1)(a-2) = a \\cdot a - 2a + a - 2 = a^2 - a - 2']);
    expect(checkItem(ex, source).find((c) => c.name === 'identity')?.result).toBe('pass');
  });
});

describe('buildDocument', () => {
  it('resolves locations from the source layer and counts statuses', () => {
    const item = formula('(a+b)^2 = a^2 + 2ab + b^2');
    const doc = buildDocument(
      source,
      '{}',
      [
        {
          items: [item],
          verdicts: [{ ref: 'k1', verdict: 'match', correction: null }],
          rejected: 0,
        },
      ],
      [],
    );
    expect(doc.items[0]?.sources[0]?.regions[0]?.printedPage).toBe(83);
    expect(doc.items[0]?.sources[0]?.crops).toEqual(['crops/b03-1.png']);
    expect(doc.summary).toMatchObject({
      textbook: 1,
      derived: 0,
      unverified: 0,
      imageBasedFormulas: ['(a+b)^2 = a^2 + 2ab + b^2'],
    });
  });
});

describe('canonicalSha256', () => {
  it('ignores key order and formatting', async () => {
    const { canonicalSha256 } = await import('./canonical');
    const a = JSON.parse('{"b": [1, {"y": 2, "x": 1}], "a": "ə"}');
    const b = JSON.parse('{\n  "a": "ə",\n  "b": [1, {"x": 1, "y": 2}]\n}');
    expect(canonicalSha256(a)).toBe(canonicalSha256(b));
    expect(canonicalSha256({ a: 1 })).not.toBe(canonicalSha256({ a: 2 }));
  });
});

describe('costUsd', () => {
  it('prices known models and counts unknown ones as 0, not as Opus', async () => {
    const { costUsd } = await import('./pricing');
    const usage = { input: 1_000_000, output: 1_000_000, cacheWrite: 0, cacheRead: 0 };
    expect(costUsd('claude-opus-5-5', usage)).toBe(24);
    expect(costUsd('qwen3-vl:8b', usage)).toBe(0);
  });
});
