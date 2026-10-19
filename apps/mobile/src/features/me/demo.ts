import type {
  AssignmentDetail,
  ChatMessage,
  ClassFeed,
  ClassSummary,
  GuestOverview,
  LeagueTable,
  LiveSession,
  MeOverview,
  ParentLinkView,
  ParentRequest,
  PlanFeature,
  RankId,
  TextbookProgress,
} from './types';

/**
 * Demo data until the motivation, leaderboard, classes, messages, live, parent-link and
 * entitlement APIs exist (architecture Ş10, Ş11, V1, P2, P4). People, classes and progress
 * follow the design (Nərmin, 7B, Lalə Həsənova, Səbinə). No textbook or test-book text is
 * copied here: messages and tasks are short generic texts, and page numbers are placeholders.
 */

/** Points each rank starts at (the real ladder lives on the server, architecture P2). */
export const RANK_THRESHOLDS = [0, 500, 2000, 6000, 15000] as const;

export const demoOverview: MeOverview = {
  name: 'Nərmin',
  grade: 7,
  shields: 1,
  points: 2140,
  weekPoints: 340,
  honeyCells: 17,
  badges: [
    { id: 'firstHoney', icon: 'drop', fill: 'honey', ink: 'on-honey' },
    { id: 'week', icon: 'wing', fill: 'sealed', ink: 'on-sealed' },
    { id: 'precise', icon: 'target', fill: 'ok-bg', ink: 'ok' },
    { id: 'mock', icon: 'star', fill: 'info-bg', ink: 'info' },
  ],
  badgesTotal: 24,
  unreadInClasses: 3,
  league: { id: 'tulip', place: 6 },
  plan: 'free',
};

export const demoGuest: GuestOverview = { points: 85, honeyCells: 2 };

/** The default nickname of the demo student (league and class chat show only this). */
export const DEMO_NICKNAME = 'BalArısı_27';

export const demoTextbooks: TextbookProgress[] = [
  {
    id: 'riyaziyyat-7',
    title: 'Riyaziyyat 7',
    status: 'ready',
    topics: 26,
    units: 5,
    levels: {
      reinforced: 7,
      mastered: 8,
      lesson_completed: 1,
      needs_practice: 2,
      not_started: 8,
    },
  },
  {
    id: 'riyaziyyat-8',
    title: 'Riyaziyyat 8',
    status: 'ready',
    topics: 44,
    units: 11,
    levels: {
      reinforced: 0,
      mastered: 0,
      lesson_completed: 2,
      needs_practice: 0,
      not_started: 42,
    },
  },
  {
    id: 'fizika-7',
    title: 'Fizika',
    status: 'soon',
    topics: 0,
    units: 0,
    levels: { reinforced: 0, mastered: 0, lesson_completed: 0, needs_practice: 0, not_started: 0 },
  },
];

/** Anonymous comparison: the share of the class the student practised more than this week. */
export const demoClassComparison = 70;

const countryNicknames = [
  'Pətəkçi_09',
  'MəktəbArısı',
  'Nektar_11',
  'QızılPətək',
  'Uçan_Ləçək',
  DEMO_NICKNAME,
  'Çiçəkçi_5',
  'Arıcıq_3',
  'BalDamcısı',
  'Gülşən_Arı',
  'Pətək_77',
  'SarıQanad',
  'Mumcuq',
  'Nektarçı',
  'Yonca_12',
  'KiçikArı',
  'Səhər_Arısı',
  'Çiçək_8',
  'Arı_Rəna',
  'Bal_Kamal',
];
const countryPoints = [
  1240, 1185, 1050, 990, 935, 860, 820, 790, 760, 720, 690, 655, 610, 580, 540, 410, 380, 300, 210,
  120,
];

