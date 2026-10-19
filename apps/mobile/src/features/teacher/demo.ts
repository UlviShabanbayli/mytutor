/*
 * Demo data until the teacher API exists (architecture M1–M8: verification, classes,
 * materials, assignments and grading, live lessons, student questions, analytics, tutor
 * market). People, classes and numbers follow the arı design (Lalə Həsənova, class 7B).
 * Questions, solutions and board lines are short maths written for the demo, not textbook
 * or test-book text; sources name the book and section only (pages only where the
 * contents list gives them).
 */
import type { CellState } from '@/components/ui';
import type {
  Announcement,
  BankQuestion,
  ClassAssignment,
  ClassInsights,
  ClassMember,
  Conversation,
  InboxQuestion,
  LiveRoom,
  Material,
  SourceView,
  Submission,
  TeacherClass,
  TeacherNotice,
  TeacherProfile,
  TopicView,
} from './types';

export const BOOK = 'Riyaziyyat 7 (TRİMS), 1-ci hissə';

/** Unit 4 "Müxtəsər vurma düsturları" and the topics the demo questions refer to. */
export const TOPICS: TopicView[] = [
  { id: '3.5', title: 'Çoxhədlinin çoxhədliyə vurulması' },
  { id: '4.1', title: 'Cəmin və fərqin kvadratı', page: 83 },
  { id: '4.2', title: 'İki ədədin cəmi ilə fərqinin hasili' },
  { id: '4.3', title: 'Cəmin və fərqin kubu', page: 90 },
  { id: '4.4', title: 'Çoxhədlilərin vuruqlara ayrılması' },
  { id: '4.5', title: 'Düsturlarla vuruqlara ayırma' },
];

export const UNIT_TOPICS = ['4.1', '4.2', '4.3', '4.4', '4.5'];

const src = (section: string, page?: number): SourceView => ({
  book: BOOK,
  section,
  page,
  demo: true,
});

/** Students of 7B; `false` = shows the teacher only class assignments, not overall progress. */
const STUDENTS_7B: [string, string, boolean][] = [
  ['nermin', 'Nərmin Əliyeva', true],
  ['orxan', 'Orxan M.', true],
  ['aysel', 'Aysel Q.', true],
  ['tural', 'Tural İ.', true],
  ['leyla', 'Leyla R.', true],
  ['fidan', 'Fidan H.', true],
  ['sebuhi', 'Səbuhi N.', true],
  ['kamran', 'Kamran V.', true],
  ['gunay', 'Günay A.', false],
  ['nigar', 'Nigar M.', true],
  ['elvin', 'Elvin S.', true],
  ['resad', 'Rəşad K.', false],
  ['murad', 'Murad H.', true],
  ['sevinc', 'Sevinc B.', true],
  ['lamiye', 'Lamiyə C.', false],
  ['zehra', 'Zəhra Q.', true],
  ['nihad', 'Nihad R.', true],
  ['ilkin', 'İlkin T.', false],
  ['aydan', 'Aydan F.', true],
  ['ulviyye', 'Ülviyyə D.', true],
  ['emil', 'Emil Ş.', false],
  ['rauf', 'Rauf Ə.', true],
  ['xedice', 'Xədicə N.', true],
  ['togrul', 'Toğrul M.', true],
];

/** Students of 7A: everyone shares progress (no report data in the demo yet). */
const STUDENTS_7A = [
  'Anar B.',
  'Aytac Q.',
  'Cavid H.',
  'Dilarə M.',
  'Elmir Ə.',
  'Fərid S.',
  'Gülnar T.',
  'Həsən R.',
  'İlahə N.',
  'Kənan D.',
  'Lalə Z.',
  'Mələk A.',
  'Nurlan K.',
  'Pərvin V.',
  'Röya C.',
  'Samir F.',
  'Səidə İ.',
  'Teymur Ş.',
  'Ulviyya Q.',
  'Vüsal P.',
  'Yeganə L.',
  'Zaur M.',
];

