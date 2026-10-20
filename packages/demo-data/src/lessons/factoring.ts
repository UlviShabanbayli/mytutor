import { r7 } from '../ids';
import { lesson } from './lesson';

// Demo lessons 4.4 and 4.5: our own short texts on factoring, not the book's.

export const lesson44 = lesson(r7('4.4'), {
  video: {
    source: null,
    title: 'Ortaq vuruğu mötərizə xaricinə çıxarmaq',
    minutes: 4,
    summary:
      'Hər həddə olan ortaq vuruğu tapıb mötərizə xaricinə çıxarırıq. Sonra hədləri qruplaşdıraraq daha uzun çoxhədliləri də vuruqlara ayırırıq.',
    board: { heading: 'Ortaq vuruq', formula: 'ab + ac = a(b + c)' },
  },
  pages: [
    {
      heading: 'Ortaq vuruq',
      paragraphs: [
        '6x² + 9x çoxhədlisinin hər iki həddində 3 və x var. Ortaq vuruq 3x-dir: 6x² = 3x · 2x, 9x = 3x · 3.',
      ],
      rule: ['ab + ac = a(b + c)'],
      after: 'Deməli 6x² + 9x = 3x(2x + 3). Yoxlamaq üçün mötərizəni aç.',
      note: 'Ortaq vuruğu çıxaranda heç bir hədd itmir: x² + x = x(x + 1), sondakı 1-i unutma.',
      askVizi: 'Vızıdan soruş: ortaq vuruğu necə tapım?',
    },
    {
      heading: 'Qruplaşdırma üsulu',
      paragraphs: [
        'ax + ay + bx + by çoxhədlisində hədləri cüt-cüt qruplaşdırırıq: a(x + y) + b(x + y).',
      ],
      rule: ['ax + ay + bx + by = (x + y)(a + b)'],
      after: 'İndi (x + y) ortaq vuruqdur və onu da mötərizə xaricinə çıxarırıq.',
      note: null,
      askVizi: null,
    },
  ],
  example: {
    number: 1,
    problem: '10a²b − 15ab² ifadəsini vuruqlara ayır.',
    steps: [
      {
        title: 'Ortaq vuruğu tap',
        body: '10 və 15-in ən böyük ortaq böləni 5-dir, hər iki həddə a və b var: 5ab.',
      },
      { title: 'Hər həddi böl', body: '10a²b : 5ab = 2a, 15ab² : 5ab = 3b' },
      { title: 'Yaz', body: '5ab(2a − 3b)' },
    ],
    hint: 'Ortaq vuruğa həm ədədin, həm də hərflərin ən kiçik qüvvəti daxildir.',
  },
  exercise: {
    number: 1,
    prompt: 'Ortaq vuruğu mötərizə xaricinə çıxar:',
    expression: '4x³ − 8x²',
    answer: '4x²(x − 2)',
    variables: ['x'],
  },
});

export const lesson45 = lesson(r7('4.5'), {
  video: {
    source: null,
    title: 'Düsturları tərsinə oxumaq',
    minutes: 4,
    summary:
      'Müxtəsər vurma düsturlarını sağdan sola oxuyuruq: kvadratlar fərqi, tam kvadrat, kublar cəmi və fərqi. Belə çoxhədliləri bir addımda vuruqlara ayırırıq.',
    board: { heading: 'Kvadratlar fərqi', formula: 'a² − b² = (a − b)(a + b)' },
  },
  pages: [
    {
      heading: 'Düsturlarla vuruqlara ayırma',
      paragraphs: [
        'Hər düsturu tərsinə oxumaq olar. x² − 25 kvadratlar fərqidir: x² − 5². a² + 6a + 9 isə tam kvadratdır: a² + 2 · a · 3 + 3².',
      ],
      rule: ['a² − b² = (a − b)(a + b)', 'a² + 2ab + b² = (a + b)²', 'a² − 2ab + b² = (a − b)²'],
      after: 'Kubların cəmi və fərqi də belə oxunur: a³ − b³ = (a − b)(a² + ab + b²).',
      note: 'a² + b² kvadratlar cəmidir və bu düsturlarla vuruqlara ayrılmır.',
      askVizi: 'Vızıdan soruş: tam kvadratı necə tanıyım?',
    },
  ],
  example: {
    number: 1,
    problem: '4x² − 12x + 9 ifadəsini vuruqlara ayır.',
    steps: [
      { title: 'Kvadratları tap', body: '4x² = (2x)², 9 = 3²' },
      { title: 'Orta həddi yoxla', body: '2 · 2x · 3 = 12x, işarəsi mənfidir.' },
      { title: 'Yaz', body: '(2x − 3)²' },
    ],
    hint: 'Əvvəl kənar hədlərin kvadrat olub-olmadığına bax, sonra orta həddi yoxla.',
  },
  exercise: {
    number: 1,
    prompt: 'Vuruqlara ayır:',
    expression: '9a² − b²',
    answer: '(3a − b)(3a + b)',
    variables: ['a', 'b'],
  },
});
