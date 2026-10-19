/** Class invite codes and parent-link codes are six letters or digits (design "R4T 9KB"). */
export const CODE_LENGTH = 6;

/** What the student typed, as a code: capitals and digits only, at most six. */
export function normalizeCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_LENGTH);
}

/** The six boxes of a code field; boxes not typed yet are empty strings. */
export function codeCells(code: string): string[] {
  return Array.from({ length: CODE_LENGTH }, (_, i) => code.charAt(i));
}

/** "K7Q42M" → "K7Q 42M", easier to read aloud and type. */
export function formatCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`.trim();
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
