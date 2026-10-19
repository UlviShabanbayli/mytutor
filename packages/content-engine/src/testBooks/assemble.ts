import type { PageReading, TestAnswer, TestQuestion } from '@mytutor/types';

/**
 * Whole questions from page readings, by code: headings carried from page to page, questions
 * that run over a page joined, answers from the book's key matched by subsection and number,
 * and anything doubtful flagged for the editor. Crops are cut afterwards from `pages`.
 */

type Reading = PageReading['questions'][number];
type Part = TestQuestion['pages'][number] & { figureBands: string[] };

export type Draft = Omit<
  TestQuestion,
  'id' | 'crops' | 'figures' | 'links' | 'uncovered' | 'pages'
> & {
  pages: Part[];
  situationFigureBands: { page: number; bands: string[] }[];
};

export type KeyEntry = {
  section: string;
  subsection: string;
  number: number;
  printed: string;
  page: number;
  printedPage: number | null;
};

/** Lower case, letters and digits only: what two printings of one title have in common. */
export const normTitle = (text: string) =>
  text
    .toLocaleLowerCase('az')
    .replace(/[^a-zəıöüğşçi0-9]+/g, ' ')
    .trim();

const words = (text: string) => new Set(normTitle(text).split(' ').filter(Boolean));

/** How alike two titles are: shared words over all words (0–1). */
export function titleSimilarity(a: string, b: string): number {
  const [x, y] = [words(a), words(b)];
  if (!x.size || !y.size) return 0;
  const shared = [...x].filter((w) => y.has(w)).length;
  return shared / (x.size + y.size - shared);
}

/** "b; c; a, e" → {1: [b], 2: [c], 3: [a, e]}; null when it is not a matching answer. */
export function parsePairs(printed: string, items: number): Record<string, string[]> | null {
  const parts = printed.split(';').map((p) => p.trim().toLowerCase());
  if (parts.length !== items) return null;
  const pairs: Record<string, string[]> = {};
  for (const [i, part] of parts.entries()) {
    const letters = part.split(/[,\s]+/).filter(Boolean);
    if (!letters.length || !letters.every((l) => /^[a-e]$/.test(l))) return null;
    pairs[String(i + 1)] = letters;
  }
  return pairs;
}

/** The answer as printed, understood for the question's type; the flag when it does not fit. */
export function answerFor(
  question: Pick<Draft, 'type' | 'matching'>,
  entry: KeyEntry,
): { answer: TestAnswer; flag: string | null } {
  const printed = entry.printed.trim();
  const letter = /^[A-E]$/i.test(printed) ? (printed.toUpperCase() as TestAnswer['choice']) : null;
  const pairs =
    question.type === 'matching' ? parsePairs(printed, question.matching?.left.length ?? 0) : null;
  const answer: TestAnswer = {
    printed,
    choice: letter,
    pairs,
    page: entry.page,
    printedPage: entry.printedPage,
  };
  const fits =
    question.type === 'choice'
      ? letter !== null
      : question.type === 'matching'
        ? pairs !== null
        : true;
  return { answer, flag: fits ? null : 'answer_type' };
}

const sameNumberedRun = (a: Draft, b: Draft) =>
  a.section === b.section && a.subsection === b.subsection;

/** Joins a continuation into the question it continues. */
function extend(draft: Draft, q: Reading, part: Part) {
  if (q.stem.trim()) draft.stem = `${draft.stem} ${q.stem.trim()}`.trim();
  draft.options.push(...q.options);
  if (q.left.length || q.right.length) {
    draft.matching = {
      left: [...(draft.matching?.left ?? []), ...q.left],
      right: [...(draft.matching?.right ?? []), ...q.right],
    };
  }
  draft.pages.push(part);
  if (q.unclear) draft.flags.push(`unclear: ${q.unclear}`);
}

/**
 * The difference between printed page numbers and PDF pages, by majority: one page read
 * wrongly (or printed without its number) does not move the others; null when none is read.
 */
export function printedOffset(readings: Map<number, PageReading>): number | null {
  const votes = new Map<number, number>();
  for (const [page, reading] of readings)
    if (reading.printedPage > 0)
      votes.set(reading.printedPage - page, (votes.get(reading.printedPage - page) ?? 0) + 1);
  const best = [...votes].sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : null;
}

