import type { SourceBlockKind } from '@mytutor/types';
import { hasWord } from './classify';
import type { Marker } from './markers';
import { numberText, repairBody } from './repair';
import { similarity } from './structure';
import type { TextItem, TextLine } from './types';

/**
 * Block markers for books outside the TRİMS template (no badges, icons or number circles).
 * What such books share is a vocabulary of labels set in their own run at the start of a line
 * ("Nümunə 1.", "Araşdırma.", "Tərif."), sub-headings set a little larger than the text,
 * and exercise numbers set larger than the text at the left of the column.
 */

/** Labels that open a block, by kind. Lower case, without the number or the final mark. */
const OPENERS: [RegExp, SourceBlockKind][] = [
  [/^(nümunə|nümunələr|məsələ|misal|misallar)$/, 'example'],
  [
    /^(araşdırma|araşdırma-müzakirə|praktik məşğələ|praktik iş|fəaliyyət|tədqiqat|təcrübə)$/,
    'inquiry',
  ],
  [/^(tərif|qeyd|diqqət|yadda saxla|qayda)$/, 'remember'],
  [/^(teorem|tərs teorem|nəticə|aksiom|lemma)$/, 'theorem'],
  [/^(bu maraqlıdır|riyaziyyat tarixindən|tarixi məlumat)$/, 'history'],
  [/^(fikirləş|düşün)$/, 'think'],
  [/^(səhvi tap|səhvi düzəlt)$/, 'find_mistake'],
  [/^(öyrənmə tapşırıqları|tapşırıqlar|çalışmalar|çalışma)$/, 'exercises'],
  [/^(tətbiq tapşırıqları|yaradıcı tətbiq|məsələ həlli|məsələlər)$/, 'problems'],
];
const kindOf = (phrase: string) =>
  OPENERS.find(([pattern]) => pattern.test(phrase.toLocaleLowerCase('az').trim()))?.[1];
/** "Nümunə 2." / "Tərif." / "Bu maraqlıdır!": a short capitalised phrase, a number, a mark. */
const LABEL = /^([A-ZÇƏĞIİÖŞÜ][\p{L}\s-]{1,40}?)(?:\s+(\d{1,2}))?\s*[.:!]$/u;
/** A sub-heading or an exercise number is set at least this much larger than the text. */
const LARGER = 1.05;
const TITLE_MATCH = 0.6;
/** Formula and table text set large is not a heading; nor is an instruction ending in a stop. */
const NOT_HEADING = /[=<>~∆º√]|[.,;]$/u;
/** Rows whose baselines differ by less than this share of their size are one row. */
const SAME_ROW = 0.35;

type Input = {
  lines: TextLine[];
  items: TextItem[];
  body: number;
  pageHeight: number;
  topicTitle: string;
};

const textOf = (i: TextItem) => (i.decoded ? i.text : repairBody(i.text)).trim();
const letters = (s: string) => s.toLocaleLowerCase('az').replace(/[^\p{L}\p{N}]/gu, '');

/** What follows the topic title on a row that starts with it ('' for a bare running head). */
function afterTitle(text: string, title: string): string | null {
  const head = letters(title);
  if (!head || !letters(text).startsWith(head)) return null;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    seen += letters(text[i] ?? '').length;
    if (seen >= head.length) return text.slice(i + 1).trim();
  }
  return '';
}

type Named = { kind: SourceBlockKind; label: string; title: string | null; number: string | null };

/** A heading that is a label set without its own run: "Nümunə 1", "Teorem. Medianlar". */
function headingKind(text: string): Named | null {
  const whole = /^(.+?)(?:\s+(\d{1,2}))?\s*[.:!]?$/u.exec(text);
  const kind = whole?.[1] ? kindOf(whole[1]) : undefined;
  if (whole && kind) return { kind, label: text, title: null, number: whole[2] ?? null };
  const prefixed = /^([^.:!]{2,40}?)(?:\s+(\d{1,2}))?([.:!])\s+(.+)$/u.exec(text);
  const prefixKind = prefixed?.[1] ? kindOf(prefixed[1]) : undefined;
  if (!prefixed || !prefixKind) return null;
  const label = `${prefixed[1]}${prefixed[2] ? ` ${prefixed[2]}` : ''}${prefixed[3]}`;
  return { kind: prefixKind, label, title: prefixed[4] ?? null, number: prefixed[2] ?? null };
}

