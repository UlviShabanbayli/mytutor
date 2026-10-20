import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { TeacherGradeToggle } from './TeacherGradeToggle';

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
        {GRADES.map((grade) => (
          <View key={grade} className="min-w-0 flex-1">
            <TeacherGradeToggle
              grade={grade}
              selected={value.includes(grade)}
              onToggle={() => toggle(grade)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
