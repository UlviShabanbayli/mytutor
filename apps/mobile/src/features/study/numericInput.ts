// The number keypad of open questions. The value is kept as typed for checking ("-3,5", ASCII
// minus, decimal comma); the screen shows it with a real minus sign.

export type NumericKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '-' | ',';

export const NUMERIC_KEYS: NumericKey[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '-',
  '0',
  ',',
];

const MAX_LENGTH = 12;

/** The value after one key: digits append, "-" toggles the sign, "," adds one decimal comma. */
export function applyNumericKey(value: string, key: NumericKey): string {
  if (key === '-') return value.startsWith('-') ? value.slice(1) : `-${value}`;
  if (value.length >= MAX_LENGTH) return value;
  if (key === ',') {
    if (value.includes(',')) return value;
    return /\d$/.test(value) ? `${value},` : `${value}0,`;
  }
  return value + key;
}

export const deleteLastDigit = (value: string) => value.slice(0, -1);

/** What a hardware keyboard typed, reduced to the same form the keypad produces. */
export function sanitizeNumeric(text: string): string {
  const negative = /^\s*[-−]/.test(text);
  const [whole = '', ...rest] = text
    .replace(/\./g, ',')
    .replace(/[^\d,]/g, '')
    .split(',');
  const number = rest.length > 0 ? `${whole},${rest.join('')}` : whole;
  return (negative ? '-' : '') + number.slice(0, MAX_LENGTH);
}

export const displayNumber = (value: string) => value.replace('-', '−');
