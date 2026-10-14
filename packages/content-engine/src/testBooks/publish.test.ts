import { describe, expect, it } from 'vitest';
import type { TestQuestion } from '@mytutor/types';
import { keepsFacts, publishable } from './publish';

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

  it('keeps a rewording only when every formula and number survives', () => {
    const original = 'Cəmi 2500 olan $a$ və $b$ ədədlərindən 7 böyükdür.';
    expect(keepsFacts(original, '$a$ ilə $b$-nin cəmi 2500-dür; biri 7 vahid böyükdür.')).toBe(
      true,
    );
    expect(keepsFacts(original, '$a$ ilə $b$-nin cəmi 250-dir; biri 7 vahid böyükdür.')).toBe(
      false,
    );
    expect(keepsFacts(original, '$a$ ilə $c$-nin cəmi 2500-dür; biri 7 vahid böyükdür.')).toBe(
      false,
    );
  });
});
