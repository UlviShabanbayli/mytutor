import { useQuery } from '@tanstack/react-query';
import type { ExamKind } from '@mytutor/types';
import { CHILD_CODE_LENGTH } from './childCode';
import { fetchExamCountdown, lookupChildCode } from './demo';

export const onboardingKeys = {
  countdown: (exam: ExamKind) => ['exam-countdown', exam] as const,
  childCode: (code: string) => ['child-code', code] as const,
};

/** Days left until the chosen exam (an estimate until the official date is announced). */
export function useExamCountdown(exam: ExamKind) {
  return useQuery({
    queryKey: onboardingKeys.countdown(exam),
    queryFn: () => fetchExamCountdown(exam),
  });
}

/** The child a full 6-character code belongs to; `null` data means no such code. */
export function useChildCode(code: string) {
  return useQuery({
    queryKey: onboardingKeys.childCode(code),
    queryFn: () => lookupChildCode(code),
    enabled: code.length === CHILD_CODE_LENGTH,
  });
}
