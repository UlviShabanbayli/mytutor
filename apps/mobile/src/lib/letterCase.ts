/**
 * Upper case by the language's rules. Azerbaijani has a dotted and a dotless i: "i" becomes "İ"
 * and "ı" becomes "I". `toUpperCase()` (and `textTransform: 'uppercase'`, which uses it) turns
 * "i" into "I", and Hermes may ignore the locale of `toLocaleUpperCase`, so the dotted i is
 * mapped by hand.
 */
export function upperCase(text: string, locale: string): string {
  return (locale === 'az' ? text.replaceAll('i', 'İ') : text).toUpperCase();
}