/** Levels over 4.1–4.5: M reinforced, B mastered, N learning, K needs practice, – empty. */
const LEVELS_7B: Record<string, string> = {
  nermin: 'BBN––',
  orxan: 'KK–––',
  aysel: 'MBBN–',
  tural: 'BKN––',
  leyla: 'KK–––',
  fidan: 'MMBBN',
  sebuhi: 'BKN––',
  kamran: 'BK–––',
  nigar: 'BBN––',
  elvin: 'MBN––',
  murad: 'BB–––',
  sevinc: 'MBBN–',
  zehra: 'BBN––',
  nihad: 'BN–––',
  aydan: 'MBN––',
  ulviyye: 'BB–––',
  rauf: 'BN–––',
  xedice: 'MBB––',
  togrul: 'B––––',
};

const LEVEL_STATE: Record<string, CellState> = {
  M: 'reinforced',
  B: 'mastered',
  N: 'lesson_completed',
  K: 'needs_practice',
  '–': 'not_started',
};

export type TeacherDemoDb = {
  profile: TeacherProfile;
  classes: TeacherClass[];
  members: Record<string, ClassMember[]>;
  assignments: ClassAssignment[];
  announcements: Announcement[];
  inbox: InboxQuestion[];
  submissions: Submission[];
  materials: Material[];
  bank: BankQuestion[];
  insights: ClassInsights[];
  live: LiveRoom[];
  conversations: Conversation[];
  notices: TeacherNotice[];
};

