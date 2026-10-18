import { hardestTopicIndex, reviewSuggestion } from './insights';
import type { InsightRow } from './types';

const row = (studentId: string, levels: InsightRow['levels']): InsightRow => ({
  studentId,
  name: studentId,
  levels,
});

const rows = [
  row('a', ['mastered', 'needs_practice', 'not_started']),
  row('b', ['needs_practice', 'needs_practice', 'not_started']),
  row('c', ['reinforced', 'mastered', 'lesson_completed']),
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
    const s = reviewSuggestion(rows, ['4.1', '4.2', '4.3']);
    expect(s?.topicId).toBe('4.2');
    expect(s?.students.map((r) => r.studentId)).toEqual(['a', 'b']);
  });
});
