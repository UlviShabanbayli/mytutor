/** A child's link code: 6 letters or digits, shown in the child's app (architecture V1). */
export const CHILD_CODE_LENGTH = 6;

/** Upper-cases and keeps only letters and digits, so "k7q-42m" becomes "K7Q42M". */
export function normalizeChildCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CHILD_CODE_LENGTH);
}
