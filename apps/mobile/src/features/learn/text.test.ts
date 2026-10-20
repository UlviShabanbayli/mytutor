import { combRows } from './comb';
import { worldHive, worldPlacement } from './__fixtures__/world';
import { buildSearchIndex, searchLearn } from './search';
import { foldAz, highlightParts, listJoin, numberRanges } from './text';

describe('Azerbaijani text helpers', () => {
  it('folds case with the dotted and dotless i', () => {
    expect(foldAz('İngilis dili')).toBe('ingilis dili');
    expect(foldAz('İNGİLİS')).toHaveLength('İNGİLİS'.length);
    expect(foldAz('ISTI')).toBe('ıstı');
  });

  it('splits text around every match', () => {
    expect(highlightParts('Cəmin və fərqin kubu. Kublar cəmi', 'kub')).toEqual([
      { text: 'Cəmin və fərqin ', hit: false },
      { text: 'kub', hit: true },
      { text: 'u. ', hit: false },
      { text: 'Kub', hit: true },
      { text: 'lar cəmi', hit: false },
    ]);
    expect(highlightParts('İkinci', 'iki')).toEqual([
      { text: 'İki', hit: true },
      { text: 'nci', hit: false },
    ]);
  });

  it('joins lists and writes runs as ranges', () => {
    expect(listJoin(['4.4', '4.5', 'bölmə sınağı'], 'və')).toBe('4.4, 4.5 və bölmə sınağı');
    expect(listJoin(['4.4'], 'və')).toBe('4.4');
    expect(numberRanges(['4.1', '4.2', '4.3', '4.5'])).toEqual(['4.1–4.3', '4.5']);
    expect(numberRanges(['3.5', '4.1', '4.2'])).toEqual(['3.5', '4.1', '4.2']);
  });
});

describe('combRows', () => {
  it('makes rows of three with every second row offset', () => {
    expect(combRows([1, 2, 3, 4, 5, 6, 7]).map((r) => [r.items, r.offset])).toEqual([
      [[1, 2, 3], false],
      [[4, 5, 6], true],
      [[7], false],
    ]);
  });
});

describe('searchLearn', () => {
  const index = buildSearchIndex(worldHive(), worldPlacement());

  it('finds topics, lessons and questions', () => {
    const found = searchLearn(index, 'kub');
    expect(found.topics.map((t) => t.number)).toEqual(['4.3']);
    expect(found.lessons.map((l) => l.kind)).toEqual(['board', 'teacher']);
    expect(found.questions).toHaveLength(1);
    expect(found.total).toBe(4);
  });

  it('waits for two letters', () => {
    expect(searchLearn(index, 'k').total).toBe(0);
  });
});
