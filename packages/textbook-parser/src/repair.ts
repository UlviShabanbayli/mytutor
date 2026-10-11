// Glyph repair for TRİMS textbook PDFs exported from InDesign.
// Several embedded font subsets lack a ToUnicode map for some glyphs, so pdf.js
// falls back to raw codes. The damage is consistent and comes in three forms:
//   1. "shifted" runs: every code is the real character minus 29 ("5aViRnal" = "Rasional");
//   2. decorative heading capitals mapped to odd modifier letters ("˅asional" = "Rasional");
//   3. a few all-caps glyphs and ligatures in otherwise clean headings ("MƏSƏLƏ 9Ə" = "VƏ").

const SHIFT = 29;

/** Glyphs whose raw code is not `char - 29` (Azerbaijani letters and ligatures). */
const SHIFTED_SPECIALS: Record<string, string> = {
  '|': 'ö',
  h: 'Ü',
  o: 'ç',
  '\u00F8': 'ğ', // ø
  '\u00F9': 'İ', // ù
  '\u00FA': 'Ş', // ú
  '\u02CD': 'Ə', // ˍ
  '\u00C1': 'fl', // Á
  '\u00C0': 'fi', // À
  '\u00EE': '−', // î
};

/** Decorative capitals used by the 22pt topic-title style. */
const DECORATIVE: Record<string, string> = {
  '\u02B4': 'A', // ʴ
  '\u02B5': 'B', // ʵ
  '\u02B6': 'C', // ʶ
  '\u0319': 'Ç', // combining mark standing in for Ç
  '\u03BD': 'Ə', // ν
  '\u02C0': 'M', // ˀ
  '\u02C1': 'N', // ˁ
  '\u02C2': 'O', // ˂
  '\u02C4': 'Q', // ˄
  '\u02C5': 'R', // ˅
  '\u02C6': 'S', // ˆ
  '\u02BE': 'K', // ʾ
  '\u02BF': 'L', // ʿ
  '\u02BC': 'I', // ʼ
  '\u037A': 'İ', // ͺ
  '\u039E': 'Ş', // Ξ
  '\u02C8': 'U', // ˈ
  '\u02CC': 'Y', // ˌ
  '\u02CD': 'Z', // ˍ
  '\u02D9': 'f', // ˙
  '\u02DB': 'h', // ˛
  '\u02AD': ':', // ʭ
};

/** All-caps glyphs without ToUnicode in the 16pt heading style. */
const ALL_CAPS: Record<string, string> = {
  ';': 'X',
  '9': 'V',
  '*': 'G',
  '-': 'J',
  '÷': 'Ğ',
  '\u0005': '"',
  '\u001d': ':',
};

const LIGATURES: Record<string, string> = { '\u00C0': 'fi', '\u00C1': 'fl' }; // À Á

const LOWER = 'a-zəıüöşçğ';
/**
 * Signs of a shifted run: a capital/bracket glyph right after a lowercase letter inside a
 * word ("RUta", "hoEXFa"), a word starting with "[" (shifted "x"), or a raw control code.
 */
const SHIFTED_RUN = new RegExp(`[${LOWER}][A-Z\\[\\]\\\\|]|(^|\\s)\\[[${LOWER}]|[\\u0003-\\u001f]`);

export function looksShifted(text: string): boolean {
  return SHIFTED_RUN.test(text);
}

export function decodeShifted(text: string): string {
  let out = '';
  for (const ch of text) {
    const special = SHIFTED_SPECIALS[ch];
    if (special !== undefined) {
      out += special;
      continue;
    }
    const code = ch.codePointAt(0) ?? 0;
    // Real spaces survive extraction; A, B and C would land on ^ _ ` so they are genuine.
    const shifted = code >= 0x03 && code <= 0x5d && ch !== ' ' && !'ABC'.includes(ch);
    out += shifted ? String.fromCodePoint(code + SHIFT) : ch;
  }
  return out;
}

function mapChars(text: string, table: Record<string, string>): string {
  let out = '';
  for (const ch of text) out += table[ch] ?? ch;
  return out;
}

const hasLowercase = (text: string) => new RegExp(`[${LOWER}]`).test(text);

/** Repairs heading text (any font size above body text). */
export function repairHeading(text: string): string {
  const decorative = mapChars(text, DECORATIVE);
  // All-caps headings only lose a handful of capitals; never shift them wholesale.
  if (!hasLowercase(decorative)) return mapChars(decorative, ALL_CAPS);
  if (looksShifted(text)) return decodeShifted(text);
  return mapChars(decorative, LIGATURES);
}

/**
 * Repairs body text. Unlike headings, digits and punctuation in body runs are real, so the
 * all-caps table only applies to runs that contain at least two capital letters.
 */
export function repairBody(text: string): string {
  if (looksShifted(text)) return decodeShifted(text);
  const decorative = mapChars(text, DECORATIVE);
  const capitals = (decorative.match(/\p{Lu}/gu) ?? []).length;
  if (!hasLowercase(decorative) && capitals >= 2) return mapChars(decorative, ALL_CAPS);
  return mapChars(decorative, LIGATURES);
}

/**
 * Repairs a short run that may be a shifted number (page numbers are drawn in body fonts).
 * Shifted digits and dots land on control codes (0x13–0x1c, 0x11), so only those are shifted
 * back; printable characters are real, which keeps mixed runs like "7" + shifted "1" intact.
 */
export function repairNumber(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    out += code >= 0x03 && code < 0x20 ? String.fromCodePoint(code + SHIFT) : ch;
  }
  return out;
}

/** A run's number text: decoded runs are already real text, raw runs may be shifted. */
export const numberText = (item: { text: string; decoded: boolean }) =>
  item.decoded ? item.text : repairNumber(item.text);

const ALLOWED = /^[\p{L}\p{N}\s.,:;!?()"'«»\-–—−+=/%°²³]*$/u;
const AZ_LETTERS = /^[A-Za-zƏəÇçĞğIıİiÖöŞşÜü\s\d.,:;!?()"'«»\-–—−+=/%°²³]*$/;

/** True when repaired text still contains glyphs that are not Azerbaijani text. */
export function isSuspicious(text: string): boolean {
  return !ALLOWED.test(text) || !AZ_LETTERS.test(text);
}
