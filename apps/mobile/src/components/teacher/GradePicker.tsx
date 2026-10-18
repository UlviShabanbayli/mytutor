import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

const GRADES = [5, 6, 7, 8, 9, 10, 11];

type GradePickerProps = { value: number; onChange: (grade: number) => void };

/** "Sinif səviyyəsi": seven 44pt buttons, the chosen one honey. */
export function GradePicker({ value, onChange }: GradePickerProps) {
  const { t } = useTranslation();
  const label = t('teacher.classNew.grade');

  return (
    <View className="gap-1.5">
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} className="flex-row gap-1.5">
        {GRADES.map((g) => {
          const on = g === value;
          return (
            <Pressable
              key={g}
              accessibilityRole="radio"
              accessibilityLabel={t('common.grade', { count: g, ordinal: true })}
              accessibilityState={{ checked: on }}
              onPress={() => onChange(g)}
              className={cn('flex-1 rounded-md', on && 'bg-honey-deep pb-[3px]')}
            >
              <View
                className={cn(
                  'h-[44px] items-center justify-center rounded-md border-2',
                  on ? 'border-honey bg-honey' : 'border-border bg-surf',
                )}
              >
                <Text className={cn('font-sans-black', on ? 'text-on-honey' : 'text-ink')}>
                  {g}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
