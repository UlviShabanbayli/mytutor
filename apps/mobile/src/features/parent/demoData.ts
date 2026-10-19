// Demo data until the parent API exists (architecture V1–V3). Names and topics follow the arı
// design (Səbinə, her daughter Nərmin in 7B, Lalə müəllim); no textbook text is copied here.
import type {
  Assignment,
  ChatMessage,
  ChildLink,
  ClassNote,
  Mastery,
  NotificationPrefs,
  ParentNotification,
  ParentProfile,
  SubjectProgress,
  TeacherContact,
  WeekReport,
} from './types';

/** The moment the demo was drawn for: Sunday, 18 October 2026, 18:00 (local time). */
export const DEMO_NOW = new Date(2026, 9, 18, 18, 0);

/** A local date in October 2026 as ISO, the month the demo lives in. */
const oct = (day: number, hours = 12, minutes = 0) =>
  new Date(2026, 9, day, hours, minutes).toISOString();

export const DEMO_PROFILE: ParentProfile = { name: 'Səbinə', phoneMasked: '+994 50 *** ** 47' };

export const NERMIN = 'nermin';
export const ELVIN = 'elvin';
export const LALE = 'lale';

/** What a child under 13 shares from the start (consent screen "Defolt olaraq görəcəyin"). */
export const CONSENT_DEFAULT_GRANTS: ChildLink['grants'] = ['report', 'progress', 'assignments'];

export const demoLinks = (): ChildLink[] => [
  {
    childId: NERMIN,
    name: 'Nərmin',
    grade: 7,
    className: '7B',
    teacherName: 'Lalə Həsənova',
    status: 'active',
    underThirteen: false,
    // Nərmin keeps her exam plan to herself (design: "İmtahan · Paylaşılmayıb").
    grants: ['report', 'progress', 'assignments'],
  },
  {
    childId: ELVIN,
    name: 'Elvin',
    grade: 5,
    className: null,
    teacherName: null,
    status: 'awaiting_consent',
    underThirteen: true,
    grants: [],
  },
];

/** Link codes the demo knows: the one Nərmin made and one that ran out. */
export const DEMO_CODES: Record<string, { childId: string; childName: string } | 'expired'> = {
  K7Q42M: { childId: NERMIN, childName: 'Nərmin' },
  M4T8QW: 'expired',
};

/** The SMS code sent to the parent's phone for Elvin's account. */
export const DEMO_SMS_CODE = '481926';

/** Weekly reports by week offset (0 = this week, 12–18 October). */
export const demoReports: Record<string, WeekReport[]> = {
  [NERMIN]: [
    {
      weekStart: oct(12, 0),
      minutes: 130,
      previousMinutes: 105,
      activeDays: [true, true, false, true, true, false, true],
      answers: { correct: 52, total: 64 },
      newTopics: [
        { number: '3.4', title: 'Birhədlinin çoxhədliyə vurulması' },
        { number: '3.5', title: 'Çoxhədlinin çoxhədliyə vurulması' },
        { number: '4.1', title: 'Cəmin və fərqin kvadratı' },
        { number: '4.2', title: 'İki ədədin cəmi ilə fərqinin hasili' },
      ],
      completedUnit: '3',
      weakSpots: [
        { number: '2.2', title: 'Qüvvətlərin vurulması' },
        { number: '3.1', title: 'Birhədlilər' },
      ],
      assignments: { onTime: 3, total: 3 },
      examReadiness: null,
      teacherNote: {
        teacherId: LALE,
        teacherName: 'Lalə Həsənova',
        text: 'Nərmin bu həftə dərsdə çox fəal idi. Kub düsturlarını evdə 10 dəqiqə təkrar etsə, kifayətdir.',
      },
    },
    {
      weekStart: oct(5, 0),
      minutes: 105,
      previousMinutes: null,
      activeDays: [true, false, true, true, false, true, false],
      answers: { correct: 38, total: 50 },
      newTopics: [
        { number: '3.2', title: 'Çoxhədlilər' },
        { number: '3.3', title: 'Toplanması və çıxılması' },
      ],
      completedUnit: null,
      weakSpots: [{ number: '2.2', title: 'Qüvvətlərin vurulması' }],
      assignments: { onTime: 2, total: 2 },
      examReadiness: null,
      teacherNote: null,
    },
  ],
};

export const DEMO_LAST_ACTIVE: Record<string, string> = { [NERMIN]: oct(18, 17, 40) };

const LEVELS: Record<string, Mastery> = {
  S: 'reinforced',
  H: 'mastered',
  C: 'needs_practice',
  N: 'lesson_completed',
  E: 'not_started',
};

const unit = (number: string, title: string, cells: string) => ({
  number,
  title,
  topics: cells
    .split('')
    .map((c, i) => ({ number: `${number}.${i + 1}`, level: LEVELS[c] ?? 'not_started' })),
});