export const demoLeague: Record<'country' | 'class', LeagueTable> = {
  country: {
    league: 'tulip',
    place: 6,
    daysLeft: 2,
    promote: 5,
    demote: 5,
    rows: countryNicknames.map((nickname, i) => ({
      place: i + 1,
      nickname,
      points: countryPoints[i] ?? 0,
      me: nickname === DEMO_NICKNAME,
    })),
  },
  class: {
    league: 'tulip',
    place: 2,
    daysLeft: 2,
    promote: 0,
    demote: 0,
    rows: [
      { place: 1, nickname: 'Riyaziyyatçı_7B', points: 910 },
      { place: 2, nickname: DEMO_NICKNAME, points: 860, me: true },
      { place: 3, nickname: 'Ayçiçək', points: 640 },
      { place: 4, nickname: 'Pətəkçi_09', points: 515 },
      { place: 5, nickname: 'Arıcıq_3', points: 380 },
      { place: 6, nickname: 'Mumcuq', points: 240 },
    ],
  },
};

export const demoClasses: ClassSummary[] = [
  {
    id: '7b',
    short: '7B',
    name: '7B · Riyaziyyat',
    teacher: 'Lalə Həsənova',
    teacherInitials: 'LH',
    students: 28,
    unread: 3,
    newMessages: 2,
    newAnnouncements: 1,
    nextAssignment: { title: 'Test: 4.2 · İki ədədin cəmi ilə fərqinin hasili', due: { day: 4 } },
    nextLive: { day: 2, time: '18:00' },
    jar: { percent: 68, done: 136, goal: 200, mine: 9 },
  },
];

/** Invite codes a teacher shares, by the class they open (demo: one class). */
export const demoJoinCodes: Record<string, string> = { R4T9KB: '7b' };

export const demoFeeds: Record<string, ClassFeed> = {
  '7b': {
    announcement: {
      id: 'ann-1',
      text: 'Cümə günü 4-cü çərçivə üzrə qısa test olacaq. 4.1–4.3-ü təkrarlayın, suallarınızı söhbətdə yazın.',
      time: { day: 'today', time: '09:12' },
    },
    live: { id: 'live-4-3', when: { day: 2, time: '18:00' }, topic: '4.3' },
    recording: {
      id: 'rec-4-2',
      date: '2026-10-15',
      title: '4.2 · İki ədədin cəmi ilə fərqinin hasili',
      minutes: 38,
    },
    assignments: [
      {
        id: 'test-4-2',
        kind: 'test',
        topic: '4.2',
        title: 'İki ədədin cəmi ilə fərqinin hasili',
        questions: 10,
        due: { day: 4, time: '20:00' },
        status: 'not_started',
        testId: 'riyaziyyat-7-4-2',
      },
      {
        id: 'hw-4-1',
        kind: 'homework',
        topic: '4.1',
        title: 'Ev tapşırığı: 4.1 çalışmaları',
        due: { day: 'tomorrow', time: '23:59' },
        status: 'checked',
        grade: { score: 9, max: 10 },
      },
    ],
    materials: [
      { id: 'mat-1', kind: 'file', title: '4.1-calismalar.pdf', meta: '240 KB' },
      { id: 'mat-2', kind: 'lesson', title: '4.3 · Cəmin və fərqin kubu', meta: 'Lalə Həsənova' },
    ],
  },
};

export const demoAssignments: Record<string, AssignmentDetail> = {
  'hw-4-1': {
    id: 'hw-4-1',
    classId: '7b',
    className: '7B · Riyaziyyat',
    title: 'Ev tapşırığı: 4.1 çalışmaları',
    description:
      'Dərslikdən 4.1 bölməsinin üç çalışmasını həll et. Həlli dəftərə yaz, şəklini çək və göndər.',
    due: { day: 'tomorrow', time: '23:59' },
    status: 'checked',
    topic: {
      id: 'riyaziyyat-7-4-1',
      number: '4.1',
      title: 'Cəmin və fərqin kvadratı',
      source: 'Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.1 · s. —',
    },
    attachment: { name: '4.1-calismalar.pdf', size: '240 KB' },
    submission: { sentAt: { day: 'yesterday', time: '21:14' }, photos: 2 },
    feedback: {
      teacher: 'Lalə Həsənova',
      initials: 'LH',
      time: { day: 'today', time: '08:30' },
      score: 9,
      max: 10,
      text: 'Çox səliqəlidir! Son çalışmada (a − b)² açılışında işarəyə bax: orta hədd −2ab olmalıdır.',
    },
  },
};

