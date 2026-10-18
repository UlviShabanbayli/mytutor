/**
 * Lower case for matching Azerbaijani text. "İ" and "I" are mapped first: JavaScript turns "İ"
 * into two characters ("i" + a combining dot) and "I" into "i", which breaks both the match
 * and the positions used for highlighting. Every other letter maps one to one.
 */
export function foldAz(text: string): string {
  return text.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
}

export type TextPart = { text: string; hit: boolean };

/** Splits text around every match of the query (case-insensitive) for highlighting. */
export function highlightParts(text: string, query: string): TextPart[] {
  const needle = foldAz(query.trim());
  if (!needle) return [{ text, hit: false }];
  const haystack = foldAz(text);
  const parts: TextPart[] = [];
  let from = 0;
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, from)) {
    if (at > from) parts.push({ text: text.slice(from, at), hit: false });
    parts.push({ text: text.slice(at, at + needle.length), hit: true });
    from = at + needle.length;
  }
  if (from < text.length) parts.push({ text: text.slice(from), hit: false });
  return parts;
}

export function matches(text: string, query: string): boolean {
  const needle = foldAz(query.trim());
  return needle.length > 0 && foldAz(text).includes(needle);
}

/** "a", "a və b", "a, b və c" with the locale's word for "and". */
export function listJoin(items: string[], and: string): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`;
}

/**
 * Topic numbers with runs of three or more in one unit written as a range:
 * ["4.1", "4.2", "4.3", "4.5"] → ["4.1–4.3", "4.5"].
 */
export function numberRanges(numbers: string[]): string[] {
  const runs: string[][] = [];
  for (const n of numbers) {
    const run = runs[runs.length - 1];
    const last = run?.[run.length - 1];
    const [unit, topic] = n.split('.');
    const [lastUnit, lastTopic] = last?.split('.') ?? [];
    if (run && unit === lastUnit && Number(topic) === Number(lastTopic) + 1) run.push(n);
    else runs.push([n]);
  }
  return runs.flatMap((run) =>
    run.length >= 3 ? [`${run[0] ?? ''}–${run[run.length - 1] ?? ''}`] : run,
  );
}
