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
  /** Baseline (PDF user space), when known: says which line a glyph between two runs is on. */
  y?: number;
};

/**
 * A pdf.js text item; `fontName` here is the font's PDF name (see `DrawnGlyph.font`). `y` is
 * its baseline and `size` its font size, when known.
 */
export type TextRun = { str: string; fontName: string; y?: number; size?: number };

/**
 * A run's text and whether it was paired with its glyphs (else it is pdf.js's text as is).
 * `prefix` and `suffix` are glyphs pdf.js dropped next to the run that it took over; they are
 * already part of `text`.
 */
export type RealText = { text: string; paired: boolean; prefix?: string; suffix?: string };

/** Share of a run's visible characters that must pair with glyphs to trust the pairing. */
const MIN_PAIRED = 0.9;

type Match = { text: string; end: number; paired: number };

const isSpace = (text: string | undefined) => text !== undefined && /^\s+$/.test(text);

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
    } else if (glyph && glyph.font === font && isSpace(glyph.shown)) {
      // pdf.js counted this glyph as whitespace (a space, or an unmapped code 9–13 that is
      // really "(" or ")") and dropped or merged it: step over it, keeping what it really is.
      if (!isSpace(glyph.real)) {
        text += glyph.real;
        // It may stand in `str` as a plain space, unless a real space glyph comes next.
        const next = glyphs[g + 1];
        if (isSpace(str[pos]) && !(next?.font === font && isSpace(next.real))) pos++;
      }
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
  // Which run each glyph went to (-1: none).
  const owner = new Int32Array(glyphs.length).fill(-1);
  const starts: (number | null)[] = [];
  const texts: RealText[] = runs.map(({ str, fontName }, i) => {
    starts.push(null);
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
        owner.fill(i, j, m.end);
        starts[i] = j;
        return { text: str.slice(0, first) + m.text, paired: true };
      }
    }
    return { text: str, paired: false };
  });

  // pdf.js leaves glyphs it took for whitespace out of every item when they fall between two
  // items (an unmapped "=" drawn as code 32 between two spaces, a ")" drawn as code 12). Each
  // goes to the neighbouring run on its own line, in whatever font that run is ("(" Segoe UI,
  // "N" Times, ")" Segoe UI): to the run drawn before it if it closes something or only that run
  // is on its line, else to the run drawn after it. A glyph on neither run's line is dropped,
  // as pdf.js did. Without positions, closing brackets go back and the rest forward.
  texts.forEach((t, i) => {
    const start = starts[i];
    const run = runs[i];
    if (start === null || start === undefined || !t.paired || !run) return;
    let k = start;
    while (k > 0 && owner[k - 1] === -1 && isSpace(glyphs[k - 1]?.shown)) k--;
    const between = glyphs.slice(k, start);
    if (between.every((g) => isSpace(g.real))) return;
    owner.fill(i, k, start);
    const previous = k > 0 ? (owner[k - 1] ?? -1) : -1;
    const before = previous >= 0 && texts[previous]?.paired ? texts[previous] : undefined;
    const beforeRun = before ? runs[previous] : undefined;
    const onLine = (g: DrawnGlyph, r: TextRun | undefined) =>
      g.y !== undefined && r?.y !== undefined && Math.abs(g.y - r.y) <= (r.size ?? 10) * 0.5;
    const known = between.every((g) => g.y !== undefined) && run.y !== undefined;
    const closes = (g: DrawnGlyph) =>
      /^[)\]}]$/.test(g.real) ||
      (/^['"’”»]+$/.test(g.real) && g.font === beforeRun?.fontName && g.font !== run.fontName);
    const target = (g: DrawnGlyph): 'back' | 'front' | null => {
      if (!known) return closes(g) ? (before ? 'back' : null) : 'front';
      const back = !!before && onLine(g, beforeRun);
      if (back && (closes(g) || !onLine(g, run))) return 'back';
      return onLine(g, run) ? 'front' : null;
    };
    // Spaces follow the glyph before them, or the one after them when they lead.
    const targets = between.map((g) => (isSpace(g.real) ? undefined : target(g)));
    targets.forEach((_, j) => {
      if (targets[j] !== undefined) return;
      const left = targets
        .slice(0, j)
        .filter((x) => x !== undefined)
        .at(-1);
      targets[j] = left !== undefined ? left : targets.slice(j).find((x) => x !== undefined);
    });
    const text = (side: 'back' | 'front') =>
      between
        .filter((_, j) => targets[j] === side)
        .map((g) => (isSpace(g.real) ? ' ' : g.real))
        .join('');
    const suffix = text('back')
      .replace(/^\s+(?=[)\]}])/, '')
      .trimEnd();
    if (before && suffix.trim()) {
      before.text = `${before.text.trimEnd()}${suffix}`;
      before.suffix = `${before.suffix ?? ''}${suffix}`;
    }
    // Spaces drawn after the glyphs stay ("= 5"); none is added ("(5").
    const prefix = text('front').trimStart();
    if (!prefix.trim()) return;
    const first = t.text.search(/\S/);
    t.text = `${t.text.slice(0, first)}${prefix}${t.text.slice(first)}`;
    t.prefix = prefix;
  });
  return texts;
}
