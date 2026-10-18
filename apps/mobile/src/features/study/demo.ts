// Demo data until the lessons, review and attempts APIs exist (architecture Ş4 lessons, Ş5
// topic test, Ş6 review and "Səhvlərim"). Every text here is our own short, generic maths
// (standard formulas and made-up exercises), never a textbook paragraph, example or exercise
// and never a test-book question: those come only from the API. Topic numbers, titles and
// start pages are the textbook's table of contents; the items themselves are marked "demo".
import type { PracticeTest, Question, SourceRef } from '@mytutor/types';
import type { MistakeGroup, ReviewPlan, SessionStep, StudyLesson, StudyTest } from './types';

export const DEMO_TEST_ID = 'demo';

const BOOK = 'Riyaziyyat 7 (TRİMS), 1-ci hissə';
const demoSource = (code: string, what: string) => `${BOOK} · ${code} · ${what}`;

const cube: StudyLesson = {
  id: 'riyaziyyat-7-4-3',
  topicCode: '4.3',
  topicTitle: 'Cəmin və fərqin kubu',
  source: `${BOOK} · 4.3 (s. 90) · demo dərs`,
  video: {
    source: null,
    title: 'Cəmin kubu necə açılır',
    minutes: 4,
    summary:
      '(a + b)³ ifadəsini (a + b)² · (a + b) kimi yazıb vururuq və dörd hədd alırıq. Sonra eyni yolla fərqin kubunu açırıq.',
    board: { heading: 'Cəmin kubu', formula: '(a + b)³ = a³ + 3a²b + 3ab² + b³' },
  },
  pages: [
    {
      heading: 'Cəmin və fərqin kubu',
      paragraphs: [
        '(a + b)³ = (a + b)² · (a + b). Kvadratı artıq bilirsən: a² + 2ab + b². İndi onu (a + b) ifadəsinə vururuq və oxşar hədləri toplayırıq.',
      ],
      rule: ['(a + b)³ = a³ + 3a²b + 3ab² + b³', '(a − b)³ = a³ − 3a²b + 3ab² − b³'],
      after: 'Fərqin kubunda işarələr növbə ilə dəyişir: +, −, +, −.',
      note: '(a + b)³ ilə a³ + b³ eyni deyil. Ortadakı 3a²b və 3ab² hədləri çox vaxt unudulur.',
      askVizi: 'Vızıdan soruş: niyə məhz 3?',
    },
    {
      heading: 'Kubların cəmi və fərqi',
      paragraphs: ['Bəzən əksi lazım olur: iki kubun cəmini və ya fərqini vuruqlara ayırmaq.'],
      rule: ['a³ + b³ = (a + b)(a² − ab + b²)', 'a³ − b³ = (a − b)(a² + ab + b²)'],
      after:
        'Yoxlamaq üçün sağdakı mötərizələri bir-birinə vur: oxşar hədlər ixtisar olunur, iki kub qalır.',
      note: null,
      askVizi: null,
    },
  ],
  example: {
    number: 1,
    problem: '(x − 2)³ ifadəsini çoxhədli şəklində yaz.',
    steps: [
      { title: 'Düsturu seç', body: '(a − b)³ = a³ − 3a²b + 3ab² − b³, burada a = x, b = 2.' },
      { title: 'Yerinə qoy', body: 'x³ − 3 · x² · 2 + 3 · x · 2² − 2³' },
      { title: 'Sadələşdir', body: 'x³ − 6x² + 12x − 8' },
    ],
    hint: 'Növbəti addımı açmazdan əvvəl özün sadələşdirməyə çalış.',
    source: demoSource('4.3', 'demo nümunə'),
  },
  exercise: {
    number: 1,
    prompt: 'Düsturdan istifadə edərək mötərizələri aç:',
    expression: '(a + 3b)³',
    answer: 'a³ + 9a²b + 27ab² + 27b³',
    variables: ['a', 'b'],
    source: demoSource('4.3', 'demo çalışma'),
  },
  points: 15,
  testId: DEMO_TEST_ID,
};

