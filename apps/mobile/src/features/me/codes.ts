/**
 * A class invite code is nine letters or digits in groups of two, four and three, as teachers
 * share it ("7B-MATH-4K2"); a parent-link code is six ("K7Q 42M").
 */
export const CLASS_CODE_GROUPS = [2, 4, 3] as const;
export const CLASS_CODE_LENGTH = 9;

/** What the student typed, as a class code: capitals and digits only, at most nine. */
export function normalizeClassCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CLASS_CODE_LENGTH);
}

/** The code boxes by group; boxes not typed yet are empty strings. */
export function classCodeCells(code: string): string[][] {
  let start = 0;
  return CLASS_CODE_GROUPS.map((size) => {
    const cells = Array.from({ length: size }, (_, i) => code.charAt(start + i));
    start += size;
    return cells;
  });
}

/** "7BMATH4K2" → "7B-MATH-4K2", the form the teacher shares and the server looks up. */
export function formatClassCode(code: string): string {
  return classCodeCells(code)
    .map((cells) => cells.join(''))
    .filter(Boolean)
    .join('-');
}

/** "K7Q42M" → "K7Q 42M", easier to read aloud and type. */
export function formatCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`.trim();
}

/** A parent-link code is valid for ten minutes (design "10 dəqiqə etibarlıdır"). */
export const PARENT_CODE_TTL_MS = 10 * 60 * 1000;

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * A code made on the phone when the world has none for the student (the first-day student):
 * letters that look alike (O/0, I/1) are left out.
 */
export function makeParentCode(random: () => number = Math.random): string {
  return Array.from(
    { length: 6 },
    () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)] ?? 'A',
  ).join('');
}

/** Seconds left until `expiresAt` (ms), never below zero. */
export function secondsLeft(expiresAt: number, now: number): number {
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

/** 581 → "9:41". */
export function formatMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
