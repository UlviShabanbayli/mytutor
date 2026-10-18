/*
 * Demo data until the curriculum, progress and placement APIs exist (architecture Ş3,
 * "Öyrənmə modeli"). Unit and topic names, their order and the two page numbers are the
 * design's demo content for Riyaziyyat 7 (TRİMS, 1-ci hissə); the mastery levels are the demo
 * student Nərmin's. No lesson, exercise or test-book text is in here: the placement questions
 * are short, generic maths written for the demo, and real questions come only from the API.
 */
import type {
  Hive,
  HiveTopic,
  HiveUnit,
  MasteryLevel,
  PlacementQuestion,
  SubjectEntry,
  TeacherMaterial,
  Textbook,
  TopicStep,
  UnitTest,
} from './types';

export const DEMO_HIVE_ID = 'riyaziyyat-7';
/** The grade the demo has a textbook for; every other grade shows "hazırlanır". */
export const DEMO_GRADE = 7;

const UNITS: [string, string, string[]][] = [
  [
    '1',
    'Rasional ədədlər',
    [
      'Rasional ədədlər',
      'Onluq kəsr şəklində yazılış',
      'Müqayisə və sıralama',
      'Toplama və çıxma',
      'Vurma və bölmə',
      'Ədədi ifadələrin qiyməti',
    ],
  ],
  [
    '2',
    'Natural üstlü qüvvət',
    [
      'Natural üstlü qüvvət',
      'Qüvvətlərin vurulması və bölünməsi',
      'Hasilin və kəsrin qüvvəti',
      'Mürəkkəb faizin hesablanması',
    ],
  ],
  [
    '3',
    'Birhədlilər və çoxhədlilər',
    [
      'Birhədlilər',
      'Çoxhədlilər',
      'Toplanması və çıxılması',
      'Birhədlinin çoxhədliyə vurulması',
      'Çoxhədlinin çoxhədliyə vurulması',
    ],
  ],
  [
    '4',
    'Müxtəsər vurma düsturları',
    [
      'Cəmin və fərqin kvadratı',
      'İki ədədin cəmi ilə fərqinin hasili',
      'Cəmin və fərqin kubu. Kublar cəmi və fərqi',
      'Çoxhədlilərin vuruqlara ayrılması',
      'Düsturlarla vuruqlara ayırma',
    ],
  ],
  [
    '5',
    'Dördbucaqlılar',
    [
      'Həndəsənin ilkin anlayışları',
      'Dördbucaqlılar',
      'Paraleloqram',
      'Paraleloqramın növləri',
      'Orta xətt və medianlar',
      'Trapesiya',
    ],
  ],
];

const SEALED = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2.1', '3.3'];
const HONEY = ['2.3', '2.4', '3.2', '3.4', '3.5', '4.1', '4.2'];
const CRYSTAL = ['2.2', '3.1'];
const CURRENT = '4.3';
const PAGES: Record<string, number> = { '4.1': 83, '4.3': 90 };
const PREREQUISITES: Record<string, string[]> = { '4.3': ['4.1', '3.5'] };
const SAVED = ['3.1', '3.2', '3.3', '3.4', '3.5', '4.1', '4.2', '4.3'];
const SEALED_UNIT_TESTS = ['1', '2', '3'];

const topicId = (number: string) => `${DEMO_HIVE_ID}.${number}`;
const unitId = (number: string) => `${DEMO_HIVE_ID}.u${number}`;

function levelOf(number: string): MasteryLevel {
  if (SEALED.includes(number)) return 'reinforced';
  if (HONEY.includes(number)) return 'mastered';
  if (CRYSTAL.includes(number)) return 'needs_practice';
  if (number === CURRENT) return 'lesson_completed';
  return 'not_started';
}

