import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';
import { stepPosition } from '@/features/onboarding/steps';
import type { StepKey } from '@/features/onboarding/types';
import { cn } from '@/lib/cn';

type StepHeaderProps = {
  step: StepKey;
  /** The first screen of a flow has nothing to go back to. */
  back?: boolean;
};

/** Back button, the step dashes of the current track (the current one longer) and "2/5". */
export function StepHeader({ step, back = true }: StepHeaderProps) {
  const { t } = useTranslation();
  const position = stepPosition(step);
  const track = t(`onboarding.progress.tracks.${position.track}`);
  const dashes = Array.from({ length: position.total }, (_, i) => i);

  return (
    <View className="flex-row items-center gap-2 px-2 pb-1 pt-1">
      {back ? (
        <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={router.back} />
      ) : (
        <View className="min-w-touch" />
      )}
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={t('onboarding.progress.label', { ...position, track })}
        accessibilityValue={{ min: 1, max: position.total, now: position.step }}
        className="flex-1 flex-row justify-center gap-1.5"
      >
        {dashes.map((i) => (
          <View
            key={i}
            className={cn(
              'h-2 rounded-full',
              i === position.step - 1 ? 'w-8' : 'w-[18px]',
              i < position.step ? 'bg-honey' : 'bg-wax',
            )}
          />
        ))}
      </View>
      <Text className="min-w-touch text-center font-sans-black text-xs" tone="muted">
        {t('onboarding.progress.short', position)}
      </Text>
    </View>
  );
}
