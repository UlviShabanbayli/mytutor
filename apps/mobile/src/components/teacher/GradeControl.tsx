import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { stepValue } from '@/features/teacher/classroom';
import { Stepper } from './Stepper';

type GradeControlProps = {
  value: number;
  /** The AI's suggestion; null when the AI did not look at the work. */
  suggested: number | null;
  max: number;
  onChange: (grade: number) => void;
};

/** "Qiymət": the grade out of `max`, starting at the AI's suggestion. */
export function GradeControl({ value, suggested, max, onChange }: GradeControlProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-2.5">
      <View className="flex-1 gap-px">
        <Text className="font-sans-black">{t('teacher.grade.gradeTitle')}</Text>
        {suggested === null ? null : (
          <Text className="font-sans-semibold text-xs text-muted">
            {t('teacher.grade.gradeAi', { grade: suggested })}
          </Text>
        )}
      </View>
      <Stepper
        tone="strong"
        value={String(value)}
        suffix={t('teacher.grade.outOf', { max })}
        accessibilityLabel={t('teacher.grade.gradeLabel', { grade: value, max })}
        lessLabel={t('teacher.grade.less')}
        moreLabel={t('teacher.grade.more')}
        canLess={value > 0}
        canMore={value < max}
        onLess={() => onChange(stepValue(value, -1, 0, max))}
        onMore={() => onChange(stepValue(value, 1, 0, max))}
      />
    </View>
  );
}
