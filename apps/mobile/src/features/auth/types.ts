/**
 * View types of the account flow for the demo. The real shapes (User, StudentProfile, Consent)
 * come with the auth API (architecture Ş1) into packages/schemas.
 */

/** Why the account flow was opened; decides the sheet's words and where the flow returns. */
export const AUTH_REASONS = [
  'join_class',
  'parent_link',
  'ask',
  'chat',
  'subscribe',
  'save_progress',
  'sign_in',
  'teacher',
  'parent',
] as const;
export type AuthReason = (typeof AUTH_REASONS)[number];

/** The reasons the "account needed" moment explains; the rest go straight to the phone. */
export const ASK_REASONS = [
  'join_class',
  'parent_link',
  'ask',
  'chat',
  'subscribe',
  'save_progress',
] as const satisfies readonly AuthReason[];
export type AskReason = (typeof ASK_REASONS)[number];

/** Only the age group is kept, never the age itself (architecture: "Məlumatın minimumu"). */
export type AgeGroup = 'under_13' | 'teen' | 'adult';

/** Whose phone a code was sent to: the student's own, or the parent's for consent. */
export type CodeTarget = 'self' | 'parent';

/** What the device remembers about the account once it is made. */
export type DeviceAccount = {
  ageGroup: AgeGroup;
  /** Under 13 the account opens only with a parent's approval. */
  consent: 'not_needed' | 'approved';
  createdAt: string;
};

export function isAuthReason(value: unknown): value is AuthReason {
  return typeof value === 'string' && (AUTH_REASONS as readonly string[]).includes(value);
}

export function isAskReason(value: unknown): value is AskReason {
  return typeof value === 'string' && (ASK_REASONS as readonly string[]).includes(value);
}
