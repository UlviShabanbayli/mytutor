import { readFile } from 'node:fs/promises';
import type { PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { getDocument, normalizeUnicode, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { type DrawnGlyph, realText } from './align';
import { createGlyphDecoder, createGlyphOrderEvidence } from './glyphDecoder';
import { readPdfFontTables } from './pdfFonts';
import { repairNumber } from './repair';
import type { ExtractedPdf, TextItem } from './types';

/** Numeric badge glyphs: raw control codes and digits/dots only, e.g. "\u001f\u001e\u001d\u001e". */
// eslint-disable-next-line no-control-regex -- broken fonts emit raw control codes as glyphs
const LABEL = /^[\u0003-\u001f\d.\s]{1,8}$/;

// eslint-disable-next-line no-control-regex -- see LABEL
const RAW_CODE = /[\u0003-\u001f]/;

/** Text for a glyph nothing in the PDF names; marks the line as unreliable (read the image). */
export const UNKNOWN_GLYPH = '�';

// eslint-disable-next-line no-control-regex -- raw glyph codes are exactly what this finds
const RAW_CODES = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g;

/**
 * Real text never contains control codes. One left in a decoded run is a glyph from another
 * font that pdf.js merged into the run (e.g. a digit under a repeating-decimal bar); it gets
 * the number repair raw runs get, or the unknown mark.
 */
function withoutRawCodes(text: string): string {
  return text.replace(RAW_CODES, (ch) => {
    const repaired = repairNumber(ch);
    return repaired === ch ? UNKNOWN_GLYPH : repaired;
  });
}

const SHOW_TEXT = new Set<number>([
  OPS.showText,
  OPS.showSpacedText,
  OPS.nextLineShowText,
  OPS.nextLineSetSpacingShowText,
]);

type PdfGlyph = { unicode: string; originalCharCode: number };
export type PdfFont = { composite?: boolean; name?: string };

const isGlyph = (g: unknown): g is PdfGlyph =>
  typeof g === 'object' && g !== null && 'unicode' in g && 'originalCharCode' in g;

/** `y`: the baseline in PDF user space, as pdf.js gives it for text items. */
export type RawGlyph = {
  font: string;
  composite: boolean;
  code: number;
  unicode: string;
  y: number;
};

type Matrix = [number, number, number, number, number, number];
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[1] * n[2],
  m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2],
  m[2] * n[1] + m[3] * n[3],
  m[4] * n[0] + m[5] * n[2] + n[4],
  m[4] * n[1] + m[5] * n[3] + n[5],
];
/** Six numbers, given as they are or as one array (pdf.js passes `Tm` as a Float32Array). */
const matrixOf = (args: unknown[]): Matrix | null => {
  const [first] = args;
  const values = Array.from(
    (ArrayBuffer.isView(first) || Array.isArray(first) ? first : args) as ArrayLike<unknown>,
  );
  return values.length >= 6 && values.slice(0, 6).every((v) => typeof v === 'number')
    ? (values.slice(0, 6) as Matrix)
    : null;
};
const num = (value: unknown) => (typeof value === 'number' ? value : 0);
type PageText = {
  runs: (TextContentRun & { font: string; composite: boolean })[];
  glyphs: RawGlyph[];
};
type TextContentRun = { str: string; transform: number[]; width: number };

/**
 * Every glyph an operator list draws, in content-stream order, with the font it is drawn in and
 * its baseline. pdf.js lists a font change only for `Tf`; `Q` and the end of a form XObject
 * bring the earlier font back without one, so the font is saved and restored with them. The
 * baseline follows the text and transformation matrices (glyph advances never move it in
 * horizontal text).
 */
export function drawnGlyphs(
  ops: { fnArray: number[]; argsArray: unknown[] },
  fontOf: (id: string) => PdfFont,
): RawGlyph[] {
  const glyphs: RawGlyph[] = [];
  const saved: { font: string; ctm: Matrix }[] = [];
  let font = '';
  let ctm = IDENTITY;
  let line = IDENTITY;
  let leading = 0;
  let rise = 0;
  const moveLine = (tx: number, ty: number) => {
    line = multiply([1, 0, 0, 1, tx, ty], line);
  };
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const raw = ops.argsArray[i];
    const args: unknown[] = Array.isArray(raw) ? raw : [];
    if (fn === OPS.setFont) font = String(args[0]);
    else if (fn === OPS.save) saved.push({ font, ctm });
    else if (fn === OPS.paintFormXObjectBegin) {
      saved.push({ font, ctm });
      const form = matrixOf([args[0]]);
      if (form) ctm = multiply(form, ctm);
    } else if (fn === OPS.restore || fn === OPS.paintFormXObjectEnd)
      ({ font, ctm } = saved.pop() ?? { font, ctm });
    else if (fn === OPS.transform) ctm = multiply(matrixOf(args) ?? IDENTITY, ctm);
    else if (fn === OPS.beginText) line = IDENTITY;
    else if (fn === OPS.setTextMatrix) line = matrixOf(args) ?? line;
    else if (fn === OPS.moveText) moveLine(num(args[0]), num(args[1]));
    else if (fn === OPS.setLeadingMoveText) {
      leading = -num(args[1]);
      moveLine(num(args[0]), num(args[1]));
    } else if (fn === OPS.setLeading) leading = num(args[0]);
    else if (fn === OPS.setTextRise) rise = num(args[0]);
    if (fn === OPS.nextLine || fn === OPS.nextLineShowText || fn === OPS.nextLineSetSpacingShowText)
      moveLine(0, -leading);
    if (fn === undefined || !SHOW_TEXT.has(fn)) continue;
    const info = fontOf(font);
    const m = multiply(line, ctm);
    const y = rise * m[3] + m[5];
    for (const arg of args) {
      if (!Array.isArray(arg)) continue;
      for (const g of arg)
        if (isGlyph(g))
          glyphs.push({
            font: info.name ?? font,
            composite: info.composite === true,
            code: g.originalCharCode,
            unicode: g.unicode,
            y,
          });
    }
  }
  return glyphs;
}

