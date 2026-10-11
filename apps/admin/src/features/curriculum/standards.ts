import type { CurriculumStandard } from '@mytutor/types';

const parts = (code: string) =>
  code
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number);

/** Curriculum order: "1.2" < "1.10" < "2.1", "7-1.1.1" next to "7-1.1.2". */
export function compareCodes(a: string, b: string): number {
  const x = parts(a);
  const y = parts(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? -1) - (y[i] ?? -1);
    if (d) return d;
  }
  return a.localeCompare(b);
}

/** "1.2.3" → "1.2"; null for a top-level code. */
export function parentCode(code: string): string | null {
  const at = code.lastIndexOf('.');
  return at > 0 && /\d\.\d/.test(code) ? code.slice(0, at) : null;
}

export type StandardRow = { standard: CurriculumStandard; depth: number };
export type StandardGroup = { line: string | null; rows: StandardRow[] };

/**
 * Standards in curriculum order, grouped by content line; a sub-standard is indented under the
 * standard its code extends ("1.1.2" under "1.1") when that standard is in the list.
 */
export function groupStandards(standards: CurriculumStandard[]): StandardGroup[] {
  const codes = new Set(standards.map((s) => s.code));
  const depth = (code: string): number => {
    const parent = parentCode(code);
    return parent && codes.has(parent) ? depth(parent) + 1 : 0;
  };
  const groups: StandardGroup[] = [];
  for (const standard of [...standards].sort((a, b) => compareCodes(a.code, b.code))) {
    let group = groups.find((g) => g.line === standard.line);
    if (!group) {
      group = { line: standard.line, rows: [] };
      groups.push(group);
    }
    group.rows.push({ standard, depth: depth(standard.code) });
  }
  return groups;
}

const fold = (text: string) => text.toLocaleLowerCase('az').normalize('NFC');

/** Search by code prefix ("1.2") or by words of the text, ignoring case. */
export function matchesQuery(standard: CurriculumStandard, query: string): boolean {
  const q = fold(query.trim());
  if (!q) return true;
  if (standard.code.startsWith(q)) return true;
  const text = fold(`${standard.text} ${standard.line ?? ''}`);
  return q.split(/\s+/).every((word) => text.includes(word));
}
