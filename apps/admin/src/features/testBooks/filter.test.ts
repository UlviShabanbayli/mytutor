import { describe, expect, it } from 'vitest';
import type { TestQuestion } from '@mytutor/types';
import { questionsIn, subsectionsOf } from './filter';

const q = (id: string, subsection: string, fields: Partial<TestQuestion> = {}) =>
  ({ id, subsection, flags: [], uncovered: null, links: [], ...fields }) as TestQuestion;

const link = {
  bookId: 'b',
  number: '1.1',
  status: 'suggested',
  confidence: 1,
  reason: '',
} as const;
const questions = [
  q('a', 'S1', { links: [{ ...link, role: 'required' }] }),
  q('b', 'S1', { flags: ['options_count'], links: [{ ...link, role: 'related' }] }),
  q('c', 'S2', { uncovered: 'ƏBOB' }),
];

describe('question views', () => {
  it('shows all, flagged, unlinked or uncovered questions, in one subsection or all', () => {
    expect(questionsIn(questions, 'all', '').map((x) => x.id)).toEqual(['a', 'b', 'c']);
    expect(questionsIn(questions, 'flagged', '').map((x) => x.id)).toEqual(['b']);
    // A question with only "related" links has no required topic yet.
    expect(questionsIn(questions, 'unlinked', '').map((x) => x.id)).toEqual(['b', 'c']);
    expect(questionsIn(questions, 'uncovered', 'S2').map((x) => x.id)).toEqual(['c']);
    expect(subsectionsOf(questions)).toEqual(['S1', 'S2']);
  });
});
