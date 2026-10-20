import type { Assignment, Grade, Submission } from '@mytutor/types';
import type { Clock } from '../clock';
import { CLASS_7A, CLASS_7B, NERMIN, r7, r7Unit, testIdOf } from '../ids';
import { ROSTER_7A, ROSTER_7B, rosterId7A } from '../people';
import { questionCountOf } from '../tests';

/**
 * 7B's and 7A's assignments, one state each everywhere. `hw-4-1` was handed in yesterday and
 * waits for Lalə's grade (the AI suggests 8/10); the 4.2 test is open to all of 7B for 4 days.
 */

const ids7B = ROSTER_7B.map(([id]) => id);
const ids7A = ROSTER_7A.map((_, i) => rosterId7A(i));

export function assignments(clock: Clock): Assignment[] {
  const homework = (number: string, assigned: number, due: number): Assignment => ({
    id: `hw-${number.replace('.', '-')}`,
    classId: CLASS_7B,
    kind: 'homework',
    topicId: r7(number),
    title: `${number} çalışmaları`,
    description: `${number} mövzusunun beş çalışmasını həll et. Həlli dəftərə yaz, şəklini çək və göndər.`,
    itemCount: 5,
    audience: { type: 'class' },
    assignedAt: clock.at(assigned, 16, 0),
    dueAt: clock.at(due, 23, 59),
  });
  return [
    homework('3.3', -14, -10),
    homework('3.4', -9, -6),
    homework('3.5', -7, -4),
    {
      id: 'mock-u3',
      classId: CLASS_7B,
      kind: 'mock',
      topicId: r7('3.5'),
      unitId: r7Unit('3'),
      title: '3-cü çərçivə üzrə bölmə sınağı',
      description: 'Birhədlilər və çoxhədlilər: 20 sual, 40 dəqiqə.',
      itemCount: 20,
      audience: { type: 'class' },
      assignedAt: clock.at(-5, 9, 0),
      dueAt: clock.at(-2, 23, 59),
    },
    {
      ...homework('4.1', -3, 1),
      attachment: { name: '4.1-calismalar.pdf', sizeKb: 240 },
    },
    {
      id: 'quiz-4-2',
      classId: CLASS_7B,
      kind: 'test',
      topicId: r7('4.2'),
      title: '4.2 testi',
      description: 'İki ədədin cəmi ilə fərqinin hasili üzrə qısa test.',
      itemCount: questionCountOf(testIdOf(r7('4.2'))),
      testId: testIdOf(r7('4.2')),
      audience: { type: 'class' },
      assignedAt: clock.at(-1, 9, 0),
      dueAt: clock.at(4, 20, 0),
    },
    {
      id: 'lesson-4-3',
      classId: CLASS_7B,
      kind: 'lesson',
      topicId: r7('4.3'),
      title: '4.3 dərsi',
      description: 'Cəmin və fərqin kubu dərsini oxu və nümunələrə bax.',
      audience: { type: 'class' },
      assignedAt: clock.at(-2, 10, 0),
      dueAt: clock.at(5, 23, 59),
    },
    {
      id: 'quiz-4-1-7a',
      classId: CLASS_7A,
      kind: 'test',
      topicId: r7('4.1'),
      title: '4.1 testi',
      description: 'Cəmin və fərqin kvadratı üzrə qısa test.',
      itemCount: questionCountOf(testIdOf(r7('4.1'))),
      testId: testIdOf(r7('4.1')),
      audience: { type: 'class' },
      assignedAt: clock.at(-1, 9, 30),
      dueAt: clock.at(3, 23, 59),
    },
  ];
}

const blank = (assignmentId: string, studentId: string): Submission => ({
  id: `sub-${assignmentId}-${studentId}`,
  assignmentId,
  studentId,
  state: 'submitted',
  progress: null,
  submittedAt: null,
  photos: 0,
  pages: [],
  ai: null,
  grade: null,
  comment: '',
  gradedAt: null,
});

const of = (score: number, max: number): Grade => ({ score, max });

