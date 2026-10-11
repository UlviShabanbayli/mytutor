import { describe, expect, it } from 'vitest';
import type { PageGraphics } from './graphics';
import { findLayoutMarkers } from './layoutMarkers';
import type { TextItem, TextLine } from './types';

const H = 680;
const BODY = 11;

/** One printed row: its runs as text items, and the line they make. */
function row(y: number, runs: [text: string, x: number, size?: number][], page = 9) {
  const items: TextItem[] = runs.map(([text, x, size = BODY]) => ({
    page,
    text,
    x,
    y,
    size,
    width: text.length * size * 0.5,
    isLabel: false,
    decoded: true,
  }));
  const sizes = items.map((i) => i.size);
  const line: TextLine = {
    page,
    text: runs.map(([text]) => text).join(' '),
    size: Math.max(...sizes),
    minSize: Math.min(...sizes),
    x: Math.min(...items.map((i) => i.x)),
    y,
    width: 300,
  };
  return { items, line };
}

function markers(
  rows: ReturnType<typeof row>[],
  topicTitle = 'Kvadrat köklər',
  graphics: PageGraphics[] = [],
) {
  return findLayoutMarkers({
    lines: rows.map((r) => r.line),
    items: rows.flatMap((r) => r.items),
    body: BODY,
    pageHeight: H,
    topicTitle,
    graphics,
  }).map((m) => [m.kind, m.label ?? m.title, m.number, m.box ? Math.round(m.box.x) : null]);
}

/** A badge drawn behind an exercise number at (x, baseline y). */
const badge = (x: number, y: number) => ({
  bbox: { x: x - 4, y: H - y - 12, width: 19, height: 13 },
  fill: '#ffca58',
  filled: true,
});

describe('findLayoutMarkers', () => {
  it('reads labels set in their own run, and only those', () => {
    expect(
      markers([
        row(644, [['Kvadrat köklər', 80, 14]]),
        row(617, [
          ['Məsələ.', 80],
          ['100 kiçik kvadratdan ibarət böyük kvadrat', 119],
        ]),
        row(556, [
          ['Həlli:', 80],
          ['Kvadratın tərəfini x ilə işarə edək.', 111],
        ]),
        row(500, [['Nəticə. Bu cümlə adi mətndir və bir run-dadır.', 80]]),
        row(409, [
          ['Araşdırma.', 80],
          ['Kvadratın tərəfinin uzunluğu verildikdə', 138],
        ]),
        row(330, [
          ['Tərif.', 80],
          ['Kvadratı a-ya bərabər olan ədəd', 115],
        ]),
        row(250, [
          ['Nümunə 2.', 80],
          ['İfadənin qiymətini hesablayın.', 130],
        ]),
      ]),
    ).toEqual([
      ['title', 'Kvadrat köklər', null, null],
      ['example', 'Məsələ.', null, null],
      ['inquiry', 'Araşdırma.', null, null],
      ['remember', 'Tərif.', null, null],
      ['example', 'Nümunə 2.', '2', null],
    ]);
  });

  it('finds exercise numbers set larger, apart or in the statement run', () => {
    expect(
      markers([
        row(509, [['Öyrənmə tapşırıqları.', 50, 12]]),
        row(493, [['1) Natural ədədin kvadratına tam kvadrat deyilir.', 78]]),
        row(490, [['1', 55, 12]]),
        row(440, [
          ['3', 55, 12],
          ['Rəngli xanaların yerinə ədədlər yazın.', 78],
        ]),
        row(400, [
          ['Kəsrin', 78],
          ['7', 120, 12],
          ['payı', 130],
        ]),
        row(380, [['2', 55]]), // body size: a figure label, not an exercise
        row(370, [
          ['1', 374, 12],
          ['S', 390, 12],
          ['2', 406, 12],
        ]), // a number line's labels
        row(360, [['4 İfadələrdən hansının qiyməti irrasionaldır?', 55, 12]]),
      ]),
    ).toEqual([
      ['exercises', 'Öyrənmə tapşırıqları.', null, null],
      ['exercise', null, '1', null],
      ['exercise', null, '3', null],
      ['exercise', null, '4', null],
    ]);
  });

  it('keeps real sub-headings and drops formula text, instructions and running heads', () => {
    expect(
      markers([
        row(644, [['Kvadrat köklər', 80, 14]]),
        row(560, [['Hesabi kvadrat kök', 99, 12]]),
        row(520, [['sin A =', 99, 12]]),
        row(480, [['Məsələlərə uyğun şəkillər çəkin.', 80, 12]]),
        row(644, [['Kvadrat köklər', 80, 14]], 10), // the title atop the next page
        row(600, [['Kvadrat köklər Nümunə 3', 80, 12]], 10),
        row(560, [['Tətbiq tapşırıqları', 80, 12]], 10),
        row(520, [['Teorem. Üçbucağın medianlarının xassəsi', 80, 12]], 10),
      ]),
    ).toEqual([
      ['title', 'Kvadrat köklər', null, null],
      ['section', 'Hesabi kvadrat kök', null, null],
      ['example', 'Nümunə 3', '3', null],
      ['problems', 'Tətbiq tapşırıqları', null, null],
      ['theorem', 'Teorem.', null, null],
    ]);
  });

  it('takes badged numbers, side by side as boxes, and no unbadged numbers in such a book', () => {
    const rows = [
      row(560, [
        ['5', 55, 12],
        ['(–3)^2', 80],
      ]), // a formula statement: the badge is evidence enough
      row(560, [['6', 223, 12]]),
      row(500, [
        ['7', 55, 12],
        ['Hesablayın.', 78],
      ]),
      row(450, [
        ['2.', 55, 12],
        ['tan A = a/b', 78],
      ]), // a numbered point of the explanation: no badge
    ];
    const graphics = [
      { page: 9, images: [], paths: [badge(55, 560), badge(223, 560), badge(55, 500)] },
    ];
    expect(markers(rows, 'Tam üstlü qüvvət', graphics)).toEqual([
      ['exercise', null, '5', 53],
      ['exercise', null, '6', 221],
      ['exercise', null, '7', null],
    ]);
  });

  it('takes a mid-page sub-heading that reads like the topic as its title', () => {
    expect(
      markers(
        [row(553, [['Üçbucağın orta xətti', 80, 12]]), row(530, [['Mətn sətri burada.', 80]])],
        'Üçbucağın orta xətti',
      ),
    ).toEqual([['title', 'Üçbucağın orta xətti', null, null]]);
  });
});
