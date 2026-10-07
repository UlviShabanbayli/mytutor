import type { PracticeTest, SourceRef, Subject, Topic } from '@mytutor/types';

// DEMO CONTENT ONLY. Real questions will be paraphrased from the textbooks and test banks
// the team provides, each citing its exact source. Until then these few self-evident
// arithmetic items exist only so the UI can be exercised end to end.

export const DEMO_SOURCE: SourceRef = { kind: 'textbook', title: 'Demo' };

export const demoSubjects: Subject[] = [
  { id: 'math', title: 'Riyaziyyat', icon: 'calculator', topicCount: 3, questionCount: 9 },
  { id: 'az-lang', title: 'Azərbaycan dili', icon: 'book', topicCount: 0, questionCount: 0 },
  { id: 'english', title: 'İngilis dili', icon: 'language', topicCount: 0, questionCount: 0 },
  { id: 'physics', title: 'Fizika', icon: 'magnet', topicCount: 0, questionCount: 0 },
  { id: 'chemistry', title: 'Kimya', icon: 'flask', topicCount: 0, questionCount: 0 },
  { id: 'biology', title: 'Biologiya', icon: 'leaf', topicCount: 0, questionCount: 0 },
  { id: 'history', title: 'Tarix', icon: 'time', topicCount: 0, questionCount: 0 },
  { id: 'geography', title: 'Coğrafiya', icon: 'earth', topicCount: 0, questionCount: 0 },
];

export const demoTopics: Topic[] = [
  { id: 'math-linear', subjectId: 'math', title: 'Xətti tənliklər', grade: 7, questionCount: 5 },
  { id: 'math-percent', subjectId: 'math', title: 'Faizlər', grade: 6, questionCount: 4 },
  { id: 'math-fractions', subjectId: 'math', title: 'Adi kəsrlər', grade: 5, questionCount: 0 },
];

type DemoItem = [
  stem: string,
  options: [string, string, string, string, string],
  correct: number,
  explanation: string,
];

function buildTest(topic: Topic, items: DemoItem[]): PracticeTest {
  const keys = ['A', 'B', 'C', 'D', 'E'] as const;
  return {
    id: topic.id,
    topicId: topic.id,
    subjectId: topic.subjectId,
    title: topic.title,
    questions: items.map(([stem, options, correct, explanation], i) => ({
      id: `${topic.id}-${i + 1}`,
      topicId: topic.id,
      stem,
      options: options.map((text, j) => ({ key: keys[j] ?? 'E', text })),
      correctKey: keys[correct] ?? 'A',
      explanation,
      source: DEMO_SOURCE,
    })),
  };
}

const [linear, percent] = demoTopics as [Topic, Topic, Topic];

export const demoTests: PracticeTest[] = [
  buildTest(linear, [
    [
      '2x + 3 = 11 tənliyini həll edin.',
      ['3', '4', '5', '7', '8'],
      1,
      '2x = 11 − 3 = 8, deməli x = 8 : 2 = 4.',
    ],
    [
      '5x − 7 = 3x + 9 tənliyinin kökünü tapın.',
      ['2', '4', '6', '8', '16'],
      3,
      '5x − 3x = 9 + 7, yəni 2x = 16 və x = 8.',
    ],
    [
      '3(x − 2) = 12 olarsa, x neçədir?',
      ['6', '2', '4', '8', '14'],
      0,
      'Hər tərəfi 3-ə bölək: x − 2 = 4, deməli x = 6.',
    ],
    [
      'x : 4 + 1 = 3 tənliyini həll edin.',
      ['2', '4', '8', '12', '16'],
      2,
      'x : 4 = 3 − 1 = 2, deməli x = 2 · 4 = 8.',
    ],
    [
      '7 − x = 2x + 1 tənliyinin kökü hansıdır?',
      ['−2', '1', '2', '3', '6'],
      2,
      '7 − 1 = 2x + x, yəni 3x = 6 və x = 2.',
    ],
  ]),
  buildTest(percent, [
    ['200 ədədinin 15%-i neçədir?', ['30', '15', '20', '35', '45'], 0, '200 · 15 : 100 = 30.'],
    [
      '40 ədədi 160-ın neçə faizini təşkil edir?',
      ['4%', '20%', '25%', '30%', '40%'],
      2,
      '40 : 160 = 0,25, yəni 25%.',
    ],
    [
      '80 manatlıq məhsulun qiyməti 10% artdı. Yeni qiymət neçə manatdır?',
      ['8', '82', '88', '90', '96'],
      2,
      '80-in 10%-i 8 manatdır, 80 + 8 = 88.',
    ],
    ['20%-i 14 olan ədədi tapın.', ['28', '70', '56', '84', '140'], 1, '14 : 20 · 100 = 70.'],
  ]),
];
