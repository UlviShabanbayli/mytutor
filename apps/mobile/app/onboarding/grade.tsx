import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GradePicker } from '@/components/onboarding/GradePicker';
import { InfoNote } from '@/components/onboarding/InfoNote';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { Button } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { useStepFlow } from '@/features/onboarding/useStepFlow';

/** Step 3: the school grade, only to recommend; every grade and subject stays open. */
export default function OnboardingGradeScreen() {
  const { t } = useTranslation();
  const storedGrade = useAppStore((s) => s.profile.grade);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [grade, setGrade] = useState<number | null>(storedGrade);
  const flow = useStepFlow();

  const next = () => {
    updateProfile({ grade });
    flow.next('/onboarding/goal');
  };

  return (
    <StepScreen
      step="grade"
      footer={<Button label={t('onboarding.continue')} disabled={grade === null} onPress={next} />}
    >
      <StepTitle title={t('onboarding.grade.title')} subtitle={t('onboarding.grade.subtitle')} />
      <GradePicker
        value={grade}
        onChange={setGrade}
        accessibilityLabel={t('onboarding.grade.title')}
      />
      <InfoNote text={t('onboarding.grade.note')} />
    </StepScreen>
  );
}