/** The four steps as far as the topic's level says; 4.3 is the design's half-done topic. */
function stepsFor(number: string, level: MasteryLevel): TopicStep[] {
  const lesson: TopicStep = { kind: 'lesson', state: 'todo', minutes: 7 };
  const examples: TopicStep = { kind: 'examples', state: 'todo', total: 3, done: 0, minutes: 5 };
  const practice: TopicStep = { kind: 'practice', state: 'todo', total: 8, done: 0, minutes: 8 };
  const test: TopicStep = { kind: 'test', state: 'todo' };
  if (number === CURRENT)
    return [
      { ...lesson, state: 'done' },
      { ...examples, state: 'current', done: 2, minutes: 4 },
      practice,
      test,
    ];
  if (level === 'not_started') return [{ ...lesson, state: 'current' }, examples, practice, test];
  if (level === 'lesson_completed')
    return [{ ...lesson, state: 'done' }, { ...examples, state: 'current' }, practice, test];
  return [lesson, examples, practice, test].map((s) => ({
    ...s,
    state: 'done' as const,
    done: s.total,
  }));
}

const LALA_VIDEO: TeacherMaterial = {
  id: 'mat-kub-misal',
  teacher: 'Lalə Həsənova',
  teacherShort: 'Lalə',
  className: '7B',
  title: 'Kublar cəmi: lövhədə 3 misal',
  duration: '6:40',
  addedDaysAgo: 2,
};

function buildUnit([number, title, topics]: [string, string, string[]]): HiveUnit {
  const unitTest: UnitTest = {
    level: SEALED_UNIT_TESTS.includes(number) ? 'reinforced' : 'not_started',
  };
  return {
    id: unitId(number),
    number,
    title,
    unitTest,
    topics: topics.map((topicTitle, i): HiveTopic => {
      const n = `${number}.${i + 1}`;
      const level = levelOf(n);
      const previous = i > 0 ? [topicId(`${number}.${i}`)] : [];
      return {
        id: topicId(n),
        number: n,
        title: topicTitle,
        page: PAGES[n],
        level,
        prerequisites: PREREQUISITES[n]?.map(topicId) ?? previous,
        steps: stepsFor(n, level),
        material: n === CURRENT ? LALA_VIDEO : undefined,
      };
    }),
  };
}

const TEXTBOOKS: Textbook[] = [
  { id: 'trims', name: 'TRİMS', parts: 2, ready: true, readyPart: 1, topicCount: 26 },
  { id: 'radius', name: 'Radius', parts: 1, ready: false },
];

export const demoHive: Hive = {
  id: DEMO_HIVE_ID,
  subjectId: 'riyaziyyat',
  subjectName: 'Riyaziyyat',
  grade: DEMO_GRADE,
  textbookId: 'trims',
  part: 1,
  textbooks: TEXTBOOKS,
  units: UNITS.map(buildUnit),
  currentTopicId: topicId(CURRENT),
  savedTopicIds: SAVED.map(topicId),
};

/** Subjects of the demo grade that have no textbook in the app yet. */
export const demoPreparingSubjects: SubjectEntry[] = (
  [
    ['azerbaycan-dili', 'Azərbaycan dili', 'Az'],
    ['ingilis-dili', 'İngilis dili', 'İn'],
    ['fizika', 'Fizika', 'Fi'],
    ['biologiya', 'Biologiya', 'Bi'],
    ['tarix', 'Tarix', 'Ta'],
    ['cografiya', 'Coğrafiya', 'Co'],
  ] as const
).map(([id, name, monogram]) => ({
  id: `${id}-${DEMO_GRADE}`,
  name,
  monogram,
  grade: DEMO_GRADE,
}));

/** Unit test results the test flow would report (the unit-done moment shows them). */
export const demoUnitResults: Record<string, UnitTest['result']> = {
  [unitId('1')]: { correct: 11, total: 12, points: 75 },
  [unitId('2')]: { correct: 10, total: 12, points: 70 },
  [unitId('3')]: { correct: 12, total: 12, points: 90 },
  [unitId('4')]: { correct: 11, total: 12, points: 80, badge: 'Düstur ustası' },
};

