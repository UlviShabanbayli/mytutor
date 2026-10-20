import { r7 } from '../ids';
import { lesson } from './lesson';

// Demo lesson 4.3: our own short text on the cube formulas, not the book's.

export const lesson43 = lesson(r7('4.3'), {
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
  },
  exercise: {
    number: 1,
    prompt: 'Düsturdan istifadə edərək mötərizələri aç:',
    expression: '(a + 3b)³',
    answer: 'a³ + 9a²b + 27ab² + 27b³',
    variables: ['a', 'b'],
  },
});
