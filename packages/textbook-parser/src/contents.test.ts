import { describe, expect, it } from 'vitest';
import { readContents, type Contents } from './contents';
import type { TextItem } from './types';

const on =
  (page: number) =>
  (text: string, x: number, y: number, size = 10, width = text.length * size * 0.5): TextItem => ({
    page,
    text,
    x,
    y,
    size,
    width,
    isLabel: false,
    decoded: true,
  });

const summary = (c: Contents) => ({
  pages: c.pages,
  units: c.units.map((u) => [
    u.number,
    u.title,
    u.entries.map((e) => [e.kind ?? e.number, e.title, e.printedPage]),
  ]),
  back: c.back.map((e) => [e.kind, e.title, e.printedPage]),
});

// Two columns, unit digits left of their titles, titles without numbers, dot leaders in the
// title's own run, a title broken by formula runs, and figure labels on the page.
const p = on(6);
const twoColumns = [
  p('Mündəricat', 187, 633, 16),
  p('Kvadrat kök. Həqiqi ədədlər', 65, 603, 12),
  p('1', 37, 601, 18),
  p('Dördbucaqlılar', 275, 604, 12),
  p('4', 247, 603, 18),
  p('Kvadrat köklər. Hesabi kvadrat kök............7', 33, 579, 10, 178),
  p('Dördbucaqlılar ......................71', 241, 580, 10, 183),
  p('Həqiqi ədədlər .................11', 33, 567, 10, 183),
  p('Dördbucaqlının daxili və', 241, 568, 10, 100),
  p('y', 33, 555, 10, 4),
  p('=', 40, 555, 10, 6),
  p('x', 49, 555, 10, 4),
  p('2', 53, 558, 6, 3),
  p('və', 58, 555, 10, 9),
  p('y = √x', 70, 555, 10, 24),
  p('funksiyaları........18', 97, 555, 10, 118),
  p('xarici bucaqları..........72', 241, 556, 10, 183),
  p('Ümumiləşdirici tapşırıqlar ......32', 33, 543, 10, 183),
  p('Ümumiləşdirici tapşırıqlar ......90', 241, 544, 10, 183),
  p('Rasional ifadələr və', 260, 520, 12),
  p('5', 229, 512, 18),
  p('tənliklər', 260, 506, 12),
  p('Rasional ifadələr .........93', 240, 490, 10, 183),
  p('y', 240, 478, 10, 4),
  p('=', 247, 478, 10, 6),
  p('funksiyası və onun qrafiki......111', 270, 478, 10, 157),
  p('Bölmələr üzrə ümumiləşdirici', 243, 466, 10, 120),
  p('tapşırıqlar..............127', 243, 454, 10, 171),
  p('Cavablar ................134', 243, 442, 10, 171),
  p('9,2 m', 324, 400, 10, 23),
  p('4,5 m', 296, 390, 10, 23),
];

// Topic numbers left of titles, page numbers in their own column, each unit's page number
// printed large right of its title, and one page number set in the title's run.
const t = on(4);
const numbered = [
  t('MÜNDƏRİCAT', 106, 731, 16),
  t('Funksiya', 82, 683, 14),
  t('5', 295, 681, 20),
  t('İlkin yoxlama', 109, 658, 11, 63),
  t('6', 298, 658, 11, 6),
  t('6.1.', 75, 644, 12, 17),
  t('Funksiya', 109, 645, 11, 42),
  t('7', 298, 645, 11, 6),
  t('6.2.', 75, 631, 12, 19),
  t('Funksiyanın qrafiki', 109, 631, 11, 90),
  t('11', 292, 631, 11, 12),
  t('Xülasə', 109, 605, 11, 31),
  t('19', 292, 605, 11, 12),
  t('Çevrə, dairə və kürə', 82, 522, 14),
  t('23', 283, 519, 20),
  t('7.1.', 75, 482, 12, 17),
  t('Çevrə', 109, 482, 11, 27),
  t('25', 293, 482, 11, 12),
  t('7.2.', 75, 468, 12, 19),
  t('Mərkəzi bucaq. Daxilə çəkilmiş bucaq 29', 109, 469, 11, 196),
  t('7.3.', 75, 454, 12, 19),
  t('Vətərlər, kəsən və toxunanlar', 109, 455, 11, 140),
  t('arasındakı bucaqlar', 109, 442, 11, 94),
  t('33', 293, 442, 11, 12),
];

