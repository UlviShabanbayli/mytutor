import { Pressable, View } from 'react-native';
import { SelectPop, Text } from '@/components/ui';
import { useLearnText } from '@/features/learn/useLearnText';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';

const GRADES = [5, 6, 7, 8, 9, 10, 11];

type GradePickerProps = {
  value: number;
  /** The profile's grade, marked "sənin sinfin" (a recommendation, never a lock). */
  ownGrade: number | null;
  onChange: (grade: number) => void;
};

/** Grades 5–11 as a radio row; every grade is open. The chosen one pops (buttons.grade B). */
export function GradePicker({ value, ownGrade, onChange }: GradePickerProps) {
  const { t, grade } = useLearnText();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t('learn.tab.grades')}
      className="flex-row gap-1.5"
    >
      {GRADES.map((n) => {
        const on = n === value;
        const own = n === ownGrade;
        return (
          <View key={n} className="min-w-0 flex-1 gap-1">
            <SelectPop selected={on}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={own ? `${grade(n)}, ${t('learn.tab.yourGrade')}` : grade(n)}
                onPress={() => {
                  if (!on) playCue('select');
                  onChange(n);
                }}
                className={cn('rounded-md', on && 'bg-honey-deep pb-[3px]')}
              >
                <View
                  className={cn(
                    'h-[44px] items-center justify-center rounded-md',
                    on ? 'bg-honey' : 'border border-border bg-surf',
                  )}
                >
                  <Text
                    className={cn(
                      'font-display-black text-base',
                      on ? 'text-on-honey' : 'text-ink',
                    )}
                  >
                    {n}
                  </Text>
                </View>
              </Pressable>
            </SelectPop>
            {/* The mark is wider than its column, so it spills over its neighbours. */}
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              className="h-[13px]"
            >
              {own ? (
                <Text
                  numberOfLines={1}
                  className="absolute -left-6 -right-6 text-center font-sans-black text-[10px] leading-[13px] text-honey-text"
                >
                  {t('learn.tab.yourGrade')}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