const square: StudyLesson = {
  id: 'riyaziyyat-7-4-1',
  topicCode: '4.1',
  topicTitle: 'Cəmin və fərqin kvadratı',
  source: `${BOOK} · 4.1 (s. 83) · demo dərs`,
  video: {
    source: null,
    title: 'Cəmin kvadratı necə açılır',
    minutes: 3,
    summary:
      '(a + b)² ifadəsini (a + b) · (a + b) kimi yazıb vururuq və üç hədd alırıq. Sonra fərqin kvadratını görürük.',
    board: { heading: 'Cəmin kvadratı', formula: '(a + b)² = a² + 2ab + b²' },
  },
  pages: [
    {
      heading: 'Cəmin və fərqin kvadratı',
      paragraphs: [
        '(a + b)² = (a + b) · (a + b). Birinci mötərizənin hər həddini ikincinin hər həddinə vururuq: a² + ab + ab + b². Oxşar hədləri toplayanda 2ab alınır.',
      ],
      rule: ['(a + b)² = a² + 2ab + b²', '(a − b)² = a² − 2ab + b²'],
      after: 'Fərqin kvadratında yalnız ortadakı həddin işarəsi dəyişir.',
      note: '(a + b)² ilə a² + b² eyni deyil: ortadakı 2ab həddi unudulmamalıdır.',
      askVizi: 'Vızıdan soruş: 2ab haradan gəlir?',
    },
  ],
  example: {
    number: 1,
    problem: '(x + 5)² ifadəsini çoxhədli şəklində yaz.',
    steps: [
      { title: 'Düsturu seç', body: '(a + b)² = a² + 2ab + b², burada a = x, b = 5.' },
      { title: 'Yerinə qoy', body: 'x² + 2 · x · 5 + 5²' },
      { title: 'Sadələşdir', body: 'x² + 10x + 25' },
    ],
    hint: 'Ortadakı hədd həmişə iki ədədin hasilinin ikiqatıdır: 2 · x · 5.',
    source: demoSource('4.1', 'demo nümunə'),
  },
  exercise: {
    number: 1,
    prompt: 'Düsturdan istifadə edərək mötərizələri aç:',
    expression: '(2a − b)²',
    answer: '4a² − 4ab + b²',
    variables: ['a', 'b'],
    source: demoSource('4.1', 'demo çalışma'),
  },
  points: 15,
  testId: DEMO_TEST_ID,
};

export const demoLessons: StudyLesson[] = [cube, square];

const questionSource: SourceRef = { kind: 'textbook', title: BOOK, section: '4.3 · demo sual' };

const choice = (
  id: string,
  stem: string,
  options: [string, string, string, string, string],
  correctKey: 'A' | 'B' | 'C' | 'D' | 'E',
  explanation: string | null,
): Question => ({
  id,
  topicId: 'demo-4.3',
  type: 'choice',
  stem,
  options: options.map((text, i) => ({
    key: (['A', 'B', 'C', 'D', 'E'] as const)[i] ?? 'A',
    text,
  })),
  correctKey,
  answer: null,
  explanation,
  figures: [],
  source: questionSource,
});

const questions: Question[] = [
  choice(
    'demo-q1',
    '(x + 2)³ ifadəsini çoxhədli şəklində yaz.',
    [
      'x³ + 8',
      'x³ + 2x² + 4x + 8',
      'x³ + 6x² + 12x + 8',
      'x³ + 12x² + 6x + 8',
      'x³ + 6x² + 6x + 8',
    ],
    'C',
    'a = x, b = 2 götür: x³ + 3 · x² · 2 + 3 · x · 2² + 2³ = x³ + 6x² + 12x + 8.',
  ),
  choice(
    'demo-q2',
    '(a − 3)² ifadəsini çoxhədli şəklində yaz.',
    ['a² − 9', 'a² − 6a + 9', 'a² + 6a + 9', 'a² − 3a + 9', 'a² − 6a − 9'],
    'B',
    null,
  ),
  {
    id: 'demo-q3',
    topicId: 'demo-4.3',
    type: 'open',
    stem: 'a + b = 4 və ab = 3 olarsa, a³ + b³ ifadəsinin qiymətini tap.',
    options: [],
    correctKey: null,
    answer: '28',
    explanation: 'a³ + b³ = (a + b)³ − 3ab(a + b) = 64 − 36 = 28.',
    figures: [],
    source: questionSource,
  },
];

