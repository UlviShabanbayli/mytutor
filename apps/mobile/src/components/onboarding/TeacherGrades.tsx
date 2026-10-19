import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

const GRADES = [5, 6, 7, 8, 9, 10, 11];

type TeacherGradesProps = {
  value: number[];
  onChange: (grades: number[]) => void;
};

/** The grades a teacher teaches: seven toggles in one row. */
export function TeacherGrades({ value, onChange }: TeacherGradesProps) {
  const { t } = useTranslation();
  const toggle = (grade: number) =>
    onChange(
      value.includes(grade)
        ? value.filter((g) => g !== grade)
        : [...value, grade].sort((a, b) => a - b),
    );

  return (
    <View className="gap-2">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('onboarding.teacherStart.grades')}
      </Text>
      <View className="flex-row gap-1.5">
        {GRADES.map((grade) => {
          const selected = value.includes(grade);
          return (
            <Pressable
              key={grade}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={t('common.grade', { count: grade, ordinal: true })}
              onPress={() => toggle(grade)}
              className={cn(
                'min-w-0 flex-1 rounded-md pb-[3px]',
                selected ? 'bg-honey-deep' : 'bg-border',
              )}
            >
              {({ pressed }) => (
                <View
                  className={cn(
                    'h-12 items-center justify-center rounded-md border-2',
                    selected ? 'border-honey bg-honey' : 'border-border bg-surf',
                    pressed && 'translate-y-[3px]',
                  )}
                >
                  <Text
                    className={cn(
                      'font-display-black text-md',
                      selected ? 'text-on-honey' : 'text-ink',
                    )}
                  >
                    {String(grade)}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
