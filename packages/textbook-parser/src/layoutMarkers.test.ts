import { describe, expect, it } from 'vitest';
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

function markers(rows: ReturnType<typeof row>[], topicTitle = 'Kvadrat köklər') {
  return findLayoutMarkers({
    lines: rows.map((r) => r.line),
    items: rows.flatMap((r) => r.items),
    body: BODY,
    pageHeight: H,
    topicTitle,
  }).map((m) => [m.kind, m.label ?? m.title, m.number]);
}

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
      ['title', 'Kvadrat köklər', null],
      ['example', 'Məsələ.', null],
      ['inquiry', 'Araşdırma.', null],
      ['remember', 'Tərif.', null],
      ['example', 'Nümunə 2.', '2'],
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
        row(360, [['4 İfadələrdən hansının qiyməti irrasionaldır?', 55, 12]]),
      ]),
    ).toEqual([
      ['exercises', 'Öyrənmə tapşırıqları.', null],
      ['exercise', null, '1'],
      ['exercise', null, '3'],
      ['exercise', null, '4'],
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
      ['title', 'Kvadrat köklər', null],
      ['section', 'Hesabi kvadrat kök', null],
      ['example', 'Nümunə 3', '3'],
      ['problems', 'Tətbiq tapşırıqları', null],
      ['theorem', 'Teorem.', null],
    ]);
  });

  it('takes a mid-page sub-heading that reads like the topic as its title', () => {
    expect(
      markers(
        [row(553, [['Üçbucağın orta xətti', 80, 12]]), row(530, [['Mətn sətri burada.', 80]])],
        'Üçbucağın orta xətti',
      ),
    ).toEqual([['title', 'Üçbucağın orta xətti', null]]);
  });
});
