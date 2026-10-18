/** A nickname is 3–20 letters, digits or "_" (it is all the league shows, never a real name). */
export const NICKNAME_PATTERN = /^[\p{L}\p{N}_]{3,20}$/u;

export function isValidNickname(value: string): boolean {
  return NICKNAME_PATTERN.test(value.trim());
}
