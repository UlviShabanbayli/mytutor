import { describe, expect, it } from 'vitest';
import { decodeShifted, isSuspicious, looksShifted, repairHeading, repairNumber } from './repair';

describe('glyph repair', () => {
  it('decodes runs shifted by 29 code points', () => {
    expect(decodeShifted('5aViRnal ədədlər')).toBe('Rasional ədədlər');
    expect(decodeShifted('B|lmə')).toBe('Bölmə');
  });

  it('detects shifted runs but leaves clean text alone', () => {
    expect(looksShifted('hoEXFaøın RUta [əttinin [assəsi')).toBe(true);
    expect(looksShifted('Paraleloqramın növləri. Düzbucaqlı')).toBe(false);
  });

  it.each([
    ['˅asional ədədin onluq kəsr', 'Rasional ədədin onluq kəsr'],
    ['ʶəmin və ˙ərqin kvadratı', 'Cəmin və fərqin kvadratı'],
    ['ͺki ədədin cəmi ilə ˙ərqinin ˛asili', 'İki ədədin cəmi ilə fərqinin hasili'],
    ['MƏSƏLƏ 9Ə MİSALLAR', 'MƏSƏLƏ VƏ MİSALLAR'],
    [';ÜLASƏ', 'XÜLASƏ'],
    ['\u0005OKEANOLO*İYA\u0005', '"OKEANOLOGİYA"'],
    ['hoEXFaøın RUta [əttinin [assəsi', 'Üçbucağın orta xəttinin xassəsi'],
    [
      'Modullarına əsasən mənÀ ədədlərin müqayisəsi',
      'Modullarına əsasən mənfi ədədlərin müqayisəsi',
    ],
  ])('repairs heading %j', (raw, expected) => {
    expect(repairHeading(raw)).toBe(expected);
  });

  it('repairs shifted page numbers', () => {
    expect(repairNumber('\u0014\u0016')).toBe('13');
    expect(repairNumber('39')).toBe('39');
  });

  it('flags text that is still not Azerbaijani', () => {
    expect(isSuspicious('Üçbucağın orta xətti')).toBe(false);
    expect(isSuspicious('WƵůƐƵǌ')).toBe(true);
  });
});