export const demoMessages: Record<string, ChatMessage[]> = {
  '7b': [
    {
      id: 'm1',
      author: 'Lalə Həsənova',
      initials: 'LH',
      role: 'teacher',
      text: 'Sabahkı canlı dərsdə 4.3-ü keçəcəyik. Sualınız varsa, bu gün yazın.',
      time: '09:40',
    },
    {
      id: 'm2',
      author: 'Aysel M.',
      initials: 'A',
      role: 'student',
      text: '(a − 3)² açanda a² − 6a + 9 alınır?',
      time: '09:44',
    },
    {
      id: 'm3',
      author: 'Tural R.',
      initials: 'T',
      role: 'student',
      text: 'Testin cavablarını kim atsın, hamımız köçürək',
      time: '09:47',
    },
    {
      id: 'm4',
      author: 'Nərmin',
      initials: 'N',
      role: 'student',
      mine: true,
      text: 'Mən də eyni cavabı aldım',
      time: '09:52',
      replyTo: 'Aysel M.',
    },
  ],
};

export const demoLive: Record<string, LiveSession> = {
  'live-4-3': {
    id: 'live-4-3',
    classId: '7b',
    title: '4.3 Cəmin və fərqin kubu',
    teacher: 'Lalə Həsənova',
    initials: 'LH',
    className: '7B',
    time: '18:00–18:45',
    participants: 24,
    unreadChat: 3,
    network: 'weak',
    board: {
      lines: [
        { text: '(a + b)³ = a³ + 3a²b + 3ab² + b³', tone: 'ink', size: 'lg' },
        { text: '(2x + 1)³ = (2x)³ + 3·(2x)²·1 + 3·2x·1² + 1³', tone: 'honey', size: 'md' },
        { text: '= 8x³ + 12x² + 6x + 1', tone: 'honey', size: 'lg', indent: true },
      ],
    },
    source: 'Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.3 · s. —',
  },
};

export const demoParentLinks: ParentLinkView[] = [
  { id: 'p-sabina', name: 'Səbinə', relation: 'mother', since: '2026-09-03' },
];

/** The request a parent sends by typing the student's code (demo: arrives once a code exists). */
export const demoParentRequest: ParentRequest = {
  id: 'p-elchin',
  name: 'Elçin',
  relation: 'father',
};

/** A parent-link code is valid for ten minutes (design "10 dəqiqə etibarlıdır"). */
export const PARENT_CODE_TTL_MS = 10 * 60 * 1000;

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** A demo code; the server issues real ones. Letters that look alike (O/0, I/1) are left out. */
export function makeParentCode(random: () => number = Math.random): string {
  return Array.from(
    { length: 6 },
    () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)] ?? 'A',
  ).join('');
}

export const demoPlanFeatures: PlanFeature[] = [
  { id: 'lessons', free: 'yes', premium: 'yes' },
  { id: 'review', free: 'yes', premium: 'yes' },
  { id: 'askAi', free: 'limited', premium: 'unlimited' },
  { id: 'askPhoto', free: 'limited', premium: 'unlimited' },
  { id: 'examPlan', free: 'basic', premium: 'full' },
  { id: 'videos', free: 'some', premium: 'all' },
  { id: 'offline', free: 'no', premium: 'yes' },
];

/** The "new rank" moment of the demo: Bal ustası at 6 000 points. */
export const demoReward: { rank: RankId; points: number; shields: number; badge: 'sealMaster' } = {
  rank: 'honeyMaster',
  points: 6000,
  shields: 1,
  badge: 'sealMaster',
};
