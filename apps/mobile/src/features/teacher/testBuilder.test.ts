import { canSubmitTest, countByTopic, estimateMinutes, toggleId } from './testBuilder';
import type { BankQuestion } from './types';

const q = (id: string, topicId: string): BankQuestion => ({
  id,
  topicId,
  text: id,
  source: { book: 'Riyaziyyat 7', section: topicId },
});

describe('test builder selection', () => {
  it('toggles a question in and out', () => {
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('counts the selection per topic and estimates the time', () => {
    const bank = [q('a', '4.1'), q('b', '4.1'), q('c', '4.2')];
    expect(countByTopic(['a', 'b', 'c'], bank)).toEqual({ '4.1': 2, '4.2': 1 });
    expect(estimateMinutes(4)).toBe(12);
  });

  it('sends to the catalog only with questions and confirmed rights', () => {
    expect(canSubmitTest(0, 'class', true)).toBe(false);
    expect(canSubmitTest(3, 'class', false)).toBe(true);
    expect(canSubmitTest(3, 'catalog', false)).toBe(false);
    expect(canSubmitTest(3, 'catalog', true)).toBe(true);
  });
});
