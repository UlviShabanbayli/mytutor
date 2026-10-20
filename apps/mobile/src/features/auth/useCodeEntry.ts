import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from './authStore';
import { useSecondsLeft } from './countdown';
import { demoAccountFor } from './demoAccounts';
import { useCheckCode, useSendCode } from './queries';
import type { CodeTarget } from './types';
import { useDemoSignIn } from './useDemoSignIn';
import { useLeaveAuth } from './useLeaveAuth';
import type { CheckResult } from './verifier';

export const CODE_LENGTH = 6;

/** Why the typed code did not open the account. */
export type CodeFailure = Exclude<CheckResult, { status: 'approved' }>;

/**
 * Typing, checking and resending an SMS code. Six digits are checked at once; an approved code
 * moves on (the age step for a new account; a demo account signs in to its role and world; for
 * the parent's code, the account opens with consent), anything else becomes `failure` until the
 * student types again or resends.
 */
export function useCodeEntry(target: CodeTarget) {
  const phone = useAuthStore((s) => s.phone[target]);
  const resendAt = useAuthStore((s) => s.resendAt[target]);
  const createAccount = useAuthStore((s) => s.createAccount);
  const secondsLeft = useSecondsLeft(resendAt);
  const send = useSendCode(target);
  const check = useCheckCode();
  const leave = useLeaveAuth();
  const signIn = useDemoSignIn();
  const [code, setCode] = useState('');
  const [failure, setFailure] = useState<CodeFailure | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const approved = (isNewAccount: boolean) => {
    const account = target === 'self' && phone !== null ? demoAccountFor(phone) : null;
    if (target === 'parent') {
      createAccount('under_13', 'approved');
      leave();
    } else if (isNewAccount) {
      router.push('/auth/age');
    } else if (account) {
      setSigningIn(true);
      void signIn(account).finally(() => setSigningIn(false));
    } else {
      leave();
    }
  };

  const onChange = (next: string) => {
    setCode(next);
    if (failure?.status === 'wrong') setFailure(null);
    if (next.length < CODE_LENGTH || phone === null) return;
    check.mutate(
      { phone, code: next },
      {
        onSuccess: (result) =>
          result.status === 'approved' ? approved(result.isNewAccount) : setFailure(result),
      },
    );
  };

  const resend = () => {
    if (phone === null) return;
    send.mutate(phone, {
      onSuccess: () => {
        setFailure(null);
        setCode('');
      },
    });
  };

  return {
    phone,
    code,
    onChange,
    failure,
    /** A locked or expired code takes no more input until a new one is sent. */
    blocked: failure?.status === 'locked' || failure?.status === 'no_code',
    checking: check.isPending || signingIn,
    checkFailed: check.isError,
    sendFailed: send.isError,
    resending: send.isPending,
    secondsLeft,
    resend,
  };
}
