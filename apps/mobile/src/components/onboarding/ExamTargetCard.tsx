import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { StepperButton } from './StepperButton';
import { TargetSlider } from './TargetSlider';

const MIN = 0;
const MAX = 100;
const STEP = 5;

type ExamTargetCardProps = {
  value: number;
  onChange: (value: number) => void;
};

/** "Hədəf nəticə": an optional target share of correct answers, by buttons or the slider. */
export function ExamTargetCard({ value, onChange }: ExamTargetCardProps) {
  const { t } = useTranslation();
  const valueText = t('onboarding.exam.target.valueText', { value });

  return (
    <View className="gap-3 rounded-xl border border-border bg-surf p-3.5">
      <View className="flex-row items-center gap-2">
        <Text variant="subheading" className="flex-1">
          {t('onboarding.exam.target.title')}
        </Text>
        <View className="rounded-full bg-raised px-2.5 py-1">
          <Text className="font-sans-black text-xs" tone="muted">
            {t('onboarding.exam.target.optional')}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-3">
        <StepperButton
          kind="decrease"
          accessibilityLabel={t('onboarding.exam.target.decrease')}
          disabled={value <= MIN}
          onPress={() => onChange(Math.max(MIN, value - STEP))}
        />
        <View className="flex-1 items-center" accessible accessibilityLabel={valueText}>
          <Text tone="honey" className="font-display-black text-3xl">
            {t('onboarding.exam.target.value', { value })}
          </Text>
          <Text className="font-sans-bold text-xs" tone="muted">
            {t('onboarding.exam.target.caption')}
          </Text>
        </View>
        <StepperButton
          kind="increase"
          accessibilityLabel={t('onboarding.exam.target.increase')}
          disabled={value >= MAX}
          onPress={() => onChange(Math.min(MAX, value + STEP))}
        />
      </View>
      <TargetSlider
        value={value}
        onChange={onChange}
        min={MIN}
        max={MAX}
        step={STEP}
        accessibilityLabel={t('onboarding.exam.target.title')}
        valueText={valueText}
      />
    </View>
  );
}