describe('readContents', () => {
  it('reads unnumbered topics in two columns, with unit digits and back matter', () => {
    expect(summary(readContents(twoColumns, 244))).toEqual({
      pages: [6],
      units: [
        [
          1,
          'Kvadrat kök. Həqiqi ədədlər',
          [
            [null, 'Kvadrat köklər. Hesabi kvadrat kök', 7],
            [null, 'Həqiqi ədədlər', 11],
            [null, 'y = x və y = √x funksiyaları', 18],
            ['review', 'Ümumiləşdirici tapşırıqlar', 32],
          ],
        ],
        [
          4,
          'Dördbucaqlılar',
          [
            [null, 'Dördbucaqlılar', 71],
            [null, 'Dördbucaqlının daxili və xarici bucaqları', 72],
            ['review', 'Ümumiləşdirici tapşırıqlar', 90],
          ],
        ],
        [
          5,
          'Rasional ifadələr və tənliklər',
          [
            [null, 'Rasional ifadələr', 93],
            [null, 'y = funksiyası və onun qrafiki', 111],
          ],
        ],
      ],
      back: [
        ['review', 'Bölmələr üzrə ümumiləşdirici tapşırıqlar', 127],
        ['answers', 'Cavablar', 134],
      ],
    });
  });

  it('reads numbered topics with a column of page numbers', () => {
    expect(summary(readContents(numbered, 128)).units).toEqual([
      [
        6,
        'Funksiya',
        [
          ['pretest', 'İlkin yoxlama', 6],
          ['6.1', 'Funksiya', 7],
          ['6.2', 'Funksiyanın qrafiki', 11],
          ['summary', 'Xülasə', 19],
        ],
      ],
      [
        7,
        'Çevrə, dairə və kürə',
        [
          ['7.1', 'Çevrə', 25],
          ['7.2', 'Mərkəzi bucaq. Daxilə çəkilmiş bucaq', 29],
          ['7.3', 'Vətərlər, kəsən və toxunanlar arasındakı bucaqlar', 33],
        ],
      ],
    ]);
  });

  it('does not take an exercise page for contents', () => {
    const e = on(9);
    const exercises = [
      e('a) (–2√5) = 4 ∙ 5 = ......20', 50, 600, 11, 200),
      e('b) √3 + 2∙√36 = ......15', 50, 580, 11, 200),
      e('c) √9 + 16 = √25 = ......5', 50, 560, 11, 200),
      e('Kökün qiymətini tapın ......12', 50, 540, 11, 200),
      e('Nümunəyə baxın ......3', 50, 520, 11, 200),
      e('Cədvəli tamamlayın ......16', 50, 500, 11, 200),
      e('Qrafiki qurun ......4', 50, 480, 11, 200),
      e('Bərabərliyi yoxlayın ......9', 50, 460, 11, 200),
      e('Nəticəni müqayisə edin ......1', 50, 440, 11, 200),
    ];
    expect(readContents(exercises, 200).pages).toEqual([]);
  });

  it('keeps the longest run of consecutive contents pages', () => {
    // Contents over pages 6–7; a page that reads like contents later in the book is not one.
    const copy = (page: number) => twoColumns.map((i) => ({ ...i, page }));
    expect(readContents([...twoColumns, ...copy(7), ...copy(12)], 244).pages).toEqual([6, 7]);
  });
});
