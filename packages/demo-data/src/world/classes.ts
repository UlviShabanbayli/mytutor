import type { Announcement, ClassMember, Material, Recording, SchoolClass } from '@mytutor/types';
import type { Clock } from '../clock';
import { CLASS_7A, CLASS_7B, LALE, NERMIN, R7, r7 } from '../ids';
import { ROSTER_7A, ROSTER_7B, rosterId7A } from '../people';

/** Lalə's two classes, their rosters, her announcements, materials and a recording. */

export const JOIN_CODE_7B = '7B-MATH-4K2';
export const JOIN_CODE_7A = '7A-MATH-9P7';

export const CLASSES: SchoolClass[] = [
  {
    id: CLASS_7B,
    shortName: '7B',
    name: '7B · Riyaziyyat',
    subjectId: R7,
    subject: 'Riyaziyyat',
    grade: 7,
    teacherId: LALE,
    joinCode: JOIN_CODE_7B,
    paid: false,
    groups: [
      {
        id: 'boost',
        name: 'Gücləndirmə qrupu',
        memberIds: ['orxan', 'tural', 'leyla', 'sebuhi', 'kamran'],
      },
    ],
    chatOpen: true,
  },
  {
    id: CLASS_7A,
    shortName: '7A',
    name: '7A · Riyaziyyat',
    subjectId: R7,
    subject: 'Riyaziyyat',
    grade: 7,
    teacherId: LALE,
    joinCode: JOIN_CODE_7A,
    paid: false,
    groups: [],
    chatOpen: true,
  },
];

/** This week's points of 7B, roster order: 18 studied, Nərmin's 340 is second in the class. */
const WEEK_POINTS_7B = [
  340, 120, 410, 95, 60, 300, 150, 130, 0, 210, 180, 0, 160, 260, 0, 230, 90, 0, 175, 140, 0, 110,
  205, 0,
];

/** Students of 7A who studied this week (15 of 22). */
const ACTIVE_7A = 15;

export function members(clock: Clock): ClassMember[] {
  const joinedAt = clock.at(-48, 10, 0);
  const b: ClassMember[] = ROSTER_7B.map(([personId, , nickname, sharesProgress], i) => ({
    classId: CLASS_7B,
    personId,
    nickname,
    sharesProgress,
    mutedInChat: personId === 'tural',
    activeThisWeek: (WEEK_POINTS_7B[i] ?? 0) > 0,
    weekPoints: WEEK_POINTS_7B[i] ?? 0,
    joinedAt,
  }));
  const a: ClassMember[] = ROSTER_7A.map((fullName, i) => ({
    classId: CLASS_7A,
    personId: rosterId7A(i),
    nickname: `${fullName.split(' ')[0] ?? 'Arı'}_7A`,
    sharesProgress: true,
    mutedInChat: false,
    activeThisWeek: i < ACTIVE_7A,
    weekPoints: i < ACTIVE_7A ? 60 + ((i * 37) % 200) : 0,
    joinedAt,
  }));
  return [...b, ...a];
}

export function announcements(clock: Clock): Announcement[] {
  return [
    {
      id: 'ann-7b-1',
      classId: CLASS_7B,
      authorId: LALE,
      text: 'Sabah 18:00-da canlı dərsdə 4.2-ni təkrarlayacağıq. 4.2 testini 4 gün ərzində həll edin, suallarınızı söhbətdə yazın.',
      at: clock.ago(90),
    },
    {
      id: 'ann-7a-1',
      classId: CLASS_7A,
      authorId: LALE,
      text: '4.1 testi 3 gün ərzində açıqdır.',
      at: clock.ago(26 * 60),
    },
  ];
}

export function materials(clock: Clock): Material[] {
  const base = { ownerId: LALE };
  return [
    {
      ...base,
      id: 'mat-kub-misal',
      kind: 'video',
      title: 'Kublar cəmi: lövhədə 3 misal',
      topicId: r7('4.3'),
      classIds: [CLASS_7B],
      size: 400,
      views: 17,
      state: 'class',
      updatedAt: clock.at(-2, 17, 30),
    },
    {
      ...base,
      id: 'mat-4-1-pdf',
      kind: 'file',
      title: '4.1-calismalar.pdf',
      topicId: r7('4.1'),
      classIds: [CLASS_7B],
      size: 240,
      state: 'class',
      updatedAt: clock.at(-3, 16, 0),
    },
    {
      ...base,
      id: 'mat-kub-addim',
      kind: 'lesson',
      title: '4.3 · Kub düsturu addım-addım',
      topicId: r7('4.3'),
      classIds: [CLASS_7B],
      size: 3,
      state: 'class',
      updatedAt: clock.at(-2, 12, 0),
    },
    {
      ...base,
      id: 'mat-4-2-boost',
      kind: 'test',
      title: '4.2 təkrarı · Gücləndirmə qrupu',
      topicId: r7('4.2'),
      classIds: [],
      size: 3,
      state: 'draft',
      updatedAt: clock.at(-1, 18, 0),
    },
    {
      ...base,
      id: 'mat-4-1-test',
      kind: 'test',
      title: '4.1 · Cəmin kvadratı',
      topicId: r7('4.1'),
      classIds: [],
      size: 10,
      state: 'in_review',
      updatedAt: clock.at(-2, 9, 30),
    },
    {
      ...base,
      id: 'mat-kvadrat-saha',
      kind: 'video',
      title: '(a + b)² sahə ilə',
      topicId: r7('4.1'),
      classIds: [CLASS_7B, CLASS_7A],
      size: 360,
      views: 312,
      state: 'approved',
      updatedAt: clock.at(-9, 16, 0),
    },
  ];
}

export function recordings(clock: Clock): Recording[] {
  return [
    {
      id: 'rec-7b-4-1',
      classId: CLASS_7B,
      topicId: r7('4.1'),
      title: '4.1 · Cəmin və fərqin kvadratı',
      recordedAt: clock.at(-5, 18, 0),
      minutes: 42,
    },
  ];
}

/** Nərmin's class, unless the persona is the first-day student. */
export const studentClassIds = (studentId: string) => (studentId === NERMIN ? [CLASS_7B] : []);