/** A fresh demo state; times are relative to `now` so "4 dəq gözləyir" stays true. */
export function createDemoDb(now: Date): TeacherDemoDb {
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
  const daysFromNow = (d: number, h = 23, min = 59) => {
    const at = new Date(now);
    at.setDate(at.getDate() + d);
    at.setHours(h, min, 0, 0);
    return at.toISOString();
  };
  const name = (id: string) => STUDENTS_7B.find(([s]) => s === id)?.[1] ?? id;
  const boost = ['orxan', 'tural', 'leyla', 'sebuhi', 'kamran'];

  return {
    profile: {
      name: 'Lalə Həsənova',
      subject: 'Riyaziyyat',
      grade: 7,
      verification: 'pending',
      submittedAt: daysFromNow(-1, 10, 15),
      listing: {
        pricePerHour: null,
        subjects: ['Riyaziyyat'],
        gradeFrom: 5,
        gradeTo: 9,
        exams: ['graduation_9'],
        days: [0, 2, 4],
        hours: '17:00–20:00',
        bio: 'Riyaziyyatı dərslik üzrə, addım-addım izah edirəm. Buraxılışa hazırlıq.',
        reviewCount: 0,
        monthIncome: null,
      },
    },
    classes: [
      {
        id: '7b',
        shortName: '7B',
        name: '7B · Riyaziyyat',
        subject: 'Riyaziyyat',
        book: 'Riyaziyyat 7',
        grade: 7,
        paid: false,
        inviteCode: '7B-MATH-4K2',
        groups: [{ id: 'boost', name: 'Gücləndirmə qrupu', memberIds: boost }],
        studentCount: 24,
        activeThisWeek: 18,
        activeAssignments: 3,
        completion: 0.78,
        chatOpen: true,
        chatUnread: 3,
      },
      {
        id: '7a',
        shortName: '7A',
        name: '7A · Riyaziyyat',
        subject: 'Riyaziyyat',
        book: 'Riyaziyyat 7',
        grade: 7,
        paid: false,
        inviteCode: '7A-MATH-9P7',
        groups: [],
        studentCount: 22,
        activeThisWeek: 15,
        activeAssignments: 1,
        completion: 0.64,
        chatOpen: true,
        chatUnread: 0,
      },
    ],
    members: {
      '7b': STUDENTS_7B.map(([id, n, sharesProgress]) => ({
        id,
        name: n,
        sharesProgress,
        mutedInChat: id === 'tural',
      })),
      '7a': STUDENTS_7A.map((n, i) => ({
        id: `7a-${i + 1}`,
        name: n,
        sharesProgress: true,
        mutedInChat: false,
      })),
    },
    assignments: [
      {
        id: 'hw41',
        classId: '7b',
        kind: 'homework',
        topicId: '4.1',
        exerciseCount: 8,
        audience: { type: 'class' },
        dueAt: daysFromNow(1),
        done: 18,
        total: 24,
        toGrade: 6,
      },
      {
        id: 't42',
        classId: '7b',
        kind: 'test',
        topicId: '4.2',
        audience: { type: 'group', groupId: 'boost' },
        dueAt: daysFromNow(2),
        done: 3,
        total: 5,
        toGrade: 0,
      },
      {
        id: 'l43',
        classId: '7b',
        kind: 'lesson',
        topicId: '4.3',
        audience: { type: 'class' },
        dueAt: daysFromNow(4),
        done: 9,
        total: 24,
        toGrade: 0,
      },
      {
        id: 'm3',
        classId: '7b',
        kind: 'mock',
        topicId: '3.5',
        unit: 3,
        audience: { type: 'class' },
        dueAt: daysFromNow(-3),
        done: 23,
        total: 24,
        toGrade: 0,
      },
      {
        id: 't41a',
        classId: '7a',
        kind: 'test',
        topicId: '4.1',
        audience: { type: 'class' },
        dueAt: daysFromNow(3),
        done: 12,
        total: 22,
        toGrade: 0,
      },
    ],
    announcements: [],
    inbox: [
      {
        id: 'q-aysel',
        studentId: 'aysel',
        studentName: name('aysel'),
        classId: '7b',
        topicId: '4.4',
        askedAt: minutesAgo(18),
        text: 'x³ − 8 ifadəsini vuruqlara ayır.',
        note: 'Hansı düsturu işlətməliyəm?',
        photo: { formula: 'x³ − 8 = ?' },
        ai: {
          status: 'ready',
          steps: [
            { id: 's1', label: 'Düstur', formula: 'a³ − b³ = (a − b)(a² + ab + b²)' },
            { id: 's2', label: '8-i 2³ kimi yaz', formula: 'x³ − 8 = x³ − 2³' },
            { id: 's3', label: 'Düsturu tətbiq et', formula: '(x − 2)(x² + 2x + 4)' },
          ],
        },
        source: src('4.4'),
        approved: false,
      },
      {
        id: 'q-orxan',
        studentId: 'orxan',
        studentName: name('orxan'),
        classId: '7b',
        topicId: '4.1',
        askedAt: minutesAgo(11),
        text: '(a + 5)² − (a − 5)² ifadəsini sadələşdir.',
        note: 'Cavabım 20a çıxdı, düzdür?',
        photo: null,
        ai: {
          status: 'ready',
          steps: [
            { id: 's1', label: 'Kvadratları aç', formula: '(a² + 10a + 25) − (a² − 10a + 25)' },
            { id: 's2', label: 'Mötərizəni aç', formula: 'a² + 10a + 25 − a² + 10a − 25' },
            { id: 's3', label: 'Oxşar hədləri topla', formula: '20a' },
          ],
        },
        source: src('4.1', 83),
        approved: false,
      },
      {
        id: 'q-nermin',
        studentId: 'nermin',
        studentName: name('nermin'),
        classId: '7b',
        topicId: '4.3',
        askedAt: minutesAgo(4),
        text: '(2x − 1)³ ifadəsini çoxhədli şəklində yaz.',
        note: 'Kubu necə açacağımı bilmirəm, işarələr qarışır.',
        photo: { formula: '(2x − 1)³ = ?' },
        ai: {
          status: 'ready',
          steps: [
            { id: 's1', label: 'Düstur', formula: '(a − b)³ = a³ − 3a²b + 3ab² − b³' },
            {
              id: 's2',
              label: 'a = 2x, b = 1 yerinə qoy',
              formula: '(2x)³ − 3·(2x)²·1 + 3·2x·1² − 1³',
            },
            { id: 's3', label: 'Hesabla', formula: '8x³ − 12x² + 6x − 1' },
          ],
        },
        source: src('4.3', 90),
        approved: false,
      },
      {
        id: 'q-tural',
        studentId: 'tural',
        studentName: name('tural'),
        classId: '7b',
        topicId: '3.5',
        askedAt: minutesAgo(1),
        text: 'Dərslikdəki çalışmanın şəkli göndərilib.',
        note: 'Bunu necə həll edim?',
        photo: { formula: '(x + 2)(x − 3) = ?' },
        ai: { status: 'solving', steps: [] },
        source: src('3.5'),
        approved: false,
      },
    ],
    submissions: [
      submission('sub-fidan', 'fidan', name('fidan'), minutesAgo(26 * 60), 10, 10),
      submission('sub-leyla', 'leyla', name('leyla'), minutesAgo(25 * 60), 7, 7),
      {
        id: 'sub-nermin',
        assignmentId: 'hw41',
        studentId: 'nermin',
        studentName: name('nermin'),
        submittedAt: minutesAgo(24 * 60),
        pages: [
          ['№1  (x + 3)² = x² + 6x + 9', '№2  (2a − 1)² = 4a² − 4a + 1', '№3  (3y − 2)² = 9y² + 4'],
          ['№4  (m + n)² = m² + 2mn + n²', '№5  102² = 10 404'],
        ],
        ai: {
          correct: [1, 2, 4, 5],
          note: '№3-də ortadakı 2ab həddi unudulub: (3y − 2)² = 9y² − 12y + 4.',
          suggested: 8,
        },
        source: src('4.1', 83),
        grade: null,
        comment: 'Çox yaxşı! №3-də ortadakı 2ab həddini yoxla.',
      },
      submission('sub-orxan', 'orxan', name('orxan'), minutesAgo(14 * 60), 6, null),
      submission('sub-tural', 'tural', name('tural'), minutesAgo(9 * 60), 7, null),
      submission('sub-sebuhi', 'sebuhi', name('sebuhi'), minutesAgo(3 * 60), 9, null),
    ],
    materials: [
      {
        id: 'd1',
        kind: 'test',
        title: '4.2 təkrarı · Gücləndirmə qrupu',
        size: 3,
        state: 'draft',
        updatedAt: daysFromNow(-1, 18, 0),
      },
      {
        id: 'd2',
        kind: 'lesson',
        title: '4.3 · Kub düsturu addım-addım',
        size: 3,
        state: 'draft',
        updatedAt: daysFromNow(-2, 12, 0),
      },
      {
        id: 's1',
        kind: 'test',
        title: '4.1 · Cəmin kvadratı',
        size: 10,
        state: 'in_review',
        updatedAt: daysFromNow(-2, 9, 30),
      },
      {
        id: 's2',
        kind: 'video',
        title: '(a + b)² sahə ilə',
        size: 6,
        views: 312,
        state: 'approved',
        updatedAt: daysFromNow(-9, 16, 0),
      },
    ],
    bank: [
      { id: 'b411', topicId: '4.1', text: '(x + 4)² ifadəsini çoxhədli kimi yazın.' },
      { id: 'b412', topicId: '4.1', text: '(3a − 2b)² ifadəsini çoxhədli kimi yazın.' },
      { id: 'b413', topicId: '4.1', text: '102² qiymətini düsturla hesablayın.' },
      { id: 'b414', topicId: '4.1', text: '(y − 6)² ifadəsini açın.' },
      { id: 'b421', topicId: '4.2', text: '(x − 3)(x + 3) hasilini tapın.' },
      { id: 'b422', topicId: '4.2', text: '51 · 49 hasilini düsturla hesablayın.' },
      { id: 'b423', topicId: '4.2', text: '(2m + 5)(2m − 5) hasilini çoxhədli kimi yazın.' },
      { id: 'b431', topicId: '4.3', text: '(a + 2)³ ifadəsini çoxhədli kimi yazın.' },
      { id: 'b432', topicId: '4.3', text: '(x − 1)³ açılışını yazın.' },
      { id: 'b441', topicId: '4.4', text: 'ax + ay ifadəsini vuruqlara ayırın.' },
      { id: 'b442', topicId: '4.4', text: '6x² − 9x ifadəsini vuruqlara ayırın.' },
      { id: 'b451', topicId: '4.5', text: 'x² − 49 ifadəsini vuruqlara ayırın.' },
      { id: 'b452', topicId: '4.5', text: 'a² + 6a + 9 ifadəsini vuruqlara ayırın.' },
    ].map((q) => ({ ...q, source: src(q.topicId) })),
    insights: [
      {
        classId: '7b',
        unit: 4,
        days: 14,
        topics: UNIT_TOPICS,
        completion: 0.78,
        activeThisWeek: 18,
        studentCount: 24,
        rows: STUDENTS_7B.filter(([, , shares]) => shares).map(([id, n]) => ({
          studentId: id,
          name: n,
          levels: Array.from(LEVELS_7B[id] ?? '–––––').map((l) => LEVEL_STATE[l] ?? 'not_started'),
        })),
        hiddenCount: STUDENTS_7B.filter(([, , shares]) => !shares).length,
        missed: [
          { id: 'm1', text: '(x − 3)(x + 3) = ?', source: src('4.2'), wrong: 14, total: 24 },
          { id: 'm2', text: '(3a − 2b)² açılışı', source: src('4.1', 83), wrong: 11, total: 24 },
        ],
      },
    ],
    live: [
      {
        id: 'live-7b',
        classId: '7b',
        title: '4.2 təkrarı',
        topicId: '4.2',
        startsAt: new Date(now.getTime() + 2 * 3_600_000).toISOString(),
        minutes: 45,
        present: 21,
        total: 24,
        participants: [
          { id: 'me', name: 'Lalə Həsənova', state: 'me' },
          { id: 'nermin', name: name('nermin'), state: 'muted' },
          { id: 'orxan', name: name('orxan'), state: 'hand' },
          { id: 'tural', name: name('tural'), state: 'weak' },
        ],
        hands: [
          { studentId: 'orxan', name: name('orxan'), at: minutesAgo(1) },
          { studentId: 'aysel', name: name('aysel'), at: minutesAgo(0) },
        ],
        board: [
          '(a + b)(a − b) = a² − b²',
          '(x + 4)(x − 4) = x² − 16',
          '51 · 49 = 50² − 1² = 2499',
        ],
        chatUnread: 3,
      },
    ],
    conversations: [
      {
        id: 'c-7b',
        kind: 'class',
        title: '7B · Riyaziyyat',
        unread: 3,
        messages: [
          {
            id: 'm1',
            author: null,
            text: 'Sabah ev tapşırığının son günüdür.',
            at: minutesAgo(180),
          },
          { id: 'm2', author: 'Nərmin Əliyeva', text: 'Göndərdim, müəllim.', at: minutesAgo(60) },
          {
            id: 'm3',
            author: 'Tural İ.',
            text: 'Üçüncü misal mənə aydın deyil.',
            at: minutesAgo(25),
          },
        ],
      },
      {
        id: 'c-sebine',
        kind: 'parent',
        title: 'Səbinə',
        child: 'Nərmin Əliyeva',
        unread: 1,
        messages: [
          {
            id: 'm1',
            author: null,
            text: 'Nərmin bu həftə çox yaxşı işləyib.',
            at: minutesAgo(200),
          },
          {
            id: 'm2',
            author: 'Səbinə',
            text: 'Təşəkkürlər, evdə də təkrarlayacağıq.',
            at: minutesAgo(120),
          },
        ],
      },
      {
        id: 'c-7a',
        kind: 'class',
        title: '7A · Riyaziyyat',
        unread: 0,
        messages: [
          {
            id: 'm1',
            author: null,
            text: 'Cümə günü bölmə sınağı olacaq.',
            at: minutesAgo(26 * 60),
          },
        ],
      },
      {
        id: 'c-orxan',
        kind: 'student',
        title: 'Orxan M.',
        unread: 0,
        messages: [
          {
            id: 'm1',
            author: 'Orxan M.',
            text: '4.2-ni yenə başa düşmədim.',
            at: minutesAgo(50 * 60),
          },
          {
            id: 'm2',
            author: null,
            text: 'Sabah dərsdən sonra birlikdə baxaq.',
            at: minutesAgo(49 * 60),
          },
        ],
      },
    ],
    notices: [
      { id: 'n1', kind: 'question', name: name('nermin'), at: minutesAgo(4) },
      { id: 'n2', kind: 'homework', count: 6, topicId: '4.1', at: minutesAgo(60) },
      { id: 'n3', kind: 'verification', at: minutesAgo(24 * 60) },
    ],
  };
}

/** A handed-in homework of 4.1 with three short lines and an AI first look. */
function submission(
  id: string,
  studentId: string,
  studentName: string,
  submittedAt: string,
  suggested: number,
  grade: number | null,
): Submission {
  const allRight = suggested === 10;
  return {
    id,
    assignmentId: 'hw41',
    studentId,
    studentName,
    submittedAt,
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
      suggested,
    },
    source: src('4.1', 83),
    grade,
    comment: '',
  };
}
