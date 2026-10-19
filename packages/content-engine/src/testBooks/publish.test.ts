import { describe, expect, it } from 'vitest';
import type { TestBook, TestQuestion } from '@mytutor/types';
import { publishable, publishTests } from './publish';

const question = (fields: Partial<TestQuestion>) =>
  ({
    type: 'choice',
    flags: [],
    options: ['A', 'B', 'C', 'D', 'E'].map((key) => ({ key, text: key })),
    answer: { printed: 'B', choice: 'B', pairs: null, page: 1, printedPage: 3 },
    ...fields,
  }) as TestQuestion;

describe('publish', () => {
  it('takes choice questions with their option and open ones with a number', () => {
    expect(publishable(question({}))).toBeNull();
    expect(publishable(question({ flags: ['options_count'] }))).toBe('flagged');
    expect(publishable(question({ type: 'matching' }))).toBe('type');
    const open = (printed: string) =>
      publishable(
        question({
          type: 'open',
          options: [],
          answer: { printed, choice: null, pairs: null, page: 1, printedPage: 3 },
        }),
      );
    expect([open('36'), open('-4'), open('2,8')]).toEqual([null, null, null]);
    expect(open('6 m, 32')).toBe('answer');
  });

  it('publishes a question exactly as the book prints it', async () => {
    const book = { id: 'tb_abcdefghij', title: 'Test kitabı', subject: 'riyaziyyat' } as TestBook;
    const stem = 'Hansı ədəd 7-dən böyükdür?';
    const { published } = await publishTests({
      book,
      questions: [
        question({ id: 'q_1', stem, subsection: 'Natural ədədlər', figures: [], pages: [] }),
      ],
      figurePath: (file) => file,
      now: () => new Date(0),
    });
    expect(published.tests[0]?.questions[0]?.stem).toBe(stem);
  });
});
