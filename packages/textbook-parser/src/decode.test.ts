import { deflateSync } from 'node:zlib';
import { OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import { realText, type DrawnGlyph } from './align';
import { drawnGlyphs } from './extract';
import { createGlyphDecoder, isFallbackGlyph } from './glyphDecoder';
import { parseTrueType, readPdfFontTables, selfMappedCodes } from './pdfFonts';
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

  const stream = (num: number, data: string | Buffer) => {
    const packed = deflateSync(data).toString('latin1');
    return object(
      num,
      `<</Filter/FlateDecode/Length ${packed.length}>>stream\r\n${packed}\r\nendstream`,
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

  it("reads a composite font's self-mapped codes and CID-to-glyph map by its descendant's name", () => {
    const gids = Buffer.alloc(2 * 0x62);
    gids.writeUInt16BE(68, 2 * 0x61); // CID 0x61 ("a") draws glyph 68
    const pdf =
      '%PDF-1.7\r' +
      object(
        20,
        '<</Type/Font/Subtype/Type0/BaseFont/CCCCCC+Arial/DescendantFonts[21 0 R]/ToUnicode 24 0 R>>',
      ) +
      object(21, '<</Type/Font/Subtype/CIDFontType2/FontDescriptor 22 0 R/CIDToGIDMap 23 0 R>>') +
      object(22, '<</Type/FontDescriptor/FontName/CCCCCC+Arial>>') +
      stream(23, gids) +
      stream(24, 'begincmap\n1 beginbfrange\n<0020> <007E> <0020>\nendbfrange\nendcmap');
    const tables = readPdfFontTables(new Uint8Array(Buffer.from(pdf, 'latin1')));
    const font = tables.composites.get('CCCCCC+Arial');
    expect(font?.selfMapped).toEqual([[0x20, 0x7e]]);
    expect(tables.encrypted).toBe(false);
    const decoder = createGlyphDecoder(tables);
    // pdf.js shows "a" for code 0x61 either way; the ToUnicode map says it really is "a".
    expect(decoder.unmapped('CCCCCC+Arial', 0x61, 'a')).toBe(false);
    expect(decoder.unmapped('CCCCCC+Arial', 0x7f, '\u007f')).toBe(true);
    expect(decoder.glyphId('CCCCCC+Arial', 0x61)).toBe(68);
    expect(decoder.glyphId('OTHER+Font', 0x61)).toBe(0x61);
  });

  it('reads nothing from an encrypted PDF', () => {
    const pdf =
      '%PDF-1.7\r' +
      fontStream(10, trueType(500, { 0x61: 68 })) +
      object(11, '<</Type/FontDescriptor/FontName/AAAAAA+SegoeUI/FontFile2 10 0 R>>') +
      'trailer\r<</Root 1 0 R/Encrypt 30 0 R>>';
    const tables = readPdfFontTables(new Uint8Array(Buffer.from(pdf, 'latin1')));
    expect(tables).toEqual({ fonts: [], composites: new Map(), encrypted: true });
  });
});

describe('selfMappedCodes', () => {
  it('keeps only entries that map a code to itself', () => {
    const cmap = [
      '2 beginbfchar',
      '<0041> <0041>',
      '<0042> <0062>',
      'endbfchar',
      '3 beginbfrange',
      '<0030> <0039> <0030>',
      '<0061> <0063> [<0061> <0062> <0063>]',
      '<0100> <0105> <0200>',
      'endbfrange',
    ].join('\n');
    // An array destination is skipped whole, never read as the next entry.
    expect(selfMappedCodes(cmap)).toEqual([
      [0x41, 0x41],
      [0x30, 0x39],
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

  it('rejects a sibling that differs in base name, glyph count, or has a small cmap', () => {
    const big = () => {
      const m = new Map<number, number>([[92, 0x41]]);
      for (let g = 300; g < 420; g++) m.set(g, 0x4e00 + g);
      return m;
    };
    const small = new Map<number, number>([[92, 0x41]]);
    for (let g = 300; g < 349; g++) small.set(g, 0x4e00 + g);
    const only = (f: { name: string; numGlyphs: number; cmap: Map<number, number> }) =>
      createGlyphDecoder({ fonts: [subset, f] }).decode('GPFMAM+SegoeUI', 92);
    expect(only({ name: 'QQQQQQ+SegoeUI-Bold', numGlyphs: 5394, cmap: big() })).toBeNull();
    expect(only({ name: 'QQQQQQ+SegoeUI', numGlyphs: 3000, cmap: big() })).toBeNull();
    expect(only({ name: 'QQQQQQ+SegoeUI', numGlyphs: 5394, cmap: small })).toBeNull();
    expect(only({ name: 'QQQQQQ+SegoeUI', numGlyphs: 5394, cmap: big() })).toBe('A');
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

  const upper = (s: string) => [...s].map((ch) => g('f1', ch, ch.toUpperCase()));

  it('trusts a run when at least 90% of its characters pair', () => {
    expect(realText([{ str: 'abcdefghiQ', fontName: 'f1' }], upper('abcdefghi'))).toEqual([
      { text: 'ABCDEFGHIQ', paired: true },
    ]);
  });

  it('keeps pdf.js text when fewer than 90% pair, even if the first glyph fits', () => {
    expect(realText([{ str: 'abcdefghQQ', fontName: 'f1' }], upper('abcdefgh'))).toEqual([
      { text: 'abcdefghQQ', paired: false },
    ]);
  });

  it('keeps leading spaces and leaves whitespace-only runs unpaired', () => {
    expect(
      realText(
        [
          { str: '  ab', fontName: 'f1' },
          { str: '   ', fontName: 'f1' },
        ],
        upper('ab'),
      ),
    ).toEqual([
      { text: '  AB', paired: true },
      { text: '   ', paired: false },
    ]);
  });

  it('continues from where the previous run ended when the same text repeats', () => {
    // A mapped "a" and an unmapped glyph that pdf.js also shows as "a" look the same.
    const glyphs = [g('f1', 'a'), g('f1', 'b'), g('f1', 'a', 'ə'), g('f1', 'b')];
    expect(
      realText(
        [
          { str: 'ab', fontName: 'f1' },
          { str: 'ab', fontName: 'f1' },
        ],
        glyphs,
      ),
    ).toEqual([
      { text: 'ab', paired: true },
      { text: 'əb', paired: true },
    ]);
  });

  it('steps over glyphs pdf.js took for whitespace, keeping what they really are', () => {
    // "c) İki": the ")" glyph has code 12, which pdf.js shows as a form feed and drops.
    const brackets = [
      g('f1', 'c'),
      g('f1', '\f', ')'),
      g('f1', ' '),
      g('f1', 'ù', 'İ'),
      g('f1', 'N', 'k'),
      g('f1', 'i'),
    ];
    expect(realText([{ str: 'c ùNi', fontName: 'f1' }], brackets)).toEqual([
      { text: 'c) İki', paired: true },
    ]);
    // Two space glyphs drawn, one space in the text item.
    const spaces = [g('f1', 'a'), g('f1', ' '), g('f1', ' '), g('f1', 'K', 'h')];
    expect(realText([{ str: 'a K', fontName: 'f1' }], spaces)).toEqual([
      { text: 'a h', paired: true },
    ]);
    // A drawn space the text item left out (justified text draws some inside words).
    const dropped = [g('f1', 'q'), g('f1', ' '), g('f1', 'n'), g('f1', 'R', 'o')];
    expect(realText([{ str: 'qnR', fontName: 'f1' }], dropped)).toEqual([
      { text: 'qno', paired: true },
    ]);
    // An unmapped "(" that pdf.js wrote as a plain space: the space is that glyph.
    const bracket = [
      g('f1', '0'),
      g('f1', ','),
      g('f1', '\u0014', '1'),
      g('f1', '\v', '('),
      g('f1', '6'),
    ];
    expect(realText([{ str: '0,\u0014 6', fontName: 'f1' }], bracket)).toEqual([
      { text: '0,1(6', paired: true },
    ]);
  });

  it('gives glyphs pdf.js dropped between two runs to the run after them', () => {
    // "|a| = |b|": the unmapped "=" (code 32) is shown as a space between two spaces, and
    // pdf.js ends one item before them and starts the next after them.
    const glyphs = [
      g('f1', '_', '|'),
      g('f1', 'a'),
      g('f1', '_', '|'),
      g('f1', ' '),
      g('f1', ' ', '='),
      g('f1', ' '),
      g('f1', '_', '|'),
      g('f1', 'b'),
      g('f1', '_', '|'),
    ];
    expect(
      realText(
        [
          { str: '_a_', fontName: 'f1' },
          { str: '_b_', fontName: 'f1' },
        ],
        glyphs,
      ).map((r) => r.text),
    ).toEqual(['|a|', '= |b|']);
    // A closing bracket dropped at the end of a run belongs to that run, not the next one.
    const closing = [
      g('f1', '\u0016', '3'),
      g('f1', '\f', '('),
      g('f1', '\u001a', '7'),
      g('f1', '\v', ')'),
      g('f1', ' '),
      g('f1', 'c'),
    ];
    expect(
      realText(
        [
          { str: '\u0016\f\u001a', fontName: 'f1' },
          { str: 'c', fontName: 'f1' },
        ],
        closing,
      ).map((r) => r.text),
    ).toEqual(['3(7)', 'c']);
    // Real spaces between runs change nothing.
    const plain = [g('f1', 'a'), g('f1', ' '), g('f1', 'b')];
    expect(
      realText(
        [
          { str: 'a', fontName: 'f1' },
          { str: 'b', fontName: 'f1' },
        ],
        plain,
      ).map((r) => r.text),
    ).toEqual(['a', 'b']);
  });

  /** A glyph with a baseline. */
  const at = (y: number, shown: string, real = shown, font = 'f1'): DrawnGlyph => ({
    font,
    shown,
    real,
    y,
  });

  it('puts each dropped glyph on its own line when the runs around it are on two lines', () => {
    // "a + b =" ends one line and "= c" starts the next; both "=" are drawn between the runs.
    const glyphs = [
      at(100, 'a'),
      at(100, ' '),
      at(100, '+'),
      at(100, ' '),
      at(100, 'b'),
      at(100, ' '),
      at(100, ' ', '='),
      at(82, ' ', '='),
      at(82, ' '),
      at(82, 'c'),
    ];
    const runs = [
      { str: 'a + b', fontName: 'f1', y: 100, size: 10 },
      { str: 'c', fontName: 'f1', y: 82, size: 10 },
    ];
    expect(realText(runs, glyphs).map((r) => r.text)).toEqual(['a + b =', '= c']);
    // An "=" before an answer box drawn as graphics sits on neither run's line: dropped.
    const box = [at(100, 'a'), at(120, ' ', '='), at(82, 'c')];
    expect(
      realText(
        [
          { str: 'a', fontName: 'f1', y: 100, size: 10 },
          { str: 'c', fontName: 'f1', y: 82, size: 10 },
        ],
        box,
      ).map((r) => r.text),
    ).toEqual(['a', 'c']);
  });

  it('drops a closing bracket after a run that did not pair, instead of moving it on', () => {
    const glyphs = [
      g('S', '\v', '('),
      g('S', 's'),
      g('S', 'm'),
      g('S', 'ࢗ', '³'),
      g('S', '\f', ')'),
      g('T', 'π'),
    ];
    expect(
      realText(
        [
          { str: 'ࢗsm', fontName: 'S' },
          { str: 'π', fontName: 'T' },
        ],
        glyphs,
      ).map((r) => r.text),
    ).toEqual(['ࢗsm', 'π']);
  });

  it("closes a quote in the run before when it is drawn in that run's font only", () => {
    const glyphs = [
      g('B', '\n', "'"),
      g('B', '\n', "'"),
      g('B', 'E'),
      g('B', 'L'),
      g('B', '\n', "'"),
      g('B', '\n', "'"),
      g('S', '*', 'G'),
      g('S', '|', 'ö'),
      g('S', 'z'),
    ];
    expect(
      realText(
        [
          { str: 'EL', fontName: 'B' },
          { str: '*|z', fontName: 'S' },
        ],
        glyphs,
      ).map((r) => r.text),
    ).toEqual(["''EL''", 'Göz']);
  });

  it('lets a run in another font take the brackets around it, and says what it took', () => {
    // "Natural ədədlər (N)": the brackets are Segoe UI, the letter Times.
    const glyphs = [
      at(100, 'x', 'x', 'S'),
      at(100, ' ', ' ', 'S'),
      at(100, '\v', '(', 'S'),
      at(100, 'N', 'N', 'T'),
      at(100, '\f', ')', 'S'),
      at(82, 'y', 'y', 'S'),
    ];
    const runs = [
      { str: 'x', fontName: 'S', y: 100, size: 10 },
      { str: 'N', fontName: 'T', y: 100, size: 10 },
      { str: 'y', fontName: 'S', y: 82, size: 10 },
    ];
    expect(realText(runs, glyphs)).toEqual([
      { text: 'x', paired: true },
      { text: '(N)', paired: true, prefix: '(', suffix: ')' },
      { text: 'y', paired: true },
    ]);
  });
});

describe('drawnGlyphs', () => {
  const glyph = (code: number) => [{ unicode: String.fromCharCode(code), originalCharCode: code }];
  const fonts: Record<string, { name: string; composite: boolean }> = {
    f1: { name: 'AAAAAA+SegoeUI', composite: true },
    f2: { name: 'BBBBBB+SymbolMT', composite: false },
  };

  it('gives glyphs drawn after Q or a form XObject the font that was restored', () => {
    const ops = {
      fnArray: [
        OPS.setFont,
        OPS.showText,
        OPS.save,
        OPS.setFont,
        OPS.showText,
        OPS.restore,
        OPS.showText,
        OPS.paintFormXObjectBegin,
        OPS.setFont,
        OPS.showText,
        OPS.paintFormXObjectEnd,
        OPS.showText,
      ],
      argsArray: [
        ['f1'],
        [glyph(65)],
        null,
        ['f2'],
        [glyph(66)],
        null,
        [glyph(67)],
        null,
        ['f2'],
        [glyph(68)],
        null,
        [glyph(69)],
      ],
    };
    const drawn = drawnGlyphs(ops, (id) => fonts[id] ?? {});
    expect(drawn.map((d) => `${d.unicode}:${d.font}`)).toEqual([
      'A:AAAAAA+SegoeUI',
      'B:BBBBBB+SymbolMT',
      'C:AAAAAA+SegoeUI',
      'D:BBBBBB+SymbolMT',
      'E:AAAAAA+SegoeUI',
    ]);
    expect(drawn.map((d) => d.composite)).toEqual([true, false, true, false, true]);
  });

  it('gives each glyph its baseline from the text and transformation matrices', () => {
    const ops = {
      fnArray: [
        OPS.setFont,
        OPS.transform,
        OPS.beginText,
        OPS.setTextMatrix,
        OPS.showText,
        OPS.moveText,
        OPS.showText,
        OPS.setLeadingMoveText,
        OPS.nextLine,
        OPS.showText,
        OPS.endText,
      ],
      argsArray: [
        ['f1', 1],
        [1, 0, 0, 1, 0, 100],
        null,
        [new Float32Array([10, 0, 0, 10, 50, 600])],
        [glyph(65)],
        [0, -1.5],
        [glyph(66)],
        [0, -2],
        null,
        [glyph(67)],
        null,
      ],
    };
    // 600 + 100; then 1.5 lines of 10 down; then 2 lines down twice (move, then T*).
    expect(drawnGlyphs(ops, (id) => fonts[id] ?? {}).map((d) => d.y)).toEqual([700, 685, 645]);
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
