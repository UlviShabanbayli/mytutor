import { phoneNumberSchema } from '@mytutor/schemas';

/** An Azerbaijani mobile number without the +994 country code has 9 digits ("50 123 45 67"). */
export const AZ_NATIONAL_DIGITS = 9;

/**
 * The national digits of whatever the student typed or pasted: "+994 50 123-45-67",
 * "050 123 45 67" and "501234567" all give "501234567". Never longer than 9 digits.
 */
export function nationalDigits(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('994') && digits.length > AZ_NATIONAL_DIGITS) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, AZ_NATIONAL_DIGITS);
}

/** "501234567" -> "50 123 45 67" (groups of 2-3-2-2 as people write them). */
export function formatNational(digits: string): string {
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
    .filter((part) => part.length > 0)
    .join(' ');
}

export type PhoneStatus =
  | { kind: 'empty' }
  | { kind: 'incomplete'; missing: number }
  | { kind: 'invalid' }
  | { kind: 'valid'; e164: string };

/** What the phone field shows under itself, and the E.164 number once it is valid. */
export function phoneStatus(digits: string): PhoneStatus {
  if (digits.length === 0) return { kind: 'empty' };
  if (digits.length < AZ_NATIONAL_DIGITS) {
    return { kind: 'incomplete', missing: AZ_NATIONAL_DIGITS - digits.length };
  }
  const parsed = phoneNumberSchema.safeParse(digits);
  return parsed.success ? { kind: 'valid', e164: parsed.data } : { kind: 'invalid' };
}

/** "+994501234567" -> "50 *** ** 67": enough to recognise the number, nothing more. */
export function maskPhone(e164: string): string {
  const national = e164.replace(/^\+994/, '');
  return `${national.slice(0, 2)} *** ** ${national.slice(7, 9)}`;
}
