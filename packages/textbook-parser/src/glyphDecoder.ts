import type { EmbeddedFont, PdfFontTables } from './pdfFonts';

/**
 * Characters for glyphs that no table inside the PDF names. These are properties of widely
 * used fonts (not of a book): the symbol positions were checked against rendered glyphs.
 * Keyed by font family (the PostScript name without the subset prefix and style suffix).
 */
const FONT_TABLES: { family: RegExp; glyphs: Record<number, string> }[] = [
  { family: /^SymbolMT/, glyphs: { 16: '−', 120: '•', 156: '⇔' } },
  { family: /^TimesNewRoman/, glyphs: { 168: 'Δ', 194: '·' } },
  { family: /^SegoeUI/, glyphs: { 4336: '–' } },
];

/** "GPFMAM+SegoeUI-Bold" → "SegoeUI-Bold". */
export const baseFontName = (name: string) => name.split('+').pop() ?? name;

export type GlyphDecoder = {
  /** The character of an unmapped glyph, or null when nothing in the PDF names it. */
  decode(fontName: string, gid: number): string | null;
};

/**
 * pdf.js reports a glyph that the font's ToUnicode map does not cover with its character code
 * as the text (code 75 → "K"). A mapped glyph's text differs from its code.
 */
export const isFallbackGlyph = (code: number, unicode: string) =>
  unicode.length > 0 && unicode.codePointAt(0) === code && [...unicode].length === 1;

/**
 * Resolves glyphs of composite fonts whose ToUnicode map is partial. Order:
 * 1. the font program's own cmap;
 * 2. the cmap of a sibling subset of the same font in the same PDF (same base name and glyph
 *    count, so glyph ids line up);
 * 3. a small reviewed table for symbol fonts that carry no cmap at all.
 * Guessing from glyph order is deliberately not done: it silently produces wrong symbols.
 */
export function createGlyphDecoder({ fonts }: PdfFontTables): GlyphDecoder {
  const byName = new Map(fonts.map((f) => [f.name, f]));
  const siblings = new Map<string, EmbeddedFont | null>();
  const sibling = (font: EmbeddedFont): EmbeddedFont | null => {
    if (!siblings.has(font.name)) {
      const base = baseFontName(font.name);
      siblings.set(
        font.name,
        fonts.find(
          (f) =>
            f.name !== font.name &&
            baseFontName(f.name) === base &&
            f.numGlyphs === font.numGlyphs &&
            f.cmap.size > 100,
        ) ?? null,
      );
    }
    return siblings.get(font.name) ?? null;
  };

  return {
    decode(fontName, gid) {
      const font = byName.get(fontName);
      const code = font?.cmap.get(gid) ?? (font ? sibling(font)?.cmap.get(gid) : undefined);
      if (code !== undefined) return String.fromCodePoint(code);
      const family = baseFontName(fontName);
      return FONT_TABLES.find((t) => t.family.test(family))?.glyphs[gid] ?? null;
    },
  };
}

/** Offset of the Macintosh standard glyph order: glyph 36 is "A" (U+0041), glyph 68 is "a". */
const MAC_ORDER_SHIFT = 29;

/**
 * Evidence, per font, that glyph ids follow the Macintosh standard glyph order (as in many
 * TrueType fonts, e.g. Times New Roman or Segoe UI). Collected from the glyphs the font's
 * ToUnicode map does name: if almost all of its letters and digits sit at "code + 29", an
 * unnamed letter or digit of that font can be read the same way. Fonts without that evidence
 * (e.g. Poppins, whose "A" is glyph 692) are never guessed.
 */
export function createGlyphOrderEvidence() {
  const stats = new Map<string, { seen: number; fits: number }>();
  return {
    /** Records a glyph the ToUnicode map names. */
    add(font: string, code: number, unicode: string) {
      if (!/^[A-Za-z0-9]$/.test(unicode)) return;
      const s = stats.get(font) ?? { seen: 0, fits: 0 };
      s.seen++;
      if ((unicode.codePointAt(0) ?? 0) === code + MAC_ORDER_SHIFT) s.fits++;
      stats.set(font, s);
    },
    /** A letter or digit for an unnamed glyph, when the font's evidence supports it. */
    guess(font: string, code: number): string | null {
      const s = stats.get(font);
      if (!s || s.seen < 5 || s.fits / s.seen < 0.9) return null;
      const char = String.fromCodePoint(code + MAC_ORDER_SHIFT);
      return /^[A-Za-z0-9]$/.test(char) ? char : null;
    },
  };
}