/** Finds block markers by label vocabulary and layout, in reading order. */
export function findLayoutMarkers({ lines, items, body, pageHeight, topicTitle }: Input): Marker[] {
  const markers: Marker[] = [];
  const topOf = (l: { y: number; size: number }) => pageHeight - l.y - l.size;
  const firstRun = (line: TextLine) =>
    items
      .filter(
        (i) =>
          i.page === line.page &&
          Math.abs(i.y - line.y) <= line.size * SAME_ROW &&
          i.x >= line.x - 1 &&
          textOf(i),
      )
      .sort((a, b) => a.x - b.x)[0];

  let titled = false;
  for (const line of lines) {
    const text = line.text.trim();
    const at = { page: line.page, top: topOf(line) };
    if (!titled && line.size >= body * 1.15 && similarity(text, topicTitle) >= TITLE_MATCH) {
      markers.push({ kind: 'title', ...at, label: null, title: text, number: null });
      titled = true;
      continue;
    }
    // A label is its own run (it is set bold or in colour), so a sentence that merely starts
    // with the same word is not one.
    const run = firstRun(line);
    const label = run && LABEL.exec(textOf(run));
    const kind = label?.[1] ? kindOf(label[1]) : undefined;
    if (label && kind) {
      markers.push({
        kind,
        ...at,
        label: textOf(run),
        title: null,
        number: label[2] ?? null,
      });
      continue;
    }
    // "1 İfadələrdən hansının …" with the number in the statement's run, set larger.
    const numbered = /^(\d{1,2})\.?\s+\p{Lu}/u.exec(text);
    if (numbered && line.minSize >= body * LARGER) {
      markers.push({
        kind: 'exercise',
        ...at,
        label: null,
        title: null,
        number: numbered[1] ?? null,
      });
      continue;
    }
    if (
      line.minSize >= body * LARGER &&
      line.size < body * 1.6 &&
      hasWord(text) &&
      !/^\d/.test(text)
    ) {
      // The topic title repeated atop a later page is a running head; a label may follow it.
      const rest = titled ? afterTitle(text, topicTitle) : null;
      const heading = rest ?? text;
      if (!heading) continue;
      // A heading may be a label ("Nümunə 1", "Tətbiq tapşırıqları") opening its own kind.
      const named = headingKind(heading);
      if (named) markers.push({ ...named, ...at });
      else if (/^\p{Lu}/u.test(heading) && /\p{Ll}/u.test(heading) && !NOT_HEADING.test(heading))
        markers.push({ kind: 'section', ...at, label: null, title: heading, number: null });
    }
  }

  // A topic starting mid-page may print its heading at sub-heading size: the first heading,
  // when it reads like the topic's title (or a part of it), is the title.
  const first = markers[0];
  if (!titled && first?.kind === 'section' && first.title) {
    const part = letters(topicTitle).includes(letters(first.title));
    if (part || similarity(first.title, topicTitle) >= TITLE_MATCH) first.kind = 'title';
  }

  // An exercise number set apart, larger than the text, first on its row with the statement
  // right of it (the number may sit a little above or below the statement's baseline).
  const words = items.filter((i) => /\p{L}/u.test(textOf(i)));
  for (const i of items) {
    const number = numberText(i).trim();
    if (!/^\d{1,2}\.?$/.test(number) || i.size < body * LARGER) continue;
    const row = (w: TextItem) => w.page === i.page && Math.abs(w.y - i.y) <= i.size * 0.6;
    const statement = words.find(
      (w) => row(w) && w.x > i.x + i.width && w.x - (i.x + i.width) < 40,
    );
    if (!statement || words.some((w) => row(w) && w.x + w.width <= i.x)) continue;
    const top = Math.min(topOf(i), topOf(statement));
    markers.push({
      kind: 'exercise',
      page: i.page,
      top,
      label: null,
      title: null,
      number: number.replace(/\.$/, ''),
    });
  }

  return markers.sort((a, b) => a.page - b.page || a.top - b.top);
}
