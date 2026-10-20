import type { ClassInsights } from '@mytutor/types';
import { hardestTopicIndex, reviewSuggestion } from './insights';

type Row = ClassInsights['rows'][number];

const row = (studentId: string, levels: Row['levels']): Row => ({
  studentId,
  name: studentId,
  levels,
});

const rows = [
  row('a', ['mastered', 'needs_practice', 'not_started']),
  row('b', ['needs_practice', 'needs_practice', 'not_started']),
  row('c', ['reinforced', 'mastered', 'lesson_completed']),
];

const topics = [
  { id: 'riyaziyyat-7-4-1', number: '4.1' },
  { id: 'riyaziyyat-7-4-2', number: '4.2' },
  { id: 'riyaziyyat-7-4-3', number: '4.3' },
];

describe('hardestTopicIndex', () => {
  it('picks the topic with the most cells that need practice', () => {
    expect(hardestTopicIndex(rows, 3)).toBe(1);
  });

  it('is null when nothing needs practice', () => {
    expect(hardestTopicIndex(rows.slice(2), 3)).toBeNull();
  });
});

describe('reviewSuggestion', () => {
  it('names the topic and the students to review it', () => {
    const s = reviewSuggestion(rows, topics);
    expect(s?.topic).toEqual({ id: 'riyaziyyat-7-4-2', number: '4.2' });
    expect(s?.students.map((r) => r.studentId)).toEqual(['a', 'b']);
  });
});
