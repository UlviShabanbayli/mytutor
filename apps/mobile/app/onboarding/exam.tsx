import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExamCountdownCard } from '@/components/onboarding/ExamCountdownCard';
import { ExamTargetCard } from '@/components/onboarding/ExamTargetCard';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { ToggleChip } from '@/components/onboarding/ToggleChip';
import { Button } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import {
  EXAM_OPTIONS,
  examGoal,
  examOptionKey,
  initialExamOption,
  sameExamOption,
} from '@/features/onboarding/examOptions';
import { useOnboardingStore } from '@/features/onboarding/store';
import type { ExamOption } from '@/features/onboarding/types';
import { useStepFlow } from '@/features/onboarding/useStepFlow';
import { useDemoWrite } from '@/lib/demoEvents';

const DEFAULT_TARGET = 75;

/** Step 4, exam branch: which DİM exam, days left (an estimate) and an optional target. */
export default function OnboardingExamScreen() {
  const { t } = useTranslation();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const goalChoice = useOnboardingStore((s) => s.goalChoice);
  const storedTarget = useOnboardingStore((s) => s.examTarget);
  const setExamTarget = useOnboardingStore((s) => s.setExamTarget);
  const [option, setOption] = useState<ExamOption>(() =>
    initialExamOption(profile.goal, goalChoice, profile.grade),
  );
  const [target, setTarget] = useState(storedTarget ?? DEFAULT_TARGET);
  const flow = useStepFlow();
  const write = useDemoWrite();

  const label = (o: ExamOption, short: boolean) =>
    o.group === null
      ? t(`onboarding.exam.option.${o.exam}`)
      : t(short ? 'onboarding.exam.option.admissionShort' : 'onboarding.exam.option.admission', {
          group: o.group,
        });

  const next = (withTarget: boolean) => {
    const goal = examGoal(option);
    updateProfile({ goal });
    // The exam area reads the goal from the world: the same event "Hədəf seç" writes.
    write({ type: 'exam.goalSet', goal });
    setExamTarget(withTarget ? target : null);
    flow.next('/onboarding/time');
  };

  return (
    <StepScreen
      step="exam"
      footer={
        <>
          <Button label={t('onboarding.continue')} onPress={() => next(true)} />
          <Button
            label={t('onboarding.exam.skipTarget')}
            variant="text"
            size="md"
            onPress={() => next(false)}
          />
        </>
      }
    >
      <StepTitle title={t('onboarding.exam.title')} subtitle={t('onboarding.exam.subtitle')} />
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('onboarding.exam.title')}
        className="flex-row flex-wrap gap-2"
      >
        {EXAM_OPTIONS.map((o) => (
          <ToggleChip
            key={examOptionKey(o)}
            role="radio"
            // After "Qəbul · I qrup" the other groups drop the repeated word.
            label={label(o, o.group !== null && o.group !== 'I')}
            accessibilityLabel={label(o, false)}
            selected={sameExamOption(o, option)}
            onPress={() => setOption(o)}
          />
        ))}
      </View>
      <ExamCountdownCard option={option} />
      <ExamTargetCard value={target} onChange={setTarget} />
    </StepScreen>
  );
}