/** A loaded font's details; an id pdf.js has not resolved gives none. */
function fontInfo(page: PDFPageProxy, id: string): PdfFont {
  try {
    return page.commonObjs.get(id) as PdfFont;
  } catch {
    return {};
  }
}

/**
 * Reads every positioned text run from the PDF. Runs drawn with composite fonts get their real
 * text from the glyph decoder (`decoded: true`, no later repair); the rest stay raw and are
 * repaired per use. Two passes: the first reads every page and learns how each font orders its
 * glyphs, the second decodes. An encrypted PDF is not decoded (its font programs are unreadable
 * here), so it gets the text pdf.js shows, as before.
 */
export async function extractPdf(file: string): Promise<ExtractedPdf> {
  const bytes = new Uint8Array(await readFile(file));
  const tables = readPdfFontTables(bytes);
  if (tables.encrypted)
    console.warn(
      `${file}: encrypted PDF; embedded fonts are not decoded, text is as pdf.js shows it`,
    );
  const decoder = createGlyphDecoder(tables);
  const order = createGlyphOrderEvidence();
  // pdf.js takes ownership of the buffer it is given; the font tables are already read.
  const task = getDocument({ data: bytes, verbosity: 0, fontExtraProperties: true });
  const pdf = await task.promise;
  const pages: PageText[] = [];
  let pageHeight = 0;

  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    pageHeight = Math.max(pageHeight, page.view[3] ?? 0);
    const content = await page.getTextContent();
    const glyphs = drawnGlyphs(await page.getOperatorList(), (id) => fontInfo(page, id));
    for (const g of glyphs)
      if (g.composite && !decoder.unmapped(g.font, g.code, g.unicode))
        order.add(g.font, decoder.glyphId(g.font, g.code), g.unicode);
    const runs = content.items.flatMap((item) => {
      if (!('str' in item)) return [];
      const info = fontInfo(page, item.fontName);
      return [
        {
          str: item.str,
          transform: item.transform as number[],
          width: item.width,
          font: info.name ?? item.fontName,
          composite: info.composite === true,
        },
      ];
    });
    pages.push({ runs, glyphs });
    page.cleanup();
  }

  const items: TextItem[] = [];
  pages.forEach(({ runs, glyphs }, index) => {
    const drawn: DrawnGlyph[] = glyphs.map((g) => {
      const shown = normalizeUnicode(g.unicode);
      if (!g.composite || !decoder.unmapped(g.font, g.code, g.unicode))
        return { font: g.font, shown, real: shown, y: g.y };
      const gid = decoder.glyphId(g.font, g.code);
      const real = decoder.decode(g.font, gid) ?? order.guess(g.font, gid) ?? UNKNOWN_GLYPH;
      return { font: g.font, shown, real: normalizeUnicode(real), y: g.y };
    });
    const real = realText(
      runs.map((r) => ({
        str: r.str,
        fontName: r.font,
        y: r.transform[5],
        size: Math.hypot(r.transform[2] ?? 0, r.transform[3] ?? 0),
      })),
      drawn,
    );
    runs.forEach((run, i) => {
      if (run.str.trim() === '') return;
      const [, , c = 0, d = 0, x = 0, y = 0] = run.transform;
      // Badges are drawn in their own font with control-code glyphs; keep them raw.
      const isLabel = LABEL.test(run.str) && RAW_CODE.test(run.str);
      const paired = real[i];
      // Only text paired with its glyphs counts as decoded; anything else keeps the old repair.
      const decoded = !tables.encrypted && run.composite && !isLabel && !!paired?.paired;
      // A simple-font run keeps its text (and the later repair) plus the glyphs it took over.
      const attached =
        !tables.encrypted && !isLabel && paired?.paired
          ? `${paired.prefix ?? ''}${run.str}${paired.suffix ?? ''}`
          : run.str;
      items.push({
        page: index + 1,
        text: decoded && paired ? withoutRawCodes(paired.text) : attached,
        size: Math.hypot(c, d),
        x,
        y,
        width: run.width,
        isLabel,
        decoded,
      });
    });
  });

  const pageCount = pdf.numPages;
  await task.destroy();
  return { file, pageCount, pageHeight, items };
}
