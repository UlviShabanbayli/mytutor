/**
 * The shape another locale must have: the Azerbaijani keys with any string values. Extra keys
 * are allowed for plural forms Azerbaijani does not have (Russian `_few`, `_many`).
 */
export type Messages<T> = {
  [K in keyof T]: T[K] extends string ? string : Messages<T[K]>;
} & { [extra: string]: unknown };