/** Nərmin's hive box (S sealed, H honey, C crystal, N nectar, E empty), as in the design. */
export const demoSubjects: Record<string, SubjectProgress[]> = {
  [NERMIN]: [
    {
      subjectId: 'riyaziyyat-7',
      title: 'Riyaziyyat 7',
      book: 'TRİMS, 1-ci hissə',
      units: [
        unit('1', 'Rasional ədədlər', 'SSSHSH'),
        unit('2', 'Natural üstlü qüvvət', 'SCHH'),
        unit('3', 'Birhədlilər və çoxhədlilər', 'CHSHH'),
        unit('4', 'Müxtəsər vurma düsturları', 'HHNEE'),
        unit('5', 'Dördbucaqlılar', 'EEEEEE'),
      ],
      recentTests: [
        { id: 't1', kind: 'practice', ref: '4.2', takenAt: oct(17), questions: 10, correct: 7 },
        { id: 't2', kind: 'practice', ref: '4.1', takenAt: oct(16), questions: 10, correct: 9 },
        { id: 't3', kind: 'unit', ref: '3', takenAt: oct(14), questions: 20, correct: 17 },
      ],
    },
  ],
};

const task = (a: Partial<Assignment> & Pick<Assignment, 'id' | 'title' | 'dueAt' | 'state'>) => ({
  progress: null,
  lateDays: 0,
  submittedAt: null,
  onTime: true,
  score: null,
  ...a,
});

export const demoAssignments: Record<string, { classLabel: string; items: Assignment[] }> = {
  [NERMIN]: {
    classLabel: '7B · Riyaziyyat',
    items: [
      task({
        id: 'a1',
        title: 'Ev tapşırığı: 4.3 çalışmaları',
        dueAt: oct(21, 23, 59),
        state: 'in_progress',
        progress: { done: 2, total: 6 },
      }),
      task({
        id: 'a2',
        title: 'Məşq testi: 4.2',
        dueAt: oct(17, 23, 59),
        state: 'late',
        lateDays: 1,
        onTime: false,
      }),
      task({
        id: 'a3',
        title: 'Ev tapşırığı: 4.1 çalışmaları',
        dueAt: oct(15, 23, 59),
        state: 'checked',
        submittedAt: oct(15, 19),
        score: { kind: 'points', value: 9, max: 10 },
      }),
      task({
        id: 'a4',
        title: 'Bölmə sınağı: Çərçivə 3',
        dueAt: oct(14, 23, 59),
        state: 'checked',
        submittedAt: oct(14, 11),
        score: { kind: 'percent', value: 85 },
      }),
      task({
        id: 'a5',
        title: 'Ev tapşırığı: 3.5',
        dueAt: oct(10, 23, 59),
        state: 'submitted',
        submittedAt: oct(10, 20),
      }),
      task({
        id: 'a6',
        title: 'Ev tapşırığı: 3.4',
        dueAt: oct(7, 23, 59),
        state: 'checked',
        submittedAt: oct(7, 18),
        score: { kind: 'points', value: 8, max: 10 },
      }),
    ],
  },
};

export const DEMO_TEACHERS: (TeacherContact & { childId: string })[] = [
  {
    teacherId: LALE,
    name: 'Lalə Həsənova',
    firstName: 'Lalə',
    classLabel: '7B · Riyaziyyat',
    childName: 'Nərmin',
    childId: NERMIN,
  },
];

export const demoNotes = (): Record<string, ClassNote[]> => ({
  [LALE]: [
    {
      id: 'n1',
      className: '7B',
      text: 'Cümə günü 4-cü çərçivə üzrə bölmə sınağı olacaq. 4.1–4.3 mövzularını təkrar etmək kifayətdir.',
      at: oct(17, 18, 20),
    },
  ],
});

export const demoMessages = (): Record<string, ChatMessage[]> => ({
  [LALE]: [
    {
      id: 'm1',
      from: 'teacher',
      text: 'Salam, Səbinə xanım! Nərmin bu həftə çox səliqəli işləyib. 4.3-də kiçik çətinlik var, dərsdə üstündən keçəcəyik.',
      at: oct(18, 10, 12),
      status: 'read',
      reported: false,
    },
    {
      id: 'm2',
      from: 'me',
      text: 'Çox sağ olun, Lalə xanım. Evdə də kub düsturlarına baxarıq.',
      at: oct(18, 10, 30),
      status: 'read',
      reported: false,
    },
  ],
});

export const demoNotifications = (): ParentNotification[] => [
  {
    id: 'nt1',
    kind: 'weekly_report',
    childId: NERMIN,
    childName: 'Nərmin',
    at: oct(18, 17),
  },
  {
    id: 'nt2',
    kind: 'teacher_message',
    teacherId: LALE,
    teacherName: 'Lalə Həsənova',
    at: oct(18, 10, 12),
  },
];

export const DEMO_PREFS: NotificationPrefs = {
  weeklyReport: true,
  assignmentLate: true,
  longBreak: false,
  teacherMessage: true,
};