const q = (
  unit: string,
  topic: string,
  prompt: string,
  options: string[],
  answer: number,
): PlacementQuestion => ({
  id: `pq-${topic}`,
  unitId: unitId(unit),
  topicId: topicId(topic),
  prompt,
  options,
  answer,
});

/** Three questions per unit, one for each of its first three topics, easiest first. */
export const demoPlacementQuestions: PlacementQuestion[] = [
  q('1', '1.1', 'Hansı ədəd rasional ədəddir?', ['√2', 'π', '−3/4', '√5', '√3'], 2),
  q(
    '1',
    '1.2',
    '3/5 kəsrini onluq kəsr şəklində yazın.',
    ['0,35', '0,6', '0,53', '3,5', '0,06'],
    1,
  ),
  q(
    '1',
    '1.3',
    'Hansı bərabərsizlik doğrudur?',
    ['−2 > −1', '−0,5 < −0,7', '−1/2 > −1/3', '−3 < −2', '0 < −1'],
    3,
  ),
  q('2', '2.1', '2⁴ neçəyə bərabərdir?', ['8', '6', '16', '32', '24'], 2),
  q('2', '2.2', 'a³ · a⁵ ifadəsini sadələşdirin.', ['a⁸', 'a¹⁵', 'a²', '2a⁸', 'a⁶'], 0),
  q('2', '2.3', '(2x)³ ifadəsini sadələşdirin.', ['2x³', '6x³', '8x³', '8x', '6x'], 2),
  q(
    '3',
    '3.1',
    '3a · 4a² birhədlisini standart şəklə salın.',
    ['7a³', '12a²', '12a³', '7a²', '12a'],
    2,
  ),
  q(
    '3',
    '3.2',
    '2x + 3y − x + y çoxhədlisini sadələşdirin.',
    ['x + 4y', '3x + 4y', 'x + 2y', 'x − 4y', '2x + 4y'],
    0,
  ),
  q(
    '3',
    '3.3',
    '(5a + 2) + (3a − 7) cəmini tapın.',
    ['8a + 9', '8a − 5', '2a − 5', '8a − 9', '15a − 14'],
    1,
  ),
  q(
    '4',
    '4.1',
    '(y + 4)² ifadəsini çoxhədli şəklində yazın.',
    ['y² + 16', 'y² + 8y + 16', 'y² + 4y + 16', 'y² − 8y + 16', '2y + 8'],
    1,
  ),
  q(
    '4',
    '4.2',
    '(a − 5)(a + 5) hasilini tapın.',
    ['a² − 25', 'a² + 25', 'a² − 10a + 25', 'a² − 5', '2a − 25'],
    0,
  ),
  q(
    '4',
    '4.3',
    'Cəmin kubu düsturu ilə (b + 1)³ ifadəsini açın.',
    ['b³ + 1', 'b³ + 3b² + 3b + 1', 'b³ + 3b + 1', 'b³ + b² + b + 1', '3b³ + 1'],
    1,
  ),
  q(
    '5',
    '5.1',
    'Kəsişən iki düz xəttin qonşu bucaqlarından biri 40°-dir. O biri neçə dərəcədir?',
    ['40°', '50°', '140°', '180°', '320°'],
    2,
  ),
  q(
    '5',
    '5.2',
    'Qabarıq dördbucaqlının daxili bucaqlarının cəmi neçə dərəcədir?',
    ['180°', '270°', '360°', '540°', '720°'],
    2,
  ),
  q(
    '5',
    '5.3',
    'Paraleloqramın bir bucağı 70°-dir. Ona qonşu bucaq neçə dərəcədir?',
    ['70°', '90°', '110°', '140°', '290°'],
    2,
  ),
];

/** Recent searches of the demo student. */
export const demoRecentSearches = ['paraleloqram', 'mürəkkəb faiz', 'birhədli'];
