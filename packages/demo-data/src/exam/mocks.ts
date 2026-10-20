import type { Leaderboard, MockExam, MockRun, OptionKey } from '@mytutor/types';
import type { Clock } from '../clock';
import { MOCK_GROUPS, MOCK_QUESTIONS } from './questions';

/** Mock exams: three self-paced variants and the next general mock, plus Nərmin's one run. */

/** Demo duration; the real one comes with the exam structure from the server. */
export const MOCK_MINUTES = 60;

const rotate = <T>(list: T[], shift: number) => [...list.slice(shift), ...list.slice(0, shift)];

/** The next Saturday 11:00 at least three days ahead; registration closes two days before. */
export function scheduledDates(clock: Clock) {
  let days = (5 - clock.weekday + 7) % 7;
  if (days < 3) days += 7;
  return { startsAt: clock.at(days, 11, 0), registrationEndsAt: clock.at(days - 2, 23, 59) };
}

export function mockExams(clock: Clock): MockExam[] {
  const self = (number: number, shift: number): MockExam => ({
    id: `variant-${number}`,
    kind: 'self',
    subject: 'math',
    number,
    durationMinutes: MOCK_MINUTES,
    groups: MOCK_GROUPS,
    questions: rotate(MOCK_QUESTIONS, shift),
    startsAt: null,
    registrationEndsAt: null,
  });
  return [
    self(1, 0),
    self(2, 5),
    self(3, 10),
    {
      id: 'general-3',
      kind: 'scheduled',
      subject: 'math',
      number: 3,
      durationMinutes: MOCK_MINUTES,
      groups: MOCK_GROUPS,
      questions: MOCK_QUESTIONS,
      ...scheduledDates(clock),
    },
  ];
}

/** Nərmin's wrong answers in variant 1: powers (2.2), monomials (3.1), cubes and factoring. */
const WRONG: Record<string, OptionKey> = {
  'mq-6': 'A',
  'mq-7': 'B',
  'mq-11': 'C',
  'mq-12': 'A',
  'mq-21': 'E',
  'mq-22': 'B',
  'mq-23': 'A',
  'mq-24': 'B',
  'mq-25': 'B',
};

export function mockRuns(clock: Clock): MockRun[] {
  const answers = Object.fromEntries(
    MOCK_QUESTIONS.map((q) => [q.id, WRONG[q.id] ?? q.correctKey]),
  );
  const correct = MOCK_QUESTIONS.filter((q) => answers[q.id] === q.correctKey).length;
  return [
    {
      id: 'run-variant-1',
      mockId: 'variant-1',
      finishedAt: clock.at(-6, 19, 0),
      minutes: 52,
      correct,
      total: MOCK_QUESTIONS.length,
      answers,
    },
  ];
}

export const percentOf = (run: MockRun) => Math.round((run.correct / run.total) * 100);

/** Where the student's run stands: in 7B and in the country. */
export function leaderboard(
  run: MockRun,
  nickname: string,
  scope: Leaderboard['scope'],
): Leaderboard {
  const score = percentOf(run);
  const you = { nick: nickname, score, minutes: run.minutes };
  if (scope === 'class')
    return {
      scope,
      mockId: run.mockId,
      participants: 24,
      top: [
        { rank: 1, nick: 'Ayçiçək', score: 92, minutes: 49 },
        { rank: 2, nick: 'Riyaziyyatçı_7B', score: 88, minutes: 57 },
        { rank: 3, nick: 'Ləçək_4', score: 80, minutes: 55 },
        { rank: 4, nick: 'Gülşən_Arı', score: 76, minutes: 56 },
        { rank: 5, nick: 'Nektar_11', score: 68, minutes: 58 },
      ],
      around: [],
      you: { ...you, rank: 6, topPercent: 25 },
    };
  return {
    scope,
    mockId: run.mockId,
    participants: 1248,
    top: [
      { rank: 1, nick: 'Kəpənək_09', score: 98, minutes: 51 },
      { rank: 2, nick: 'Riyaziyyatçı_A', score: 96, minutes: 47 },
      { rank: 3, nick: 'Nar_dənəsi', score: 96, minutes: 55 },
      { rank: 4, nick: 'Ulduz_77', score: 95, minutes: 49 },
      { rank: 5, nick: 'Sakit_okean', score: 94, minutes: 58 },
    ],
    around: [
      { rank: 212, nick: 'Dağ_çiçəyi', score: score + 1, minutes: 56 },
      { rank: 213, nick: 'Qaranquş', score: score + 1, minutes: 60 },
    ],
    you: { ...you, rank: 214, topPercent: 18 },
  };
}
