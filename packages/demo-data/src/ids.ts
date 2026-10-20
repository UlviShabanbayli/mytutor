/**
 * The one id scheme. Subject "riyaziyyat-7", unit "riyaziyyat-7-u4", topic "riyaziyyat-7-4-3";
 * a lesson's id is its topic's id; tests are "test-<topicId>" and "test-<unitId>".
 */

export const R7 = 'riyaziyyat-7';
export const R8 = 'riyaziyyat-8';

export const unitIdOf = (subjectId: string, unit: string) => `${subjectId}-u${unit}`;
export const topicIdOf = (subjectId: string, number: string) =>
  `${subjectId}-${number.replace('.', '-')}`;
export const testIdOf = (topicOrUnitId: string) => `test-${topicOrUnitId}`;

/** A Riyaziyyat 7 topic id by its number: `r7('4.3')` → "riyaziyyat-7-4-3". */
export const r7 = (number: string) => topicIdOf(R7, number);
/** A Riyaziyyat 7 unit id by its number: `r7Unit('4')` → "riyaziyyat-7-u4". */
export const r7Unit = (unit: string) => unitIdOf(R7, unit);

/** The textbooks: TRİMS 7 in two parts, Radius 7 and Radius 8 in one. */
export const TRIMS_7 = 'trims-7';
export const RADIUS_7 = 'radius-7';
export const RADIUS_8 = 'radius-8';

/** The class, people and things every role shares. */
export const CLASS_7B = '7b';
export const CLASS_7A = '7a';
export const NERMIN = 'nermin';
export const FRESH = 'yeni-sagird';
export const LALE = 'lale';
export const SEBINE = 'sebine';
export const ELVIN = 'elvin';
export const ELCIN = 'elcin';
export const RESAD = 'resad';
