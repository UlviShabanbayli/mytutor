import { describe, expect, it } from 'vitest';
import type { LessonEntry } from '@mytutor/types';
import { draftsWaiting, nextDraft } from './next';

const place = (bookId: string, number: string) => ({ bookId, number });
const order = [place('a', '1.1'), place('a', '1.2'), place('a', '1.3'), place('b', '1.1')];
const entry = (bookId: string, number: string, draft: boolean): LessonEntry => ({
  bookId,
  number,
  path: `.curricula/c/lessons/${bookId}/${number}/lesson.json`,
  text: !draft,
  draft,
  updatedAt: '2026-10-15T00:00:00.000Z',
});

describe('nextDraft', () => {
  it('goes to the next draft in the curriculum order, across textbooks', () => {
    const lessons = [entry('a', '1.1', true), entry('a', '1.2', false), entry('b', '1.1', true)];
    expect(nextDraft(order, lessons, place('a', '1.1'))).toEqual(place('b', '1.1'));
  });

  it('goes round to the start when the drafts left are before it', () => {
    const lessons = [entry('a', '1.2', true), entry('a', '1.3', true)];
    expect(nextDraft(order, lessons, place('a', '1.3'))).toEqual(place('a', '1.2'));
  });

  it('finds nothing when no other draft waits', () => {
    const lessons = [entry('a', '1.3', true), entry('a', '1.1', false)];
    expect(nextDraft(order, lessons, place('a', '1.3'))).toBeNull();
    expect(draftsWaiting(lessons, place('a', '1.3'))).toBe(0);
    expect(draftsWaiting([...lessons, entry('b', '1.1', true)], place('a', '1.3'))).toBe(1);
    expect(draftsWaiting([...lessons, entry('b', '1.1', true)])).toBe(2);
  });
});
