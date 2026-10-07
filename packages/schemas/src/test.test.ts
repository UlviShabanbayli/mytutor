import { describe, expect, it } from 'vitest';
import { questionSchema } from './test';

const base = {
  id: 'q1',
  topicId: 't1',
  stem: '2 + 2 = ?',
  options: [
    { key: 'A', text: '3' },
    { key: 'B', text: '4' },
  ],
  correctKey: 'B',
  explanation: '2 + 2 = 4',
  source: { kind: 'textbook', title: 'Riyaziyyat', grade: 1, page: 10 },
};

describe('questionSchema', () => {
  it('accepts a question whose correct key is one of its options', () => {
    expect(questionSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a correct key that is not among the options', () => {
    expect(questionSchema.safeParse({ ...base, correctKey: 'E' }).success).toBe(false);
  });

  it('requires a source reference', () => {
    expect(questionSchema.safeParse({ ...base, source: undefined }).success).toBe(false);
  });
});
