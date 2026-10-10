/** One drawn glyph, in content-stream order: what pdf.js shows and what it really is. */
export type DrawnGlyph = {
  /**
   * The font's PDF name ("RATYHG+SegoeUI"). Not pdf.js's loaded id: one PDF font can be loaded
   * under several ids, and text items may name a different one than the drawing operators.
   */
  font: string;
  /** Text pdf.js puts in text items for this glyph (after its normalisation). */
  shown: string;
  /** The glyph's real text; equals `shown` unless the glyph decoder corrected it. */
  real: string;
};

/** A pdf.js text item; `fontName` here is the font's PDF name (see `DrawnGlyph.font`). */
export type TextRun = { str: string; fontName: string };

/** A run's text and whether it was paired with its glyphs (else it is pdf.js's text as is). */
export type RealText = { text: string; paired: boolean };

/** Share of a run's visible characters that must pair with glyphs to trust the pairing. */
const MIN_PAIRED = 0.9;

type Match = { text: string; end: number; paired: number };

const isSpace = (ch: string | undefined) => ch !== undefined && /\s/.test(ch);

/**
 * Pairs `str` with glyphs starting at `start`. Spaces pdf.js inserted between words have no
 * glyph; glyphs that show nothing are skipped; anything else unpaired stays as pdf.js showed it.
 */
function pairFrom(str: string, glyphs: DrawnGlyph[], start: number, font: string): Match {
  let text = '';
  let g = start;
  let pos = 0;
  let paired = 0;
  while (pos < str.length) {
    while (g < glyphs.length && glyphs[g]?.shown === '') g++;
    const glyph = glyphs[g];
    if (glyph && glyph.font === font && glyph.shown && str.startsWith(glyph.shown, pos)) {
      text += glyph.real;
      pos += glyph.shown.length;
      if (!isSpace(glyph.shown)) paired += glyph.shown.length;
      g++;
    } else {
      text += str[pos];
      pos++;
    }
  }
  return { text, end: g, paired };
}

/**
 * Rewrites pdf.js text items with the real text of their glyphs. Items and glyphs come from the
 * same content stream, mostly in the same order, so each run is paired starting from the first
 * glyph of its font that fits, searching forward from where the previous run ended and then
 * from the page start. A run whose characters mostly do not pair keeps pdf.js's text, so a bad
 * pairing can never make text worse than it was.
 */
export function realText(runs: TextRun[], glyphs: DrawnGlyph[]): RealText[] {
  let cursor = 0;
  return runs.map(({ str, fontName }) => {
    const first = str.search(/\S/);
    if (first < 0) return { text: str, paired: false };
    const visible = str.replace(/\s/g, '').length;
    const lead = str.slice(first);
    const fits = (j: number) => {
      const glyph = glyphs[j];
      return glyph?.font === fontName && !!glyph.shown && lead.startsWith(glyph.shown);
    };
    const tryAt = (j: number) => {
      const m = pairFrom(lead, glyphs, j, fontName);
      return m.paired >= visible * MIN_PAIRED ? m : null;
    };
    for (const range of [
      [cursor, glyphs.length],
      [0, cursor],
    ] as const) {
      for (let j = range[0]; j < range[1]; j++) {
        if (!fits(j)) continue;
        const m = tryAt(j);
        if (!m) continue;
        cursor = m.end;
        return { text: str.slice(0, first) + m.text, paired: true };
      }
    }
    return { text: str, paired: false };
  });
}
