import type { ExtractedItem } from '@mytutor/types';

// Word edges for Azerbaijani: \b only knows ASCII letters.
const START = '(?<![\\p{L}\\d])';
const END = '(?![\\p{L}\\d])';
const LOOK = '(?:əsasən|görə|bax\\p{L}*|uyğun\\p{L}*)';

/**
 * "şəkil" also means "form" or "way": "standart şəkildə" is "in standard form", "bu şəkildə"
 * is "in this way". The word before it decides; "kəsr şəklində" never matches (see below).
 */
const MANNER = new Set([
  'standart',
  'qısa',
  'bu',
  'belə',
  'həmin',
  'eyni',
  'başqa',
  'digər',
  'ümumi',
  'sadə',
  'müxtəlif',
  'fərqli',
  'hansı',
  'nə',
  'uyğun',
  'yığcam',
  'açıq',
  'aydın',
  'tam',
  'düzgün',
  'ətraflı',
  'sərbəst',
  'müstəqil',
  'yazılı',
  'şifahi',
  'ardıcıl',
  // "ixtisar olunmuş şəkildə" (in reduced form), "sadələşdirilmiş şəkildə"
  'olunmuş',
  'edilmiş',
  'sadələşdirilmiş',
]);

/**
 * Phrases that point at something printed next to the text. Only the cases that read it:
 * "şəklində" (in the form of), "qrafikini qurun" (draw the graph) and "cədvəl qurun" (make a
 * table) ask for no picture and do not match.
 */
const PATTERNS: { re: RegExp; manner?: boolean }[] = [
  // şəkildə, şəkildəki, şəkildən, şəkillərdə — "in / from the picture"
  { re: /şəkil(?:lər)?(?:dəki|də|dən)(?:dir)?/, manner: true },
  // "şəklə əsasən", "şəkilə baxın"; "standart şəklə gətirin" is a form
  { re: new RegExp(`(?:şəklə|şəkilə|şəkillərə)\\s+${LOOK}`, 'u'), manner: true },
  // numbered: "şəkil 3", "2-ci şəkil"
  { re: /şəkil\s*\d+|\d+\s*-?\s*(?:ci|cı|cu|cü)\s+şəkil/ },
  // təsvirdə, təsvirə əsasən, "təsvir edilən / olunub" (depicted); "təsvir edin" asks to draw
  { re: /təsvir(?:lər)?(?:dəki|də|dən)/ },
  { re: new RegExp(`təsvir(?:lər)?ə\\s+${LOOK}`, 'u') },
  { re: /təsvir\s+(?:edil|olun)(?:mişdir|muşdur|miş|muş|ib|ub|ən|an)/ },
  { re: /qrafik(?:lər)?(?:dəki|də|dən)/ },
  { re: new RegExp(`qrafik(?:lər)?(?:in)?ə\\s+${LOOK}`, 'u') },
  { re: /cədvəl(?:lər)?(?:dəki|də|dən)/ },
  { re: new RegExp(`cədvəl(?:lər)?(?:in)?ə\\s+${LOOK}`, 'u') },
  { re: /cədvəli\s+(?:tamamla|doldur)\p{L}*/u },
  { re: /diaqram(?:lar)?(?:dakı|da|dan|ın)/ },
  { re: new RegExp(`diaqram(?:lar)?(?:ın)?a\\s+${LOOK}`, 'u') },
  { re: /rəsm(?:lər)?(?:dəki|də|dən)/ },
  { re: new RegExp(`rəsm(?:lər)?(?:in)?ə\\s+${LOOK}`, 'u') },
  { re: /plan(?:dakı|da|dan)/ },
  { re: new RegExp(`plan(?:ın)?a\\s+${LOOK}`, 'u') },
  // a drawn board with writing on it
  { re: /lövhə(?:dəki|də)/ },
  // colour exists only in the drawing; "rəngli kağızda" (on coloured paper) does not match
  { re: /rəng(?:li|lənmiş)\s+(?:hissə|halqa|fiqur|düzbucaqlı|kvadrat|üçbucaq|dairə)\p{L}*/u },
].map(({ re, manner }) => ({
  re: new RegExp(`${START}(?:${re.source})${END}`, 'gu'),
  manner,
}));

const lastWord = (s: string) => /([\p{L}-]+)\s*$/u.exec(s)?.[1] ?? '';

/** The phrases in `text` that refer to a printed picture, graph, table or diagram. */
export function pictureReferences(text: string): string[] {
  const lower = text.toLocaleLowerCase('az');
  const found: { at: number; phrase: string }[] = [];
  for (const { re, manner } of PATTERNS) {
    for (const m of lower.matchAll(re)) {
      if (manner && MANNER.has(lastWord(lower.slice(0, m.index)))) continue;
      found.push({ at: m.index, phrase: m[0] });
    }
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.phrase);
}

const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(strings)
      : value && typeof value === 'object'
        ? Object.values(value).flatMap(strings)
        : [];

/** Every string the item carries as content (question text, instruction, sub-items, steps, …). */
export function itemText(item: ExtractedItem): string {
  const { type, ref, origin, sources, readFrom, ...content } = item;
  return strings(content).join('\n');
}

/**
 * Why the item needs a picture: the phrases that refer to one, or the item type for a figure
 * item (a description of a drawing). Empty when the text stands on its own.
 */
export function pictureNeed(item: ExtractedItem): string[] {
  const refs = pictureReferences(itemText(item));
  return item.type === 'figure' && refs.length === 0 ? ['figure'] : refs;
}
