import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChoiceCard } from '@/components/onboarding/ChoiceCard';
import { NoteLine } from '@/components/onboarding/NoteLine';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { Button, type IconName } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { goalChoiceOf } from '@/features/onboarding/examOptions';
import { useOnboardingStore } from '@/features/onboarding/store';
import type { GoalChoice } from '@/features/onboarding/types';
import { useStepFlow } from '@/features/onboarding/useStepFlow';
import { useDemoWrite } from '@/lib/demoEvents';

const GOALS: { goal: GoalChoice; icon: IconName }[] = [
  { goal: 'school', icon: 'book' },
  { goal: 'graduation', icon: 'exam' },
  { goal: 'admission', icon: 'target' },
  { goal: 'unsure', icon: 'search' },
];

/** Step 4: the school programme, an exam (continues to the exam screen) or "not sure yet". */
export default function OnboardingGoalScreen() {
  const { t } = useTranslation();
  const storedGoal = useAppStore((s) => s.profile.goal);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const storedChoice = useOnboardingStore((s) => s.goalChoice);
  const setGoalChoice = useOnboardingStore((s) => s.setGoalChoice);
  const [choice, setChoice] = useState<GoalChoice>(goalChoiceOf(storedGoal, storedChoice));
  const flow = useStepFlow();
  const write = useDemoWrite();

  const next = () => {
    setGoalChoice(choice);
    if (choice === 'graduation' || choice === 'admission') {
      flow.branch('/onboarding/exam');
      return;
    }
    // "Hələ bilmirəm" starts from the general plan: no goal in the profile yet.
    updateProfile({ goal: choice === 'school' ? { kind: 'school' } : null });
    // The school programme is a goal too: the exam area reads it from the world.
    if (choice === 'school') write({ type: 'exam.goalSet', goal: { kind: 'school' } });
    flow.next('/onboarding/time');
  };

  return (
    <StepScreen step="goal" footer={<Button label={t('onboarding.continue')} onPress={next} />}>
      <StepTitle title={t('onboarding.goal.title')} subtitle={t('onboarding.goal.subtitle')} />
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('onboarding.goal.title')}
        className="gap-2.5"
      >
        {GOALS.map(({ goal, icon }) => (
          <ChoiceCard
            key={goal}
            icon={icon}
            title={t(`onboarding.goal.${goal}.title`)}
            description={t(`onboarding.goal.${goal}.description`)}
            selected={choice === goal}
            onPress={() => setChoice(goal)}
          />
        ))}
      </View>
      <NoteLine icon="settings" text={t('onboarding.goal.note')} />
    </StepScreen>
  );
}
