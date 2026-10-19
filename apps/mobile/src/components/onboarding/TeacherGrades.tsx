import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SelectPop, Text } from '@/components/ui';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';

const GRADES = [5, 6, 7, 8, 9, 10, 11];

type TeacherGradesProps = {
  value: number[];
  onChange: (grades: number[]) => void;
};

/** The grades a teacher teaches: seven toggles in one row; one turned on pops (buttons.grade B). */
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
            <View key={grade} className="min-w-0 flex-1">
              <SelectPop selected={selected}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={t('common.grade', { count: grade, ordinal: true })}
                  onPress={() => {
                    playCue('select');
                    toggle(grade);
                  }}
                  className={cn('rounded-md pb-[3px]', selected ? 'bg-honey-deep' : 'bg-border')}
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
              </SelectPop>
            </View>
          );
        })}
      </View>
    </View>
  );
}
