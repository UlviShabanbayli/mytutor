import { z } from 'zod';

/** Azerbaijani mobile operator prefixes (Azercell, Bakcell, Nar, Naxtel). */
const AZ_MOBILE_PREFIXES = ['10', '50', '51', '55', '60', '70', '77', '99'] as const;

const E164_AZ_MOBILE = new RegExp(`^\\+994(${AZ_MOBILE_PREFIXES.join('|')})\\d{7}$`);

/**
 * Normalizes common local input formats to E.164:
 * "050 123 45 67", "0501234567", "994501234567", "+994 50 123-45-67" -> "+994501234567".
 */
export function normalizeAzPhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('994')) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+994${digits.slice(1)}`;
  if (digits.length === 9) return `+994${digits}`;
  return `+${digits}`;
}

/** Azerbaijani mobile number; accepts local formats and outputs E.164. */
export const phoneNumberSchema = z
  .string()
  .trim()
  .min(1)
  .transform(normalizeAzPhoneNumber)
  .pipe(z.string().regex(E164_AZ_MOBILE));

/** One-time verification code sent by SMS. */
export const otpCodeSchema = z.string().regex(/^\d{6}$/);