const demoTest: PracticeTest = {
  id: DEMO_TEST_ID,
  topicId: 'demo-4.3',
  subjectId: 'riyaziyyat',
  title: 'Müxtəsər vurma düsturları',
  questions,
  math: {},
};

const extraSteps: SessionStep[] = [
  {
    kind: 'match',
    id: 'demo-match',
    prompt: 'Hər düsturu öz açılışı ilə birləşdir.',
    left: ['(a + b)³', '(a − b)³', 'a³ + b³'],
    right: ['a³ − 3a²b + 3ab² − b³', '(a + b)(a² − ab + b²)', 'a³ + 3a²b + 3ab² + b³'],
    pairs: [2, 0, 1],
    source: demoSource('4.3', 'demo sual'),
  },
  {
    kind: 'written',
    id: 'demo-written',
    prompt: '(x + 1)³ − 3x(x + 1) ifadəsini sadələşdir.',
    source: demoSource('4.3', 'demo tapşırıq'),
    reviewer: 'Lalə Həsənova',
  },
];

/** Choice, number, matching and a written solution: every kind of step the session can show. */
export const demoStudyTest: StudyTest = {
  test: demoTest,
  steps: [
    ...questions.map((q) => ({ kind: 'question' as const, id: q.id, question: q })),
    ...extraSteps,
  ],
  kind: 'demo',
  topicCode: '4.3',
};

export const demoReviewPlan: ReviewPlan = {
  due: [
    { code: '2.2', title: 'Qüvvətlərin vurulması' },
    { code: '3.1', title: 'Birhədlilər' },
    { code: '4.1', title: 'Cəmin kvadratı' },
  ],
  questionCount: 5,
  minutes: 5,
  example: {
    code: '4.2',
    title: 'İki ədədin cəmi ilə fərqinin hasili',
    masteredDaysAgo: 4,
    intervals: [2, 7, 21],
    done: 1,
  },
  upcoming: [
    { inDays: 1, cells: ['4.2'] },
    { inDays: 4, cells: ['3.4', '3.5'] },
    { inDays: 6, cells: [] },
  ],
};

/** Shown on "Səhvlərim" until the student finishes a test of their own. */
export function demoMistakeGroups(now = new Date()): MistakeGroup[] {
  const finishedAt = now.toISOString();
  return [
    {
      id: 'demo-4.3',
      title: '4.3 · Cəmin və fərqin kubu',
      cell: 'mastered',
      math: {},
      items: [
        {
          id: 'demo-m1',
          stem: '(x + 2)³ ifadəsini çoxhədli şəklində yaz.',
          yours: 'x³ + 12x² + 6x + 8',
          right: 'x³ + 6x² + 12x + 8',
          source: demoSource('4.3', 'demo sual'),
          explanation: 'a = x, b = 2 götür: x³ + 3 · x² · 2 + 3 · x · 2² + 2³.',
          subjectId: 'riyaziyyat',
          finishedAt,
        },
        {
          id: 'demo-m2',
          stem: 'b³ − 8 ifadəsini vuruqlara ayır.',
          yours: '(b − 2)(b² − 2b + 4)',
          right: '(b − 2)(b² + 2b + 4)',
          source: demoSource('4.3', 'demo sual'),
          explanation: null,
          subjectId: 'riyaziyyat',
          finishedAt,
        },
      ],
    },
    {
      id: 'demo-4.1',
      title: '4.1 · Cəmin və fərqin kvadratı',
      cell: 'needs_practice',
      math: {},
      items: [
        {
          id: 'demo-m3',
          stem: '(2a − b)² ifadəsini çoxhədli şəklində yaz.',
          yours: '4a² − b²',
          right: '4a² − 4ab + b²',
          source: demoSource('4.1', 'demo sual'),
          explanation: '(2a)² − 2 · 2a · b + b² = 4a² − 4ab + b².',
          subjectId: 'riyaziyyat',
          finishedAt,
        },
      ],
    },
  ];
}
