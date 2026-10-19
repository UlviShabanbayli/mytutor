import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';
import { LESSON_STEPS } from '@/features/study/lessons';
import { cn } from '@/lib/cn';

type LessonHeaderProps = {
  /** 0-based step index. */
  step: number;
  onClose: () => void;
};

/** Close, four step segments and "Mətn · 2/4". */
export function LessonHeader({ step, onClose }: LessonHeaderProps) {
  const { t } = useTranslation();
  const total = LESSON_STEPS.length;
  const name = t(`study.lesson.steps.${LESSON_STEPS[step] ?? 'video'}`);

  return (
    <View className="flex-row items-center gap-1.5 px-2 pb-1.5">
      <IconButton icon="close" accessibilityLabel={t('study.lesson.close')} onPress={onClose} />
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={t('study.lesson.stepAria', { n: step + 1, total, name })}
        accessibilityValue={{ min: 1, max: total, now: step + 1 }}
        className="flex-1 flex-row gap-1"
      >
        {LESSON_STEPS.map((key, i) => (
          <View
            key={key}
            className={cn('h-2 flex-1 rounded-full', i <= step ? 'bg-honey' : 'bg-wax')}
          />
        ))}
      </View>
      <Text className="pr-2 text-right font-sans-black text-sm text-muted">
        {t('study.lesson.stepLabel', { name, n: step + 1, total })}
      </Text>
    </View>
  );
}
