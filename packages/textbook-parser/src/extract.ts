import { readFile } from 'node:fs/promises';
import type { PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { getDocument, normalizeUnicode, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { type DrawnGlyph, realText } from './align';
import { createGlyphDecoder, createGlyphOrderEvidence, isFallbackGlyph } from './glyphDecoder';
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
type PdfFont = { composite?: boolean; name?: string };

const isGlyph = (g: unknown): g is PdfGlyph =>
  typeof g === 'object' && g !== null && 'unicode' in g && 'originalCharCode' in g;

type RawGlyph = { font: string; composite: boolean; code: number; unicode: string };
type PageText = {
  runs: (TextContentRun & { font: string; composite: boolean })[];
  glyphs: RawGlyph[];
};
type TextContentRun = { str: string; transform: number[]; width: number };

/** Every glyph the page draws, in content-stream order, as pdf.js reads it. */
async function rawGlyphs(page: PDFPageProxy): Promise<RawGlyph[]> {
  const ops = await page.getOperatorList();
  const glyphs: RawGlyph[] = [];
  let font = '';
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args: unknown[] = ops.argsArray[i] ?? [];
    if (fn === OPS.setFont) font = String(args[0]);
    if (fn === undefined || !SHOW_TEXT.has(fn)) continue;
    const info = page.commonObjs.get(font) as PdfFont;
    for (const arg of args) {
      if (!Array.isArray(arg)) continue;
      for (const g of arg)
        if (isGlyph(g))
          glyphs.push({
            font: info.name ?? font,
            composite: info.composite === true,
            code: g.originalCharCode,
            unicode: g.unicode,
          });
    }
  }
  return glyphs;
}

/**
 * Reads every positioned text run from the PDF. Runs drawn with composite fonts get their real
 * text from the glyph decoder (`decoded: true`, no later repair); the rest stay raw and are
 * repaired per use. Two passes: the first reads every page and learns how each font orders its
 * glyphs, the second decodes.
 */
export async function extractPdf(file: string): Promise<ExtractedPdf> {
  const bytes = new Uint8Array(await readFile(file));
  const decoder = createGlyphDecoder(readPdfFontTables(bytes));
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
    const glyphs = await rawGlyphs(page);
    for (const g of glyphs)
      if (g.composite && !isFallbackGlyph(g.code, g.unicode)) order.add(g.font, g.code, g.unicode);
    const runs = content.items.flatMap((item) => {
      if (!('str' in item)) return [];
      const info = page.commonObjs.get(item.fontName) as PdfFont;
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
      if (!g.composite || !isFallbackGlyph(g.code, g.unicode))
        return { font: g.font, shown, real: shown };
      const real = decoder.decode(g.font, g.code) ?? order.guess(g.font, g.code) ?? UNKNOWN_GLYPH;
      return { font: g.font, shown, real: normalizeUnicode(real) };
    });
    const real = realText(
      runs.map((r) => ({ str: r.str, fontName: r.font })),
      drawn,
    );
    runs.forEach((run, i) => {
      if (run.str.trim() === '') return;
      const [, , c = 0, d = 0, x = 0, y = 0] = run.transform;
      // Badges are drawn in their own font with control-code glyphs; keep them raw.
      const isLabel = LABEL.test(run.str) && RAW_CODE.test(run.str);
      const paired = real[i];
      // Only text paired with its glyphs counts as decoded; anything else keeps the old repair.
      const decoded = run.composite && !isLabel && !!paired?.paired;
      items.push({
        page: index + 1,
        text: decoded && paired ? withoutRawCodes(paired.text) : run.str,
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
