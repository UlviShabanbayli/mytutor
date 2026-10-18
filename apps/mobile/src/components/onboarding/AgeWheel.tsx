import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { ageWindow, MAX_AGE, MIN_AGE } from '@/features/auth/age';
import { cn } from '@/lib/cn';

type AgeWheelProps = {
  value: number;
  onChange: (age: number) => void;
};

/**
 * A wheel-like age picker: the chosen age big in the middle, its neighbours fading above and
 * below. Tap a neighbour to move to it; screen readers swipe up or down (adjustable).
 */
export function AgeWheel({ value, onChange }: AgeWheelProps) {
  const { t } = useTranslation();
  const short = (age: number) => (age === MAX_AGE ? t('onboarding.age.adult') : String(age));
  const spoken = (age: number) =>
    age === MAX_AGE ? t('onboarding.age.adultValue') : t('onboarding.age.value', { count: age });
  const selectedText =
    value === MAX_AGE ? t('onboarding.age.adult') : t('onboarding.age.value', { count: value });

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={t('onboarding.age.picker')}
      accessibilityValue={{ min: MIN_AGE, max: MAX_AGE, now: value, text: spoken(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        const next = value + (event.nativeEvent.actionName === 'increment' ? 1 : -1);
        if (next >= MIN_AGE && next <= MAX_AGE) onChange(next);
      }}
      className="gap-1 px-10 py-1"
    >
      {ageWindow(value).map((age, i) => {
        if (age === null) return <View key={`empty-${i}`} className="h-[52px]" />;
        const selected = age === value;
        const far = Math.abs(age - value) > 1;
        return (
          <Pressable
            key={age}
            onPress={() => onChange(age)}
            className={cn(
              'h-[52px] items-center justify-center rounded-lg border-2',
              selected ? 'border-honey bg-raised' : 'border-transparent',
              far ? 'opacity-45' : !selected && 'opacity-80',
            )}
          >
            <Text
              className={cn(
                'font-display-black',
                selected ? 'text-3xl text-ink' : far ? 'text-md text-muted' : 'text-lg text-muted',
              )}
            >
              {selected ? selectedText : short(age)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
