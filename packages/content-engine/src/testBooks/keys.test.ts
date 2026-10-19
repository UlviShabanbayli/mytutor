import { describe, expect, it } from 'vitest';
import type { TestQuestion, TopicCatalogue } from '@mytutor/types';
import { batches, catalogueText, keysSchema } from './keys';

const catalogue: TopicCatalogue = {
  schemaVersion: 1,
  subject: 'riyaziyyat',
  books: [{ code: 'B1', bookId: 'r7', title: 'Riyaziyyat 7', grade: 7 }],
  topics: [
    {
      code: 'B1/2.1',
      bookId: 'r7',
      number: '2.1',
      grade: 7,
      unit: 'Qüvvət',
      title: 'Natural üstlü qüvvət',
      knowledge: 'approved',
      teaches: ['$a^n$ ifadəsi n dənə a vuruğunun hasilidir.'],
    },
  ],
};

const question = (n: number, subsection: string) =>
  ({ id: `q_${String(n).padStart(10, '0')}`, subsection }) as TestQuestion;

describe('keys', () => {
  it('lets Claude name only listed topics', () => {
    const schema = keysSchema(catalogue);
    const answer = (topic: string) => ({
      questions: [
        { id: 'q', links: [{ topic, role: 'required', confidence: 1, reason: '' }], uncovered: '' },
      ],
    });
    expect(schema.safeParse(answer('B1/2.1')).success).toBe(true);
    expect(schema.safeParse(answer('B9/9.9')).success).toBe(false);
    expect(catalogueText(catalogue)).toContain(
      'B1/2.1 · 7-ci sinif · «Qüvvət» · Natural üstlü qüvvət',
    );
  });

  it('sends one subsection at a time, twenty questions at most', () => {
    const qs = [
      ...Array.from({ length: 25 }, (_, i) => question(i, 'A')),
      ...Array.from({ length: 3 }, (_, i) => question(30 + i, 'B')),
    ];
    expect(batches(qs).map((b) => b.length)).toEqual([20, 5, 3]);
  });
});
