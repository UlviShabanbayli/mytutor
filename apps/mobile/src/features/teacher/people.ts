import { upperCase } from '@/lib/letterCase';

// Names are Azerbaijani: dotted İ for i, I for ı, whatever the interface language.
const upper = (s: string) => upperCase(s, 'az');

/** "Nərmin Əliyeva" → "NƏ", "Tural İ." → "Tİ", "Səbinə" → "SƏ": the letters in a hexagon. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const [first = '', second] = words;
  if (second) return upper(`${first.charAt(0)}${second.charAt(0)}`);
  return upper(first.slice(0, 2));
}

/** "Nərmin Əliyeva" → "Nərmin Ə." (names already short stay as they are). */
export function shortName(name: string): string {
  const [first = '', second] = name.trim().split(/\s+/);
  if (!second || second.endsWith('.')) return name.trim();
  return `${first} ${upper(second.charAt(0))}.`;
}

/** "Nərmin Əliyeva" → "Nərmin": the first name, for short tiles and lists. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Search by any part of the name, ignoring case and Azerbaijani dotted/dotless letters. */
export function matchesName(name: string, query: string): boolean {
  // Map İ/I by hand (engines may ignore the locale), then treat i and ı as one letter.
  const fold = (s: string) =>
    s
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase()
      .replace(/\u0307/g, '')
      .replace(/ı/g, 'i');
  const q = fold(query.trim());
  return q === '' || fold(name).includes(q);
}