/** Nərmin's hw-4-1: handed in yesterday, AI looked first, waiting for Lalə. */
function nerminHw41(clock: Clock): Submission {
  return {
    ...blank('hw-4-1', NERMIN),
    submittedAt: clock.at(-1, 21, 14),
    photos: 2,
    pages: [
      ['№1  (x + 3)² = x² + 6x + 9', '№2  (2a − 1)² = 4a² − 4a + 1', '№3  (3y − 2)² = 9y² + 4'],
      ['№4  (m + n)² = m² + 2mn + n²', '№5  102² = 10 404'],
    ],
    ai: {
      correct: [1, 2, 4, 5],
      note: '№3-də ortadakı 2ab həddi unudulub: (3y − 2)² = 9y² − 12y + 4.',
      suggested: of(8, 10),
    },
  };
}

function hw41(clock: Clock, studentId: string, i: number): Submission {
  if (studentId === NERMIN) return nerminHw41(clock);
  const score = 6 + (i % 5);
  const allRight = score === 10;
  const graded = i >= 6;
  return {
    ...blank('hw-4-1', studentId),
    state: graded ? 'checked' : 'submitted',
    submittedAt: clock.ago((26 - i) * 60),
    photos: 1,
    pages: [
      [
        '№1  (x + 3)² = x² + 6x + 9',
        allRight ? '№2  (2a − 1)² = 4a² − 4a + 1' : '№2  (2a − 1)² = 4a² − 1',
        '№3  (3y − 2)² = 9y² − 12y + 4',
      ],
    ],
    ai: {
      correct: allRight ? [1, 2, 3] : [1, 3],
      note: allRight ? '' : '№2-də ortadakı −4a həddi yazılmayıb: (2a − 1)² = 4a² − 4a + 1.',
      suggested: of(score, 10),
    },
    grade: graded ? of(score, 10) : null,
    gradedAt: graded ? clock.ago(30 + i) : null,
  };
}

const PAST_DUE: Record<string, number> = {
  'hw-3-3': -10,
  'hw-3-4': -6,
  'hw-3-5': -4,
  'mock-u3': -2,
};

/** Nərmin's grades and hand-in days of the past work. */
const NERMIN_PAST: Record<string, [Grade, number]> = {
  'hw-3-3': [of(10, 10), -11],
  'hw-3-4': [of(8, 10), -7],
  'hw-3-5': [of(9, 10), -5],
  'mock-u3': [of(17, 20), -2],
};

/** Past work: handed in on time and graded the next morning. */
function past(clock: Clock, assignmentId: string, studentId: string, i: number): Submission {
  const mine = studentId === NERMIN ? NERMIN_PAST[assignmentId] : undefined;
  const isMock = assignmentId === 'mock-u3';
  const due = PAST_DUE[assignmentId] ?? -1;
  const grade = mine?.[0] ?? (isMock ? of(12 + ((i * 7) % 9), 20) : of(6 + ((i * 3) % 5), 10));
  const day = mine?.[1] ?? (isMock ? due : due - 1);
  return {
    ...blank(assignmentId, studentId),
    state: 'checked',
    submittedAt: clock.at(day, isMock ? 11 : 19, 0),
    photos: isMock ? 0 : 1,
    grade,
    gradedAt: clock.at(day + 1, 9, 0),
  };
}

export function submissions(clock: Clock): Submission[] {
  const list: Submission[] = [];
  ids7B.forEach((id, i) => {
    for (const a of ['hw-3-3', 'hw-3-4', 'hw-3-5']) list.push(past(clock, a, id, i));
    if (i < 23) list.push(past(clock, 'mock-u3', id, i));
    if (i < 18) list.push(hw41(clock, id, i));
    if (i >= 6 && i <= 10)
      list.push({
        ...blank('quiz-4-2', id),
        state: 'checked',
        submittedAt: clock.ago(300 + i * 20),
        grade: of((i % 3) + 1, 3),
        gradedAt: clock.ago(300 + i * 20),
      });
    if (i <= 8) list.push({ ...blank('lesson-4-3', id), submittedAt: clock.at(-1, 17, i * 5) });
  });
  ids7A.forEach((id, i) => {
    if (i < 12)
      list.push({
        ...blank('quiz-4-1-7a', id),
        state: 'checked',
        submittedAt: clock.ago(200 + i * 15),
        grade: of((i % 3) + 1, 3),
        gradedAt: clock.ago(200 + i * 15),
      });
  });
  return list;
}
