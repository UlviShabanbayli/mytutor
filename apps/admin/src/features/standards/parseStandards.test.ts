import { describe, expect, it } from 'vitest';
import { mergeStandards, parseStandards } from './parseStandards';
import { compareCodes, groupStandards, matchesQuery, parentCode } from './standards';

const PASTE = `Riyaziyyat. 7-ci sinif
Məzmun xətti 1. Ədədlər və
əməllər
1.1. Ədədləri, onlar arasındakı əlaqələri başa düşür.
1.1.1. Rasional ədədləri tanıyır, onları müqayisə edir və ədəd-
lərin xassələrini tətbiq edir.
1.1.2 – Faizə aid məsələlər həll edir.
2. Cəbr və funksiyalar
2.1.1) Birdəyişənli xətti tənlik qurur.
1.1.1. Təkrar
`;

describe('parseStandards', () => {
  it('reads codes, wrapped text and content lines', () => {
    const parsed = parseStandards(PASTE);
    expect(parsed.standards).toEqual([
      {
        code: '1.1',
        text: 'Ədədləri, onlar arasındakı əlaqələri başa düşür.',
        line: 'Ədədlər və əməllər',
      },
      {
        code: '1.1.1',
        text: 'Rasional ədədləri tanıyır, onları müqayisə edir və ədədlərin xassələrini tətbiq edir.',
        line: 'Ədədlər və əməllər',
      },
      { code: '1.1.2', text: 'Faizə aid məsələlər həll edir.', line: 'Ədədlər və əməllər' },
      { code: '2.1.1', text: 'Birdəyişənli xətti tənlik qurur.', line: 'Cəbr və funksiyalar' },
    ]);
    expect(parsed.duplicates).toEqual(['1.1.1']);
    expect(parsed.ignored).toEqual(['Riyaziyyat. 7-ci sinif']);
  });

  it('keeps grade prefixes and normalises spacing in codes', () => {
    const { standards } = parseStandards('7 – 1.2.3 Mətn\n7-1.2.10. Başqa');
    expect(standards.map((s) => s.code)).toEqual(['7-1.2.3', '7-1.2.10']);
    expect(standards[0]?.line).toBeNull();
  });
});

describe('mergeStandards', () => {
  it('adds new codes and replaces the text of known ones', () => {
    const current = [{ code: '1.2', text: 'Köhnə', line: null }];
    const merged = mergeStandards(current, [
      { code: '1.2', text: 'Yeni', line: null },
      { code: '1.1', text: 'Əlavə', line: null },
    ]);
    expect(merged).toMatchObject({ added: 1, updated: 1 });
    expect(merged.standards.map((s) => `${s.code} ${s.text}`)).toEqual(['1.1 Əlavə', '1.2 Yeni']);
  });
});

describe('standards', () => {
  it('orders codes numerically and finds parents', () => {
    expect(['1.10', '2.1', '1.2'].sort(compareCodes)).toEqual(['1.2', '1.10', '2.1']);
    expect(parentCode('1.2.3')).toBe('1.2');
    expect(parentCode('7-1.2')).toBe('7-1');
    expect(parentCode('1')).toBeNull();
  });

  it('groups by content line and indents sub-standards', () => {
    const groups = groupStandards([
      { code: '1.1.1', text: 'a', line: 'X' },
      { code: '2.1', text: 'b', line: 'Y' },
      { code: '1.1', text: 'c', line: 'X' },
    ]);
    expect(groups.map((g) => [g.line, g.rows.map((r) => `${r.standard.code}:${r.depth}`)])).toEqual(
      [
        ['X', ['1.1:0', '1.1.1:1']],
        ['Y', ['2.1:0']],
      ],
    );
  });

  it('searches codes and Azerbaijani text without case', () => {
    const s = { code: '1.2.3', text: 'İki rəqəmli ədədlər', line: 'Ədədlər' };
    expect(matchesQuery(s, '1.2')).toBe(true);
    expect(matchesQuery(s, 'iki ədəd')).toBe(true);
    expect(matchesQuery(s, 'İKİ')).toBe(true);
    expect(matchesQuery(s, 'həndəsə')).toBe(false);
  });
});