/** Questions in book order from the readings of `pages` (ascending), and the answer key. */
export function assemble(readings: Map<number, PageReading>, pages: number[]) {
  const offset = printedOffset(readings);
  const drafts: Draft[] = [];
  const key: KeyEntry[] = [];
  const situations = new Map<
    string,
    { title: string; text: string; figures: { page: number; bands: string[] }[] }
  >();
  let section = '';
  let subsection = '';
  let keySection = '';
  for (const page of pages) {
    const reading = readings.get(page);
    if (!reading) continue;
    const printedPage = offset === null ? reading.printedPage || null : page + offset;
    if (reading.kind === 'answers') {
      for (const table of reading.answerTables) {
        keySection = table.section || keySection;
        for (const a of table.answers)
          key.push({
            section: keySection,
            subsection: table.subsection,
            number: a.number,
            printed: a.answer,
            page,
            printedPage,
          });
      }
      continue;
    }
    if (reading.kind !== 'questions') continue;
    const pageSection = reading.headings.filter((h) => h.level === 'section').at(-1)?.text;
    // A new topic starts its numbering over: the last subsection does not run into it.
    if (pageSection && normTitle(pageSection) !== normTitle(section)) {
      section = pageSection;
      subsection = '';
    }
    for (const s of reading.situations)
      situations.set(normTitle(s.title), {
        title: s.title,
        text: s.text,
        figures: s.figureBands.length ? [{ page, bands: s.figureBands }] : [],
      });
    for (const q of reading.questions) {
      const part: Part = { page, printedPage, bands: q.bands, figureBands: q.figureBands };
      const last = drafts.at(-1);
      const continued = q.continues === 'from_previous_page' || q.continues === 'both';
      if (continued && last && (q.number === 0 || q.number === last.number)) {
        extend(last, q, part);
        continue;
      }
      subsection = q.subsection || subsection;
      const situation = q.situation ? situations.get(normTitle(q.situation)) : undefined;
      drafts.push({
        number: q.number,
        section,
        subsection: subsection || section,
        written: q.written,
        situation: situation ? { title: situation.title, text: situation.text, figures: [] } : null,
        situationFigureBands: situation?.figures ?? [],
        type: q.type,
        stem: q.stem.trim(),
        options: [...q.options],
        matching: q.type === 'matching' ? { left: [...q.left], right: [...q.right] } : null,
        answer: null,
        pages: [part],
        flags: [
          ...(continued ? ['continuation_without_start'] : []),
          ...(q.unclear ? [`unclear: ${q.unclear}`] : []),
        ],
      });
    }
    const pageSubsection = reading.headings.filter((h) => h.level === 'subsection').at(-1)?.text;
    // A subsection heading at the very end of a page starts the next page's questions.
    const lastQuestion = reading.questions.at(-1);
    if (pageSubsection && (!lastQuestion || lastQuestion.subsection !== pageSubsection))
      subsection = pageSubsection;
  }

  for (const [i, d] of drafts.entries()) {
    if (d.type === 'choice' && d.options.length !== 5) d.flags.push('options_count');
    if (!d.pages.some((p) => p.bands.length)) d.flags.push('no_bands');
    const before = drafts[i - 1];
    if (before && sameNumberedRun(before, d) && d.number !== before.number + 1)
      d.flags.push(`number_gap: ${before.number} → ${d.number}`);
  }
  return { drafts, key };
}

/**
 * Gives each question its answer from the key: the key's subsection titles are matched to the
 * questions' (as printed, so they may differ a little), then entries by number.
 */
export function matchAnswers(drafts: Draft[], key: KeyEntry[]): KeyEntry[] {
  const runs = new Map<string, Draft[]>();
  for (const d of drafts) {
    const name = d.subsection;
    runs.set(name, [...(runs.get(name) ?? []), d]);
  }
  const keyRuns = new Map<string, KeyEntry[]>();
  for (const e of key) keyRuns.set(e.subsection, [...(keyRuns.get(e.subsection) ?? []), e]);
  const used = new Set<KeyEntry>();
  for (const [name, entries] of keyRuns) {
    let best: { run: Draft[]; score: number } | null = null;
    for (const [runName, run] of runs) {
      const score = Math.max(
        titleSimilarity(name, runName),
        titleSimilarity(name, run[0]?.section ?? ''),
      );
      if (!best || score > best.score) best = { run, score };
    }
    if (!best || best.score < 0.5) continue;
    for (const entry of entries) {
      const question = best.run.find((d) => d.number === entry.number);
      if (!question || question.answer) continue;
      const { answer, flag } = answerFor(question, entry);
      question.answer = answer;
      if (flag) question.flags.push(flag);
      used.add(entry);
    }
  }
  return key.filter((e) => !used.has(e));
}
