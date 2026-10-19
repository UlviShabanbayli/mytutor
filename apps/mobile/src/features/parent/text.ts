/**
 * Azerbaijani text helpers for names inside sentences. i18n templates cannot add a case suffix
 * that depends on the name's last vowel, so screens pass a ready genitive ("Nərminin").
 */

const SUFFIX_VOWEL: Record<string, string> = {
  a: 'ı',
  ı: 'ı',
  o: 'u',
  u: 'u',
  e: 'i',
  ə: 'i',
  i: 'i',
  ö: 'ü',
  ü: 'ü',
};

/** Genitive by vowel harmony: Nərmin → Nərminin, Lalə → Lalənin, Murad → Muradın. */
export function genitiveAz(name: string): string {
  const word = name.trim();
  const letters = [...word.toLocaleLowerCase('az')];
  const lastVowel = [...letters].reverse().find((ch) => SUFFIX_VOWEL[ch] !== undefined);
  const vowel = (lastVowel && SUFFIX_VOWEL[lastVowel]) ?? 'i';
  const endsWithVowel = SUFFIX_VOWEL[letters[letters.length - 1] ?? ''] !== undefined;
  return `${word}${endsWithVowel ? 'n' : ''}${vowel}n`;
}

/** "a, b və c": items joined with a separator and a different last separator. */
export function joinList(items: string[], separator: string, lastSeparator: string): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(separator)}${lastSeparator}${items[items.length - 1]}`;
}
