import type { CurriculumStandard } from '@mytutor/types';
import { compareCodes } from './standards';

export type ParsedStandards = {
  standards: CurriculumStandard[];
  /** Codes that appeared more than once; the first text is kept. */
  duplicates: string[];
  /** Lines before the first code or heading: titles, page numbers. */
  ignored: string[];
};

// "Məzmun xətti 1. Ədədlər və əməllər", "1. Ədədlər və əməllər", "Məzmun xətti: Həndəsə"
const HEADING = /^(?:məzmun\s+xətti\s*)?\d{1,2}\s*[.)]\s+(\D.*)$/iu;
const NAMED_HEADING = /^məzmun\s+xətti\s*[:–—-]\s*(.+)$/iu;
// "1.1.1. Mətn", "7-1.2.3 – Mətn", "2.1) Mətn"
const STANDARD =
  /^((?:\d{1,2}\s*[-–]\s*)?\d{1,2}(?:\s*\.\s*\d{1,3}){1,3})\s*\.?(?:\s*[-–—:)]\s*|\s+)(\S.*)$/u;

const normalizeCode = (code: string) => code.replace(/\s+/g, '').replace(/–/g, '-');
const cleanHeading = (text: string) => text.replace(/[\s:.]+$/u, '');

/** Joins a wrapped line; "ədəd-" + "lərin" becomes "ədədlərin" (a word broken by the PDF). */
function join(text: string, next: string) {
  if (/\p{L}-$/u.test(text) && /^\p{Ll}/u.test(next)) return text.slice(0, -1) + next;
  return `${text} ${next}`;
}

/**
 * Reads standards pasted from a curriculum document. Content-line headings ("1. Ədədlər və
 * əməllər") set the line of the standards below them; a line without a code continues the
 * previous standard or heading, as text copied from a PDF wraps.
 */
export function parseStandards(text: string): ParsedStandards {
  const found = new Map<string, CurriculumStandard>();
  const duplicates = new Set<string>();
  const ignored: string[] = [];
  let line: string | null = null;
  let last: { kind: 'heading' } | { kind: 'standard'; standard: CurriculumStandard } | null = null;

  for (const raw of text.split(/\r?\n/)) {
    const row = raw.replace(/\s+/g, ' ').trim();
    if (!row) continue;
    const standard = STANDARD.exec(row);
    const heading = standard ? null : (NAMED_HEADING.exec(row) ?? HEADING.exec(row));
    if (standard) {
      const code = normalizeCode(standard[1] ?? '');
      const item = { code, text: standard[2] ?? '', line };
      if (found.has(code)) duplicates.add(code);
      else found.set(code, item);
      last = { kind: 'standard', standard: item };
    } else if (heading) {
      line = cleanHeading(heading[1] ?? '');
      last = { kind: 'heading' };
    } else if (last?.kind === 'standard') {
      last.standard.text = join(last.standard.text, row);
    } else if (last?.kind === 'heading' && line !== null) {
      line = cleanHeading(join(line, row));
    } else {
      ignored.push(row);
    }
  }

  return {
    standards: [...found.values()].sort((a, b) => compareCodes(a.code, b.code)),
    duplicates: [...duplicates],
    ignored,
  };
}

export type MergedStandards = { standards: CurriculumStandard[]; added: number; updated: number };

/** Adds pasted standards to a curriculum: a code it already has gets the pasted text. */
export function mergeStandards(
  current: CurriculumStandard[],
  pasted: CurriculumStandard[],
): MergedStandards {
  const byCode = new Map(current.map((s) => [s.code, s]));
  let added = 0;
  let updated = 0;
  for (const standard of pasted) {
    const before = byCode.get(standard.code);
    if (!before) added++;
    else if (before.text !== standard.text || before.line !== standard.line) updated++;
    byCode.set(standard.code, standard);
  }
  const standards = [...byCode.values()].sort((a, b) => compareCodes(a.code, b.code));
  return { standards, added, updated };
}
