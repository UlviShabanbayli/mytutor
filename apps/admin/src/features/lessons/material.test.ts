import { describe, expect, it } from 'vitest';
import { itemFingerprint } from '@mytutor/schemas';
import type { ItemReview, KnowledgeItem } from '@mytutor/types';
import { lessonMaterial, pageList } from './material';

describe('pageList', () => {
  it('joins runs of consecutive pages', () => {
    expect(pageList([9, 10, 12])).toBe('9–10, 12');
    expect(pageList([7])).toBe('7');
    expect(pageList([])).toBe('');
  });
});

const region = (page: number, printedPage: number | null) => ({
  page,
  printedPage,
  bbox: { x: 0, y: 0, width: 10, height: 10 },
});

function item(id: string, type: KnowledgeItem['type'], blockId: string, content: object) {
  return {
    id,
    type,
    status: 'textbook',
    claimedOrigin: 'textbook',
    readFrom: 'text',
    sources: [
      { blockId, lineIds: [], figureId: null, regions: [region(12, 10)], crops: [] },
      { blockId, lineIds: [], figureId: null, regions: [region(11, 9)], crops: [] },
    ],
    content,
    checks: [],
  } as unknown as KnowledgeItem;
}

const exercise = (number: string) => ({ number, instruction: 'Hesablayın.', items: [] });
const example = {
  label: 'NÜMUNƏ 1.',
  problem: { text: '2 + 3', latex: null },
  steps: [],
  explanation: null,
};

const decide = (
  it: KnowledgeItem,
  decision: ItemReview['decision'],
  correction?: Record<string, unknown>,
): ItemReview => ({
  itemId: it.id,
  fingerprint: itemFingerprint(it),
  decision,
  note: null,
  decidedAt: '2026-10-14T00:00:00.000Z',
  ...(correction ? { correction } : {}),
});

describe('lessonMaterial', () => {
  const ex1 = item('k001', 'exercise', 'b03', exercise('1'));
  const ex2 = item('k002', 'exercise', 'b02', exercise('2'));
  const worked = item('k003', 'worked_example', 'b01', example);
  const rule = item('k004', 'rule', 'b01', { text: 'Qayda.', latex: null });
  const source = { blocks: [{ id: 'b01' }, { id: 'b02' }, { id: 'b03' }] } as never;

  it('takes only approved examples and exercises, in book order, with printed pages', () => {
    const review = {
      items: [
        decide(ex1, 'approved'),
        decide(ex2, 'approved'),
        decide(worked, 'approved'),
        decide(rule, 'approved'),
      ],
      blocks: [],
    };
    const material = lessonMaterial([ex1, ex2, worked, rule], review, source);
    expect(material.examples.map((e) => e.item.id)).toEqual(['k003']);
    expect(material.exercises.map((e) => e.item.id)).toEqual(['k002', 'k001']);
    expect(material.exercises[0]?.pages).toEqual([9, 10]);
    expect(material).toMatchObject({ total: 4, approved: 4 });
  });

  it('leaves out undecided and rejected items, and uses the editor correction', () => {
    const fixed = { ...exercise('1'), instruction: 'Düzəldilmiş tapşırıq.' };
    const review = {
      items: [decide(ex1, 'approved', fixed), decide(ex2, 'rejected'), decide(worked, 'needs_fix')],
      blocks: [],
    };
    const material = lessonMaterial([ex1, ex2, worked, rule], review, source);
    expect(material.examples).toEqual([]);
    expect(material.exercises.map((e) => e.item.content)).toEqual([fixed]);
    expect(material).toMatchObject({ total: 4, approved: 1 });
  });

  it('has nothing without a review', () => {
    expect(lessonMaterial([ex1], null, source)).toMatchObject({ exercises: [], approved: 0 });
  });
});

describe('answers to exercises', () => {
  const ex = (id: string, number: string) =>
    ({
      id,
      type: 'exercise',
      status: 'textbook',
      claimedOrigin: 'textbook',
      readFrom: 'text',
      sources: [
        {
          blockId: 'b01',
          lineIds: [],
          figureId: null,
          regions: [{ page: 14, printedPage: 12, bbox: { x: 0, y: 0, width: 1, height: 1 } }],
          crops: [],
        },
      ],
      content: { number, instruction: 'Tapın.', items: [] },
      checks: [],
    }) as unknown as KnowledgeItem;
  const key = (page: number, exercise: string, section: string | null = null) => ({
    id: `a-${page}-${exercise}`,
    page,
    exercise,
    section,
    parts: [{ label: null, text: '2 1/3 m', latex: null }],
    sourcePage: 141,
    sourcePrintedPage: 139,
    status: 'verified' as const,
    correction: null,
  });

  it('gives an exercise the answers printed for its number and page', () => {
    const items = [ex('k001', '17'), ex('k002', '18')];
    const review = { items: items.map((i) => decide(i, 'approved')), blocks: [] };
    const answers = [key(12, '17'), key(13, '17'), key(12, '17', 'Riyazi kaleydoskop')];
    const material = lessonMaterial(items, review, { blocks: [{ id: 'b01' }] } as never, answers);
    expect(material.exercises.map((e) => e.answers.map((a) => a.id))).toEqual([['a-12-17'], []]);
  });
});
