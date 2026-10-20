import { r7 } from '../ids';
import { lesson } from './lesson';

// Demo lessons 4.1 and 4.2: our own short texts on the standard formulas, not the book's.

export const lesson41 = lesson(r7('4.1'), {
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
  },
  exercise: {
    number: 1,
    prompt: 'Düsturdan istifadə edərək mötərizələri aç:',
    expression: '(2a − b)²',
    answer: '4a² − 4ab + b²',
    variables: ['a', 'b'],
  },
});

export const lesson42 = lesson(r7('4.2'), {
  video: {
    source: null,
    title: 'Cəmlə fərqin hasili',
    minutes: 3,
    summary:
      '(a + b)(a − b) hasilində ortadakı ab və −ab hədləri bir-birini ixtisar edir. Nəticədə kvadratlar fərqi qalır.',
    board: { heading: 'Kvadratlar fərqi', formula: '(a + b)(a − b) = a² − b²' },
  },
  pages: [
    {
      heading: 'İki ədədin cəmi ilə fərqinin hasili',
      paragraphs: [
        '(a + b)(a − b) hasilini açaq: a · a − a · b + b · a − b · b. Ortadakı −ab və +ab hədləri bir-birini ixtisar edir, a² − b² qalır.',
      ],
      rule: ['(a + b)(a − b) = a² − b²'],
      after: 'Düstur hesablamanı da asanlaşdırır: 51 · 49 = (50 + 1)(50 − 1) = 2500 − 1 = 2499.',
      note: '(a + b)(a − b) ilə (a − b)² eyni deyil: birincidə orta hədd yoxdur.',
      askVizi: 'Vızıdan soruş: orta hədlər hara getdi?',
    },
  ],
  example: {
    number: 1,
    problem: '(3x + 2)(3x − 2) hasilini çoxhədli şəklində yaz.',
    steps: [
      { title: 'Düsturu seç', body: '(a + b)(a − b) = a² − b², burada a = 3x, b = 2.' },
      { title: 'Yerinə qoy', body: '(3x)² − 2²' },
      { title: 'Sadələşdir', body: '9x² − 4' },
    ],
    hint: 'Birinci həddin kvadratından ikinci həddin kvadratını çıx.',
  },
  exercise: {
    number: 1,
    prompt: 'Hasili çoxhədli şəklində yaz:',
    expression: '(5a − b)(5a + b)',
    answer: '25a² − b²',
    variables: ['a', 'b'],
  },
});
