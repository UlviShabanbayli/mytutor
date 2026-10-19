import { describe, expect, it } from 'vitest';
import type { KnowledgeItem } from '@mytutor/types';
import { correctionProblem, fromDraft, toDraft } from './correction';

const region = { page: 1, printedPage: 1, bbox: { x: 0, y: 0, width: 1, height: 1 } };
const item = (type: KnowledgeItem['type'], content: KnowledgeItem['content']): KnowledgeItem => ({
  id: 'k001',
  type,
  status: 'unverified',
  claimedOrigin: 'textbook',
  readFrom: 'image',
  sources: [{ blockId: 'b01', lineIds: [], figureId: null, regions: [region], crops: [] }],
  content,
  checks: [],
});

describe('correction drafts', () => {
  it('round-trips a worked example; empty optional parts become null', () => {
    const example = item('worked_example', {
      label: 'NÜMUNƏ 1.',
      problem: { text: 'Hesablayın', latex: null },
      steps: [{ text: null, latex: '(a+b)^2' }],
      explanation: null,
    });
    const draft = toDraft('worked_example', example.content);
    expect(draft).toEqual({
      label: 'NÜMUNƏ 1.',
      problem: { text: 'Hesablayın', latex: '' },
      steps: [{ text: '', latex: '(a+b)^2' }],
      explanation: '',
    });
    expect(fromDraft('worked_example', draft)).toEqual(example.content);
    expect(correctionProblem(example, fromDraft('worked_example', draft))).toBeNull();
  });

  it('trims texts, drops empty labels and names a missing required field', () => {
    const rule = item('rule', { statement: 'Köhnə', latex: null });
    const fixed = fromDraft('rule', { statement: '  Yeni qayda  ', latex: ' ' });
    expect(fixed).toEqual({ statement: 'Yeni qayda', latex: null });
    expect(correctionProblem(rule, fixed)).toBeNull();
    expect(correctionProblem(rule, fromDraft('rule', { statement: '', latex: 'x' }))).toBe(
      'statement',
    );
    const figure = item('figure', { description: 'Şəkil', labels: [] });
    expect(fromDraft('figure', { description: 'Şəkil', labels: ['A', ' ', 'B '] })).toEqual({
      description: 'Şəkil',
      labels: ['A', 'B'],
    });
    expect(correctionProblem(figure, { description: 'Şəkil', labels: ['A'] })).toBeNull();
    const formula = item('formula', { name: null, latex: 'x', spoken: 'iks' });
    expect(
      correctionProblem(formula, fromDraft('formula', { name: '', latex: '', spoken: 'iks' })),
    ).toBe('latex');
  });
});
