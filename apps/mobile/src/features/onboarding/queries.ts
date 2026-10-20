import { useQuery } from '@tanstack/react-query';
import { examStateSchema } from '@mytutor/schemas';
import { useDemoPersona } from '@/lib/demoPersona';
import { apiGet } from '@/lib/api';
import { lookupCode } from '@/features/parent/api';
import { CHILD_CODE_LENGTH } from './childCode';
import type { ChildCodeLookup, ExamOption } from './types';

export const onboardingKeys = {
  countdown: (option: ExamOption) => ['exam-countdown', option.exam, option.group] as const,
  childCode: (code: string) => ['child-code', code] as const,
};

const daysLeftSchema = examStateSchema.pick({ daysLeft: true });

/** The exam's query string for `/v1/exam` ("goal=admission&group=III"). */
const goalQuery = (option: ExamOption) =>
  option.group === null ? `goal=${option.exam}` : `goal=${option.exam}&group=${option.group}`;

/**
 * Days left until the chosen exam, from the demo world's exam area (an estimate until the
 * official DİM date is announced).
 */
export function useExamCountdown(option: ExamOption) {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: [...onboardingKeys.countdown(option), persona],
    queryFn: async () => {
      const { daysLeft } = await apiGet(`/v1/exam?${goalQuery(option)}`, {
        persona,
        parse: daysLeftSchema.parse,
      });
      return { daysLeft: daysLeft ?? 0, estimated: true };
    },
  });
}

/** The child a full 6-character code belongs to; `null` data means no such code. */
export function useChildCode(code: string) {
  const persona = useDemoPersona();
  return useQuery({
    queryKey: [...onboardingKeys.childCode(code), persona],
    queryFn: async (): Promise<ChildCodeLookup | null> => {
      const found = await lookupCode(persona, code);
      return (
        found && {
          childId: found.childId,
          name: found.childName,
          grade: found.grade,
          expired: found.expired,
          alreadyLinked: found.alreadyLinked,
        }
      );
    },
    enabled: code.length === CHILD_CODE_LENGTH,
  });
}
