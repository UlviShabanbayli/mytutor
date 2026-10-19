import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from './authStore';
import type { CodeTarget } from './types';
import { verifier } from './verifier';

/** Sends a code to the target's number and remembers when the next one may be requested. */
export function useSendCode(target: CodeTarget) {
  const setResendAt = useAuthStore((s) => s.setResendAt);

  return useMutation({
    mutationFn: (phone: string) => verifier.sendCode(phone),
    onSuccess: (result) => {
      const wait = result.status === 'sent' ? result.resendAfterSec : result.retryAfterSec;
      setResendAt(target, Date.now() + wait * 1000);
    },
  });
}

/** Checks a typed code against the number it was sent to. */
export function useCheckCode() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      verifier.checkCode(phone, code),
  });
}
