import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/features/app/appStore';
import { useOnboardingStore } from './store';
import type { SummaryRow } from './types';

const DEFAULT_MINUTES = 20;

/** The rows of the "Hazırdır!" summary: grade, goal, daily goal, each with its edit step. */
export function useReadySummary(): { minutes: number; rows: SummaryRow[] } {
  const { t } = useTranslation();
  const { grade, goal, dailyMinutes } = useAppStore((s) => s.profile);
  const goalChoice = useOnboardingStore((s) => s.goalChoice);
  const reminderTime = useOnboardingStore((s) => s.reminderTime);
  const minutes = dailyMinutes ?? DEFAULT_MINUTES;

  const goalValue = (() => {
    if (goal?.kind === 'exam') {
      if (goal.exam === 'admission') {
        return t('onboarding.exam.option.admission', { group: goal.group ?? 'I' });
      }
      return t(`onboarding.exam.option.${goal.exam}`);
    }
    if (goal?.kind === 'school') return t('onboarding.goal.school.title');
    return t(`onboarding.goal.${goalChoice === 'school' ? 'school' : 'unsure'}.title`);
  })();

  const edit = (pathname: '/onboarding/grade' | '/onboarding/goal' | '/onboarding/time') => () =>
    router.push({ pathname, params: { from: 'ready' } });

  const rows: SummaryRow[] = [
    {
      key: grade === null ? '–' : String(grade),
      label: t('onboarding.ready.grade.label'),
      value: grade === null ? '–' : t('common.grade', { count: grade, ordinal: true }),
      editLabel: t('onboarding.ready.grade.edit'),
      onEdit: edit('/onboarding/grade'),
    },
    {
      key: t('onboarding.ready.goal.key'),
      label: t('onboarding.ready.goal.label'),
      value: goalValue,
      editLabel: t('onboarding.ready.goal.edit'),
      onEdit: edit('/onboarding/goal'),
    },
    {
      key: String(minutes),
      label: t('onboarding.ready.time.label'),
      value: t('onboarding.ready.time.value', { minutes, time: reminderTime }),
      editLabel: t('onboarding.ready.time.edit'),
      onEdit: edit('/onboarding/time'),
    },
  ];

  return { minutes, rows };
}
