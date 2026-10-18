import type { OptionKey } from '@mytutor/types';
import type { MockExam, MockGroup, MockQuestion } from './types';

export type MockAnswers = Record<string, OptionKey>;
export type ScoreLevel = 'good' | 'mid' | 'weak';
export type MapStatus = 'answered' | 'flagged' | 'empty';

export type GroupScore = {
  group: MockGroup;
  correct: number;
  total: number;
  percent: number;
  level: ScoreLevel;
};

export type MockScore = {
  correct: number;
  wrong: number;
  empty: number;
  total: number;
  /** Share of right answers; shown as the "təxmini bal" until the server applies the exam rule. */
  percent: number;
  groups: GroupScore[];
  /** Wrong and unanswered questions, in exam order. */
  missed: MockQuestion[];
};

export function levelOf(percent: number): ScoreLevel {
  if (percent >= 80) return 'good';
  if (percent >= 60) return 'mid';
  return 'weak';
}

const share = (correct: number, total: number) => (total ? Math.round((100 * correct) / total) : 0);

export function scoreMock(mock: MockExam, answers: MockAnswers): MockScore {
  const isRight = (q: MockQuestion) => answers[q.id] === q.correctKey;
  const correct = mock.questions.filter(isRight).length;
  const empty = mock.questions.filter((q) => answers[q.id] === undefined).length;
  const total = mock.questions.length;
  const groups = mock.groups
    .map((group) => {
      const inGroup = mock.questions.filter((q) => q.groupId === group.id);
      const right = inGroup.filter(isRight).length;
      const percent = share(right, inGroup.length);
      return { group, correct: right, total: inGroup.length, percent, level: levelOf(percent) };
    })
    .filter((g) => g.total > 0);
  return {
    correct,
    wrong: total - correct - empty,
    empty,
    total,
    percent: share(correct, total),
    groups,
    missed: mock.questions.filter((q) => !isRight(q)),
  };
}

/** How the question map shows a question: flagged wins over answered. */
export function mapStatus(questionId: string, answers: MockAnswers, flagged: string[]): MapStatus {
  if (flagged.includes(questionId)) return 'flagged';
  return answers[questionId] === undefined ? 'empty' : 'answered';
}

export function countMap(
  questions: MockQuestion[],
  answers: MockAnswers,
  flagged: string[],
): Record<MapStatus, number> {
  const counts: Record<MapStatus, number> = { answered: 0, flagged: 0, empty: 0 };
  for (const q of questions) counts[mapStatus(q.id, answers, flagged)] += 1;
  return counts;
}
