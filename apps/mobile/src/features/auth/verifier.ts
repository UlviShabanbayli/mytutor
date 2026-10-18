/**
 * Demo phone verification until the auth API exists (architecture Ş1). There is no network and
 * no SMS: every number "receives" the same fixed code, which the app shows only in a labelled
 * development hint. Better Auth (sessions, tokens in SecureStore) and the API's
 * `VerificationService` over Twilio Verify replace this module; the screens only see the
 * `VerificationService` shape below, so the swap does not touch them.
 */

/** The only code the demo accepts. Shown in development builds only (see `DevCodeHint`). */
export const DEMO_CODE = '246810';

/** Seconds before another code may be requested for the same number. */
export const RESEND_AFTER_SEC = 60;

/** Wrong codes allowed per sent code; then a new code is needed. */
export const MAX_ATTEMPTS = 3;

export type SendResult =
  { status: 'sent'; resendAfterSec: number } | { status: 'too_soon'; retryAfterSec: number };

export type CheckResult =
  | { status: 'approved'; isNewAccount: boolean }
  | { status: 'wrong'; attemptsLeft: number }
  | { status: 'locked' }
  | { status: 'no_code' };

/** What the app needs from verification, whoever sends the SMS. */
export type VerificationService = {
  sendCode: (phone: string) => Promise<SendResult>;
  checkCode: (phone: string, code: string) => Promise<CheckResult>;
};

type Pending = { sentAt: number; attemptsLeft: number };

/** The demo service; `now` is injectable so tests control time. */
export function createDemoVerifier(now: () => number = Date.now): VerificationService {
  const pending = new Map<string, Pending>();

  return {
    async sendCode(phone) {
      const previous = pending.get(phone);
      if (previous) {
        const waited = Math.floor((now() - previous.sentAt) / 1000);
        if (waited < RESEND_AFTER_SEC) {
          return { status: 'too_soon', retryAfterSec: RESEND_AFTER_SEC - waited };
        }
      }
      pending.set(phone, { sentAt: now(), attemptsLeft: MAX_ATTEMPTS });
      return { status: 'sent', resendAfterSec: RESEND_AFTER_SEC };
    },

    async checkCode(phone, code) {
      const current = pending.get(phone);
      if (!current) return { status: 'no_code' };
      if (current.attemptsLeft === 0) return { status: 'locked' };
      if (code === DEMO_CODE) {
        pending.delete(phone);
        // Without a server no account exists yet, so every number starts a new one.
        return { status: 'approved', isNewAccount: true };
      }
      const attemptsLeft = current.attemptsLeft - 1;
      pending.set(phone, { ...current, attemptsLeft });
      return attemptsLeft === 0 ? { status: 'locked' } : { status: 'wrong', attemptsLeft };
    },
  };
}

/** One instance for the app session: the student's own number and the parent's share it. */
export const verifier = createDemoVerifier();
