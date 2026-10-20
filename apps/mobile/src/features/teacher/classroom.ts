import { upperCase } from '@/lib/letterCase';
import type { Audience, ClassGroup, RosterEntry } from '@mytutor/types';

// No 0/O or 1/I/L: a code read aloud or copied from a board must not be ambiguous.
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/** "7B" + "MATH" → "7B-MATH-4K2"; `random` returns [0, 1) and is injectable for tests. */
export function makeInviteCode(shortName: string, subjectCode: string, random = Math.random) {
  const tail = Array.from({ length: 3 }, () => {
    const i = Math.floor(random() * CODE_ALPHABET.length);
    return CODE_ALPHABET.charAt(Math.min(i, CODE_ALPHABET.length - 1));
  }).join('');
  const head = upperCase(shortName, 'az').replace(/[^0-9A-ZÇƏĞİÖŞÜ]/g, '');
  return `${head}-${subjectCode}-${tail}`;
}

/** The class short name from its full name: "7B · Riyaziyyat" → "7B". */
export function classShortName(name: string): string {
  const head = name.split('·')[0]?.trim() ?? '';
  return upperCase((head || name.trim()).slice(0, 3), 'az');
}

/** How many students an assignment reaches. */
export function audienceSize(audience: Audience, studentCount: number, groups: ClassGroup[]) {
  switch (audience.type) {
    case 'class':
      return studentCount;
    case 'group':
      return groups.find((g) => g.id === audience.groupId)?.memberIds.length ?? 0;
    case 'students':
      return audience.ids.length;
  }
}

/** Members shown for a name query and an optional group filter (null = everyone). */
export function filterMembers(
  members: RosterEntry[],
  matches: (name: string) => boolean,
  group: ClassGroup | null,
) {
  return members.filter((m) => matches(m.name) && (!group || group.memberIds.includes(m.personId)));
}

/** Clamp a stepper value after one press of − or +. */
export function stepValue(value: number, delta: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value + delta));
}
