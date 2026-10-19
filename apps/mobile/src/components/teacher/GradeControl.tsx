import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { stepValue } from '@/features/teacher/classroom';
import { Stepper } from './Stepper';

type GradeControlProps = { value: number; suggested: number; onChange: (grade: number) => void };

/** "Qiymət": the grade out of 10, starting at the AI's suggestion. */
export function GradeControl({ value, suggested, onChange }: GradeControlProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-2.5">
      <View className="flex-1 gap-px">
        <Text className="font-sans-black">{t('teacher.grade.gradeTitle')}</Text>
        <Text className="font-sans-semibold text-xs text-muted">
          {t('teacher.grade.gradeAi', { grade: suggested })}
        </Text>
      </View>
      <Stepper
        tone="strong"
        value={String(value)}
        suffix={t('teacher.grade.outOf')}
        accessibilityLabel={t('teacher.grade.gradeLabel', { grade: value })}
        lessLabel={t('teacher.grade.less')}
        moreLabel={t('teacher.grade.more')}
        canLess={value > 0}
        canMore={value < 10}
        onLess={() => onChange(stepValue(value, -1, 0, 10))}
        onMore={() => onChange(stepValue(value, 1, 0, 10))}
      />
    </View>
  );
}
