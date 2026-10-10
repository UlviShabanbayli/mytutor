import { deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { realText, type DrawnGlyph } from './align';
import { createGlyphDecoder, isFallbackGlyph } from './glyphDecoder';
import { parseTrueType, readPdfFontTables } from './pdfFonts';
import { repairNumber } from './repair';

/** A minimal TrueType program: maxp (glyph count) and a format-4 cmap, nothing else. */
function trueType(numGlyphs: number, map: Record<number, number>): Buffer {
  const codes = Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b);
  // One segment per code (idDelta maps code → glyph), plus the 0xFFFF terminator.
  const segs = [...codes, 0xffff];
  const segX2 = segs.length * 2;
  const cmap = Buffer.alloc(4 + 8 + 14 + segX2 * 4 + 2);
  cmap.writeUInt16BE(0, 0);
  cmap.writeUInt16BE(1, 2);
  cmap.writeUInt16BE(3, 4); // platform: Windows
  cmap.writeUInt16BE(1, 6); // encoding: Unicode BMP
  cmap.writeUInt32BE(12, 8);
  const t = 12;
  cmap.writeUInt16BE(4, t);
  cmap.writeUInt16BE(segX2, t + 6);
  segs.forEach((c, i) => {
    cmap.writeUInt16BE(c, t + 14 + 2 * i); // end
    cmap.writeUInt16BE(c, t + 16 + segX2 + 2 * i); // start
    const delta = c === 0xffff ? 1 : ((map[c] ?? 0) - c) & 0xffff;
    cmap.writeUInt16BE(delta, t + 16 + 2 * segX2 + 2 * i);
  });
  const maxp = Buffer.alloc(6);
  maxp.writeUInt32BE(0x00005000, 0);
  maxp.writeUInt16BE(numGlyphs, 4);
  const header = Buffer.alloc(12 + 2 * 16);
  header.writeUInt32BE(0x00010000, 0);
  header.writeUInt16BE(2, 4);
  const tables: [string, Buffer][] = [
    ['cmap', cmap],
    ['maxp', maxp],
  ];
  let offset = header.length;
  tables.forEach(([tag, data], i) => {
    const rec = 12 + 16 * i;
    header.write(tag, rec, 'latin1');
    header.writeUInt32BE(offset, rec + 8);
    header.writeUInt32BE(data.length, rec + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...tables.map(([, d]) => d)]);
}

describe('parseTrueType', () => {
  it('reads the glyph count and maps glyph ids to characters', () => {
    const font = parseTrueType(trueType(300, { 0x79: 92, 0x259: 718 }));
    expect(font?.numGlyphs).toBe(300);
    expect(font?.cmap.get(92)).toBe(0x79); // y
    expect(font?.cmap.get(718)).toBe(0x259); // ə
  });

  it('ignores anything that is not a TrueType/OpenType program', () => {
    expect(parseTrueType(Buffer.from('not a font at all'))).toBeNull();
  });
});

describe('readPdfFontTables', () => {
  const object = (num: number, body: string) => `${num} 0 obj\r${body}\rendobj\r`;
  const fontStream = (num: number, font: Buffer) => {
    const data = deflateSync(font).toString('latin1');
    return object(
      num,
      `<</Filter/FlateDecode/Length ${data.length}>>stream\r\n${data}\r\nendstream`,
    );
  };

  it('finds embedded fonts and lets a later definition replace an earlier one', () => {
    const pdf =
      '%PDF-1.7\r' +
      fontStream(10, trueType(500, { 0x61: 68 })) +
      object(11, '<</Type/FontDescriptor/FontName/AAAAAA+SegoeUI/FontFile2 10 0 R>>') +
      fontStream(12, trueType(500, {})) +
      object(13, '<</Type/FontDescriptor/FontName/BBBBBB+SegoeUI/FontFile2 99 0 R>>') +
      // Incremental update: object 13 is redefined and now points at its program.
      object(13, '<</Type/FontDescriptor/FontName/BBBBBB+SegoeUI/FontFile2 12 0 R>>');
    const { fonts } = readPdfFontTables(new Uint8Array(Buffer.from(pdf, 'latin1')));
    expect(fonts.map((f) => [f.name, f.numGlyphs, f.cmap.size])).toEqual([
      ['AAAAAA+SegoeUI', 500, 1],
      ['BBBBBB+SegoeUI', 500, 0],
    ]);
  });
});

describe('createGlyphDecoder', () => {
  const full = {
    name: 'AZLXOS+SegoeUI',
    numGlyphs: 5394,
    cmap: new Map([
      [92, 0x79],
      [192, 0xfb01],
    ]),
  };
  const subset = { name: 'GPFMAM+SegoeUI', numGlyphs: 5394, cmap: new Map<number, number>() };
  const other = { name: 'XXXXXX+SegoeUI', numGlyphs: 3000, cmap: new Map([[92, 0x41]]) };
  // The full subset needs more than 100 entries to count as a reference.
  for (let g = 300; g < 420; g++) full.cmap.set(g, 0x4e00 + g);
  const decoder = createGlyphDecoder({ fonts: [subset, other, full] });

  it('reads a glyph from a sibling subset with the same glyph count', () => {
    expect(decoder.decode('GPFMAM+SegoeUI', 92)).toBe('y');
    expect(decoder.decode('GPFMAM+SegoeUI', 192)).toBe('ﬁ');
  });

  it('uses the reviewed symbol table, and says "unknown" instead of guessing', () => {
    expect(decoder.decode('ABCDEF+SymbolMT', 16)).toBe('−');
    expect(decoder.decode('GPFMAM+SegoeUI', 9999)).toBeNull();
  });

  it('treats a glyph shown as its own code as unmapped', () => {
    expect(isFallbackGlyph(92, '\\')).toBe(true);
    expect(isFallbackGlyph(68, 'a')).toBe(false);
  });
});

describe('realText', () => {
  const g = (font: string, shown: string, real = shown): DrawnGlyph => ({ font, shown, real });

  it('replaces glyph text and keeps spaces pdf.js inserted', () => {
    const glyphs = [
      g('f1', 'q'),
      g('f1', 'H', 'e'),
      g('f1', '\\', 'y'),
      g('f1', 'd'),
      g('f1', 'R', 'o'),
    ];
    expect(realText([{ str: 'qH\\d R', fontName: 'f1' }], glyphs)).toEqual([
      { text: 'qeyd o', paired: true },
    ]);
  });

  it('pairs runs that pdf.js emits out of drawing order', () => {
    const glyphs = [g('f1', 'a'), g('f1', 'b'), g('f2', 'X', 'x'), g('f2', 'Y', 'y')];
    expect(
      realText(
        [
          { str: 'XY', fontName: 'f2' },
          { str: 'ab', fontName: 'f1' },
        ],
        glyphs,
      ),
    ).toEqual([
      { text: 'xy', paired: true },
      { text: 'ab', paired: true },
    ]);
  });

  it('keeps pdf.js text when the glyphs cannot be paired', () => {
    expect(realText([{ str: 'abc', fontName: 'f1' }], [g('f9', 'a', 'z')])).toEqual([
      { text: 'abc', paired: false },
    ]);
  });
});

describe('repairNumber', () => {
  it('shifts only control codes, so mixed runs keep real digits', () => {
    expect(repairNumber('7\u0014')).toBe('71');
    expect(repairNumber('\u001b\u0011\u0014\u0011')).toBe('8.1.');
  });
});

describe('createGlyphOrderEvidence', () => {
  it('reads unnamed letters only for fonts whose named glyphs follow the standard order', async () => {
    const { createGlyphOrderEvidence } = await import('./glyphDecoder');
    const order = createGlyphOrderEvidence();
    // Times-like: named glyphs sit at code + 29.
    for (const [code, ch] of [
      [68, 'a'],
      [69, 'b'],
      [70, 'c'],
      [36, 'A'],
      [19, '0'],
      [20, '1'],
    ] as const)
      order.add('Times', code, ch);
    // Poppins-like: "A" is glyph 692.
    for (const [code, ch] of [
      [692, 'A'],
      [693, 'B'],
      [724, 'a'],
      [725, 'b'],
      [726, 'c'],
    ] as const)
      order.add('Poppins', code, ch);
    expect(order.guess('Times', 76)).toBe('i');
    expect(order.guess('Times', 240)).toBeNull(); // beyond letters and digits: never guessed
    expect(order.guess('Poppins', 697)).toBeNull();
  });
});
