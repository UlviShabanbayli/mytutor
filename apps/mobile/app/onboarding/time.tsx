import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DAILY_MINUTES } from '@mytutor/schemas';
import { ChoiceCard } from '@/components/onboarding/ChoiceCard';
import { ReminderRow } from '@/components/onboarding/ReminderRow';
import { ReminderTimeSheet } from '@/components/onboarding/ReminderTimeSheet';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { MinutesTile } from '@/components/onboarding/MinutesTile';
import { Button } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { useOnboardingStore } from '@/features/onboarding/store';
import { useStepFlow } from '@/features/onboarding/useStepFlow';

type Minutes = (typeof DAILY_MINUTES)[number];
const RECOMMENDED: Minutes = 20;

/** Step 5: the daily goal (10, 20 or 30 minutes) and when to remind. */
export default function OnboardingTimeScreen() {
  const { t } = useTranslation();
  const stored = useAppStore((s) => s.profile.dailyMinutes);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const reminderTime = useOnboardingStore((s) => s.reminderTime);
  const setReminderTime = useOnboardingStore((s) => s.setReminderTime);
  const [minutes, setMinutes] = useState<Minutes>(stored ?? RECOMMENDED);
  const [picking, setPicking] = useState(false);
  const flow = useStepFlow();

  const next = () => {
    updateProfile({ dailyMinutes: minutes });
    flow.next('/onboarding/ready');
  };

  return (
    <StepScreen step="time" footer={<Button label={t('onboarding.continue')} onPress={next} />}>
      <StepTitle title={t('onboarding.time.title')} subtitle={t('onboarding.time.subtitle')} />
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('onboarding.time.title')}
        className="gap-2.5"
      >
        {DAILY_MINUTES.map((value) => {
          const title = t(`onboarding.time.options.${value}.title`);
          const description = t(`onboarding.time.options.${value}.description`);
          return (
            <ChoiceCard
              key={value}
              title={title}
              description={description}
              accessibilityLabel={`${t('onboarding.time.optionLabel', { count: value })}, ${title}. ${description}`}
              badge={value === RECOMMENDED ? t('onboarding.time.recommended') : undefined}
              selected={minutes === value}
              onPress={() => setMinutes(value)}
              tile={(selected) => <MinutesTile minutes={value} selected={selected} />}
            />
          );
        })}
      </View>
      <ReminderRow time={reminderTime} onChange={() => setPicking(true)} />
      <ReminderTimeSheet
        visible={picking}
        value={reminderTime}
        onChange={setReminderTime}
        onClose={() => setPicking(false)}
      />
    </StepScreen>
  );
}
